import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/core/routes/app_routes.dart';
import 'package:mobile_app/core/routes/role_routing.dart';
import 'package:mobile_app/features/auth/models/auth_user.dart';

void main() {
  group('RoleRouting specialist verification', () {
    AuthUser specialist(String? status) {
      return AuthUser(
        fullName: 'Spec',
        email: 'spec@example.com',
        role: 'specialist',
        verificationStatus: status,
      );
    }

    test('routes specialists by verification_status', () {
      expect(
        RoleRouting.homeForUser(specialist('approved')),
        AppRoutes.specialistDashboard,
      );
      expect(
        RoleRouting.homeForUser(specialist('pending')),
        AppRoutes.specialistVerificationPending,
      );
      expect(
        RoleRouting.homeForUser(specialist('rejected')),
        AppRoutes.specialistVerificationRejected,
      );
      expect(
        RoleRouting.homeForUser(specialist(null)),
        AppRoutes.specialistVerificationPending,
      );
    });

    test('leaves parent and admin homes unchanged', () {
      expect(
        RoleRouting.homeForUser(
          const AuthUser(
            fullName: 'Parent',
            email: 'p@example.com',
            role: 'parent',
          ),
        ),
        AppRoutes.parentDashboard,
      );
      expect(
        RoleRouting.homeForUser(
          const AuthUser(
            fullName: 'Admin',
            email: 'a@example.com',
            role: 'admin',
          ),
        ),
        AppRoutes.adminDashboard,
      );
    });

    test('blocks unapproved specialists from clinical routes', () {
      final pending = specialist('pending');
      final approved = specialist('approved');

      expect(
        RoleRouting.canAccessRoute(pending, AppRoutes.specialistDashboard),
        isFalse,
      );
      expect(
        RoleRouting.canAccessRoute(pending, AppRoutes.specialistPatients),
        isFalse,
      );
      expect(
        RoleRouting.canAccessRoute(approved, AppRoutes.specialistDashboard),
        isTrue,
      );
      expect(RoleRouting.isApprovedSpecialist(pending), isFalse);
      expect(RoleRouting.getSpecialistVerificationStatus(pending), 'pending');
    });

    test('parses verification_status from AuthUser map', () {
      final user = AuthUser.fromMap({
        'fullName': 'Spec',
        'email': 'spec@example.com',
        'role': 'specialist',
        'verification_status': 'approved',
      });
      expect(user.verificationStatus, 'approved');
      expect(RoleRouting.homeForUser(user), AppRoutes.specialistDashboard);
    });
  });
}
