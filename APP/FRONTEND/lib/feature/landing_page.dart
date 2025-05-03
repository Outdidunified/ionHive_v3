import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/components/footer.dart';
import 'package:ionhive/feature/landing_page_controller.dart';
import 'package:ionhive/feature/session_history/presentation/pages/session_history.dart';
import 'package:ionhive/feature/wallet/presentation/pages/wallet_page.dart';
import 'package:ionhive/feature/home/presentation/pages/home_page.dart';
import 'package:ionhive/feature/more/presentation/pages/more_page.dart';

class LandingPage extends StatefulWidget {
  const LandingPage({super.key});

  @override
  State<LandingPage> createState() => _LandingPageState();
}

class _LandingPageState extends State<LandingPage> {
  late final LandingPageController controller;

  // Pre-initialize all pages to maintain their state
  final List<Widget> _pages = [
    HomePage(),
    const WalletPage(),
    const SessionHistoryPage(),
    MoreePage(),
  ];

  @override
  void initState() {
    super.initState();
    controller = Get.find<LandingPageController>();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Obx(() {
        // Use IndexedStack to preserve state of all pages
        return IndexedStack(
          index: controller.pageIndex.value,
          children: _pages,
        );
      }),
      bottomNavigationBar: Obx(
        () => Footer(
          onTabChanged: (index) {
            // Ensure we're not in the middle of a build cycle
            WidgetsBinding.instance.addPostFrameCallback((_) {
              controller.changePage(index);
            });
          },
          currentIndex: controller.pageIndex.value,
        ),
      ),
    );
  }
}
