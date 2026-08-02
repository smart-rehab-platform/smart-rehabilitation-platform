import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../auth/providers/auth_provider.dart';
import '../../../l10n/app_localizations.dart';

class ProfileImagePickerResult {
  const ProfileImagePickerResult({required this.bytes, required this.filename});

  final Uint8List bytes;
  final String filename;
}

enum _ProfileImagePickAction { camera, gallery }

/// Shows gallery/camera options and returns compressed image bytes.
class ProfileImagePicker {
  ProfileImagePicker({ImagePicker? picker}) : _picker = picker ?? ImagePicker();

  final ImagePicker _picker;

  Future<ProfileImagePickerResult?> showSourceSheet(
    BuildContext context,
  ) async {
    final l10n = AppLocalizations.of(context);
    final action = await showModalBottomSheet<_ProfileImagePickAction>(
      context: context,
      builder: (sheetContext) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.photo_camera_outlined),
              title: Text(l10n?.parentProfilePhotoTake ?? 'Take Photo'),
              onTap: () =>
                  Navigator.pop(sheetContext, _ProfileImagePickAction.camera),
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined),
              title: Text(
                l10n?.parentProfilePhotoChooseGallery ?? 'Choose from Gallery',
              ),
              onTap: () =>
                  Navigator.pop(sheetContext, _ProfileImagePickAction.gallery),
            ),
            ListTile(
              leading: const Icon(Icons.close_rounded),
              title: Text(l10n?.commonCancel ?? 'Cancel'),
              onTap: () => Navigator.pop(sheetContext),
            ),
          ],
        ),
      ),
    );

    if (action == null) {
      return null;
    }

    return pick(
      source: action == _ProfileImagePickAction.camera
          ? ImageSource.camera
          : ImageSource.gallery,
    );
  }

  Future<ProfileImagePickerResult?> pick({required ImageSource source}) async {
    try {
      final picked = await _picker.pickImage(
        source: source,
        maxWidth: 1200,
        imageQuality: 85,
      );
      if (picked == null) {
        return null;
      }

      final bytes = await picked.readAsBytes();
      if (bytes.isEmpty) {
        throw Exception('Selected image is empty.');
      }

      final filename = _normalizeFilename(picked.name, picked.path);
      return ProfileImagePickerResult(bytes: bytes, filename: filename);
    } on Exception {
      rethrow;
    } catch (error) {
      throw Exception('Unable to select image: $error');
    }
  }

  String _normalizeFilename(String name, String path) {
    if (name.trim().isNotEmpty) {
      return name.trim();
    }
    final segments = path.split(RegExp(r'[\\/]'));
    if (segments.isNotEmpty && segments.last.isNotEmpty) {
      return segments.last;
    }
    return 'profile.jpg';
  }
}

Future<void> uploadPendingProfileImage({
  required Ref ref,
  required Uint8List? pendingImageBytes,
  required String? pendingImageFilename,
}) async {
  if (pendingImageBytes == null || pendingImageFilename == null) {
    return;
  }

  final success = await ref
      .read(authProvider.notifier)
      .uploadProfileImage(pendingImageBytes, pendingImageFilename);

  if (!success) {
    final message =
        ref.read(authProvider).errorMessage ??
        'Failed to upload profile image.';
    throw Exception(message);
  }
}
