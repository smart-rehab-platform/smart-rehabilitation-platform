import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/routes/app_routes.dart';
import '../../../../l10n/app_localizations.dart';
import '../../data/communication_repository.dart';
import '../../models/communication_models.dart';
import '../../providers/communication_list_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/parent_page_scaffold.dart';
import '../../widgets/specialist_page_scaffold.dart';
import '../../../auth/providers/auth_provider.dart';
import 'communication_conversation_tile.dart';

class ConversationsListScreen extends ConsumerStatefulWidget {
  const ConversationsListScreen({super.key, required this.isParent});

  final bool isParent;

  @override
  ConsumerState<ConversationsListScreen> createState() =>
      _ConversationsListScreenState();
}

class _ConversationsListScreenState
    extends ConsumerState<ConversationsListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(communicationListProvider.notifier).initialize();
    });
  }

  void _openChat(CommunicationConversation conversation) {
    final route = widget.isParent
        ? AppRoutes.parentChat(conversation.id)
        : AppRoutes.specialistChat(conversation.id);
    context.push(route, extra: conversation);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final state = ref.watch(communicationListProvider);
    final role = ref.watch(authProvider).user?.role;
    final theme = Theme.of(context);

    final body = _buildBody(context, state, role, theme, l10n);

    if (widget.isParent) {
      return ParentPageScaffold(
        title: l10n.navMessages,
        showBackButton: true,
        body: body,
      );
    }

    return SpecialistPageScaffold(
      title: l10n.navMessages,
      showBackButton: true,
      body: body,
    );
  }

  Widget _buildBody(
    BuildContext context,
    CommunicationListState state,
    String? role,
    ThemeData theme,
    AppLocalizations l10n,
  ) {
    if (state.isLoading && !state.hasLoaded) {
      return Center(
        child: DashboardLoadingCard(
          message: l10n.communicationLoadingConversations,
        ),
      );
    }

    if (state.errorMessage != null && state.conversations.isEmpty) {
      return Center(
        child: DashboardErrorCard(
          message: _mapCommunicationListError(l10n, state.errorMessage!),
          onRetry: () => ref.read(communicationListProvider.notifier).refresh(),
        ),
      );
    }

    if (state.isEmpty) {
      return RefreshIndicator(
        onRefresh: () => ref.read(communicationListProvider.notifier).refresh(),
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: context.dashPadding,
          children: [
            DashboardEmptyCard(message: l10n.communicationNoConversations),
          ],
        ),
      );
    }

    final verticalPadding = context.dashPadding.vertical;

    return RefreshIndicator(
      onRefresh: () => ref.read(communicationListProvider.notifier).refresh(),
      child: ListView.builder(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: EdgeInsets.symmetric(vertical: verticalPadding),
        itemCount: state.conversations.length,
        itemBuilder: (context, index) {
          final conversation = state.conversations[index];
          return CommunicationConversationTile(
            conversation: conversation,
            role: role,
            onTap: () => _openChat(conversation),
          );
        },
      ),
    );
  }
}

String _mapCommunicationListError(AppLocalizations l10n, String message) {
  if (message == 'You must be signed in to view messages.') {
    return l10n.messageSignInRequired;
  }
  return message;
}

Future<void> openOrCreateConversation({
  required WidgetRef ref,
  required BuildContext context,
  required String patientId,
  required String parentId,
  required String specialistId,
  required bool isParent,
  String? initialDraftMessage,
}) async {
  final l10n = AppLocalizations.of(context)!;
  final messenger = ScaffoldMessenger.of(context);
  messenger.hideCurrentSnackBar();
  messenger.showSnackBar(
    SnackBar(content: Text(l10n.communicationOpeningConversation)),
  );

  final token = ref.read(authProvider).token;
  if (token != null && token.isNotEmpty) {
    ref.read(authRepositoryProvider).setAuthToken(token);
  }

  try {
    final conversation = await ref
        .read(communicationRepositoryProvider)
        .createConversation(
          patientId: patientId,
          parentId: parentId,
          specialistId: specialistId,
        );

    if (!context.mounted) {
      return;
    }

    messenger.hideCurrentSnackBar();
    final route = isParent
        ? AppRoutes.parentChat(conversation.id)
        : AppRoutes.specialistChat(conversation.id);
    final draft = initialDraftMessage?.trim();
    final extra = draft != null && draft.isNotEmpty
        ? CommunicationChatRouteArgs(
            conversation: conversation,
            initialDraftMessage: draft,
          )
        : conversation;
    context.push(route, extra: extra);
  } on CommunicationApiException catch (error) {
    if (!context.mounted) {
      return;
    }
    messenger.hideCurrentSnackBar();
    messenger.showSnackBar(
      SnackBar(
        content: Text(error.message),
        duration: const Duration(seconds: 6),
      ),
    );
  } catch (error) {
    if (!context.mounted) {
      return;
    }
    messenger.hideCurrentSnackBar();
    messenger.showSnackBar(
      SnackBar(
        content: Text(error.toString()),
        duration: const Duration(seconds: 6),
      ),
    );
  }
}
