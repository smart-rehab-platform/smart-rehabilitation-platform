import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/api_client.dart';
import '../data/admin_features_repository.dart';

final adminFeaturesRepositoryProvider = Provider<AdminFeaturesRepository>((ref) {
  return AdminFeaturesRepository(ref.watch(dioProvider));
});
