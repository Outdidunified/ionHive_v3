import 'dart:io' show Platform;
import 'package:get/get.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ionhive/utils/widgets/snackbar/custom_snackbar.dart';

class MoreController extends GetxController {
  var isNotificationEnabled = false.obs;
  var isNotificationAvailable =
      true.obs; // Flag to check if notifications are available in app settings

  @override
  void onInit() {
    super.onInit();
    // First check app settings, then load actual permission state
    checkAppDefaultSettings().then((_) => loadNotificationPreference());
  }

  // Check app default settings for notifications
  Future<void> checkAppDefaultSettings() async {
    final prefs = await SharedPreferences.getInstance();
    bool? appDefaultNotifications = prefs.getBool('app_notifications_enabled');

    // If app_notifications_enabled is not set, default to true
    // If it's explicitly set to false, disable the notification toggle
    isNotificationAvailable.value = appDefaultNotifications ?? true;

    // If notifications are not available, force the toggle to be off
    if (!isNotificationAvailable.value) {
      isNotificationEnabled.value = false;
    }
  }

  // Load permission state
  Future<void> loadNotificationPreference() async {
    final prefs = await SharedPreferences.getInstance();
    var status = await Permission.notification.status;

    // Check if the permission is actually granted at the system level
    bool isGrantedInSystem = status.isGranted;

    // Get the saved preference (if any)
    bool? savedState = prefs.getBool('notification_permission');

    // iOS specific handling - on iOS, the permission might show as "denied" initially
    // until the user is prompted, so we rely more on our saved state
    if (Platform.isIOS && savedState == null && status.isDenied) {
      // On iOS, if we haven't asked yet, we'll show as enabled until user decides
      isGrantedInSystem = true;
    }

    // Only set to true if app settings allow notifications AND permission is granted in system
    if (isNotificationAvailable.value) {
      // Always prioritize the actual system status over our saved state
      isNotificationEnabled.value = isGrantedInSystem;

      // Update our saved state to match reality
      if (savedState != isGrantedInSystem) {
        await prefs.setBool('notification_permission', isGrantedInSystem);
      }
    } else {
      // If notifications are disabled in app settings, force to false
      isNotificationEnabled.value = false;

      // Make sure our saved state is also false
      if (savedState != false) {
        await prefs.setBool('notification_permission', false);
      }
    }
  }

  // Toggle switch with confirmation dialog when disabling notifications
  Future<void> toggleNotification(bool value) async {
    final prefs = await SharedPreferences.getInstance();

    // Always check the current permission status first
    var currentStatus = await Permission.notification.status;

    // Check if notifications are available in app settings
    if (!isNotificationAvailable.value) {
      // If notifications are disabled in app settings, show a message and return
      CustomSnackbar.showInfo(
        message: "Notifications are disabled in app settings.",
      );
      return;
    }

    // Handle iOS and Android differently for notification permissions
    if (value && !currentStatus.isGranted) {
      if (Platform.isIOS) {
        // On iOS, we need special handling
        prefs.getBool('notification_permission');
//
        // Request permission (iOS will only show the prompt once)
        PermissionStatus status = await Permission.notification.request();
        isNotificationEnabled.value = status.isGranted;
        await prefs.setBool('notification_permission', status.isGranted);

        // If permission was denied, guide user to settings
        if (!status.isGranted) {
          CustomSnackbar.showInfo(
            message: "Please enable notifications in iOS Settings.",
          );

          // Open settings after a short delay
          Future.delayed(Duration(milliseconds: 500), () async {
            await openAppSettings();
          });
        }
      } else {
        // Android handling
        if (currentStatus.isDenied) {
          // Request permission
          PermissionStatus status = await Permission.notification.request();
          isNotificationEnabled.value = status.isGranted;
          await prefs.setBool('notification_permission', status.isGranted);

          // If permission was denied, show a message
          if (!status.isGranted) {
            CustomSnackbar.showInfo(
              message:
                  "Notification permission was denied. Please enable it in settings.",
            );

            // Open settings after a short delay
            Future.delayed(Duration(milliseconds: 500), () async {
              await openAppSettings();
            });
          }
        } else if (currentStatus.isPermanentlyDenied) {
          CustomSnackbar.showInfo(
            message:
                "Notifications are permanently denied. Please enable them in settings.",
          );

          // Open settings after a short delay
          Future.delayed(Duration(milliseconds: 500), () async {
            await openAppSettings();
          });

          // Keep the toggle in its current state
          isNotificationEnabled.value = false;
        }
      }
    }
    // If the user is trying to disable notifications
    else if (!value) {
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
    // If the user is trying to enable notifications and they're already granted
    else if (value && currentStatus.isGranted) {
      isNotificationEnabled.value = true;
      await prefs.setBool('notification_permission', true);
    }
  }

  // Method to set app default notification setting (for admin or settings use)
  Future<void> setAppNotificationDefault(bool enabled) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('app_notifications_enabled', enabled);

    // Update the controller state
    isNotificationAvailable.value = enabled;

    // If disabling at app level, also turn off the user's notification
    if (!enabled) {
      isNotificationEnabled.value = false;
      await prefs.setBool('notification_permission', false);
    }
  }
}
