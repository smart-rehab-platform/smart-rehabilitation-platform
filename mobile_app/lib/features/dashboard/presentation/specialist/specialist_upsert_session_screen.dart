import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../auth/providers/auth_provider.dart';
import '../../models/specialist_feature_models.dart';
import '../../providers/specialist_dashboard_provider.dart';
import '../../providers/specialist_features_provider.dart';
import '../../providers/specialist_sessions_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_page_scaffold.dart';
import 'manage_goals_widgets.dart';

/// Create or edit a specialist therapy session using backend session fields.
class SpecialistUpsertSessionScreen extends ConsumerStatefulWidget {
  const SpecialistUpsertSessionScreen({
    super.key,
    this.sessionId,
    this.initialPatientId,
    this.initialSessionNotes,
  });

  final String? sessionId;
  final String? initialPatientId;
  final String? initialSessionNotes;

  bool get isEditing => sessionId != null && sessionId!.trim().isNotEmpty;

  @override
  ConsumerState<SpecialistUpsertSessionScreen> createState() =>
      _SpecialistUpsertSessionScreenState();
}

class _SpecialistUpsertSessionScreenState
    extends ConsumerState<SpecialistUpsertSessionScreen> {
  final _durationController = TextEditingController(text: '45');
  final _locationController = TextEditingController();
  final _notesController = TextEditingController();
  final _titleController = TextEditingController(text: 'Therapy Session');

  late DateTime _scheduledDate;
  late TimeOfDay _scheduledTime;

  String? _selectedPatientId;
  bool _isLoading = false;
  bool _isSaving = false;
  String? _loadError;
  String? _patientError;
  String? _dateError;
  String? _durationError;
  String? _titleError;
  String? _apiError;
  SpecialistSessionDetail? _existingSession;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _scheduledDate = DateTime(
      now.year,
      now.month,
      now.day,
    ).add(const Duration(days: 1));
    _scheduledTime = const TimeOfDay(hour: 9, minute: 0);
    _selectedPatientId = widget.initialPatientId?.trim().isNotEmpty == true
        ? widget.initialPatientId!.trim()
        : null;
    final initialNotes = widget.initialSessionNotes?.trim();
    if (initialNotes != null && initialNotes.isNotEmpty) {
      _notesController.text = initialNotes;
    }

    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistPatientsProvider.notifier).initialize();
      if (widget.isEditing) {
        _loadExistingSession();
      }
    });
  }

  @override
  void dispose() {
    _durationController.dispose();
    _locationController.dispose();
    _notesController.dispose();
    _titleController.dispose();
    super.dispose();
  }

  DateTime get _scheduledDateTime => DateTime(
    _scheduledDate.year,
    _scheduledDate.month,
    _scheduledDate.day,
    _scheduledTime.hour,
    _scheduledTime.minute,
  );

  Future<void> _loadExistingSession() async {
    setState(() {
      _isLoading = true;
      _loadError = null;
    });

    try {
      final token = ref.read(authProvider).token;
      if (token != null && token.isNotEmpty) {
        ref.read(authRepositoryProvider).setAuthToken(token);
      }

      final session = await ref
          .read(specialistFeaturesRepositoryProvider)
          .fetchSessionById(widget.sessionId!);

      if (!mounted) return;

      if (!session.canModify) {
        setState(() {
          _isLoading = false;
          _loadError =
              'This session is ${session.displayStatus.label.toLowerCase()} and cannot be edited.';
          _existingSession = session;
        });
        return;
      }

      final scheduled = session.scheduledAt ?? DateTime.now();
      setState(() {
        _existingSession = session;
        _selectedPatientId = session.patientId;
        _titleController.text = session.sessionType;
        _scheduledDate = DateTime(
          scheduled.year,
          scheduled.month,
          scheduled.day,
        );
        _scheduledTime = TimeOfDay(
          hour: scheduled.hour,
          minute: scheduled.minute,
        );
        _durationController.text = '${session.durationMinutes ?? 45}';
        _locationController.text = session.location ?? '';
        _isLoading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _loadError = error.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _scheduledDate,
      firstDate: DateTime(now.year, now.month, now.day),
      lastDate: DateTime(now.year + 2),
    );
    if (picked != null) {
      setState(() {
        _scheduledDate = picked;
        _dateError = null;
      });
    }
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _scheduledTime,
    );
    if (picked != null) {
      setState(() {
        _scheduledTime = picked;
        _dateError = null;
      });
    }
  }

  bool _validate() {
    var isValid = true;
    String? patientError;
    String? dateError;
    String? durationError;
    String? titleError;

    if (_titleController.text.trim().isEmpty) {
      titleError = 'Enter a session type or title.';
      isValid = false;
    }

    if (!widget.isEditing &&
        (_selectedPatientId == null || _selectedPatientId!.isEmpty)) {
      patientError = 'Select an assigned patient.';
      isValid = false;
    }

    final duration = int.tryParse(_durationController.text.trim());
    if (duration == null || duration < 1 || duration > 480) {
      durationError = 'Duration must be between 1 and 480 minutes.';
      isValid = false;
    }

    if (!_scheduledDateTime.isAfter(DateTime.now())) {
      dateError = 'Scheduled date and time must be in the future.';
      isValid = false;
    }

    setState(() {
      _patientError = patientError;
      _dateError = dateError;
      _durationError = durationError;
      _titleError = titleError;
      _apiError = null;
    });

    return isValid;
  }

  Future<void> _refreshRelatedProviders() async {
    await Future.wait([
      ref.read(specialistSessionsProvider.notifier).refresh(),
      ref.read(specialistDashboardProvider.notifier).refresh(),
    ]);
  }

  Future<void> _submit() async {
    if (_isSaving || !_validate()) {
      return;
    }

    final specialistId = ref.read(authProvider).user?.id?.trim() ?? '';
    if (specialistId.isEmpty) {
      setState(() => _apiError = 'Please sign in to continue.');
      return;
    }

    final duration = int.parse(_durationController.text.trim());
    final location = _locationController.text.trim();

    setState(() {
      _isSaving = true;
      _apiError = null;
    });

    try {
      final token = ref.read(authProvider).token;
      if (token != null && token.isNotEmpty) {
        ref.read(authRepositoryProvider).setAuthToken(token);
      }

      final repo = ref.read(specialistFeaturesRepositoryProvider);

      if (widget.isEditing) {
        await repo.updateSession(
          sessionId: widget.sessionId!,
          scheduledAt: _scheduledDateTime,
          durationMinutes: duration,
          locationOrLink: location,
        );
      } else {
        await repo.createSession(
          patientId: _selectedPatientId!,
          specialistId: specialistId,
          scheduledAt: _scheduledDateTime,
          durationMinutes: duration,
          locationOrLink: location.isEmpty ? null : location,
        );
      }

      await _refreshRelatedProviders();
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            widget.isEditing
                ? 'Session updated successfully.'
                : 'Session scheduled successfully.',
          ),
        ),
      );
      context.pop(true);
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _isSaving = false;
        _apiError = error.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final patientsState = ref.watch(specialistPatientsProvider);
    final patients = patientsState.items;
    final title = widget.isEditing ? 'Edit Session' : 'Schedule Session';

    return SpecialistPageScaffold(
      title: title,
      showBackButton: true,
      body: _isLoading
          ? const Center(child: DashboardLoadingCard())
          : _loadError != null
          ? Padding(
              padding: context.dashPadding,
              child: DashboardErrorCard(
                message: _loadError!,
                onRetry: _loadExistingSession,
              ),
            )
          : SingleChildScrollView(
              padding: context.dashPadding,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    widget.isEditing
                        ? 'Update the session schedule details.'
                        : 'Schedule a session for one of your assigned patients.',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: DashboardColors.textSecondary,
                    ),
                  ),
                  SizedBox(height: context.dashSpacing),
                  if (widget.isEditing) ...[
                    DashboardSurfaceCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Patient',
                            style: theme.textTheme.labelSmall?.copyWith(
                              color: DashboardColors.textMuted,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          SizedBox(height: context.dashSpacing * 0.2),
                          Text(
                            _existingSession?.patientName ?? 'Patient',
                            style: theme.textTheme.bodyLarge?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ] else ...[
                    Text(
                      'Patient',
                      style: theme.textTheme.bodySmall?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    SizedBox(height: context.dashSpacing * 0.35),
                    if (patientsState.isLoading)
                      const LinearProgressIndicator()
                    else if (patients.isEmpty)
                      const DashboardEmptyCard(
                        message:
                            'No assigned patients found. Assign a patient before scheduling.',
                      )
                    else
                      DropdownButtonFormField<String>(
                        initialValue:
                            patients.any((p) => p.id == _selectedPatientId)
                            ? _selectedPatientId
                            : null,
                        decoration: goalFieldDecoration(
                          'Select patient',
                        ).copyWith(errorText: _patientError),
                        items: patients
                            .map(
                              (patient) => DropdownMenuItem(
                                value: patient.id,
                                child: Text(patient.name),
                              ),
                            )
                            .toList(),
                        onChanged: _isSaving
                            ? null
                            : (value) {
                                setState(() {
                                  _selectedPatientId = value;
                                  _patientError = null;
                                });
                              },
                      ),
                  ],
                  SizedBox(height: context.dashSpacing * 0.75),
                  Text(
                    'Session type / title',
                    style: theme.textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.35),
                  TextField(
                    controller: _titleController,
                    enabled: !_isSaving,
                    decoration: goalFieldDecoration(
                      'Therapy Session',
                    ).copyWith(errorText: _titleError),
                  ),
                  SizedBox(height: context.dashSpacing * 0.75),
                  DashboardSurfaceCard(
                    onTap: _isSaving ? null : _pickDate,
                    child: _PickerRow(
                      label: 'Date',
                      value: DateFormat('MMM d, yyyy').format(_scheduledDate),
                      icon: Icons.calendar_today_outlined,
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.55),
                  DashboardSurfaceCard(
                    onTap: _isSaving ? null : _pickTime,
                    child: _PickerRow(
                      label: 'Start time',
                      value: _scheduledTime.format(context),
                      icon: Icons.access_time_rounded,
                    ),
                  ),
                  if (_dateError != null) ...[
                    SizedBox(height: context.dashSpacing * 0.35),
                    Text(
                      _dateError!,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: DashboardColors.highPriority,
                      ),
                    ),
                  ],
                  SizedBox(height: context.dashSpacing * 0.75),
                  Text(
                    'Duration (minutes)',
                    style: theme.textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.35),
                  TextField(
                    controller: _durationController,
                    enabled: !_isSaving,
                    keyboardType: TextInputType.number,
                    decoration: goalFieldDecoration(
                      '45',
                    ).copyWith(errorText: _durationError),
                  ),
                  SizedBox(height: context.dashSpacing * 0.75),
                  Text(
                    'Location or meeting link',
                    style: theme.textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.35),
                  TextField(
                    controller: _locationController,
                    enabled: !_isSaving,
                    decoration: goalFieldDecoration('Clinic room or https://…'),
                  ),
                  SizedBox(height: context.dashSpacing * 0.75),
                  Text(
                    'Notes (optional)',
                    style: theme.textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.35),
                  TextField(
                    controller: _notesController,
                    enabled: !_isSaving,
                    maxLines: 3,
                    decoration: goalFieldDecoration(
                      'Additional details for this session',
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.2),
                  Text(
                    'Title and notes are kept for this form. The server stores patient, schedule, duration, and location/link.',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: DashboardColors.textMuted,
                    ),
                  ),
                  if (_apiError != null) ...[
                    SizedBox(height: context.dashSpacing * 0.75),
                    Text(
                      _apiError!,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: DashboardColors.highPriority,
                      ),
                    ),
                  ],
                  SizedBox(height: context.dashSpacing),
                  FilledButton(
                    onPressed:
                        _isSaving || (!widget.isEditing && patients.isEmpty)
                        ? null
                        : _submit,
                    child: _isSaving
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : Text(
                            widget.isEditing
                                ? 'Save Changes'
                                : 'Schedule Session',
                          ),
                  ),
                  SizedBox(height: context.dashSpacing),
                ],
              ),
            ),
    );
  }
}

class _PickerRow extends StatelessWidget {
  const _PickerRow({
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
        Icon(icon, color: DashboardColors.primary, size: 20),
      ],
    );
  }
}
