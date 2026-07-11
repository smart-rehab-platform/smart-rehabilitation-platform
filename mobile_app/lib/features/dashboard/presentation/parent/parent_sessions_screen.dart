import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../models/parent_dashboard_models.dart';
import '../../providers/parent_features_provider.dart';
import '../../providers/session_requests_provider.dart';
import '../../utils/session_classification.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/parent_page_scaffold.dart';
import 'parent_request_session_sheet.dart';
import 'parent_session_requests_section.dart';

enum _SessionTab { upcoming, past }

bool parentSessionIsUpcoming(ParentSessionItem session) {
  return sessionIsUpcoming(
    status: session.status,
    scheduledAt: session.scheduledAt,
  );
}

bool parentSessionIsPast(ParentSessionItem session) {
  return sessionIsPast(
    status: session.status,
    scheduledAt: session.scheduledAt,
  );
}

String parentSessionFormatDate(DateTime? date) {
  if (date == null) {
    return '—';
  }
  return DateFormat('EEE, MMM d').format(date);
}

String parentSessionFormatTime(DateTime? date) {
  if (date == null) {
    return '—';
  }
  return DateFormat('h:mm a').format(date);
}

typedef ParentSessionStatusVisual = ({
  String label,
  Color background,
  Color foreground,
  Color border,
  IconData icon,
});

const _scheduledStatusBg = Color(0xFFE8F9F5);
const _scheduledStatusFg = Color(0xFF00A884);
const _completedStatusBg = Color(0xFFEAF8EE);
const _completedStatusFg = Color(0xFF2E7D32);
const _cancelledStatusBg = Color(0xFFFDECEC);
const _cancelledStatusFg = Color(0xFFD32F2F);
const _noShowStatusBg = Color(0xFFFFF0F0);
const _noShowStatusFg = Color(0xFFC62828);

ParentSessionStatusVisual parentSessionStatusVisual(String? status) {
  switch (status?.toLowerCase().trim()) {
    case 'completed':
      return (
        label: 'Completed',
        background: _completedStatusBg,
        foreground: _completedStatusFg,
        border: _completedStatusFg.withValues(alpha: 0.18),
        icon: Icons.check_circle_outlined,
      );
    case 'cancelled':
      return (
        label: 'Cancelled',
        background: _cancelledStatusBg,
        foreground: _cancelledStatusFg,
        border: _cancelledStatusFg.withValues(alpha: 0.18),
        icon: Icons.cancel_outlined,
      );
    case 'no_show':
      return (
        label: 'Missed',
        background: _noShowStatusBg,
        foreground: _noShowStatusFg,
        border: _noShowStatusFg.withValues(alpha: 0.18),
        icon: Icons.warning_amber_rounded,
      );
    case 'scheduled':
    default:
      return (
        label: 'Scheduled',
        background: _scheduledStatusBg,
        foreground: _scheduledStatusFg,
        border: _scheduledStatusFg.withValues(alpha: 0.18),
        icon: Icons.calendar_today_outlined,
      );
  }
}

bool parentSessionIsOnline(ParentSessionItem session) {
  final location = session.locationOrLink?.toLowerCase().trim() ?? '';
  if (location.isEmpty) {
    return false;
  }
  return location.contains('meet') ||
      location.contains('online') ||
      location.contains('zoom') ||
      location.contains('http') ||
      location.contains('teams') ||
      location.contains('link');
}

String parentSessionLocationLabel(ParentSessionItem session) {
  final location = session.locationOrLink?.trim();
  if (location == null || location.isEmpty) {
    return 'Location pending';
  }
  if (parentSessionIsOnline(session)) {
    if (location.toLowerCase().contains('meet')) {
      return 'Online • Google Meet';
    }
    return 'Online • Video Session';
  }
  return location;
}

Uri? parentSessionExtractValidUrl(String? locationOrLink) {
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

  final match = RegExp(r'https?://[^\s]+', caseSensitive: false).firstMatch(raw);
  if (match != null) {
    return Uri.tryParse(match.group(0)!);
  }

  return null;
}

void parentShowSessionDetailsBottomSheet(
  BuildContext context,
  ParentSessionItem session,
) {
  showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (sheetContext) => _SessionDetailsBottomSheet(session: session),
  );
}

