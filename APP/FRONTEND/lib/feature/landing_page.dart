import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/feature/session_history/presentation/pages/session_history.dart';
import 'package:ionhive/feature/wallet/presentation/pages/wallet_page.dart';

import '../core/components/footer.dart'; // Footer Component
import 'package:ionhive/feature/landing_page_controller.dart'; // Landing page controller
import 'package:ionhive/feature/home/presentation/pages/home_page.dart'; // Home page
import 'package:ionhive/feature/more/presentation/pages/more_page.dart'; // More page

class LandingPage extends StatefulWidget {
  const LandingPage({super.key});

  @override
  State<LandingPage> createState() => _LandingPageState();
}

class _LandingPageState extends State<LandingPage>
    with AutomaticKeepAliveClientMixin {
  // Retrieve the existing controller instance
  final LandingPageController controller = Get.find<LandingPageController>();

  // Keep the page state alive when switching tabs
  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context); // Required for AutomaticKeepAliveClientMixin

    return Scaffold(
      body: Obx(() => PageView(
            controller: controller.pageController,
            onPageChanged: (index) {
              // Only update the index if it's different to avoid unnecessary rebuilds
              if (controller.pageIndex.value != index) {
                controller.pageIndex.value = index;
              }
            },
            physics: const NeverScrollableScrollPhysics(), // Disables swiping
            children: [
              const HomePage(),
              WalletPage(),
              SessionHistoryPage(),
              MoreePage(),
            ],
          )),
      bottomNavigationBar: Obx(
        () => Footer(
          onTabChanged: (index) {
            // Only change page if the index is different
            if (controller.pageIndex.value != index) {
              controller.changePage(index);
            }
          },
          currentIndex: controller.pageIndex.value,
        ),
      ),
    );
  }
}
