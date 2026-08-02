import 'package:shared_preferences/shared_preferences.dart';

class TokenStorage {
  const TokenStorage();

  static const String _tokenKey = 'auth_token';
  static const String _rememberMeKey = 'remember_me';
  static const String _savedEmailKey = 'saved_email';
  static const String _localeLanguageCodeKey = 'app_locale_language_code';
  static const Set<String> _supportedLocaleLanguageCodes = {'en', 'ar'};

  Future<void> saveToken(String token) async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(_tokenKey, token);
  }

  Future<String?> getToken() async {
    final preferences = await SharedPreferences.getInstance();
    return preferences.getString(_tokenKey);
  }

  Future<void> clearToken() async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.remove(_tokenKey);
  }

  Future<void> saveRememberMe(bool value) async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setBool(_rememberMeKey, value);
  }

  Future<bool> getRememberMe() async {
    final preferences = await SharedPreferences.getInstance();

    // Keep existing logged-in users working after this feature ships.
    if (!preferences.containsKey(_rememberMeKey) &&
        preferences.containsKey(_tokenKey)) {
      return true;
    }

    return preferences.getBool(_rememberMeKey) ?? false;
  }

  Future<void> saveEmail(String email) async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(_savedEmailKey, email);
  }

  Future<String?> getSavedEmail() async {
    final preferences = await SharedPreferences.getInstance();
    return preferences.getString(_savedEmailKey);
  }

  Future<void> clearSavedEmail() async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.remove(_savedEmailKey);
  }

  Future<void> clearSession() async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.remove(_tokenKey);
    await preferences.remove(_rememberMeKey);
    await preferences.remove(_savedEmailKey);
  }

  Future<void> saveLocaleLanguageCode(String languageCode) async {
    final normalized = languageCode.trim().toLowerCase();
    if (!_supportedLocaleLanguageCodes.contains(normalized)) {
      return;
    }

    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(_localeLanguageCodeKey, normalized);
  }

  Future<String> getLocaleLanguageCode() async {
    final preferences = await SharedPreferences.getInstance();
    final saved = preferences
        .getString(_localeLanguageCodeKey)
        ?.trim()
        .toLowerCase();
    if (saved != null && _supportedLocaleLanguageCodes.contains(saved)) {
      return saved;
    }
    return 'en';
  }
}
