import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/components/footer.dart';
import 'package:ionhive/feature/landing_page_controller.dart';
import 'package:ionhive/feature/session_history/presentation/pages/session_history.dart';
import 'package:ionhive/feature/wallet/presentation/pages/wallet_page.dart';
import 'package:ionhive/feature/home/presentation/pages/home_page.dart';
import 'package:ionhive/feature/more/presentation/pages/more_page.dart';

class LandingPage extends StatelessWidget {
  LandingPage({super.key});

  final LandingPageController controller = Get.find<LandingPageController>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Obx(() {
        // Only build the current page — no state is preserved
        switch (controller.pageIndex.value) {
          case 0:
            return const HomePage();
          case 1:
            return const WalletPage();
          case 2:
            return const SessionHistoryPage();
          case 3:
            return MoreePage();
          default:
            return const Center(child: Text('Page not found'));
        }
      }),
      bottomNavigationBar: Obx(() {
        return Footer(
          onTabChanged: (index) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              controller.changePage(index);
            });
          },
          currentIndex: controller.pageIndex.value,
        );
      }),
    );
  }
}
