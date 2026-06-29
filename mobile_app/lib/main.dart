import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/routes/app_router.dart';
import 'core/theme/app_theme.dart';
import 'features/presence/providers/presence_lifecycle_provider.dart';

void main() {
  runApp(
    const ProviderScope(
      child: SmartRehabilitationApp(),
    ),
  );
}

class SmartRehabilitationApp extends ConsumerWidget {
  const SmartRehabilitationApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.watch(presenceLifecycleProvider);
    final router = ref.watch(goRouterProvider);

    return MaterialApp.router(
      title: 'Smart Rehabilitation Platform',
      theme: AppTheme.lightTheme,
      debugShowCheckedModeBanner: false,
      routerConfig: router,
    );
  }
}
