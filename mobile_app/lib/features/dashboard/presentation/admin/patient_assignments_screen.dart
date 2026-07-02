import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/admin_dashboard_colors.dart';
import '../../models/admin_assignments_models.dart';
import '../../models/parent_links_models.dart';
import '../../providers/admin_patient_assignments_provider.dart';
import '../../widgets/admin_page_scaffold.dart';
import '../../widgets/admin_ui_components.dart';
import '../../widgets/dashboard_bottom_nav.dart';
import '../../widgets/dashboard_layout.dart';

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
                        AdminErrorCard(
                          message: state.errorMessage!,
                          onRetry: () =>
                              ref.read(adminPatientAssignmentsProvider.notifier).refresh(),
                        ),
                      if (state.successMessage != null) ...[
                        AdminSurfaceCard(
                          tint: AdminDashboardColors.success,
                          child: Row(
                            children: [
                              Icon(
                                Icons.check_circle_outline_rounded,
                                color: AdminDashboardColors.success,
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
                      AdminSurfaceCard(
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
                              visualDensity: VisualDensity.compact,
                              value: state.isPrimarySpecialist,
                              onChanged: (value) => ref
                                  .read(adminPatientAssignmentsProvider.notifier)
                                  .setPrimarySpecialist(value ?? true),
                              title: const Text(
                                'Primary specialist',
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              activeColor: AdminDashboardColors.primary,
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
                                  backgroundColor: AdminDashboardColors.primary,
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
                                    : const Text(
                                        'Assign Specialist to Patient',
                                        textAlign: TextAlign.center,
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(height: context.dashSpacing),
                      AdminSurfaceCard(
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
                              visualDensity: VisualDensity.compact,
                              value: state.isPrimaryContact,
                              onChanged: (value) => ref
                                  .read(adminPatientAssignmentsProvider.notifier)
                                  .setPrimaryContact(value ?? true),
                              title: const Text(
                                'Primary contact',
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              activeColor: AdminDashboardColors.primary,
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
                                  backgroundColor: AdminDashboardColors.primary,
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
                                    : const Text(
                                        'Link Parent to Patient',
                                        textAlign: TextAlign.center,
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
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
                        const AdminLoadingCard(message: 'Loading relationships...')
                      else if (state.selectedPatientId == null)
                        const AdminEmptyCard(
                          message: 'Select a patient to view assignments.',
                        )
                      else if (state.assignedSpecialists.isEmpty)
                        const AdminEmptyCard(
                          message: 'No specialists assigned to this patient yet.',
                        )
                      else
                        ...state.assignedSpecialists.map(
                          (link) => Padding(
                            padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                            child: AdminSurfaceCard(
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  CircleAvatar(
                                    backgroundColor: AdminDashboardColors.emeraldSoft,
                                    child: Text(
                                      dashboardAvatarLetter(link.specialistName),
                                      style: TextStyle(
                                        color: AdminDashboardColors.emerald,
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
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: theme.textTheme.bodyMedium?.copyWith(
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                        Text(
                                          '${link.isPrimary ? 'Primary specialist' : 'Specialist'}'
                                          '${link.email != null ? ' • ${link.email}' : ''}',
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                          style: theme.textTheme.bodySmall?.copyWith(
                                            color: AdminDashboardColors.textSecondary,
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
                        const AdminEmptyCard(
                          message: 'Select a patient to view linked parents.',
                        )
                      else if (state.linkedParents.isEmpty)
                        const AdminEmptyCard(
                          message: 'No parents linked to this patient yet.',
                        )
                      else
                        ...state.linkedParents.map(
                          (guardian) => Padding(
                            padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                            child: AdminSurfaceCard(
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  CircleAvatar(
                                    backgroundColor: AdminDashboardColors.blueSoft,
                                    child: Text(
                                      dashboardAvatarLetter(guardian.parentName),
                                      style: TextStyle(
                                        color: AdminDashboardColors.primary,
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
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: theme.textTheme.bodyMedium?.copyWith(
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                        Text(
                                          '${_formatRelationship(guardian.relationship)}'
                                          '${guardian.isPrimaryContact ? ' • Primary contact' : ''}',
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                          style: theme.textTheme.bodySmall?.copyWith(
                                            color: AdminDashboardColors.textSecondary,
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
      isExpanded: true,
      initialValue: items.contains(value) ? value : null,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: AdminDashboardColors.surface,
        isDense: true,
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: AdminDashboardColors.border),
        ),
      ),
      items: items
          .map(
            (item) => DropdownMenuItem<T>(
              value: item,
              child: Text(
                itemLabel(item),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          )
          .toList(),
      selectedItemBuilder: (context) => items
          .map(
            (item) => Align(
              alignment: Alignment.centerLeft,
              child: Text(
                itemLabel(item),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          )
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