Future<void> parentCopySessionLink(BuildContext context, String? link) async {
  final text = link?.trim() ?? '';
  if (text.isEmpty) {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No session link available')),
      );
    }
    return;
  }

  await Clipboard.setData(ClipboardData(text: text));
  if (context.mounted) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Session link copied')),
    );
  }
}

Future<void> parentOpenSessionLink(BuildContext context, String? link) async {
  final uri = parentSessionExtractValidUrl(link);
  if (uri == null) {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No valid session link available')),
      );
    }
    return;
  }

  try {
    final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!launched && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No valid session link available')),
      );
    }
  } catch (_) {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No valid session link available')),
      );
    }
  }
}

class ParentSessionsScreen extends ConsumerStatefulWidget {
  const ParentSessionsScreen({super.key});

  @override
  ConsumerState<ParentSessionsScreen> createState() =>
      _ParentSessionsScreenState();
}

class _ParentSessionsScreenState extends ConsumerState<ParentSessionsScreen> {
  _SessionTab _selectedTab = _SessionTab.upcoming;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(parentSessionsProvider.notifier).initialize();
      ref.read(sessionRequestsProvider.notifier).initialize();
    });
  }

  List<ParentSessionItem> _upcomingSessions(List<ParentSessionItem> sessions) {
    return sessions.where(parentSessionIsUpcoming).toList()
      ..sort((a, b) {
        final aDate = a.scheduledAt ?? DateTime.fromMillisecondsSinceEpoch(0);
        final bDate = b.scheduledAt ?? DateTime.fromMillisecondsSinceEpoch(0);
        return aDate.compareTo(bDate);
      });
  }

  List<ParentSessionItem> _pastSessions(List<ParentSessionItem> sessions) {
    return sessions.where(parentSessionIsPast).toList()
      ..sort((a, b) {
        final aDate = a.scheduledAt ?? DateTime.fromMillisecondsSinceEpoch(0);
        final bDate = b.scheduledAt ?? DateTime.fromMillisecondsSinceEpoch(0);
        return bDate.compareTo(aDate);
      });
  }

  Future<void> _refresh() async {
    await Future.wait([
      ref.read(parentSessionsProvider.notifier).refresh(),
      ref.read(sessionRequestsProvider.notifier).refresh(),
    ]);
  }

  void _openRequestSessionSheet() {
    showParentRequestSessionSheet(context);
  }

  Widget _buildSessionContent({
    required List<ParentSessionItem> upcoming,
    required List<ParentSessionItem> past,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _SessionSegmentedTabs(
          selectedTab: _selectedTab,
          onChanged: (tab) => setState(() => _selectedTab = tab),
        ),
        SizedBox(height: context.dashSpacing * 0.75),
        _SessionSummaryCard(upcomingCount: upcoming.length),
        SizedBox(height: context.dashSpacing),
        if (_selectedTab == _SessionTab.upcoming) ...[
          _SessionsSection(
            title: 'Upcoming Session',
            count: upcoming.length,
            sessions: upcoming,
            emptyTitle: 'No upcoming sessions',
            emptyMessage: 'You do not have any scheduled sessions right now.',
          ),
          SizedBox(height: context.dashSpacing),
          _SessionsSection(
            title: 'Past Sessions',
            count: past.length,
            sessions: past,
            emptyTitle: 'No past sessions yet',
            emptyMessage: 'Completed sessions will appear here.',
          ),
        ] else ...[
          _SessionsSection(
            title: 'Past Sessions',
            count: past.length,
            sessions: past,
            emptyTitle: 'No past sessions yet',
            emptyMessage: 'Completed sessions will appear here.',
          ),
          SizedBox(height: context.dashSpacing),
          _SessionsSection(
            title: 'Upcoming Session',
            count: upcoming.length,
            sessions: upcoming,
            emptyTitle: 'No upcoming sessions',
            emptyMessage: 'You do not have any scheduled sessions right now.',
          ),
        ],
        SizedBox(height: context.dashSpacing),
        _RequestSessionCard(onPressed: _openRequestSessionSheet),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(parentSessionsProvider);
    final upcoming = _upcomingSessions(state.sessions);
    final past = _pastSessions(state.sessions);

    return ParentPageScaffold(
      title: 'Sessions',
      showBackButton: true,
      body: state.isLoading
          ? const Center(child: DashboardLoadingCard())
          : RefreshIndicator(
              color: DashboardColors.primary,
              onRefresh: _refresh,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: context.dashPadding.copyWith(
                  bottom: context.dashSpacing * 1.5,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (state.errorMessage != null) ...[
                      DashboardErrorCard(
                        message: state.errorMessage!,
                        onRetry: _refresh,
                      ),
                      SizedBox(height: context.dashSpacing),
                    ],
                    _buildSessionContent(
                      upcoming: upcoming,
                      past: past,
                    ),
                    SizedBox(height: context.dashSpacing * 1.25),
                    const ParentSessionRequestsSection(),
                  ],
                ),
              ),
            ),
    );
  }
}

