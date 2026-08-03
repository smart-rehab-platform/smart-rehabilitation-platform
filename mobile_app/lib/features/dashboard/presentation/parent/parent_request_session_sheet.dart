import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../models/admin_assignments_models.dart';
import '../../models/parent_dashboard_models.dart';
import '../../models/session_requests_models.dart';
import '../../providers/session_requests_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/parent_dashboard_cards.dart';
import 'parent_sessions_localization_utils.dart';

Future<void> showParentRequestSessionSheet(BuildContext context) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (sheetContext) => const ParentRequestSessionSheet(),
  );
}

class ParentRequestSessionSheet extends ConsumerStatefulWidget {
  const ParentRequestSessionSheet({super.key});

  @override
  ConsumerState<ParentRequestSessionSheet> createState() =>
      _ParentRequestSessionSheetState();
}

class _ParentRequestSessionSheetState
    extends ConsumerState<ParentRequestSessionSheet> {
  final _notesController = TextEditingController();
  final _otherReasonController = TextEditingController();

  List<ParentChild> _children = const [];
  List<PatientSpecialistLink> _specialists = const [];

  ParentChild? _selectedChild;
  PatientSpecialistLink? _selectedSpecialist;
  SessionRequestReason? _selectedReason;
  PreferredTimePeriod? _selectedTimePeriod;
  DateTime? _selectedDate;

  bool _isLoadingChildren = true;
  bool _isLoadingSpecialists = false;
  String? _loadError;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadChildren());
  }

  @override
  void dispose() {
    _notesController.dispose();
    _otherReasonController.dispose();
    super.dispose();
  }

  Future<void> _loadChildren() async {
    setState(() {
      _isLoadingChildren = true;
      _loadError = null;
    });

    try {
      final children = await ref
          .read(sessionRequestsProvider.notifier)
          .resolveChildren();
      if (!mounted) {
        return;
      }

      setState(() {
        _children = children;
        _selectedChild = children.length == 1 ? children.first : null;
        _isLoadingChildren = false;
      });

      if (_selectedChild != null) {
        await _loadSpecialists(_selectedChild!.id);
      }
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _isLoadingChildren = false;
        _loadError = 'Failed to load children: $error';
      });
    }
  }

  Future<void> _loadSpecialists(String patientId) async {
    setState(() {
      _isLoadingSpecialists = true;
      _selectedSpecialist = null;
    });

    final specialists = await ref
        .read(sessionRequestsProvider.notifier)
        .fetchSpecialistsForPatient(patientId);

    if (!mounted) {
      return;
    }

    PatientSpecialistLink? selected;
    if (specialists.length == 1) {
      selected = specialists.first;
    } else if (specialists.isNotEmpty) {
      selected = specialists.firstWhere(
        (item) => item.isPrimary,
        orElse: () => specialists.first,
      );
    }

    setState(() {
      _specialists = specialists;
      _selectedSpecialist = selected;
      _isLoadingSpecialists = false;
    });
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);

    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? today,
      firstDate: today,
      lastDate: DateTime(now.year + 2),
    );

    if (picked != null) {
      setState(() => _selectedDate = picked);
    }
  }

  String? _validateForm(AppLocalizations l10n) {
    if (_selectedChild == null) {
      return l10n.parentSessionRequestSelectChild;
    }
    if (_selectedSpecialist == null) {
      return l10n.parentSessionRequestNoSpecialistForSubmit;
    }
    if (_selectedReason == null) {
      return l10n.parentSessionRequestSelectReason;
    }
    if (_selectedReason == SessionRequestReason.other &&
        _otherReasonController.text.trim().isEmpty) {
      return l10n.parentSessionRequestEnterOtherReason;
    }
    if (_selectedDate == null) {
      return l10n.parentSessionRequestSelectPreferredDate;
    }
    if (_selectedTimePeriod == null) {
      return l10n.parentSessionRequestSelectPreferredTime;
    }
    return null;
  }

  Future<void> _submit() async {
    final l10n = AppLocalizations.of(context)!;
    final validationError = _validateForm(l10n);
    if (validationError != null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(validationError)));
      return;
    }

    final error = await ref
        .read(sessionRequestsProvider.notifier)
        .submitRequest(
          CreateSessionRequestInput(
            patientId: _selectedChild!.id,
            specialistId: _selectedSpecialist!.specialistId,
            reason: _selectedReason!,
            reasonOtherText: _selectedReason == SessionRequestReason.other
                ? _otherReasonController.text.trim()
                : null,
            preferredDate: _selectedDate!,
            preferredTimePeriod: _selectedTimePeriod!,
            notes: _notesController.text.trim().isEmpty
                ? null
                : _notesController.text.trim(),
          ),
        );

    if (!mounted) {
      return;
    }

    if (error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(mapParentSessionRequestSubmitError(l10n, error)),
        ),
      );
      return;
    }

    Navigator.of(context).pop();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(l10n.parentSessionRequestSubmittedSuccess)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final isSubmitting = ref.watch(sessionRequestsProvider).isSubmitting;
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
          child: SingleChildScrollView(
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
                  l10n.parentSessionRequestTitle,
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.25),
                Text(
                  l10n.parentSessionRequestIntro,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: DashboardColors.textSecondary,
                    height: 1.45,
                  ),
                ),
                SizedBox(height: context.dashSpacing),
                if (_isLoadingChildren)
                  const Center(child: DashboardLoadingCard())
                else if (_loadError != null) ...[
                  DashboardErrorCard(
                    message: mapParentSessionRequestLoadChildrenError(
                      l10n,
                      _loadError!,
                    ),
                    onRetry: _loadChildren,
                  ),
                ] else if (_children.isEmpty) ...[
                  DashboardSurfaceCard(
                    child: Text(
                      l10n.parentSessionRequestNoChildren,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: DashboardColors.textSecondary,
                      ),
                    ),
                  ),
                ] else ...[
                  _RequestDropdownField<ParentChild>(
                    label: l10n.parentSessionRequestChild,
                    value: _selectedChild,
                    items: _children,
                    itemLabel: (child) => child.name,
                    onChanged: (child) async {
                      setState(() => _selectedChild = child);
                      if (child != null) {
                        await _loadSpecialists(child.id);
                      }
                    },
                  ),
                  if (_isLoadingSpecialists) ...[
                    SizedBox(height: context.dashSpacing * 0.5),
                    const LinearProgressIndicator(
                      minHeight: 2,
                      color: DashboardColors.brandCyan,
                      backgroundColor: DashboardColors.brandSoft,
                    ),
                  ] else if (_specialists.isEmpty) ...[
                    SizedBox(height: context.dashSpacing * 0.5),
                    Text(
                      l10n.parentSessionRequestNoSpecialistAssigned,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: DashboardColors.highPriority,
                      ),
                    ),
                  ] else if (_specialists.length > 1) ...[
                    SizedBox(height: context.dashSpacing * 0.65),
                    _RequestDropdownField<PatientSpecialistLink>(
                      label: l10n.parentSessionRequestSpecialist,
                      value: _selectedSpecialist,
                      items: _specialists,
                      itemLabel: (specialist) => specialist.specialistName,
                      onChanged: (specialist) {
                        setState(() => _selectedSpecialist = specialist);
                      },
                    ),
                  ],
                  SizedBox(height: context.dashSpacing * 0.65),
                  _RequestDropdownField<SessionRequestReason>(
                    label: l10n.parentSessionRequestReason,
                    value: _selectedReason,
                    items: SessionRequestReason.values,
                    itemLabel: (reason) =>
                        localizedSessionRequestReasonValue(l10n, reason),
                    onChanged: (reason) =>
                        setState(() => _selectedReason = reason),
                  ),
                  if (_selectedReason == SessionRequestReason.other) ...[
                    SizedBox(height: context.dashSpacing * 0.65),
                    _RequestTextField(
                      label: l10n.parentSessionRequestOtherReason,
                      controller: _otherReasonController,
                      maxLines: 2,
                    ),
                  ],
                  SizedBox(height: context.dashSpacing * 0.65),
                  DashboardSurfaceCard(
                    onTap: _pickDate,
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                l10n.parentSessionRequestPreferredDate,
                                style: theme.textTheme.labelSmall?.copyWith(
                                  color: DashboardColors.textMuted,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              SizedBox(height: context.dashSpacing * 0.2),
                              Text(
                                _selectedDate != null
                                    ? DateFormat(
                                        'MMM d, yyyy',
                                      ).format(_selectedDate!)
                                    : l10n.parentSessionRequestSelectDate,
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const Icon(
                          Icons.calendar_today_outlined,
                          color: DashboardColors.brandCyan,
                          size: 20,
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.65),
                  _RequestDropdownField<PreferredTimePeriod>(
                    label: l10n.parentSessionRequestPreferredTime,
                    value: _selectedTimePeriod,
                    items: PreferredTimePeriod.values,
                    itemLabel: (period) =>
                        localizedPreferredTimePeriod(l10n, period),
                    onChanged: (period) =>
                        setState(() => _selectedTimePeriod = period),
                  ),
                  SizedBox(height: context.dashSpacing * 0.65),
                  _RequestTextField(
                    label: l10n.parentSessionRequestNotesOptional,
                    controller: _notesController,
                    maxLines: 4,
                  ),
                  SizedBox(height: context.dashSpacing),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: isSubmitting ? null : _submit,
                      icon: isSubmitting
                          ? SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white.withValues(alpha: 0.9),
                              ),
                            )
                          : const Icon(Icons.send_rounded, size: 18),
                      label: Text(
                        isSubmitting
                            ? l10n.parentSessionRequestSending
                            : l10n.parentSessionRequestSendRequest,
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: DashboardColors.brandCyan,
                        foregroundColor: Colors.white,
                        disabledBackgroundColor: DashboardColors.brandCyan
                            .withValues(alpha: 0.55),
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
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _RequestDropdownField<T> extends StatelessWidget {
  const _RequestDropdownField({
    required this.label,
    required this.value,
    required this.items,
    required this.itemLabel,
    required this.onChanged,
  });

  final String label;
  final T? value;
  final List<T> items;
  final String Function(T item) itemLabel;
  final ValueChanged<T?> onChanged;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
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
          DropdownButtonHideUnderline(
            child: DropdownButton<T>(
              isExpanded: true,
              value: value,
              hint: Text(l10n.parentSessionRequestSelectHint(label)),
              items: items
                  .map(
                    (item) => DropdownMenuItem<T>(
                      value: item,
                      child: Text(itemLabel(item)),
                    ),
                  )
                  .toList(),
              onChanged: onChanged,
            ),
          ),
        ],
      ),
    );
  }
}

class _RequestTextField extends StatelessWidget {
  const _RequestTextField({
    required this.label,
    required this.controller,
    this.maxLines = 1,
  });

  final String label;
  final TextEditingController controller;
  final int maxLines;

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
          TextField(
            controller: controller,
            maxLines: maxLines,
            decoration: const InputDecoration(
              border: InputBorder.none,
              isDense: true,
              contentPadding: EdgeInsets.zero,
            ),
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
