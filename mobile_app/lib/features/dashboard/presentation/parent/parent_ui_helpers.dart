import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/constants/api_constants.dart';

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
  String url, {
  String message = 'Report link copied to clipboard.',
}) async {
  await Clipboard.setData(ClipboardData(text: url));
  if (context.mounted) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
}

Future<void> parentLongPressReportUrl(BuildContext context, String? pdfUrl) async {
  final resolved = parentResolveReportUrl(pdfUrl);
  if (resolved == null || resolved.isEmpty) {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No report link to copy.')),
      );
    }
    return;
  }
  await parentCopyReportUrl(context, resolved);
}

Future<void> parentOpenReportUrl(BuildContext context, String? pdfUrl) async {
  final resolved = parentResolveReportUrl(pdfUrl);
  if (resolved == null || resolved.isEmpty) {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No report file available yet.')),
      );
    }
    return;
  }

  final uri = Uri.tryParse(resolved);
  if (uri == null) {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid report link.')),
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
        resolved,
        message: 'Could not open report. Link copied to clipboard.',
      );
    }
  } catch (_) {
    if (context.mounted) {
      await parentCopyReportUrl(
        context,
        resolved,
        message: 'Could not open report. Link copied to clipboard.',
      );
    }
  }
}
