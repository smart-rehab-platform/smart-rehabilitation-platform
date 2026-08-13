import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_app/core/locale/locale_provider.dart';
import 'package:mobile_app/core/routes/app_routes.dart';
import 'package:mobile_app/features/auth/data/token_storage.dart';
import 'package:mobile_app/features/auth/models/auth_user.dart';
import 'package:mobile_app/features/auth/providers/auth_provider.dart';
import 'package:mobile_app/features/complaints/data/complaints_repository.dart';
import 'package:mobile_app/features/complaints/models/complaint_models.dart';
import 'package:mobile_app/features/complaints/presentation/admin/admin_complaint_details_screen.dart';
import 'package:mobile_app/features/complaints/presentation/admin/admin_complaints_screen.dart';
import 'package:mobile_app/features/complaints/presentation/complaint_localization_utils.dart';
import 'package:mobile_app/features/complaints/providers/admin_complaints_provider.dart';
import 'package:mobile_app/features/dashboard/data/specialist_features_repository.dart';
import 'package:mobile_app/features/dashboard/models/admin_assignments_models.dart';
import 'package:mobile_app/features/dashboard/models/specialist_dashboard_models.dart';
import 'package:mobile_app/features/dashboard/presentation/admin/admin_screens.dart';
import 'package:mobile_app/features/dashboard/providers/admin_patient_assignments_provider.dart';
import 'package:mobile_app/features/dashboard/providers/specialist_features_provider.dart';
import 'package:mobile_app/features/dashboard/widgets/admin_navigation.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

const _adminUser = AuthUser(
  id: 'admin-1',
  fullName: 'Admin User',
  email: 'admin@test.com',
  role: 'admin',
);

ComplaintItem _sampleComplaint({
  ComplaintStatus status = ComplaintStatus.pending,
}) {
  return ComplaintItem(
    id: 'complaint-1',
    category: ComplaintCategory.poorFollowUp,
    status: status,
    description:
        'Sample complaint description used for admin UI verification tests.',
    createdAt: DateTime(2026, 1, 15, 10, 30),
    parent: const ComplaintPersonSummary(id: 'parent-1', fullName: 'Parent One'),
    patient: const ComplaintPersonSummary(id: 'child-1', fullName: 'Child One'),
    specialist: const ComplaintPersonSummary(
      id: 'specialist-1',
      fullName: 'Specialist One',
    ),
  );
}

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

class _ImmediateSpecialistNotificationsNotifier
    extends SpecialistNotificationsNotifier {
  _ImmediateSpecialistNotificationsNotifier(
    super.ref,
    super.repository,
    SpecialistNotificationsState initialState,
  ) {
    state = initialState;
  }

  @override
  Future<void> initialize() async {}
}

class _FakeAdminComplaintsNotifier extends AdminComplaintsNotifier {
  _FakeAdminComplaintsNotifier(
    super.ref,
    super.repository,
    super.assignmentsRepository,
    super.authRepository,
    AdminComplaintsState initialState,
  ) {
    state = initialState;
  }

  @override
  Future<void> initialize() async {}

  @override
  Future<void> refresh() async {}

  @override
  Future<void> loadMore() async {}

  @override
  void setStatusFilter(ComplaintStatus? status) {
    state = state.copyWith(selectedStatus: status);
  }

  @override
  void setCategoryFilter(ComplaintCategory? category) {
    state = state.copyWith(selectedCategory: category);
  }

  @override
  void setSpecialistFilter(String? specialistId) {
    state = state.copyWith(selectedSpecialistId: specialistId);
  }

  @override
  void setDateRange({DateTime? from, DateTime? to}) {
    state = state.copyWith(fromDate: from, toDate: to);
  }

  @override
  void clearFilters() {
    state = state.copyWith(
      selectedStatus: null,
      selectedSpecialistId: null,
      selectedCategory: null,
      fromDate: null,
      toDate: null,
    );
  }
}

