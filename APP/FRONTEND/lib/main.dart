import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/View/NoInternetScreen.dart';
import 'package:permission_handler/permission_handler.dart'; // Import permission handler
import 'package:ionhive/core/controllers/session_controller.dart'; // Session Controller
import 'package:ionhive/core/splash_screen.dart';
import 'package:ionhive/feature/auth/presentation/pages/GettingStarted%20page.dart';
import 'package:ionhive/feature/auth/presentation/pages/login_page.dart'; // Login Page
import 'package:ionhive/feature/landing_page.dart'; // Landing Page
import 'package:ionhive/feature/landing_page_controller.dart';
import 'package:ionhive/utils/theme/themes.dart'; // App theme
import 'package:ionhive/core/controllers/connectivity_controller.dart'; // Add the ConnectivityController
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart'; // Add this import for controlling orientation

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

  Get.put(LandingPageController());
  Get.put(SessionController()); // Ensure it is available globally
  Get.put(ConnectivityController());




  runApp(const IonHive());
}



class IonHive extends StatelessWidget {
  const IonHive({super.key});

  @override
  Widget build(BuildContext context) {


    return GetMaterialApp(
      title: 'ionHive',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      initialRoute: '/',
      getPages: [
        GetPage(name: '/', page: () => SplashScreen()),
        GetPage(name: '/landing', page: () => LandingPage()),
        GetPage(name: '/login', page: () => LoginPage()), // Must be defined
        GetPage(name: '/start', page: () => GetStartedPage()),
        GetPage(name: '/noInternet', page: () => NoInternetScreen()), // Add route
      ],
    );

  }
}
