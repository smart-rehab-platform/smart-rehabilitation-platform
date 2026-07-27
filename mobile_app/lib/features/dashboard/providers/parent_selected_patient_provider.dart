import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/parent_dashboard_models.dart';
import 'parent_dashboard_provider.dart';

/// Single source of truth for the parent's currently selected linked patient.
final selectedPatientIdProvider = Provider<String?>((ref) {
  return ref.watch(parentDashboardProvider).selectedPatientId;
});

final selectedPatientProvider = Provider<ParentChild?>((ref) {
  return ref.watch(parentDashboardProvider).selectedChild;
});
