import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/core/locale/locale_provider.dart';
import 'package:mobile_app/features/auth/data/token_storage.dart';
import 'package:mobile_app/features/auth/models/auth_user.dart';
import 'package:mobile_app/features/auth/providers/auth_provider.dart';
import 'package:mobile_app/features/dashboard/data/specialist_reports_repository.dart';
import 'package:mobile_app/features/dashboard/models/specialist_ai_report_generation.dart';
import 'package:mobile_app/features/dashboard/models/specialist_reports_models.dart';
import 'package:mobile_app/features/dashboard/providers/specialist_reports_provider.dart';

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

Dio _createReportsDio({
  required List<String> postedPaths,
  required List<Map<String, dynamic>> postedBodies,
  Map<String, dynamic>? generateResponse,
  int? generateStatus,
  String? generateMessage,
  int generateDelayMs = 0,
  int generateCallsToDelay = 1,
  void Function()? onListReload,
}) {
  final dio = Dio();
  var generateCalls = 0;

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final isGenerate = options.path.contains('/ai/reports/generate-');
        if (isGenerate) {
          generateCalls += 1;
          postedPaths.add(options.path);
          final data = options.data;
          postedBodies.add(
            data is Map
                ? data.map((key, value) => MapEntry(key.toString(), value))
                : <String, dynamic>{},
          );

          if (generateDelayMs > 0 && generateCalls <= generateCallsToDelay) {
            await Future<void>.delayed(Duration(milliseconds: generateDelayMs));
          }

          if (generateStatus != null && generateStatus >= 400) {
            handler.reject(
              DioException(
                requestOptions: options,
                type: DioExceptionType.badResponse,
                response: Response(
                  requestOptions: options,
                  statusCode: generateStatus,
                  data: {
                    'success': false,
                    'message': generateMessage ?? 'Request failed.',
                  },
                ),
              ),
            );
            return;
          }

          handler.resolve(
            Response(
              requestOptions: options,
              statusCode: 201,
              data: generateResponse ??
                  {
                    'success': true,
                    'message': 'Weekly AI report generated successfully',
                    'data': {
                      'id': 'report-1',
                      'patient_id': 'patient-1',
                      'type': 'weekly',
                      'period_start': '2026-08-07',
                      'period_end': '2026-08-13',
                      'summary': '{"executive_summary":"ok"}',
                      'generated_at': '2026-08-13T10:00:00.000Z',
                    },
                  },
            ),
          );
          return;
        }

        if (options.method == 'GET') {
          onListReload?.call();
          handler.resolve(
            Response(
              requestOptions: options,
              data: const {'success': true, 'data': []},
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

List<Override> _reportsNotifierOverrides(
  SpecialistReportsRepository repository, {
  Locale locale = const Locale('en'),
}) {
  return [
    specialistReportsRepositoryProvider.overrideWithValue(repository),
    localeProvider.overrideWith((ref) {
      final notifier = LocaleNotifier(const TokenStorage());
      notifier.state = locale;
      return notifier;
    }),
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
  group('SpecialistAiReportGenerateRequest', () {
    test('weekly chooses generate-weekly and serializes YYYY-MM-DD', () {
      final request = SpecialistAiReportGenerateRequest(
        patientId: 'patient-1',
        type: SpecialistAiReportType.weekly,
        periodStart: DateTime(2026, 8, 7),
        periodEnd: DateTime(2026, 8, 13),
      );

      expect(request.type.generatePath, '/ai/reports/generate-weekly');
      expect(request.toJson(), {
        'patient_id': 'patient-1',
        'period_start': '2026-08-07',
        'period_end': '2026-08-13',
        'language': 'en',
      });
      expect(request.toJson().containsKey('specialist_id'), isFalse);
    });

    test('serializes Arabic language from locale variants', () {
      final request = SpecialistAiReportGenerateRequest(
        patientId: 'patient-1',
        type: SpecialistAiReportType.weekly,
        periodStart: DateTime(2026, 8, 7),
        periodEnd: DateTime(2026, 8, 13),
        language: 'ar-SA',
      );

      expect(request.toJson()['language'], 'ar');
      expect(normalizeAiReportLanguage('en-GB'), 'en');
      expect(normalizeAiReportLanguage(null), 'en');
    });

    test('monthly chooses generate-monthly and does not send specialist_id', () {
      final request = SpecialistAiReportGenerateRequest(
        patientId: 'patient-9',
        type: SpecialistAiReportType.monthly,
        periodStart: DateTime(2026, 7, 14),
        periodEnd: DateTime(2026, 8, 13),
      );

      expect(request.type.generatePath, '/ai/reports/generate-monthly');
      expect(request.toJson()['patient_id'], 'patient-9');
      expect(request.toJson()['period_start'], '2026-07-14');
      expect(request.toJson()['period_end'], '2026-08-13');
      expect(request.toJson().containsKey('specialist_id'), isFalse);
    });

    test('date serialization does not use locale slashes', () {
      expect(formatSpecialistAiReportDate(DateTime(2026, 8, 13)), '2026-08-13');
      expect(formatSpecialistAiReportDate(DateTime(2026, 8, 13)), isNot(contains('/')));
    });
  });

  group('defaultWeeklyAiReportPeriod', () {
    test('covers last 7 calendar days inclusive', () {
      final period = defaultWeeklyAiReportPeriod(DateTime(2026, 8, 13));
      expect(formatSpecialistAiReportDate(period.start), '2026-08-07');
      expect(formatSpecialistAiReportDate(period.end), '2026-08-13');
    });
  });

  group('defaultMonthlyAiReportPeriod', () {
    test('covers last 30 calendar days inclusive', () {
      final period = defaultMonthlyAiReportPeriod(DateTime(2026, 8, 13));
      expect(formatSpecialistAiReportDate(period.start), '2026-07-15');
      expect(formatSpecialistAiReportDate(period.end), '2026-08-13');
    });
  });

  group('defaultPeriodForSpecialistAiReportType', () {
    test('weekly maps to 7-day default and monthly maps to 30-day default', () {
      final now = DateTime(2026, 8, 13);
      final weekly = defaultPeriodForSpecialistAiReportType(
        SpecialistAiReportType.weekly,
        now,
      );
      final monthly = defaultPeriodForSpecialistAiReportType(
        SpecialistAiReportType.monthly,
        now,
      );

      expect(formatSpecialistAiReportDate(weekly.start), '2026-08-07');
      expect(formatSpecialistAiReportDate(weekly.end), '2026-08-13');
      expect(formatSpecialistAiReportDate(monthly.start), '2026-07-15');
      expect(formatSpecialistAiReportDate(monthly.end), '2026-08-13');
    });
  });

  group('validateSpecialistAiReportGeneration', () {
    final today = DateTime(2026, 8, 13);

    test('rejects start after end', () {
      expect(
        validateSpecialistAiReportGeneration(
          patientId: 'p1',
          type: SpecialistAiReportType.weekly,
          periodStart: DateTime(2026, 8, 14),
          periodEnd: DateTime(2026, 8, 13),
          now: today,
        ),
        'period_start cannot be after period_end',
      );
    });

    test('rejects future end date', () {
      expect(
        validateSpecialistAiReportGeneration(
          patientId: 'p1',
          type: SpecialistAiReportType.weekly,
          periodStart: DateTime(2026, 8, 7),
          periodEnd: DateTime(2026, 8, 14),
          now: today,
        ),
        'Cannot generate report for a period that has not ended yet',
      );
    });

    test('accepts weekly range that is not exactly 7 days', () {
      expect(
        validateSpecialistAiReportGeneration(
          patientId: 'p1',
          type: SpecialistAiReportType.weekly,
          periodStart: DateTime(2026, 8, 1),
          periodEnd: DateTime(2026, 8, 13),
          now: today,
        ),
        isNull,
      );
    });
  });

  group('SpecialistReportsRepository.generateAiReport', () {
    test('posts weekly path with patient_id and YYYY-MM-DD body', () async {
      final postedPaths = <String>[];
      final postedBodies = <Map<String, dynamic>>[];
      final repository = SpecialistReportsRepository(
        _createReportsDio(postedPaths: postedPaths, postedBodies: postedBodies),
      );

      final detail = await repository.generateAiReport(
        SpecialistAiReportGenerateRequest(
          patientId: 'patient-1',
          type: SpecialistAiReportType.weekly,
          periodStart: DateTime(2026, 8, 7),
          periodEnd: DateTime(2026, 8, 13),
        ),
      );

      expect(postedPaths.single, '/ai/reports/generate-weekly');
      expect(postedBodies.single['patient_id'], 'patient-1');
      expect(postedBodies.single['period_start'], '2026-08-07');
      expect(postedBodies.single['period_end'], '2026-08-13');
      expect(postedBodies.single['language'], 'en');
      expect(postedBodies.single.containsKey('specialist_id'), isFalse);
      expect(detail.id, 'report-1');
      expect(detail.isAiReport, isTrue);
      expect(detail.patientId, 'patient-1');
      expect(detail.reportType, 'weekly');
    });

    test('posts monthly path', () async {
      final postedPaths = <String>[];
      final repository = SpecialistReportsRepository(
        _createReportsDio(
          postedPaths: postedPaths,
          postedBodies: [],
          generateResponse: {
            'success': true,
            'data': {
              'id': 'report-2',
              'patient_id': 'patient-1',
              'type': 'monthly',
            },
          },
        ),
      );

      await repository.generateAiReport(
        SpecialistAiReportGenerateRequest(
          patientId: 'patient-1',
          type: SpecialistAiReportType.monthly,
          periodStart: DateTime(2026, 7, 14),
          periodEnd: DateTime(2026, 8, 13),
        ),
      );

      expect(postedPaths.single, '/ai/reports/generate-monthly');
    });

    test('preserves backend error message', () async {
      final repository = SpecialistReportsRepository(
        _createReportsDio(
          postedPaths: [],
          postedBodies: [],
          generateStatus: 403,
          generateMessage: 'You do not have access to this patient.',
        ),
      );

      try {
        await repository.generateAiReport(
          SpecialistAiReportGenerateRequest(
            patientId: 'patient-b',
            type: SpecialistAiReportType.weekly,
            periodStart: DateTime(2026, 8, 7),
            periodEnd: DateTime(2026, 8, 13),
          ),
        );
        fail('expected generation exception');
      } on SpecialistAiReportGenerationException catch (error) {
        expect(error.statusCode, 403);
        expect(error.message, 'You do not have access to this patient.');
      }
    });
  });

  group('SpecialistReportsNotifier AI generation', () {
    test('Arabic locale sends language=ar', () async {
      final postedBodies = <Map<String, dynamic>>[];
      final container = ProviderContainer(
        overrides: _reportsNotifierOverrides(
          SpecialistReportsRepository(
            _createReportsDio(
              postedPaths: [],
              postedBodies: postedBodies,
            ),
          ),
          locale: const Locale('ar'),
        ),
      );
      addTearDown(container.dispose);

      final notifier = container.read(specialistReportsProvider(null).notifier);
      final ok = await notifier.generateAiReport(
        patientId: 'patient-1',
        type: SpecialistAiReportType.weekly,
        periodStart: DateTime(2026, 8, 7),
        periodEnd: DateTime(2026, 8, 13),
      );

      expect(ok, isTrue);
      expect(postedBodies.single['language'], 'ar');
    });

    test('success refreshes reports list', () async {
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
      final ok = await notifier.generateAiReport(
        patientId: 'patient-1',
        type: SpecialistAiReportType.weekly,
        periodStart: DateTime(2026, 8, 7),
        periodEnd: DateTime(2026, 8, 13),
      );

      expect(ok, isTrue);
      expect(notifier.state.isGeneratingAiReport, isFalse);
      expect(listReloads, greaterThan(0));
    });

    test('blocks duplicate concurrent generation', () async {
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
      final first = notifier.generateAiReport(
        patientId: 'patient-1',
        type: SpecialistAiReportType.weekly,
        periodStart: DateTime(2026, 8, 7),
        periodEnd: DateTime(2026, 8, 13),
      );
      final second = notifier.generateAiReport(
        patientId: 'patient-1',
        type: SpecialistAiReportType.monthly,
        periodStart: DateTime(2026, 7, 14),
        periodEnd: DateTime(2026, 8, 13),
      );

      final results = await Future.wait([first, second]);
      expect(results.where((ok) => ok).length, 1);
      expect(postedPaths, ['/ai/reports/generate-weekly']);
    });

    test('stores backend generation error without mixing PDF state', () async {
      final container = ProviderContainer(
        overrides: _reportsNotifierOverrides(
          SpecialistReportsRepository(
            _createReportsDio(
              postedPaths: [],
              postedBodies: [],
              generateStatus: 400,
              generateMessage:
                  'Cannot generate report for a period that has not ended yet',
            ),
          ),
        ),
      );
      addTearDown(container.dispose);

      final notifier = container.read(specialistReportsProvider(null).notifier);
      final ok = await notifier.generateAiReport(
        patientId: 'patient-1',
        type: SpecialistAiReportType.weekly,
        periodStart: DateTime(2026, 8, 7),
        periodEnd: DateTime(2026, 8, 13),
      );

      expect(ok, isFalse);
      expect(
        notifier.state.generationError,
        'Cannot generate report for a period that has not ended yet',
      );
      expect(notifier.state.isGeneratingAiReport, isFalse);
    });
  });

  group('AI report language model parsing and RTL', () {
    test('parses language from AI report detail payload', () {
      final detail = SpecialistReportDetail.fromAiMap({
        'id': 'report-1',
        'patient_id': 'patient-1',
        'type': 'weekly',
        'language': 'ar',
        'summary': '{"executive_summary":"ملخص"}',
      });

      expect(detail.language, 'ar');
      expect(detail.isAiReport, isTrue);
    });

    test('defaults missing language to en for legacy reports', () {
      final detail = SpecialistReportDetail.fromAiMap({
        'id': 'report-2',
        'patient_id': 'patient-1',
        'type': 'monthly',
        'summary': '{"executive_summary":"English summary"}',
      });

      expect(detail.language, 'en');
    });

    test('uses summary language when column is absent', () {
      final detail = SpecialistReportDetail.fromAiMap({
        'id': 'report-3',
        'patient_id': 'patient-1',
        'type': 'weekly',
        'summary': '{"language":"ar","executive_summary":"ملخص"}',
      });

      expect(detail.language, 'ar');
    });
  });
}
