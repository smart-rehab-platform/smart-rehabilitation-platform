import '../../../../l10n/app_localizations.dart';

enum AuditActionCategory {
  create,
  update,
  complete,
  delete,
  assign,
  login,
  cancel,
  other,
}

AuditActionCategory resolveAuditActionCategory(String rawAction) {
  final key = rawAction.trim().toLowerCase();
  if (key == 'login' || key == 'logout' || key.endsWith('_login')) {
    return AuditActionCategory.login;
  }
  if (key.contains('cancel') ||
      key.contains('reject') ||
      key.contains('no_show')) {
    return AuditActionCategory.cancel;
  }
  if (key.contains('complete') ||
      key.contains('accept') ||
      key.contains('convert')) {
    return AuditActionCategory.complete;
  }
  if (key.contains('delete') ||
      key.contains('remove') ||
      key.contains('unlink')) {
    return AuditActionCategory.delete;
  }
  if (key.contains('assign') ||
      key.contains('link') ||
      key.contains('attach')) {
    return AuditActionCategory.assign;
  }
  if (key.contains('create') || key.contains('add') || key.endsWith('_start')) {
    return AuditActionCategory.create;
  }
  if (key.contains('update') ||
      key.contains('edit') ||
      key.contains('change')) {
    return AuditActionCategory.update;
  }
  return AuditActionCategory.other;
}

String localizedAuditActionTitle(AppLocalizations l10n, String rawAction) {
  final key = rawAction.trim().toLowerCase();
  if (key.isEmpty) {
    return l10n.auditActionActivity;
  }

  final mapped = switch (key) {
    'session_complete' => l10n.auditActionSessionComplete,
    'session_cancel' => l10n.auditActionSessionCancel,
    'session_create' => l10n.auditActionSessionCreate,
    'session_update' => l10n.auditActionSessionUpdate,
    'session_delete' => l10n.auditActionSessionDelete,
    'session_no_show' => l10n.auditActionSessionNoShow,
    'patient_create' => l10n.auditActionPatientCreate,
    'patient_update' => l10n.auditActionPatientUpdate,
    'patient_delete' => l10n.auditActionPatientDelete,
    'treatment_plan_create' ||
    'treatment_plan_created' => l10n.auditActionTreatmentPlanCreate,
    'goal_add' || 'goal_added' || 'goal_create' => l10n.auditActionGoalAdd,
    'exercise_assign' || 'exercise_assigned' => l10n.auditActionExerciseAssign,
    'parent_link' || 'parent_linked' => l10n.auditActionParentLink,
    'specialist_assign' ||
    'specialist_assigned' => l10n.auditActionSpecialistAssign,
    'login' => l10n.auditActionLogin,
    'logout' => l10n.auditActionLogout,
    'user_create' => l10n.auditActionUserCreate,
    'user_update' => l10n.auditActionUserUpdate,
    'user_delete' => l10n.auditActionUserDelete,
    'case_category_create' => l10n.auditActionCaseCategoryCreate,
    'case_category_update' => l10n.auditActionCaseCategoryUpdate,
    'specialist_case_categories_update' =>
      l10n.auditActionSpecialistCaseCategoriesUpdate,
    'case_intake_request_create' => l10n.auditActionCaseIntakeRequestCreate,
    'case_intake_request_update' => l10n.auditActionCaseIntakeRequestUpdate,
    'case_intake_attachment_add' => l10n.auditActionCaseIntakeAttachmentAdd,
    'case_intake_attachment_delete' =>
      l10n.auditActionCaseIntakeAttachmentDelete,
    'case_intake_request_assign' => l10n.auditActionCaseIntakeRequestAssign,
    'case_intake_assessment_start' => l10n.auditActionCaseIntakeAssessmentStart,
    'case_intake_assessment_notes_update' =>
      l10n.auditActionCaseIntakeAssessmentNotesUpdate,
    'case_intake_request_accept' => l10n.auditActionCaseIntakeRequestAccept,
    'case_intake_request_reject' => l10n.auditActionCaseIntakeRequestReject,
    'case_intake_request_convert' => l10n.auditActionCaseIntakeRequestConvert,
    'create' || 'created' => l10n.auditActionCreate,
    'update' || 'updated' => l10n.auditActionUpdate,
    'delete' || 'deleted' => l10n.auditActionDelete,
    'activate' => l10n.auditActionActivate,
    'deactivate' => l10n.auditActionDeactivate,
    'assign' => l10n.auditActionAssign,
    'unassign' => l10n.auditActionUnassign,
    'approve' => l10n.auditActionApprove,
    'reject' => l10n.auditActionReject,
    'accept' => l10n.auditActionAccept,
    'complete' => l10n.auditActionComplete,
    'cancel' => l10n.auditActionCancel,
    'archive' => l10n.auditActionArchive,
    'upload' => l10n.auditActionUpload,
    'generate' => l10n.auditActionGenerate,
    'review' => l10n.auditActionReview,
    'mark_read' => l10n.auditActionMarkRead,
    'read_all' => l10n.auditActionReadAll,
    _ => null,
  };

  return mapped ?? rawAction.trim();
}

String localizedAuditEntityLabel(AppLocalizations l10n, String? entityName) {
  final raw = entityName?.trim() ?? '';
  if (raw.isEmpty) {
    return l10n.adminAuditSystemEntity;
  }

  final key = raw.toLowerCase();
  final mapped = switch (key) {
    'session' || 'sessions' => l10n.entitySession,
    'patient' || 'patients' => l10n.entityPatient,
    'user' || 'users' => l10n.entityUser,
    'goal' || 'goals' => l10n.entityGoal,
    'exercise' || 'exercises' => l10n.entityExercise,
    'treatment_plan' => l10n.entityTreatmentPlan,
    'report' || 'reports' => l10n.entityReport,
    'case_intake_request' || 'case_request' => l10n.entityCaseRequest,
    'case_category' => l10n.auditEntityCaseCategory,
    'parent' => l10n.roleParent,
    'specialist' => l10n.roleSpecialist,
    'notification' || 'notifications' => l10n.entityNotification,
    'assigned_exercise' => l10n.auditEntityAssignedExercise,
    'submission' => l10n.auditEntitySubmission,
    'review' => l10n.auditEntityReview,
    'speech_analysis' => l10n.auditEntitySpeechAnalysis,
    'ai_recommendation' => l10n.auditEntityAiRecommendation,
    'ai_report' => l10n.auditEntityAiReport,
    _ => null,
  };

  return mapped ?? raw;
}

String localizedAuditActionBadgeLabel(
  AppLocalizations l10n,
  AuditActionCategory category,
  String rawAction,
) {
  final key = rawAction.trim().toLowerCase();
  return switch (category) {
    AuditActionCategory.create => l10n.auditActionCreate,
    AuditActionCategory.update => l10n.auditActionUpdate,
    AuditActionCategory.complete => l10n.auditActionComplete,
    AuditActionCategory.delete => l10n.auditActionDelete,
    AuditActionCategory.assign => l10n.auditActionAssign,
    AuditActionCategory.login =>
      key.contains('logout') ? l10n.auditActionLogout : l10n.auditActionLogin,
    AuditActionCategory.cancel => l10n.auditActionCancel,
    AuditActionCategory.other => l10n.auditActionActivity,
  };
}
