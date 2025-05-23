import 'package:flutter/material.dart';
import 'package:get/get.dart';

class CustomSnackbar {
  /// Shows a success snackbar with a green theme
  static void showSuccess({
    required String message,
    Duration duration = const Duration(seconds: 2),
  }) {
    final isDarkMode = Get.isDarkMode;
    Get.rawSnackbar(
      messageText: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: Colors.green.shade600,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(Icons.check_circle, color: Colors.white, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              message,
              style: TextStyle(
                fontFamily: 'CustomFont',
                color: isDarkMode ? Colors.white70 : Colors.black87,
                fontWeight: FontWeight.w500,
                fontSize: 16,
                letterSpacing: 0.5,
              ),
            ),
          ),
        ],
      ),
      snackPosition: SnackPosition.TOP,
      backgroundColor: isDarkMode
          ? Colors.green.shade900.withOpacity(0.7)
          : Colors.green.shade50,
      borderColor: Colors.green.shade600,
      borderWidth: 1,
      margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
      borderRadius: 8,
      padding: const EdgeInsets.all(16),
      duration: duration,
      animationDuration: const Duration(milliseconds: 300),
    );
  }

  /// Shows an error snackbar with a red theme
  static void showError({
    required String message,
    Duration duration = const Duration(seconds: 3),
  }) {
    final isDarkMode = Get.isDarkMode;
    Get.rawSnackbar(
      messageText: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: Colors.red.shade600,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(Icons.error_outline, color: Colors.white, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              message,
              style: TextStyle(
                fontFamily: 'CustomFont',
                color: isDarkMode ? Colors.white70 : Colors.black87,
                fontWeight: FontWeight.w500,
                fontSize: 16,
                letterSpacing: 0.5,
              ),
            ),
          ),
        ],
      ),
      snackPosition: SnackPosition.TOP,
      backgroundColor: isDarkMode
          ? Colors.red.shade900.withOpacity(0.7)
          : Colors.red.shade50,
      borderColor: Colors.red.shade600,
      borderWidth: 1,
      margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
      borderRadius: 8,
      padding: const EdgeInsets.all(16),
      duration: duration,
      animationDuration: const Duration(milliseconds: 300),
    );
  }

  /// Shows an info snackbar with a blue theme
  static void showInfo({
    required String message,
    Duration duration = const Duration(seconds: 2),
  }) {
    final isDarkMode = Get.isDarkMode;
    Get.rawSnackbar(
      messageText: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: Colors.blue.shade600,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(Icons.info_outline, color: Colors.white, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              message,
              style: TextStyle(
                fontFamily: 'CustomFont',
                color: isDarkMode ? Colors.white70 : Colors.black87,
                fontWeight: FontWeight.w500,
                fontSize: 16,
                letterSpacing: 0.5,
              ),
            ),
          ),
        ],
      ),
      snackPosition: SnackPosition.TOP,
      backgroundColor: isDarkMode
          ? Colors.blue.shade900.withOpacity(0.7)
          : Colors.blue.shade50,
      borderColor: Colors.blue.shade600,
      borderWidth: 1,
      margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
      borderRadius: 8,
      padding: const EdgeInsets.all(16),
      duration: duration,
      animationDuration: const Duration(milliseconds: 300),
    );
  }

  /// Shows a warning snackbar with an orange theme
  static void showWarning({
    required String message,
    Duration duration = const Duration(seconds: 3),
  }) {
    final isDarkMode = Get.isDarkMode;
    Get.rawSnackbar(
      messageText: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: Colors.orange.shade600,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(Icons.warning_amber_outlined,
                color: Colors.white, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              message,
              style: TextStyle(
                fontFamily: 'CustomFont',
                color: isDarkMode ? Colors.white70 : Colors.black87,
                fontWeight: FontWeight.w500,
                fontSize: 16,
                letterSpacing: 0.5,
              ),
            ),
          ),
        ],
      ),
      snackPosition: SnackPosition.TOP,
      backgroundColor: isDarkMode
          ? Colors.orange.shade900.withOpacity(0.7)
          : Colors.orange.shade50,
      borderColor: Colors.orange.shade600,
      borderWidth: 1,
      margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
      borderRadius: 8,
      padding: const EdgeInsets.all(16),
      duration: duration,
      animationDuration: const Duration(milliseconds: 300),
    );
  }

  /// Shows a permission request snackbar with a settings button
  static void showPermissionRequest({
    required String message,
    required VoidCallback onOpenSettings,
    Duration duration = const Duration(seconds: 5),
  }) {
    final isDarkMode = Get.isDarkMode;
    Get.rawSnackbar(
      messageText: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: Colors.purple.shade600,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Icon(Icons.location_off, color: Colors.white, size: 18),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  message,
                  style: TextStyle(
                    fontFamily: 'CustomFont',
                    color: isDarkMode ? Colors.white70 : Colors.black87,
                    fontWeight: FontWeight.w500,
                    fontSize: 16,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(
              onPressed: () {
                Get.closeCurrentSnackbar();
                onOpenSettings();
              },
              style: TextButton.styleFrom(
                backgroundColor: isDarkMode
                    ? Colors.purple.shade800
                    : Colors.purple.shade100,
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: Text(
                'Open Settings',
                style: TextStyle(
                  color: isDarkMode ? Colors.white : Colors.purple.shade800,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ],
      ),
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: isDarkMode
          ? Colors.purple.shade900.withOpacity(0.7)
          : Colors.purple.shade50,
      borderColor: Colors.purple.shade600,
      borderWidth: 1,
      margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
      borderRadius: 8,
      padding: const EdgeInsets.all(16),
      duration: duration,
      animationDuration: const Duration(milliseconds: 300),
      isDismissible: true,
    );
  }
}
