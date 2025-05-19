import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/View/NoInternetScreen.dart';
import 'package:ionhive/core/controllers/session_controller.dart'; // Session Controller
import 'package:ionhive/core/services/notification_service.dart'; // Notification Service
import 'package:ionhive/core/splash_screen.dart';
import 'package:ionhive/feature/Chargingpage/presentation/controllers/LivePriceController.dart';
import 'package:ionhive/feature/auth/presentation/pages/GettingStarted%20page.dart';
import 'package:ionhive/feature/auth/presentation/pages/login_page.dart'; // Login Page
import 'package:ionhive/feature/home/presentation/controllers/home_controller.dart';
import 'package:ionhive/feature/home/presentation/pages/search/presentation/controllers/search_controllers.dart';
import 'package:ionhive/feature/landing_page.dart'; // Landing Page
import 'package:ionhive/feature/landing_page_controller.dart';
import 'package:ionhive/utils/theme/themes.dart'; // App theme
import 'package:ionhive/utils/theme/theme_controller.dart'; // Theme controller
import 'package:ionhive/core/controllers/connectivity_controller.dart'; // Add the ConnectivityController
import 'package:flutter/services.dart';
import 'package:ionhive/feature/home/presentation/pages/qrscanner/presentation/pages/qr_scannerpage.dart';
import 'package:ionhive/utils/widgets/snackbar/safe_snackbar.dart';
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

  // Initialize notification service first
  NotificationService notificationService = NotificationService();
  // Register it early to ensure it's available for other controllers
  Get.put(notificationService, permanent: true);

  // Delay the initialization to ensure Flutter engine is fully set up
  // This helps prevent MissingPluginException
  WidgetsBinding.instance.addPostFrameCallback((_) async {
    try {
      await notificationService.init();
      await notificationService.requestPermissions();
      debugPrint('Notification service initialized successfully');
    } catch (e) {
      debugPrint('Error initializing notification service: $e');
    }
  });

  // Initialize theme controller first to ensure theme is applied before other controllers
  final themeController = Get.put(ThemeController());
  await themeController.loadThemePreferences(); // Wait for theme to be loaded

  // Initialize other controllers
  Get.put(LandingPageController(),
      permanent: true); // Make it permanent to avoid recreation
  Get.put(HomeController());
  Get.put(SessionController(), permanent: true); // Singleton for the entire app
  Get.put(ConnectivityController());
  Get.put(VehicleController());
  Get.put(SearchpageController());
  Get.put(LivePriceController());

  runApp(const IonHive());
}

// Custom navigation observer to close snackbars on page changes
class SnackbarCloseObserver extends NavigatorObserver {
  @override
  void didPush(Route<dynamic> route, Route<dynamic>? previousRoute) {
    SafeSnackbar.closeAll();
    super.didPush(route, previousRoute);
  }

  @override
  void didPop(Route<dynamic> route, Route<dynamic>? previousRoute) {
    SafeSnackbar.closeAll();
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
            GetPage(name: '/qr-scanner', page: () => const QrScannerpage()),
          ],
        ));
  }
}
