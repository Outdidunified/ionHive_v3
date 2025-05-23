import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/feature/session_history/presentation/pages/session_history.dart';
import 'package:ionhive/feature/wallet_temp/presentation/pages/wallet_page.dart';

import '../core/components/footer.dart'; // Footer Component
import 'package:ionhive/feature/landing_page_controller.dart'; // Landing page controller
import 'package:ionhive/feature/home/presentation/pages/home_page.dart'; // Home page
import 'package:ionhive/feature/more/presentation/pages/more_page.dart'; // More page

class LandingPage extends StatelessWidget {
  LandingPage({super.key});

  // Retrieve the existing controller instance
  final LandingPageController controller = Get.find<LandingPageController>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: PageView(
        controller: controller.pageController,
        onPageChanged: controller.changePage,
        physics: const NeverScrollableScrollPhysics(), // Disables swiping
        children: [
          const HomePage(),
          WalletPage(),
          SessionHistoryPage(),
          MoreePage(),
        ],
      ),
      bottomNavigationBar: Obx(
        () => Footer(
          onTabChanged: (index) {
            controller.changePage(index);
          },
          currentIndex: controller.pageIndex.value,
        ),
      ),
    );
  }
}
