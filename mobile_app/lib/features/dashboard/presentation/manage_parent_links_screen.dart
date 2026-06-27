import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../core/theme/dashboard_theme.dart';
import '../models/parent_links_models.dart';
import '../providers/parent_links_provider.dart';
import '../widgets/dashboard_layout.dart';
import '../widgets/dashboard_surface_card.dart';
import '../widgets/parent_dashboard_cards.dart';

class ManageParentLinksScreen extends ConsumerStatefulWidget {
  const ManageParentLinksScreen({super.key});

  @override
  ConsumerState<ManageParentLinksScreen> createState() =>
      _ManageParentLinksScreenState();
}

class _ManageParentLinksScreenState extends ConsumerState<ManageParentLinksScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(parentLinksProvider.notifier).initialize();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(parentLinksProvider);
    final theme = Theme.of(context);

    return Theme(
      data: DashboardTheme.light,
      child: Scaffold(
        backgroundColor: DashboardColors.background,
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded),
            onPressed: () => context.pop(),
          ),
          title: const Text('Manage Parent Links'),
        ),
        body: SafeArea(
          child: state.isLoading
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
                              ref.read(parentLinksProvider.notifier).refresh(),
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
                                    color: DashboardColors.textPrimary,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        SizedBox(height: context.dashSpacing * 0.75),
                      ],
                      DashboardSurfaceCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Text(
                              'Link Parent to Child',
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            SizedBox(height: context.dashSpacing * 0.75),
                            _DropdownField<PatientOption>(
                              label: 'Patient / Child',
                              value: state.patients
                                  .where((p) => p.id == state.selectedPatientId)
                                  .cast<PatientOption?>()
                                  .firstOrNull,
                              items: state.patients,
                              itemLabel: (item) => item.name,
                              onChanged: (item) => ref
                                  .read(parentLinksProvider.notifier)
                                  .selectPatient(item?.id),
                              emptyHint: 'No patients available',
                            ),
                            SizedBox(height: context.dashSpacing * 0.75),
                            _DropdownField<ParentUserOption>(
                              label: 'Parent Account',
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
                                  .read(parentLinksProvider.notifier)
                                  .selectParent(item?.userId),
                              emptyHint: 'No parent accounts available',
                            ),
                            SizedBox(height: context.dashSpacing * 0.75),
                            _DropdownField<String>(
                              label: 'Relationship',
                              value: state.selectedRelationship,
                              items: parentRelationshipOptions,
                              itemLabel: (item) => item[0].toUpperCase() + item.substring(1),
                              onChanged: (item) => ref
                                  .read(parentLinksProvider.notifier)
                                  .selectRelationship(item),
                              emptyHint: 'Select relationship',
                            ),
                            SizedBox(height: context.dashSpacing * 0.5),
                            CheckboxListTile(
                              contentPadding: EdgeInsets.zero,
                              value: state.isPrimaryContact,
                              onChanged: (value) => ref
                                  .read(parentLinksProvider.notifier)
                                  .setPrimaryContact(value ?? true),
                              title: Text(
                                'Primary contact',
                                style: theme.textTheme.bodyMedium,
                              ),
                              activeColor: DashboardColors.primary,
                              controlAffinity: ListTileControlAffinity.leading,
                            ),
                            SizedBox(height: context.dashSpacing * 0.5),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: state.isSubmitting
                                    ? null
                                    : () => ref
                                        .read(parentLinksProvider.notifier)
                                        .submitLink(),
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
                                child: state.isSubmitting
                                    ? const SizedBox(
                                        width: 20,
                                        height: 20,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          color: Colors.white,
                                        ),
                                      )
                                    : const Text('Link Parent to Child'),
                              ),
                            ),
                          ],
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
                      if (state.isLoadingGuardians)
                        const DashboardLoadingCard(message: 'Loading linked parents...')
                      else if (state.selectedPatientId == null)
                        const DashboardEmptyCard(
                          message: 'Select a patient to view linked parents.',
                        )
                      else if (state.guardians.isEmpty)
                        const DashboardEmptyCard(
                          message: 'No parents linked to this patient yet.',
                        )
                      else
                        ...state.guardians.map(
                          (guardian) => Padding(
                            padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                            child: DashboardSurfaceCard(
                              child: Row(
                                children: [
                                  CircleAvatar(
                                    backgroundColor:
                                        DashboardColors.purpleSoft,
                                    child: Text(
                                      dashboardAvatarLetter(
                                        guardian.parentName,
                                        fallback: 'P',
                                      ),
                                      style: TextStyle(
                                        color: DashboardColors.primary,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ),
                                  SizedBox(width: context.dashSpacing * 0.65),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          guardian.parentName,
                                          style: theme.textTheme.bodyMedium
                                              ?.copyWith(
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                        Text(
                                          '${_formatRelationship(guardian.relationship)}'
                                          '${guardian.isPrimaryContact ? ' • Primary contact' : ''}',
                                          style: theme.textTheme.bodySmall
                                              ?.copyWith(
                                            color: DashboardColors.textSecondary,
                                          ),
                                        ),
                                        if (guardian.email != null)
                                          Text(
                                            guardian.email!,
                                            style: theme.textTheme.bodySmall
                                                ?.copyWith(
                                              color: DashboardColors.textMuted,
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
        ),
      ),
    );
  }
}

String _formatRelationship(String relationship) {
  if (relationship.isEmpty) {
    return 'Guardian';
  }
  return '${relationship[0].toUpperCase()}${relationship.substring(1)}';
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
          Text(
            label,
            style: theme.textTheme.labelLarge?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            emptyHint,
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
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
          .map(
            (item) => DropdownMenuItem<T>(
              value: item,
              child: Text(itemLabel(item)),
            ),
          )
          .toList(),
      onChanged: onChanged,
    );
  }
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
