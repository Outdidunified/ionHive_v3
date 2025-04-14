import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/header/presentation/controllers/controller.dart';
import 'package:ionhive/utils/widgets/button/custom_button.dart';
import 'package:ionhive/utils/widgets/input_field/phonenumber_inputfield.dart';
import 'package:ionhive/utils/widgets/input_field/username_inputfield.dart';
import 'package:ionhive/utils/responsive/responsive.dart';

class HeaderCard extends StatelessWidget {
  final ThemeData theme;
  final int userId;
  final String username;
  final String emailId;
  final String token;
  HeaderCard(
      {super.key,
      required this.theme,
      required this.userId,
      required this.username,
      required this.emailId,
      required this.token});

  final sessionController = Get.find<SessionController>();
  final controller = Get.put(HeaderController());

  @override
  Widget build(BuildContext context) {
    final double screenWidth = context.screenWidth;
    final double screenHeight = context.screenHeight;
    final bool isSmallScreen = screenWidth < 375; // iPhone 8 and smaller

    // Fetch data when the widget is built (only once)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      controller.fetchHeaderData();
    });

    // Calculate responsive dimensions
    final double gradientHeight =
        isSmallScreen ? context.rHeight(200) : context.rHeight(220);

    final double whiteBackgroundHeight =
        isSmallScreen ? context.rHeight(160) : context.rHeight(140);

    final double profileTopPosition =
        isSmallScreen ? context.rHeight(55) : context.rHeight(65);

    final double avatarRadius =
        isSmallScreen ? context.rWidth(32) : context.rWidth(40);

    final double editIconRadius =
        isSmallScreen ? context.rWidth(13) : context.rWidth(15);

    return Stack(
      alignment: Alignment.topCenter,
      children: [
        // Gradient Background from Theme
        Container(
          width: double.infinity,
          height: gradientHeight,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                Colors.lightGreen, // Gradient start from theme
                Colors.black, // Gradient end from theme
              ],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
          ),
        ),

        // White Curved Background
        Positioned(
          bottom: 0,
          child: Container(
            width: screenWidth,
            height: whiteBackgroundHeight,
            decoration: BoxDecoration(
              color: theme.colorScheme.background, // Theme background
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(context.rRadius(40)),
                topRight: Radius.circular(context.rRadius(40)),
              ),
            ),
          ),
        ),

        // Profile Image & User Details
        Positioned(
          top: profileTopPosition,
          child: Column(
            mainAxisSize: MainAxisSize.min, // Use minimum space
            children: [
              Stack(
                children: [
                  // Profile Image with Border
                  Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: theme.primaryColor, // Border color from theme
                        width: context.rWidth(2.5),
                      ),
                    ),
                    child: CircleAvatar(
                      radius: avatarRadius,
                      backgroundColor: Colors.transparent,
                      child: Obx(() {
                        String email = sessionController.emailId.value;
                        return Text(
                          email.isNotEmpty ? email[0].toUpperCase() : '?',
                          style: theme.textTheme.headlineMedium?.copyWith(
                            fontSize:
                                context.rFontSize(isSmallScreen ? 26 : 28),
                            fontWeight: FontWeight.bold,
                          ),
                        );
                      }),
                    ),
                  ),

                  // Edit Icon Positioned at Bottom Right
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: GestureDetector(
                      onTap: () {
                        showEditProfileDialog(context);
                      },
                      child: CircleAvatar(
                        backgroundColor: theme.colorScheme.primary,
                        radius: editIconRadius,
                        child: Icon(
                          Icons.edit,
                          size: context.rIconSize(isSmallScreen ? 10 : 12),
                          color: theme.colorScheme.onPrimary,
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              SizedBox(height: context.rHeight(6)),

              // User Name
              Obx(() {
                return Text(
                  sessionController.username.value.isNotEmpty
                      ? sessionController.username.value
                      : "Complete your profile",
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    fontSize: context.rFontSize(isSmallScreen ? 16 : 18),
                  ),
                );
              }),

              // User Email
              Obx(() {
                return Text(
                  sessionController.emailId.value.isNotEmpty
                      ? sessionController.emailId.value
                      : "Complete your profile",
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurface.withOpacity(0.6),
                    fontSize: context.rFontSize(isSmallScreen ? 12 : 14),
                  ),
                );
              }),

              SizedBox(height: context.rHeight(isSmallScreen ? 2 : 6)),

              // Stats Row - Optimized for small screens
              Container(
                width:
                    screenWidth * 0.9, // 90% of screen width for better margins
                margin: EdgeInsets.only(top: context.rHeight(4)),
                padding: EdgeInsets.symmetric(
                  vertical: context.rHeight(isSmallScreen ? 6 : 8),
                  horizontal: context.rWidth(isSmallScreen ? 4 : 6),
                ),

                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Obx(() => _buildStatItem(
                            controller.walletBalance.value,
                            "Wallet Balance",
                            context,
                            isSmallScreen,
                          )),
                    ),
                    Container(
                      height: context.rHeight(isSmallScreen ? 25 : 30),
                      width: context.rWidth(1),
                      color: Colors.grey.shade300,
                    ),
                    Expanded(
                      child: Obx(() => _buildStatItem(
                            controller.totalsession.value,
                            "Total Session",
                            context,
                            isSmallScreen,
                          )),
                    ),
                    Container(
                      height: context.rHeight(isSmallScreen ? 25 : 30),
                      width: context.rWidth(1),
                      color: Colors.grey.shade300,
                    ),
                    Expanded(
                        child: _buildStatItem(
                            "Active", "Status", context, isSmallScreen)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStatItem(
      String value, String label, BuildContext context, bool isSmallScreen) {
    // Calculate responsive font sizes
    final double valueFontSize = isSmallScreen ? 14 : 16;
    final double labelFontSize = isSmallScreen ? 10 : 12;
    final double dotSize = isSmallScreen ? 8 : 10;
    final double dotSpacing = isSmallScreen ? 4 : 6;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (label == "Status") // Conditionally add green dot for "Status"
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: context.rWidth(dotSize),
                height: context.rHeight(dotSize),
                decoration: BoxDecoration(
                  color: Colors.green, // Green color for the dot
                  shape: BoxShape.circle, // Circular shape
                ),
              ),
              SizedBox(width: context.rWidth(dotSpacing)),
              Text(
                value,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  fontSize: context.rFontSize(valueFontSize),
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ],
          )
        else
          Text(
            value,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              fontSize: context.rFontSize(valueFontSize),
            ),
            textAlign: TextAlign.center,
            overflow: TextOverflow.ellipsis,
          ),
        SizedBox(height: context.rHeight(isSmallScreen ? 2 : 4)),
        Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurface.withOpacity(0.6),
            fontSize: context.rFontSize(labelFontSize),
          ),
          textAlign: TextAlign.center,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }
}

