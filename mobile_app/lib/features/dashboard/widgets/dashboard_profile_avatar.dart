import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/constants/api_constants.dart';
import '../../../core/constants/dashboard_colors.dart';
import '../../auth/providers/auth_provider.dart';
import 'dashboard_layout.dart';

class DashboardProfileAvatar extends StatefulWidget {
  const DashboardProfileAvatar({
    super.key,
    required this.initials,
    this.imageUrl,
    this.previewBytes,
    this.radius = 20,
    this.isLoading = false,
    this.imageCacheBustMs,
    this.onTap,
  });

  final String initials;
  final String? imageUrl;
  final Uint8List? previewBytes;
  final double radius;
  final bool isLoading;
  final int? imageCacheBustMs;
  final VoidCallback? onTap;

  @override
  State<DashboardProfileAvatar> createState() => _DashboardProfileAvatarState();
}

class _DashboardProfileAvatarState extends State<DashboardProfileAvatar> {
  var _networkImageFailed = false;

  @override
  void didUpdateWidget(DashboardProfileAvatar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.imageUrl != widget.imageUrl ||
        oldWidget.previewBytes != widget.previewBytes ||
        oldWidget.imageCacheBustMs != widget.imageCacheBustMs) {
      _networkImageFailed = false;
    }
  }

  String? _resolvedNetworkUrl() {
    return ApiConstants.resolveProfileImageUrl(
      widget.imageUrl,
      cacheBustMs: widget.imageCacheBustMs,
    );
  }

  bool get _hasPreview =>
      widget.previewBytes != null && widget.previewBytes!.isNotEmpty;

  bool get _showNetworkImage {
    final resolvedUrl = _resolvedNetworkUrl();
    return !_hasPreview &&
        !_networkImageFailed &&
        resolvedUrl != null &&
        resolvedUrl.isNotEmpty;
  }

  Widget _initialsContent(ThemeData theme) {
    if (widget.initials.trim().isEmpty) {
      return Icon(
        Icons.person_outline_rounded,
        color: DashboardColors.brandCyan,
        size: widget.radius * 0.9,
      );
    }

    return Text(
      widget.initials,
      style: theme.textTheme.labelLarge?.copyWith(
        color: DashboardColors.brandCyan,
        fontWeight: FontWeight.w700,
        fontSize: widget.radius * 0.72,
      ),
    );
  }

  Widget _initialsAvatar(ThemeData theme, {bool showLoading = false}) {
    return CircleAvatar(
      radius: widget.radius,
      backgroundColor: DashboardColors.brandSoft,
      child: showLoading || widget.isLoading
          ? SizedBox(
              width: widget.radius,
              height: widget.radius,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: DashboardColors.brandCyan,
              ),
            )
          : _initialsContent(theme),
    );
  }

  Widget _previewAvatar() {
    return CircleAvatar(
      radius: widget.radius,
      backgroundColor: DashboardColors.brandSoft,
      backgroundImage: MemoryImage(widget.previewBytes!),
    );
  }

  Widget _networkAvatar(ThemeData theme) {
    final resolvedUrl = _resolvedNetworkUrl()!;

    return ClipOval(
      child: Image.network(
        resolvedUrl,
        width: widget.radius * 2,
        height: widget.radius * 2,
        fit: BoxFit.cover,
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) {
            return child;
          }
          return SizedBox(
            width: widget.radius * 2,
            height: widget.radius * 2,
            child: ColoredBox(
              color: DashboardColors.brandSoft,
              child: Center(
                child: SizedBox(
                  width: widget.radius,
                  height: widget.radius,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: DashboardColors.brandCyan,
                    value: loadingProgress.expectedTotalBytes != null
                        ? loadingProgress.cumulativeBytesLoaded /
                              loadingProgress.expectedTotalBytes!
                        : null,
                  ),
                ),
              ),
            ),
          );
        },
        errorBuilder: (context, error, stackTrace) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (!mounted || _networkImageFailed) {
              return;
            }
            setState(() => _networkImageFailed = true);
          });
          return SizedBox(
            width: widget.radius * 2,
            height: widget.radius * 2,
            child: ColoredBox(
              color: DashboardColors.brandSoft,
              child: Center(child: _initialsContent(theme)),
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final Widget avatar;
    if (widget.isLoading && !_hasPreview && !_showNetworkImage) {
      avatar = _initialsAvatar(theme, showLoading: true);
    } else if (_hasPreview) {
      avatar = _previewAvatar();
    } else if (_showNetworkImage) {
      avatar = _networkAvatar(theme);
    } else {
      avatar = _initialsAvatar(theme);
    }

    if (widget.onTap == null) {
      return avatar;
    }

    return InkWell(
      onTap: widget.isLoading ? null : widget.onTap,
      customBorder: const CircleBorder(),
      child: avatar,
    );
  }
}

/// Authenticated user's avatar sourced from [authProvider].
class CurrentUserAvatar extends ConsumerWidget {
  const CurrentUserAvatar({
    super.key,
    this.radius = 18,
    this.initialsFallback = 'PR',
    this.onTap,
    this.imageCacheBustMs,
  });

  final double radius;
  final String initialsFallback;
  final VoidCallback? onTap;
  final int? imageCacheBustMs;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final fullName = auth.user?.fullName;

    return DashboardProfileAvatar(
      initials: dashboardInitials(fullName, fallback: initialsFallback),
      imageUrl: auth.user?.profileImageUrl,
      radius: radius,
      onTap: onTap,
      imageCacheBustMs: imageCacheBustMs,
    );
  }
}

class EditableProfileAvatar extends StatelessWidget {
  const EditableProfileAvatar({
    super.key,
    required this.initials,
    this.imageUrl,
    this.previewBytes,
    this.radius = 40,
    this.isLoading = false,
    this.imageCacheBustMs,
    this.onEditTap,
    this.onAvatarTap,
  });

  final String initials;
  final String? imageUrl;
  final Uint8List? previewBytes;
  final double radius;
  final bool isLoading;
  final int? imageCacheBustMs;
  final VoidCallback? onEditTap;
  final VoidCallback? onAvatarTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final avatarTap = onAvatarTap ?? onEditTap;

    return Column(
      children: [
        Stack(
          clipBehavior: Clip.none,
          children: [
            DashboardProfileAvatar(
              initials: initials,
              imageUrl: imageUrl,
              previewBytes: previewBytes,
              radius: radius,
              isLoading: isLoading,
              imageCacheBustMs: imageCacheBustMs,
              onTap: avatarTap,
            ),
            Positioned(
              right: 0,
              bottom: 0,
              child: Material(
                color: DashboardColors.brandCyan,
                shape: const CircleBorder(),
                elevation: 2,
                child: InkWell(
                  onTap: isLoading ? null : onEditTap,
                  customBorder: const CircleBorder(),
                  child: const Padding(
                    padding: EdgeInsets.all(8),
                    child: Icon(
                      Icons.camera_alt_rounded,
                      size: 18,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          'Tap photo to change',
          style: theme.textTheme.labelSmall?.copyWith(
            color: DashboardColors.textSecondary,
          ),
        ),
      ],
    );
  }
}
