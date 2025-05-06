import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/auth/presentation/pages/GettingStarted%20page.dart';
import 'package:ionhive/feature/landing_page.dart';
import 'package:ionhive/utils/debug/build_guard.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  _SplashScreenState createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  // Don't find the controller immediately - we'll check for it later
  SessionController? _sessionController;
  bool _hasNavigated = false;
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();

    // Try to initialize after a short delay to allow GetX to set up
    _initializeWithDelay();
  }

  void _initializeWithDelay() {
    // Delay to allow controllers to be registered
    Future.delayed(const Duration(milliseconds: 500), () {
      _tryInitializeController();
    });
  }

  // Counter to limit retry attempts
  int _retryCount = 0;
  static const int _maxRetries = 10;

  void _tryInitializeController() {
    if (_isInitialized) return;

    // Increment retry counter
    _retryCount++;

    try {
      // Try to find the SessionController
      if (Get.isRegistered<SessionController>()) {
        _sessionController = Get.find<SessionController>();
        _setupNavigation();
        _isInitialized = true;
      } else if (_retryCount < _maxRetries) {
        // If not found and we haven't exceeded max retries, try again after a delay
        Future.delayed(
            const Duration(milliseconds: 500), _tryInitializeController);
      } else {
        // If we've exceeded max retries, navigate to GetStartedPage as fallback
        debugPrint(
            'Max retries exceeded, navigating to GetStartedPage as fallback');
        _navigateToFallback();
      }
    } catch (e) {
      debugPrint('Error initializing SessionController: $e');
      if (_retryCount < _maxRetries) {
        // Try again after a delay if we haven't exceeded max retries
        Future.delayed(
            const Duration(milliseconds: 500), _tryInitializeController);
      } else {
        // Navigate to fallback if max retries exceeded
        _navigateToFallback();
      }
    }
  }

  void _navigateToFallback() {
    if (!_hasNavigated) {
      _hasNavigated = true;
      // Use a safe navigation approach
      BuildGuard.runSafely(() {
        Future.delayed(const Duration(seconds: 2), () {
          Get.offAll(() => GetStartedPage(),
              transition: Transition.rightToLeft,
              duration: Duration(milliseconds: 600));
        });
      });
    }
  }

  void _setupNavigation() {
    if (_sessionController == null) return;

    // Set up the listener for login state changes
    ever(_sessionController!.isLoggedIn, (isLoggedIn) {
      BuildGuard.runSafely(() {
        if (_hasNavigated) return;
        _hasNavigated = true;

        if (isLoggedIn) {
          debugPrint("Navigating to LandingPage");
          Get.offAll(() => LandingPage(),
              transition: Transition.rightToLeft,
              duration: Duration(milliseconds: 600));
        } else {
          debugPrint("Navigating to LoginPage");
          Get.offAll(() => GetStartedPage(),
              transition: Transition.rightToLeft,
              duration: Duration(milliseconds: 600));
        }
      });
    });

    // Check login state after a delay to allow animation to complete
    Future.delayed(const Duration(seconds: 2), () {
      if (_sessionController != null) {
        _sessionController!.isLoggedIn.refresh();
      }
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
                    child: Image.asset(
                      'assets/icons/charging-vehicle.png',
                      width: screenWidth * 0.25, // Responsive size
                      height: screenWidth * 0.25, // Maintain aspect ratio
                      color: Colors.black, // Apply color if needed
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
                              fontSize:
                                  screenWidth * 0.08, // Responsive text size
                              fontWeight: FontWeight.bold,
                              color: letter == "H"
                                  ? Colors.greenAccent
                                  : Colors.white,
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
