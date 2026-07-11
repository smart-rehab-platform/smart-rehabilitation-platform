import 'package:flutter/material.dart';

import '../models/session_requests_models.dart';

String sessionRequestReasonDisplayLabel(SessionRequestItem request) {
  if (request.reason == SessionRequestReason.other &&
      request.reasonOtherText != null &&
      request.reasonOtherText!.trim().isNotEmpty) {
    return request.reasonOtherText!.trim();
  }

  return switch (request.reason) {
    SessionRequestReason.regularFollowUp => 'Regular Follow-up',
    SessionRequestReason.replacementCancelled =>
      'Replacement for Cancelled Session',
    SessionRequestReason.replacementMissed => 'Replacement for Missed Session',
    SessionRequestReason.additionalSession => 'Additional Session',
    SessionRequestReason.consultation => 'Consultation',
    SessionRequestReason.other => 'Other',
    null => 'Session request',
  };
}

typedef SessionRequestStatusVisual = ({
  String label,
  Color background,
  Color foreground,
  Color border,
  IconData icon,
});

SessionRequestStatusVisual sessionRequestStatusVisual(
  SessionRequestStatus? status,
) {
  switch (status) {
    case SessionRequestStatus.approved:
      return (
        label: 'Approved',
        background: const Color(0xFFEAF8EE),
        foreground: const Color(0xFF2E7D32),
        border: const Color(0xFF2E7D32).withValues(alpha: 0.18),
        icon: Icons.check_circle_outline_rounded,
      );
    case SessionRequestStatus.rejected:
      return (
        label: 'Rejected',
        background: const Color(0xFFFDECEC),
        foreground: const Color(0xFFD32F2F),
        border: const Color(0xFFD32F2F).withValues(alpha: 0.18),
        icon: Icons.cancel_outlined,
      );
    case SessionRequestStatus.pending:
    default:
      return (
        label: 'Pending',
        background: const Color(0xFFFFF8E1),
        foreground: const Color(0xFFF9A825),
        border: const Color(0xFFF9A825).withValues(alpha: 0.22),
        icon: Icons.hourglass_top_rounded,
      );
  }
}
