import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/auth/models/auth_user.dart';
import 'package:mobile_app/features/auth/providers/auth_provider.dart';
import 'package:mobile_app/features/dashboard/data/specialist_reports_repository.dart';
import 'package:mobile_app/features/dashboard/models/specialist_ai_report_generation.dart';
import 'package:mobile_app/features/dashboard/models/specialist_regular_report_creation.dart';
import 'package:mobile_app/features/dashboard/presentation/specialist/specialist_scoped_localization_utils.dart';
import 'package:mobile_app/features/dashboard/providers/specialist_reports_provider.dart';
import 'package:mobile_app/l10n/app_localizations_en.dart';

class _ImmediateAuthNotifier extends AuthNotifier {
  _ImmediateAuthNotifier(
    super.repository,
    super.tokenStorage,
    AuthState initialState,
  ) {
    state = initialState;
  }

  @override
  Future<void> restoreSession() async {}
}

bool _isCreateRegularPath(String path) {
  return path == '/reports' || path.endsWith('/reports');
}

bool _isGenerateAiPath(String path) {
  return path.contains('/ai/reports/generate-');
}

bool _isExportPdfPath(String path) {
  return path.contains('/export-pdf');
}

Dio _createReportsDio({
  required List<String> postedPaths,
  required List<Map<String, dynamic>> postedBodies,
  Map<String, dynamic>? createResponse,
  int? createStatus,
  String? createMessage,
  int createDelayMs = 0,
  int createCallsToDelay = 1,
  int generateDelayMs = 0,
  void Function()? onListReload,
  List<Map<String, dynamic>> listRows = const [],
}) {
  final dio = Dio();
  var createCalls = 0;
  var createdRow = ApiResponseParserData(createResponse);

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final path = options.path;
        final method = options.method.toUpperCase();

        if (method == 'POST' && _isCreateRegularPath(path)) {
          createCalls += 1;
          postedPaths.add(path);
          final data = options.data;
          postedBodies.add(
            data is Map
                ? data.map((key, value) => MapEntry(key.toString(), value))
                : <String, dynamic>{},
          );

          if (createDelayMs > 0 && createCalls <= createCallsToDelay) {
            await Future<void>.delayed(Duration(milliseconds: createDelayMs));
          }

          if (createStatus != null && createStatus >= 400) {
            handler.reject(
              DioException(
                requestOptions: options,
                type: DioExceptionType.badResponse,
                response: Response(
                  requestOptions: options,
                  statusCode: createStatus,
                  data: {
                    'success': false,
                    'message': createMessage ?? 'Request failed.',
                  },
                ),
              ),
            );
            return;
          }

          final response = createResponse ??
              {
                'success': true,
                'message': 'Report created successfully',
                'data': {
                  'id': 'regular-1',
                  'patient_id': 'patient-1',
                  'report_type': 'weekly',
                  'title': 'Optional stored title',
                  'summary': 'Plain summary',
                  'pdf_url': null,
                  'created_at': '2026-08-13T10:00:00.000Z',
                },
              };
          createdRow = ApiResponseParserData(response);
          handler.resolve(
            Response(
              requestOptions: options,
              statusCode: 201,
              data: response,
            ),
          );
          return;
        }

        if (method == 'POST' && _isGenerateAiPath(path)) {
          postedPaths.add(path);
          final data = options.data;
          postedBodies.add(
            data is Map
                ? data.map((key, value) => MapEntry(key.toString(), value))
                : <String, dynamic>{},
          );
          if (generateDelayMs > 0) {
            await Future<void>.delayed(Duration(milliseconds: generateDelayMs));
          }
          handler.resolve(
            Response(
              requestOptions: options,
              statusCode: 201,
              data: {
                'success': true,
                'data': {
                  'id': 'ai-1',
                  'patient_id': 'patient-1',
                  'type': 'weekly',
                },
              },
            ),
          );
          return;
        }

        if (method == 'POST' && _isExportPdfPath(path)) {
          postedPaths.add(path);
          handler.resolve(
            Response(
              requestOptions: options,
              statusCode: 200,
              data: const {'success': true, 'data': {}},
            ),
          );
          return;
        }

        if (method == 'GET') {
          onListReload?.call();
          final isAiList = path.contains('/ai/reports');
          handler.resolve(
            Response(
              requestOptions: options,
              data: {
                'success': true,
                'data': isAiList
                    ? const []
                    : [
                        ...listRows,
                        if (createdRow.row != null) createdRow.row!,
                      ],
              },
            ),
          );
          return;
        }

        handler.resolve(
          Response(
            requestOptions: options,
            data: const {'success': true, 'data': {}},
          ),
        );
      },
    ),
  );

  return dio;
}

