import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import '../providers/presence_provider.dart';

/// Connects/disconnects presence socket based on auth session changes.
final presenceLifecycleProvider = Provider<void>((ref) {
  ref.listen<AuthState>(authProvider, (previous, next) async {
    final notifier = ref.read(presenceProvider.notifier);

    if (next.isAuthenticated && next.token != null && next.token!.isNotEmpty) {
      if (previous?.token != next.token || !(ref.read(presenceProvider).isConnected)) {
        await notifier.connect(next.token!);
      }
      return;
    }

    if (previous?.isAuthenticated == true) {
      await notifier.disconnect();
    }
  });

  final auth = ref.read(authProvider);
  if (auth.isAuthenticated && auth.token != null && auth.token!.isNotEmpty) {
    Future.microtask(() => ref.read(presenceProvider.notifier).connect(auth.token!));
  }
});
