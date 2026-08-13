import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/core/locale/locale_provider.dart';
import 'package:mobile_app/features/auth/data/token_storage.dart';
import 'package:mobile_app/main.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
  });

  group('TokenStorage locale persistence', () {
    test('defaults to English when no preference is saved', () async {
      const storage = TokenStorage();
      expect(await storage.getLocaleLanguageCode(), 'en');
    });

    test('persists Arabic across reads', () async {
      const storage = TokenStorage();
      await storage.saveLocaleLanguageCode('ar');
      expect(await storage.getLocaleLanguageCode(), 'ar');
    });

    test('persists English across reads', () async {
      const storage = TokenStorage();
      await storage.saveLocaleLanguageCode('ar');
      await storage.saveLocaleLanguageCode('en');
      expect(await storage.getLocaleLanguageCode(), 'en');
    });

    test('ignores unsupported locale codes', () async {
      const storage = TokenStorage();
      await storage.saveLocaleLanguageCode('fr');
      expect(await storage.getLocaleLanguageCode(), 'en');
    });
  });

  group('LocaleNotifier', () {
    test('loads saved locale on startup', () async {
      const storage = TokenStorage();
      await storage.saveLocaleLanguageCode('ar');

      final notifier = LocaleNotifier(storage);
      await notifier.loadSavedLocale();

      expect(notifier.state, const Locale('ar'));
    });

    test('setLanguageCode updates state and persists immediately', () async {
      const storage = TokenStorage();
      final notifier = LocaleNotifier(storage);

      await notifier.setLanguageCode('ar');
      expect(notifier.state, const Locale('ar'));
      expect(await storage.getLocaleLanguageCode(), 'ar');

      await notifier.setLanguageCode('en');
      expect(notifier.state, const Locale('en'));
      expect(await storage.getLocaleLanguageCode(), 'en');
    });
  });

  group('MaterialApp locale propagation', () {
    testWidgets('changing locale rebuilds MaterialApp without restart', (
      tester,
    ) async {
      await tester.pumpWidget(
        const ProviderScope(child: SmartRehabilitationApp()),
      );
      await tester.pumpAndSettle();

      final element = tester.element(find.byType(SmartRehabilitationApp));
      final container = ProviderScope.containerOf(element);

      expect(container.read(localeProvider), const Locale('en'));

      await container.read(localeProvider.notifier).setLanguageCode('ar');
      await tester.pumpAndSettle();

      expect(container.read(localeProvider), const Locale('ar'));

      final materialApp = tester.widget<MaterialApp>(find.byType(MaterialApp));
      expect(materialApp.locale, const Locale('ar'));

      await container.read(localeProvider.notifier).setLanguageCode('en');
      await tester.pumpAndSettle();

      expect(
        tester.widget<MaterialApp>(find.byType(MaterialApp)).locale,
        const Locale('en'),
      );
    });
  });
}
