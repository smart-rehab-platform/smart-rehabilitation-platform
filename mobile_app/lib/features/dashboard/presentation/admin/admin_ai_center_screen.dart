import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/admin_dashboard_colors.dart';
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
              color: AdminDashboardColors.primary,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: context.dashPadding,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const AdminPageTitle(
                      title: 'AI Insights',
                      subtitle: 'Speech analysis, recommendations, and clinical reports',
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
                          iconColor: AdminDashboardColors.primary,
                          iconBackground: AdminDashboardColors.blueSoft,
                        ),
                        AdminMetricCard(
                          label: 'AI Recommendations',
                          value: '${_data.recommendationsTotal}',
                          icon: Icons.auto_awesome_outlined,
                          iconColor: AdminDashboardColors.emerald,
                          iconBackground: AdminDashboardColors.emeraldSoft,
                        ),
                        AdminMetricCard(
                          label: 'AI Reports',
                          value: '${_data.reportsTotal}',
                          icon: Icons.summarize_outlined,
                          iconColor: AdminDashboardColors.orange,
                          iconBackground: AdminDashboardColors.orangeSoft,
                        ),
                        AdminMetricCard(
                          label: 'Needs Attention',
                          value: '${_data.patientsNeedingAttention.length}',
                          subtitle:
                              '${_data.usageStatistics['pending_recommendations'] ?? 0} pending reviews',
                          icon: Icons.warning_amber_rounded,
                          iconColor: AdminDashboardColors.danger,
                          iconBackground: AdminDashboardColors.redSoft,
                        ),
                      ],
                    ),
                    SizedBox(height: context.dashSpacing),
                    const AdminSectionHeader(title: 'Patients Needing Attention'),
                    SizedBox(height: context.dashSpacing * 0.5),
                    if (_data.patientsNeedingAttention.isEmpty)
                      const AdminEmptyCard(message: 'No patients flagged for low scores.')
                    else
                      AdminTableContainer(
                        rows: _data.patientsNeedingAttention
                            .map(
                              (patient) => Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const AdminIconCircle(
                                    icon: Icons.person_outline_rounded,
                                    color: AdminDashboardColors.danger,
                                    background: AdminDashboardColors.redSoft,
                                    size: 40,
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      '${patient['full_name'] ?? 'Patient'}',
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                            fontWeight: FontWeight.w700,
                                          ),
                                    ),
                                  ),
                                  if (patient['speech_score'] != null) ...[
                                    const SizedBox(width: 8),
                                    Flexible(
                                      child: AdminStatusBadge(
                                        label: 'Speech ${patient['speech_score']}',
                                        color: AdminDashboardColors.danger,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            )
                            .toList(),
                      ),
                    SizedBox(height: context.dashSpacing),
                    const AdminSectionHeader(title: 'Latest Speech Analyses'),
                    SizedBox(height: context.dashSpacing * 0.5),
                    ..._buildRecordList(
                      _data.latestSpeech,
                      icon: Icons.graphic_eq_rounded,
                      iconColor: AdminDashboardColors.primary,
                      iconBackground: AdminDashboardColors.blueSoft,
                      titleKey: 'patient_name',
                      subtitleBuilder: (item) =>
                          'Score ${item['overall_score'] ?? '—'} • ${_formatDate(item['analyzed_at'])}',
                    ),
                    SizedBox(height: context.dashSpacing),
                    const AdminSectionHeader(title: 'Latest AI Recommendations'),
                    SizedBox(height: context.dashSpacing * 0.5),
                    ..._buildRecordList(
                      _data.latestRecommendations,
                      icon: Icons.lightbulb_outline_rounded,
                      iconColor: AdminDashboardColors.emerald,
                      iconBackground: AdminDashboardColors.emeraldSoft,
                      titleKey: 'patient_name',
                      subtitleBuilder: (item) =>
                          '${item['type'] ?? 'recommendation'} • ${item['status'] ?? 'pending'}',
                      badgeBuilder: (item) => AdminStatusBadge(
                        label: '${item['status'] ?? 'pending'}',
                        color: _statusColor('${item['status']}'),
                      ),
                    ),
                    SizedBox(height: context.dashSpacing),
                    const AdminSectionHeader(title: 'Latest AI Reports'),
                    SizedBox(height: context.dashSpacing * 0.5),
                    ..._buildRecordList(
                      _data.latestReports,
                      icon: Icons.description_outlined,
                      iconColor: AdminDashboardColors.orange,
                      iconBackground: AdminDashboardColors.orangeSoft,
                      titleKey: 'patient_name',
                      subtitleBuilder: (item) =>
                          '${item['type'] ?? 'report'} • ${_formatDate(item['generated_at'])}',
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
  }) {
    if (items.isEmpty) {
      return [const AdminEmptyCard(message: 'No records yet.')];
    }

    return items
        .map(
          (item) => Padding(
            padding: EdgeInsets.only(bottom: context.dashSpacing * 0.5),
            child: AdminSurfaceCard(
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
                                color: AdminDashboardColors.textPrimary,
                              ),
                        ),
                        Text(
                          subtitleBuilder(item),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: AdminDashboardColors.textSecondary,
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
          ),
        )
        .toList();
  }

  Color _statusColor(String status) {
    switch (status.toLowerCase()) {
      case 'accepted':
        return AdminDashboardColors.success;
      case 'rejected':
        return AdminDashboardColors.danger;
      default:
        return AdminDashboardColors.warning;
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
