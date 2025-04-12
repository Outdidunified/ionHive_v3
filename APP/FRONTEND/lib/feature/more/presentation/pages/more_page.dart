import 'package:flutter/material.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:get/get.dart';
import 'package:ionhive/feature/auth/presentation/pages/login_page.dart';
import 'package:ionhive/feature/landing_page_controller.dart';
import 'package:ionhive/feature/more/presentation/controllers/more_controllers.dart';
import 'package:ionhive/feature/more/presentation/pages/account/presentation/pages/account_privacy_page.dart';
import 'package:ionhive/feature/more/presentation/pages/banner_image/banner_image.dart';
import 'package:ionhive/feature/more/presentation/pages/header/header.dart';
import 'package:ionhive/feature/more/presentation/pages/help&support/presentation/pages/contact%20us.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/Saved_Device/presentation/pages/saved_device.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/rfidpage.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/vehicle/presentation/pages/vehicle.dart';
import 'package:ionhive/feature/more/presentation/pages/saved_stations/presentation/pages/saved_stations_pages.dart';
import 'package:ionhive/feature/more/presentation/pages/transactions/presentation/pages/paymenthistory.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:fui_kit/fui_kit.dart';

class MoreePage extends StatelessWidget {
  final sessionController = Get.find<SessionController>();

  // Fetch app version dynamically
  Future<String> _getAppVersion() async {
    PackageInfo packageInfo = await PackageInfo.fromPlatform();
    return packageInfo.version;
  }

  void handleLogout() {
    if (!Get.isRegistered<LandingPageController>()) {
      Get.put(LandingPageController()); // Register if not already registered
    }

    final landingPageController = Get.find<LandingPageController>();

    // Clear the page index
    landingPageController.clearPageIndex();
    Get.find<SessionController>().clearSession();
    Get.offAll(() => LoginPage());
  }

