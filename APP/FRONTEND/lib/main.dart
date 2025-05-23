import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/View/NoInternetScreen.dart';
import 'package:ionhive/core/controllers/session_controller.dart'; // Session Controller
import 'package:ionhive/core/splash_screen.dart';
import 'package:ionhive/feature/auth/presentation/pages/GettingStarted%20page.dart';
import 'package:ionhive/feature/auth/presentation/pages/login_page.dart'; // Login Page
import 'package:ionhive/feature/home/presentation/controllers/home_controller.dart';
import 'package:ionhive/feature/landing_page.dart'; // Landing Page
import 'package:ionhive/feature/landing_page_controller.dart';
import 'package:ionhive/utils/theme/themes.dart'; // App theme
import 'package:ionhive/utils/theme/theme_controller.dart'; // Theme controller
import 'package:ionhive/core/controllers/connectivity_controller.dart'; // Add the ConnectivityController
import 'package:flutter/services.dart';

import 'feature/more/presentation/pages/manage/presentation/pages/vehicle/presentation/controllers/vehicle_controller.dart'; // Add this import for controlling orientation

void main() async {
  WidgetsFlutterBinding
      .ensureInitialized(); // Ensure initialization before using SharedPreferences

  // Lock the app to portrait mode
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp, // Portrait mode
    DeviceOrientation.portraitDown, // In case the device is upside down
  ]);

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      statusBarBrightness: Brightness.light,
    ),
  );

  // Initialize theme controller first to ensure theme is applied before other controllers
  final themeController = Get.put(ThemeController());
  await themeController.loadThemePreferences(); // Wait for theme to be loaded

  // Initialize other controllers
  Get.put(LandingPageController());
  Get.put(HomeController());
  Get.put(SessionController()); // Ensure it is available globally
  Get.put(ConnectivityController());
  Get.put(VehicleController());

  runApp(const IonHive());
}

// Custom navigation observer to close snackbars on page changes
class SnackbarCloseObserver extends NavigatorObserver {
  @override
  void didPush(Route<dynamic> route, Route<dynamic>? previousRoute) {
    Get.closeAllSnackbars();
    super.didPush(route, previousRoute);
  }

  @override
  void didPop(Route<dynamic> route, Route<dynamic>? previousRoute) {
    Get.closeAllSnackbars();
    super.didPop(route, previousRoute);
  }
}

class IonHive extends StatelessWidget {
  const IonHive({super.key});

  @override
  Widget build(BuildContext context) {
    // Get the theme controller
    final themeController = Get.find<ThemeController>();

    // Force theme update when the app starts
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // This ensures the theme is applied correctly after the app is built
      final currentMode = themeController.themeMode.value;
      themeController.changeThemeMode(currentMode);
    });

    return Obx(() => GetMaterialApp(
          title: 'ionHive',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: themeController.themeMode.value,
          initialRoute: '/',
          navigatorObservers: [
            SnackbarCloseObserver()
          ], // Add observer to close snackbars on navigation
          getPages: [
            GetPage(name: '/', page: () => SplashScreen()),
            GetPage(name: '/landing', page: () => LandingPage()),
            GetPage(name: '/login', page: () => LoginPage()), // Must be defined
            GetPage(name: '/start', page: () => GetStartedPage()),
            GetPage(
                name: '/noInternet',
                page: () => NoInternetScreen()), // Add route
          ],
        ));
  }
}