class _FakeAdminComplaintDetailNotifier extends AdminComplaintDetailNotifier {
  _FakeAdminComplaintDetailNotifier(
    super.ref,
    super.complaintId,
    super.repository,
    super.authRepository,
    AdminComplaintDetailState initialState, {
    this.onStartReview,
    this.onResolve,
    this.onReject,
  }) {
    state = initialState;
  }

  final Future<ComplaintItem?> Function()? onStartReview;
  final Future<ComplaintItem?> Function(String notes)? onResolve;
  final Future<ComplaintItem?> Function(String notes)? onReject;

  @override
  Future<void> initialize() async {}

  @override
  Future<void> refresh() async {}

  @override
  Future<ComplaintItem?> startReview() async {
    if (onStartReview != null) {
      return onStartReview!();
    }
    state = state.copyWith(
      complaint: _sampleComplaint(status: ComplaintStatus.underReview),
    );
    return state.complaint;
  }

  @override
  Future<ComplaintItem?> resolve({
    required String adminNotes,
    String? parentResponse,
  }) async {
    if (onResolve != null) {
      return onResolve!(adminNotes);
    }
    state = state.copyWith(
      complaint: _sampleComplaint(status: ComplaintStatus.resolved),
    );
    return state.complaint;
  }

  @override
  Future<ComplaintItem?> reject({
    required String adminNotes,
    String? parentResponse,
  }) async {
    if (onReject != null) {
      return onReject!(adminNotes);
    }
    state = state.copyWith(
      complaint: _sampleComplaint(status: ComplaintStatus.rejected),
    );
    return state.complaint;
  }
}

Widget _adminTestApp({
  required Locale locale,
  required Widget home,
  AdminComplaintsState? complaintsState,
  AdminComplaintDetailState? detailState,
  String complaintId = 'complaint-1',
  _FakeAdminComplaintDetailNotifier Function(Ref ref)? detailNotifierBuilder,
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
            user: _adminUser,
          ),
        );
      }),
      specialistNotificationsProvider.overrideWith((ref) {
        return _ImmediateSpecialistNotificationsNotifier(
          ref,
          ref.watch(specialistFeaturesRepositoryProvider),
          const SpecialistNotificationsState(),
        );
      }),
      if (complaintsState != null)
        adminComplaintsProvider.overrideWith((ref) {
          return _FakeAdminComplaintsNotifier(
            ref,
            ref.watch(complaintsRepositoryProvider),
            ref.watch(adminPatientAssignmentsRepositoryProvider),
            ref.watch(authRepositoryProvider),
            complaintsState,
          );
        }),
      if (detailState != null)
        adminComplaintDetailProvider(complaintId).overrideWith((ref) {
          if (detailNotifierBuilder != null) {
            return detailNotifierBuilder(ref);
          }
          return _FakeAdminComplaintDetailNotifier(
            ref,
            complaintId,
            ref.watch(complaintsRepositoryProvider),
            ref.watch(authRepositoryProvider),
            detailState,
          );
        }),
    ],
    child: MaterialApp.router(
      locale: locale,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      routerConfig: GoRouter(
        initialLocation: '/detail',
        routes: [
          GoRoute(
            path: '/list',
            builder: (context, state) => const SizedBox.shrink(),
          ),
          GoRoute(path: '/detail', builder: (context, state) => home),
        ],
      ),
    ),
  );
}

