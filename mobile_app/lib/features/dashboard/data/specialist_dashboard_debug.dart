import 'package:flutter/foundation.dart';

/// Safe development logging for specialist dashboard API integration.
/// Never log tokens or passwords.
class SpecialistDashboardDebugLog {
  SpecialistDashboardDebugLog._();

  static void loadStart(String specialistUserId) {
    if (!kDebugMode) {
      return;
    }
    debugPrint('[SpecialistDashboard] Loading data for specialist_id=$specialistUserId');
  }

  static void counts({
    required int activeCases,
    required int pendingReviews,
    required int todaySessions,
    required int treatmentPlans,
    required int progress,
  }) {
    if (!kDebugMode) {
      return;
    }
    debugPrint(
      '[SpecialistDashboard] counts → '
      'activeCases=$activeCases, '
      'pendingReviews=$pendingReviews, '
      'todaySessions=$todaySessions, '
      'treatmentPlans=$treatmentPlans, '
      'progress=$progress',
    );
  }

  static void endpoint(String label, int count, {String? note}) {
    if (!kDebugMode) {
      return;
    }
    final suffix = note == null ? '' : ' ($note)';
    debugPrint('[SpecialistDashboard] $label: $count items$suffix');
  }

  static void warning(String message) {
    if (!kDebugMode) {
      return;
    }
    debugPrint('[SpecialistDashboard] WARNING: $message');
  }
}

// ---------------------------------------------------------------------------
// Test data checklist (development):
// 1. Link patient to specialist  → patient_specialists
// 2. Link patient to parent      → patient_guardians
// 3. Create treatment plan       → treatment_plans (specialist_id + patient_id)
// 4. Assign exercise             → assigned_exercises
// 5. Parent submits exercise     → exercise_submissions (status = pending)
// 6. Add progress snapshot       → progress_snapshots (patient_id)
// 7. Create session              → sessions (specialist_id + patient_id + scheduled_at)
// ---------------------------------------------------------------------------
