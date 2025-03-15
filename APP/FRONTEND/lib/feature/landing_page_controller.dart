import 'package:flutter/material.dart';
import 'package:get/get.dart';

class LandingPageController extends GetxController {
  var pageIndex = 0.obs;
  late PageController pageController; // Declare but don't initialize here

  @override
  void onInit() {
    super.onInit();
    pageController = PageController(); // Initialize in onInit()
  }

  void changePage(int index) {
    if (pageController.hasClients) {
      pageIndex.value = index;
      pageController.jumpToPage(index);
    }
  }

  void clearPageIndex() {
    if (pageController.hasClients) {
      pageIndex.value = 0;
      pageController.jumpToPage(0);
    }
  }

  @override
  void onClose() {
    pageController.dispose();
    super.onClose();
  }
}
