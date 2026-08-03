import '../../../../l10n/app_localizations.dart';
import '../../../case_intake/models/case_intake_request_model.dart';

String mapAdminDashboardError(AppLocalizations l10n, String message) {
  if (message == 'Please sign in as an admin to view this dashboard.') {
    return l10n.adminDashboardSignInRequired;
  }
  if (message.startsWith('Failed to load admin dashboard:')) {
    return l10n.adminDashboardLoadFailed(
      message.substring('Failed to load admin dashboard:'.length).trim(),
    );
  }
  return message;
}

String mapAdminSystemActivityError(AppLocalizations l10n, String message) {
  if (message == 'Failed to load system activity. Please try again.') {
    return l10n.adminSystemActivityLoadFailed;
  }
  return message;
}

String mapAdminUsersError(AppLocalizations l10n, String message) {
  if (message.startsWith('Failed to load users:')) {
    return l10n.adminUsersLoadFailed(
      message.substring('Failed to load users:'.length).trim(),
    );
  }
  return message;
}

String mapAdminPatientsError(AppLocalizations l10n, String message) {
  if (message.startsWith('Failed to load patients:')) {
    return l10n.adminPatientsLoadFailed(
      message.substring('Failed to load patients:'.length).trim(),
    );
  }
  return message;
}

String mapAdminSessionsError(AppLocalizations l10n, String message) {
  if (message.startsWith('Failed to load sessions:')) {
    return l10n.adminSessionsLoadFailed(
      message.substring('Failed to load sessions:'.length).trim(),
    );
  }
  return message;
}

String mapAdminAiCenterError(AppLocalizations l10n, String message) {
  if (message.startsWith('Failed to load AI Center:')) {
    return l10n.adminAiLoadFailed(
      message.substring('Failed to load AI Center:'.length).trim(),
    );
  }
  return message;
}

String mapAdminAuditLogsError(AppLocalizations l10n, String message) {
  if (message.startsWith('Failed to load audit logs:')) {
    return l10n.adminAuditLoadFailed(
      message.substring('Failed to load audit logs:'.length).trim(),
    );
  }
  return message;
}

String localizedAdminRole(AppLocalizations l10n, String? role) {
  final normalized = (role ?? '').trim().toLowerCase();
  return switch (normalized) {
    'admin' => l10n.roleAdmin,
    'specialist' => l10n.roleSpecialist,
    'parent' => l10n.roleParent,
    'user' => l10n.roleUser,
    '' => l10n.roleUser,
    _ => role ?? l10n.roleUser,
  };
}

String localizedAdminSessionStatus(
  AppLocalizations l10n,
  String? status, {
  bool isPastScheduled = false,
}) {
  final normalized = (status ?? 'unknown').toLowerCase();
  return switch (normalized) {
    'completed' => l10n.statusCompleted,
    'cancelled' => l10n.statusCancelled,
    'no_show' => l10n.statusNoShow,
    'scheduled' =>
      isPastScheduled ? l10n.statusNotCompleted : l10n.statusScheduled,
    'pending' => l10n.statusPending,
    'inactive' || 'disabled' => l10n.statusInactive,
    _ => normalized.replaceAll('_', ' '),
  };
}

String localizedAdminGender(AppLocalizations l10n, String? gender) {
  final normalized = (gender ?? '').trim().toLowerCase();
  return switch (normalized) {
    'male' || 'm' => l10n.fieldGenderMale,
    'female' || 'f' => l10n.fieldGenderFemale,
    _ => gender?.trim().isNotEmpty == true ? gender!.trim() : '',
  };
}

String localizedAdminCaseIntakeStatus(
  AppLocalizations l10n,
  CaseIntakeStatus? status,
) {
  return switch (status) {
    null => l10n.adminCaseRequestsAllStatuses,
    CaseIntakeStatus.pending => l10n.statusPending,
    CaseIntakeStatus.assigned => l10n.statusAssigned,
    CaseIntakeStatus.underAssessment => l10n.statusUnderAssessment,
    CaseIntakeStatus.accepted => l10n.statusAccepted,
    CaseIntakeStatus.rejected => l10n.statusRejected,
    CaseIntakeStatus.convertedToPatient =>
      l10n.adminCaseRequestsConvertedToPatient,
  };
}

String localizedAdminAiStatus(AppLocalizations l10n, String? status) {
  final normalized = (status ?? '').trim().toLowerCase();
  return switch (normalized) {
    'pending' => l10n.statusPending,
    'accepted' => l10n.statusAccepted,
    'rejected' => l10n.statusRejected,
    'approved' => l10n.statusApproved,
    'completed' => l10n.statusCompleted,
    '' => l10n.statusPending,
    _ => status ?? l10n.statusPending,
  };
}

String localizedSystemActivityPeriodLabel(
  AppLocalizations l10n, {
  required int weekOffset,
  DateTime? weekStart,
  DateTime? weekEnd,
}) {
  switch (weekOffset) {
    case 0:
      return l10n.dateThisWeek;
    case 1:
      return l10n.dateLastWeek;
    case 2:
      return l10n.adminSystemActivityLast2Weeks;
    case 4:
      return l10n.adminSystemActivityLastMonth;
    default:
      if (weekStart != null && weekEnd != null) {
        return '${_formatChartDate(weekStart)} – ${_formatChartDate(weekEnd)}';
      }
      if (weekOffset == 1) {
        return l10n.dateLastWeek;
      }
      return l10n.adminSystemActivityWeeksAgo(weekOffset);
  }
}

String localizedSystemActivityPresetLabel(
  AppLocalizations l10n,
  int weekOffset,
) {
  switch (weekOffset) {
    case 0:
      return l10n.dateThisWeek;
    case 1:
      return l10n.dateLastWeek;
    case 2:
      return l10n.adminSystemActivityLast2Weeks;
    case 4:
      return l10n.adminSystemActivityLastMonth;
    default:
      return l10n.adminSystemActivityWeeksAgo(weekOffset);
  }
}

String _formatChartDate(DateTime date) {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return '${months[date.month - 1]} ${date.day}';
}
