import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ionhive/utils/widgets/snackbar/custom_snackbar.dart';

class MoreController extends GetxController {
  var isNotificationEnabled = false.obs;

  @override
  void onInit() {
    super.onInit();
    loadNotificationPreference();
  }

  // Load permission state
  Future<void> loadNotificationPreference() async {
    final prefs = await SharedPreferences.getInstance();
    bool? savedState = prefs.getBool('notification_permission');
    var status = await Permission.notification.status;

    isNotificationEnabled.value = savedState ?? status.isGranted;
  }

  // Toggle switch with confirmation dialog when disabling notifications
  Future<void> toggleNotification(bool value) async {
    final prefs = await SharedPreferences.getInstance();

    if (value) {
      // ✅ Request permission when enabling
      PermissionStatus status = await Permission.notification.request();
      isNotificationEnabled.value = status.isGranted;
      await prefs.setBool('notification_permission', status.isGranted);
    } else {
      Get.closeAllSnackbars();
      // ✅ Show Snackbar Confirmation before disabling
      CustomSnackbar.showInfo(
        message: "Are you sure you want to turn off notifications?",
      );

      // Open settings after a short delay
      Future.delayed(Duration(milliseconds: 500), () async {
        await openAppSettings();
      });

      // Keep switch enabled until user manually disables notifications in settings
      isNotificationEnabled.value = true;
    }
  }
}
