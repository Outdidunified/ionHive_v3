import 'package:flutter/material.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:get/get.dart';
import 'package:ionhive/feature/auth/presentation/pages/login_page.dart';
import 'package:ionhive/feature/landing_page_controller.dart';
import 'package:ionhive/feature/more/presentation/controllers/more_controllers.dart';
import 'package:ionhive/utils/responsive/responsive.dart';
import 'package:ionhive/utils/widgets/loading/loading_indicator.dart';
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
import 'package:ionhive/feature/more/presentation/pages/theme/theme_settings_page.dart';

class MoreePage extends StatelessWidget {
  final sessionController = Get.find<SessionController>();

  MoreePage({super.key});

  // Fetch app version dynamically
  Future<String> _getAppVersion() async {
    PackageInfo packageInfo = await PackageInfo.fromPlatform();
    return packageInfo.version;
  }

  void handleLogout() {
    // The controller is already registered in main.dart as permanent
    final landingPageController = Get.find<LandingPageController>();
    landingPageController.clearPageIndex();
    Get.find<SessionController>().clearSession();
    Get.offAll(() => LoginPage());
  }

  void _launchURL() async {
    const url = 'https://www.ionhive.in/';
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url));
    } else {
      throw 'Could not launch $url';
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final MoreController moreController = Get.put(MoreController());

    final userId = sessionController.userId.value;
    final username = sessionController.username.value;
    final emailId = sessionController.emailId.value;
    final token = sessionController.token.value;

    final bool isSmallScreen = context.screenWidth < 375;
    final bool isLargeScreen = context.screenWidth > 600;

    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      body: Column(
        children: [
          HeaderCard(
            theme: theme,
            userId: userId,
            username: username,
            emailId: emailId,
            token: token,
          ),
          SizedBox(
              height: context
                  .rHeight(isLargeScreen ? 20 : (isSmallScreen ? 12 : 100))),
          Expanded(
            child: ListView(
              padding: EdgeInsets.symmetric(
                horizontal: context
                    .rWidth(isLargeScreen ? 20 : (isSmallScreen ? 10 : 15)),
                vertical: context
                    .rHeight(isLargeScreen ? 12 : (isSmallScreen ? 6 : 8)),
              ),
              children: [
                SizedBox(
                  height: context.rHeight(
                      isLargeScreen ? 140 : (isSmallScreen ? 100 : 120)),
                  child: BannerImage(),
                ),
                SizedBox(
                    height: context.rHeight(
                        isLargeScreen ? 20 : (isSmallScreen ? 12 : 16))),
                _buildSectionTitle(
                    'Manage', context, isSmallScreen, isLargeScreen),
                _buildMenuOption(
                  'RFID',
                  Image.asset(
                    'assets/icons/rfid.png',
                    width: context
                        .rWidth(isLargeScreen ? 28 : (isSmallScreen ? 20 : 24)),
                    height: context.rHeight(
                        isLargeScreen ? 28 : (isSmallScreen ? 20 : 24)),
                    color: theme.primaryColor,
                  ),
                  theme,
                  context,
                  isSmallScreen,
                  isLargeScreen,
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
                    'assets/icons/charging-vehicle.png',
                    width: context
                        .rWidth(isLargeScreen ? 28 : (isSmallScreen ? 20 : 24)),
                    height: context.rHeight(
                        isLargeScreen ? 28 : (isSmallScreen ? 20 : 24)),
                    color: theme.primaryColor,
                  ),
                  theme,
                  context,
                  isSmallScreen,
                  isLargeScreen,
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
                    'assets/icons/saved_device.png',
                    width: context
                        .rWidth(isLargeScreen ? 28 : (isSmallScreen ? 20 : 24)),
                    height: context.rHeight(
                        isLargeScreen ? 28 : (isSmallScreen ? 20 : 24)),
                    color: theme.primaryColor,
                  ),
                  theme,
                  context,
                  isSmallScreen,
                  isLargeScreen,
                  onTap: () {
                    Get.to(() => SavedDevicepage(
                          userId: userId,
                          username: username,
                          emailId: emailId,
                          token: token,
                        ));
                  },
                ),
                SizedBox(
                    height: context.rHeight(
                        isLargeScreen ? 16 : (isSmallScreen ? 8 : 12))),
                _buildSectionTitle(
                    'Stations', context, isSmallScreen, isLargeScreen),
                _buildMenuOption(
                  'Saved Stations',
                  Image.asset(
                    'assets/icons/bookmark.png',
                    width: context
                        .rWidth(isLargeScreen ? 24 : (isSmallScreen ? 16 : 20)),
                    height: context.rHeight(
                        isLargeScreen ? 24 : (isSmallScreen ? 16 : 20)),
                    color: theme.primaryColor,
                  ),
                  theme,
                  context,
                  isSmallScreen,
                  isLargeScreen,
                  onTap: () {
                    Get.to(() => SavedStationsPages(
                          userId: userId,
                          username: username,
                          emailId: emailId,
                          token: token,
                        ));
                  },
                ),
                SizedBox(
                    height: context.rHeight(
                        isLargeScreen ? 16 : (isSmallScreen ? 8 : 12))),
                _buildSectionTitle(
                    'Transactions', context, isSmallScreen, isLargeScreen),
                _buildMenuOption(
                  'Payment History',
                  Image.asset(
                    'assets/icons/transaction-history.png',
                    width: context
                        .rWidth(isLargeScreen ? 28 : (isSmallScreen ? 20 : 24)),
                    height: context.rHeight(
                        isLargeScreen ? 28 : (isSmallScreen ? 20 : 24)),
                    color: theme.primaryColor,
                  ),
                  theme,
                  context,
                  isSmallScreen,
                  isLargeScreen,
                  onTap: () {
                    Get.to(() => PaymentHistoryPage(
                          userId: userId,
                          username: username,
                          emailId: emailId,
                          token: token,
                        ));
                  },
                ),
                SizedBox(
                    height: context.rHeight(
                        isLargeScreen ? 16 : (isSmallScreen ? 8 : 12))),
                _buildSectionTitle(
                    'Shop', context, isSmallScreen, isLargeScreen),
                _buildMenuOption(
                  'Order a Device',
                  Image.asset(
                    'assets/icons/shopping-bag.png',
                    width: context
                        .rWidth(isLargeScreen ? 28 : (isSmallScreen ? 20 : 24)),
                    height: context.rHeight(
                        isLargeScreen ? 28 : (isSmallScreen ? 20 : 24)),
                    color: theme.primaryColor,
                  ),
                  theme,
                  context,
                  isSmallScreen,
                  isLargeScreen,
                  onTap: _launchURL,
                ),
                SizedBox(
                    height: context.rHeight(
                        isLargeScreen ? 16 : (isSmallScreen ? 8 : 12))),
                _buildSectionTitle(
                    'App settings', context, isSmallScreen, isLargeScreen),
                Obx(() => SwitchListTile(
                      title: Text(
                        "Notification",
                        style: TextStyle(
                          fontSize: MediaQuery.of(context).size.height *
                              0.018, // ~16.2 pixels on a 600-pixel-high screen
                        ),
                      ),
                      subtitle: Text(
                        moreController.isNotificationAvailable.value
                            ? "Manage and stay updated with app alerts."
                            : "Notifications are disabled in app settings.",
                        style: TextStyle(
                          fontSize: MediaQuery.of(context).size.height *
                              0.015, // ~12 pixels on a 600-pixel-high screen
                          color: moreController.isNotificationAvailable.value
                              ? theme.textTheme.bodyLarge?.color
                              : Colors.red[300],
                        ),
                      ),
                      value: moreController.isNotificationEnabled.value,
                      onChanged: moreController.isNotificationAvailable.value
                          ? (value) {
                              moreController.toggleNotification(value);
                            }
                          : null,
                      activeColor: theme.primaryColor,
                      inactiveTrackColor:
                          moreController.isNotificationAvailable.value
                              ? null
                              : Colors.grey[300],
                    )),
                _buildMenuOption(
                  'Theme Settings',
                  Icon(
                    Icons.color_lens,
                    color: theme.primaryColor,
                    size: context.rIconSize(
                        isLargeScreen ? 28 : (isSmallScreen ? 20 : 24)),
                  ),
                  theme,
                  context,
                  isSmallScreen,
                  isLargeScreen,
                  onTap: () {
                    Get.to(() => ThemeSettingsPage());
                  },
                ),
                SizedBox(
                    height: context.rHeight(
                        isLargeScreen ? 16 : (isSmallScreen ? 8 : 12))),
                _buildSectionTitle(
                    'Help & Support', context, isSmallScreen, isLargeScreen),
                _buildMenuOption(
                  'Contact Us',
                  Image.asset(
                    'assets/icons/contact.png',
                    width: context
                        .rWidth(isLargeScreen ? 28 : (isSmallScreen ? 20 : 24)),
                    height: context.rHeight(
                        isLargeScreen ? 28 : (isSmallScreen ? 20 : 24)),
                    color: theme.primaryColor,
                  ),
                  theme,
                  context,
                  isSmallScreen,
                  isLargeScreen,
                  onTap: () {
                    Get.to(() => ContactUs());
                  },
                ),
                SizedBox(
                    height: context.rHeight(
                        isLargeScreen ? 16 : (isSmallScreen ? 8 : 12))),
                _buildSectionTitle(
                    'Account', context, isSmallScreen, isLargeScreen),
                _buildMenuOption(
                  'Privacy and Policy',
                  Image.asset(
                    'assets/icons/insurance.png',
                    width: context
                        .rWidth(isLargeScreen ? 28 : (isSmallScreen ? 20 : 24)),
                    height: context.rHeight(
                        isLargeScreen ? 28 : (isSmallScreen ? 20 : 24)),
                    color: theme.primaryColor,
                  ),
                  theme,
                  context,
                  isSmallScreen,
                  isLargeScreen,
                  onTap: () {
                    Get.to(() => AccountAndPrivacyPage());
                  },
                ),
                _buildMenuOption(
                  'Logout',
                  Image.asset(
                    'assets/icons/logout.png',
                    width: context
                        .rWidth(isLargeScreen ? 28 : (isSmallScreen ? 20 : 24)),
                    height: context.rHeight(
                        isLargeScreen ? 28 : (isSmallScreen ? 20 : 24)),
                    color: Colors.red,
                  ),
                  theme,
                  context,
                  isSmallScreen,
                  isLargeScreen,
                  iconColor: Colors.red,
                  titleColor: Colors.red,
                  onTap: handleLogout,
                ),
                SizedBox(
                    height: context.rHeight(
                        isLargeScreen ? 24 : (isSmallScreen ? 16 : 20))),
                FutureBuilder<String>(
                  future: _getAppVersion(),
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return LoadingIndicator(
                          size: context.rWidth(
                              isLargeScreen ? 40 : (isSmallScreen ? 20 : 30)));
                    }
                    if (snapshot.hasData) {
                      return _buildFooter(snapshot.data!, context,
                          isSmallScreen, isLargeScreen);
                    } else {
                      return _buildFooter('Unknown Version', context,
                          isSmallScreen, isLargeScreen);
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

  Widget _buildSectionTitle(String title, BuildContext context,
      bool isSmallScreen, bool isLargeScreen) {
    return Padding(
      padding: EdgeInsets.symmetric(
          vertical:
              context.rHeight(isLargeScreen ? 10 : (isSmallScreen ? 6 : 8))),
      child: Text(
        title,
        style: TextStyle(
          fontSize:
              context.rFontSize(isLargeScreen ? 18 : (isSmallScreen ? 14 : 16)),
          fontWeight: FontWeight.bold,
          color: Colors.grey,
        ),
      ),
    );
  }

  Widget _buildMenuOption(
    String title,
    Widget icon,
    ThemeData theme,
    BuildContext context,
    bool isSmallScreen,
    bool isLargeScreen, {
    Widget? trailing,
    Color? titleColor,
    Color? iconColor,
    VoidCallback? onTap,
  }) {
    bool isLogout = title.toLowerCase() == 'logout';

    return InkWell(
      onTap: onTap,
      splashColor: isLogout
          ? Colors.red.withOpacity(0.2)
          : theme.primaryColor.withOpacity(0.2),
      highlightColor: isLogout
          ? Colors.red.withOpacity(0.1)
          : theme.primaryColor.withOpacity(0.1),
      borderRadius: BorderRadius.circular(context.rRadius(10)),
      child: Padding(
        padding: EdgeInsets.symmetric(
          vertical:
              context.rHeight(isLargeScreen ? 10 : (isSmallScreen ? 6 : 8)),
          horizontal:
              context.rWidth(isLargeScreen ? 10 : (isSmallScreen ? 6 : 8)),
        ),
        child: Row(
          children: [
            Container(
              padding: EdgeInsets.all(
                  context.rWidth(isLargeScreen ? 10 : (isSmallScreen ? 6 : 8))),
              decoration: BoxDecoration(
                color: isLogout
                    ? Colors.red.withOpacity(0.1)
                    : theme.primaryColor.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: icon,
            ),
            SizedBox(
                width: context
                    .rWidth(isLargeScreen ? 20 : (isSmallScreen ? 12 : 16))),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontSize: context.rFontSize(
                      isLargeScreen ? 18 : (isSmallScreen ? 14 : 16)),
                  fontWeight: FontWeight.w500,
                  color: isLogout
                      ? Colors.red
                      : (titleColor ?? theme.textTheme.bodyLarge?.color),
                ),
              ),
            ),
            trailing ??
                Icon(
                  Icons.chevron_right,
                  size: context.rIconSize(
                      isLargeScreen ? 24 : (isSmallScreen ? 16 : 20)),
                  color: Colors.grey,
                ),
          ],
        ),
      ),
    );
  }

  Widget _buildFooter(String version, BuildContext context, bool isSmallScreen,
      bool isLargeScreen) {
    return Align(
      alignment: Alignment.center,
      child: Padding(
        padding: EdgeInsets.all(
            context.rWidth(isLargeScreen ? 20 : (isSmallScreen ? 12 : 16))),
        child: Text(
          'Powered by Outdid \n Version $version',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: context
                .rFontSize(isLargeScreen ? 16 : (isSmallScreen ? 12 : 14)),
            color: Colors.grey,
          ),
        ),
      ),
    );
  }
}
