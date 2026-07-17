import '../models/case_intake_request_model.dart';

/// Selects the single request to feature on the parent dashboard.
///
/// Priority (higher urgency first):
/// assigned → under_assessment → accepted → pending → rejected → converted_to_patient
/// Within the same status: newest [CaseIntakeRequest.submittedAt] first.
CaseIntakeRequest? selectFeaturedCaseRequest({
  required List<CaseIntakeRequest> requests,
  required Iterable<String> linkedChildIds,
}) {
  if (requests.isEmpty) {
    return null;
  }

  final childIds = linkedChildIds
      .where((id) => id.trim().isNotEmpty)
      .map((id) => id.trim())
      .toSet();
  final hasChildren = childIds.isNotEmpty;

  final activeNonConverted = requests
      .where((request) => _isActiveNonConverted(request.status))
      .toList();

  if (hasChildren) {
    return _pickByPriority(activeNonConverted);
  }

  final activePick = _pickByPriority(activeNonConverted);
  if (activePick != null) {
    return activePick;
  }

  final rejected = requests
      .where((request) => request.status == CaseIntakeStatus.rejected)
      .toList();
  final rejectedPick = _pickByPriority(rejected);
  if (rejectedPick != null) {
    return rejectedPick;
  }

  // No linked children yet: allow a converted request to surface while the
  // patient linkage is still catching up. Skip converted whose patient is
  // already in the children list (none are when hasChildren is false).
  final converted = requests.where((request) {
    if (request.status != CaseIntakeStatus.convertedToPatient) {
      return false;
    }
    final patientId = request.patientId?.trim();
    if (patientId == null || patientId.isEmpty) {
      return true;
    }
    return !childIds.contains(patientId);
  }).toList();

  return _pickByPriority(converted);
}

bool _isActiveNonConverted(CaseIntakeStatus? status) {
  return status == CaseIntakeStatus.pending ||
      status == CaseIntakeStatus.assigned ||
      status == CaseIntakeStatus.underAssessment ||
      status == CaseIntakeStatus.accepted;
}

CaseIntakeRequest? _pickByPriority(List<CaseIntakeRequest> requests) {
  if (requests.isEmpty) {
    return null;
  }

  final sorted = [...requests]
    ..sort((a, b) {
      final priorityCompare = _statusPriority(
        a.status,
      ).compareTo(_statusPriority(b.status));
      if (priorityCompare != 0) {
        return priorityCompare;
      }

      final aSubmitted = a.submittedAt;
      final bSubmitted = b.submittedAt;
      if (aSubmitted == null && bSubmitted == null) {
        return 0;
      }
      if (aSubmitted == null) {
        return 1;
      }
      if (bSubmitted == null) {
        return -1;
      }
      return bSubmitted.compareTo(aSubmitted);
    });

  return sorted.first;
}

int _statusPriority(CaseIntakeStatus? status) {
  switch (status) {
    case CaseIntakeStatus.assigned:
      return 0;
    case CaseIntakeStatus.underAssessment:
      return 1;
    case CaseIntakeStatus.accepted:
      return 2;
    case CaseIntakeStatus.pending:
      return 3;
    case CaseIntakeStatus.rejected:
      return 4;
    case CaseIntakeStatus.convertedToPatient:
      return 5;
    case null:
      return 99;
  }
}

/// Prefer selecting this patient after conversion refresh when appropriate.
String? preferredConvertedPatientId({
  required List<CaseIntakeRequest> requests,
  required Iterable<String> linkedChildIds,
  required bool previouslyHadNoChildren,
}) {
  final childIds = linkedChildIds
      .where((id) => id.trim().isNotEmpty)
      .map((id) => id.trim())
      .toSet();
  if (childIds.isEmpty) {
    return null;
  }

  final convertedWithPatient = requests
      .where(
        (request) =>
            request.status == CaseIntakeStatus.convertedToPatient &&
            request.patientId != null &&
            request.patientId!.trim().isNotEmpty &&
            childIds.contains(request.patientId!.trim()),
      )
      .toList();

  if (convertedWithPatient.isEmpty) {
    return null;
  }

  convertedWithPatient.sort((a, b) {
    final aAt = a.convertedAt ?? a.submittedAt;
    final bAt = b.convertedAt ?? b.submittedAt;
    if (aAt == null && bAt == null) {
      return 0;
    }
    if (aAt == null) {
      return 1;
    }
    if (bAt == null) {
      return -1;
    }
    return bAt.compareTo(aAt);
  });

  final preferred = convertedWithPatient.first.patientId!.trim();
  if (previouslyHadNoChildren) {
    return preferred;
  }

  // Only auto-select when the preferred child is newly available and we are
  // not overriding an existing deliberate selection unless it is the only match.
  return preferred;
}
