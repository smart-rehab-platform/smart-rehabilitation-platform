import '../../models/parent_dashboard_models.dart';

/// Parent exercise actionability based on the latest submission only.
enum ParentExerciseActionState {
  todo,
  awaitingReview,
  reviewed,
  needsRetry,
}

ParentSubmissionItem? latestSubmissionForAssignment(
  List<ParentSubmissionItem> submissions,
  String assignedExerciseId,
) {
  ParentSubmissionItem? latest;
  for (final item in submissions) {
    if (item.assignedExerciseId != assignedExerciseId) {
      continue;
    }
    if (latest == null) {
      latest = item;
      continue;
    }
    final latestAt = latest.submittedAt;
    final itemAt = item.submittedAt;
    if (latestAt == null && itemAt != null) {
      latest = item;
      continue;
    }
    if (latestAt != null && itemAt != null && itemAt.isAfter(latestAt)) {
      latest = item;
    }
  }
  return latest;
}

ParentExerciseActionState resolveParentExerciseActionState(
  ParentSubmissionItem? latestSubmission,
) {
  if (latestSubmission == null) {
    return ParentExerciseActionState.todo;
  }

  switch ((latestSubmission.status ?? '').trim().toLowerCase()) {
    case 'needs_retry':
      return ParentExerciseActionState.needsRetry;
    case 'reviewed':
    case 'completed':
      return ParentExerciseActionState.reviewed;
    case 'pending':
    case 'submitted':
    default:
      return ParentExerciseActionState.awaitingReview;
  }
}

bool parentExerciseCanSubmit(ParentExerciseActionState state) {
  return state == ParentExerciseActionState.todo ||
      state == ParentExerciseActionState.needsRetry;
}

/// Action-gating completion: pending/reviewed block submit; needs_retry does not.
bool parentExerciseIsSubmitBlocked(ParentExerciseActionState state) {
  return !parentExerciseCanSubmit(state);
}

String parentExerciseUiStatusKey(ParentExerciseActionState state) {
  return switch (state) {
    ParentExerciseActionState.todo => 'todo',
    ParentExerciseActionState.awaitingReview => 'pending',
    ParentExerciseActionState.reviewed => 'reviewed',
    ParentExerciseActionState.needsRetry => 'needs_retry',
  };
}

ParentDailyTask applyLatestSubmissionToTask(
  ParentDailyTask task,
  List<ParentSubmissionItem> submissions,
) {
  final latest = latestSubmissionForAssignment(submissions, task.id);
  final actionState = resolveParentExerciseActionState(latest);
  return ParentDailyTask(
    id: task.id,
    title: task.title,
    dueTime: task.dueTime,
    status: parentExerciseUiStatusKey(actionState),
    isCompleted: actionState == ParentExerciseActionState.reviewed ||
        actionState == ParentExerciseActionState.awaitingReview,
    instructions: task.instructions,
    frequency: task.frequency,
    dueDate: task.dueDate,
    exerciseId: task.exerciseId,
    instructionMediaUrl: task.instructionMediaUrl,
  );
}

List<ParentDailyTask> applyLatestSubmissionToTasks(
  List<ParentDailyTask> tasks,
  List<ParentSubmissionItem> submissions,
) {
  return tasks
      .map((task) => applyLatestSubmissionToTask(task, submissions))
      .toList();
}
