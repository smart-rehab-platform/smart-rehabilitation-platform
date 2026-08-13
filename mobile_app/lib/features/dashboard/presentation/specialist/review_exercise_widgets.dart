import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:video_player/video_player.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../models/specialist_exercise_review_models.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/dashboard_visuals.dart';
import '../../widgets/parent_dashboard_cards.dart';
import 'specialist_exercise_review_localization_utils.dart';
import 'specialist_patient_details_localization_utils.dart';

class ReviewExerciseHeader extends StatelessWidget {
  const ReviewExerciseHeader({super.key, required this.submission});

  final ExerciseSubmissionDetail submission;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final dateLabel = submission.submittedAt != null
        ? DateFormat('MMM d, yyyy • h:mm a').format(submission.submittedAt!)
        : l10n.specialistAssignedExerciseRecentlySubmitted;

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            submission.patientName,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.25),
          Text(
            submission.exerciseTitle,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            dateLabel,
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textMuted,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.45),
          DashboardPriorityBadge(
            label: localizedReviewStatus(l10n, submission.statusLabel),
          ),
        ],
      ),
    );
  }
}

class SubmissionMediaCard extends StatelessWidget {
  const SubmissionMediaCard({super.key, required this.media});

  final SubmissionMediaItem media;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final uploadedLabel = media.createdAt != null
        ? DateFormat('MMM d, yyyy • h:mm a').format(media.createdAt!)
        : l10n.specialistSubmissionUploadTimeUnavailable;

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                _iconForType(media.mediaType),
                color: DashboardColors.brandCyan,
                size: context.dashSpacing * 0.55,
              ),
              SizedBox(width: context.dashSpacing * 0.45),
              Expanded(
                child: Text(
                  localizedSubmissionMediaTypeLabel(l10n, media.mediaTypeLabel),
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: context.dashSpacing * 0.5),
          _MediaPreview(media: media),
          SizedBox(height: context.dashSpacing * 0.5),
          Text(
            media.fileName,
            style: theme.textTheme.bodySmall?.copyWith(
              fontWeight: FontWeight.w600,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.15),
          Text(
            uploadedLabel,
            style: theme.textTheme.labelSmall?.copyWith(
              color: DashboardColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }

  IconData _iconForType(String type) {
    return switch (type.toLowerCase()) {
      'audio' => Icons.audiotrack_outlined,
      'video' => Icons.videocam_outlined,
      'image' => Icons.image_outlined,
      _ => Icons.attach_file_outlined,
    };
  }
}

class _MediaPreview extends StatelessWidget {
  const _MediaPreview({required this.media});

  final SubmissionMediaItem media;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final url = ApiConstants.resolveMediaUrl(media.fileUrl);
    if (url == null || url.isEmpty) {
      return DashboardEmptyCard(
        message: l10n.specialistSubmissionMediaUnavailable,
      );
    }

    return switch (media.mediaType.toLowerCase()) {
      'image' => ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: CachedNetworkImage(
          imageUrl: url,
          height: context.dashboardSize.height * 0.22,
          width: double.infinity,
          fit: BoxFit.cover,
          placeholder: (_, __) => Container(
            height: context.dashboardSize.height * 0.22,
            color: DashboardColors.border,
            alignment: Alignment.center,
            child: const CircularProgressIndicator(),
          ),
          errorWidget: (_, __, ___) => Container(
            height: context.dashboardSize.height * 0.22,
            color: DashboardColors.border,
            alignment: Alignment.center,
            child: const Icon(Icons.broken_image_outlined),
          ),
        ),
      ),
      'video' => _NetworkVideoPlayer(url: url),
      'audio' => _NetworkAudioPlayer(url: url),
      _ => DashboardEmptyCard(
        message: l10n.specialistSubmissionUnsupportedMediaPreview,
      ),
    };
  }
}

class _NetworkVideoPlayer extends StatefulWidget {
  const _NetworkVideoPlayer({required this.url});

  final String url;

  @override
  State<_NetworkVideoPlayer> createState() => _NetworkVideoPlayerState();
}

class _NetworkVideoPlayerState extends State<_NetworkVideoPlayer> {
  late final VideoPlayerController _controller;
  var _initialized = false;
  var _hasError = false;