  void _launchURL() async {
    const url = 'https://www.ionhive.in/';
    if (await canLaunch(url)) {
      await launch(url);
    } else {
      throw 'Could not launch $url';
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final MoreController moreController = Get.put(MoreController());

    final isLoggedIn = sessionController.isLoggedIn.value;
    final userId = sessionController.userId.value;
    final username = sessionController.username.value;
    final emailId = sessionController.emailId.value;
    final token = sessionController.token.value;

    return Scaffold(
      body: Column(
        children: [
          HeaderCard(
            theme: theme,
            userId: userId,
            username: username,
            emailId: emailId,
            token: token,
          ),
          const SizedBox(height: 10),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(15),
              children: [
                // _buildInviteFriendsCard(theme), // Commented out as per original code
                SizedBox(
                  height: 210,
                  child: BannerImage(),
                ),
                _buildSectionTitle('Manage'),
                _buildMenuOption(
                  'RFID',
                  Image.asset(
                    'assets/icons/rfid.png', // Replace with your actual asset filename
                    width: 24, // Match the size of the previous Icon (24)
                    height: 24,
                    color: theme
                        .primaryColor, // Optional: Match the icon color if needed
                  ),
                  theme,
                  onTap: () {
                    Get.to(() => RfidPage(
                          userId: userId,
                          username: username,
                          emailId: emailId,
                          token: token,
                        ));
                  },
                ),
                _buildMenuOption(
                  'Vehicle',
                  Image.asset(
                    'assets/icons/charging-vehicle.png', // Replace with your actual asset filename
                    width: 24, // Match the size of the previous Icon (24)
                    height: 24,
                    color: theme
                        .primaryColor, // Optional: Match the icon color if needed
                  ),
                  theme,
                  onTap: () {
                    Get.to(() => VehiclePage(
                          userId: userId,
                          username: username,
                          emailId: emailId,
                          token: token,
                        ));
                  },
                ),
                _buildMenuOption(
                  'Saved Device',
                  Image.asset(
                    'assets/icons/saved_device.png', // Replace with your actual asset filename
                    width: 24, // Match the size of the previous Icon (24)
                    height: 24,
                    color: theme
                        .primaryColor, // Optional: Match the icon color if needed
                  ),
                  theme,
                  onTap: () {
                    Get.to(() => SavedDevicepage(
                          userId: userId,
                          username: username,
                          emailId: emailId,
                          token: token,
                        ));
                  },
                ),
                const SizedBox(height: 16),
                _buildSectionTitle('Stations'),
                _buildMenuOption(
                  'Saved Stations',
                  Image.asset(
                    'assets/icons/bookmark.png', // Replace with your actual asset filename
                    width: 20, // Match the size of the previous Icon (24)
                    height: 20,
                    color: theme
                        .primaryColor, // Optional: Match the icon color if needed
                  ),
                  theme,
                  onTap: () {
                    Get.to(() => SavedStationsPages(
                          userId: userId,
                          username: username,
                          emailId: emailId,
                          token: token,
                        ));
                  },
                ),
                // _buildMenuOption('Captitative Stations', Icons.ev_station, theme), // Commented out as per original code
                _buildSectionTitle('Transactions'),
                _buildMenuOption(
                  'Payment History',
                  Image.asset(
                    'assets/icons/transaction-history.png', // Replace with your actual asset filename
                    width: 24, // Match the size of the previous Icon (24)
                    height: 24,
                    color: theme
                        .primaryColor, // Optional: Match the icon color if needed
                  ),
                  theme,
                  onTap: () {
                    Get.to(() => PaymentHistoryPage(
                          userId: userId,
                          username: username,
                          emailId: emailId,
                          token: token,
                        ));
                  },
                ),
                const SizedBox(height: 16),
                _buildSectionTitle('Shop'),
                _buildMenuOption(
                  'Order a Device',
                  Image.asset(
                    'assets/icons/shopping-bag.png', // Replace with your actual asset filename
                    width: 24, // Match the size of the previous Icon (24)
                    height: 24,
                    color: theme
                        .primaryColor, // Optional: Match the icon color if needed
                  ),
                  theme,
                  onTap: _launchURL,
                ),
                const SizedBox(height: 16),
                _buildSectionTitle('App'),
                Obx(() => SwitchListTile(
                      title: const Text("Notification"),
                      subtitle: Text(
                        moreController.isNotificationAvailable.value
                            ? "Manage and stay updated with app alerts."
                            : "Notifications are disabled in app settings.",
                        style: TextStyle(
                          color: moreController.isNotificationAvailable.value
                              ? Colors.black38
                              : Colors.red[300],
                        ),
                      ),
                      value: moreController.isNotificationEnabled.value,
                      onChanged: moreController.isNotificationAvailable.value
                          ? (value) {
                              moreController.toggleNotification(value);
                            }
                          : null, // Disable the switch if notifications are not available
                      activeColor: theme.primaryColor,
                      inactiveTrackColor:
                          moreController.isNotificationAvailable.value
                              ? null
                              : Colors.grey[300],
                    )),
                const SizedBox(height: 16),
                _buildSectionTitle('Help & Support'),
                _buildMenuOption(
                  'Contact Us',
                  Image.asset(
                    'assets/icons/contact.png', // Replace with your actual asset filename
                    width: 24, // Match the size of the previous Icon (24)
                    height: 24,
                    color: theme
                        .primaryColor, // Optional: Match the icon color if needed
                  ),
                  theme,
                  onTap: () {
                    Get.to(() => ContactUs());
                  },
                ),
                const SizedBox(height: 16),
                _buildSectionTitle('Account'),
                _buildMenuOption(
                  'Privacy and Policy',
                  Image.asset(
                    'assets/icons/insurance.png', // Replace with your actual asset filename
                    width: 24, // Match the size of the previous Icon (24)
                    height: 24,
                    color: theme
                        .primaryColor, // Optional: Match the icon color if needed
                  ),
                  theme,
                  onTap: () {
                    Get.to(() => AccountAndPrivacyPage());
                  },
                ),
                _buildMenuOption(
                  'Logout',
                  Image.asset(
                    'assets/icons/logout.png', // Replace with your actual asset filename
                    width: 24, // Match the size of the previous Icon (24)
                    height: 24,
                    color:
                        Colors.red, // Optional: Match the icon color if needed
                  ),
                  theme,
                  iconColor: Colors.red,
                  titleColor: Colors.red,
                  onTap: handleLogout,
                ),
                const SizedBox(height: 20),
                FutureBuilder<String>(
                  future: _getAppVersion(),
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const CircularProgressIndicator();
                    }
                    if (snapshot.hasData) {
                      return _buildFooter(snapshot.data!);
                    } else {
                      return _buildFooter('Unknown Version');
                    }
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ✅ Section Title Function (No Changes)
  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Text(
        title,
        style: const TextStyle(
            fontSize: 16, fontWeight: FontWeight.bold, color: Colors.grey),
      ),
    );
  }

  Widget _buildMenuOption(
    String title,
    Widget icon, // Changed from IconData to Widget
    ThemeData theme, {
    Widget? trailing,
    Color? titleColor,
    Color? iconColor,
    VoidCallback? onTap,
  }) {
    bool isLogout =
        title.toLowerCase() == 'logout'; // Check if it's the logout option
    final effectiveIconColor =
        iconColor ?? (isLogout ? Colors.red : theme.primaryColor);

    return InkWell(
      onTap: onTap,
      splashColor: isLogout
          ? Colors.red.withOpacity(0.2)
          : theme.primaryColor.withOpacity(0.2),
      highlightColor: isLogout
          ? Colors.red.withOpacity(0.1)
          : theme.primaryColor.withOpacity(0.1),
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10.0, horizontal: 8.0),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8.0),
              decoration: BoxDecoration(
                color: isLogout
                    ? (iconColor ?? Colors.red)
                        .withOpacity(0.1) // Red background for logout
                    : theme.primaryColor.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: icon, // Use the widget directly
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: isLogout
                      ? Colors.red
                      : (titleColor ?? theme.textTheme.bodyLarge?.color),
                ),
              ),
            ),
            trailing ??
                const Icon(Icons.arrow_forward_ios,
                    size: 16, color: Colors.grey),
          ],
        ),
      ),
    );
  }

  Widget _buildSwitchTile(String title, bool value, ThemeData theme,
      {String? subtitle, required Function(bool) onChanged}) {
    return SwitchListTile(
      title: Text(title, style: theme.textTheme.bodyLarge),
      subtitle: subtitle != null
          ? Text(subtitle, style: theme.textTheme.bodySmall)
          : null,
      value: value,
      onChanged: (bool newValue) => onChanged(newValue),
      activeColor: theme.colorScheme.primary,
    );
  }

  Widget _buildFooter(String version) {
    return Align(
      alignment: Alignment.bottomCenter,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Powered by Outdid \n Version $version',
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 14,
                color: Colors.grey,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
