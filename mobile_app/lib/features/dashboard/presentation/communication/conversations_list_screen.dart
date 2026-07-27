import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../data/communication_repository.dart';
import '../../models/communication_models.dart';
import '../../providers/communication_list_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/parent_page_scaffold.dart';
import '../../widgets/specialist_page_scaffold.dart';
import '../../../auth/providers/auth_provider.dart';

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
    final state = ref.watch(communicationListProvider);
    final role = ref.watch(authProvider).user?.role;
    final theme = Theme.of(context);

    final body = _buildBody(context, state, role, theme);

    if (widget.isParent) {
      return ParentPageScaffold(
        title: 'Messages',
        showBackButton: true,
        body: body,
      );
    }

    return SpecialistPageScaffold(
      title: 'Messages',
      showBackButton: true,
      body: body,
    );
  }

  Widget _buildBody(
    BuildContext context,
    CommunicationListState state,
    String? role,
    ThemeData theme,
  ) {
    if (state.isLoading && !state.hasLoaded) {
      return const Center(
        child: DashboardLoadingCard(message: 'Loading conversations...'),
      );
    }

    if (state.errorMessage != null && state.conversations.isEmpty) {
      return Center(
        child: DashboardErrorCard(
          message: state.errorMessage!,
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
          children: const [
            DashboardEmptyCard(
              message:
                  'No conversations yet. Start a message from a patient profile.',
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => ref.read(communicationListProvider.notifier).refresh(),
      child: ListView.separated(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: context.dashPadding,
        itemCount: state.conversations.length,
        separatorBuilder: (_, __) =>
            SizedBox(height: context.dashSpacing * 0.6),
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

class CommunicationConversationTile extends StatelessWidget {
  const CommunicationConversationTile({
    super.key,
    required this.conversation,
    required this.role,
    required this.onTap,
  });

  final CommunicationConversation conversation;
  final String? role;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final participantName = conversation.otherParticipantName(role);
    final subtitle = conversation.conversationSubtitle();

    return DashboardSurfaceCard(
      onTap: onTap,
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: role?.toLowerCase() == 'parent'
                ? DashboardColors.brandSoft
                : DashboardColors.tealSoft,
            child: Icon(
              role?.toLowerCase() == 'parent'
                  ? Icons.medical_services_outlined
                  : Icons.family_restroom_outlined,
              color: DashboardColors.brandCyan,
              size: context.dashSpacing * 0.55,
            ),
          ),
          SizedBox(width: context.dashSpacing * 0.65),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  participantName,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: DashboardColors.textPrimary,
                  ),
                ),
                if (subtitle != null) ...[
                  SizedBox(height: context.dashSpacing * 0.2),
                  Text(
                    subtitle,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: DashboardColors.textSecondary,
                    ),
                  ),
                ],
                if (conversation.createdAt != null) ...[
                  SizedBox(height: context.dashSpacing * 0.15),
                  Text(
                    'Started ${DateFormat('MMM d, yyyy').format(conversation.createdAt!)}',
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: DashboardColors.textMuted,
                    ),
                  ),
                ],
              ],
            ),
          ),
          Icon(Icons.chevron_right_rounded, color: DashboardColors.textMuted),
        ],
      ),
    );
  }
}

Future<void> openOrCreateConversation({
  required WidgetRef ref,
  required BuildContext context,
  required String patientId,
  required String parentId,
  required String specialistId,
  required bool isParent,
}) async {
  final messenger = ScaffoldMessenger.of(context);
  messenger.hideCurrentSnackBar();
  messenger.showSnackBar(
    const SnackBar(content: Text('Opening conversation...')),
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
    context.push(route, extra: conversation);
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
