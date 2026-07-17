import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/admin_dashboard_colors.dart';
import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../../case_intake/models/case_intake_request_model.dart';
import '../../models/specialist_patient_details_models.dart';
import '../../providers/specialist_patient_details_provider.dart';
import '../../widgets/admin_page_scaffold.dart';
import '../../widgets/admin_ui_components.dart';
import '../../widgets/dashboard_layout.dart';
import '../shared/patient_details_body.dart';

class AdminPatientDetailsScreen extends ConsumerStatefulWidget {
  const AdminPatientDetailsScreen({super.key, required this.patientId});

  final String patientId;

  @override
  ConsumerState<AdminPatientDetailsScreen> createState() =>
      _AdminPatientDetailsScreenState();
}

class _AdminPatientDetailsScreenState
    extends ConsumerState<AdminPatientDetailsScreen> {
  bool _patientUpdated = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref
          .read(specialistPatientDetailsProvider(widget.patientId).notifier)
          .initialize();
    });
  }

  void _popDetails() {
    context.pop(_patientUpdated);
  }

  Future<void> _openEditPatient(PatientProfile patient) async {
    final messenger = ScaffoldMessenger.of(context);
    final saved = await showDialog<bool>(
      context: context,
      builder: (_) => _EditPatientDialog(
        patient: patient,
        messenger: messenger,
        onSave: ({
          required String fullName,
          DateTime? dateOfBirth,
          String? gender,
        }) {
          return ref
              .read(specialistPatientDetailsProvider(widget.patientId).notifier)
              .updatePatient(
                fullName: fullName,
                dateOfBirth: dateOfBirth,
                gender: gender,
              );
        },
      ),
    );

    if (!mounted || saved != true) return;
    _patientUpdated = true;
    messenger.showSnackBar(
      const SnackBar(content: Text('Patient updated successfully.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistPatientDetailsProvider(widget.patientId));
    final data = state.data;

    Widget body;
    if (state.isLoading && data == null) {
      body = const Center(child: AdminLoadingCard());
    } else if (state.errorMessage != null && data == null) {
      body = Padding(
        padding: context.dashPadding,
        child: AdminErrorCard(
          message: state.errorMessage!,
          onRetry: () => ref
              .read(specialistPatientDetailsProvider(widget.patientId).notifier)
              .refresh(),
        ),
      );
    } else if (data == null) {
      body = Padding(
        padding: context.dashPadding,
        child: const AdminEmptyCard(message: 'Patient not found.'),
      );
    } else {
      body = RefreshIndicator(
        onRefresh: () => ref
            .read(specialistPatientDetailsProvider(widget.patientId).notifier)
            .refresh(),
        color: AdminDashboardColors.primary,
        child: PatientDetailsBody(
          patientId: widget.patientId,
          data: data,
          showSpecialistWorkflowActions: false,
          onReportsTap: () => context.push(AppRoutes.adminReports),
          footer: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              FilledButton.icon(
                onPressed: () => _openEditPatient(data.patient),
                icon: const Icon(Icons.edit_outlined),
                label: const Text('Edit Patient'),
                style: FilledButton.styleFrom(
                  backgroundColor: AdminDashboardColors.primary,
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.symmetric(
                    vertical: context.dashSpacing * 0.65,
                  ),
                ),
              ),
              SizedBox(height: context.dashSpacing * 0.5),
              OutlinedButton.icon(
                onPressed: () =>
                    context.push(AppRoutes.adminPatientAssignments),
                icon: const Icon(Icons.assignment_ind_outlined),
                label: const Text('Patient Assignments'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AdminDashboardColors.primary,
                  side: const BorderSide(color: AdminDashboardColors.primary),
                  padding: EdgeInsets.symmetric(
                    vertical: context.dashSpacing * 0.65,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        _popDetails();
      },
      child: AdminPageScaffold(
        title: data?.patient.fullName ?? 'Patient Details',
        showBackButton: true,
        onBackPressed: _popDetails,
        actions: [
          if (data != null)
            IconButton(
              tooltip: 'Edit Patient',
              onPressed: () => _openEditPatient(data.patient),
              icon: const Icon(Icons.edit_outlined, color: Colors.white),
            ),
        ],
        body: body,
      ),
    );
  }
}

class _EditPatientDialog extends StatefulWidget {
  const _EditPatientDialog({
    required this.patient,
    required this.messenger,
    required this.onSave,
  });

  final PatientProfile patient;
  final ScaffoldMessengerState messenger;
  final Future<String?> Function({
    required String fullName,
    DateTime? dateOfBirth,
    String? gender,
  }) onSave;

  @override
  State<_EditPatientDialog> createState() => _EditPatientDialogState();
}

class _EditPatientDialogState extends State<_EditPatientDialog> {
  late final TextEditingController _nameController;
  late DateTime? _dateOfBirth;
  late CaseIntakeGender? _gender;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.patient.fullName);
    _dateOfBirth = widget.patient.dateOfBirth;
    _gender = CaseIntakeGender.fromApi(widget.patient.gender);
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    if (_submitting) return;
    final now = DateTime.now();
    final initial = _dateOfBirth ?? DateTime(now.year - 5, now.month, now.day);
    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(now.year - 100),
      lastDate: now,
    );
    if (!mounted || picked == null) return;
    setState(() => _dateOfBirth = picked);
  }

  Future<void> _submit() async {
    if (_submitting) return;

    FocusManager.instance.primaryFocus?.unfocus();
    FocusManager.instance.applyFocusChangesIfNeeded();

    setState(() => _submitting = true);

    final error = await widget.onSave(
      fullName: _nameController.text.trim(),
      dateOfBirth: _dateOfBirth,
      gender: _gender?.apiValue,
    );

    if (!mounted) return;

    if (error != null) {
      setState(() => _submitting = false);
      widget.messenger.showSnackBar(
        SnackBar(
          content: Text(error),
          backgroundColor: AdminDashboardColors.danger,
        ),
      );
      return;
    }

    Navigator.of(context).pop(true);
  }

  void _cancel() {
    if (_submitting) return;
    FocusManager.instance.primaryFocus?.unfocus();
    FocusManager.instance.applyFocusChangesIfNeeded();
    Navigator.of(context).pop(false);
  }

  @override
  Widget build(BuildContext context) {
    final dateLabel = _dateOfBirth == null
        ? 'Select date of birth'
        : DateFormat('yyyy-MM-dd').format(_dateOfBirth!);

    return PopScope(
      canPop: !_submitting,
      child: AlertDialog(
        title: const Text('Edit Patient'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: _nameController,
                enabled: !_submitting,
                decoration: const InputDecoration(labelText: 'Full Name'),
              ),
              const SizedBox(height: 12),
              InkWell(
                onTap: _submitting ? null : _pickDate,
                child: InputDecorator(
                  decoration: const InputDecoration(
                    labelText: 'Date of Birth',
                    suffixIcon: Icon(Icons.calendar_today_outlined),
                  ),
                  child: Text(
                    dateLabel,
                    style: TextStyle(
                      color: _dateOfBirth != null
                          ? DashboardColors.textPrimary
                          : DashboardColors.textMuted,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<CaseIntakeGender?>(
                initialValue: _gender,
                decoration: const InputDecoration(labelText: 'Gender'),
                items: [
                  const DropdownMenuItem<CaseIntakeGender?>(
                    value: null,
                    child: Text('Not specified'),
                  ),
                  ...CaseIntakeGender.values.map(
                    (gender) => DropdownMenuItem<CaseIntakeGender?>(
                      value: gender,
                      child: Text(gender.label),
                    ),
                  ),
                ],
                onChanged: _submitting
                    ? null
                    : (value) => setState(() => _gender = value),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: _submitting ? null : _cancel,
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: _submitting ? null : _submit,
            child: _submitting
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Text('Save'),
          ),
        ],
      ),
    );
  }
}