  @override
  void initState() {
    super.initState();
    _controller = VideoPlayerController.networkUrl(Uri.parse(widget.url))
      ..initialize()
          .then((_) {
            if (!mounted) return;
            setState(() => _initialized = true);
          })
          .catchError((_) {
            if (!mounted) return;
            setState(() => _hasError = true);
          });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    if (_hasError) {
      return DashboardEmptyCard(
        message: l10n.specialistSubmissionUnableLoadVideo,
      );
    }
    if (!_initialized) {
      return SizedBox(
        height: context.dashboardSize.height * 0.22,
        child: const Center(child: CircularProgressIndicator()),
      );
    }

    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: AspectRatio(
        aspectRatio: _controller.value.aspectRatio == 0
            ? 16 / 9
            : _controller.value.aspectRatio,
        child: Stack(
          alignment: Alignment.center,
          children: [
            VideoPlayer(_controller),
            IconButton(
              onPressed: () {
                setState(() {
                  _controller.value.isPlaying
                      ? _controller.pause()
                      : _controller.play();
                });
              },
              icon: Icon(
                _controller.value.isPlaying
                    ? Icons.pause_circle_filled_rounded
                    : Icons.play_circle_fill_rounded,
                size: 48,
                color: Colors.white.withValues(alpha: 0.92),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NetworkAudioPlayer extends StatefulWidget {
  const _NetworkAudioPlayer({required this.url});

  final String url;

  @override
  State<_NetworkAudioPlayer> createState() => _NetworkAudioPlayerState();
}

class _NetworkAudioPlayerState extends State<_NetworkAudioPlayer> {
  late final VideoPlayerController _controller;
  var _initialized = false;
  var _hasError = false;

  @override
  void initState() {
    super.initState();
    _controller = VideoPlayerController.networkUrl(Uri.parse(widget.url))
      ..initialize()
          .then((_) {
            if (!mounted) return;
            setState(() => _initialized = true);
          })
          .catchError((_) {
            if (!mounted) return;
            setState(() => _hasError = true);
          });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  String _formatDuration(Duration duration) {
    final minutes = duration.inMinutes.remainder(60).toString().padLeft(2, '0');
    final seconds = duration.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    if (_hasError) {
      return DashboardEmptyCard(
        message: l10n.specialistSubmissionUnableLoadAudio,
      );
    }
    if (!_initialized) {
      return const Center(child: CircularProgressIndicator());
    }

    return Container(
      padding: EdgeInsets.all(context.dashSpacing * 0.65),
      decoration: BoxDecoration(
        color: DashboardColors.brandSoft,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          IconButton(
            onPressed: () {
              setState(() {
                _controller.value.isPlaying
                    ? _controller.pause()
                    : _controller.play();
              });
            },
            icon: Icon(
              _controller.value.isPlaying
                  ? Icons.pause_circle_filled_rounded
                  : Icons.play_circle_fill_rounded,
              size: 44,
              color: DashboardColors.brandCyan,
            ),
          ),
          VideoProgressIndicator(
            _controller,
            allowScrubbing: true,
            colors: const VideoProgressColors(
              playedColor: DashboardColors.brandCyan,
              bufferedColor: DashboardColors.border,
              backgroundColor: DashboardColors.border,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.25),
          Text(
            '${_formatDuration(_controller.value.position)} / ${_formatDuration(_controller.value.duration)}',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class ReviewStarRating extends StatelessWidget {
  const ReviewStarRating({
    super.key,
    required this.rating,
    required this.onChanged,
  });

  final int rating;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(5, (index) {
        final star = index + 1;
        final isSelected = star <= rating;
        return IconButton(
          onPressed: () => onChanged(star),
          icon: Icon(
            isSelected ? Icons.star_rounded : Icons.star_outline_rounded,
            color: isSelected
                ? DashboardColors.warning
                : DashboardColors.textMuted,
          ),
        );
      }),
    );
  }
}

class ReviewDecisionSelector extends StatelessWidget {
  const ReviewDecisionSelector({
    super.key,
    required this.decision,
    required this.onChanged,
  });

  final ReviewDecision decision;
  final ValueChanged<ReviewDecision> onChanged;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Row(
      children: [
        Expanded(
          child: _DecisionChip(
            label: localizedReviewDecision(l10n, ReviewDecision.approved),
            selected: decision == ReviewDecision.approved,
            onTap: () => onChanged(ReviewDecision.approved),
          ),
        ),
        SizedBox(width: context.dashSpacing * 0.5),
        Expanded(
          child: _DecisionChip(
            label: localizedReviewDecision(l10n, ReviewDecision.needsRetry),
            selected: decision == ReviewDecision.needsRetry,
            onTap: () => onChanged(ReviewDecision.needsRetry),
          ),
        ),
      ],
    );
  }
}

class _DecisionChip extends StatelessWidget {
  const _DecisionChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: EdgeInsets.symmetric(vertical: context.dashSpacing * 0.55),
        decoration: BoxDecoration(
          color: selected ? DashboardColors.brandSoft : DashboardColors.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: selected
                ? DashboardColors.brandCyan
                : DashboardColors.border,
          ),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: Theme.of(context).textTheme.labelLarge?.copyWith(
            color: selected
                ? DashboardColors.brandCyan
                : DashboardColors.textSecondary,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}
