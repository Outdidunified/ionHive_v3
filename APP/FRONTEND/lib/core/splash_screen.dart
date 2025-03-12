import 'package:get/get.dart';
import 'package:flutter/material.dart';
import 'package:ionhive/feature/auth/presentation/pages/login_page.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Determine if the theme is dark or light

    // Dynamic background color based on theme
    const backgroundColor = Colors.black;

    // Wait for 2 seconds and navigate to the next screen using GetX
    Future.delayed(const Duration(seconds: 2), () {
      Get.off(() =>
          LoginPage()); // Navigate to LoginPage and remove SplashScreen from the stack
    });

    return Scaffold(
      backgroundColor: backgroundColor,
      body: Center(
        child: Image.asset(
          "assets/ionHive_logo's/ionHive.png ",
          width: 150,
          height: 150,
        ),
      ),
    );
  }
}
