import 'package:flutter/material.dart';
import 'package:get/get.dart';

class LandingPageController extends GetxController {
  var pageIndex = 0.obs;

  // We'll create a new PageController each time it's needed
  // This ensures we don't have a controller attached to multiple scroll views
  PageController? _currentController;

  // Getter for pageController - creates a new one each time to avoid multiple attachments
  PageController get pageController {
    // Dispose any existing controller to prevent memory leaks
    _currentController?.dispose();
    // Create a new controller
    _currentController = PageController(initialPage: pageIndex.value);
    return _currentController!;
  }

  @override
  void onInit() {
    super.onInit();
    debugPrint('Initializing LandingPageController');
  }

  void changePage(int index) {
    // Just update the index - the PageView will handle the animation
    pageIndex.value = index;
  }

  void clearPageIndex() {
    // Just reset the index to 0
    pageIndex.value = 0;
  }

  @override
  void onClose() {
    debugPrint('Disposing LandingPageController');
    // Safely dispose the controller
    _currentController?.dispose();
    _currentController = null;
    super.onClose();
  }
}
