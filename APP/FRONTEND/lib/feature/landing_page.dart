import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/feature/session_history/presentation/pages/session_history.dart';
import 'package:ionhive/feature/wallet/presentation/pages/wallet_page.dart';

import '../core/components/footer.dart';
import 'package:ionhive/feature/landing_page_controller.dart';
import 'package:ionhive/feature/home/presentation/pages/home_page.dart';
import 'package:ionhive/feature/more/presentation/pages/more_page.dart';

class LandingPage extends StatefulWidget {
  const LandingPage({super.key});

  @override
  State<LandingPage> createState() => _LandingPageState();
}

class _LandingPageState extends State<LandingPage>
    with AutomaticKeepAliveClientMixin {
  final LandingPageController controller = Get.put(LandingPageController());

  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Scaffold(
      body: PageView(
        controller: controller.pageController,
        physics: const NeverScrollableScrollPhysics(),
        children:  [
          HomePage(),
          WalletPage(),
          SessionHistoryPage(),
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