import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../data/admin_features_repository.dart';
import '../../providers/admin_features_provider.dart';
import '../../widgets/admin_page_scaffold.dart';
import '../../widgets/admin_status_badge.dart';
import '../../widgets/admin_ui_components.dart';
import '../../widgets/dashboard_layout.dart';

class AdminAiCenterScreen extends ConsumerStatefulWidget {
  const AdminAiCenterScreen({super.key});

  @override
  ConsumerState<AdminAiCenterScreen> createState() => _AdminAiCenterScreenState();
}

class _AdminAiCenterScreenState extends ConsumerState<AdminAiCenterScreen> {
  bool _isLoading = true;
  String? _error;
  AdminAiCenterData _data = const AdminAiCenterData();

  final GlobalKey _attentionSectionKey = GlobalKey();
  final GlobalKey _speechSectionKey = GlobalKey();
  final GlobalKey _recommendationsSectionKey = GlobalKey();

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
      final data = await repo.fetchAiCenter();
      if (mounted) {
        setState(() {
          _isLoading = false;
          _data = data;
        });
      }
    } catch (error) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _error = 'Failed to load AI Center: $error';
        });
      }
    }
  }

  Future<void> _scrollToSection(GlobalKey key) async {
    final targetContext = key.currentContext;
    if (targetContext == null || !mounted) {
      return;
    }

    await Scrollable.ensureVisible(
      targetContext,
      duration: const Duration(milliseconds: 350),
      curve: Curves.easeOutCubic,
      alignment: 0.08,
    );
  }

  Future<void> _openPatientDetails(String? patientId) async {
    final id = patientId?.trim();
    if (id == null || id.isEmpty || !mounted) {
      return;
    }
    await context.push(AppRoutes.adminPatientDetails(id));
  }

  Future<void> _openAiReportDetails(String? reportId) async {
    final id = reportId?.trim();
    if (id == null || id.isEmpty || !mounted) {
      return;
    }
    await context.push(AppRoutes.adminReportDetails(id, isAi: true));
  }

  String? _readId(Map<String, dynamic> item, List<String> keys) {
    for (final key in keys) {
      final value = item[key];
      if (value == null) {
        continue;
      }
      final text = value.toString().trim();
      if (text.isNotEmpty) {
        return text;
      }
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return AdminPageScaffold(
      title: 'AI Center',
      showBackButton: true,
      showBottomNav: false,
      body: _isLoading
          ? const AdminLoadingCard()
          : RefreshIndicator(
              onRefresh: _load,
              color: DashboardColors.primary,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: context.dashPadding,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const AdminPageTitle(
                      title: 'AI Insights',
                      subtitle:
                          'Speech analysis, recommendations, and clinical reports',
                    ),
                    SizedBox(height: context.dashSpacing),
                    if (_error != null)
                      AdminErrorCard(message: _error!, onRetry: _load),
                    AdminMetricGrid(
                      cards: [
                        AdminMetricCard(
                          label: 'Speech Analyses',
                          value: '${_data.speechTotal}',
                          subtitle:
                              'Avg score ${_data.speechAverageScore.toStringAsFixed(1)}',
                          icon: Icons.mic_outlined,
                          iconColor: DashboardColors.primary,
                          iconBackground: DashboardColors.blueSoft,
                          onTap: () => _scrollToSection(_speechSectionKey),
                        ),
                        AdminMetricCard(
                          label: 'AI Recommendations',
                          value: '${_data.recommendationsTotal}',
                          icon: Icons.auto_awesome_outlined,
                          iconColor: DashboardColors.success,
                          iconBackground: DashboardColors.tealSoft,
                          onTap: () =>
                              _scrollToSection(_recommendationsSectionKey),
                        ),
                        AdminMetricCard(
                          label: 'AI Reports',
                          value: '${_data.reportsTotal}',
                          icon: Icons.summarize_outlined,
                          iconColor: DashboardColors.warning,
                          iconBackground: DashboardColors.amberSoft,
                          onTap: () => context.push(AppRoutes.adminReports),
                        ),
                        AdminMetricCard(
                          label: 'Needs Attention',
                          value: '${_data.patientsNeedingAttention.length}',
                          subtitle:
                              '${_data.usageStatistics['pending_recommendations'] ?? 0} pending reviews',
                          icon: Icons.warning_amber_rounded,
                          iconColor: DashboardColors.highPriority,
                          iconBackground: DashboardColors.amberSoft,
                          onTap: () => _scrollToSection(_attentionSectionKey),
                        ),
                      ],
                    ),
                    SizedBox(height: context.dashSpacing),
                    KeyedSubtree(
                      key: _attentionSectionKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          const AdminSectionHeader(
                            title: 'Patients Needing Attention',
                          ),
                          SizedBox(height: context.dashSpacing * 0.5),
                          if (_data.patientsNeedingAttention.isEmpty)
                            const AdminEmptyCard(
                              message: 'No patients flagged for low scores.',
                            )
                          else
                            AdminTableContainer(
                              onRowTaps: _data.patientsNeedingAttention
                                  .map((patient) {
                                    final patientId = _readId(
                                      patient,
                                      const ['id', 'patient_id', 'patientId'],
                                    );
                                    if (patientId == null) {
                                      return null;
                                    }
                                    return () => _openPatientDetails(patientId);
                                  })
                                  .toList(),
                              rows: _data.patientsNeedingAttention
                                  .map(
                                    (patient) => Row(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        const AdminIconCircle(
                                          icon: Icons.person_outline_rounded,
                                          color: DashboardColors.highPriority,
                                          background:
                                              DashboardColors.amberSoft,
                                          size: 40,
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: Text(
                                            '${patient['full_name'] ?? 'Patient'}',
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodyMedium
                                                ?.copyWith(
                                                  fontWeight: FontWeight.w700,
                                                ),
                                          ),
                                        ),
                                        if (patient['speech_score'] !=
                                            null) ...[
                                          const SizedBox(width: 8),
                                          Flexible(
                                            child: AdminStatusBadge(
                                              label:
                                                  'Speech ${patient['speech_score']}',
                                              color:
                                                  DashboardColors.highPriority,
                                            ),
                                          ),
                                        ],
                                      ],
                                    ),
                                  )
                                  .toList(),
                            ),
                        ],
                      ),
                    ),
                    SizedBox(height: context.dashSpacing),
                    KeyedSubtree(
                      key: _speechSectionKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          const AdminSectionHeader(
                            title: 'Latest Speech Analyses',
                          ),
                          SizedBox(height: context.dashSpacing * 0.5),
                          ..._buildRecordList(
                            _data.latestSpeech,
                            icon: Icons.graphic_eq_rounded,
                            iconColor: DashboardColors.primary,
                            iconBackground: DashboardColors.blueSoft,
                            titleKey: 'patient_name',
                            subtitleBuilder: (item) =>
                                'Score ${item['overall_score'] ?? '—'} • ${_formatDate(item['analyzed_at'])}',
                            resolveTap: (item) {
                              final patientId = _readId(item, const [
                                'patient_id',
                                'patientId',
                              ]);
                              if (patientId == null) {
                                return null;
                              }
                              return () => _openPatientDetails(patientId);
                            },
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: context.dashSpacing),
                    KeyedSubtree(
                      key: _recommendationsSectionKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          const AdminSectionHeader(
                            title: 'Latest AI Recommendations',
                          ),
                          SizedBox(height: context.dashSpacing * 0.5),
                          ..._buildRecordList(
                            _data.latestRecommendations,
                            icon: Icons.lightbulb_outline_rounded,
                            iconColor: DashboardColors.success,
                            iconBackground: DashboardColors.tealSoft,
                            titleKey: 'patient_name',
                            subtitleBuilder: (item) =>
                                '${item['type'] ?? 'recommendation'} • ${item['status'] ?? 'pending'}',
                            badgeBuilder: (item) => AdminStatusBadge(
                              label: '${item['status'] ?? 'pending'}',
                              color: _statusColor('${item['status']}'),
                            ),
                            resolveTap: (item) {
                              final patientId = _readId(item, const [
                                'patient_id',
                                'patientId',
                              ]);
                              if (patientId == null) {
                                return null;
                              }
                              return () => _openPatientDetails(patientId);
                            },
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: context.dashSpacing),
                    const AdminSectionHeader(title: 'Latest AI Reports'),
                    SizedBox(height: context.dashSpacing * 0.5),
                    ..._buildRecordList(
                      _data.latestReports,
                      icon: Icons.description_outlined,
                      iconColor: DashboardColors.warning,
                      iconBackground: DashboardColors.amberSoft,
                      titleKey: 'patient_name',
                      subtitleBuilder: (item) =>
                          '${item['type'] ?? 'report'} • ${_formatDate(item['generated_at'])}',
                      resolveTap: (item) {
                        final reportId = _readId(item, const [
                          'id',
                          'report_id',
                          'reportId',
                        ]);
                        if (reportId == null) {
                          return null;
                        }
                        return () => _openAiReportDetails(reportId);
                      },
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  List<Widget> _buildRecordList(
    List<Map<String, dynamic>> items, {
    required IconData icon,
    required Color iconColor,
    required Color iconBackground,
    required String titleKey,
    required String Function(Map<String, dynamic> item) subtitleBuilder,
    Widget Function(Map<String, dynamic> item)? badgeBuilder,
    VoidCallback? Function(Map<String, dynamic> item)? resolveTap,
  }) {
    if (items.isEmpty) {
      return [const AdminEmptyCard(message: 'No records yet.')];
    }

    return items
        .map(
          (item) {
            final onTap = resolveTap?.call(item);
            return Padding(
              padding: EdgeInsets.only(bottom: context.dashSpacing * 0.5),
              child: AdminSurfaceCard(
                onTap: onTap,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AdminIconCircle(
                      icon: icon,
                      color: iconColor,
                      background: iconBackground,
                      size: 40,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${item[titleKey] ?? 'Record'}',
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  fontWeight: FontWeight.w700,
                                  color: DashboardColors.textPrimary,
                                ),
                          ),
                          Text(
                            subtitleBuilder(item),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: DashboardColors.textSecondary,
                                ),
                          ),
                        ],
                      ),
                    ),
                    if (badgeBuilder != null) ...[
                      const SizedBox(width: 8),
                      Flexible(child: badgeBuilder(item)),
                    ],
                  ],
                ),
              ),
            );
          },
        )
        .toList();
  }

  Color _statusColor(String status) {
    switch (status.toLowerCase()) {
      case 'accepted':
        return DashboardColors.success;
      case 'rejected':
        return DashboardColors.highPriority;
      default:
        return DashboardColors.warning;
    }
  }

  String _formatDate(Object? value) {
    if (value == null) {
      return 'Recently';
    }
    final parsed = DateTime.tryParse(value.toString());
    if (parsed == null) {
      return value.toString();
    }
    final local = parsed.toLocal();
    return '${local.day}/${local.month}/${local.year}';
  }
}
