import 'package:flutter_test/flutter_test.dart';
import 'package:ionhive/main.dart';

void main() {
  testWidgets('IonHive Application', (WidgetTester tester) async {
    await tester.pumpWidget(const IonHive());
  });
}
