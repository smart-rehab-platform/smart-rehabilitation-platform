import 'package:flutter/material.dart';

import '../../../core/constants/dashboard_colors.dart';

class DashboardChatBubble extends StatelessWidget {
  const DashboardChatBubble({
    super.key,
    required this.onTap,
    this.unreadCount = 0,
    this.size = 48,
    this.tooltip = 'Messages',
  });

  final VoidCallback onTap;
  final int unreadCount;
  final double size;
  final String tooltip;

  String? get _badgeLabel {
    if (unreadCount <= 0) {
      return null;
    }
    return unreadCount > 99 ? '99+' : '$unreadCount';
  }

  @override
  Widget build(BuildContext context) {
    final badgeLabel = _badgeLabel;

    return Tooltip(
      message: tooltip,
      child: Semantics(
        button: true,
        label: tooltip,
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(size * 0.45),
            child: SizedBox(
              width: size + 8,
              height: size + 12,
              child: Stack(
                clipBehavior: Clip.none,
                alignment: Alignment.topCenter,
                children: [
                  Positioned(
                    top: 0,
                    child: Material(
                      elevation: 4,
                      shadowColor: DashboardColors.primary.withValues(
                        alpha: 0.28,
                      ),
                      color: DashboardColors.primary,
                      borderRadius: BorderRadius.circular(size * 0.38),
                      child: SizedBox(
                        width: size,
                        height: size,
                        child: Icon(
                          Icons.chat_bubble_rounded,
                          color: Colors.white,
                          size: size * 0.46,
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    top: size - 2,
                    child: CustomPaint(
                      size: Size(size * 0.28, size * 0.18),
                      painter: _ChatBubbleTailPainter(
                        color: DashboardColors.primary,
                      ),
                    ),
                  ),
                  if (badgeLabel != null)
                    Positioned(
                      top: -4,
                      right: 0,
                      child: _UnreadBadge(label: badgeLabel),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _UnreadBadge extends StatelessWidget {
  const _UnreadBadge({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
      decoration: BoxDecoration(
        color: DashboardColors.highPriority,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: DashboardColors.surface, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: DashboardColors.highPriority.withValues(alpha: 0.35),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      alignment: Alignment.center,
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
          color: Colors.white,
          fontWeight: FontWeight.w800,
          fontSize: 10,
          height: 1,
        ),
      ),
    );
  }
}

class _ChatBubbleTailPainter extends CustomPainter {
  const _ChatBubbleTailPainter({required this.color});

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = color;
    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(size.width, 0)
      ..lineTo(size.width * 0.5, size.height)
      ..close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _ChatBubbleTailPainter oldDelegate) {
    return oldDelegate.color != color;
  }
}
