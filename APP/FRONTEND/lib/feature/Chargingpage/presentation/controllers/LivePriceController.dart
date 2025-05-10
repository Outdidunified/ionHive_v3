import 'package:flutter/animation.dart';
import 'package:get/get.dart';

class LivePriceController extends GetxController with GetTickerProviderStateMixin {
  late AnimationController rotationController;


  @override
  void onInit() {
    super.onInit();
    rotationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..repeat(); // Looping rotation
  }

  @override
  void onClose() {
    rotationController.dispose();
    super.onClose();
  }
}