class ApiResponseParserData {
  ApiResponseParserData(Map<String, dynamic>? response)
      : row = _rowFrom(response);

  Map<String, dynamic>? row;

  static Map<String, dynamic>? _rowFrom(Map<String, dynamic>? response) {
    final data = response?['data'];
    if (data is Map) {
      return data.map((key, value) => MapEntry(key.toString(), value));
    }
    return null;
  }
}

List<Override> _reportsNotifierOverrides(
  SpecialistReportsRepository repository,
) {
  return [
    specialistReportsRepositoryProvider.overrideWithValue(repository),
    authProvider.overrideWith((ref) {
      return _ImmediateAuthNotifier(
        ref.watch(authRepositoryProvider),
        ref.watch(tokenStorageProvider),
        const AuthState(
          isInitializing: false,
          token: 'test-token',
          user: AuthUser(
            id: 'specialist-1',
            fullName: 'Dr. Test',
            email: 'specialist@example.com',
            role: 'specialist',
          ),
        ),
      );
    }),
  ];
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('SpecialistRegularReportType', () {
    test('A weekly maps to weekly', () {
      expect(SpecialistRegularReportType.weekly.apiValue, 'weekly');
    });

    test('B monthly maps to monthly', () {
      expect(SpecialistRegularReportType.monthly.apiValue, 'monthly');
    });

    test('C assessment maps to assessment', () {
      expect(SpecialistRegularReportType.assessment.apiValue, 'assessment');
    });

    test('D progress maps to progress', () {
      expect(SpecialistRegularReportType.progress.apiValue, 'progress');
    });

    test('is distinct from SpecialistAiReportType', () {
      expect(
        SpecialistRegularReportType.weekly.apiValue,
        SpecialistAiReportType.weekly.apiValue,
      );
      expect(
        SpecialistRegularReportType.weekly,
        isNot(SpecialistAiReportType.weekly),
      );
      expect(SpecialistRegularReportType.values.length, 4);
      expect(SpecialistAiReportType.values.length, 2);
    });
  });

  group('SpecialistRegularReportCreateRequest', () {
    test('E-H sends patient_id and omits forbidden fields', () {
      final body = const SpecialistRegularReportCreateRequest(
        patientId: 'patient-1',
        reportType: SpecialistRegularReportType.weekly,
        title: 'Stored title',
        summary: 'Plain text',
      ).toJson();

      expect(body['patient_id'], 'patient-1');
      expect(body['report_type'], 'weekly');
      expect(body['title'], 'Stored title');
      expect(body['summary'], 'Plain text');
      expect(body.containsKey('generated_by'), isFalse);
      expect(body.containsKey('specialist_id'), isFalse);
      expect(body.containsKey('pdf_url'), isFalse);
      expect(body.containsKey('period_start'), isFalse);
      expect(body.containsKey('period_end'), isFalse);
      expect(body.containsKey('status'), isFalse);
    });

    test('I optional empty title omitted', () {
      final body = const SpecialistRegularReportCreateRequest(
        patientId: 'patient-1',
        reportType: SpecialistRegularReportType.monthly,
        title: '   ',
      ).toJson();

      expect(body.containsKey('title'), isFalse);
    });

    test('J optional empty summary omitted', () {
      final body = const SpecialistRegularReportCreateRequest(
        patientId: 'patient-1',
        reportType: SpecialistRegularReportType.progress,
        summary: '  ',
      ).toJson();

      expect(body.containsKey('summary'), isFalse);
    });
  });

  group('validateSpecialistRegularReportCreation', () {
    test('K title over 200 is rejected client-side', () {
      expect(
        validateSpecialistRegularReportCreation(
          patientId: 'patient-1',
          reportType: SpecialistRegularReportType.weekly,
          title: 'a' * 201,
        ),
        'title must be 200 characters or fewer',
      );
    });

    test('title of 200 is accepted and title/summary are optional', () {
      expect(
        validateSpecialistRegularReportCreation(
          patientId: 'patient-1',
          reportType: SpecialistRegularReportType.assessment,
          title: 'a' * 200,
        ),
        isNull,
      );
      expect(
        validateSpecialistRegularReportCreation(
          patientId: 'patient-1',
          reportType: SpecialistRegularReportType.progress,
        ),
        isNull,
      );
    });

    test('requires patient and report type', () {
      expect(
        validateSpecialistRegularReportCreation(
          patientId: '  ',
          reportType: SpecialistRegularReportType.weekly,
        ),
        'Patient is required.',
      );
      expect(
        validateSpecialistRegularReportCreation(
          patientId: 'patient-1',
          reportType: null,
        ),
        'report_type must be weekly, monthly, assessment, or progress',
      );
    });
  });

  group('SpecialistReportsRepository.createRegularReport', () {
    test('L maps successful response with existing regular model', () async {
      final postedPaths = <String>[];
      final postedBodies = <Map<String, dynamic>>[];
      final repository = SpecialistReportsRepository(
        _createReportsDio(
          postedPaths: postedPaths,
          postedBodies: postedBodies,
        ),
      );

      final detail = await repository.createRegularReport(
        const SpecialistRegularReportCreateRequest(
          patientId: 'patient-1',
          reportType: SpecialistRegularReportType.weekly,
          title: 'Optional stored title',
          summary: 'Plain summary',
        ),
      );

      expect(postedPaths.single, '/reports');
      expect(postedBodies.single['patient_id'], 'patient-1');
      expect(postedBodies.single['report_type'], 'weekly');
      expect(postedBodies.single.containsKey('generated_by'), isFalse);
      expect(postedBodies.single.containsKey('specialist_id'), isFalse);
      expect(postedBodies.single.containsKey('pdf_url'), isFalse);
      expect(detail.id, 'regular-1');
      expect(detail.isAiReport, isFalse);
      expect(detail.patientId, 'patient-1');
      expect(detail.reportType, 'weekly');
      expect(detail.title, 'Optional stored title');
      expect(detail.hasPdf, isFalse);
    });

    test('O preserves backend error message', () async {
      final repository = SpecialistReportsRepository(
        _createReportsDio(
          postedPaths: [],
          postedBodies: [],
          createStatus: 403,
          createMessage: 'You do not have access to this patient.',
        ),
      );

      try {
        await repository.createRegularReport(
          const SpecialistRegularReportCreateRequest(
            patientId: 'patient-b',
            reportType: SpecialistRegularReportType.weekly,
          ),
        );
        fail('expected creation exception');
      } on SpecialistRegularReportCreationException catch (error) {
        expect(error.statusCode, 403);
        expect(error.message, 'You do not have access to this patient.');
      }
    });
  });

  group('SpecialistReportsNotifier regular creation', () {
    test('M successful create refreshes Reports', () async {
      var listReloads = 0;
      final container = ProviderContainer(
        overrides: _reportsNotifierOverrides(
          SpecialistReportsRepository(
            _createReportsDio(
              postedPaths: [],
              postedBodies: [],
              onListReload: () => listReloads += 1,
            ),
          ),
        ),
      );
      addTearDown(container.dispose);

      final notifier = container.read(specialistReportsProvider(null).notifier);
      final ok = await notifier.createRegularReport(
        patientId: 'patient-1',
        reportType: SpecialistRegularReportType.weekly,
        title: 'Optional stored title',
        summary: 'Plain summary',
      );

      expect(ok, isTrue);
      expect(notifier.state.isCreatingRegularReport, isFalse);
      expect(listReloads, greaterThan(0));
      expect(notifier.state.reports, isNotEmpty);
      expect(notifier.state.reports.first.id, 'regular-1');
      expect(notifier.state.reports.first.isAiReport, isFalse);
    });

    test('N blocks duplicate concurrent create', () async {
      final postedPaths = <String>[];
      final container = ProviderContainer(
        overrides: _reportsNotifierOverrides(
          SpecialistReportsRepository(
            _createReportsDio(
              postedPaths: postedPaths,
              postedBodies: [],
              createDelayMs: 80,
            ),
          ),
        ),
      );
      addTearDown(container.dispose);

      final notifier = container.read(specialistReportsProvider(null).notifier);
      final first = notifier.createRegularReport(
        patientId: 'patient-1',
        reportType: SpecialistRegularReportType.weekly,
      );
      final second = notifier.createRegularReport(
        patientId: 'patient-1',
        reportType: SpecialistRegularReportType.monthly,
      );

      final results = await Future.wait([first, second]);
      expect(results.where((ok) => ok).length, 1);
      expect(postedPaths, ['/reports']);
    });

    test('O stores backend error without mixing AI or PDF state', () async {
      final postedPaths = <String>[];
      final container = ProviderContainer(
        overrides: _reportsNotifierOverrides(
          SpecialistReportsRepository(
            _createReportsDio(
              postedPaths: postedPaths,
              postedBodies: [],
              createStatus: 400,
              createMessage: 'report_type is required',
            ),
          ),
        ),
      );
      addTearDown(container.dispose);

      final notifier = container.read(specialistReportsProvider(null).notifier);
      final detailNotifier = container.read(
        specialistReportDetailProvider((
          reportId: 'regular-1',
          isAiReport: false,
        )).notifier,
      );

      final ok = await notifier.createRegularReport(
        patientId: 'patient-1',
        reportType: SpecialistRegularReportType.weekly,
      );

      expect(ok, isFalse);
      expect(notifier.state.regularCreationError, 'report_type is required');
      expect(notifier.state.generationError, isNull);
      expect(notifier.state.isGeneratingAiReport, isFalse);
      expect(notifier.state.isCreatingRegularReport, isFalse);
      expect(detailNotifier.state.isExporting, isFalse);
      expect(postedPaths.any(_isExportPdfPath), isFalse);
      expect(postedPaths.any(_isGenerateAiPath), isFalse);
    });

    test('P AI generation state remains independent', () async {
      final postedPaths = <String>[];
      final container = ProviderContainer(
        overrides: _reportsNotifierOverrides(
          SpecialistReportsRepository(
            _createReportsDio(
              postedPaths: postedPaths,
              postedBodies: [],
              generateDelayMs: 80,
            ),
          ),
        ),
      );
      addTearDown(container.dispose);

      final notifier = container.read(specialistReportsProvider(null).notifier);
      final ai = notifier.generateAiReport(
        patientId: 'patient-1',
        type: SpecialistAiReportType.weekly,
        periodStart: DateTime(2026, 8, 7),
        periodEnd: DateTime(2026, 8, 13),
      );
      final create = notifier.createRegularReport(
        patientId: 'patient-1',
        reportType: SpecialistRegularReportType.progress,
      );

      final results = await Future.wait([ai, create]);
      expect(results, [true, true]);
      expect(postedPaths.contains('/ai/reports/generate-weekly'), isTrue);
      expect(postedPaths.contains('/reports'), isTrue);
      expect(notifier.state.isGeneratingAiReport, isFalse);
      expect(notifier.state.isCreatingRegularReport, isFalse);
      expect(notifier.state.generationError, isNull);
      expect(notifier.state.regularCreationError, isNull);
    });

    test('Q Generate PDF state is unchanged', () async {
      final postedPaths = <String>[];
      final container = ProviderContainer(
        overrides: _reportsNotifierOverrides(
          SpecialistReportsRepository(
            _createReportsDio(
              postedPaths: postedPaths,
              postedBodies: [],
            ),
          ),
        ),
      );
      addTearDown(container.dispose);

      final notifier = container.read(specialistReportsProvider(null).notifier);
      final detailNotifier = container.read(
        specialistReportDetailProvider((
          reportId: 'regular-1',
          isAiReport: false,
        )).notifier,
      );

      expect(detailNotifier.state.isExporting, isFalse);
      final ok = await notifier.createRegularReport(
        patientId: 'patient-1',
        reportType: SpecialistRegularReportType.assessment,
      );

      expect(ok, isTrue);
      expect(detailNotifier.state.isExporting, isFalse);
      expect(postedPaths.any(_isExportPdfPath), isFalse);
    });

    test('client validation does not POST and does not touch AI errors', () async {
      final postedPaths = <String>[];
      final container = ProviderContainer(
        overrides: _reportsNotifierOverrides(
          SpecialistReportsRepository(
            _createReportsDio(
              postedPaths: postedPaths,
              postedBodies: [],
            ),
          ),
        ),
      );
      addTearDown(container.dispose);

      final notifier = container.read(specialistReportsProvider(null).notifier);
      final ok = await notifier.createRegularReport(
        patientId: 'patient-1',
        reportType: SpecialistRegularReportType.weekly,
        title: 'a' * 201,
      );

      expect(ok, isFalse);
      expect(
        notifier.state.regularCreationError,
        'title must be 200 characters or fewer',
      );
      expect(notifier.state.generationError, isNull);
      expect(postedPaths, isEmpty);
    });
  });

  group('mapSpecialistRegularReportCreationError', () {
    test('maps client validation and preserves backend messages', () {
      final l10n = AppLocalizationsEn();
      expect(
        mapSpecialistRegularReportCreationError(l10n, 'Patient is required.'),
        l10n.specialistAiReportPatientRequired,
      );
      expect(
        mapSpecialistRegularReportCreationError(
          l10n,
          'report_type must be weekly, monthly, assessment, or progress',
        ),
        l10n.specialistRegularReportTypeRequired,
      );
      expect(
        mapSpecialistRegularReportCreationError(
          l10n,
          'title must be 200 characters or fewer',
        ),
        l10n.specialistCreateReportTitleMaxLength,
      );
      expect(
        mapSpecialistRegularReportCreationError(
          l10n,
          'You do not have access to this patient.',
        ),
        'You do not have access to this patient.',
      );
    });
  });
}
