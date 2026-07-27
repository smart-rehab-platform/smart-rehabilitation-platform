import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/api_client.dart';
import '../data/parent_links_repository.dart';

final parentLinksRepositoryProvider = Provider<ParentLinksRepository>((ref) {
  return ParentLinksRepository(ref.watch(dioProvider));
});
