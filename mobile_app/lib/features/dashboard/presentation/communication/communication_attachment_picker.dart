import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path/path.dart' as p;

import '../../../../core/constants/dashboard_colors.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../parent/parent_exercise_media_picker.dart';

class CommunicationAttachmentSelection {
  const CommunicationAttachmentSelection({
    required this.bytes,
    required this.filename,
    required this.mimeType,
  });

  final List<int> bytes;
  final String filename;
  final String mimeType;

  int get sizeBytes => bytes.length;

  bool get isImage => mimeType.startsWith('image/');
  bool get isAudio => mimeType.startsWith('audio/');
  bool get isVideo => mimeType.startsWith('video/');
  bool get isPdf => mimeType == 'application/pdf';

  String get displayLabel {
    if (isImage) return 'Image';
    if (isAudio) return 'Audio';
    if (isVideo) return 'Video';
    if (isPdf) return 'PDF';
    return 'File';
  }

  IconData get icon {
    if (isImage) return Icons.image_outlined;
    if (isAudio) return Icons.audiotrack_outlined;
    if (isVideo) return Icons.videocam_outlined;
    if (isPdf) return Icons.picture_as_pdf_outlined;
    return Icons.insert_drive_file_outlined;
  }
}

const _allowedMimeTypes = <String>{
  'image/jpeg',
  'image/png',
  'image/webp',
  'audio/mpeg',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'audio/wav',
  'audio/x-wav',
  'audio/aac',
  'application/pdf',
  'video/mp4',
  'video/quicktime',
};

const _maxBytesByCategory = <String, int>{
  'image': 10 * 1024 * 1024,
  'audio': 25 * 1024 * 1024,
  'pdf': 15 * 1024 * 1024,
  'video': 50 * 1024 * 1024,
  'file': 50 * 1024 * 1024,
};

String? inferCommunicationMimeType(String filename, {String? reportedMime}) {
  final normalized = reportedMime?.trim().toLowerCase();
  if (normalized != null &&
      normalized.isNotEmpty &&
      _allowedMimeTypes.contains(normalized)) {
    return normalized;
  }

  final lower = filename.toLowerCase();
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.mp3')) return 'audio/mpeg';
  if (lower.endsWith('.m4a')) return 'audio/mp4';
  if (lower.endsWith('.wav')) return 'audio/wav';
  if (lower.endsWith('.aac')) return 'audio/aac';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.mp4')) return 'video/mp4';
  if (lower.endsWith('.mov')) return 'video/quicktime';
  return null;
}

String? validateCommunicationAttachmentSelection(
  CommunicationAttachmentSelection selection,
) {
  if (!_allowedMimeTypes.contains(selection.mimeType)) {
    return 'This file type is not supported.';
  }

  final category = selection.isImage
      ? 'image'
      : selection.isAudio
      ? 'audio'
      : selection.isPdf
      ? 'pdf'
      : selection.isVideo
      ? 'video'
      : 'file';
  final maxBytes =
      _maxBytesByCategory[category] ?? _maxBytesByCategory['file']!;
  if (selection.sizeBytes > maxBytes) {
    final maxMb = (maxBytes / (1024 * 1024)).round();
    return 'File is too large. Maximum allowed size is $maxMb MB.';
  }

  return null;
}

CommunicationAttachmentSelection? _fromExerciseSelection(
  ParentExerciseMediaSelection selection,
) {
  final mimeType = inferCommunicationMimeType(selection.filename);
  if (mimeType == null) {
    return null;
  }

  return CommunicationAttachmentSelection(
    bytes: selection.bytes,
    filename: selection.filename,
    mimeType: mimeType,
  );
}

Future<CommunicationAttachmentSelection?>
pickCommunicationImageFromGallery() async {
  final picker = ImagePicker();
  final image = await picker.pickImage(
    source: ImageSource.gallery,
    imageQuality: 90,
  );
  if (image == null) {
    return null;
  }

  final bytes = await image.readAsBytes();
  final filename = image.name.isNotEmpty
      ? image.name
      : p.basename(image.path.isNotEmpty ? image.path : 'image.jpg');
  final mimeType = inferCommunicationMimeType(filename);
  if (mimeType == null || !mimeType.startsWith('image/')) {
    return null;
  }

  return CommunicationAttachmentSelection(
    bytes: bytes,
    filename: filename,
    mimeType: mimeType,
  );
}

