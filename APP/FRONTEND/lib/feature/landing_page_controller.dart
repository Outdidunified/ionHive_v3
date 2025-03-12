import 'package:flutter/material.dart';
import 'package:get/get.dart';

class LandingPageController extends GetxController {
  var pageIndex = 0.obs; // Observable variable to track page index
  final PageController pageController = PageController();

  void changePage(int index) {
    pageIndex.value = index;
    pageController.jumpToPage(index);
  }

  void clearPageIndex() {
    pageIndex.value = 0; // Reset the index to the Home page
    pageController.jumpToPage(0); // Ensure the PageView goes to the first page
  }

  @override
  void onClose() {
    pageController.dispose(); // Dispose of the PageController
    super.onClose();
  }
}
