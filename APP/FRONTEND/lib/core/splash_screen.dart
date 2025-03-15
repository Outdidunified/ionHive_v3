import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/auth/presentation/pages/GettingStarted%20page.dart';
import 'package:ionhive/feature/landing_page.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  _SplashScreenState createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  final SessionController sessionController = Get.find<SessionController>();
  bool _hasNavigated = false;  // Add this flag

  @override
  void initState() {
    super.initState();

    ever(sessionController.isLoggedIn, (isLoggedIn) {
      if (_hasNavigated) return;
      _hasNavigated = true;
      if (isLoggedIn) {
        debugPrint("Navigating to LandingPage");
        Get.offAll(() => LandingPage(), transition: Transition.rightToLeft,duration: Duration(milliseconds: 600));
      } else {
        debugPrint("Navigating to LoginPage");
        Get.offAll(() => GetStartedPage(), transition: Transition.rightToLeft,duration: Duration(milliseconds: 600));
      }

    });

    Future.delayed(const Duration(seconds: 2), () {
      sessionController.isLoggedIn.refresh(); // Ensure correct state is checked
    });
  }

  @override
  Widget build(BuildContext context) {
    // MediaQuery for responsiveness
    final double screenWidth = MediaQuery.of(context).size.width;
    final double screenHeight = MediaQuery.of(context).size.height;

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.green, Colors.lightGreen, Colors.lightGreen],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // EV Icon Animation
              TweenAnimationBuilder(
                tween: Tween<double>(begin: 0.5, end: 1.0),
                duration: const Duration(seconds: 1),
                builder: (context, double scale, child) {
                  return Transform.scale(
                    scale: scale,
                    child: Icon(
                      Icons.electric_car,
                      size: screenWidth * 0.25, // Responsive size
                      color: Colors.black,
                    ),
                  );
                },
              ),
              SizedBox(height: screenHeight * 0.03), // Responsive spacing

              // Animated ionHIVE Text Letter-by-Letter
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: "ion HIVE".split("").asMap().entries.map((entry) {
                  int index = entry.key;
                  String letter = entry.value;

                  return TweenAnimationBuilder(
                    tween: Tween<double>(begin: 0.0, end: 1.0),
                    duration: Duration(milliseconds: 300 + (index * 200)),
                    builder: (context, double opacity, child) {
                      return Opacity(
                        opacity: opacity,
                        child: Transform.scale(
                          scale: opacity,
                          child: Text(
                            letter,
                            style: GoogleFonts.orbitron(
                              fontSize: screenWidth * 0.08, // Responsive text size
                              fontWeight: FontWeight.bold,
                              color: letter == "H" ? Colors.greenAccent : Colors.white,
                              letterSpacing: screenWidth * 0.005,
                            ),
                          ),
                        ),
                      );
                    },
                  );
                }).toList(),
              ),
            ],
          ),
        ),
      ),
    );

  }
}
