import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

import '../../../../core/constants/app_colors.dart';

enum SignupProfilePhotoSource { camera, gallery }

Future<SignupProfilePhotoSource?> showSignupProfilePhotoSourceSheet(
  BuildContext context,
) {
  return showModalBottomSheet<SignupProfilePhotoSource>(
    context: context,
    backgroundColor: Colors.transparent,
    isScrollControlled: true,
    builder: (sheetContext) => SignupProfilePhotoSourceSheet(),
  );
}

class SignupProfilePhotoSourceSheet extends StatelessWidget {
  const SignupProfilePhotoSourceSheet({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: AppColors.authCardBackground.withValues(alpha: 0.98),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: AppColors.authBorder.withValues(alpha: 0.85),
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 10),
              Center(
                child: Container(
                  width: 38,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.lightBlue.withValues(alpha: 0.28),
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(18, 16, 18, 8),
                child: Text(
                  l10n.signupChooseProfilePhoto,
                  style: GoogleFonts.syne(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.white,
                  ),
                ),
              ),
              Divider(height: 1, color: AppColors.cyan.withValues(alpha: 0.14)),
              _SignupPhotoSourceOption(
                icon: Icons.photo_camera_outlined,
                title: l10n.signupTakePhoto,
                subtitle: l10n.signupTakePhotoSubtitle,
                semanticLabel: l10n.signupTakePhotoSemantic,
                onTap: () =>
                    Navigator.pop(context, SignupProfilePhotoSource.camera),
              ),
              Divider(
                height: 1,
                indent: 18,
                endIndent: 18,
                color: AppColors.cyan.withValues(alpha: 0.1),
              ),
              _SignupPhotoSourceOption(
                icon: Icons.photo_library_outlined,
                title: l10n.signupChooseFromGallery,
                subtitle: l10n.signupChooseFromGallerySubtitle,
                semanticLabel: l10n.signupChooseFromGallerySemantic,
                onTap: () =>
                    Navigator.pop(context, SignupProfilePhotoSource.gallery),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(18, 8, 18, 16),
                child: Semantics(
                  button: true,
                  label: l10n.signupCancelPhotoSelection,
                  child: TextButton(
                    onPressed: () => Navigator.pop(context),
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.lightBlue,
                      minimumSize: const Size.fromHeight(48),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: BorderSide(
                          color: AppColors.authBorder.withValues(alpha: 0.75),
                        ),
                      ),
                    ),
                    child: Text(
                      l10n.commonCancel,
                      style: GoogleFonts.inter(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SignupPhotoSourceOption extends StatelessWidget {
  const _SignupPhotoSourceOption({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.semanticLabel,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final String semanticLabel;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: semanticLabel,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: AppColors.cyan.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: AppColors.cyan.withValues(alpha: 0.22),
                    ),
                  ),
                  child: Icon(icon, size: 20, color: AppColors.cyan),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: GoogleFonts.inter(
                          fontSize: 13.5,
                          fontWeight: FontWeight.w700,
                          color: AppColors.white,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        subtitle,
                        style: GoogleFonts.inter(
                          fontSize: 11.5,
                          height: 1.4,
                          color: AppColors.lightBlue.withValues(alpha: 0.72),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
