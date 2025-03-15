import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../core/components/footer.dart'; // Footer Component
import 'package:ionhive/feature/landing_page_controller.dart'; // Landing page controller
import 'package:ionhive/feature/home/presentation/pages/home_page.dart'; // Home page
import 'package:ionhive/feature/wallet/presentation/pages/wallet_page.dart'; // Wallet page
import 'package:ionhive/feature/trip/presentation/pages/trip_page.dart'; // Trip page
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
        children: [
          const HomePage(),
          const WalletPage(),
          const TripMapPage(),
          MoreePage(),
        ],
      ),
      bottomNavigationBar: Obx(
            () => Footer(
          onTabChanged: controller.changePage,
          currentIndex: controller.pageIndex.value,
        ),
      ),
    );
  }
}

