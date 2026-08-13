import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/core/locale/locale_provider.dart';
import 'package:mobile_app/features/auth/data/token_storage.dart';
import 'package:mobile_app/features/auth/presentation/login_screen.dart';
import 'package:mobile_app/features/auth/providers/auth_provider.dart';
import 'package:mobile_app/l10n/app_localizations.dart';
import 'package:mobile_app/shared/widgets/auth_ui.dart';

class _ImmediateAuthNotifier extends AuthNotifier {
  _ImmediateAuthNotifier(super.repository, super.tokenStorage) {
    state = const AuthState(isInitializing: false);
  }

  @override
  Future<({bool rememberMe, String? email})> loadRememberedLogin() async {
    return (rememberMe: false, email: null);
  }
}

Widget _loginTestApp({Locale locale = const Locale('en')}) {
  return ProviderScope(
    overrides: [
      localeProvider.overrideWith((ref) {
        final notifier = LocaleNotifier(const TokenStorage());
        notifier.state = locale;
        return notifier;
      }),
      authProvider.overrideWith((ref) {
        final repository = ref.watch(authRepositoryProvider);
        final tokenStorage = ref.watch(tokenStorageProvider);
        return _ImmediateAuthNotifier(repository, tokenStorage);
      }),
    ],
    child: MaterialApp(
      locale: locale,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      home: const LoginScreen(),
    ),
  );
}

Finder get _loginSubmitButton => find.descendant(
  of: find.byType(AuthGradientButton),
  matching: find.textContaining('Sign In'),
);

Finder _loginSubmitButtonForLocale(String label) => find.descendant(
  of: find.byType(AuthGradientButton),
  matching: find.text(label),
);

void main() {
  testWidgets('Login form renders English labels', (tester) async {
    await tester.pumpWidget(_loginTestApp());
    await tester.pumpAndSettle();

    expect(find.text('Welcome Back'), findsOneWidget);
    expect(
      find.text('Continue your smart rehabilitation journey'),
      findsOneWidget,
    );
    expect(find.text('Email'), findsOneWidget);
    expect(find.text('Password'), findsOneWidget);
    expect(find.text('Remember Me'), findsOneWidget);
    expect(find.text('Forgot Password?'), findsOneWidget);
    expect(find.text('Sign In'), findsNWidgets(2));
    expect(_loginSubmitButton, findsOneWidget);
    expect(find.textContaining("Don't have an account"), findsOneWidget);
    expect(find.text('Create Account'), findsNWidgets(2));
  });

  testWidgets('Login form renders Arabic labels', (tester) async {
    await tester.pumpWidget(_loginTestApp(locale: const Locale('ar')));
    await tester.pumpAndSettle();

    expect(find.text('مرحباً بعودتك'), findsOneWidget);
    expect(find.text('تابع رحلة التأهيل الذكي'), findsOneWidget);
    expect(find.text('البريد الإلكتروني'), findsOneWidget);
    expect(find.text('كلمة المرور'), findsOneWidget);
    expect(find.text('تذكرني'), findsOneWidget);
    expect(find.text('نسيت كلمة المرور؟'), findsOneWidget);
    expect(find.text('تسجيل الدخول'), findsNWidgets(2));
    expect(_loginSubmitButtonForLocale('تسجيل الدخول'), findsOneWidget);
    expect(find.textContaining('ليس لديك حساب'), findsOneWidget);
    expect(find.text('إنشاء حساب'), findsNWidgets(2));
  });

  testWidgets('Locale switch updates login form labels', (tester) async {
    await tester.pumpWidget(_loginTestApp());
    await tester.pumpAndSettle();

    expect(find.text('Welcome Back'), findsOneWidget);

    await tester.pumpWidget(_loginTestApp(locale: const Locale('ar')));
    await tester.pumpAndSettle();

    expect(find.text('Welcome Back'), findsNothing);
    expect(find.text('مرحباً بعودتك'), findsOneWidget);
  });

  testWidgets('Empty login still validates without changing behavior', (
    tester,
  ) async {
    await tester.pumpWidget(_loginTestApp());
    await tester.pumpAndSettle();

    await tester.tap(_loginSubmitButton);
    await tester.pump();

    expect(find.text('Please enter email and password'), findsOneWidget);
  });

  testWidgets('Invalid email validation message is localized in Arabic', (
    tester,
  ) async {
    await tester.pumpWidget(_loginTestApp(locale: const Locale('ar')));
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextFormField).first, 'not-an-email');
    await tester.pump();

    expect(find.text('عنوان بريد إلكتروني غير صالح'), findsOneWidget);
  });

  testWidgets(
    'Login hero background remains present without form title changes',
    (tester) async {
      await tester.pumpWidget(_loginTestApp());
      await tester.pumpAndSettle();

      expect(find.byType(AuthBackground), findsOneWidget);
      expect(find.byType(AuthTopLogo), findsOneWidget);
      expect(find.text('Welcome Back'), findsOneWidget);
    },
  );
}
