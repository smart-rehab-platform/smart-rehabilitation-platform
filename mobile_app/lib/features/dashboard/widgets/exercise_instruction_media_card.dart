import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:video_player/video_player.dart';

import '../../../core/constants/api_constants.dart';
import '../../../core/constants/dashboard_colors.dart';
import 'dashboard_layout.dart';
import 'dashboard_surface_card.dart';
import 'parent_dashboard_cards.dart';

/// Read-only instructional media (Specialist-uploaded `instruction_media_url`).
/// Shared by Exercise Details and Parent submission screens.
class ExerciseInstructionMediaCard extends StatelessWidget {
  const ExerciseInstructionMediaCard({
    super.key,
    required this.mediaUrl,
    this.title = 'Instructional Media',
  });

  final String mediaUrl;
  final String title;

  static String? resolveUrl(String? rawUrl) =>
      ApiConstants.resolveMediaUrl(rawUrl);

  static Future<void> openExternally(String? rawUrl) async {
    final resolved = resolveUrl(rawUrl);
    if (resolved == null) {
      return;
    }
    final uri = Uri.tryParse(resolved);
    if (uri == null) {
      return;
    }
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  static String guessKind(String url) {
    final lower = url.toLowerCase();
    if (lower.contains('.mp4') ||
        lower.contains('.mov') ||
        lower.contains('video')) {
      return 'video';
    }
    if (lower.contains('.mp3') ||
        lower.contains('.m4a') ||
        lower.contains('.wav') ||
        lower.contains('.aac') ||
        lower.contains('audio')) {
      return 'audio';
    }
    if (lower.contains('.pdf')) {
      return 'pdf';
    }
    if (lower.contains('.jpg') ||
        lower.contains('.jpeg') ||
        lower.contains('.png') ||
        lower.contains('.webp') ||
        lower.contains('image')) {
      return 'image';
    }
    return 'unknown';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final resolved = resolveUrl(mediaUrl) ?? mediaUrl.trim();
    if (resolved.isEmpty) {
      return const SizedBox.shrink();
    }
    final kind = guessKind(resolved);

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.5),
          if (kind == 'image')
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(
                resolved,
                fit: BoxFit.cover,
                width: double.infinity,
                errorBuilder: (_, __, ___) => const DashboardEmptyCard(
                  message: 'Unable to load image preview.',
                ),
                loadingBuilder: (context, child, progress) {
                  if (progress == null) return child;
                  return const Padding(
                    padding: EdgeInsets.all(24),
                    child: Center(child: CircularProgressIndicator()),
                  );
                },
              ),
            )
          else if (kind == 'video')
            _InstructionNetworkVideoPlayer(url: resolved)
          else if (kind == 'audio')
            _InstructionNetworkAudioPlayer(url: resolved)
          else if (kind == 'pdf')
            Text(
              'PDF instruction attached. Open externally to view.',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: DashboardColors.textSecondary,
              ),
            )
          else
            Text(
              'Media attached. Open externally to view.',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: DashboardColors.textSecondary,
              ),
            ),
          SizedBox(height: context.dashSpacing * 0.55),
          OutlinedButton.icon(
            onPressed: () => openExternally(mediaUrl),
            icon: const Icon(Icons.open_in_new_rounded),
            label: Text(kind == 'pdf' ? 'Open PDF' : 'Open externally'),
            style: OutlinedButton.styleFrom(
              foregroundColor: DashboardColors.primary,
              side: const BorderSide(color: DashboardColors.primary),
            ),
          ),
        ],
      ),
    );
  }
}

class _InstructionNetworkVideoPlayer extends StatefulWidget {
  const _InstructionNetworkVideoPlayer({required this.url});

  final String url;

  @override
  State<_InstructionNetworkVideoPlayer> createState() =>
      _InstructionNetworkVideoPlayerState();
}

class _InstructionNetworkVideoPlayerState
    extends State<_InstructionNetworkVideoPlayer> {
  VideoPlayerController? _controller;
  String? _error;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    try {
      final controller =
          VideoPlayerController.networkUrl(Uri.parse(widget.url));
      await controller.initialize();
      if (!mounted) {
        await controller.dispose();
        return;
      }
      setState(() => _controller = controller);
    } catch (_) {
      if (!mounted) return;
      setState(() => _error = 'Unable to load video.');
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_error != null) {
      return DashboardEmptyCard(message: _error!);
    }
    final controller = _controller;
    if (controller == null || !controller.value.isInitialized) {
      return const Padding(
        padding: EdgeInsets.all(24),
        child: Center(child: CircularProgressIndicator()),
      );
    }

    return Column(
      children: [
        AspectRatio(
          aspectRatio: controller.value.aspectRatio == 0
              ? 16 / 9
              : controller.value.aspectRatio,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: VideoPlayer(controller),
          ),
        ),
        IconButton(
          onPressed: () {
            setState(() {
              if (controller.value.isPlaying) {
                controller.pause();
              } else {
                controller.play();
              }
            });
          },
          icon: Icon(
            controller.value.isPlaying
                ? Icons.pause_circle_filled_rounded
                : Icons.play_circle_filled_rounded,
          ),
        ),
      ],
    );
  }
}

class _InstructionNetworkAudioPlayer extends StatefulWidget {
  const _InstructionNetworkAudioPlayer({required this.url});

  final String url;

  @override
  State<_InstructionNetworkAudioPlayer> createState() =>
      _InstructionNetworkAudioPlayerState();
}

class _InstructionNetworkAudioPlayerState
    extends State<_InstructionNetworkAudioPlayer> {
  VideoPlayerController? _controller;
  String? _error;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    try {
      final controller =
          VideoPlayerController.networkUrl(Uri.parse(widget.url));
      await controller.initialize();
      if (!mounted) {
        await controller.dispose();
        return;
      }
      setState(() => _controller = controller);
    } catch (_) {
      if (!mounted) return;
      setState(() => _error = 'Unable to load audio.');
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  String _formatDuration(Duration duration) {
    final minutes = duration.inMinutes.remainder(60).toString().padLeft(2, '0');
    final seconds = duration.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    if (_error != null) {
      return DashboardEmptyCard(message: _error!);
    }
    final controller = _controller;
    if (controller == null || !controller.value.isInitialized) {
      return const Padding(
        padding: EdgeInsets.all(24),
        child: Center(child: CircularProgressIndicator()),
      );
    }

    return Container(
      padding: EdgeInsets.all(context.dashSpacing * 0.65),
      decoration: BoxDecoration(
        color: DashboardColors.purpleSoft,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          IconButton(
            onPressed: () {
              setState(() {
                controller.value.isPlaying
                    ? controller.pause()
                    : controller.play();
              });
            },
            icon: Icon(
              controller.value.isPlaying
                  ? Icons.pause_circle_filled_rounded
                  : Icons.play_circle_filled_rounded,
              size: 44,
              color: DashboardColors.primary,
            ),
          ),
          VideoProgressIndicator(
            controller,
            allowScrubbing: true,
            colors: const VideoProgressColors(
              playedColor: DashboardColors.primary,
              bufferedColor: DashboardColors.border,
              backgroundColor: Colors.white,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            '${_formatDuration(controller.value.position)} / ${_formatDuration(controller.value.duration)}',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: DashboardColors.textSecondary,
                ),
          ),
        ],
      ),
    );
  }
}