void main() {
  testWidgets('Admin drawer renders Complaints navigation item', (tester) async {
    await tester.pumpWidget(
      _adminTestApp(
        locale: const Locale('en'),
        home: Scaffold(
          drawer: const AdminDrawer(),
          body: const SizedBox.shrink(),
        ),
      ),
    );
    await tester.pumpAndSettle();
    final scaffoldState = tester.state<ScaffoldState>(find.byType(Scaffold));
    scaffoldState.openDrawer();
    await tester.pumpAndSettle();

    expect(find.text('Complaints'), findsOneWidget);
  });

  testWidgets('Admin More renders Complaints navigation item', (tester) async {
    await tester.pumpWidget(
      _adminTestApp(
        locale: const Locale('en'),
        home: const AdminMoreScreen(),
      ),
    );
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(
      find.text('Complaints'),
      120,
      scrollable: find.byType(Scrollable).first,
    );

    expect(find.text('Complaints'), findsOneWidget);
  });

  testWidgets('Admin complaints screen shows loading state', (tester) async {
    await tester.pumpWidget(
      _adminTestApp(
        locale: const Locale('en'),
        home: const AdminComplaintsScreen(),
        complaintsState: const AdminComplaintsState(isInitialLoading: true),
      ),
    );
    await tester.pump();

    expect(find.text('Loading complaints...'), findsOneWidget);
  });

  testWidgets('Admin complaints screen shows empty state', (tester) async {
    await tester.pumpWidget(
      _adminTestApp(
        locale: const Locale('en'),
        home: const AdminComplaintsScreen(),
        complaintsState: const AdminComplaintsState(items: []),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('No complaints found.'), findsOneWidget);
  });

  testWidgets('Admin complaints screen shows error and retry', (tester) async {
    await tester.pumpWidget(
      _adminTestApp(
        locale: const Locale('en'),
        home: const AdminComplaintsScreen(),
        complaintsState: const AdminComplaintsState(
          errorMessage: 'Failed to load complaints',
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Failed to load complaints'), findsOneWidget);
    expect(find.text('Retry'), findsOneWidget);
  });

  testWidgets('Admin complaints screen renders complaint card', (tester) async {
    await tester.pumpWidget(
      _adminTestApp(
        locale: const Locale('en'),
        home: const AdminComplaintsScreen(),
        complaintsState: AdminComplaintsState(
          items: [_sampleComplaint()],
          specialists: const [
            SpecialistUserOption(
              userId: 'specialist-1',
              name: 'Specialist One',
            ),
          ],
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Parent: Parent One'), findsOneWidget);
    expect(find.text('Child: Child One'), findsOneWidget);
    expect(find.text('Specialist: Specialist One'), findsOneWidget);
    expect(find.text('Poor follow-up'), findsOneWidget);
    expect(find.text('Pending'), findsOneWidget);
  });

  testWidgets('Admin complaints status filter updates chip label', (
    tester,
  ) async {
    late _FakeAdminComplaintsNotifier notifier;

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authProvider.overrideWith((ref) {
            return _ImmediateAuthNotifier(
              ref.watch(authRepositoryProvider),
              ref.watch(tokenStorageProvider),
              const AuthState(
                isInitializing: false,
                token: 'test-token',
                user: _adminUser,
              ),
            );
          }),
          adminComplaintsProvider.overrideWith((ref) {
            notifier = _FakeAdminComplaintsNotifier(
              ref,
              ref.watch(complaintsRepositoryProvider),
              ref.watch(adminPatientAssignmentsRepositoryProvider),
              ref.watch(authRepositoryProvider),
              const AdminComplaintsState(items: []),
            );
            return notifier;
          }),
        ],
        child: MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          home: const AdminComplaintsScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.text('All Statuses'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Under Review'));
    await tester.pumpAndSettle();

    expect(notifier.state.selectedStatus, ComplaintStatus.underReview);
    expect(find.text('Under Review'), findsWidgets);
  });

  testWidgets('Admin complaints category filter updates chip label', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(800, 1200));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    late _FakeAdminComplaintsNotifier notifier;

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          localeProvider.overrideWith((ref) {
            final localeNotifier = LocaleNotifier(const TokenStorage());
            localeNotifier.state = const Locale('en');
            return localeNotifier;
          }),
          authProvider.overrideWith((ref) {
            return _ImmediateAuthNotifier(
              ref.watch(authRepositoryProvider),
              ref.watch(tokenStorageProvider),
              const AuthState(
                isInitializing: false,
                token: 'test-token',
                user: _adminUser,
              ),
            );
          }),
          adminComplaintsProvider.overrideWith((ref) {
            notifier = _FakeAdminComplaintsNotifier(
              ref,
              ref.watch(complaintsRepositoryProvider),
              ref.watch(adminPatientAssignmentsRepositoryProvider),
              ref.watch(authRepositoryProvider),
              const AdminComplaintsState(items: []),
            );
            return notifier;
          }),
        ],
        child: MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          home: const AdminComplaintsScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.text('All Categories'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Poor follow-up').last);
    await tester.pumpAndSettle();

    expect(notifier.state.selectedCategory, ComplaintCategory.poorFollowUp);
    expect(find.text('Poor follow-up'), findsWidgets);
  });

  testWidgets('Admin complaints specialist filter updates chip label', (
    tester,
  ) async {
    late _FakeAdminComplaintsNotifier notifier;

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          localeProvider.overrideWith((ref) {
            final localeNotifier = LocaleNotifier(const TokenStorage());
            localeNotifier.state = const Locale('en');
            return localeNotifier;
          }),
          authProvider.overrideWith((ref) {
            return _ImmediateAuthNotifier(
              ref.watch(authRepositoryProvider),
              ref.watch(tokenStorageProvider),
              const AuthState(
                isInitializing: false,
                token: 'test-token',
                user: _adminUser,
              ),
            );
          }),
          adminComplaintsProvider.overrideWith((ref) {
            notifier = _FakeAdminComplaintsNotifier(
              ref,
              ref.watch(complaintsRepositoryProvider),
              ref.watch(adminPatientAssignmentsRepositoryProvider),
              ref.watch(authRepositoryProvider),
              const AdminComplaintsState(
                items: [],
                specialists: [
                  SpecialistUserOption(
                    userId: 'specialist-1',
                    name: 'Specialist One',
                  ),
                ],
              ),
            );
            return notifier;
          }),
        ],
        child: MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          home: const AdminComplaintsScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.text('All Specialists'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Specialist One'));
    await tester.pumpAndSettle();

    expect(notifier.state.selectedSpecialistId, 'specialist-1');
    expect(find.text('Specialist One'), findsWidgets);
  });

  testWidgets('Admin complaints date filter shows selected chip label', (
    tester,
  ) async {
    await tester.pumpWidget(
      _adminTestApp(
        locale: const Locale('en'),
        home: const AdminComplaintsScreen(),
        complaintsState: AdminComplaintsState(
          items: [_sampleComplaint()],
          fromDate: DateTime(2026, 1, 1),
          toDate: DateTime(2026, 1, 31, 23, 59, 59),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Date range selected'), findsOneWidget);
  });

  testWidgets('Admin complaints card opens detail screen', (tester) async {
    final router = GoRouter(
      initialLocation: AppRoutes.adminComplaints,
      routes: [
        GoRoute(
          path: AppRoutes.adminComplaints,
          builder: (context, state) => const AdminComplaintsScreen(),
          routes: [
            GoRoute(
              path: ':complaintId',
              builder: (context, state) => AdminComplaintDetailsScreen(
                complaintId: state.pathParameters['complaintId']!,
              ),
            ),
          ],
        ),
      ],
    );

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          localeProvider.overrideWith((ref) {
            final localeNotifier = LocaleNotifier(const TokenStorage());
            localeNotifier.state = const Locale('en');
            return localeNotifier;
          }),
          authProvider.overrideWith((ref) {
            return _ImmediateAuthNotifier(
              ref.watch(authRepositoryProvider),
              ref.watch(tokenStorageProvider),
              const AuthState(
                isInitializing: false,
                token: 'test-token',
                user: _adminUser,
              ),
            );
          }),
          specialistNotificationsProvider.overrideWith((ref) {
            return _ImmediateSpecialistNotificationsNotifier(
              ref,
              ref.watch(specialistFeaturesRepositoryProvider),
              const SpecialistNotificationsState(),
            );
          }),
          adminComplaintsProvider.overrideWith((ref) {
            return _FakeAdminComplaintsNotifier(
              ref,
              ref.watch(complaintsRepositoryProvider),
              ref.watch(adminPatientAssignmentsRepositoryProvider),
              ref.watch(authRepositoryProvider),
              AdminComplaintsState(items: [_sampleComplaint()]),
            );
          }),
          adminComplaintDetailProvider('complaint-1').overrideWith((ref) {
            return _FakeAdminComplaintDetailNotifier(
              ref,
              'complaint-1',
              ref.watch(complaintsRepositoryProvider),
              ref.watch(authRepositoryProvider),
              AdminComplaintDetailState(complaint: _sampleComplaint()),
            );
          }),
        ],
        child: MaterialApp.router(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          routerConfig: router,
        ),
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.text('Poor follow-up'));
    await tester.pumpAndSettle();

    expect(
      router.state.uri.path,
      AppRoutes.adminComplaintDetail('complaint-1'),
    );
    await tester.scrollUntilVisible(
      find.text('Start Review'),
      120,
      scrollable: find.byType(Scrollable).first,
    );
    expect(find.text('Start Review'), findsOneWidget);
  });

  testWidgets('Admin complaint details shows resolve flow with confirmation', (
    tester,
  ) async {
    await tester.pumpWidget(
      _adminTestApp(
        locale: const Locale('en'),
        home: const AdminComplaintDetailsScreen(complaintId: 'complaint-1'),
        detailState: AdminComplaintDetailState(
          complaint: _sampleComplaint(status: ComplaintStatus.underReview),
        ),
      ),
    );
    await tester.pumpAndSettle();

    final adminNotesField = find.byWidgetPredicate(
      (widget) =>
          widget is TextField &&
          widget.decoration?.labelText == 'Admin notes',
    );
    await tester.ensureVisible(adminNotesField);
    await tester.enterText(adminNotesField, 'Confirmed after review.');

    await tester.scrollUntilVisible(
      find.text('Resolve Complaint'),
      120,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.tap(find.text('Resolve Complaint'));
    await tester.pumpAndSettle();
    expect(find.text('Resolve complaint?'), findsOneWidget);

    await tester.tap(find.text('Confirm'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.text('Complaint resolved successfully.'), findsOneWidget);
  });

  testWidgets('Admin complaint details start review action works', (
    tester,
  ) async {
    await tester.pumpWidget(
      _adminTestApp(
        locale: const Locale('en'),
        home: const AdminComplaintDetailsScreen(complaintId: 'complaint-1'),
        detailState: AdminComplaintDetailState(
          complaint: _sampleComplaint(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    await tester.scrollUntilVisible(
      find.text('Start Review'),
      120,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.tap(find.text('Start Review'));
    await tester.pumpAndSettle();
    expect(find.text('Start review?'), findsOneWidget);
    await tester.tap(find.text('Confirm'));
    await tester.pumpAndSettle();
    expect(find.text('Complaint marked as under review.'), findsOneWidget);
  });

  testWidgets('Admin complaint details reject requires admin notes', (
    tester,
  ) async {
    await tester.pumpWidget(
      _adminTestApp(
        locale: const Locale('en'),
        home: const AdminComplaintDetailsScreen(complaintId: 'complaint-1'),
        detailState: AdminComplaintDetailState(
          complaint: _sampleComplaint(status: ComplaintStatus.underReview),
        ),
      ),
    );
    await tester.pumpAndSettle();

    await tester.scrollUntilVisible(
      find.text('Reject Complaint'),
      120,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.tap(find.text('Reject Complaint'));
    await tester.pumpAndSettle();
    expect(
      find.text('Admin notes are required to resolve or reject this complaint.'),
      findsOneWidget,
    );
  });

  testWidgets('Arabic admin complaints localization renders', (tester) async {
    await tester.pumpWidget(
      _adminTestApp(
        locale: const Locale('ar'),
        home: const AdminComplaintsScreen(),
        complaintsState: AdminComplaintsState(items: [_sampleComplaint()]),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('متابعة ضعيفة'), findsOneWidget);
    expect(find.text('قيد الانتظار'), findsOneWidget);
  });
}