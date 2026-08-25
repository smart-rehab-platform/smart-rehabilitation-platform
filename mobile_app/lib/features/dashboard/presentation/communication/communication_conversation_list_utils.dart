import 'package:intl/intl.dart';

import '../../../../l10n/app_localizations.dart';
import '../../models/communication_models.dart';

String formatConversationActivityTime(
  DateTime? activityAt,
  AppLocalizations l10n,
  String localeName, {
  DateTime? now,
}) {
  if (activityAt == null) {
    return '';
  }

  final reference = (now ?? DateTime.now()).toLocal();
  final localActivity = activityAt.toLocal();
  final today = DateTime(reference.year, reference.month, reference.day);
  final activityDay = DateTime(
    localActivity.year,
    localActivity.month,
    localActivity.day,
  );
  final dayDiff = today.difference(activityDay).inDays;

  if (dayDiff == 0) {
    return DateFormat.jm(localeName).format(localActivity);
  }

  if (dayDiff == 1) {
    return l10n.dateYesterday;
  }

  return DateFormat.yMMMd(localeName).format(localActivity);
}

String resolveConversationLastMessagePreview(
  CommunicationConversation conversation,
  AppLocalizations l10n,
) {
  final content = conversation.lastMessageContent?.trim() ?? '';
  if (content.isNotEmpty) {
    return localizeCommunicationSystemPreview(content, l10n);
  }

  if (conversation.lastMessageHasAttachments) {
    return l10n.communicationListAttachment;
  }

  return '';
}

String localizeCommunicationSystemPreview(
  String content,
  AppLocalizations l10n,
) {
  switch (content) {
    case 'Sent an image':
      return l10n.communicationPreviewSentImage;
    case 'Sent an audio recording':
      return l10n.communicationPreviewSentAudio;
    case 'Sent a PDF file':
      return l10n.communicationPreviewSentPdf;
    case 'Sent a video':
      return l10n.communicationPreviewSentVideo;
    case 'Sent a file':
      return l10n.communicationPreviewSentFile;
    default:
      return content;
  }
}

String formatConversationUnreadBadge(int unreadCount) {
  if (unreadCount > 99) {
    return '99+';
  }
  return unreadCount.toString();
}
