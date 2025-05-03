import 'package:flutter/material.dart';
import 'package:get/get.dart';

/// A utility class for safely handling snackbar operations
class SafeSnackbar {
  /// Safely close all snackbars without throwing exceptions
  static void closeAll() {
    try {
      // Check if GetX is initialized and has a context
      if (Get.isRegistered<GetMaterialController>()) {
        Get.closeAllSnackbars();
      }
    } catch (e) {
      // Silently ignore any errors
      debugPrint("Error closing snackbars: $e");
    }
  }

  /// Show a success snackbar safely
  static void showSuccess({required String message, Duration? duration}) {
    closeAll(); // First close any existing snackbars

    try {
      Get.snackbar(
        'Success',
        message,
        backgroundColor: Colors.green,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        duration: duration ?? const Duration(seconds: 3),
      );
    } catch (e) {
      debugPrint("Error showing success snackbar: $e");
    }
  }

  /// Show an error snackbar safely
  static void showError({required String message, Duration? duration}) {
    closeAll(); // First close any existing snackbars

    try {
      Get.snackbar(
        'Error',
        message,
        backgroundColor: Colors.red,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        duration: duration ?? const Duration(seconds: 3),
      );
    } catch (e) {
      debugPrint("Error showing error snackbar: $e");
    }
  }

  /// Show an info snackbar safely
  static void showInfo({required String message, Duration? duration}) {
    closeAll(); // First close any existing snackbars

    try {
      Get.snackbar(
        'Info',
        message,
        backgroundColor: Colors.blue,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        duration: duration ?? const Duration(seconds: 3),
      );
    } catch (e) {
      debugPrint("Error showing info snackbar: $e");
    }
  }
}