class _SessionSegmentedTabs extends StatelessWidget {
  const _SessionSegmentedTabs({
    required this.selectedTab,
    required this.onChanged,
  });

  final _SessionTab selectedTab;
  final ValueChanged<_SessionTab> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(context.dashSpacing * 0.18),
      decoration: BoxDecoration(
        color: DashboardColors.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: DashboardColors.border.withValues(alpha: 0.8)),
      ),
      child: Row(
        children: [
          Expanded(
            child: _SegmentTabButton(
              label: 'Upcoming',
              icon: Icons.event_available_outlined,
              isSelected: selectedTab == _SessionTab.upcoming,
              onTap: () => onChanged(_SessionTab.upcoming),
            ),
          ),
          SizedBox(width: context.dashSpacing * 0.25),
          Expanded(
            child: _SegmentTabButton(
              label: 'Past',
              icon: Icons.history_rounded,
              isSelected: selectedTab == _SessionTab.past,
              onTap: () => onChanged(_SessionTab.past),
            ),
          ),
        ],
      ),
    );
  }
}

class _SegmentTabButton extends StatelessWidget {
  const _SegmentTabButton({
    required this.label,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AnimatedContainer(
      duration: const Duration(milliseconds: 220),
      curve: Curves.easeOutCubic,
      decoration: BoxDecoration(
        color: isSelected ? DashboardColors.purpleSoft : Colors.transparent,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(14),
          child: Padding(
            padding: EdgeInsets.symmetric(
              vertical: context.dashSpacing * 0.45,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  icon,
                  size: 18,
                  color: isSelected
                      ? DashboardColors.primary
                      : DashboardColors.textMuted,
                ),
                SizedBox(width: context.dashSpacing * 0.25),
                Text(
                  label,
                  style: theme.textTheme.labelLarge?.copyWith(
                    color: isSelected
                        ? DashboardColors.primary
                        : DashboardColors.textSecondary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _SessionSummaryCard extends StatelessWidget {
  const _SessionSummaryCard({required this.upcomingCount});

  final int upcomingCount;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final hasUpcoming = upcomingCount > 0;

    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(context.dashSpacing * 0.85),
      decoration: BoxDecoration(
        color: DashboardColors.purpleSoft,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: DashboardColors.primary.withValues(alpha: 0.08),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: context.dashSpacing * 2.1,
            height: context.dashSpacing * 2.1,
            decoration: BoxDecoration(
              color: DashboardColors.surface,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(
              Icons.calendar_month_rounded,
              color: DashboardColors.primary,
              size: context.dashSpacing * 0.72,
            ),
          ),
          SizedBox(width: context.dashSpacing * 0.65),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  hasUpcoming ? 'Stay on track!' : 'No upcoming sessions',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: DashboardColors.primary,
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.15),
                Text(
                  hasUpcoming
                      ? 'You have $upcomingCount upcoming session${upcomingCount == 1 ? '' : 's'}.'
                      : 'Past sessions are still available below.',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: DashboardColors.textSecondary,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SessionsSection extends StatelessWidget {
  const _SessionsSection({
    required this.title,
    required this.count,
    required this.sessions,
    required this.emptyTitle,
    required this.emptyMessage,
  });

  final String title;
  final int count;
  final List<ParentSessionItem> sessions;
  final String emptyTitle;
  final String emptyMessage;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _SessionSectionTitle(title: title, count: count),
        SizedBox(height: context.dashSpacing * 0.55),
        if (sessions.isEmpty)
          _EmptySessionsCard(title: emptyTitle, message: emptyMessage)
        else
          ...sessions.map(
            (session) => Padding(
              padding: EdgeInsets.only(bottom: context.dashSpacing * 0.55),
              child: _ModernSessionCard(session: session),
            ),
          ),
      ],
    );
  }
}

class _SessionSectionTitle extends StatelessWidget {
  const _SessionSectionTitle({
    required this.title,
    required this.count,
  });

  final String title;
  final int count;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w800,
              color: DashboardColors.textPrimary,
            ),
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: DashboardColors.purpleSoft,
            borderRadius: BorderRadius.circular(999),
          ),
          child: Text(
            '$count',
            style: theme.textTheme.labelMedium?.copyWith(
              color: DashboardColors.primary,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
      ],
    );
  }
}

class _ModernSessionCard extends StatelessWidget {
  const _ModernSessionCard({required this.session});

  final ParentSessionItem session;

  IconData _leadingIcon() {
    final status = session.status?.toLowerCase().trim();
    if (parentSessionIsOnline(session)) {
      return Icons.videocam_rounded;
    }
    if (status == 'completed') {
      return Icons.check_circle_outline_rounded;
    }
    if (parentSessionIsPast(session)) {
      return Icons.event_available_outlined;
    }
    return Icons.calendar_today_rounded;
  }

  Color _leadingIconColor() {
    if (parentSessionIsOnline(session)) {
      return DashboardColors.primary;
    }
    if (session.status?.toLowerCase() == 'completed') {
      return _completedStatusFg;
    }
    return DashboardColors.primary;
  }

  Color _leadingIconBackground() {
    if (parentSessionIsOnline(session)) {
      return DashboardColors.purpleSoft;
    }
    if (session.status?.toLowerCase() == 'completed') {
      return _completedStatusBg;
    }
    return DashboardColors.blueSoft;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final statusVisual = parentSessionStatusVisual(session.status);
    final locationLabel = parentSessionLocationLabel(session);

    return Material(
      color: DashboardColors.surface,
      elevation: 0,
      shadowColor: DashboardColors.primary.withValues(alpha: 0.08),
      borderRadius: BorderRadius.circular(24),
      child: InkWell(
        onTap: () => parentShowSessionDetailsBottomSheet(context, session),
        borderRadius: BorderRadius.circular(24),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: DashboardColors.border.withValues(alpha: 0.75)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.04),
                blurRadius: 18,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          padding: EdgeInsets.all(context.dashSpacing * 0.8),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: context.dashSpacing * 2.15,
                height: context.dashSpacing * 2.15,
                decoration: BoxDecoration(
                  color: _leadingIconBackground(),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(
                  _leadingIcon(),
                  color: _leadingIconColor(),
                  size: context.dashSpacing * 0.72,
                ),
              ),
              SizedBox(width: context.dashSpacing * 0.65),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            session.patientName,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                        SizedBox(width: context.dashSpacing * 0.25),
                        _SessionStatusChip(visual: statusVisual),
                      ],
                    ),
                    SizedBox(height: context.dashSpacing * 0.35),
                    Wrap(
                      spacing: context.dashSpacing * 0.25,
                      runSpacing: context.dashSpacing * 0.15,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        _SessionMetaItem(
                          icon: Icons.calendar_today_outlined,
                          label: parentSessionFormatDate(session.scheduledAt),
                        ),
                        Text(
                          '•',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: DashboardColors.textMuted,
                          ),
                        ),
                        _SessionMetaItem(
                          icon: Icons.access_time_rounded,
                          label: parentSessionFormatTime(session.scheduledAt),
                        ),
                        if (session.durationMinutes != null) ...[
                          Text(
                            '•',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: DashboardColors.textMuted,
                            ),
                          ),
                          _SessionMetaItem(
                            icon: Icons.timer_outlined,
                            label: '${session.durationMinutes} min',
                          ),
                        ],
                      ],
                    ),
                    SizedBox(height: context.dashSpacing * 0.45),
                    Wrap(
                      spacing: context.dashSpacing * 0.3,
                      runSpacing: context.dashSpacing * 0.25,
                      children: [
                        _SessionInfoChip(
                          icon: Icons.person_outline_rounded,
                          label: session.specialistName ?? 'Specialist',
                        ),
                        _SessionInfoChip(
                          icon: parentSessionIsOnline(session)
                              ? Icons.videocam_outlined
                              : Icons.location_on_outlined,
                          label: locationLabel,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              SizedBox(width: context.dashSpacing * 0.15),
              Icon(
                Icons.chevron_right_rounded,
                color: DashboardColors.textMuted,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SessionStatusChip extends StatelessWidget {
  const _SessionStatusChip({required this.visual});

  final ParentSessionStatusVisual visual;

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
          Icon(
            visual.icon,
            size: 14,
            color: visual.foreground,
          ),
          const SizedBox(width: 4),
          Text(
            visual.label,
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

class _SessionDetailsBottomSheet extends StatelessWidget {
  const _SessionDetailsBottomSheet({required this.session});

  final ParentSessionItem session;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final statusVisual = parentSessionStatusVisual(session.status);
    final locationText = session.locationOrLink?.trim();
    final locationLabel = parentSessionLocationLabel(session);
    final isOnline = parentSessionIsOnline(session);
    final validUrl = parentSessionExtractValidUrl(session.locationOrLink);
    final durationLabel = session.durationMinutes != null
        ? '${session.durationMinutes} min'
        : '—';

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
            context.dashSpacing * 1.1 + MediaQuery.viewInsetsOf(context).bottom,
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
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: context.dashSpacing * 2.2,
                    height: context.dashSpacing * 2.2,
                    decoration: BoxDecoration(
                      color: DashboardColors.purpleSoft,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Icon(
                      isOnline
                          ? Icons.videocam_rounded
                          : Icons.event_note_rounded,
                      color: DashboardColors.primary,
                      size: context.dashSpacing * 0.72,
                    ),
                  ),
                  SizedBox(width: context.dashSpacing * 0.65),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Session Details',
                          style: theme.textTheme.labelLarge?.copyWith(
                            color: DashboardColors.textSecondary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        SizedBox(height: context.dashSpacing * 0.15),
                        Text(
                          session.patientName,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ],
                    ),
                  ),
                  _SessionStatusChip(visual: statusVisual),
                ],
              ),
              SizedBox(height: context.dashSpacing),
              _SessionDetailRow(
                icon: Icons.person_outline_rounded,
                iconBackground: DashboardColors.blueSoft,
                iconColor: DashboardColors.primary,
                label: 'Specialist',
                value: session.specialistName ?? 'Specialist',
              ),
              SizedBox(height: context.dashSpacing * 0.55),
              _SessionDetailRow(
                icon: Icons.calendar_today_outlined,
                iconBackground: DashboardColors.purpleSoft,
                iconColor: DashboardColors.primary,
                label: 'Date',
                value: parentSessionFormatDate(session.scheduledAt),
              ),
              SizedBox(height: context.dashSpacing * 0.55),
              _SessionDetailRow(
                icon: Icons.access_time_rounded,
                iconBackground: DashboardColors.tealSoft,
                iconColor: DashboardColors.accent,
                label: 'Time',
                value: parentSessionFormatTime(session.scheduledAt),
              ),
              SizedBox(height: context.dashSpacing * 0.55),
              _SessionDetailRow(
                icon: Icons.timer_outlined,
                iconBackground: DashboardColors.amberSoft,
                iconColor: DashboardColors.warning,
                label: 'Duration',
                value: durationLabel,
              ),
              SizedBox(height: context.dashSpacing * 0.55),
              _SessionDetailRow(
                icon: isOnline
                    ? Icons.videocam_outlined
                    : Icons.location_on_outlined,
                iconBackground: DashboardColors.background,
                iconColor: DashboardColors.textSecondary,
                label: isOnline ? 'Online session' : 'Location',
                value: locationLabel,
                valueMaxLines: 3,
              ),
              if (isOnline) ...[
                SizedBox(height: context.dashSpacing * 0.85),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () =>
                            parentCopySessionLink(context, locationText),
                        icon: const Icon(Icons.copy_rounded, size: 18),
                        label: const Text('Copy Link'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: DashboardColors.primary,
                          side: BorderSide(
                            color: DashboardColors.primary.withValues(alpha: 0.35),
                          ),
                          padding: EdgeInsets.symmetric(
                            vertical: context.dashSpacing * 0.55,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                      ),
                    ),
                    SizedBox(width: context.dashSpacing * 0.45),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () =>
                            parentOpenSessionLink(context, locationText),
                        icon: const Icon(Icons.open_in_new_rounded, size: 18),
                        label: const Text('Open Link'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: DashboardColors.primary,
                          foregroundColor: Colors.white,
                          padding: EdgeInsets.symmetric(
                            vertical: context.dashSpacing * 0.55,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ] else if (validUrl != null) ...[
                SizedBox(height: context.dashSpacing * 0.85),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () =>
                        parentOpenSessionLink(context, locationText),
                    icon: const Icon(Icons.open_in_new_rounded, size: 18),
                    label: const Text('Open Link'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: DashboardColors.primary,
                      foregroundColor: Colors.white,
                      padding: EdgeInsets.symmetric(
                        vertical: context.dashSpacing * 0.55,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _SessionDetailRow extends StatelessWidget {
  const _SessionDetailRow({
    required this.icon,
    required this.iconBackground,
    required this.iconColor,
    required this.label,
    required this.value,
    this.valueMaxLines = 2,
  });

  final IconData icon;
  final Color iconBackground;
  final Color iconColor;
  final String label;
  final String value;
  final int valueMaxLines;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: EdgeInsets.all(context.dashSpacing * 0.65),
      decoration: BoxDecoration(
        color: DashboardColors.background,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: DashboardColors.border.withValues(alpha: 0.75)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: context.dashSpacing * 1.75,
            height: context.dashSpacing * 1.75,
            decoration: BoxDecoration(
              color: iconBackground,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: iconColor, size: 18),
          ),
          SizedBox(width: context.dashSpacing * 0.55),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: DashboardColors.textMuted,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.12),
                Text(
                  value,
                  maxLines: valueMaxLines,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: DashboardColors.textPrimary,
                    fontWeight: FontWeight.w700,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SessionMetaItem extends StatelessWidget {
  const _SessionMetaItem({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: DashboardColors.textMuted),
        SizedBox(width: context.dashSpacing * 0.12),
        Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(
            color: DashboardColors.textSecondary,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

class _SessionInfoChip extends StatelessWidget {
  const _SessionInfoChip({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: context.dashSpacing * 0.35,
        vertical: context.dashSpacing * 0.18,
      ),
      decoration: BoxDecoration(
        color: DashboardColors.background,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: DashboardColors.border.withValues(alpha: 0.8)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: DashboardColors.textMuted),
          SizedBox(width: context.dashSpacing * 0.15),
          ConstrainedBox(
            constraints: BoxConstraints(
              maxWidth: MediaQuery.sizeOf(context).width * 0.42,
            ),
            child: Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.labelSmall?.copyWith(
                color: DashboardColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptySessionsCard extends StatelessWidget {
  const _EmptySessionsCard({
    required this.title,
    required this.message,
  });

  final String title;
  final String message;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(context.dashSpacing * 0.9),
      decoration: BoxDecoration(
        color: DashboardColors.surface,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: DashboardColors.border.withValues(alpha: 0.8)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.2),
          Text(
            message,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }
}

class _RequestSessionCard extends StatelessWidget {
  const _RequestSessionCard({required this.onPressed});

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(context.dashSpacing * 0.9),
      decoration: BoxDecoration(
        color: DashboardColors.blueSoft,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: DashboardColors.border.withValues(alpha: 0.75),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: context.dashSpacing * 2.2,
                height: context.dashSpacing * 2.2,
                decoration: BoxDecoration(
                  color: DashboardColors.surface,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(
                  Icons.event_note_rounded,
                  color: DashboardColors.primary,
                  size: context.dashSpacing * 0.75,
                ),
              ),
              SizedBox(width: context.dashSpacing * 0.65),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Need to schedule a session?',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    SizedBox(height: context.dashSpacing * 0.2),
                    Text(
                      'Request a new session with your specialist at a time that suits you.',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: DashboardColors.textSecondary,
                        height: 1.45,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: onPressed,
              icon: const Icon(Icons.calendar_month_outlined, size: 18),
              label: const Text('Request New Session'),
              style: ElevatedButton.styleFrom(
                backgroundColor: DashboardColors.primary,
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(
                  vertical: context.dashSpacing * 0.62,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
