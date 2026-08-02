import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../models/communication_models.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../parent/parent_ui_helpers.dart';
import 'communication_attachment_picker.dart';

class CommunicationAttachmentContent extends StatelessWidget {
  const CommunicationAttachmentContent({
    super.key,
    required this.attachment,
    required this.isMine,
  });

  final CommunicationAttachment attachment;
  final bool isMine;

  @override
  Widget build(BuildContext context) {
    if (attachment.isImage) {
      return CommunicationImageAttachment(
        attachment: attachment,
        isMine: isMine,
      );
    }
    if (attachment.isAudio) {
      return CommunicationAudioAttachment(attachment: attachment);
    }
    if (attachment.isPdf) {
      return CommunicationFileAttachment(
        attachment: attachment,
        icon: Icons.picture_as_pdf_outlined,
        label: 'PDF document',
      );
    }
    if (attachment.isVideo) {
      return CommunicationFileAttachment(
        attachment: attachment,
        icon: Icons.videocam_outlined,
        label: 'Video attachment',
      );
    }
    return CommunicationFileAttachment(
      attachment: attachment,
      icon: Icons.insert_drive_file_outlined,
      label: 'File attachment',
    );
  }
}

class CommunicationImageAttachment extends StatelessWidget {
  const CommunicationImageAttachment({
    super.key,
    required this.attachment,
    required this.isMine,
  });

  final CommunicationAttachment attachment;
  final bool isMine;

  @override
  Widget build(BuildContext context) {
    final resolvedUrl = attachment.resolvedUrl;
    if (resolvedUrl == null || resolvedUrl.isEmpty) {
      return const _AttachmentErrorPlaceholder(message: 'Image unavailable');
    }

    return GestureDetector(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute<void>(
            builder: (_) => CommunicationImagePreviewScreen(url: resolvedUrl),
          ),
        );
      },
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 240, maxHeight: 220),
          child: CachedNetworkImage(
            imageUrl: resolvedUrl,
            fit: BoxFit.cover,
            placeholder: (_, __) => const _AttachmentLoadingPlaceholder(),
            errorWidget: (_, __, ___) => const _AttachmentErrorPlaceholder(
              message: 'Could not load image',
            ),
          ),
        ),
      ),
    );
  }
}

class CommunicationImagePreviewScreen extends StatelessWidget {
  const CommunicationImagePreviewScreen({super.key, required this.url});

  final String url;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: InteractiveViewer(
          child: CachedNetworkImage(
            imageUrl: url,
            fit: BoxFit.contain,
            placeholder: (_, __) => const CircularProgressIndicator(),
            errorWidget: (_, __, ___) => const Text(
              'Could not load image',
              style: TextStyle(color: Colors.white),
            ),
          ),
        ),
      ),
    );
  }
}

class CommunicationAudioAttachment extends StatefulWidget {
  const CommunicationAudioAttachment({super.key, required this.attachment});

  final CommunicationAttachment attachment;

  @override
  State<CommunicationAudioAttachment> createState() =>
      _CommunicationAudioAttachmentState();
}

