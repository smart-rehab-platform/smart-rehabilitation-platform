import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:video_player/video_player.dart';

import '../../core/constants/app_colors.dart';
import '../../features/auth/utils/password_strength.dart';

const _authBackgroundVideoAsset = 'assets/videos/auth-bg.mp4';
const _authBackgroundVideoStartSeconds = 4;

enum AuthFieldState { idle, success, error }

enum AuthSnackBarType { info, success, error }

void showAuthSnackBar(
  BuildContext context,
  String message, {
  AuthSnackBarType type = AuthSnackBarType.info,
}) {
  final backgroundColor = switch (type) {
    AuthSnackBarType.success => AppColors.success,
    AuthSnackBarType.error => AppColors.danger,
    AuthSnackBarType.info => AppColors.darkBlue,
  };
  final icon = switch (type) {
    AuthSnackBarType.success => Icons.check_circle_rounded,
    AuthSnackBarType.error => Icons.error_rounded,
    AuthSnackBarType.info => Icons.info_rounded,
  };
  final foregroundColor = type == AuthSnackBarType.info
      ? AppColors.lightBlue
      : AppColors.white;

  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        backgroundColor: Colors.transparent,
        elevation: 0,
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 18),
        content: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: backgroundColor.withValues(alpha: 0.95),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: AppColors.authBorder.withValues(alpha: 0.45),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.28),
                blurRadius: 18,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Row(
            children: [
              Icon(icon, size: 18, color: foregroundColor),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  message,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: foregroundColor,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
}

class AuthBackground extends StatefulWidget {
  const AuthBackground({
    super.key,
    required this.child,
    this.overlayOpacity = 0.80,
    this.bottomFade = true,
    this.showBackgroundVideo = false,
  });

  final Widget child;
  final double overlayOpacity;
  final bool bottomFade;
  final bool showBackgroundVideo;

  @override
  State<AuthBackground> createState() => _AuthBackgroundState();
}

class _AuthBackgroundState extends State<AuthBackground> {
  VideoPlayerController? _videoController;
  bool _isVideoReady = false;

  @override
  void initState() {
    super.initState();
    if (widget.showBackgroundVideo) {
      _initializeBackgroundVideo();
    }
  }

  @override
  void didUpdateWidget(covariant AuthBackground oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (widget.showBackgroundVideo && !oldWidget.showBackgroundVideo) {
      _initializeBackgroundVideo();
      return;
    }

    if (!widget.showBackgroundVideo && oldWidget.showBackgroundVideo) {
      _disposeBackgroundVideo();
    }
  }

  Future<void> _initializeBackgroundVideo() async {
    final controller = VideoPlayerController.asset(_authBackgroundVideoAsset);
    _videoController = controller;

    try {
      await controller.initialize();
      if (!mounted || _videoController != controller) {
        await controller.dispose();
        return;
      }

      await controller.setVolume(0);
      await controller.setLooping(false);

      final startPosition = Duration(seconds: _authBackgroundVideoStartSeconds);
      if (controller.value.duration > startPosition) {
        await controller.seekTo(startPosition);
      }

      controller.addListener(_handleVideoProgress);
      await controller.play();

      if (!mounted || _videoController != controller) {
        return;
      }

      setState(() => _isVideoReady = true);
    } catch (_) {
      if (_videoController == controller) {
        await controller.dispose();
        _videoController = null;
      }
    }
  }

  void _handleVideoProgress() {
    final controller = _videoController;
    if (controller == null || !controller.value.isInitialized) {
      return;
    }

    final duration = controller.value.duration;
    final position = controller.value.position;
    if (duration.inMilliseconds <= 0) {
      return;
    }

    if (position >= duration - const Duration(milliseconds: 250)) {
      final startPosition = Duration(seconds: _authBackgroundVideoStartSeconds);
      if (duration > startPosition) {
        controller.seekTo(startPosition);
      } else {
        controller.seekTo(Duration.zero);
      }
      controller.play();
    }
  }

  Future<void> _disposeBackgroundVideo() async {
    final controller = _videoController;
    _videoController = null;
    _isVideoReady = false;

    if (controller != null) {
      controller.removeListener(_handleVideoProgress);
      await controller.dispose();
    }

    if (mounted) {
      setState(() {});
    }
  }

  @override
  void dispose() {
    final controller = _videoController;
    if (controller != null) {
      controller.removeListener(_handleVideoProgress);
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final showVideo =
        widget.showBackgroundVideo && _isVideoReady && _videoController != null;

    return DecoratedBox(
      decoration: const BoxDecoration(color: AppColors.primaryNavy),
      child: Stack(
        fit: StackFit.expand,
        children: [
          if (showVideo)
            RepaintBoundary(
              child: _AuthBackgroundVideoLayer(controller: _videoController!),
            )
          else if (!widget.showBackgroundVideo) ...[
            const _GlowOrb(
              size: 260,
              top: -70,
              left: -90,
              color: AppColors.mediumBlue,
              opacity: 0.08,
            ),
            const _GlowOrb(
              size: 320,
              top: 80,
              right: -130,
              color: AppColors.buttonHighlight,
              opacity: 0.05,
            ),
            const _GlowOrb(
              size: 300,
              bottom: -110,
              left: -70,
              color: AppColors.mediumBlue,
              opacity: 0.06,
            ),
            const _GlowOrb(
              size: 240,
              bottom: 10,
              right: -80,
              color: AppColors.buttonHighlight,
              opacity: 0.04,
            ),
          ],
          Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                color: AppColors.primaryNavy.withValues(
                  alpha: widget.overlayOpacity,
                ),
              ),
            ),
          ),
          if (widget.bottomFade && !widget.showBackgroundVideo)
            Positioned.fill(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.transparent,
                      AppColors.primaryNavy.withValues(alpha: 0.9),
                    ],
                    stops: const [0.3, 1],
                  ),
                ),
              ),
            ),
          widget.child,
        ],
      ),
    );
  }
}

