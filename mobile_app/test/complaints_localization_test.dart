import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/core/locale/locale_provider.dart';
import 'package:mobile_app/features/auth/data/auth_repository.dart';
import 'package:mobile_app/features/auth/data/token_storage.dart';
import 'package:mobile_app/features/auth/models/auth_user.dart';
import 'package:mobile_app/features/auth/providers/auth_provider.dart';
import 'package:mobile_app/features/case_intake/data/case_intake_repository.dart';
import 'package:mobile_app/features/case_intake/providers/case_categories_provider.dart';
import 'package:mobile_app/features/case_intake/providers/parent_case_intake_provider.dart';
import 'package:mobile_app/features/complaints/data/complaints_repository.dart';
import 'package:mobile_app/features/complaints/models/complaint_models.dart';
import 'package:mobile_app/features/complaints/presentation/complaint_localization_utils.dart';
import 'package:mobile_app/features/complaints/presentation/parent/parent_complaint_form_screen.dart';
import 'package:mobile_app/features/complaints/providers/parent_complaints_provider.dart';
import 'package:mobile_app/features/dashboard/data/communication_repository.dart';
import 'package:mobile_app/features/dashboard/providers/communication_list_provider.dart';
import 'package:mobile_app/features/dashboard/models/parent_dashboard_models.dart';
import 'package:mobile_app/features/dashboard/presentation/parent/parent_screens.dart';
import 'package:mobile_app/features/dashboard/providers/parent_dashboard_provider.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

const _user = AuthUser(
  id: 'parent-1',
  fullName: 'Sarah Ahmed',
  email: 'parent@example.com',
  role: 'parent',
);

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

  @override
  Future<({bool rememberMe, String? email})> loadRememberedLogin() async {
    return (rememberMe: false, email: null);
  }
}

class _ImmediateParentCaseIntakeNotifier extends ParentCaseIntakeNotifier {
  _ImmediateParentCaseIntakeNotifier(
    super.ref,
    super.repository,
    super.communicationRepository,
    super.authRepository,
    ParentCaseIntakeState initialState,
  ) {
    state = initialState;
  }

  @override
  Future<void> loadRequests() async {}
}

class _ImmediateParentComplaintsNotifier extends ParentComplaintsNotifier {
  _ImmediateParentComplaintsNotifier(
    super.ref,
    super.repository,
    super.dashboardRepository,
    super.authRepository,
  );

  @override
  Future<List<ParentChild>> loadChildren() async => const [];

  @override
  Future<void> loadComplaints() async {}
}

Widget _complaintsTestApp({
  required Locale locale,
  required Widget home,
}) {
  return ProviderScope(
    overrides: [
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
            user: _user,
          ),
        );
      }),
      parentCaseIntakeProvider.overrideWith((ref) {
        return _ImmediateParentCaseIntakeNotifier(
          ref,
          ref.watch(caseIntakeRepositoryProvider),
          ref.watch(communicationRepositoryProvider),
          ref.watch(authRepositoryProvider),
          const ParentCaseIntakeState(isLoading: false, requests: []),
        );
      }),
      parentComplaintsProvider.overrideWith((ref) {
        return _ImmediateParentComplaintsNotifier(
          ref,
          ref.watch(complaintsRepositoryProvider),
          ref.watch(parentDashboardRepositoryProvider),
          ref.watch(authRepositoryProvider),
        );
      }),
    ],
    child: MaterialApp(
      locale: locale,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      home: home,
    ),
  );
}

void main() {
  group('Complaint localization', () {
    testWidgets('English category and status labels', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          locale: const Locale('en'),
          home: Builder(
            builder: (context) {
              final l10n = AppLocalizations.of(context)!;
              expect(
                localizedComplaintCategoryLabel(
                  l10n,
                  ComplaintCategory.specialistNotResponding,
                ),
                'Specialist is not responding',
              );
              expect(
                localizedComplaintStatusLabel(l10n, ComplaintStatus.pending),
                'Pending',
              );
              return const SizedBox.shrink();
            },
          ),
        ),
      );
    });

    testWidgets('Arabic category label', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          locale: const Locale('ar'),
          home: Builder(
            builder: (context) {
              final l10n = AppLocalizations.of(context)!;
              expect(
                localizedComplaintCategoryLabel(
                  l10n,
                  ComplaintCategory.poorFollowUp,
                ),
                'متابعة ضعيفة',
              );
              return const SizedBox.shrink();
            },
          ),
        ),
      );
    });
  });

  testWidgets('Parent More renders complaint entry points in English', (
    tester,
  ) async {
    await tester.pumpWidget(
      _complaintsTestApp(
        locale: const Locale('en'),
        home: const ParentMoreScreen(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Report a Specialist'), findsOneWidget);
    expect(
      find.text('Submit a concern for administration review'),
      findsOneWidget,
    );
    expect(find.text('My Complaints'), findsOneWidget);
  });

  testWidgets('Parent complaint form shows child validation', (tester) async {
    await tester.pumpWidget(
      _complaintsTestApp(
        locale: const Locale('en'),
        home: const ParentComplaintFormScreen(),
      ),
    );
    await tester.pumpAndSettle();

    await tester.scrollUntilVisible(
      find.text('Submit Complaint'),
      120,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.tap(find.text('Submit Complaint'));
    await tester.pumpAndSettle();

    expect(find.text('Please select a child.'), findsOneWidget);
  });

  test('ComplaintItem parses API map', () {
    final item = ComplaintItem.fromMap({
      'id': 'c-1',
      'category': 'poor_follow_up',
      'status': 'pending',
      'description': 'Example complaint description text',
      'parent': {'id': 'p1', 'fullName': 'Parent One'},
      'patient': {'id': 'pt1', 'fullName': 'Child One'},
      'specialist': {'id': 's1', 'fullName': 'Specialist One'},
    });

    expect(item.category, ComplaintCategory.poorFollowUp);
    expect(item.status, ComplaintStatus.pending);
    expect(item.patient.fullName, 'Child One');
  });
}