void showEditProfileDialog(BuildContext context) {
  final controller = Get.find<HeaderController>();
  final theme = Theme.of(context);
  final bool isSmallScreen = context.screenWidth < 375; // iPhone 8 and smaller

  // Fetch user details first
  controller.fetchprofile().then((_) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(context.rRadius(16)),
        ),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            left: context.rWidth(16),
            right: context.rWidth(16),
            bottom:
                MediaQuery.of(context).viewInsets.bottom + context.rHeight(16),
            top: context.rHeight(16),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Slide Indicator
              Container(
                width: context.rWidth(40),
                height: context.rHeight(5),
                decoration: BoxDecoration(
                  color: Colors.grey[400],
                  borderRadius: BorderRadius.circular(context.rRadius(12)),
                ),
              ),
              SizedBox(height: context.rHeight(8)),

              Text(
                "Complete your profile",
                style: TextStyle(
                  fontSize: context.rFontSize(isSmallScreen ? 16 : 18),
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: context.rHeight(4)),
              Text(
                "Username is required, phone number is optional",
                style: TextStyle(
                  fontSize: context.rFontSize(isSmallScreen ? 12 : 14),
                  color: theme.colorScheme.onSurface.withOpacity(0.6),
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: context.rHeight(12)),

              // Username Input Field (Shows fetched value or empty)
              UsernameInputField(
                controller: controller.usernameController,
              ),
              SizedBox(height: context.rHeight(12)),

              // Phone Number Input Field (Optional)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: EdgeInsets.only(
                        left: context.rWidth(4), bottom: context.rHeight(4)),
                    child: Text(
                      "Phone Number (Optional)",
                      style: TextStyle(
                        fontSize: context.rFontSize(isSmallScreen ? 12 : 14),
                        color: theme.colorScheme.onSurface.withOpacity(0.7),
                      ),
                    ),
                  ),
                  AdvancedPhoneNumberInput(
                    controller: controller.phoneNumberController,
                    onChanged: (phone) {},
                    onCountryChanged: (countryCode) {},
                  ),
                ],
              ),
              SizedBox(height: context.rHeight(16)),

              // Save Button
              Obx(() => CustomButton(
                    text: "Save",
                    onPressed: () {
                      controller.updateProfile();
                    },
                    isLoading: controller.isLoading.value,
                    borderRadius: context.rRadius(8),
                    textStyle: TextStyle(
                      fontSize: context.rFontSize(isSmallScreen ? 14 : 16),
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                    boxShadow: BoxShadow(
                      color: theme.primaryColor.withOpacity(0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  )),
            ],
          ),
        );
      },
    );
  });
}