class _AuthBackgroundVideoLayer extends StatelessWidget {
  const _AuthBackgroundVideoLayer({required this.controller});

  final VideoPlayerController controller;

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: AppColors.primaryNavy,
      child: SizedBox.expand(
        child: FittedBox(
          fit: BoxFit.cover,
          alignment: Alignment.center,
          child: SizedBox(
            width: controller.value.size.width,
            height: controller.value.size.height,
            child: Transform(
              alignment: Alignment.center,
              transform: Matrix4.identity()..scaleByDouble(-1.0, 1.0, 1.0, 1.0),
              child: ColorFiltered(
                colorFilter: const ColorFilter.matrix(<double>[
                  0.86, 0, 0, 0, 0,
                  0, 0.88, 0, 0, 0,
                  0, 0, 1.04, 0, 0,
                  0, 0, 0, 1, 0,
                ]),
                child: VideoPlayer(controller),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class AuthGlassCard extends StatelessWidget {
  const AuthGlassCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(20),
    this.borderRadius = const BorderRadius.all(Radius.circular(28)),
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final BorderRadius borderRadius;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: borderRadius,
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
        child: Container(
          padding: padding,
          decoration: BoxDecoration(
            color: AppColors.authCardBackground.withValues(alpha: 0.96),
            borderRadius: borderRadius,
            border: Border.all(
              color: AppColors.authBorder.withValues(alpha: 0.55),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.35),
                blurRadius: 32,
                offset: const Offset(0, -4),
              ),
            ],
          ),
          child: Stack(
            children: [
              Positioned(
                top: 0,
                left: 20,
                right: 20,
                child: Container(
                  height: 1,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        Colors.transparent,
                        AppColors.authBorder.withValues(alpha: 0.45),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),
              child,
            ],
          ),
        ),
      ),
    );
  }
}

class AuthLogoMark extends StatelessWidget {
  const AuthLogoMark({super.key, this.size = 72});

  final double size;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(size: Size.square(size), painter: _AuthLogoPainter());
  }
}

class AuthGradientHeadline extends StatelessWidget {
  const AuthGradientHeadline({
    super.key,
    required this.text,
    this.fontSize = 26,
    this.fontWeight = FontWeight.w800,
    this.textAlign = TextAlign.center,
  });

  final String text;
  final double fontSize;
  final FontWeight fontWeight;
  final TextAlign textAlign;

