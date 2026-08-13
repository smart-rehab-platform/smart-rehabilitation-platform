import 'dart:async';
import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import 'parent_extended_localization_utils.dart';

class ParentExerciseMediaSelection {
  const ParentExerciseMediaSelection({
    required this.bytes,
    required this.filename,
    required this.mediaType,
  });

  final List<int> bytes;
  final String filename;
  final String mediaType;

  String get displayLabel {
    switch (mediaType) {
      case 'video':
        return 'Video';
      case 'audio':
        return 'Audio';
      default:
        return 'Photo';
    }
  }

  IconData get icon {
    switch (mediaType) {
      case 'video':
        return Icons.videocam_outlined;
      case 'audio':
        return Icons.mic_outlined;
      default:
        return Icons.image_outlined;
    }
  }
}

String inferExerciseMediaType(String filename) {
  final lower = filename.toLowerCase();
  if (lower.endsWith('.mp4') ||
      lower.endsWith('.mov') ||
      lower.endsWith('.avi') ||
      lower.endsWith('.mkv')) {
    return 'video';
  }
  if (lower.endsWith('.mp3') ||
      lower.endsWith('.wav') ||
      lower.endsWith('.m4a') ||
      lower.endsWith('.aac') ||
      lower.endsWith('.ogg') ||
      lower.endsWith('.webm') ||
      lower.endsWith('.flac')) {
    return 'audio';
  }
  return 'image';
}

Future<void> showPermissionRequiredSnackBar(BuildContext context) async {
  if (!context.mounted) {
    return;
  }
  final l10n = AppLocalizations.of(context)!;
  ScaffoldMessenger.of(
    context,
  ).showSnackBar(SnackBar(content: Text(l10n.parentMediaPermissionRequired)));
}

Future<void> showAddExerciseMediaSheet({
  required BuildContext context,
  required Future<void> Function() onChooseFiles,
  required Future<void> Function() onRecordVideo,
  required Future<void> Function() onRecordAudio,
  required Future<void> Function() onTakePhoto,
}) async {
  await showModalBottomSheet<void>(
    context: context,
    backgroundColor: DashboardColors.surface,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(
        top: Radius.circular(context.dashSpacing),
      ),
    ),
    builder: (sheetContext) {
      final l10n = AppLocalizations.of(sheetContext)!;
      return SafeArea(
        child: Padding(
          padding: EdgeInsets.fromLTRB(
            context.dashSpacing,
            context.dashSpacing * 0.5,
            context.dashSpacing,
            context.dashSpacing,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: DashboardColors.border,
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
              ),
              SizedBox(height: context.dashSpacing * 0.75),
              Text(
                l10n.parentMediaAdd,
                style: Theme.of(sheetContext).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: DashboardColors.textPrimary,
                ),
              ),
              SizedBox(height: context.dashSpacing * 0.35),
              Text(
                l10n.parentMediaAddDescription,
                style: Theme.of(sheetContext).textTheme.bodySmall?.copyWith(
                  color: DashboardColors.textSecondary,
                ),
              ),
              SizedBox(height: context.dashSpacing * 0.75),
              _MediaSheetTile(
                icon: Icons.folder_open_outlined,
                label: l10n.parentMediaChooseFromGallery,
                onTap: () async {
                  Navigator.of(sheetContext).pop();
                  await onChooseFiles();
                },
              ),
              _MediaSheetTile(
                icon: Icons.videocam_outlined,
                label: l10n.parentMediaRecordVideo,
                onTap: () async {
                  Navigator.of(sheetContext).pop();
                  await onRecordVideo();
                },
              ),
              _MediaSheetTile(
                icon: Icons.mic_none_outlined,
                label: l10n.parentMediaRecordAudio,
                onTap: () async {
                  Navigator.of(sheetContext).pop();
                  await onRecordAudio();
                },
              ),
              _MediaSheetTile(
                icon: Icons.photo_camera_outlined,
                label: l10n.parentMediaTakePhoto,
                onTap: () async {
                  Navigator.of(sheetContext).pop();
                  await onTakePhoto();
                },
              ),
            ],
          ),
        ),
      );
    },
  );
}

class _MediaSheetTile extends StatelessWidget {
  const _MediaSheetTile({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.45),
      child: DashboardSurfaceCard(
        onTap: onTap,
        padding: EdgeInsets.symmetric(
          horizontal: context.dashSpacing * 0.75,
          vertical: context.dashSpacing * 0.55,
        ),
        child: Row(
          children: [
            Icon(icon, color: DashboardColors.brandCyan),
            SizedBox(width: context.dashSpacing * 0.65),
            Expanded(
              child: Text(
                label,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: DashboardColors.textPrimary,
                ),
              ),
            ),
            Icon(Icons.chevron_right_rounded, color: DashboardColors.textMuted),
          ],
        ),
      ),
    );
  }
}

