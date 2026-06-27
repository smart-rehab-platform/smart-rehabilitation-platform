import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/api_client.dart';
import '../data/admin_users_repository.dart';

final adminUsersRepositoryProvider = Provider<AdminUsersRepository>((ref) {
  return AdminUsersRepository(ref.watch(dioProvider));
});
