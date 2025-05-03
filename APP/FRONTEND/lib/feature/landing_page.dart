import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/components/footer.dart';
import 'package:ionhive/feature/landing_page_controller.dart';
import 'package:ionhive/feature/session_history/presentation/pages/session_history.dart';
import 'package:ionhive/feature/wallet/presentation/pages/wallet_page.dart';
import 'package:ionhive/feature/home/presentation/pages/home_page.dart';
import 'package:ionhive/feature/more/presentation/pages/more_page.dart';

class LandingPage extends GetView<LandingPageController> {
  const LandingPage({super.key});

  @override
  Widget build(BuildContext context) {
    // Controller is already initialized in main.dart
    return Scaffold(
      body: Obx(() {
        // Use IndexedStack instead of PageView to avoid ScrollController issues
        return IndexedStack(
          index: controller.pageIndex.value,
          children: [
            HomePage(),
            WalletPage(),
            SessionHistoryPage(),
            MoreePage(),
          ],
        );
      }),
      bottomNavigationBar: Obx(
        () => Footer(
          onTabChanged: (index) {
            // Add a small delay to ensure any previous operations are completed
            Future.delayed(const Duration(milliseconds: 50), () {
              controller.changePage(index);
            });
          },
          currentIndex: controller.pageIndex.value,
        ),
      ),
    );
  }
}
