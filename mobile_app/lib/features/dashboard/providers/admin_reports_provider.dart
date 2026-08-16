import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/api_client.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/admin_reports_repository.dart';
import '../models/specialist_reports_models.dart';

final adminReportsRepositoryProvider = Provider<AdminReportsRepository>((ref) {
  return AdminReportsRepository(ref.watch(dioProvider));
});

class AdminReportsState {
  const AdminReportsState({
    this.isLoading = false,
    this.errorMessage,
    this.reports = const [],
    this.searchQuery = '',
    this.filter = SpecialistReportFilter.all,
    this.hasAiReports = false,
  });

  final bool isLoading;
  final String? errorMessage;
  final List<SpecialistReportListItem> reports;
  final String searchQuery;
  final SpecialistReportFilter filter;
  final bool hasAiReports;

  List<SpecialistReportListItem> get visibleReports {
    final query = searchQuery.trim().toLowerCase();
    return reports.where((report) {
      if (!report.matchesFilter(filter)) {
        return false;
      }
      if (query.isEmpty) {
        return true;
      }
      final title = report.title.toLowerCase();
      final patient = (report.patientName ?? '').toLowerCase();
      return title.contains(query) || patient.contains(query);
    }).toList();
  }

  AdminReportsState copyWith({
    bool? isLoading,
    Object? errorMessage = _sentinel,
    List<SpecialistReportListItem>? reports,
    String? searchQuery,
    SpecialistReportFilter? filter,
    bool? hasAiReports,
  }) {
    return AdminReportsState(
      isLoading: isLoading ?? this.isLoading,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      reports: reports ?? this.reports,
      searchQuery: searchQuery ?? this.searchQuery,
      filter: filter ?? this.filter,
      hasAiReports: hasAiReports ?? this.hasAiReports,
    );
  }
}

final adminReportsProvider =
    StateNotifierProvider<AdminReportsNotifier, AdminReportsState>((ref) {
  return AdminReportsNotifier(
    ref,
    ref.watch(adminReportsRepositoryProvider),
  );
});

class AdminReportsNotifier extends StateNotifier<AdminReportsState> {
  AdminReportsNotifier(this._ref, this._repository)
      : super(const AdminReportsState());

  final Ref _ref;
  final AdminReportsRepository _repository;

  void _ensureAuthToken() {
    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _ref.read(authRepositoryProvider).setAuthToken(token);
    }
  }

  Future<void> initialize() async {
    _ensureAuthToken();
    state = state.copyWith(isLoading: true, errorMessage: null);

    final role = _ref.read(authProvider).user?.role?.trim().toLowerCase();
    if (role != 'admin') {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Please sign in as an admin to view reports.',
      );
      return;
    }

    try {
      final reports = await _repository.fetchReports();
      final hasAi = reports.any((report) => report.isAiReport);
      state = state.copyWith(
        isLoading: false,
        reports: reports,
        hasAiReports: hasAi,
      );
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load reports: $error',
      );
    }
  }

  Future<void> refresh() => initialize();

  void setSearchQuery(String value) =>
      state = state.copyWith(searchQuery: value);

  void setFilter(SpecialistReportFilter filter) =>
      state = state.copyWith(filter: filter);
}

const _sentinel = Object();