Future<CommunicationAttachmentSelection?> pickCommunicationFile() async {
  final result = await FilePicker.platform.pickFiles(
    withData: true,
    type: FileType.custom,
    allowedExtensions: const [
      'jpg',
      'jpeg',
      'png',
      'webp',
      'mp3',
      'm4a',
      'wav',
      'aac',
      'pdf',
      'mp4',
      'mov',
    ],
  );
  if (result == null || result.files.isEmpty) {
    return null;
  }

  final file = result.files.first;
  if (file.bytes == null || file.bytes!.isEmpty) {
    return null;
  }

  final filename = file.name.isNotEmpty ? file.name : 'attachment';
  final mimeType = inferCommunicationMimeType(
    filename,
    reportedMime: file.extension != null ? null : null,
  );
  if (mimeType == null) {
    return null;
  }

  return CommunicationAttachmentSelection(
    bytes: file.bytes!,
    filename: filename,
    mimeType: mimeType,
  );
}

Future<void> showCommunicationAttachmentSheet({
  required BuildContext context,
  required Future<void> Function(CommunicationAttachmentSelection selection)
  onSelected,
}) async {
  Future<void> handleSelection(
    CommunicationAttachmentSelection? selection,
  ) async {
    if (selection == null) {
      return;
    }
    final validationError = validateCommunicationAttachmentSelection(selection);
    if (validationError != null) {
      if (context.mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(validationError)));
      }
      return;
    }
    await onSelected(selection);
  }

  await showModalBottomSheet<void>(
    context: context,
    backgroundColor: DashboardColors.surface,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(
        top: Radius.circular(context.dashSpacing),
      ),
    ),
    builder: (sheetContext) {
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
                'Attach a file',
                style: Theme.of(
                  sheetContext,
                ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
              ),
              SizedBox(height: context.dashSpacing * 0.75),
              _AttachmentSheetTile(
                icon: Icons.photo_camera_outlined,
                label: 'Take Photo',
                onTap: () async {
                  Navigator.of(sheetContext).pop();
                  final photo = await captureExercisePhoto(context);
                  await handleSelection(
                    photo == null ? null : _fromExerciseSelection(photo),
                  );
                },
              ),
              _AttachmentSheetTile(
                icon: Icons.image_outlined,
                label: 'Choose Image',
                onTap: () async {
                  Navigator.of(sheetContext).pop();
                  await handleSelection(
                    await pickCommunicationImageFromGallery(),
                  );
                },
              ),
              _AttachmentSheetTile(
                icon: Icons.mic_none_outlined,
                label: 'Record Audio',
                onTap: () async {
                  Navigator.of(sheetContext).pop();
                  final audio = await showExerciseAudioRecorderSheet(context);
                  await handleSelection(
                    audio == null ? null : _fromExerciseSelection(audio),
                  );
                },
              ),
              _AttachmentSheetTile(
                icon: Icons.folder_open_outlined,
                label: 'Choose File',
                onTap: () async {
                  Navigator.of(sheetContext).pop();
                  await handleSelection(await pickCommunicationFile());
                },
              ),
              _AttachmentSheetTile(
                icon: Icons.videocam_outlined,
                label: 'Choose Video',
                onTap: () async {
                  Navigator.of(sheetContext).pop();
                  final video = await ImagePicker().pickVideo(
                    source: ImageSource.gallery,
                  );
                  if (video == null) {
                    return;
                  }
                  final bytes = await video.readAsBytes();
                  final filename = video.name.isNotEmpty
                      ? video.name
                      : p.basename(
                          video.path.isNotEmpty ? video.path : 'video.mp4',
                        );
                  final mimeType = inferCommunicationMimeType(filename);
                  if (mimeType == null || !mimeType.startsWith('video/')) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Unsupported video format.'),
                        ),
                      );
                    }
                    return;
                  }
                  await handleSelection(
                    CommunicationAttachmentSelection(
                      bytes: bytes,
                      filename: filename,
                      mimeType: mimeType,
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      );
    },
  );
}

class _AttachmentSheetTile extends StatelessWidget {
  const _AttachmentSheetTile({
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
            Icon(icon, color: DashboardColors.primary),
            SizedBox(width: context.dashSpacing * 0.65),
            Expanded(
              child: Text(
                label,
                style: Theme.of(
                  context,
                ).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
              ),
            ),
            Icon(Icons.chevron_right_rounded, color: DashboardColors.textMuted),
          ],
        ),
      ),
    );
  }
}