Future<ParentExerciseMediaSelection?> pickExerciseMediaFromFiles() async {
  final result = await FilePicker.platform.pickFiles(withData: true);
  if (result == null || result.files.isEmpty) {
    return null;
  }

  final file = result.files.first;
  if (file.bytes == null || file.bytes!.isEmpty) {
    return null;
  }

  final filename = file.name.isNotEmpty ? file.name : 'attachment';
  return ParentExerciseMediaSelection(
    bytes: file.bytes!,
    filename: filename,
    mediaType: inferExerciseMediaType(filename),
  );
}

Future<ParentExerciseMediaSelection?> captureExercisePhoto(
  BuildContext context,
) async {
  try {
    final picker = ImagePicker();
    final photo = await picker.pickImage(
      source: ImageSource.camera,
      imageQuality: 85,
    );
    if (photo == null) {
      return null;
    }

    final bytes = await photo.readAsBytes();
    final filename = photo.name.isNotEmpty
        ? photo.name
        : p.basename(photo.path.isNotEmpty ? photo.path : 'photo.jpg');

    return ParentExerciseMediaSelection(
      bytes: bytes,
      filename: filename.endsWith('.jpg') || filename.endsWith('.jpeg')
          ? filename
          : '$filename.jpg',
      mediaType: 'image',
    );
  } on PlatformException catch (error) {
    if (_isPermissionError(error) && context.mounted) {
      await showPermissionRequiredSnackBar(context);
    }
    return null;
  } catch (_) {
    return null;
  }
}

Future<ParentExerciseMediaSelection?> recordExerciseVideo(
  BuildContext context,
) async {
  try {
    final picker = ImagePicker();
    final video = await picker.pickVideo(source: ImageSource.camera);
    if (video == null) {
      return null;
    }

    final bytes = await video.readAsBytes();
    final filename = video.name.isNotEmpty
        ? video.name
        : p.basename(video.path.isNotEmpty ? video.path : 'video.mp4');

    return ParentExerciseMediaSelection(
      bytes: bytes,
      filename: filename.endsWith('.mp4') ? filename : '$filename.mp4',
      mediaType: 'video',
    );
  } on PlatformException catch (error) {
    if (_isPermissionError(error) && context.mounted) {
      await showPermissionRequiredSnackBar(context);
    }
    return null;
  } catch (_) {
    return null;
  }
}

Future<ParentExerciseMediaSelection?> showExerciseAudioRecorderSheet(
  BuildContext context,
) async {
  return showModalBottomSheet<ParentExerciseMediaSelection>(
    context: context,
    isScrollControlled: true,
    backgroundColor: DashboardColors.surface,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(
        top: Radius.circular(context.dashSpacing),
      ),
    ),
    builder: (_) => const _ExerciseAudioRecorderSheet(),
  );
}

bool _isPermissionError(PlatformException error) {
  final code = error.code.toLowerCase();
  return code.contains('permission') ||
      code.contains('denied') ||
      code.contains('access');
}

class _ExerciseAudioRecorderSheet extends StatefulWidget {
  const _ExerciseAudioRecorderSheet();

  @override
  State<_ExerciseAudioRecorderSheet> createState() =>
      _ExerciseAudioRecorderSheetState();
}