  @override
  Widget build(BuildContext context) {
    return ShaderMask(
      shaderCallback: (bounds) => const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [AppColors.mediumBlue, AppColors.buttonHighlight],
      ).createShader(bounds),
      child: Text(
        text,
        textAlign: textAlign,
        style: GoogleFonts.syne(
          color: Colors.white,
          fontSize: fontSize,
          fontWeight: fontWeight,
          height: 1.15,
        ),
      ),
    );
  }
}

class AuthFeaturePill extends StatelessWidget {
  const AuthFeaturePill({super.key, required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.darkBlue.withValues(alpha: 0.72),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.authBorder.withValues(alpha: 0.65)),
      ),
      child: Row(
        children: [
          Icon(icon, size: 14, color: AppColors.mediumBlue),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: GoogleFonts.inter(
                fontSize: 12,
                color: AppColors.lightBlue,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class AuthBackButton extends StatelessWidget {
  const AuthBackButton({super.key, required this.onPressed});

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return _RoundGlassButton(
      onPressed: onPressed,
      child: const Icon(
        Icons.arrow_back_ios_new_rounded,
        size: 15,
        color: AppColors.lightBlue,
      ),
    );
  }
}

class AuthTopLogo extends StatelessWidget {
  const AuthTopLogo({super.key});

  @override
  Widget build(BuildContext context) {
    return const _RoundGlassButton(
      onPressed: null,
      child: AuthLogoMark(size: 20),
    );
  }
}

class AuthTabSwitcher extends StatelessWidget {
  const AuthTabSwitcher({
    super.key,
    required this.activeIndex,
    required this.onTap,
  });

  final int activeIndex;
  final ValueChanged<int> onTap;

  @override
  Widget build(BuildContext context) {
    const labels = ['Sign In', 'Create Account'];

    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.authInputBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.authBorder.withValues(alpha: 0.45)),
      ),
      child: Row(
        children: List.generate(labels.length, (index) {
          final isActive = activeIndex == index;
          return Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 2),
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: isActive
                      ? const LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [AppColors.mediumBlue, AppColors.buttonHighlight],
                        )
                      : null,
                  color: isActive ? null : AppColors.darkBlue,
                  borderRadius: BorderRadius.circular(13),
                ),
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    borderRadius: BorderRadius.circular(13),
                    onTap: () => onTap(index),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: Text(
                        labels[index],
                        textAlign: TextAlign.center,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: isActive
                              ? AppColors.white
                              : AppColors.lightBlue.withValues(alpha: 0.72),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}

class AuthInputField extends StatelessWidget {
  const AuthInputField({
    super.key,
    required this.controller,
    required this.label,
    required this.hintText,
    required this.icon,
    this.keyboardType,
    this.textInputAction,
    this.autofillHints,
    this.onChanged,
    this.obscureText = false,
    this.suffix,
    this.state = AuthFieldState.idle,
    this.message,
    this.textCapitalization = TextCapitalization.none,
  });

  final TextEditingController controller;
  final String label;
  final String hintText;
  final IconData icon;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final Iterable<String>? autofillHints;
  final ValueChanged<String>? onChanged;
  final bool obscureText;
  final Widget? suffix;
  final AuthFieldState state;
  final String? message;
  final TextCapitalization textCapitalization;

  @override
  Widget build(BuildContext context) {
    final borderColor = switch (state) {
      AuthFieldState.success => AppColors.success,
      AuthFieldState.error => AppColors.danger,
      AuthFieldState.idle => AppColors.authBorder.withValues(alpha: 0.85),
    };

    final statusIcon = switch (state) {
      AuthFieldState.success => const Icon(
        Icons.check_circle_rounded,
        size: 16,
        color: AppColors.success,
      ),
      AuthFieldState.error => const Icon(
        Icons.error_rounded,
        size: 16,
        color: AppColors.danger,
      ),
      AuthFieldState.idle => null,
    };

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: AppColors.lightBlue,
          ),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          textInputAction: textInputAction,
          autofillHints: autofillHints,
          onChanged: onChanged,
          obscureText: obscureText,
          autocorrect: false,
          textCapitalization: textCapitalization,
          style: GoogleFonts.inter(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: AppColors.white,
          ),
          decoration: InputDecoration(
            hintText: hintText,
            hintStyle: GoogleFonts.inter(
              fontSize: 13,
              color: AppColors.authPlaceholder,
            ),
            filled: true,
            fillColor: AppColors.authInputBackground,
            prefixIcon: Icon(
              icon,
              size: 17,
              color: AppColors.lightBlue.withValues(alpha: 0.72),
            ),
            suffixIcon: suffix ?? statusIcon,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 14,
              vertical: 13,
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: borderColor, width: 1.5),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(
                color: state == AuthFieldState.idle
                    ? AppColors.mediumBlue
                    : borderColor,
                width: 1.5,
              ),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: AppColors.danger, width: 1.5),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: AppColors.danger, width: 1.5),
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: borderColor, width: 1.5),
            ),
          ),
        ),
        if (message != null && message!.trim().isNotEmpty) ...[
          const SizedBox(height: 5),
          Text(
            message!,
            style: GoogleFonts.inter(
              fontSize: 10,
              color: state == AuthFieldState.error
                  ? AppColors.danger
                  : AppColors.success,
            ),
          ),
        ],
      ],
    );
  }
}

