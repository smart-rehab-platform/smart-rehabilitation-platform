import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../models/specialist_feature_models.dart';
import '../../models/specialist_regular_report_creation.dart';
import '../../providers/specialist_features_provider.dart';
import '../../providers/specialist_reports_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/parent_dashboard_cards.dart';
import 'specialist_scoped_localization_utils.dart';

Future<void> showSpecialistCreateReportSheet({
  required BuildContext context,
  required WidgetRef ref,
  String? reportsPatientId,
}) async {
  final reportsNotifier = ref.read(
    specialistReportsProvider(reportsPatientId).notifier,
  );
  reportsNotifier.clearRegularCreationError();
  ref.read(specialistPatientsProvider.notifier).initialize();

  final created = await showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    backgroundColor: Colors.transparent,
    builder: (sheetContext) => SpecialistCreateReportSheet(
      reportsPatientId: reportsPatientId,
    ),
  );

  if (created == true && context.mounted) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          AppLocalizations.of(context)!.specialistCreateReportSuccess,
        ),
      ),
    );
  }
}

class SpecialistCreateReportSheet extends ConsumerStatefulWidget {
  const SpecialistCreateReportSheet({
    super.key,
    this.reportsPatientId,
  });

  /// Family key for the visible Reports list (not the selected patient).
  final String? reportsPatientId;

  @override
  ConsumerState<SpecialistCreateReportSheet> createState() =>
      _SpecialistCreateReportSheetState();
}

