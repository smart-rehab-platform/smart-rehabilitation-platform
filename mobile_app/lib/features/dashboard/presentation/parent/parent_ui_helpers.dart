import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../l10n/app_localizations.dart';

String parentFormatDate(DateTime? date) {
  if (date == null) {
    return '—';
  }
  return DateFormat('MMM d, yyyy').format(date);
}

String parentFormatDateTime(DateTime? date) {
  if (date == null) {
    return '—';
  }
  return DateFormat('EEE, MMM d • h:mm a').format(date);
}

String? parentResolveReportUrl(String? pdfUrl) {
  return ApiConstants.resolveMediaUrl(pdfUrl);
}

Future<void> parentCopyReportUrl(
  BuildContext context,
  AppLocalizations l10n,
  String url, {
  String? message,
}) async {
  await Clipboard.setData(ClipboardData(text: url));
  if (context.mounted) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message ?? l10n.parentReportLinkCopied)),
    );
  }
}

Future<void> parentLongPressReportUrl(
  BuildContext context,
  AppLocalizations l10n,
  String? pdfUrl,
) async {
  final resolved = parentResolveReportUrl(pdfUrl);
  if (resolved == null || resolved.isEmpty) {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.parentReportNoLinkToCopy)),
      );
    }
    return;
  }
  await parentCopyReportUrl(context, l10n, resolved);
}

Future<void> parentOpenReportUrl(
  BuildContext context,
  AppLocalizations l10n,
  String? pdfUrl,
) async {
  final resolved = parentResolveReportUrl(pdfUrl);
  if (resolved == null || resolved.isEmpty) {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.parentReportNoFileAvailable)),
      );
    }
    return;
  }

  final uri = Uri.tryParse(resolved);
  if (uri == null) {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.parentReportInvalidLink)),
      );
    }
    return;
  }

  try {
    final launched = await launchUrl(
      uri,
      mode: LaunchMode.externalApplication,
    );
    if (!launched && context.mounted) {
      await parentCopyReportUrl(
        context,
        l10n,
        resolved,
        message: l10n.parentReportOpenFailedLinkCopied,
      );
    }
  } catch (_) {
    if (context.mounted) {
      await parentCopyReportUrl(
        context,
        l10n,
        resolved,
        message: l10n.parentReportOpenFailedLinkCopied,
      );
    }
  }
}
