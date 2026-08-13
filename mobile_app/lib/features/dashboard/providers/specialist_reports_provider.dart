import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/api_client.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/specialist_reports_repository.dart';
import '../models/specialist_reports_models.dart';

final specialistReportsRepositoryProvider =
    Provider<SpecialistReportsRepository>((ref) {
  return SpecialistReportsRepository(ref.watch(dioProvider));
});

class SpecialistReportsState {
  const SpecialistReportsState({
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

  SpecialistReportsState copyWith({
    bool? isLoading,
    Object? errorMessage = _sentinel,
    List<SpecialistReportListItem>? reports,
    String? searchQuery,
    SpecialistReportFilter? filter,
    bool? hasAiReports,
  }) {
    return SpecialistReportsState(
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

final specialistReportsProvider = StateNotifierProvider.family<
    SpecialistReportsNotifier,
    SpecialistReportsState,
    String?>((ref, patientId) {
  return SpecialistReportsNotifier(
    ref,
    ref.watch(specialistReportsRepositoryProvider),
    patientId,
  );
});

class SpecialistReportsNotifier extends StateNotifier<SpecialistReportsState> {
  SpecialistReportsNotifier(this._ref, this._repository, this._patientId)
      : super(const SpecialistReportsState());

  final Ref _ref;
  final SpecialistReportsRepository _repository;
  final String? _patientId;

  void _ensureAuthToken() {
    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _ref.read(authRepositoryProvider).setAuthToken(token);
    }
  }

  Future<void> initialize() async {
    _ensureAuthToken();
    state = state.copyWith(isLoading: true, errorMessage: null);

    final specialistUserId = _ref.read(authProvider).user?.id?.trim();
    if (specialistUserId == null || specialistUserId.isEmpty) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Please sign in to view reports.',
      );
      return;
    }

    try {
      final reports = await _repository.fetchReports(
        specialistUserId: specialistUserId,
        patientId: _patientId,
      );
      final hasAi = reports.any((report) => report.isAiReport);
      state = state.copyWith(
        isLoading: false,
        reports: reports,
        hasAiReports: hasAi,
      );
    } on SpecialistReportScopeException catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: error.toString(),
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

class SpecialistReportDetailState {
  const SpecialistReportDetailState({
    this.isLoading = false,
    this.isExporting = false,
    this.errorMessage,
    this.detail,
  });

  final bool isLoading;
  final bool isExporting;
  final String? errorMessage;
  final SpecialistReportDetail? detail;

  SpecialistReportDetailState copyWith({
    bool? isLoading,
    bool? isExporting,
    Object? errorMessage = _sentinel,
    SpecialistReportDetail? detail,
  }) {
    return SpecialistReportDetailState(
      isLoading: isLoading ?? this.isLoading,
      isExporting: isExporting ?? this.isExporting,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      detail: detail ?? this.detail,
    );
  }
}

typedef SpecialistReportDetailArgs = ({String reportId, bool isAiReport});

final specialistReportDetailProvider = StateNotifierProvider.family<
    SpecialistReportDetailNotifier,
    SpecialistReportDetailState,
    SpecialistReportDetailArgs>((ref, args) {
  return SpecialistReportDetailNotifier(
    ref,
    ref.watch(specialistReportsRepositoryProvider),
    args,
  );
});

class SpecialistReportDetailNotifier
    extends StateNotifier<SpecialistReportDetailState> {
  SpecialistReportDetailNotifier(this._ref, this._repository, this._args)
      : super(const SpecialistReportDetailState());

  final Ref _ref;
  final SpecialistReportsRepository _repository;
  final SpecialistReportDetailArgs _args;

  void _ensureAuthToken() {
    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _ref.read(authRepositoryProvider).setAuthToken(token);
    }
  }

  Future<void> initialize() async {
    _ensureAuthToken();
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final detail = await _repository.fetchReportDetail(
        reportId: _args.reportId,
        isAiReport: _args.isAiReport,
      );
      state = state.copyWith(isLoading: false, detail: detail);
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _formatLoadError(error),
      );
    }
  }

  String _formatLoadError(Object error) {
    if (error is ReportNotFoundException) {
      return error.toString();
    }
    final text = error.toString();
    if (text.contains('Report not found') ||
        text.contains('AI report not found')) {
      return _args.isAiReport ? 'AI report not found.' : 'Report not found.';
    }
    return 'Failed to load report. Please try again.';
  }

  Future<bool> generatePdf() async {
    _ensureAuthToken();
    state = state.copyWith(isExporting: true, errorMessage: null);

    try {
      final detail = await _repository.generateReportPdf(
        reportId: _args.reportId,
        isAiReport: _args.isAiReport,
      );
      state = state.copyWith(isExporting: false, detail: detail);
      return true;
    } catch (error) {
      state = state.copyWith(
        isExporting: false,
        errorMessage: 'Failed to generate PDF: $error',
      );
      return false;
    }
  }
}

const _sentinel = Object();
