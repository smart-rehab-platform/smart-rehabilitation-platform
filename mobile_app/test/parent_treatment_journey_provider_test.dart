import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/dashboard/data/parent_dashboard_repository.dart';
import 'package:mobile_app/features/dashboard/providers/parent_features_provider.dart';

Dio _createMockDio({
  required Map<String, dynamic> treatmentJourneyResponse,
  int treatmentJourneyDelayMs = 0,
}) {
  final dio = Dio();

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        if (options.path.contains('/treatment-journey')) {
          if (treatmentJourneyDelayMs > 0) {
            await Future<void>.delayed(
              Duration(milliseconds: treatmentJourneyDelayMs),
            );
          }
          handler.resolve(
            Response(
              requestOptions: options,
              data: treatmentJourneyResponse,
            ),
          );
          return;
        }

        if (options.path.contains('/improvement-percentage') ||
            options.path.contains('/performance-metrics')) {
          handler.resolve(
            Response(
              requestOptions: options,
              data: const {'success': true, 'data': {}},
            ),
          );
          return;
        }

        handler.resolve(
          Response(
            requestOptions: options,
            data: const {'success': true, 'data': []},
          ),
        );
      },
    ),
  );

  return dio;
}

Map<String, dynamic> _journeyPayload({String period = 'weekly'}) {
  return {
    'success': true,
    'data': {
      'patient_id': 'child-1',
      'period': period,
      'treatment_start': '2026-01-15',
      'treatment_end': '2026-07-30',
      'starting_score': 62,
      'current_score': 78.5,
      'score_change': 16.5,
      'overall_improvement': 26.61,
      'trend': 'improving',
      'data_source': 'progress_snapshots',
      'chart_points': [
        {
          'date': '2026-01-19',
          'period_start': '2026-01-13',
          'period_end': '2026-01-19',
          'score': 62,
          'exercises_completed': 3,
        },
      ],
    },
  };
}