class _SpecialistCreateReportSheetState
    extends ConsumerState<SpecialistCreateReportSheet> {
  SpecialistPatientItem? _selectedPatient;
  SpecialistRegularReportType _type = SpecialistRegularReportType.weekly;
  late final TextEditingController _titleController;
  late final TextEditingController _summaryController;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController();
    _summaryController = TextEditingController();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _summaryController.dispose();
    super.dispose();
  }

  void _clearCreationError() {
    ref
        .read(specialistReportsProvider(widget.reportsPatientId).notifier)
        .clearRegularCreationError();
  }

  void _selectType(SpecialistRegularReportType type) {
    if (_type == type) {
      return;
    }
    setState(() => _type = type);
    _clearCreationError();
  }

  Future<void> _openPatientPicker() async {
    final reportsState = ref.read(
      specialistReportsProvider(widget.reportsPatientId),
    );
    if (reportsState.isCreatingRegularReport) {
      return;
    }

    final patients = ref.read(specialistPatientsProvider).items;
    if (patients.isEmpty) {
      return;
    }

    final selected = await showModalBottomSheet<SpecialistPatientItem>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (sheetContext) {
        final l10n = AppLocalizations.of(sheetContext)!;
        return SafeArea(
          child: Padding(
            padding: EdgeInsets.fromLTRB(
              context.dashSpacing,
              0,
              context.dashSpacing,
              context.dashSpacing,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  l10n.specialistSelectPatient,
                  style: Theme.of(sheetContext).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.65),
                ConstrainedBox(
                  constraints: BoxConstraints(
                    maxHeight: MediaQuery.sizeOf(sheetContext).height * 0.55,
                  ),
                  child: ListView.separated(
                    shrinkWrap: true,
                    itemCount: patients.length,
                    separatorBuilder: (_, __) =>
                        SizedBox(height: context.dashSpacing * 0.35),
                    itemBuilder: (context, index) {
                      final patient = patients[index];
                      final isSelected = patient.id == _selectedPatient?.id;
                      return ListTile(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                          side: const BorderSide(color: DashboardColors.border),
                        ),
                        title: Text(patient.name),
                        trailing: isSelected
                            ? const Icon(
                                Icons.check_rounded,
                                color: DashboardColors.brandCyan,
                              )
                            : const Icon(Icons.chevron_right_rounded),
                        onTap: () => Navigator.pop(sheetContext, patient),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );

    if (selected == null || !mounted) {
      return;
    }
    setState(() => _selectedPatient = selected);
    _clearCreationError();
  }

  Future<void> _submit() async {
    final reportsNotifier = ref.read(
      specialistReportsProvider(widget.reportsPatientId).notifier,
    );
    final ok = await reportsNotifier.createRegularReport(
      patientId: _selectedPatient?.id ?? '',
      reportType: _type,
      title: _titleController.text,
      summary: _summaryController.text,
    );
    if (!mounted) {
      return;
    }
    if (ok) {
      Navigator.of(context).pop(true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final reportsState = ref.watch(
      specialistReportsProvider(widget.reportsPatientId),
    );
    final patientsState = ref.watch(specialistPatientsProvider);
    final isCreating = reportsState.isCreatingRegularReport;
    final canSelectPatient = patientsState.items.isNotEmpty && !isCreating;
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;
    final creationError = reportsState.regularCreationError;

    return PopScope(
      canPop: !isCreating,
      child: Container(
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
                  l10n.specialistCreateReport,
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.25),
                Text(
                  l10n.specialistCreateReportSubtitle,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: DashboardColors.textSecondary,
                    height: 1.35,
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.85),
                Text(
                  l10n.entityPatient,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.45),
                _PatientSelector(
                  patientsState: patientsState,
                  selectedPatient: _selectedPatient,
                  enabled: canSelectPatient,
                  onTap: _openPatientPicker,
                  onRetry: () =>
                      ref.read(specialistPatientsProvider.notifier).refresh(),
                ),
                SizedBox(height: context.dashSpacing),
                Text(
                  l10n.specialistAiReportTypeLabel,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.45),
                _TypeChoiceGrid(
                  selected: _type,
                  enabled: !isCreating,
                  onSelect: _selectType,
                ),
                SizedBox(height: context.dashSpacing),
                Text(
                  l10n.specialistCreateReportTitleLabel,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.45),
                DashboardSurfaceCard(
                  child: TextField(
                    controller: _titleController,
                    enabled: !isCreating,
                    maxLength: 200,
                    textInputAction: TextInputAction.next,
                    onChanged: (_) => _clearCreationError(),
                    decoration: InputDecoration(
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: EdgeInsets.zero,
                      hintText: l10n.commonOptional,
                      counterText: '',
                    ),
                  ),
                ),
                SizedBox(height: context.dashSpacing),
                Text(
                  l10n.specialistCreateReportSummaryLabel,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.45),
                DashboardSurfaceCard(
                  child: TextField(
                    controller: _summaryController,
                    enabled: !isCreating,
                    minLines: 4,
                    maxLines: 6,
                    keyboardType: TextInputType.multiline,
                    textInputAction: TextInputAction.newline,
                    onChanged: (_) => _clearCreationError(),
                    decoration: InputDecoration(
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: EdgeInsets.zero,
                      hintText: l10n.commonOptional,
                    ),
                  ),
                ),
                if (creationError != null) ...[
                  SizedBox(height: context.dashSpacing * 0.75),
                  _CreationErrorBanner(
                    message: mapSpecialistRegularReportCreationError(
                      l10n,
                      creationError,
                    ),
                  ),
                ],
                SizedBox(height: context.dashSpacing),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: isCreating
                            ? null
                            : () => Navigator.of(context).pop(false),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: DashboardColors.textSecondary,
                          side: const BorderSide(color: DashboardColors.border),
                          padding: EdgeInsets.symmetric(
                            vertical: context.dashSpacing * 0.62,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        child: Text(l10n.commonCancel),
                      ),
                    ),
                    SizedBox(width: context.dashSpacing * 0.45),
                    Expanded(
                      flex: 2,
                      child: ElevatedButton(
                        onPressed:
                            isCreating || patientsState.items.isEmpty
                            ? null
                            : _submit,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: DashboardColors.brandCyan,
                          foregroundColor: Colors.white,
                          disabledBackgroundColor: DashboardColors.brandCyan
                              .withValues(alpha: 0.45),
                          padding: EdgeInsets.symmetric(
                            vertical: context.dashSpacing * 0.62,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        child: isCreating
                            ? Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  ),
                                  SizedBox(width: context.dashSpacing * 0.4),
                                  Flexible(
                                    child: Text(
                                      l10n.specialistCreateReportCreating,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              )
                            : Text(l10n.specialistCreateReport),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _TypeChoiceGrid extends StatelessWidget {
  const _TypeChoiceGrid({
    required this.selected,
    required this.enabled,
    required this.onSelect,
  });

  final SpecialistRegularReportType selected;
  final bool enabled;
  final ValueChanged<SpecialistRegularReportType> onSelect;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final types = [
      (SpecialistRegularReportType.weekly, l10n.reportTypeWeekly),
      (SpecialistRegularReportType.monthly, l10n.reportTypeMonthly),
      (SpecialistRegularReportType.assessment, l10n.clinicalAssessment),
      (SpecialistRegularReportType.progress, l10n.reportTypeProgress),
    ];

    return Column(
      children: [
        for (var row = 0; row < 2; row++) ...[
          if (row > 0) SizedBox(height: context.dashSpacing * 0.45),
          Row(
            children: [
              for (var col = 0; col < 2; col++) ...[
                if (col > 0) SizedBox(width: context.dashSpacing * 0.45),
                Expanded(
                  child: _TypeChoice(
                    label: types[row * 2 + col].$2,
                    selected: selected == types[row * 2 + col].$1,
                    enabled: enabled,
                    onTap: () => onSelect(types[row * 2 + col].$1),
                  ),
                ),
              ],
            ],
          ),
        ],
      ],
    );
  }
}

class _PatientSelector extends StatelessWidget {
  const _PatientSelector({
    required this.patientsState,
    required this.selectedPatient,
    required this.enabled,
    required this.onTap,
    required this.onRetry,
  });

  final SpecialistListState<SpecialistPatientItem> patientsState;
  final SpecialistPatientItem? selectedPatient;
  final bool enabled;
  final VoidCallback onTap;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    if (patientsState.isLoading) {
      return DashboardSurfaceCard(
        child: Row(
          children: [
            const SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
            SizedBox(width: context.dashSpacing * 0.55),
            Text(
              l10n.commonLoading,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: DashboardColors.textSecondary,
              ),
            ),
          ],
        ),
      );
    }

    if (patientsState.errorMessage != null) {
      return DashboardErrorCard(
        message: mapSpecialistListError(l10n, patientsState.errorMessage!),
        onRetry: onRetry,
      );
    }

    if (patientsState.items.isEmpty) {
      return DashboardSurfaceCard(
        child: Text(
          l10n.specialistNoAssignedPatients,
          style: theme.textTheme.bodyMedium?.copyWith(
            color: DashboardColors.textSecondary,
          ),
        ),
      );
    }

    return Semantics(
      button: true,
      label: l10n.entityPatient,
      value: selectedPatient?.name ?? l10n.specialistSelectPatient,
      child: DashboardSurfaceCard(
        onTap: enabled ? onTap : null,
        child: _PickerField(
          label: l10n.entityPatient,
          value: selectedPatient?.name ?? l10n.specialistSelectPatient,
          icon: Icons.keyboard_arrow_down_rounded,
          muted: selectedPatient == null,
        ),
      ),
    );
  }
}

class _TypeChoice extends StatelessWidget {
  const _TypeChoice({
    required this.label,
    required this.selected,
    required this.enabled,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final bool enabled;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      selected: selected,
      enabled: enabled,
      label: label,
      child: InkWell(
        onTap: enabled ? onTap : null,
        borderRadius: BorderRadius.circular(14),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 160),
          padding: EdgeInsets.symmetric(
            horizontal: context.dashSpacing * 0.5,
            vertical: context.dashSpacing * 0.55,
          ),
          decoration: BoxDecoration(
            color: selected
                ? DashboardColors.brandSoft
                : DashboardColors.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: selected
                  ? DashboardColors.brandCyan
                  : DashboardColors.border,
              width: selected ? 1.6 : 1,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                selected
                    ? Icons.radio_button_checked_rounded
                    : Icons.radio_button_off_rounded,
                size: 18,
                color: selected
                    ? DashboardColors.brandCyan
                    : DashboardColors.textMuted,
              ),
              SizedBox(width: context.dashSpacing * 0.3),
              Flexible(
                child: Text(
                  label,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: selected
                        ? DashboardColors.brandCyan
                        : DashboardColors.textSecondary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PickerField extends StatelessWidget {
  const _PickerField({
    required this.label,
    required this.value,
    required this.icon,
    this.muted = false,
  });

  final String label;
  final String value;
  final IconData icon;
  final bool muted;

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
                  color: muted
                      ? DashboardColors.textMuted
                      : DashboardColors.textPrimary,
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

class _CreationErrorBanner extends StatelessWidget {
  const _CreationErrorBanner({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      liveRegion: true,
      child: DashboardSurfaceCard(
        tint: DashboardColors.highPriority,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(
              Icons.error_outline_rounded,
              color: DashboardColors.highPriority,
            ),
            SizedBox(width: context.dashSpacing * 0.45),
            Expanded(
              child: Text(
                message,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: DashboardColors.textPrimary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
