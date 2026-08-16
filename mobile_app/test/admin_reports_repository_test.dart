import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/dashboard/data/admin_reports_repository.dart';
import 'package:mobile_app/features/dashboard/data/specialist_reports_repository.dart';

Dio _createAdminReportsDio({
  required List<String> requestedPaths,
  List<Map<String, dynamic>> regularRows = const [],
  List<Map<String, dynamic>> aiRows = const [],
}) {
  final dio = Dio();

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) {
        requestedPaths.add(options.path);

        if (options.path == '/reports') {
          handler.resolve(
            Response(
              requestOptions: options,
              data: {
                'success': true,
                'count': regularRows.length,
                'data': regularRows,
              },
            ),
          );
          return;
        }

        if (options.path == '/ai/reports') {
          handler.resolve(
            Response(
              requestOptions: options,
              data: {
                'success': true,
                'count': aiRows.length,
                'data': aiRows,
              },
            ),
          );
          return;
        }

        handler.reject(
          DioException(
            requestOptions: options,
            type: DioExceptionType.badResponse,
            response: Response(
              requestOptions: options,
              statusCode: 404,
              data: const {'success': false, 'message': 'Not found'},
            ),
          ),
        );
      },
    ),
  );

  return dio;
}

void main() {
  group('AdminReportsRepository', () {
    test('fetches regular and AI reports without specialist assignment lookup', () async {
      final requestedPaths = <String>[];
      final repository = AdminReportsRepository(
        _createAdminReportsDio(
          requestedPaths: requestedPaths,
          regularRows: [
            {
              'id': 'regular-1',
              'patient_id': 'patient-1',
              'title': 'Weekly Progress Report',
              'report_type': 'weekly',
              'patient_name': 'Patient One',
              'created_at': '2026-08-10T10:00:00.000Z',
            },
          ],
          aiRows: [
            {
              'id': 'ai-1',
              'patient_id': 'patient-2',
              'title': 'AI Weekly Summary',
              'report_type': 'weekly',
              'patient_name': 'Patient Two',
              'generated_at': '2026-08-12T10:00:00.000Z',
            },
          ],
        ),
      );

      final reports = await repository.fetchReports();

      expect(requestedPaths, ['/reports', '/ai/reports']);
      expect(requestedPaths.any((path) => path.contains('/specialists/')), isFalse);
      expect(reports, hasLength(2));
      expect(reports.any((report) => report.id == 'regular-1' && !report.isAiReport), isTrue);
      expect(reports.any((report) => report.id == 'ai-1' && report.isAiReport), isTrue);
    });

    test('returns empty list when both sources are empty', () async {
      final repository = AdminReportsRepository(
        _createAdminReportsDio(requestedPaths: []),
      );

      final reports = await repository.fetchReports();

      expect(reports, isEmpty);
    });
  });

  group('SpecialistReportsRepository admin parity guard', () {
    test('returns empty list for admin user with no assigned patients before reports fetch', () async {
      final requestedPaths = <String>[];
      final dio = Dio();

      dio.interceptors.add(
        InterceptorsWrapper(
          onRequest: (options, handler) {
            requestedPaths.add(options.path);

            if (options.path == '/specialists/admin-user/patients') {
              handler.resolve(
                Response(
                  requestOptions: options,
                  data: const {'success': true, 'count': 0, 'data': []},
                ),
              );
              return;
            }

            handler.reject(
              DioException(
                requestOptions: options,
                type: DioExceptionType.badResponse,
                response: Response(
                  requestOptions: options,
                  statusCode: 500,
                  data: const {'success': false},
                ),
              ),
            );
          },
        ),
      );

      final repository = SpecialistReportsRepository(dio);
      final reports = await repository.fetchReports(
        specialistUserId: 'admin-user',
      );

      expect(reports, isEmpty);
      expect(requestedPaths, ['/specialists/admin-user/patients']);
      expect(requestedPaths.contains('/reports'), isFalse);
    });
  });
}
