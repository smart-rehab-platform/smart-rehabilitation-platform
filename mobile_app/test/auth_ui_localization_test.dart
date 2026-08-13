import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/auth/utils/password_strength.dart';
import 'package:mobile_app/l10n/app_localizations.dart';
import 'package:mobile_app/shared/widgets/auth_ui.dart';

Widget _localizedAuthShell({
  required Widget child,
  Locale locale = const Locale('en'),
}) {
  return MaterialApp(
    locale: locale,
    localizationsDelegates: AppLocalizations.localizationsDelegates,
    supportedLocales: AppLocalizations.supportedLocales,
    home: Scaffold(body: child),
  );
}

void main() {
  test('password strength evaluation logic is unchanged', () {
    final weak = evaluateAuthPasswordStrength('abc');
    expect(weak.level, AuthPasswordStrengthLevel.weak);
    expect(weak.satisfiedCount, lessThan(3));

    final medium = evaluateAuthPasswordStrength('Abcdef1');
    expect(medium.level, AuthPasswordStrengthLevel.medium);

    final strong = evaluateAuthPasswordStrength('Abcdef1!');
    expect(strong.level, AuthPasswordStrengthLevel.strong);
    expect(strong.isStrong, isTrue);
  });

  testWidgets('AuthTabSwitcher renders English shared labels', (tester) async {
    await tester.pumpWidget(
      _localizedAuthShell(
        child: AuthTabSwitcher(activeIndex: 0, onTap: (_) {}),
      ),
    );

    expect(find.text('Sign In'), findsOneWidget);
    expect(find.text('Create Account'), findsOneWidget);
  });

  testWidgets('AuthTabSwitcher renders Arabic shared labels', (tester) async {
    await tester.pumpWidget(
      _localizedAuthShell(
        locale: const Locale('ar'),
        child: AuthTabSwitcher(activeIndex: 1, onTap: (_) {}),
      ),
    );

    expect(find.text('تسجيل الدخول'), findsOneWidget);
    expect(find.text('إنشاء حساب'), findsOneWidget);
  });

  testWidgets('AuthPasswordStrengthIndicator renders localized rule labels', (
    tester,
  ) async {
    await tester.pumpWidget(
      _localizedAuthShell(
        child: const AuthPasswordStrengthIndicator(password: 'Abc1'),
      ),
    );

    expect(find.text('Password strength'), findsOneWidget);
    expect(find.text('At least 8 characters'), findsOneWidget);
    expect(find.text('Contains uppercase letter'), findsOneWidget);
    expect(find.text('Contains number'), findsOneWidget);
  });

  testWidgets('AuthPasswordStrengthIndicator renders Arabic labels', (
    tester,
  ) async {
    await tester.pumpWidget(
      _localizedAuthShell(
        locale: const Locale('ar'),
        child: const AuthPasswordStrengthIndicator(password: 'Abc1'),
      ),
    );

    expect(find.text('قوة كلمة المرور'), findsOneWidget);
    expect(find.text('8 أحرف على الأقل'), findsOneWidget);
    expect(find.text('تحتوي على حرف كبير'), findsOneWidget);
    expect(find.text('تحتوي على رقم'), findsOneWidget);
  });

  testWidgets('AuthBackButton exposes localized accessibility label', (
    tester,
  ) async {
    await tester.pumpWidget(
      _localizedAuthShell(child: AuthBackButton(onPressed: () {})),
    );

    expect(find.bySemanticsLabel('Back'), findsOneWidget);
  });
}