class _ExerciseAudioRecorderSheetState
    extends State<_ExerciseAudioRecorderSheet> {
  final _recorder = AudioRecorder();
  bool _isRecording = false;
  bool _isBusy = false;
  String? _recordedPath;

  @override
  void dispose() {
    unawaited(_recorder.dispose());
    super.dispose();
  }

  Future<void> _startRecording() async {
    if (_isBusy) {
      return;
    }

    setState(() => _isBusy = true);
    try {
      final hasPermission = await _recorder.hasPermission();
      if (!hasPermission) {
        if (mounted) {
          await showPermissionRequiredSnackBar(context);
        }
        return;
      }

      final dir = await getTemporaryDirectory();
      final path = p.join(
        dir.path,
        'exercise_audio_${DateTime.now().millisecondsSinceEpoch}.m4a',
      );

      await _recorder.start(
        const RecordConfig(
          encoder: AudioEncoder.aacLc,
          bitRate: 128000,
          sampleRate: 44100,
        ),
        path: path,
      );

      if (!mounted) {
        return;
      }
      setState(() {
        _isRecording = true;
        _recordedPath = path;
      });
    } catch (_) {
      if (mounted) {
        final l10n = AppLocalizations.of(context)!;
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(l10n.parentMediaRecordFailed)));
      }
    } finally {
      if (mounted) {
        setState(() => _isBusy = false);
      }
    }
  }

  Future<void> _stopRecording() async {
    if (_isBusy || !_isRecording) {
      return;
    }

    setState(() => _isBusy = true);
    try {
      final path = await _recorder.stop();
      final resolvedPath = path ?? _recordedPath;
      if (resolvedPath == null || !File(resolvedPath).existsSync()) {
        if (mounted) {
          final l10n = AppLocalizations.of(context)!;
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(l10n.parentMediaRecordFailed)));
        }
        return;
      }

      final bytes = await File(resolvedPath).readAsBytes();
      if (bytes.isEmpty) {
        if (mounted) {
          final l10n = AppLocalizations.of(context)!;
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(l10n.parentMediaRecordFailed)));
        }
        return;
      }

      if (!mounted) {
        return;
      }
      Navigator.of(context).pop(
        ParentExerciseMediaSelection(
          bytes: bytes,
          filename: p.basename(resolvedPath),
          mediaType: 'audio',
        ),
      );
    } catch (_) {
      if (mounted) {
        final l10n = AppLocalizations.of(context)!;
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(l10n.parentMediaRecordFailed)));
      }
    } finally {
      if (mounted) {
        setState(() {
          _isBusy = false;
          _isRecording = false;
        });
      }
    }
  }

  Future<void> _cancel() async {
    if (_isRecording) {
      await _recorder.stop();
    }
    if (mounted) {
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return SafeArea(
      child: Padding(
        padding: EdgeInsets.fromLTRB(
          context.dashSpacing,
          context.dashSpacing * 0.5,
          context.dashSpacing,
          context.dashSpacing,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: DashboardColors.border,
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.75),
            Text(
              l10n.parentMediaRecordAudio,
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.35),
            Text(
              _isRecording
                  ? l10n.parentMediaRecordingInProgress
                  : l10n.parentMediaTapStartStop,
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textSecondary,
              ),
            ),
            SizedBox(height: context.dashSpacing),
            DashboardSurfaceCard(
              child: Row(
                children: [
                  Icon(
                    _isRecording ? Icons.fiber_manual_record : Icons.mic_none,
                    color: _isRecording
                        ? DashboardColors.warning
                        : DashboardColors.brandCyan,
                  ),
                  SizedBox(width: context.dashSpacing * 0.65),
                  Expanded(
                    child: Text(
                      _isRecording
                          ? l10n.parentMediaRecordingAudio
                          : l10n.parentMediaReadyToRecord,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(height: context.dashSpacing),
            if (!_isRecording)
              ElevatedButton.icon(
                onPressed: _isBusy ? null : _startRecording,
                icon: const Icon(Icons.fiber_manual_record),
                label: Text(l10n.parentMediaStartRecording),
                style: ElevatedButton.styleFrom(
                  backgroundColor: DashboardColors.brandCyan,
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.symmetric(
                    vertical: context.dashSpacing * 0.75,
                  ),
                ),
              )
            else
              ElevatedButton.icon(
                onPressed: _isBusy ? null : _stopRecording,
                icon: const Icon(Icons.stop_rounded),
                label: Text(l10n.parentMediaStopRecording),
                style: ElevatedButton.styleFrom(
                  backgroundColor: DashboardColors.warning,
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.symmetric(
                    vertical: context.dashSpacing * 0.75,
                  ),
                ),
              ),
            SizedBox(height: context.dashSpacing * 0.5),
            TextButton(
              onPressed: _isBusy ? null : _cancel,
              child: Text(l10n.commonCancel),
            ),
          ],
        ),
      ),
    );
  }
}

class ParentExerciseMediaSection extends StatelessWidget {
  const ParentExerciseMediaSection({
    super.key,
    required this.selection,
    required this.onAddMedia,
    required this.onRemoveMedia,
  });

  final ParentExerciseMediaSelection? selection;
  final VoidCallback onAddMedia;
  final VoidCallback onRemoveMedia;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        OutlinedButton.icon(
          onPressed: onAddMedia,
          icon: const Icon(Icons.add_photo_alternate_outlined),
          label: Text(l10n.parentMediaAdd),
          style: OutlinedButton.styleFrom(
            foregroundColor: DashboardColors.brandCyan,
            side: BorderSide(
              color: DashboardColors.brandCyan.withValues(alpha: 0.35),
            ),
            padding: EdgeInsets.symmetric(vertical: context.dashSpacing * 0.75),
          ),
        ),
        if (selection != null) ...[
          SizedBox(height: context.dashSpacing * 0.6),
          DashboardSurfaceCard(
            child: Row(
              children: [
                Container(
                  padding: EdgeInsets.all(context.dashSpacing * 0.45),
                  decoration: BoxDecoration(
                    color: DashboardColors.brandSoft,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    selection!.icon,
                    color: DashboardColors.brandCyan,
                  ),
                ),
                SizedBox(width: context.dashSpacing * 0.65),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        selection!.filename,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      SizedBox(height: context.dashSpacing * 0.1),
                      Text(
                        formatParentExerciseMediaAttachedLabel(
                          l10n,
                          selection!.mediaType,
                        ),
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: DashboardColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  tooltip: l10n.parentMediaRemoveTooltip,
                  onPressed: onRemoveMedia,
                  icon: Icon(
                    Icons.close_rounded,
                    color: DashboardColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}