void main() {
  group('ParentDashboardRepository journey helpers', () {
    test('default period normalization is weekly', () {
      expect(ParentDashboardRepository.normalizeJourneyPeriod(''), 'weekly');
      expect(ParentDashboardRepository.normalizeJourneyPeriod('invalid'), 'weekly');
      expect(ParentDashboardRepository.isValidJourneyPeriod('invalid'), isFalse);
    });
  });

  group('ParentProgressNotifier treatment journey', () {
    test('default selected period is weekly', () {
      final notifier = ParentProgressNotifier(
        ParentDashboardRepository(_createMockDio(
          treatmentJourneyResponse: _journeyPayload(),
        )),
        'child-1',
      );

      expect(notifier.state.selectedJourneyPeriod, 'weekly');
    });

    test('successful load stores treatment journey', () async {
      final notifier = ParentProgressNotifier(
        ParentDashboardRepository(_createMockDio(
          treatmentJourneyResponse: _journeyPayload(),
        )),
        'child-1',
      );

      await notifier.loadTreatmentJourney('child-1');

      expect(notifier.state.isJourneyLoading, isFalse);
      expect(notifier.state.journeyError, isNull);
      expect(notifier.state.treatmentJourney?.period, 'weekly');
      expect(notifier.state.treatmentJourney?.hasData, isTrue);
    });

    test('period switch weekly to monthly fetches new data', () async {
      final dio = Dio();
      final requestedPeriods = <String>[];

      dio.interceptors.add(
        InterceptorsWrapper(
          onRequest: (options, handler) {
            if (options.path.contains('/treatment-journey')) {
              requestedPeriods.add(
                options.queryParameters['period']?.toString() ?? '',
              );
              final period = requestedPeriods.last;
              handler.resolve(
                Response(
                  requestOptions: options,
                  data: _journeyPayload(period: period),
                ),
              );
              return;
            }

            handler.resolve(
              Response(
                requestOptions: options,
                data: const {'success': true, 'data': []},
              ),
            );
          },
        ),
      );

      final notifier = ParentProgressNotifier(
        ParentDashboardRepository(dio),
        'child-1',
      );

      await notifier.loadTreatmentJourney('child-1', period: 'weekly');
      await notifier.changeJourneyPeriod('child-1', 'monthly');

      expect(requestedPeriods, ['weekly', 'monthly']);
      expect(notifier.state.selectedJourneyPeriod, 'monthly');
      expect(notifier.state.treatmentJourney?.period, 'monthly');
    });

    test('same period does not cause unnecessary duplicate fetch', () async {
      var treatmentJourneyCalls = 0;
      final dio = Dio();

      dio.interceptors.add(
        InterceptorsWrapper(
          onRequest: (options, handler) {
            if (options.path.contains('/treatment-journey')) {
              treatmentJourneyCalls += 1;
              handler.resolve(
                Response(
                  requestOptions: options,
                  data: _journeyPayload(period: 'weekly'),
                ),
              );
              return;
            }

            handler.resolve(
              Response(
                requestOptions: options,
                data: const {'success': true, 'data': []},
              ),
            );
          },
        ),
      );

      final notifier = ParentProgressNotifier(
        ParentDashboardRepository(dio),
        'child-1',
      );

      await notifier.loadTreatmentJourney('child-1', period: 'weekly');
      await notifier.changeJourneyPeriod('child-1', 'weekly');

      expect(treatmentJourneyCalls, 1);
    });

    test('failure sets journeyError without clearing existing progress state', () async {
      final dio = Dio();

      dio.interceptors.add(
        InterceptorsWrapper(
          onRequest: (options, handler) {
            if (options.path.contains('/treatment-journey')) {
              handler.reject(
                DioException(
                  requestOptions: options,
                  response: Response(
                    requestOptions: options,
                    statusCode: 403,
                    data: const {
                      'success': false,
                      'message': 'You do not have access to this patient.',
                    },
                  ),
                  type: DioExceptionType.badResponse,
                ),
              );
              return;
            }

            handler.resolve(
              Response(
                requestOptions: options,
                data: const {'success': true, 'data': []},
              ),
            );
          },
        ),
      );

      final notifier = ParentProgressNotifier(
        ParentDashboardRepository(dio),
        'child-1',
      );

      notifier.state = notifier.state.copyWith(
        snapshots: const [],
        weekly: const [],
        improvementPercentage: 12,
      );

      await notifier.loadTreatmentJourney('child-1');

      expect(notifier.state.journeyError, isNotNull);
      expect(notifier.state.journeyError, contains('access'));
      expect(notifier.state.improvementPercentage, 12);
      expect(notifier.state.isJourneyLoading, isFalse);
    });

    test('initialize loads default weekly treatment journey', () async {
      var treatmentJourneyCalls = 0;
      final dio = Dio();

      dio.interceptors.add(
        InterceptorsWrapper(
          onRequest: (options, handler) {
            if (options.path.contains('/treatment-journey')) {
              treatmentJourneyCalls += 1;
              expect(options.queryParameters['period'], 'weekly');
              handler.resolve(
                Response(
                  requestOptions: options,
                  data: _journeyPayload(period: 'weekly'),
                ),
              );
              return;
            }

            if (options.path.contains('/improvement-percentage')) {
              handler.resolve(
                Response(
                  requestOptions: options,
                  data: const {
                    'success': true,
                    'data': {'improvement_percentage': 12},
                  },
                ),
              );
              return;
            }

            if (options.path.contains('/performance-metrics')) {
              handler.resolve(
                Response(
                  requestOptions: options,
                  data: const {'success': true, 'data': {}},
                ),
              );
              return;
            }

            handler.resolve(
              Response(
                requestOptions: options,
                data: const {'success': true, 'data': []},
              ),
            );
          },
        ),
      );

      final notifier = ParentProgressNotifier(
        ParentDashboardRepository(dio),
        'child-1',
      );

      await notifier.initialize();

      expect(treatmentJourneyCalls, 1);
      expect(notifier.state.treatmentJourney?.period, 'weekly');
      expect(notifier.state.improvementPercentage, 12);
    });
  });
}
