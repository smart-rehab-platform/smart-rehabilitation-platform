import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/auth/data/token_storage.dart';
import '../../features/auth/providers/auth_provider.dart';

const supportedAppLanguageCodes = {'en', 'ar'};

Locale localeFromLanguageCode(String? languageCode) {
  final normalized = languageCode?.trim().toLowerCase();
  if (normalized == 'ar') {
    return const Locale('ar');
  }
  return const Locale('en');
}

String languageCodeFromLocale(Locale locale) {
  final normalized = locale.languageCode.trim().toLowerCase();
  if (normalized == 'ar') {
    return 'ar';
  }
  return 'en';
}

final localeProvider = StateNotifierProvider<LocaleNotifier, Locale>((ref) {
  final tokenStorage = ref.watch(tokenStorageProvider);
  final notifier = LocaleNotifier(tokenStorage);
  notifier.loadSavedLocale();
  return notifier;
});

class LocaleNotifier extends StateNotifier<Locale> {
  LocaleNotifier(this._tokenStorage) : super(const Locale('en'));

  final TokenStorage _tokenStorage;

  Future<void> loadSavedLocale() async {
    final savedLanguageCode = await _tokenStorage.getLocaleLanguageCode();
    state = localeFromLanguageCode(savedLanguageCode);
  }

  Future<void> setLocale(Locale locale) async {
    final languageCode = languageCodeFromLocale(locale);
    if (!supportedAppLanguageCodes.contains(languageCode)) {
      return;
    }

    final normalizedLocale = localeFromLanguageCode(languageCode);
    if (state == normalizedLocale) {
      return;
    }

    state = normalizedLocale;
    await _tokenStorage.saveLocaleLanguageCode(languageCode);
  }

  Future<void> setLanguageCode(String languageCode) async {
    await setLocale(localeFromLanguageCode(languageCode));
  }
}
