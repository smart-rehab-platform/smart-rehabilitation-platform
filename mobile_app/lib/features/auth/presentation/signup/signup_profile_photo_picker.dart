import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

import '../../../../core/constants/app_colors.dart';

class SignupProfilePhotoPicker extends StatelessWidget {
  const SignupProfilePhotoPicker({
    super.key,
    required this.onTap,
    this.imageBytes,
  });

  final VoidCallback onTap;
  final Uint8List? imageBytes;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final hasImage = imageBytes != null;

    return Column(
      children: [
        Text(
          l10n.signupProfilePhoto,
          style: GoogleFonts.inter(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: AppColors.lightBlue,
          ),
        ),
        const SizedBox(height: 10),
        Semantics(
          button: true,
          label: hasImage
              ? l10n.signupProfilePhotoSemanticChange
              : l10n.signupProfilePhotoSemanticUpload,
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(40),
            child: Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.cyan.withValues(alpha: 0.05),
                border: Border.all(color: AppColors.cyan, width: 2),
              ),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  if (hasImage)
                    ClipOval(
                      child: Image.memory(imageBytes!, fit: BoxFit.cover),
                    )
                  else
                    const Icon(
                      Icons.camera_alt_outlined,
                      size: 22,
                      color: AppColors.cyan,
                    ),
                  Align(
                    alignment: Alignment.bottomRight,
                    child: Container(
                      width: 22,
                      height: 22,
                      decoration: BoxDecoration(
                        color: AppColors.darkBlue,
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.cyan, width: 1.2),
                      ),
                      child: Icon(
                        hasImage ? Icons.edit_rounded : Icons.add_rounded,
                        size: 12,
                        color: AppColors.cyan,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          hasImage
              ? l10n.signupProfilePhotoTapChange
              : l10n.signupProfilePhotoTapUpload,
          style: GoogleFonts.inter(
            fontSize: 10.5,
            color: AppColors.lightBlue.withValues(alpha: 0.65),
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}