class AuthGradientButton extends StatelessWidget {
  const AuthGradientButton({
    super.key,
    required this.label,
    this.onPressed,
    this.isLoading = false,
    this.trailingIcon,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;
  final IconData? trailingIcon;

  @override
  Widget build(BuildContext context) {
    final isEnabled = onPressed != null && !isLoading;

    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isEnabled
              ? const [AppColors.mediumBlue, AppColors.buttonHighlight]
              : [
                  AppColors.mediumBlue.withValues(alpha: 0.45),
                  AppColors.buttonHighlight.withValues(alpha: 0.4),
                ],
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: isEnabled
            ? [
                BoxShadow(
                  color: AppColors.mediumBlue.withValues(alpha: 0.22),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ]
            : null,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: isEnabled ? onPressed : null,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 14),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (isLoading) ...[
                  const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: AppColors.white,
                    ),
                  ),
                  const SizedBox(width: 10),
                ],
                Text(
                  label,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.white,
                  ),
                ),
                if (!isLoading && trailingIcon != null) ...[
                  const SizedBox(width: 6),
                  Icon(trailingIcon, size: 16, color: AppColors.white),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class AuthPasswordStrengthIndicator extends StatelessWidget {
  const AuthPasswordStrengthIndicator({super.key, required this.password});

  final String password;

  @override
  Widget build(BuildContext context) {
    if (password.isEmpty) {
      return const SizedBox.shrink();
    }

    final result = evaluateAuthPasswordStrength(password);
    final strengthColor = switch (result.level) {
      AuthPasswordStrengthLevel.weak => AppColors.danger,
      AuthPasswordStrengthLevel.medium => Colors.orangeAccent,
      AuthPasswordStrengthLevel.strong => AppColors.success,
    };
    final strengthLabel = switch (result.level) {
      AuthPasswordStrengthLevel.weak => 'Weak',
      AuthPasswordStrengthLevel.medium => 'Medium',
      AuthPasswordStrengthLevel.strong => 'Strong',
    };

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.authInputBackground.withValues(alpha: 0.82),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: strengthColor.withValues(alpha: 0.28)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Password strength',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: AppColors.lightBlue,
                ),
              ),
              const Spacer(),
              Text(
                strengthLabel,
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: strengthColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: List.generate(3, (index) {
              final isActive =
                  index <
                  switch (result.level) {
                    AuthPasswordStrengthLevel.weak => 1,
                    AuthPasswordStrengthLevel.medium => 2,
                    AuthPasswordStrengthLevel.strong => 3,
                  };
              return Expanded(
                child: Container(
                  height: 6,
                  margin: EdgeInsets.only(right: index == 2 ? 0 : 6),
                  decoration: BoxDecoration(
                    color: isActive
                        ? strengthColor
                        : AppColors.lightBlue.withValues(alpha: 0.16),
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
              );
            }),
          ),
          const SizedBox(height: 12),
          for (final rule in result.rules) ...[
            Row(
              children: [
                Icon(
                  rule.isSatisfied
                      ? Icons.check_circle_rounded
                      : Icons.radio_button_unchecked_rounded,
                  size: 14,
                  color: rule.isSatisfied
                      ? AppColors.success
                      : AppColors.lightBlue.withValues(alpha: 0.48),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    rule.label,
                    style: GoogleFonts.inter(
                      fontSize: 10.5,
                      fontWeight: rule.isSatisfied
                          ? FontWeight.w600
                          : FontWeight.w500,
                      color: rule.isSatisfied
                          ? AppColors.success
                          : AppColors.lightBlue.withValues(alpha: 0.8),
                    ),
                  ),
                ),
              ],
            ),
            if (rule != result.rules.last) const SizedBox(height: 7),
          ],
        ],
      ),
    );
  }
}

