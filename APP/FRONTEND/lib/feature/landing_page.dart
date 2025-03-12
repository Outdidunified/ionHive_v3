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

  // Instantiate the controller
  final LandingPageController controller = Get.put(LandingPageController());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: PageView(
        controller: controller.pageController,
        onPageChanged: (index) {
          controller.changePage(index); // Update the page index
        },
        children: [
          const HomePage(), // Home page (index 0)
          const WalletPage(), // Wallet page (index 1)
          const TripMapPage(), // Trip page (index 2)
          MoreePage(), // More page (index 3)
        ],
      ),
      bottomNavigationBar: Obx(
        () => Footer(
          onTabChanged: controller.changePage, // Callback for tab click
          currentIndex: controller.pageIndex.value, // Reactive value
        ),
      ),
    );
  }
}
