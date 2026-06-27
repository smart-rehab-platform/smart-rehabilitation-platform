import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../models/admin_assignments_models.dart';
import '../../models/parent_links_models.dart';
import '../../providers/admin_patient_assignments_provider.dart';
import '../../widgets/admin_page_scaffold.dart';
import '../../widgets/dashboard_bottom_nav.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/parent_dashboard_cards.dart';

class PatientAssignmentsScreen extends ConsumerStatefulWidget {
  const PatientAssignmentsScreen({super.key});

  @override
  ConsumerState<PatientAssignmentsScreen> createState() =>
      _PatientAssignmentsScreenState();
}

class _PatientAssignmentsScreenState extends ConsumerState<PatientAssignmentsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(adminPatientAssignmentsProvider.notifier).initialize();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(adminPatientAssignmentsProvider);
    final theme = Theme.of(context);

    return AdminPageScaffold(
      title: 'Patient Assignments',
      showBackButton: true,
      currentNav: DashboardNavItem.patients,
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: context.dashPadding,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (state.errorMessage != null)
                        DashboardErrorCard(
                          message: state.errorMessage!,
                          onRetry: () =>
                              ref.read(adminPatientAssignmentsProvider.notifier).refresh(),
                        ),
                      if (state.successMessage != null) ...[
                        DashboardSurfaceCard(
                          tint: DashboardColors.success,
                          child: Row(
                            children: [
                              Icon(
                                Icons.check_circle_outline_rounded,
                                color: DashboardColors.success,
                                size: context.dashSpacing * 0.65,
                              ),
                              SizedBox(width: context.dashSpacing * 0.6),
                              Expanded(
                                child: Text(
                                  state.successMessage!,
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        SizedBox(height: context.dashSpacing * 0.75),
                      ],
                      _DropdownField<PatientOption>(
                        label: 'Patient',
                        value: state.patients
                            .where((p) => p.id == state.selectedPatientId)
                            .cast<PatientOption?>()
                            .firstOrNull,
                        items: state.patients,
                        itemLabel: (item) => item.name,
                        onChanged: (item) => ref
                            .read(adminPatientAssignmentsProvider.notifier)
                            .selectPatient(item?.id),
                        emptyHint: 'No patients available',
                      ),
                      SizedBox(height: context.dashSpacing),
                      DashboardSurfaceCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Text(
                              'Assign Specialist',
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            SizedBox(height: context.dashSpacing * 0.75),
                            _DropdownField<SpecialistUserOption>(
                              label: 'Specialist',
                              value: state.specialists
                                  .where(
                                    (s) => s.userId == state.selectedSpecialistUserId,
                                  )
                                  .cast<SpecialistUserOption?>()
                                  .firstOrNull,
                              items: state.specialists,
                              itemLabel: (item) =>
                                  item.email != null && item.email!.isNotEmpty
                                      ? '${item.name} (${item.email})'
                                      : item.name,
                              onChanged: (item) => ref
                                  .read(adminPatientAssignmentsProvider.notifier)
                                  .selectSpecialist(item?.userId),
                              emptyHint: 'No specialists available',
                            ),
                            SizedBox(height: context.dashSpacing * 0.5),
                            CheckboxListTile(
                              contentPadding: EdgeInsets.zero,
                              value: state.isPrimarySpecialist,
                              onChanged: (value) => ref
                                  .read(adminPatientAssignmentsProvider.notifier)
                                  .setPrimarySpecialist(value ?? true),
                              title: const Text('Primary specialist'),
                              activeColor: DashboardColors.primary,
                              controlAffinity: ListTileControlAffinity.leading,
                            ),
                            SizedBox(height: context.dashSpacing * 0.35),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: state.isSubmittingSpecialist
                                    ? null
                                    : () => ref
                                        .read(adminPatientAssignmentsProvider.notifier)
                                        .assignSpecialist(),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: DashboardColors.primary,
                                  foregroundColor: Colors.white,
                                  padding: EdgeInsets.symmetric(
                                    vertical: context.dashSpacing * 0.75,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                ),
                                child: state.isSubmittingSpecialist
                                    ? const SizedBox(
                                        width: 20,
                                        height: 20,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          color: Colors.white,
                                        ),
                                      )
                                    : const Text('Assign Specialist to Patient'),
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(height: context.dashSpacing),
                      DashboardSurfaceCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Text(
                              'Link Parent',
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            SizedBox(height: context.dashSpacing * 0.75),
                            _DropdownField<ParentUserOption>(
                              label: 'Parent',
                              value: state.parents
                                  .where(
                                    (p) => p.userId == state.selectedParentUserId,
                                  )
                                  .cast<ParentUserOption?>()
                                  .firstOrNull,
                              items: state.parents,
                              itemLabel: (item) =>
                                  item.email != null && item.email!.isNotEmpty
                                      ? '${item.name} (${item.email})'
                                      : item.name,
                              onChanged: (item) => ref
                                  .read(adminPatientAssignmentsProvider.notifier)
                                  .selectParent(item?.userId),
                              emptyHint: 'No parent accounts available',
                            ),
                            SizedBox(height: context.dashSpacing * 0.75),
                            _DropdownField<String>(
                              label: 'Relationship',
                              value: state.selectedRelationship,
                              items: parentRelationshipOptions,
                              itemLabel: (item) =>
                                  item[0].toUpperCase() + item.substring(1),
                              onChanged: (item) => ref
                                  .read(adminPatientAssignmentsProvider.notifier)
                                  .selectRelationship(item),
                              emptyHint: 'Select relationship',
                            ),
                            SizedBox(height: context.dashSpacing * 0.5),
                            CheckboxListTile(
                              contentPadding: EdgeInsets.zero,
                              value: state.isPrimaryContact,
                              onChanged: (value) => ref
                                  .read(adminPatientAssignmentsProvider.notifier)
                                  .setPrimaryContact(value ?? true),
                              title: const Text('Primary contact'),
                              activeColor: DashboardColors.primary,
                              controlAffinity: ListTileControlAffinity.leading,
                            ),
                            SizedBox(height: context.dashSpacing * 0.35),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: state.isSubmittingParent
                                    ? null
                                    : () => ref
                                        .read(adminPatientAssignmentsProvider.notifier)
                                        .linkParent(),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: DashboardColors.accent,
                                  foregroundColor: Colors.white,
                                  padding: EdgeInsets.symmetric(
                                    vertical: context.dashSpacing * 0.75,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                ),
                                child: state.isSubmittingParent
                                    ? const SizedBox(
                                        width: 20,
                                        height: 20,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          color: Colors.white,
                                        ),
                                      )
                                    : const Text('Link Parent to Patient'),
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(height: context.dashSpacing),
                      Text(
                        'Assigned Specialists',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      SizedBox(height: context.dashSpacing * 0.5),
                      if (state.isLoadingRelationships)
                        const DashboardLoadingCard(message: 'Loading relationships...')
                      else if (state.selectedPatientId == null)
                        const DashboardEmptyCard(
                          message: 'Select a patient to view assignments.',
                        )
                      else if (state.assignedSpecialists.isEmpty)
                        const DashboardEmptyCard(
                          message: 'No specialists assigned to this patient yet.',
                        )
                      else
                        ...state.assignedSpecialists.map(
                          (link) => Padding(
                            padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                            child: DashboardSurfaceCard(
                              child: Row(
                                children: [
                                  CircleAvatar(
                                    backgroundColor: DashboardColors.tealSoft,
                                    child: Text(
                                      dashboardAvatarLetter(link.specialistName),
                                      style: TextStyle(
                                        color: DashboardColors.accent,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ),
                                  SizedBox(width: context.dashSpacing * 0.65),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          link.specialistName,
                                          style: theme.textTheme.bodyMedium?.copyWith(
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                        Text(
                                          '${link.isPrimary ? 'Primary specialist' : 'Specialist'}'
                                          '${link.email != null ? ' • ${link.email}' : ''}',
                                          style: theme.textTheme.bodySmall?.copyWith(
                                            color: DashboardColors.textSecondary,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      SizedBox(height: context.dashSpacing),
                      Text(
                        'Linked Parents',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      SizedBox(height: context.dashSpacing * 0.5),
                      if (state.isLoadingRelationships)
                        const SizedBox.shrink()
                      else if (state.selectedPatientId == null)
                        const DashboardEmptyCard(
                          message: 'Select a patient to view linked parents.',
                        )
                      else if (state.linkedParents.isEmpty)
                        const DashboardEmptyCard(
                          message: 'No parents linked to this patient yet.',
                        )
                      else
                        ...state.linkedParents.map(
                          (guardian) => Padding(
                            padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                            child: DashboardSurfaceCard(
                              child: Row(
                                children: [
                                  CircleAvatar(
                                    backgroundColor: DashboardColors.purpleSoft,
                                    child: Text(
                                      dashboardAvatarLetter(guardian.parentName),
                                      style: TextStyle(
                                        color: DashboardColors.primary,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ),
                                  SizedBox(width: context.dashSpacing * 0.65),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          guardian.parentName,
                                          style: theme.textTheme.bodyMedium?.copyWith(
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                        Text(
                                          '${_formatRelationship(guardian.relationship)}'
                                          '${guardian.isPrimaryContact ? ' • Primary contact' : ''}',
                                          style: theme.textTheme.bodySmall?.copyWith(
                                            color: DashboardColors.textSecondary,
                                          ),
                                        ),
                                      ],
                                    ),
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
}

class _DropdownField<T> extends StatelessWidget {
  const _DropdownField({
    required this.label,
    required this.value,
    required this.items,
    required this.itemLabel,
    required this.onChanged,
    required this.emptyHint,
  });

  final String label;
  final T? value;
  final List<T> items;
  final String Function(T item) itemLabel;
  final ValueChanged<T?> onChanged;
  final String emptyHint;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (items.isEmpty) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: theme.textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w600)),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(emptyHint, style: theme.textTheme.bodySmall),
        ],
      );
    }

    return DropdownButtonFormField<T>(
      key: ValueKey('$label-${items.contains(value) ? value : 'none'}'),
      initialValue: items.contains(value) ? value : null,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: DashboardColors.surface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: DashboardColors.border),
        ),
      ),
      items: items
          .map((item) => DropdownMenuItem<T>(value: item, child: Text(itemLabel(item))))
          .toList(),
      onChanged: onChanged,
    );
  }
}

String _formatRelationship(String relationship) {
  if (relationship.isEmpty) {
    return 'Guardian';
  }
  return '${relationship[0].toUpperCase()}${relationship.substring(1)}';
}

extension _FirstOrNull<T> on Iterable<T> {
  T? get firstOrNull {
    final iterator = this.iterator;
    if (!iterator.moveNext()) {
      return null;
    }
    return iterator.current;
  }
}
