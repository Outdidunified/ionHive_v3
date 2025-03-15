import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/feature/auth/presentation/pages/login_page.dart';
import 'package:google_fonts/google_fonts.dart';

class GetStartedPage extends StatefulWidget {
  const GetStartedPage({super.key});

  @override
  State<GetStartedPage> createState() => _GetStartedPageState();
}

class _GetStartedPageState extends State<GetStartedPage> {
  final PageController _pageController = PageController();
  int _currentPage = 0; // Track active page

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;
    final colorScheme = theme.colorScheme;
    final double screenHeight = MediaQuery
        .of(context)
        .size
        .height;
    final double screenWidth = MediaQuery
        .of(context)
        .size
        .width;

    return Scaffold(
      body: SafeArea(
        child: Stack(
          clipBehavior: Clip.none, // Allows touch events to pass through

          children: [


            // PageView for onboarding screens
            PageView(
              controller: _pageController,
              onPageChanged: (index) {
                setState(() {
                  _currentPage = index;
                });
              },
              children: [
                _buildPage(
                  screenHeight,
                  screenWidth,
                  textTheme,
                  colorScheme,
                  "assets/Image/g1.png",
                  "Discover",
                  "Select the nearest charging station on the map or the one you prefer according to your needs, you can easily create a route for it.",
                ),
                _buildPage(
                  screenHeight,
                  screenWidth,
                  textTheme,
                  colorScheme,
                  "assets/Image/g2.png",
                  "Connect & Charge",
                  "Once you reach the station, connect your vehicle and start charging instantly.",
                ),
                _buildPage(
                  screenHeight,
                  screenWidth,
                  textTheme,
                  colorScheme,
                  "assets/Image/g3.png",
                  "Track Usage",
                  "Monitor your charging sessions and keep track of your usage in real-time.",
                ),
              ],
            ),

            // Page Indicator
            // Page Indicator
            Positioned(
              bottom: screenHeight * 0.12,
              left: 0,
              right: 0,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildDot(_currentPage == 0),
                  _buildDot(_currentPage == 1),
                  _buildDot(_currentPage == 2),
                ],
              ),
            ),


            // Get Started / Next Button
            Positioned(
              bottom: screenHeight * 0.03,
              left: screenWidth * 0.05,
              right: screenWidth * 0.05,
              child: ElevatedButton(
                onPressed: () {
                  if (_currentPage == 2) {
                    Get.offAll(() => LoginPage(),
                        transition: Transition.rightToLeft,
                        duration: const Duration(milliseconds: 500));
                  } else {
                    _pageController.nextPage(
                      duration: const Duration(milliseconds: 500),
                      curve: Curves.easeInOut,
                    );
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: colorScheme.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  padding: EdgeInsets.symmetric(vertical: screenHeight * 0.018),
                ),
                child: Text(
                  _currentPage == 2 ? "Get Started" : "Next",
                  style: textTheme.bodyLarge?.copyWith(
                    color: colorScheme.onPrimary,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPage(double screenHeight, double screenWidth,
      TextTheme textTheme, ColorScheme colorScheme, String imagePath,
      String title, String description) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Ion Hive Logo
        Text.rich(
          TextSpan(
            children: [
              TextSpan(
                text: "ion ",
                style: GoogleFonts.ubuntu(
                  fontSize: screenHeight * 0.05,
                  fontWeight: FontWeight.bold,
                  color: textTheme.headlineMedium?.color,
                ),
              ),
              TextSpan(
                text: "H",
                style: GoogleFonts.ubuntu(
                  fontSize: screenHeight * 0.05,
                  fontWeight: FontWeight.bold,
                  color: colorScheme.primary,
                ),
              ),
              TextSpan(
                text: "ive",
                style: GoogleFonts.ubuntu(
                  fontSize: screenHeight * 0.05,
                  fontWeight: FontWeight.bold,
                  color: textTheme.headlineMedium?.color,
                ),
              ),
            ],
          ),
        ),
        SizedBox(height: screenHeight * 0.02),

        // Illustration
        Image.asset(
          imagePath,
          height: screenHeight * 0.3,
        ),
        SizedBox(height: screenHeight * 0.04),

        // Title
        Text(
          title,
          style: textTheme.headlineMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: screenHeight * 0.015),

        // Description
        Padding(
          padding: EdgeInsets.symmetric(horizontal: screenWidth * 0.1),
          child: Text(
            description,
            textAlign: TextAlign.center,
            style: textTheme.bodyMedium?.copyWith(
              color: textTheme.bodyMedium?.color?.withOpacity(0.7),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDot(bool isActive) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 5),
      width: isActive ? 10 : 8,
      height: isActive ? 10 : 8,
      decoration: BoxDecoration(
        color: isActive ? Colors.green[800] : Colors.grey,
        // Dark green for active, grey for inactive
        shape: BoxShape.circle,
      ),
    );
  }
}

