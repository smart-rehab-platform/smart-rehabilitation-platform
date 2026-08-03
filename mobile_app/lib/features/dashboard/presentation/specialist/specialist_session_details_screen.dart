import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../auth/providers/auth_provider.dart';
import '../../models/specialist_feature_models.dart';
import '../../providers/specialist_dashboard_provider.dart';
import '../../providers/specialist_features_provider.dart';
import '../../providers/specialist_sessions_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_page_scaffold.dart';
import 'specialist_sessions_localization_utils.dart';
import 'specialist_sessions_widgets.dart';

class SpecialistSessionDetailsScreen extends ConsumerStatefulWidget {
  const SpecialistSessionDetailsScreen({super.key, required this.sessionId});

  final String sessionId;

  @override
  ConsumerState<SpecialistSessionDetailsScreen> createState() =>
      _SpecialistSessionDetailsScreenState();
}

class _SpecialistSessionDetailsScreenState
    extends ConsumerState<SpecialistSessionDetailsScreen> {
  bool _isLoading = true;
  bool _isActing = false;
  String? _errorMessage;
  SpecialistSessionDetail? _session;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final token = ref.read(authProvider).token;
      if (token != null && token.isNotEmpty) {
        ref.read(authRepositoryProvider).setAuthToken(token);
      }
      final session = await ref
          .read(specialistFeaturesRepositoryProvider)
          .fetchSessionById(widget.sessionId);
      if (!mounted) return;
      setState(() {
        _session = session;
        _isLoading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _errorMessage = error.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  Future<void> _refreshRelatedProviders() async {
    await Future.wait([
      ref.read(specialistSessionsProvider.notifier).refresh(),
      ref.read(specialistDashboardProvider.notifier).refresh(),
    ]);
  }

  Future<void> _openPatientProfile() async {
    final patientId = _session?.patientId.trim() ?? '';
    if (patientId.isEmpty) {
      final l10n = AppLocalizations.of(context)!;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(l10n.specialistSessionPatientProfileUnavailable),
        ),
      );
      return;
    }
    await context.push(AppRoutes.specialistPatientDetails(patientId));
  }

  Future<void> _editSession() async {
    final result = await context.push<bool>(
      AppRoutes.specialistEditSession(widget.sessionId),
    );
    if (result == true && mounted) {
      await _load();
      await _refreshRelatedProviders();
    }
  }

  Future<bool> _confirmAction({
    required String title,
    required String message,
    required String confirmLabel,
    required String dismissLabel,
    bool isDestructive = false,
  }) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: Text(title),
          content: Text(message),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(false),
              child: Text(dismissLabel),
            ),
            FilledButton(
              style: isDestructive
                  ? FilledButton.styleFrom(
                      backgroundColor: DashboardColors.highPriority,
                    )
                  : null,
              onPressed: () => Navigator.of(dialogContext).pop(true),
              child: Text(confirmLabel),
            ),
          ],
        );
      },
    );
    return confirmed == true;
  }

  Future<void> _runStatusAction({
    required String title,
    required String message,
    required String confirmLabel,
    required String dismissLabel,
    required Future<SpecialistSessionDetail> Function() action,
    required String successMessage,
    bool isDestructive = false,
  }) async {
    if (_isActing || _session == null || !_session!.canModify) {
      return;
    }

    final confirmed = await _confirmAction(
      title: title,
      message: message,
      confirmLabel: confirmLabel,
      dismissLabel: dismissLabel,
      isDestructive: isDestructive,
    );
    if (!confirmed || !mounted) {
      return;
    }

    setState(() => _isActing = true);
    final messenger = ScaffoldMessenger.of(context);

    try {
      await action();
      if (!mounted) return;
      final refreshed = await ref
          .read(specialistFeaturesRepositoryProvider)
          .fetchSessionById(widget.sessionId);
      if (!mounted) return;
      setState(() {
        _session = refreshed;
        _isActing = false;
      });
      await _refreshRelatedProviders();
      if (!mounted) return;
      messenger.showSnackBar(SnackBar(content: Text(successMessage)));
    } catch (error) {
      if (!mounted) return;
      setState(() => _isActing = false);
      final l10n = AppLocalizations.of(context)!;
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            mapSpecialistSessionActionError(
              l10n,
              error.toString().replaceFirst('Exception: ', ''),
            ),
          ),
        ),
      );
    }
  }

  Future<void> _markCompleted() {
    final l10n = AppLocalizations.of(context)!;
    return _runStatusAction(
      title: l10n.specialistSessionMarkCompletedTitle,
      message: l10n.specialistSessionMarkCompletedMessage,
      confirmLabel: l10n.specialistSessionMarkCompletedConfirm,
      dismissLabel: l10n.specialistSessionKeepSession,
      successMessage: l10n.specialistSessionMarkedCompleted,
      action: () => ref
          .read(specialistFeaturesRepositoryProvider)
          .completeSession(widget.sessionId),
    );
  }

  Future<void> _markNoShow() {
    final l10n = AppLocalizations.of(context)!;
    return _runStatusAction(
      title: l10n.specialistSessionMarkNoShowTitle,
      message: l10n.specialistSessionMarkNoShowMessage,
      confirmLabel: l10n.specialistSessionMarkNoShowConfirm,
      dismissLabel: l10n.specialistSessionKeepSession,
      isDestructive: true,
      successMessage: l10n.specialistSessionMarkedNoShow,
      action: () => ref
          .read(specialistFeaturesRepositoryProvider)
          .markSessionNoShow(widget.sessionId),
    );
  }

  Future<void> _cancelSession() async {
    if (_isActing || _session == null || !_session!.canModify) {
      return;
    }

    final reasonController = TextEditingController();
    final l10n = AppLocalizations.of(context)!;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: Text(l10n.specialistSessionCancelTitle),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(l10n.specialistSessionCancelMessage),
              const SizedBox(height: 12),
              TextField(
                controller: reasonController,
                maxLines: 3,
                decoration: InputDecoration(
                  labelText: l10n.specialistSessionCancelReasonOptional,
                  border: const OutlineInputBorder(),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(false),
              child: Text(l10n.specialistSessionKeepSession),
            ),
            FilledButton(
              style: FilledButton.styleFrom(
                backgroundColor: DashboardColors.highPriority,
              ),
              onPressed: () => Navigator.of(dialogContext).pop(true),
              child: Text(l10n.specialistSessionCancelTitle),
            ),
          ],
        );
      },
    );

    final reason = reasonController.text.trim();
    reasonController.dispose();

    if (confirmed != true || !mounted) {
      return;
    }

    setState(() => _isActing = true);
    final messenger = ScaffoldMessenger.of(context);

    try {
      await ref
          .read(specialistFeaturesRepositoryProvider)
          .cancelSession(
            widget.sessionId,
            reason: reason.isEmpty ? null : reason,
          );
      if (!mounted) return;
      final refreshed = await ref
          .read(specialistFeaturesRepositoryProvider)
          .fetchSessionById(widget.sessionId);
      if (!mounted) return;
      setState(() {
        _session = refreshed;
        _isActing = false;
      });
      await _refreshRelatedProviders();
      if (!mounted) return;
      messenger.showSnackBar(
        SnackBar(content: Text(l10n.specialistSessionCancelled)),
      );
    } catch (error) {
      if (!mounted) return;
      setState(() => _isActing = false);
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            mapSpecialistSessionActionError(
              l10n,
              error.toString().replaceFirst('Exception: ', ''),
            ),
          ),
        ),
      );
    }
  }

  Future<void> _copyMeetingLink(String? locationOrLink) async {
    final uri = extractSessionMeetingUrl(locationOrLink);
    final l10n = AppLocalizations.of(context)!;
    if (uri == null) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.specialistSessionNoMeetingLink)),
      );
      return;
    }

    await Clipboard.setData(ClipboardData(text: uri.toString()));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(l10n.specialistSessionMeetingLinkCopied)),
    );
  }

  Future<void> _openMeeting(String? locationOrLink) async {
    final uri = extractSessionMeetingUrl(locationOrLink);
    final l10n = AppLocalizations.of(context)!;
    if (uri == null) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.specialistSessionNoMeetingLink)),
      );
      return;
    }

    try {
      final launched = await launchUrl(
        uri,
        mode: LaunchMode.externalApplication,
      );
      if (!launched && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(l10n.specialistSessionCouldNotOpenMeetingLink),
          ),
        );
      }
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.specialistSessionCouldNotOpenMeetingLink)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final session = _session;
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final localizedError = _errorMessage != null
        ? mapSpecialistSessionDetailError(l10n, _errorMessage!)
        : null;

    return SpecialistPageScaffold(
      title: l10n.specialistSessionDetailsTitle,
      showBackButton: true,
      body: _isLoading
          ? const Center(child: DashboardLoadingCard())
          : localizedError != null && session == null
          ? Padding(
              padding: context.dashPadding,
              child: DashboardErrorCard(
                message: localizedError,
                onRetry: _load,
              ),
            )
          : session == null
          ? Padding(
              padding: context.dashPadding,
              child: DashboardEmptyCard(
                message: l10n.specialistSessionNotFound,
              ),
            )
          : RefreshIndicator(
              onRefresh: _load,
              color: DashboardColors.primary,
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: context.dashPadding,
                children: [
                  DashboardSurfaceCard(
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 28,
                          backgroundColor: DashboardColors.blueSoft,
                          child: Text(
                            dashboardAvatarLetter(session.patientName),
                            style: const TextStyle(
                              color: Color(0xFF3B82F6),
                              fontWeight: FontWeight.w700,
                              fontSize: 18,
                            ),
                          ),
                        ),
                        SizedBox(width: context.dashSpacing * 0.7),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                session.patientName,
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.w800,
                                  color: DashboardColors.textPrimary,
                                ),
                              ),
                              SizedBox(height: context.dashSpacing * 0.2),
                              Text(
                                localizedSessionTypeLabel(
                                  l10n,
                                  session.sessionType,
                                ),
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: DashboardColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        SessionStatusBadge(status: session.displayStatus),
                      ],
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.75),
                  DashboardSurfaceCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _DetailRow(
                          icon: Icons.calendar_today_outlined,
                          label: l10n.fieldDate,
                          value: session.scheduledAt != null
                              ? DateFormat(
                                  'EEEE, MMM d, yyyy',
                                ).format(session.scheduledAt!)
                              : '—',
                        ),
                        SizedBox(height: context.dashSpacing * 0.55),
                        _DetailRow(
                          icon: Icons.schedule_rounded,
                          label: l10n.specialistSessionStartTime,
                          value: session.timeLabel,
                        ),
                        SizedBox(height: context.dashSpacing * 0.55),
                        _DetailRow(
                          icon: Icons.timelapse_outlined,
                          label: l10n.specialistSessionEndTime,
                          value: session.endTimeLabel,
                        ),
                        SizedBox(height: context.dashSpacing * 0.55),
                        _DetailRow(
                          icon: Icons.timer_outlined,
                          label: l10n.specialistSessionDuration,
                          value: formatSessionDurationValue(
                            l10n,
                            session.durationMinutes ?? 45,
                          ),
                        ),
                        SizedBox(height: context.dashSpacing * 0.55),
                        _DetailRow(
                          icon: session.hasOnlineMeetingLink
                              ? Icons.videocam_outlined
                              : Icons.location_on_outlined,
                          label: session.hasOnlineMeetingLink
                              ? l10n.specialistSessionMeetingLink
                              : l10n.fieldLocation,
                          value: (session.location?.trim().isNotEmpty == true)
                              ? session.location!.trim()
                              : l10n.specialistSessionNotProvided,
                        ),
                        if (session.hasOnlineMeetingLink) ...[
                          SizedBox(height: context.dashSpacing * 0.65),
                          Row(
                            children: [
                              Expanded(
                                child: OutlinedButton.icon(
                                  onPressed: () =>
                                      _openMeeting(session.location),
                                  icon: const Icon(Icons.open_in_new_rounded),
                                  label: Text(
                                    l10n.specialistSessionOpenMeeting,
                                  ),
                                ),
                              ),
                              SizedBox(width: context.dashSpacing * 0.45),
                              Expanded(
                                child: OutlinedButton.icon(
                                  onPressed: () =>
                                      _copyMeetingLink(session.location),
                                  icon: const Icon(Icons.copy_rounded),
                                  label: Text(l10n.specialistSessionCopyLink),
                                ),
                              ),
                            ],
                          ),
                        ],
                        if (session.cancellationReason?.trim().isNotEmpty ==
                            true) ...[
                          SizedBox(height: context.dashSpacing * 0.55),
                          _DetailRow(
                            icon: Icons.notes_outlined,
                            label: l10n.specialistSessionCancellationReason,
                            value: session.cancellationReason!.trim(),
                          ),
                        ],
                      ],
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.85),
                  FilledButton.tonalIcon(
                    onPressed: _openPatientProfile,
                    icon: const Icon(Icons.person_outline_rounded),
                    label: Text(l10n.specialistSessionViewPatientProfile),
                  ),
                  if (session.canModify) ...[
                    SizedBox(height: context.dashSpacing * 0.85),
                    Text(
                      l10n.specialistSessionActions,
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    SizedBox(height: context.dashSpacing * 0.45),
                    FilledButton.icon(
                      onPressed: _isActing ? null : _editSession,
                      icon: const Icon(Icons.edit_outlined),
                      label: Text(l10n.specialistSessionEditSession),
                    ),
                    SizedBox(height: context.dashSpacing * 0.4),
                    OutlinedButton.icon(
                      onPressed: _isActing ? null : _markCompleted,
                      icon: const Icon(Icons.check_circle_outline),
                      label: Text(l10n.specialistSessionMarkAsCompleted),
                    ),
                    SizedBox(height: context.dashSpacing * 0.4),
                    OutlinedButton.icon(
                      onPressed: _isActing ? null : _markNoShow,
                      icon: const Icon(Icons.person_off_outlined),
                      label: Text(l10n.specialistSessionMarkAsNoShow),
                    ),
                    SizedBox(height: context.dashSpacing * 0.4),
                    OutlinedButton.icon(
                      onPressed: _isActing ? null : _cancelSession,
                      style: OutlinedButton.styleFrom(
                        foregroundColor: DashboardColors.highPriority,
                        side: const BorderSide(
                          color: DashboardColors.highPriority,
                        ),
                      ),
                      icon: const Icon(Icons.cancel_outlined),
                      label: Text(l10n.specialistSessionCancelTitle),
                    ),
                  ] else ...[
                    SizedBox(height: context.dashSpacing * 0.75),
                    DashboardSurfaceCard(
                      child: Text(
                        localizedSessionLockedMessage(
                          l10n,
                          session.displayStatus,
                        ),
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: DashboardColors.textSecondary,
                        ),
                      ),
                    ),
                  ],
                  if (_isActing) ...[
                    SizedBox(height: context.dashSpacing * 0.75),
                    const Center(child: CircularProgressIndicator()),
                  ],
                  SizedBox(height: context.dashSpacing),
                ],
              ),
            ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: DashboardColors.textMuted),
        SizedBox(width: context.dashSpacing * 0.4),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: DashboardColors.textMuted,
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: context.dashSpacing * 0.15),
              Text(
                value,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: DashboardColors.textPrimary,
                  fontWeight: FontWeight.w600,
                  height: 1.35,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
