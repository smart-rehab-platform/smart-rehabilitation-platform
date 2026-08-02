import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../data/admin_features_repository.dart';
import '../../providers/admin_features_provider.dart';
import '../../widgets/admin_page_scaffold.dart';
import '../../widgets/admin_status_badge.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/admin_ui_components.dart';

class AdminSessionsScreen extends ConsumerStatefulWidget {
  const AdminSessionsScreen({super.key});

  @override
  ConsumerState<AdminSessionsScreen> createState() => _AdminSessionsScreenState();
}

class _AdminSessionsScreenState extends ConsumerState<AdminSessionsScreen> {
  bool _isLoading = true;
  String? _error;
  List<AdminSessionRecord> _sessions = const [];
  String _searchQuery = '';
  String? _statusFilter;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final repo = ref.read(adminFeaturesRepositoryProvider);
      final rows = await repo.fetchSessions();
      if (mounted) {
        setState(() {
          _isLoading = false;
          _sessions = rows;
        });
      }
    } catch (error) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _error = 'Failed to load sessions: $error';
        });
      }
    }
  }

  List<AdminSessionRecord> get _filteredSessions {
    final query = _searchQuery.trim().toLowerCase();
    return _sessions.where((session) {
      final matchesSearch = query.isEmpty ||
          session.patientName.toLowerCase().contains(query) ||
          session.specialistName.toLowerCase().contains(query);
      final matchesStatus = _statusFilter == null ||
          _statusFilter!.isEmpty ||
          (session.status ?? '').toLowerCase() == _statusFilter!.toLowerCase();
      return matchesSearch && matchesStatus;
    }).toList();
  }

  void _showSnack(
    String message, {
    bool isError = false,
    ScaffoldMessengerState? messenger,
  }) {
    (messenger ?? ScaffoldMessenger.of(context)).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? DashboardColors.highPriority : null,
      ),
    );
  }

  Future<void> _openEditDialog(AdminSessionRecord session) async {
    final messenger = ScaffoldMessenger.of(context);
    final isScheduled = _isScheduledStatus(session.status);
    final dateController = TextEditingController(
      text: _formatDateInput(session.scheduledAt),
    );
    final timeController = TextEditingController(
      text: _formatTimeInput(session.scheduledAt),
    );
    final durationController = TextEditingController(
      text: '${session.durationMinutes ?? 45}',
    );
    final locationController = TextEditingController(
      text: session.locationOrLink ?? '',
    );
    final reasonController = TextEditingController(
      text: session.cancellationReason ?? '',
    );
    var selectedStatus = session.status ?? 'scheduled';

    try {
      final saved = await showDialog<bool>(
        context: context,
        builder: (dialogContext) {
          return StatefulBuilder(
            builder: (context, setDialogState) {
              return AlertDialog(
                title: const Text('Edit Session'),
                content: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Patient: ${session.patientName}'),
                      Text('Specialist: ${session.specialistName}'),
                      const SizedBox(height: 12),
                      TextField(
                        controller: dateController,
                        decoration: const InputDecoration(
                          labelText: 'Date (YYYY-MM-DD)',
                        ),
                      ),
                      TextField(
                        controller: timeController,
                        decoration: const InputDecoration(
                          labelText: 'Time (HH:MM)',
                        ),
                      ),
                      TextField(
                        controller: durationController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'Duration (minutes)',
                        ),
                      ),
                      TextField(
                        controller: locationController,
                        decoration: const InputDecoration(
                          labelText: 'Location / Link',
                        ),
                      ),
                      if (isScheduled) ...[
                        DropdownButtonFormField<String>(
                          initialValue: selectedStatus,
                          decoration: const InputDecoration(labelText: 'Status'),
                          items: const [
                            DropdownMenuItem(
                              value: 'scheduled',
                              child: Text('Scheduled'),
                            ),
                            DropdownMenuItem(
                              value: 'completed',
                              child: Text('Completed'),
                            ),
                            DropdownMenuItem(
                              value: 'cancelled',
                              child: Text('Cancelled'),
                            ),
                            DropdownMenuItem(
                              value: 'no_show',
                              child: Text('No Show'),
                            ),
                          ],
                          onChanged: (value) {
                            if (value != null) {
                              setDialogState(() => selectedStatus = value);
                            }
                          },
                        ),
                        if (selectedStatus == 'cancelled')
                          TextField(
                            controller: reasonController,
                            decoration: const InputDecoration(
                              labelText: 'Cancellation reason',
                            ),
                          ),
                      ] else ...[
                        InputDecorator(
                          decoration: const InputDecoration(labelText: 'Status'),
                          child: Text(_formatStatusLabel(session.status)),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Status is final and cannot be changed.',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: DashboardColors.textSecondary,
                              ),
                        ),
                      ],
                    ],
                  ),
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.of(dialogContext).pop(false),
                    child: const Text('Cancel'),
                  ),
                  FilledButton(
                    onPressed: () => Navigator.of(dialogContext).pop(true),
                    child: const Text('Save'),
                  ),
                ],
              );
            },
          );
        },
      );

      if (saved != true || !mounted) {
        return;
      }

      final scheduledAt = _parseDateTime(dateController.text, timeController.text);
      if (scheduledAt == null) {
        _showSnack('Invalid date or time.', isError: true, messenger: messenger);
        return;
      }

      final duration = int.tryParse(durationController.text.trim());
      final statusToSend = isScheduled ? selectedStatus : null;

      try {
        final repo = ref.read(adminFeaturesRepositoryProvider);
        await repo.updateSession(
          id: session.id,
          scheduledAt: scheduledAt,
          durationMinutes: duration,
          locationOrLink: locationController.text.trim(),
          status: statusToSend,
          cancellationReason: isScheduled && selectedStatus == 'cancelled'
              ? reasonController.text.trim()
              : null,
        );
        if (!mounted) return;
        _showSnack('Session updated successfully.', messenger: messenger);
        await _load();
      } on DioException catch (error) {
        final repo = ref.read(adminFeaturesRepositoryProvider);
        if (!mounted) return;
        _showSnack(
          repo.readErrorMessage(error),
          isError: true,
          messenger: messenger,
        );
        await _load();
      } catch (error) {
        if (!mounted) return;
        _showSnack(
          'Failed to update session: $error',
          isError: true,
          messenger: messenger,
        );
      }
    } finally {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        dateController.dispose();
        timeController.dispose();
        durationController.dispose();
        locationController.dispose();
        reasonController.dispose();
      });
    }
  }

  Future<void> _quickAction({
    required Future<AdminSessionRecord> Function() action,
    required String successMessage,
    required String title,
    required String message,
    required String confirmLabel,
    bool isDestructive = false,
  }) async {
    final messenger = ScaffoldMessenger.of(context);
    final repo = ref.read(adminFeaturesRepositoryProvider);

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => _SessionStatusConfirmDialog(
        title: title,
        message: message,
        confirmLabel: confirmLabel,
        isDestructive: isDestructive,
        messenger: messenger,
        readErrorMessage: repo.readErrorMessage,
        onConfirm: action,
        onRejected: _load,
      ),
    );

    if (!mounted || confirmed != true) return;

    _showSnack(successMessage, messenger: messenger);
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final repo = ref.read(adminFeaturesRepositoryProvider);

    return AdminPageScaffold(
      title: 'Sessions',
      showBackButton: true,
      showBottomNav: false,
      body: _isLoading
          ? const AdminLoadingCard()
          : SingleChildScrollView(
              padding: context.dashPadding,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (_error != null)
                    AdminErrorCard(message: _error!, onRetry: _load),
                  AdminSearchField(
                    hintText: 'Search patient or specialist',
                    onChanged: (value) => setState(() => _searchQuery = value),
                  ),
                  SizedBox(height: context.dashSpacing * 0.75),
                  DropdownButtonFormField<String?>(
                    initialValue: _statusFilter,
                    decoration: const InputDecoration(labelText: 'Filter by status'),
                    items: const [
                      DropdownMenuItem<String?>(value: null, child: Text('All statuses')),
                      DropdownMenuItem(value: 'scheduled', child: Text('Scheduled')),
                      DropdownMenuItem(value: 'completed', child: Text('Completed')),
                      DropdownMenuItem(value: 'cancelled', child: Text('Cancelled')),
                      DropdownMenuItem(value: 'no_show', child: Text('No Show')),
                    ],
                    onChanged: (value) => setState(() => _statusFilter = value),
                  ),
                  SizedBox(height: context.dashSpacing),
                  if (_filteredSessions.isEmpty)
                    const AdminEmptyCard(message: 'No sessions found.')
                  else
                    ..._filteredSessions.map(
                      (session) => Padding(
                        padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                        child: AdminSurfaceCard(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(
                                    child: Text(
                                      session.patientName,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: theme.textTheme.titleMedium?.copyWith(
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Flexible(
                                    child: AdminStatusBadge.sessionStatus(
                                      session.status,
                                      isPastScheduled: _isPastScheduledNotCompleted(session),
                                    ),
                                  ),
                                ],
                              ),
                              SizedBox(height: context.dashSpacing * 0.25),
                              Text(
                                'Specialist: ${session.specialistName}',
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: DashboardColors.textSecondary,
                                ),
                              ),
                              Text(
                                _formatDateTime(session.scheduledAt),
                                style: theme.textTheme.bodyMedium,
                              ),
                              if (session.durationMinutes != null)
                                Text(
                                  'Duration: ${session.durationMinutes} min',
                                  style: theme.textTheme.bodySmall,
                                ),
                              if (session.locationOrLink != null &&
                                  session.locationOrLink!.isNotEmpty)
                                Text(
                                  session.locationOrLink!,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: DashboardColors.textSecondary,
                                  ),
                                ),
                              SizedBox(height: context.dashSpacing * 0.5),
                              Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children: [
                                  OutlinedButton.icon(
                                    onPressed: () => _openEditDialog(session),
                                    icon: const Icon(Icons.edit_outlined, size: 18),
                                    label: const Text('Edit'),
                                  ),
                                  if (_isScheduledStatus(session.status)) ...[
                                    TextButton(
                                      onPressed: () => _quickAction(
                                        action: () =>
                                            repo.completeSession(session.id),
                                        successMessage:
                                            'Session marked as completed.',
                                        title: 'Complete Session',
                                        message:
                                            'Are you sure you want to mark this session as completed?',
                                        confirmLabel: 'Complete',
                                      ),
                                      child: const Text('Complete'),
                                    ),
                                    TextButton(
                                      onPressed: () => _quickAction(
                                        action: () =>
                                            repo.cancelSession(session.id),
                                        successMessage: 'Session cancelled.',
                                        title: 'Cancel Session',
                                        message:
                                            'Are you sure you want to cancel this session?',
                                        confirmLabel: 'Cancel Session',
                                        isDestructive: true,
                                      ),
                                      child: const Text('Cancel'),
                                    ),
                                    TextButton(
                                      onPressed: () => _quickAction(
                                        action: () =>
                                            repo.markNoShow(session.id),
                                        successMessage:
                                            'Session marked as no-show.',
                                        title: 'Mark as No Show',
                                        message:
                                            'Are you sure you want to mark this session as no show?',
                                        confirmLabel: 'Mark No Show',
                                        isDestructive: true,
                                      ),
                                      child: const Text('No Show'),
                                    ),
                                  ],
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
    );
  }

  bool _isScheduledStatus(String? status) {
    return (status ?? '').toLowerCase() == 'scheduled';
  }

  bool _isPastScheduledNotCompleted(AdminSessionRecord session) {
    final scheduledAt = session.scheduledAt;
    if (scheduledAt == null) {
      return false;
    }
    return _isScheduledStatus(session.status) &&
        scheduledAt.isBefore(DateTime.now());
  }

  String _formatStatusLabel(String? status) {
    switch ((status ?? '').toLowerCase()) {
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'no_show':
        return 'No Show';
      case 'scheduled':
        return 'Scheduled';
      default:
        return status ?? 'Unknown';
    }
  }

  String _formatDateTime(DateTime? date) {
    if (date == null) {
      return 'Unknown date';
    }
    final local = date.toLocal();
    return '${local.day}/${local.month}/${local.year} ${local.hour.toString().padLeft(2, '0')}:${local.minute.toString().padLeft(2, '0')}';
  }

  String _formatDateInput(DateTime? date) {
    if (date == null) {
      return '';
    }
    final local = date.toLocal();
    return '${local.year}-${local.month.toString().padLeft(2, '0')}-${local.day.toString().padLeft(2, '0')}';
  }

  String _formatTimeInput(DateTime? date) {
    if (date == null) {
      return '';
    }
    final local = date.toLocal();
    return '${local.hour.toString().padLeft(2, '0')}:${local.minute.toString().padLeft(2, '0')}';
  }

  DateTime? _parseDateTime(String dateText, String timeText) {
    final parts = dateText.trim().split('-');
    final timeParts = timeText.trim().split(':');
    if (parts.length != 3 || timeParts.length < 2) {
      return null;
    }

    final year = int.tryParse(parts[0]);
    final month = int.tryParse(parts[1]);
    final day = int.tryParse(parts[2]);
    final hour = int.tryParse(timeParts[0]);
    final minute = int.tryParse(timeParts[1]);

    if (year == null ||
        month == null ||
        day == null ||
        hour == null ||
        minute == null) {
      return null;
    }

    return DateTime(year, month, day, hour, minute);
  }
}

class _SessionStatusConfirmDialog extends StatefulWidget {
  const _SessionStatusConfirmDialog({
    required this.title,
    required this.message,
    required this.confirmLabel,
    required this.messenger,
    required this.readErrorMessage,
    required this.onConfirm,
    this.onRejected,
    this.isDestructive = false,
  });

  final String title;
  final String message;
  final String confirmLabel;
  final ScaffoldMessengerState messenger;
  final String Function(DioException error) readErrorMessage;
  final Future<AdminSessionRecord> Function() onConfirm;
  final Future<void> Function()? onRejected;
  final bool isDestructive;

  @override
  State<_SessionStatusConfirmDialog> createState() =>
      _SessionStatusConfirmDialogState();
}

class _SessionStatusConfirmDialogState
    extends State<_SessionStatusConfirmDialog> {
  bool _submitting = false;

  Future<void> _onConfirmPressed() async {
    if (_submitting) return;

    setState(() => _submitting = true);

    try {
      await widget.onConfirm();
      if (!mounted) return;
      Navigator.of(context).pop(true);
    } on DioException catch (error) {
      if (!mounted) return;
      setState(() => _submitting = false);
      widget.messenger.showSnackBar(
        SnackBar(
          content: Text(widget.readErrorMessage(error)),
          backgroundColor: DashboardColors.highPriority,
        ),
      );
      await widget.onRejected?.call();
    } catch (error) {
      if (!mounted) return;
      setState(() => _submitting = false);
      widget.messenger.showSnackBar(
        SnackBar(
          content: Text('Action failed: $error'),
          backgroundColor: DashboardColors.highPriority,
        ),
      );
      await widget.onRejected?.call();
    }
  }

  void _onCancelPressed() {
    if (_submitting) return;
    Navigator.of(context).pop(false);
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: !_submitting,
      child: AlertDialog(
        title: Text(widget.title),
        content: Text(widget.message),
        actions: [
          TextButton(
            onPressed: _submitting ? null : _onCancelPressed,
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: _submitting ? null : _onConfirmPressed,
            style: widget.isDestructive
                ? FilledButton.styleFrom(
                    backgroundColor: DashboardColors.highPriority,
                  )
                : null,
            child: _submitting
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : Text(widget.confirmLabel),
          ),
        ],
      ),
    );
  }
}