class _CommunicationAudioAttachmentState
    extends State<CommunicationAudioAttachment> {
  late final AudioPlayer _player;
  bool _isReady = false;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    _player = AudioPlayer();
    _initPlayer();
  }

  Future<void> _initPlayer() async {
    final url = widget.attachment.resolvedUrl;
    if (url == null || url.isEmpty) {
      if (mounted) {
        setState(() => _hasError = true);
      }
      return;
    }

    try {
      await _player.setUrl(url);
      if (mounted) {
        setState(() {
          _isReady = true;
          _hasError = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _hasError = true);
      }
    }
  }

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  Future<void> _togglePlayback() async {
    if (!_isReady || _hasError) {
      return;
    }

    final scope = CommunicationAudioPlaybackScope.of(context);
    if (_player.playing) {
      await _player.pause();
      return;
    }

    await scope?.stopCurrent(except: _player);
    await _player.play();
    scope?.setCurrent(_player);
  }

  @override
  Widget build(BuildContext context) {
    if (_hasError) {
      return const _AttachmentErrorPlaceholder(message: 'Audio unavailable');
    }

    return StreamBuilder<PlayerState>(
      stream: _player.playerStateStream,
      builder: (context, snapshot) {
        final playing = snapshot.data?.playing ?? false;
        final processing = snapshot.data?.processingState;

        return SizedBox(
          width: 220,
          child: Row(
            children: [
              IconButton(
                onPressed: _isReady ? _togglePlayback : null,
                icon: Icon(
                  playing ? Icons.pause_circle_filled : Icons.play_circle_fill,
                  color: DashboardColors.brandCyan,
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.attachment.displayName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    if (processing == ProcessingState.loading)
                      Text(
                        'Loading audio...',
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          color: DashboardColors.textMuted,
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class CommunicationAudioPlaybackScope extends StatefulWidget {
  const CommunicationAudioPlaybackScope({super.key, required this.child});

  final Widget child;

  static CommunicationAudioPlaybackScopeState? of(BuildContext context) {
    return context
        .findAncestorStateOfType<CommunicationAudioPlaybackScopeState>();
  }

  @override
  State<CommunicationAudioPlaybackScope> createState() =>
      CommunicationAudioPlaybackScopeState();
}

class CommunicationAudioPlaybackScopeState
    extends State<CommunicationAudioPlaybackScope> {
  AudioPlayer? _currentPlayer;

  Future<void> stopCurrent({AudioPlayer? except}) async {
    final player = _currentPlayer;
    if (player == null || identical(player, except)) {
      return;
    }
    await player.stop();
    _currentPlayer = null;
  }

  void setCurrent(AudioPlayer player) {
    _currentPlayer = player;
  }

  @override
  void dispose() {
    _currentPlayer?.stop();
    _currentPlayer = null;
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => widget.child;
}

class CommunicationFileAttachment extends StatelessWidget {
  const CommunicationFileAttachment({
    super.key,
    required this.attachment,
    required this.icon,
    required this.label,
  });

  final CommunicationAttachment attachment;
  final IconData icon;
  final String label;

  Future<void> _open(BuildContext context) async {
    final resolved = attachment.resolvedUrl;
    if (resolved == null || resolved.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('File link unavailable.')));
      return;
    }

    final uri = Uri.tryParse(resolved);
    if (uri == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Invalid file link.')));
      return;
    }

    final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!launched && context.mounted) {
      await parentCopyReportUrl(
        context,
        resolved,
        message: 'File link copied.',
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => _open(context),
      onLongPress: () {
        final resolved = attachment.resolvedUrl;
        if (resolved != null && resolved.isNotEmpty) {
          parentCopyReportUrl(context, resolved, message: 'File link copied.');
        }
      },
      child: Container(
        width: 220,
        padding: EdgeInsets.all(context.dashSpacing * 0.55),
        decoration: BoxDecoration(
          color: DashboardColors.background,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: DashboardColors.border),
        ),
        child: Row(
          children: [
            Icon(icon, color: DashboardColors.brandCyan),
            SizedBox(width: context.dashSpacing * 0.5),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: Theme.of(context).textTheme.labelMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  Text(
                    attachment.displayName,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AttachmentLoadingPlaceholder extends StatelessWidget {
  const _AttachmentLoadingPlaceholder();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 180,
      height: 140,
      alignment: Alignment.center,
      color: DashboardColors.background,
      child: const SizedBox(
        width: 24,
        height: 24,
        child: CircularProgressIndicator(strokeWidth: 2),
      ),
    );
  }
}

class _AttachmentErrorPlaceholder extends StatelessWidget {
  const _AttachmentErrorPlaceholder({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 180,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: DashboardColors.background,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: DashboardColors.border),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline, color: DashboardColors.warning),
          const SizedBox(width: 8),
          Expanded(
            child: Text(message, style: Theme.of(context).textTheme.bodySmall),
          ),
        ],
      ),
    );
  }
}

class CommunicationPendingAttachmentPreview extends StatelessWidget {
  const CommunicationPendingAttachmentPreview({
    super.key,
    required this.selection,
    required this.onRemove,
    this.uploadProgress,
    this.removeEnabled = true,
  });

  final CommunicationAttachmentSelection selection;
  final VoidCallback onRemove;
  final double? uploadProgress;
  final bool removeEnabled;

  @override
  Widget build(BuildContext context) {
    return DashboardSurfaceCard(
      child: Row(
        children: [
          Icon(selection.icon, color: DashboardColors.brandCyan),
          SizedBox(width: context.dashSpacing * 0.55),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  selection.displayLabel,
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                Text(
                  selection.filename,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                if (uploadProgress != null)
                  Padding(
                    padding: EdgeInsets.only(top: context.dashSpacing * 0.35),
                    child: LinearProgressIndicator(value: uploadProgress),
                  ),
              ],
            ),
          ),
          IconButton(
            onPressed: removeEnabled ? onRemove : null,
            icon: const Icon(Icons.close_rounded),
          ),
        ],
      ),
    );
  }
}