class AuthStatusCard extends StatelessWidget {
  const AuthStatusCard({
    super.key,
    required this.title,
    required this.message,
    this.buttonLabel,
    this.onPressed,
    this.icon,
    this.isLoading = false,
    this.isError = false,
  });

  final String title;
  final String message;
  final String? buttonLabel;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool isLoading;
  final bool isError;

  @override
  Widget build(BuildContext context) {
    final accentColor = isError ? AppColors.danger : AppColors.success;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Center(
          child: Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: accentColor.withValues(alpha: 0.12),
              border: Border.all(
                color: accentColor.withValues(alpha: 0.3),
                width: 1.5,
              ),
              boxShadow: [
                BoxShadow(
                  color: accentColor.withValues(alpha: 0.16),
                  blurRadius: 24,
                ),
              ],
            ),
            child: Center(
              child: isLoading
                  ? const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.4,
                        color: AppColors.mediumBlue,
                      ),
                    )
                  : Icon(
                      icon ??
                          (isError
                              ? Icons.error_outline_rounded
                              : Icons.check_circle_rounded),
                      size: 30,
                      color: accentColor,
                    ),
            ),
          ),
        ),
        const SizedBox(height: 18),
        Text(
          title,
          textAlign: TextAlign.center,
          style: GoogleFonts.syne(
            fontSize: 24,
            fontWeight: FontWeight.w700,
            color: AppColors.white,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          message,
          textAlign: TextAlign.center,
          style: GoogleFonts.inter(
            fontSize: 12.5,
            height: 1.6,
            color: AppColors.lightBlue.withValues(alpha: 0.78),
          ),
        ),
        if (buttonLabel != null && onPressed != null) ...[
          const SizedBox(height: 22),
          AuthGradientButton(
            label: buttonLabel!,
            trailingIcon: Icons.chevron_right_rounded,
            onPressed: onPressed,
          ),
        ],
      ],
    );
  }
}

class AuthRoleCard extends StatelessWidget {
  const AuthRoleCard({
    super.key,
    required this.title,
    required this.icon,
    required this.bullets,
    required this.isSelected,
    required this.onTap,
  });

