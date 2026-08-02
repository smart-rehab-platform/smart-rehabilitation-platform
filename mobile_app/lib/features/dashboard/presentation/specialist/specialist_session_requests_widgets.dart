import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../models/session_requests_models.dart';
import '../../providers/specialist_session_requests_provider.dart';
import '../../utils/session_request_display_helpers.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/parent_dashboard_cards.dart';
import 'specialist_scoped_localization_utils.dart';

class SpecialistSessionRequestsInbox extends ConsumerWidget {
  const SpecialistSessionRequestsInbox({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(specialistSessionRequestsProvider);
    final notifier = ref.read(specialistSessionRequestsProvider.notifier);
    final visible = state.visibleRequests;
    final l10n = AppLocalizations.of(context)!;
    final localizedError = state.errorMessage != null
        ? mapSpecialistSessionRequestsError(l10n, state.errorMessage!)
        : null;

    if (state.isLoading) {
      return const Center(child: DashboardLoadingCard());
    }

    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: context.dashPadding,
      children: [
        SessionRequestInboxFilterChips(
          selected: state.filter,
          onChanged: notifier.setFilter,
        ),
        if (localizedError != null) ...[
          SizedBox(height: context.dashSpacing * 0.75),
          DashboardErrorCard(
            message: localizedError,
            onRetry: notifier.refresh,
          ),
        ],
        SizedBox(height: context.dashSpacing * 0.75),
        if (state.requests.isEmpty)
          DashboardEmptyCard(message: l10n.specialistNoSessionRequests)
        else if (visible.isEmpty)
          DashboardEmptyCard(
            message: state.filter == SessionRequestInboxFilter.pending
                ? l10n.specialistNoPendingSessionRequests
                : l10n.specialistNoSessionRequestsMatchFilter,
          )
        else
          ...visible.map(
            (request) => SpecialistSessionRequestCard(
              request: request,
              isProcessing: state.processingRequestId == request.id,
              onApprove: () => showApproveSessionRequestSheet(context, request),
              onReject: () => showRejectSessionRequestSheet(context, request),
            ),
          ),
        SizedBox(height: context.dashSpacing),
      ],
    );
  }
}

class SessionRequestInboxFilterChips extends StatelessWidget {
  const SessionRequestInboxFilterChips({
    super.key,
    required this.selected,
    required this.onChanged,
  });

