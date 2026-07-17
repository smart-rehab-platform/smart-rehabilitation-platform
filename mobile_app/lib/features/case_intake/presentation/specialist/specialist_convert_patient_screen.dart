import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../dashboard/widgets/dashboard_bottom_nav.dart';
import '../../../dashboard/widgets/dashboard_layout.dart';
import '../../../dashboard/widgets/dashboard_surface_card.dart';
import '../../../dashboard/widgets/parent_dashboard_cards.dart';
import '../../../dashboard/widgets/specialist_page_scaffold.dart';
import '../../models/case_intake_request_model.dart';
import '../../models/convert_patient_result_model.dart';
import '../../providers/specialist_case_request_detail_provider.dart';

class SpecialistConvertPatientScreen extends ConsumerStatefulWidget {
  const SpecialistConvertPatientScreen({super.key, required this.requestId});

  final String requestId;

  @override
  ConsumerState<SpecialistConvertPatientScreen> createState() =>
      _SpecialistConvertPatientScreenState();
}

class _SpecialistConvertPatientScreenState
    extends ConsumerState<SpecialistConvertPatientScreen> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();

  DateTime? _dateOfBirth;
  CaseIntakeGender? _gender;
  ConvertPatientRelationship? _relationship;
  bool _isPrimaryContact = true;
  bool _formSeeded = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final state = ref.read(
        specialistCaseRequestDetailProvider(widget.requestId),
      );
      if (state.detail == null && !state.isLoading) {
        ref
            .read(
              specialistCaseRequestDetailProvider(widget.requestId).notifier,
            )
            .initialize();
      }
    });
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    super.dispose();
  }

  void _seedForm(CaseIntakeRequest request) {
    _fullNameController.text = request.childName;
    _dateOfBirth = request.dateOfBirth;
    _gender = CaseIntakeGender.fromApi(request.gender);
    _isPrimaryContact = true;
    _formSeeded = true;
  }

  Future<void> _pickDateOfBirth() async {
    final now = DateTime.now();
    final initial = _dateOfBirth ?? DateTime(now.year - 5, now.month, now.day);
    final picked = await showDatePicker(
      context: context,
      initialDate: initial.isAfter(now) ? now : initial,
      firstDate: DateTime(1950),
      lastDate: now,
    );
    if (picked == null || !mounted) {
      return;
    }
    setState(() => _dateOfBirth = picked);
  }

  Future<bool?> _showCreateConfirmDialog() {
    final theme = Theme.of(context);
    return showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Create Patient Profile'),
          content: Text(
            'The child profile will now be created.\n\n'
            'You can continue adding diagnosis, treatment plans and goals afterwards.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(false),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(dialogContext).pop(true),
              child: const Text('Create'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _onCreatePressed() async {
    final state = ref.read(
      specialistCaseRequestDetailProvider(widget.requestId),
    );
    if (state.hasActiveMutation) {
      return;
    }

    final form = _formKey.currentState;
    if (form == null || !form.validate()) {
      return;
    }
    if (_dateOfBirth == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Date of birth is required.')),
      );
      return;
    }
    if (_gender == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Gender is required.')));
      return;
    }
    if (_relationship == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Relationship is required.')),
      );
      return;
    }

    final confirmed = await _showCreateConfirmDialog();
    if (confirmed != true || !mounted) {
      return;
    }

    final input = ConvertToPatientInput(
      fullName: _fullNameController.text.trim(),
      dateOfBirth: DateFormat('yyyy-MM-dd').format(_dateOfBirth!),
      gender: _gender!.apiValue,
      relationship: _relationship!.apiValue,
      isPrimaryContact: _isPrimaryContact,
    );

    final success = await ref
        .read(specialistCaseRequestDetailProvider(widget.requestId).notifier)
        .convertToPatient(input);
    if (!mounted) {
      return;
    }

    final actionState = ref.read(
      specialistCaseRequestDetailProvider(widget.requestId),
    );

    if (success) {
      context.pop(true);
      return;
    }

    final message = actionState.actionErrorMessage;
    if (message != null && message.isNotEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(message)));
      ref
          .read(specialistCaseRequestDetailProvider(widget.requestId).notifier)
          .clearActionError();
    }
  }

  void _blockBackWhileConverting() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text(
          'Please wait while the patient profile is being created.',
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(
      specialistCaseRequestDetailProvider(widget.requestId),
    );
    final detail = state.detail;
    final converting = state.isConverting;
    final theme = Theme.of(context);

    ref.listen(specialistCaseRequestDetailProvider(widget.requestId), (
      previous,
      next,
    ) {
      final request = next.detail?.request;
      if (request == null || _formSeeded) {
        return;
      }
      if (request.status != CaseIntakeStatus.accepted) {
        return;
      }
      setState(() => _seedForm(request));
    });

    if (!_formSeeded && detail?.request.status == CaseIntakeStatus.accepted) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted || _formSeeded) {
          return;
        }
        setState(() => _seedForm(detail!.request));
      });
    }

    final isInitialLoading = state.isLoading && detail == null;
    final isWrongStatus =
        detail != null && detail.request.status != CaseIntakeStatus.accepted;

    return PopScope(
      canPop: !converting,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop || !converting) {
          return;
        }
        _blockBackWhileConverting();
      },
      child: SpecialistPageScaffold(
        title: 'Review Patient Information',
        showBackButton: true,
        currentNav: DashboardNavItem.more,
        onBackPressed: converting
            ? _blockBackWhileConverting
            : () => context.pop(),
        body: isInitialLoading
            ? const DashboardLoadingCard(message: 'Loading case request...')
            : detail == null
            ? ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: context.dashPadding,
                children: [
                  DashboardErrorCard(
                    message: state.errorMessage ?? 'Case request not found.',
                    onRetry: () => ref
                        .read(
                          specialistCaseRequestDetailProvider(
                            widget.requestId,
                          ).notifier,
                        )
                        .retry(),
                  ),
                  SizedBox(height: context.dashSpacing),
                  OutlinedButton(
                    onPressed: () => context.pop(),
                    child: const Text('Back'),
                  ),
                ],
              )
            : isWrongStatus
            ? ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: context.dashPadding,
                children: [
                  DashboardErrorCard(
                    message:
                        'Only accepted case requests can be converted to a patient.',
                    onRetry: () => ref
                        .read(
                          specialistCaseRequestDetailProvider(
                            widget.requestId,
                          ).notifier,
                        )
                        .refresh(),
                  ),
                  SizedBox(height: context.dashSpacing),
                  OutlinedButton(
                    onPressed: () => context.pop(),
                    child: const Text('Back'),
                  ),
                ],
              )
            : Form(
                key: _formKey,
                child: ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: context.dashPadding,
                  children: [
                    Text(
                      'Please verify the child\'s information before creating the patient profile.',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: DashboardColors.textSecondary,
                      ),
                    ),
                    SizedBox(height: context.dashSpacing),
                    DashboardSurfaceCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Text(
                            'Child Profile',
                            style: theme.textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          SizedBox(height: context.dashSpacing * 0.75),
                          TextFormField(
                            controller: _fullNameController,
                            enabled: !converting,
                            maxLength: 150,
                            textCapitalization: TextCapitalization.words,
                            decoration: const InputDecoration(
                              labelText: 'Full Name',
                              border: OutlineInputBorder(),
                            ),
                            validator: (value) {
                              final trimmed = value?.trim() ?? '';
                              if (trimmed.isEmpty) {
                                return 'Full name is required.';
                              }
                              if (trimmed.length > 150) {
                                return 'Full name must not exceed 150 characters.';
                              }
                              return null;
                            },
                          ),
                          SizedBox(height: context.dashSpacing * 0.55),
                          FormField<DateTime>(
                            initialValue: _dateOfBirth,
                            validator: (value) {
                              final dob = value ?? _dateOfBirth;
                              if (dob == null) {
                                return 'Date of birth is required.';
                              }
                              final today = DateTime.now();
                              final dobDay = DateTime(
                                dob.year,
                                dob.month,
                                dob.day,
                              );
                              final todayDay = DateTime(
                                today.year,
                                today.month,
                                today.day,
                              );
                              if (dobDay.isAfter(todayDay)) {
                                return 'Date of birth cannot be in the future.';
                              }
                              return null;
                            },
                            builder: (field) {
                              return InputDecorator(
                                decoration: InputDecoration(
                                  labelText: 'Date of Birth',
                                  border: const OutlineInputBorder(),
                                  errorText: field.errorText,
                                ),
                                child: InkWell(
                                  onTap: converting
                                      ? null
                                      : () async {
                                          await _pickDateOfBirth();
                                          field.didChange(_dateOfBirth);
                                        },
                                  child: Padding(
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 12,
                                    ),
                                    child: Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            _dateOfBirth != null
                                                ? DateFormat(
                                                    'MMM d, yyyy',
                                                  ).format(_dateOfBirth!)
                                                : 'Select date of birth',
                                            style: theme.textTheme.bodyMedium
                                                ?.copyWith(
                                                  color: _dateOfBirth != null
                                                      ? DashboardColors
                                                            .textPrimary
                                                      : DashboardColors
                                                            .textMuted,
                                                ),
                                          ),
                                        ),
                                        const Icon(
                                          Icons.calendar_today_outlined,
                                          size: 18,
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                          SizedBox(height: context.dashSpacing * 0.55),
                          DropdownButtonFormField<CaseIntakeGender>(
                            key: ValueKey('gender-${_gender?.apiValue}'),
                            initialValue: _gender,
                            decoration: const InputDecoration(
                              labelText: 'Gender',
                              border: OutlineInputBorder(),
                            ),
                            items: CaseIntakeGender.values
                                .map(
                                  (gender) => DropdownMenuItem(
                                    value: gender,
                                    child: Text(gender.label),
                                  ),
                                )
                                .toList(),
                            onChanged: converting
                                ? null
                                : (value) => setState(() => _gender = value),
                            validator: (value) {
                              if (value == null) {
                                return 'Gender is required.';
                              }
                              return null;
                            },
                          ),
                          SizedBox(height: context.dashSpacing * 0.55),
                          DropdownButtonFormField<ConvertPatientRelationship>(
                            key: ValueKey(
                              'relationship-${_relationship?.apiValue}',
                            ),
                            initialValue: _relationship,
                            decoration: const InputDecoration(
                              labelText: 'Relationship',
                              border: OutlineInputBorder(),
                            ),
                            items: ConvertPatientRelationship.values
                                .map(
                                  (item) => DropdownMenuItem(
                                    value: item,
                                    child: Text(item.label),
                                  ),
                                )
                                .toList(),
                            onChanged: converting
                                ? null
                                : (value) =>
                                      setState(() => _relationship = value),
                            validator: (value) {
                              if (value == null) {
                                return 'Relationship is required.';
                              }
                              return null;
                            },
                          ),
                          SizedBox(height: context.dashSpacing * 0.35),
                          SwitchListTile.adaptive(
                            contentPadding: EdgeInsets.zero,
                            title: const Text('Primary Contact'),
                            value: _isPrimaryContact,
                            onChanged: converting
                                ? null
                                : (value) =>
                                      setState(() => _isPrimaryContact = value),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: context.dashSpacing),
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton(
                        onPressed: converting ? null : _onCreatePressed,
                        child: converting
                            ? Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: theme.colorScheme.onPrimary,
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Text(
                                    'Creating...',
                                    style: theme.textTheme.labelLarge?.copyWith(
                                      fontWeight: FontWeight.w700,
                                      color: theme.colorScheme.onPrimary,
                                    ),
                                  ),
                                ],
                              )
                            : const Text('Create Patient Profile'),
                      ),
                    ),
                    SizedBox(height: context.dashSpacing * 1.5),
                  ],
                ),
              ),
      ),
    );
  }
}
