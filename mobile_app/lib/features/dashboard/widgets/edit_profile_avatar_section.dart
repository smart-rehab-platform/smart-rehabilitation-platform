import 'dart:typed_data';

import 'package:flutter/material.dart';

import 'dashboard_layout.dart';
import 'dashboard_profile_avatar.dart';
import 'profile_image_picker.dart';

class EditProfileAvatarSection extends StatefulWidget {
  const EditProfileAvatarSection({
    super.key,
    required this.fullName,
    this.initialsFallback = 'PR',
    this.imageUrl,
    this.previewBytes,
    this.isBusy = false,
    required this.onImageSelected,
    this.onImageError,
  });

  final String fullName;
  final String initialsFallback;
  final String? imageUrl;
  final Uint8List? previewBytes;
  final bool isBusy;
  final ValueChanged<ProfileImagePickerResult> onImageSelected;
  final ValueChanged<String>? onImageError;

  @override
  State<EditProfileAvatarSection> createState() =>
      _EditProfileAvatarSectionState();
}

class _EditProfileAvatarSectionState extends State<EditProfileAvatarSection> {
  final ProfileImagePicker _picker = ProfileImagePicker();

  Future<void> _pickImage() async {
    if (widget.isBusy) {
      return;
    }

    try {
      final result = await _picker.showSourceSheet(context);
      if (result == null || !mounted) {
        return;
      }
      widget.onImageSelected(result);
    } catch (error) {
      if (!mounted) {
        return;
      }
      widget.onImageError?.call(error.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: EditableProfileAvatar(
        initials: dashboardInitials(widget.fullName, fallback: widget.initialsFallback),
        imageUrl: widget.imageUrl,
        previewBytes: widget.previewBytes,
        isLoading: widget.isBusy,
        onEditTap: _pickImage,
        onAvatarTap: _pickImage,
      ),
    );
  }
}