  final SessionRequestInboxFilter selected;
  final ValueChanged<SessionRequestInboxFilter> onChanged;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: SessionRequestInboxFilter.values.map((filter) {
          final isSelected = selected == filter;
          return Padding(
            padding: EdgeInsetsDirectional.only(end: context.dashSpacing * 0.4),
            child: InkWell(
              onTap: () => onChanged(filter),
              borderRadius: BorderRadius.circular(14),
              child: Container(
                padding: EdgeInsets.symmetric(
                  horizontal: context.dashSpacing * 0.65,
                  vertical: context.dashSpacing * 0.45,
                ),
                decoration: BoxDecoration(
                  color: isSelected
                      ? DashboardColors.brandSoft
                      : DashboardColors.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isSelected
                        ? DashboardColors.brandCyan
                        : DashboardColors.border,
                  ),
                ),
                child: Text(
                  localizedSessionRequestInboxFilter(l10n, filter),
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: isSelected
                        ? DashboardColors.brandCyan
                        : DashboardColors.textSecondary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class SpecialistSessionRequestCard extends StatelessWidget {
  const SpecialistSessionRequestCard({
    super.key,
    required this.request,
    required this.isProcessing,
    required this.onApprove,
    required this.onReject,
  });

  final SessionRequestItem request;
  final bool isProcessing;
  final VoidCallback onApprove;
  final VoidCallback onReject;

  String _formatDate(DateTime? date) {
    if (date == null) {
      return '—';
    }
    return DateFormat('EEE, MMM d, yyyy').format(date);
  }

  String _formatCreatedDate(DateTime? date) {
    if (date == null) {
      return '—';
    }
    return DateFormat('MMM d, yyyy').format(date);
  }

  String _formatDateTime(DateTime? date) {
    if (date == null) {
      return '—';
    }
    return '${DateFormat('MMM d, yyyy').format(date)} • ${DateFormat('h:mm a').format(date)}';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final statusVisual = sessionRequestStatusVisual(request.status);
    final approvedSession = request.approvedSession;
    final isPending = request.status == SessionRequestStatus.pending;
    final location = approvedSession?.locationOrLink?.trim();
    final validUrl = _extractValidUrl(location);

    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
      child: DashboardSurfaceCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        request.patientName ?? l10n.entityPatient,
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      SizedBox(height: context.dashSpacing * 0.15),
                      Text(
                        request.parentName ?? l10n.roleParent,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: DashboardColors.textSecondary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                SessionRequestStatusChip(
                  visual: statusVisual,
                  label: localizedSessionRequestStatus(l10n, request.status),
                ),
              ],
            ),
            SizedBox(height: context.dashSpacing * 0.45),
            Text(
              localizedSessionRequestReason(l10n, request),
              style: theme.textTheme.bodyMedium?.copyWith(
                color: DashboardColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
            ),
            if (request.reason == SessionRequestReason.other &&
                request.reasonOtherText != null &&
                request.reasonOtherText!.trim().isNotEmpty) ...[
              SizedBox(height: context.dashSpacing * 0.2),
              Text(
                request.reasonOtherText!.trim(),
                style: theme.textTheme.bodySmall?.copyWith(
                  color: DashboardColors.textMuted,
                ),
              ),
            ],
            SizedBox(height: context.dashSpacing * 0.45),
            _RequestInfoRow(
              icon: Icons.calendar_today_outlined,
              label: l10n.specialistSessionRequestPreferredDate,
              value: _formatDate(request.preferredDate),
            ),
            SizedBox(height: context.dashSpacing * 0.2),
            _RequestInfoRow(
              icon: Icons.wb_twilight_outlined,
              label: l10n.specialistSessionRequestPreferredTime,
              value: request.preferredTimePeriod?.label ?? '—',
            ),
            SizedBox(height: context.dashSpacing * 0.2),
            _RequestInfoRow(
              icon: Icons.schedule_rounded,
              label: l10n.specialistSessionRequestRequested,
              value: _formatCreatedDate(request.createdAt),
            ),
            if (request.notes != null && request.notes!.trim().isNotEmpty) ...[
              SizedBox(height: context.dashSpacing * 0.45),
              Text(
                request.notes!.trim(),
                style: theme.textTheme.bodySmall?.copyWith(
                  color: DashboardColors.textSecondary,
                  height: 1.45,
                ),
              ),
            ],
            if (request.status == SessionRequestStatus.rejected &&
                request.rejectionReason != null &&
                request.rejectionReason!.trim().isNotEmpty) ...[
              SizedBox(height: context.dashSpacing * 0.55),
              Container(
                width: double.infinity,
                padding: EdgeInsets.all(context.dashSpacing * 0.55),
                decoration: BoxDecoration(
                  color: const Color(0xFFFDECEC),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: const Color(0xFFD32F2F).withValues(alpha: 0.15),
                  ),
                ),
                child: Text(
                  request.rejectionReason!.trim(),
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: const Color(0xFFD32F2F),
                    height: 1.45,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
            if (request.status == SessionRequestStatus.approved &&
                approvedSession != null) ...[
              SizedBox(height: context.dashSpacing * 0.55),
              Container(
                width: double.infinity,
                padding: EdgeInsets.all(context.dashSpacing * 0.55),
                decoration: BoxDecoration(
                  color: const Color(0xFFEAF8EE),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: const Color(0xFF2E7D32).withValues(alpha: 0.15),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      l10n.specialistSessionScheduledAt(
                        _formatDateTime(approvedSession.scheduledAt),
                      ),
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: const Color(0xFF2E7D32),
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    if (approvedSession.durationMinutes != null) ...[
                      SizedBox(height: context.dashSpacing * 0.2),
                      Text(
                        l10n.specialistSessionDurationMinutes(
                          approvedSession.durationMinutes!,
                        ),
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: const Color(0xFF2E7D32),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                    if (location != null && location.isNotEmpty) ...[
                      SizedBox(height: context.dashSpacing * 0.2),
                      Text(
                        location,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: const Color(0xFF2E7D32),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      if (validUrl != null) ...[
                        SizedBox(height: context.dashSpacing * 0.35),
                        Wrap(
                          spacing: context.dashSpacing * 0.35,
                          runSpacing: context.dashSpacing * 0.25,
                          children: [
                            OutlinedButton.icon(
                              onPressed: () => _copyLink(context, location),
                              icon: const Icon(Icons.copy_rounded, size: 16),
                              label: Text(l10n.commonCopy),
                            ),
                            ElevatedButton.icon(
                              onPressed: () => _openLink(context, location),
                              icon: const Icon(
                                Icons.open_in_new_rounded,
                                size: 16,
                              ),
                              label: Text(l10n.commonOpen),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ],
                ),
              ),
            ],
            if (isPending) ...[
              SizedBox(height: context.dashSpacing * 0.75),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: isProcessing ? null : onReject,
                      style: OutlinedButton.styleFrom(
                        foregroundColor: DashboardColors.highPriority,
                        side: BorderSide(
                          color: DashboardColors.highPriority.withValues(
                            alpha: 0.35,
                          ),
                        ),
                        padding: EdgeInsets.symmetric(
                          vertical: context.dashSpacing * 0.5,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      child: Text(l10n.commonReject),
                    ),
                  ),
                  SizedBox(width: context.dashSpacing * 0.45),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: isProcessing ? null : onApprove,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: DashboardColors.brandCyan,
                        foregroundColor: Colors.white,
                        padding: EdgeInsets.symmetric(
                          vertical: context.dashSpacing * 0.5,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      child: Text(
                        isProcessing
                            ? l10n.commonProcessing
                            : l10n.commonApprove,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class SessionRequestStatusChip extends StatelessWidget {
  const SessionRequestStatusChip({super.key, required this.visual, this.label});

  final SessionRequestStatusVisual visual;
  final String? label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: visual.background,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: visual.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(visual.icon, size: 14, color: visual.foreground),
          const SizedBox(width: 4),
          Text(
            label ?? visual.label,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: visual.foreground,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _RequestInfoRow extends StatelessWidget {
  const _RequestInfoRow({
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
        Icon(icon, size: 14, color: DashboardColors.textMuted),
        SizedBox(width: context.dashSpacing * 0.25),
        Expanded(
          child: RichText(
            text: TextSpan(
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: DashboardColors.textSecondary,
                height: 1.35,
              ),
              children: [
                TextSpan(
                  text: '$label: ',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                TextSpan(text: value),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

Future<void> showApproveSessionRequestSheet(
  BuildContext context,
  SessionRequestItem request,
) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (sheetContext) => _ApproveSessionRequestSheet(request: request),
  );
}

class _ApproveSessionRequestSheet extends ConsumerStatefulWidget {
  const _ApproveSessionRequestSheet({required this.request});

  final SessionRequestItem request;

  @override
  ConsumerState<_ApproveSessionRequestSheet> createState() =>
      _ApproveSessionRequestSheetState();
}

class _ApproveSessionRequestSheetState
    extends ConsumerState<_ApproveSessionRequestSheet> {
  final _durationController = TextEditingController(text: '45');
  final _locationController = TextEditingController();

  late DateTime _scheduledDate;
  late TimeOfDay _scheduledTime;

  @override
  void initState() {
    super.initState();
    final preferred = widget.request.preferredDate ?? DateTime.now();
    final now = DateTime.now();
    final baseDate = DateTime(preferred.year, preferred.month, preferred.day);
    final initialDate =
        baseDate.isBefore(DateTime(now.year, now.month, now.day))
        ? DateTime(now.year, now.month, now.day)
        : baseDate;
    _scheduledDate = initialDate;
    _scheduledTime = const TimeOfDay(hour: 9, minute: 0);
  }

  @override
  void dispose() {
    _durationController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  DateTime get _scheduledDateTime => DateTime(
    _scheduledDate.year,
    _scheduledDate.month,
    _scheduledDate.day,
    _scheduledTime.hour,
    _scheduledTime.minute,
  );

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _scheduledDate,
      firstDate: DateTime(now.year, now.month, now.day),
      lastDate: DateTime(now.year + 2),
    );
    if (picked != null) {
      setState(() => _scheduledDate = picked);
    }
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _scheduledTime,
    );
    if (picked != null) {
      setState(() => _scheduledTime = picked);
    }
  }

  Future<void> _submit() async {
    final duration = int.tryParse(_durationController.text.trim());
    if (duration == null || duration < 1 || duration > 480) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Duration must be between 1 and 480 minutes.'),
        ),
      );
      return;
    }

    if (!_scheduledDateTime.isAfter(DateTime.now())) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Scheduled date and time must be in the future.'),
        ),
      );
      return;
    }

    final error = await ref
        .read(specialistSessionRequestsProvider.notifier)
        .approveRequest(
          widget.request.id,
          ApproveSessionRequestInput(
            scheduledAt: _scheduledDateTime,
            durationMinutes: duration,
            locationOrLink: _locationController.text.trim().isEmpty
                ? null
                : _locationController.text.trim(),
          ),
        );

    if (!mounted) {
      return;
    }

    if (error != null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error)));
      return;
    }

    Navigator.of(context).pop();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Session request approved and session created.'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isProcessing =
        ref.watch(specialistSessionRequestsProvider).processingRequestId ==
        widget.request.id;
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;

    return Container(
      decoration: const BoxDecoration(
        color: DashboardColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: SafeArea(
        top: false,
        child: SingleChildScrollView(
          padding: EdgeInsets.fromLTRB(
            context.dashPadding.left,
            context.dashSpacing * 0.55,
            context.dashPadding.right,
            context.dashSpacing * 1.1 + bottomInset,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 44,
                  height: 4,
                  decoration: BoxDecoration(
                    color: DashboardColors.border,
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
              ),
              SizedBox(height: context.dashSpacing * 0.85),
              Text(
                'Approve Session Request',
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
              ),
              SizedBox(height: context.dashSpacing),
              _ReadOnlyField(
                label: 'Patient',
                value: widget.request.patientName ?? 'Patient',
              ),
              SizedBox(height: context.dashSpacing * 0.55),
              _ReadOnlyField(
                label: 'Parent',
                value: widget.request.parentName ?? 'Parent',
              ),
              SizedBox(height: context.dashSpacing * 0.55),
              _ReadOnlyField(
                label: 'Preferred date',
                value: widget.request.preferredDate != null
                    ? DateFormat(
                        'MMM d, yyyy',
                      ).format(widget.request.preferredDate!)
                    : '—',
              ),
              SizedBox(height: context.dashSpacing * 0.55),
              _ReadOnlyField(
                label: 'Preferred time',
                value: widget.request.preferredTimePeriod?.label ?? '—',
              ),
              SizedBox(height: context.dashSpacing * 0.65),
              DashboardSurfaceCard(
                onTap: _pickDate,
                child: _PickerField(
                  label: 'Scheduled Date',
                  value: DateFormat('MMM d, yyyy').format(_scheduledDate),
                  icon: Icons.calendar_today_outlined,
                ),
              ),
              SizedBox(height: context.dashSpacing * 0.55),
              DashboardSurfaceCard(
                onTap: _pickTime,
                child: _PickerField(
                  label: 'Scheduled Time',
                  value: _scheduledTime.format(context),
                  icon: Icons.access_time_rounded,
                ),
              ),
              SizedBox(height: context.dashSpacing * 0.55),
              DashboardSurfaceCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Duration (minutes)',
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: DashboardColors.textMuted,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    SizedBox(height: context.dashSpacing * 0.2),
                    TextField(
                      controller: _durationController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        border: InputBorder.none,
                        isDense: true,
                        contentPadding: EdgeInsets.zero,
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(height: context.dashSpacing * 0.55),
              DashboardSurfaceCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Meeting Link or Location',
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: DashboardColors.textMuted,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    SizedBox(height: context.dashSpacing * 0.2),
                    TextField(
                      controller: _locationController,
                      maxLines: 2,
                      decoration: const InputDecoration(
                        border: InputBorder.none,
                        isDense: true,
                        contentPadding: EdgeInsets.zero,
                        hintText: 'Optional',
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(height: context.dashSpacing),
              ElevatedButton(
                onPressed: isProcessing ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: DashboardColors.brandCyan,
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.symmetric(
                    vertical: context.dashSpacing * 0.62,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: Text(
                  isProcessing ? 'Approving...' : 'Approve & Create Session',
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

Future<void> showRejectSessionRequestSheet(
  BuildContext context,
  SessionRequestItem request,
) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (sheetContext) => _RejectSessionRequestSheet(request: request),
  );
}

class _RejectSessionRequestSheet extends ConsumerStatefulWidget {
  const _RejectSessionRequestSheet({required this.request});

  final SessionRequestItem request;

  @override
  ConsumerState<_RejectSessionRequestSheet> createState() =>
      _RejectSessionRequestSheetState();
}

class _RejectSessionRequestSheetState
    extends ConsumerState<_RejectSessionRequestSheet> {
  final _reasonController = TextEditingController();

  @override
  void dispose() {
    _reasonController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final reason = _reasonController.text.trim();
    if (reason.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Rejection reason is required.')),
      );
      return;
    }

    final error = await ref
        .read(specialistSessionRequestsProvider.notifier)
        .rejectRequest(
          widget.request.id,
          RejectSessionRequestInput(rejectionReason: reason),
        );

    if (!mounted) {
      return;
    }

    if (error != null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error)));
      return;
    }

    Navigator.of(context).pop();
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Session request rejected.')));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isProcessing =
        ref.watch(specialistSessionRequestsProvider).processingRequestId ==
        widget.request.id;
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;

    return Container(
      decoration: const BoxDecoration(
        color: DashboardColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: EdgeInsets.fromLTRB(
            context.dashPadding.left,
            context.dashSpacing * 0.55,
            context.dashPadding.right,
            context.dashSpacing * 1.1 + bottomInset,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 44,
                  height: 4,
                  decoration: BoxDecoration(
                    color: DashboardColors.border,
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
              ),
              SizedBox(height: context.dashSpacing * 0.85),
              Text(
                'Reject Session Request',
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
              ),
              SizedBox(height: context.dashSpacing * 0.35),
              Text(
                'Provide a reason so the parent understands why this request was declined.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: DashboardColors.textSecondary,
                  height: 1.45,
                ),
              ),
              SizedBox(height: context.dashSpacing),
              DashboardSurfaceCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Rejection Reason',
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: DashboardColors.textMuted,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    SizedBox(height: context.dashSpacing * 0.2),
                    TextField(
                      controller: _reasonController,
                      maxLines: 4,
                      decoration: const InputDecoration(
                        border: InputBorder.none,
                        isDense: true,
                        contentPadding: EdgeInsets.zero,
                        hintText: 'Explain why this request cannot be approved',
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(height: context.dashSpacing),
              ElevatedButton(
                onPressed: isProcessing ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: DashboardColors.highPriority,
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.symmetric(
                    vertical: context.dashSpacing * 0.62,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: Text(isProcessing ? 'Rejecting...' : 'Reject Request'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ReadOnlyField extends StatelessWidget {
  const _ReadOnlyField({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: theme.textTheme.labelSmall?.copyWith(
              color: DashboardColors.textMuted,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.2),
          Text(
            value,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _PickerField extends StatelessWidget {
  const _PickerField({
    required this.label,
    required this.value,
    required this.icon,
  });

  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: theme.textTheme.labelSmall?.copyWith(
                  color: DashboardColors.textMuted,
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: context.dashSpacing * 0.2),
              Text(
                value,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
        Icon(icon, color: DashboardColors.brandCyan, size: 20),
      ],
    );
  }
}

Uri? _extractValidUrl(String? locationOrLink) {
  final raw = locationOrLink?.trim();
  if (raw == null || raw.isEmpty) {
    return null;
  }

  final direct = Uri.tryParse(raw);
  if (direct != null &&
      direct.hasScheme &&
      (direct.scheme == 'http' || direct.scheme == 'https')) {
    return direct;
  }

  final match = RegExp(
    r'https?://[^\s]+',
    caseSensitive: false,
  ).firstMatch(raw);
  if (match != null) {
    return Uri.tryParse(match.group(0)!);
  }

  return null;
}

Future<void> _copyLink(BuildContext context, String link) async {
  await Clipboard.setData(ClipboardData(text: link));
  if (context.mounted) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Link copied')));
  }
}

Future<void> _openLink(BuildContext context, String link) async {
  final uri = _extractValidUrl(link);
  if (uri == null) {
    if (context.mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('No valid link available')));
    }
    return;
  }

  try {
    final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!launched && context.mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Could not open link')));
    }
  } catch (_) {
    if (context.mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Could not open link')));
    }
  }
}
