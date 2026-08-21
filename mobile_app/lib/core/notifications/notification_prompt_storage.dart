import 'package:shared_preferences/shared_preferences.dart';

class NotificationPromptStorage {
  const NotificationPromptStorage();

  static const String _promptShownPrefix =
      'notification_permission_prompt_shown_';

  Future<bool> hasPromptBeenShown(String userId) async {
    final normalized = userId.trim();
    if (normalized.isEmpty) {
      return false;
    }

    final preferences = await SharedPreferences.getInstance();
    return preferences.getBool('$_promptShownPrefix$normalized') ?? false;
  }

  Future<void> markPromptShown(String userId) async {
    final normalized = userId.trim();
    if (normalized.isEmpty) {
      return;
    }

    final preferences = await SharedPreferences.getInstance();
    await preferences.setBool('$_promptShownPrefix$normalized', true);
  }
}
