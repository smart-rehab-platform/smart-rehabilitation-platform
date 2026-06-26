import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:mobile_app/main.dart';

void main() {
  testWidgets('shows splash then navigates to login', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: SmartRehabilitationApp(),
      ),
    );

    expect(find.text('Smart Rehabilitation'), findsOneWidget);
    expect(find.text('Where Recovery Never Stops'), findsOneWidget);

    await tester.pump(const Duration(seconds: 2));
    await tester.pumpAndSettle();

    expect(find.text('Welcome Back'), findsOneWidget);
    expect(find.text('Continue your smart rehabilitation journey'), findsOneWidget);
  });
}
