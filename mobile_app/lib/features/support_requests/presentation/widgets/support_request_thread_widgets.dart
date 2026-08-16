import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../dashboard/widgets/dashboard_layout.dart';
import '../../models/support_request_models.dart';

class SupportRequestThread extends StatelessWidget {
  const SupportRequestThread({
    super.key,
    required this.messages,
    required this.currentUserRole,
  });

  final List<SupportRequestMessage> messages;
  final String currentUserRole;

  @override
  Widget build(BuildContext context) {
    if (messages.isEmpty) {
      return SizedBox(height: context.dashSpacing * 0.25);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: messages
          .map(
            (message) => Padding(
              padding: EdgeInsets.only(bottom: context.dashSpacing * 0.5),
              child: SupportRequestMessageBubble(
                message: message,
                isOwn: _isOwnMessage(message, currentUserRole),
              ),
            ),
          )
          .toList(growable: false),
    );
  }

  bool _isOwnMessage(SupportRequestMessage message, String role) {
    final normalizedRole = role.toLowerCase();
    if (normalizedRole == 'admin') {
      return message.sender.isAdmin;
    }
    return !message.sender.isAdmin;
  }
}

class SupportRequestMessageBubble extends StatelessWidget {
  const SupportRequestMessageBubble({
    super.key,
    required this.message,
    required this.isOwn,
  });

  final SupportRequestMessage message;
  final bool isOwn;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final screenWidth = MediaQuery.sizeOf(context).width;
    final horizontalInset = context.dashSpacing * 0.35;
    final background = isOwn
        ? DashboardColors.brandCyan.withValues(alpha: 0.1)
        : const Color(0xFFF1F5F9);
    final borderColor = isOwn
        ? DashboardColors.brandCyan.withValues(alpha: 0.28)
        : DashboardColors.border.withValues(alpha: 0.85);
    final timestamp = message.createdAt == null
        ? l10n.supportRequestDateUnavailable
        : DateFormat.yMMMd().add_jm().format(message.createdAt!);
    final senderLabel = message.sender.isAdmin
        ? l10n.supportRequestSenderAdmin
        : l10n.supportRequestSenderSpecialist;

    return Align(
      alignment: isOwn ? AlignmentDirectional.centerEnd : AlignmentDirectional.centerStart,
      child: Padding(
        padding: EdgeInsetsDirectional.only(
          start: isOwn ? horizontalInset * 2 : horizontalInset,
          end: isOwn ? horizontalInset : horizontalInset * 2,
        ),
        child: Column(
            crossAxisAlignment:
                isOwn ? CrossAxisAlignment.end : CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '$senderLabel  $timestamp',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: DashboardColors.textMuted,
                ),
                textAlign: isOwn ? TextAlign.end : TextAlign.start,
              ),
              SizedBox(height: 4),
              ConstrainedBox(
                constraints: BoxConstraints(maxWidth: screenWidth * 0.78),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: background,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: borderColor),
                  ),
                  child: Padding(
                    padding: EdgeInsets.all(context.dashSpacing * 0.55),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (message.content.trim().isNotEmpty)
                          Text(
                            message.content.trim(),
                            style: theme.textTheme.bodyMedium?.copyWith(
                              height: 1.45,
                            ),
                          ),
                        if (message.attachmentUrl != null &&
                            message.attachmentUrl!.trim().isNotEmpty) ...[
                          if (message.content.trim().isNotEmpty)
                            SizedBox(height: context.dashSpacing * 0.35),
                          SupportRequestAttachmentPreview(url: message.attachmentUrl!),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
      ),
    );
  }
}

class SupportRequestAttachmentPreview extends StatelessWidget {
  const SupportRequestAttachmentPreview({super.key, required this.url});

  final String url;

  bool get _isPdf => url.toLowerCase().contains('.pdf');

  Future<void> _open(BuildContext context) async {
    final resolved = ApiConstants.resolveMediaUrl(url);
    if (resolved == null) return;
    final uri = Uri.tryParse(resolved);
    if (uri == null) return;
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final resolved = ApiConstants.resolveMediaUrl(url);

    if (_isPdf || resolved == null) {
      return InkWell(
        onTap: () => _open(context),
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: DashboardColors.border),
          ),
          child: Row(
            children: [
              const Icon(Icons.picture_as_pdf_outlined, color: DashboardColors.brandCyan, size: 20),
              SizedBox(width: context.dashSpacing * 0.35),
              Expanded(
                child: Text(
                  l10n.supportRequestAttachmentOpenPdf,
                  style: Theme.of(context).textTheme.bodySmall,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const Icon(Icons.open_in_new_rounded, size: 16),
            ],
          ),
        ),
      );
    }

    return InkWell(
      onTap: () => _open(context),
      borderRadius: BorderRadius.circular(8),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: CachedNetworkImage(
          imageUrl: resolved,
          fit: BoxFit.cover,
          height: 140,
          width: double.infinity,
          placeholder: (_, __) => const SizedBox(
            height: 140,
            child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
          ),
          errorWidget: (_, __, ___) => Container(
            height: 100,
            alignment: Alignment.center,
            color: DashboardColors.blueSoft,
            child: Text(
              l10n.supportRequestAttachmentOpenImage,
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ),
        ),
      ),
    );
  }
}
