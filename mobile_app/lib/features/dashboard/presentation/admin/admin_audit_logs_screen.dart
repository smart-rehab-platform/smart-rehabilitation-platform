import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../l10n/app_localizations.dart';
import '../../data/admin_features_repository.dart';
import '../../data/admin_users_repository.dart';
import '../../providers/admin_features_provider.dart';
import '../../providers/admin_users_provider.dart';
import '../../widgets/admin_page_scaffold.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/admin_ui_components.dart';
import 'admin_audit_log_widgets.dart';
import 'admin_audit_localization_utils.dart';
import 'admin_scoped_localization_utils.dart';

class AdminAuditLogsScreen extends ConsumerStatefulWidget {
  const AdminAuditLogsScreen({super.key});

  @override
  ConsumerState<AdminAuditLogsScreen> createState() =>
      _AdminAuditLogsScreenState();
}

class _AdminAuditLogsScreenState extends ConsumerState<AdminAuditLogsScreen> {
  bool _isLoading = true;
  String? _error;
  List<AdminAuditLogRecord> _logs = const [];
  List<AdminUserRecord> _users = const [];

  String? _selectedUserId;
  String? _selectedAction;
  String? _selectedEntity;
  DateTime? _dateFrom;
  DateTime? _dateTo;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _initialize());
  }

  Future<void> _initialize() async {
    try {
      final usersRepo = ref.read(adminUsersRepositoryProvider);
      final users = await usersRepo.fetchUsers();
      if (mounted) {
        setState(() => _users = users);
      }
    } catch (_) {}

    await _load();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final repo = ref.read(adminFeaturesRepositoryProvider);
      final rows = await repo.fetchAuditLogs(
        userId: _selectedUserId,
        action: _selectedAction,
        entityName: _selectedEntity,
        dateFrom: _dateFrom?.toIso8601String(),
        dateTo: _dateTo?.toIso8601String(),
      );
      if (mounted) {
        setState(() {
          _isLoading = false;
          _logs = rows;
        });
      }
    } catch (error) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _error = 'Failed to load audit logs: $error';
        });
      }
    }
  }

  List<String> get _actions {
    return _logs.map((log) => log.action).toSet().toList()..sort();
  }

  List<String> get _entities {
    return _logs
        .map((log) => log.entityName?.trim())
        .whereType<String>()
        .where((value) => value.isNotEmpty)
        .toSet()
        .toList()
      ..sort();
  }

  Future<void> _pickDate({required bool isFrom}) async {
    final initial = isFrom ? _dateFrom : _dateTo;
    final picked = await showDatePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      initialDate: initial ?? DateTime.now(),
    );

    if (picked == null || !mounted) {
      return;
    }

    setState(() {
      if (isFrom) {
        _dateFrom = picked;
      } else {
        _dateTo = picked;
      }
    });
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final errorMessage = _error == null
        ? null
        : mapAdminAuditLogsError(l10n, _error!);

    return AdminPageScaffold(
      title: l10n.navAuditLogs,
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
                    AdminErrorCard(message: errorMessage!, onRetry: _load),
                  AdminSurfaceCard(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        _AuditFilterDropdown<String?>(
                          label: l10n.adminAuditFilterByUser,
                          value: _selectedUserId,
                          items: [
                            _AuditFilterOption<String?>(
                              value: null,
                              label: l10n.adminAuditAllUsers,
                            ),
                            ..._users.map(
                              (user) => _AuditFilterOption<String?>(
                                value: user.id,
                                label: '${user.name} (${user.email})',
                              ),
                            ),
                          ],
                          onChanged: (value) async {
                            setState(() => _selectedUserId = value);
                            await _load();
                          },
                        ),
                        SizedBox(height: context.dashSpacing * 0.5),
                        _AuditFilterDropdown<String?>(
                          label: l10n.adminAuditFilterByAction,
                          value: _selectedAction,
                          items: [
                            _AuditFilterOption<String?>(
                              value: null,
                              label: l10n.adminAuditAllActions,
                            ),
                            ..._actions.map(
                              (action) => _AuditFilterOption<String?>(
                                value: action,
                                label: localizedAuditActionTitle(l10n, action),
                              ),
                            ),
                          ],
                          onChanged: (value) async {
                            setState(() => _selectedAction = value);
                            await _load();
                          },
                        ),
                        SizedBox(height: context.dashSpacing * 0.5),
                        _AuditFilterDropdown<String?>(
                          label: l10n.adminAuditFilterByEntity,
                          value: _selectedEntity,
                          items: [
                            _AuditFilterOption<String?>(
                              value: null,
                              label: l10n.adminAuditAllEntities,
                            ),
                            ..._entities.map(
                              (entity) => _AuditFilterOption<String?>(
                                value: entity,
                                label: localizedAuditEntityLabel(l10n, entity),
                              ),
                            ),
                          ],
                          onChanged: (value) async {
                            setState(() => _selectedEntity = value);
                            await _load();
                          },
                        ),
                        SizedBox(height: context.dashSpacing * 0.5),
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton(
                                onPressed: () => _pickDate(isFrom: true),
                                child: Text(
                                  _dateFrom == null
                                      ? l10n.adminAuditFromDate
                                      : l10n.adminAuditFromDateValue(
                                          '${_dateFrom!.day}/${_dateFrom!.month}/${_dateFrom!.year}',
                                        ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            ),
                            SizedBox(width: context.dashSpacing * 0.5),
                            Expanded(
                              child: OutlinedButton(
                                onPressed: () => _pickDate(isFrom: false),
                                child: Text(
                                  _dateTo == null
                                      ? l10n.adminAuditToDate
                                      : l10n.adminAuditToDateValue(
                                          '${_dateTo!.day}/${_dateTo!.month}/${_dateTo!.year}',
                                        ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: context.dashSpacing),
                  if (_logs.isEmpty)
                    AdminEmptyCard(message: l10n.adminAuditNoLogs)
                  else
                    ..._logs.map((log) => AdminAuditLogCard(log: log)),
                ],
              ),
            ),
    );
  }
}

class _AuditFilterOption<T> {
  const _AuditFilterOption({required this.value, required this.label});

  final T value;
  final String label;
}

class _AuditFilterDropdown<T> extends StatelessWidget {
  const _AuditFilterDropdown({
    required this.label,
    required this.value,
    required this.items,
    required this.onChanged,
  });

  final String label;
  final T value;
  final List<_AuditFilterOption<T>> items;
  final ValueChanged<T?> onChanged;

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<T>(
      key: ValueKey('$label-$value'),
      isExpanded: true,
      initialValue: value,
      decoration: InputDecoration(labelText: label, isDense: true),
      items: items
          .map(
            (item) => DropdownMenuItem<T>(
              value: item.value,
              child: Text(
                item.label,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          )
          .toList(),
      selectedItemBuilder: (context) => items
          .map(
            (item) => Align(
              alignment: AlignmentDirectional.centerStart,
              child: Text(
                item.label,
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
