import 'package:flutter/material.dart';
import 'package:get/get.dart';

class LandingPageController extends GetxController {
  var pageIndex = 0.obs;
  PageController? _pageController;

  // Getter that creates a new controller if needed
  PageController get pageController {
    if (_pageController == null || !_pageController!.hasClients) {
      _pageController?.dispose(); // Dispose old controller if it exists
      _pageController = PageController(initialPage: pageIndex.value);
    }
    return _pageController!;
  }

  @override
  void onInit() {
    super.onInit();
    // Don't initialize the controller here, let the getter handle it
  }

  void changePage(int index) {
    pageIndex.value = index;

    // Only try to change page if controller has clients
    if (_pageController != null && _pageController!.hasClients) {
      _pageController!.jumpToPage(index);
    }
  }

  void clearPageIndex() {
    pageIndex.value = 0;

    // Only try to change page if controller has clients
    if (_pageController != null && _pageController!.hasClients) {
      _pageController!.jumpToPage(0);
    }
  }

  @override
  void onClose() {
    _pageController?.dispose();
    _pageController = null;
    super.onClose();
  }
}
