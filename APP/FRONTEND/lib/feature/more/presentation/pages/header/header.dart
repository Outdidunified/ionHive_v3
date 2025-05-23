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

  HeaderCard({
    super.key,
    required this.theme,
    required this.userId,
    required this.username,
    required this.emailId,
    required this.token,
  });

  final sessionController = Get.find<SessionController>();
  // Use lazyPut to ensure the controller is only created once
  HeaderController get controller {
    if (!Get.isRegistered<HeaderController>()) {
      Get.put(HeaderController());
    }
    return Get.find<HeaderController>();
  }

  @override
  Widget build(BuildContext context) {
    final double screenWidth = context.screenWidth;
    final bool isSmallScreen = screenWidth < 375;
    final bool isLargeScreen = screenWidth > 600;

    // Fetch data when the widget is built (only once)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // Delay the fetch to ensure everything is properly initialized
      Future.delayed(const Duration(milliseconds: 500), () {
        // Use try-catch instead of mounted check
        try {
          controller.fetchHeaderData();
        } catch (e) {
          debugPrint("Error fetching header data: $e");
        }
      });
    });

    // Calculate responsive dimensions
    final double gradientHeight =
        context.rHeight(isLargeScreen ? 260 : (isSmallScreen ? 180 : 180));
    final double whiteBackgroundHeight =
        context.rHeight(isLargeScreen ? 140 : (isSmallScreen ? 112 : 120));
    // final double profileTopPosition =
    //     (gradientHeight - whiteBackgroundHeight) / 0.83 -
    //         context.rHeight(isLargeScreen ? 30 : (isSmallScreen ? 20 : 0.01));
    final double profileTopPosition =
        (gradientHeight - whiteBackgroundHeight) / 0.83 -
            context.rHeight(isLargeScreen ? 30 : (isSmallScreen ? 5 : 0.01));
    final double avatarRadius =
        context.rWidth(isLargeScreen ? 50 : (isSmallScreen ? 30 : 40));
    final double editIconRadius =
        context.rWidth(isLargeScreen ? 18 : (isSmallScreen ? 12 : 15));

    return Stack(
      alignment: Alignment.topCenter,
      clipBehavior: Clip.none,
      children: [
        // Gradient Background from Theme
        Container(
          width: double.infinity,
          height: gradientHeight,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                theme.colorScheme.primary, // Green in both themes
                Colors.black, // Green[800] in both themes
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
              color: theme
                  .colorScheme.background, // White in light, #121212 in dark
              borderRadius: BorderRadius.only(
                topLeft:
                    Radius.circular(context.rRadius(isLargeScreen ? 50 : 40)),
                topRight:
                    Radius.circular(context.rRadius(isLargeScreen ? 50 : 40)),
              ),
            ),
          ),
        ),

        // Profile Image & User Details
        Positioned(
          top: profileTopPosition,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Stack(
                clipBehavior: Clip.none,
                children: [
                  // Profile Image with Border
                  Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: theme.primaryColor, // Green in both themes
                        width: context.rWidth(isLargeScreen ? 3 : 2.5),
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
                        backgroundColor:
                            theme.colorScheme.primary, // Green in both themes
                        radius: editIconRadius,
                        child: Icon(
                          Icons.edit,
                          size: context.rIconSize(
                              isLargeScreen ? 16 : (isSmallScreen ? 10 : 12)),
                          color: theme.colorScheme
                              .onPrimary, // White in both themes (on primary)
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              SizedBox(
                  height: context
                      .rHeight(isLargeScreen ? 10 : (isSmallScreen ? 4 : 6))),

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
                  textAlign: TextAlign.center,
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
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
                  textAlign: TextAlign.center,
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                );
              }),

              SizedBox(
                  height: context
                      .rHeight(isLargeScreen ? 10 : (isSmallScreen ? 2 : 6))),

              // Stats Row - Optimized for all screen sizes
              Container(
                width: screenWidth * (isLargeScreen ? 0.85 : 0.9),
                margin: EdgeInsets.only(
                    top: context.rHeight(isLargeScreen ? 8 : 4)),
                padding: EdgeInsets.symmetric(
                  vertical: context
                      .rHeight(isLargeScreen ? 12 : (isSmallScreen ? 4 : 8)),
                  horizontal: context
                      .rWidth(isLargeScreen ? 12 : (isSmallScreen ? 2 : 6)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    Expanded(
                      child: Obx(() => _buildStatItem(
                            controller.walletBalance.value,
                            "Wallet Balance",
                            context,
                            isSmallScreen,
                            isLargeScreen,
                          )),
                    ),
                    Container(
                      height: context.rHeight(
                          isLargeScreen ? 40 : (isSmallScreen ? 20 : 30)),
                      width: context.rWidth(1),
                      color: theme
                          .dividerColor, // Grey[300] in light, #303030 in dark
                    ),
                    Expanded(
                      child: Obx(() => _buildStatItem(
                            controller.totalsession.value,
                            "Total Session",
                            context,
                            isSmallScreen,
                            isLargeScreen,
                          )),
                    ),
                    Container(
                      height: context.rHeight(
                          isLargeScreen ? 40 : (isSmallScreen ? 20 : 30)),
                      width: context.rWidth(1),
                      color: theme
                          .dividerColor, // Grey[300] in light, #303030 in dark
                    ),
                    Expanded(
                      child: _buildStatItem(
                        "Active",
                        "Status",
                        context,
                        isSmallScreen,
                        isLargeScreen,
                      ),
                    ),
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
    String value,
    String label,
    BuildContext context,
    bool isSmallScreen,
    bool isLargeScreen,
  ) {
    final double valueFontSize = isLargeScreen ? 18 : (isSmallScreen ? 12 : 16);
    final double labelFontSize = isLargeScreen ? 14 : (isSmallScreen ? 9 : 12);
    final double dotSize = isLargeScreen ? 12 : (isSmallScreen ? 6 : 10);
    final double dotSpacing = isLargeScreen ? 8 : (isSmallScreen ? 3 : 6);

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (label == "Status")
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: context.rWidth(dotSize),
                height: context.rHeight(dotSize),
                decoration: const BoxDecoration(
                  color: Colors.green, // Fixed green dot for status
                  shape: BoxShape.circle,
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
        SizedBox(
            height:
                context.rHeight(isLargeScreen ? 6 : (isSmallScreen ? 1 : 4))),
        Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurface.withOpacity(0.6),
            fontSize: context.rFontSize(labelFontSize),
          ),
          textAlign: TextAlign.center,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }

  void showEditProfileDialog(BuildContext context) {
    final controller = Get.find<HeaderController>();
    final theme = Theme.of(context);
    final bool isSmallScreen = context.screenWidth < 375;
    final bool isLargeScreen = context.screenWidth > 600;

    controller.fetchprofile().then((_) {
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(context.rRadius(isLargeScreen ? 20 : 16)),
          ),
        ),
        backgroundColor: theme.colorScheme.surface, // Surface color for modal
        builder: (context) {
          return Padding(
            padding: EdgeInsets.only(
              left: context.rWidth(isLargeScreen ? 24 : 16),
              right: context.rWidth(isLargeScreen ? 24 : 16),
              bottom: MediaQuery.of(context).viewInsets.bottom +
                  context.rHeight(isLargeScreen ? 24 : 16),
              top: context.rHeight(isLargeScreen ? 24 : 16),
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: context.rWidth(isLargeScreen ? 50 : 40),
                    height: context.rHeight(isLargeScreen ? 6 : 5),
                    decoration: BoxDecoration(
                      color: theme
                          .dividerColor, // Grey[300] in light, #303030 in dark
                      borderRadius: BorderRadius.circular(context.rRadius(12)),
                    ),
                  ),
                  SizedBox(height: context.rHeight(isLargeScreen ? 12 : 8)),
                  Text(
                    "Complete your profile",
                    style: theme.textTheme.headlineMedium?.copyWith(
                      fontSize: context.rFontSize(
                          isLargeScreen ? 20 : (isSmallScreen ? 14 : 18)),
                      fontWeight: FontWeight.bold,
                      color: theme.textTheme.headlineMedium
                          ?.color, // Black in light, white in dark
                    ),
                  ),
                  SizedBox(height: context.rHeight(isLargeScreen ? 6 : 4)),
                  Text(
                    "Username is required, phone number is optional",
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontSize: context.rFontSize(
                          isLargeScreen ? 16 : (isSmallScreen ? 10 : 14)),
                      color: theme.textTheme.bodyMedium?.color
                          ?.withOpacity(0.6), // Adjusted opacity
                    ),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: context.rHeight(isLargeScreen ? 16 : 12)),
                  UsernameInputField(
                    controller: controller.usernameController,
                  ),
                  SizedBox(height: context.rHeight(isLargeScreen ? 16 : 12)),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: EdgeInsets.only(
                          left: context.rWidth(4),
                          bottom: context.rHeight(isLargeScreen ? 6 : 4),
                        ),
                        child: Text(
                          "Phone Number (Optional)",
                          style: theme.textTheme.bodyMedium?.copyWith(
                            fontSize: context.rFontSize(
                                isLargeScreen ? 16 : (isSmallScreen ? 12 : 14)),
                            color: theme.textTheme.bodyMedium?.color
                                ?.withOpacity(0.7),
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
                  SizedBox(height: context.rHeight(isLargeScreen ? 24 : 16)),
                  Obx(() => CustomButton(
                        text: "Save",
                        onPressed: controller.isFormValid.value &&
                                !controller.isLoading.value
                            ? () {
                                controller.updateProfile();
                              }
                            : null, // Disable button when form is invalid or loading
                        isLoading: controller.isLoading.value,
                        borderRadius: context.rRadius(isLargeScreen ? 12 : 8),
                        textStyle: theme.textTheme.titleLarge!.copyWith(
                          fontSize: context.rFontSize(
                              isLargeScreen ? 18 : (isSmallScreen ? 12 : 16)),
                          fontWeight: FontWeight.bold,
                          color: controller.isFormValid.value
                              ? theme.colorScheme
                                  .onPrimary // White on primary when enabled
                              : theme.colorScheme.onSurface
                                  .withOpacity(0.5), // Dimmed when disabled
                        ),
                        padding: EdgeInsets.symmetric(
                          vertical: context.rHeight(
                              isLargeScreen ? 16 : (isSmallScreen ? 8 : 12)),
                          horizontal: context.rWidth(
                              isLargeScreen ? 40 : (isSmallScreen ? 20 : 30)),
                        ),
                        boxShadow: controller.isFormValid.value
                            ? BoxShadow(
                                color: theme.primaryColor.withOpacity(0.3),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              )
                            : null, // No shadow when disabled
                      )),
                  SizedBox(height: context.rHeight(isLargeScreen ? 16 : 8)),
                ],
              ),
            ),
          );
        },
      );
    });
  }
}
