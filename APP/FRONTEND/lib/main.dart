import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:ionhive/core/controllers/session_controller.dart'; // Session Controller
import 'package:ionhive/feature/auth/presentation/pages/login_page.dart'; // Login Page
import 'package:ionhive/feature/landing_page.dart'; // Landing Page
import 'package:ionhive/utils/theme/themes.dart'; // App theme
import 'package:ionhive/core/controllers/connectivity_controller.dart'; // Add the ConnectivityController
import 'package:flutter/services.dart'; // Add this import for controlling orientation

void main() async {
  WidgetsFlutterBinding
      .ensureInitialized(); // Ensure initialization before using SharedPreferences

  // Lock the app to portrait mode
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp, // Portrait mode
    DeviceOrientation.portraitDown, // In case the device is upside down
  ]);

  final sessionController = Get.put(SessionController());
  await sessionController.loadSession(); // Load session data
  runApp(const IonHive());
}

class IonHive extends StatelessWidget {
  const IonHive({super.key});

  @override
  Widget build(BuildContext context) {
    // Initialize the ConnectivityController
    final connectivityController = Get.put(ConnectivityController());

    return GetMaterialApp(
      title: 'ionHive',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme, // Light theme
      darkTheme: AppTheme.darkTheme, // Dark theme
      themeMode:
          ThemeMode.system, // Automatically switches based on device settings
      home: GetBuilder<SessionController>(
        builder: (sessionController) {
          if (!connectivityController.isConnected.value) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              final currentTheme = Theme.of(context);
              Get.snackbar(
                'No Internet Connection',
                'Please check your internet connection',
                snackPosition: SnackPosition.BOTTOM,
                backgroundColor: currentTheme.snackBarTheme.backgroundColor ??
                    Colors.red.withOpacity(0.7),
                colorText:
                    currentTheme.snackBarTheme.actionTextColor ?? Colors.white,
                duration: const Duration(seconds: 3),
              );
            });
          }

          return sessionController.isLoggedIn.value
              ? LandingPage() // Your home page
              : LoginPage(); // Your login page
        },
      ),
    );
  }
}