  final String title;
  final IconData icon;
  final List<String> bullets;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isSelected
                  ? AppColors.mediumBlue.withValues(alpha: 0.12)
                  : AppColors.authInputBackground.withValues(alpha: 0.96),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isSelected
                    ? AppColors.mediumBlue
                    : AppColors.authBorder.withValues(alpha: 0.75),
                width: 1.5,
              ),
              boxShadow: isSelected
                  ? [
                      BoxShadow(
                        color: AppColors.mediumBlue.withValues(alpha: 0.12),
                        blurRadius: 12,
                      ),
                    ]
                  : null,
            ),
            child: Stack(
              children: [
                if (isSelected)
                  Positioned(
                    top: 0,
                    right: 0,
                    child: Container(
                      width: 18,
                      height: 18,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.mediumBlue,
                      ),
                      child: const Icon(
                        Icons.check_rounded,
                        size: 12,
                        color: AppColors.white,
                      ),
                    ),
                  ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          icon,
                          size: 16,
                          color: isSelected
                              ? AppColors.mediumBlue
                              : AppColors.lightBlue,
                        ),
                        const SizedBox(width: 6),
                        Flexible(
                          child: Text(
                            title,
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: AppColors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    for (final bullet in bullets) ...[
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 4,
                            height: 4,
                            margin: const EdgeInsets.only(top: 5),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: isSelected
                                  ? AppColors.mediumBlue
                                  : AppColors.lightBlue.withValues(alpha: 0.7),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              bullet,
                              style: GoogleFonts.inter(
                                fontSize: 10,
                                height: 1.35,
                                color: AppColors.lightBlue.withValues(
                                  alpha: 0.78,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      if (bullet != bullets.last) const SizedBox(height: 4),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _RoundGlassButton extends StatelessWidget {
  const _RoundGlassButton({required this.child, required this.onPressed});

  final Widget child;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 34,
      height: 34,
      decoration: BoxDecoration(
        color: AppColors.darkBlue.withValues(alpha: 0.88),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.authBorder.withValues(alpha: 0.55)),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: onPressed,
          child: Center(child: child),
        ),
      ),
    );
  }
}

class _GlowOrb extends StatelessWidget {
  const _GlowOrb({
    required this.size,
    required this.color,
    required this.opacity,
    this.top,
    this.right,
    this.bottom,
    this.left,
  });

  final double size;
  final Color color;
  final double opacity;
  final double? top;
  final double? right;
  final double? bottom;
  final double? left;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: top,
      right: right,
      bottom: bottom,
      left: left,
      child: IgnorePointer(
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: RadialGradient(
              colors: [
                color.withValues(alpha: opacity),
                color.withValues(alpha: opacity * 0.35),
                Colors.transparent,
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _AuthLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;
    final center = rect.center;
    final radius = size.width / 2;

    final fillPaint = Paint()..color = AppColors.darkBlue;
    final strokePaint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [AppColors.mediumBlue, AppColors.buttonHighlight],
      ).createShader(rect)
      ..style = PaintingStyle.stroke
      ..strokeWidth = size.width * 0.04;

    final glowPaint = Paint()
      ..color = AppColors.mediumBlue.withValues(alpha: 0.18)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 6);

    final pulsePaint = Paint()
      ..color = AppColors.buttonHighlight
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..strokeWidth = size.width * 0.045;

    final heartPaint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [AppColors.mediumBlue, AppColors.buttonHighlight],
      ).createShader(rect)
      ..style = PaintingStyle.fill;

    canvas.drawCircle(center, radius * 0.94, fillPaint);
    canvas.drawCircle(center, radius * 0.94, strokePaint);

    final heartPath = Path()
      ..moveTo(size.width * 0.5, size.height * 0.68)
      ..cubicTo(
        size.width * 0.18,
        size.height * 0.47,
        size.width * 0.22,
        size.height * 0.22,
        size.width * 0.41,
        size.height * 0.26,
      )
      ..cubicTo(
        size.width * 0.47,
        size.height * 0.27,
        size.width * 0.5,
        size.height * 0.33,
        size.width * 0.5,
        size.height * 0.33,
      )
      ..cubicTo(
        size.width * 0.5,
        size.height * 0.33,
        size.width * 0.53,
        size.height * 0.27,
        size.width * 0.59,
        size.height * 0.26,
      )
      ..cubicTo(
        size.width * 0.78,
        size.height * 0.22,
        size.width * 0.82,
        size.height * 0.47,
        size.width * 0.5,
        size.height * 0.68,
      )
      ..close();

    canvas.drawPath(
      heartPath,
      heartPaint..color = AppColors.mediumBlue.withValues(alpha: 0.18),
    );

    final pulsePath = Path()
      ..moveTo(size.width * 0.24, size.height * 0.45)
      ..lineTo(size.width * 0.36, size.height * 0.45)
      ..lineTo(size.width * 0.43, size.height * 0.35)
      ..lineTo(size.width * 0.49, size.height * 0.55)
      ..lineTo(size.width * 0.56, size.height * 0.4)
      ..lineTo(size.width * 0.63, size.height * 0.45)
      ..lineTo(size.width * 0.76, size.height * 0.45);

    canvas.drawPath(
      pulsePath,
      glowPaint
        ..style = PaintingStyle.stroke
        ..strokeWidth = size.width * 0.06,
    );
    canvas.drawPath(pulsePath, pulsePaint);
    canvas.drawCircle(
      Offset(size.width * 0.5, size.height * 0.79),
      size.width * 0.016,
      Paint()..color = AppColors.buttonHighlight.withValues(alpha: 0.85),
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
