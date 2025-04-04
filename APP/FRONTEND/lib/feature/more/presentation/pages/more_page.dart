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
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/rfidpage.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/vehicle/presentation/pages/vehicle.dart';
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
    } else { void _launchURL() async {
      const url = 'https://www.ionhive.in/';
      if (await canLaunch(url)) {
        await launch(url);
      } else {
        throw 'Could not launch $url';
      }
    }
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
          HeaderCard(theme: theme,  userId: userId,
            username: username,
            emailId: emailId,
            token: token,),

          SizedBox(height: 10,),
          Expanded(
            child: ListView(
              padding: EdgeInsets.all(15),
              children: [
                // _buildInviteFriendsCard(theme),

                SizedBox(
                    height: 210,
                    child: BannerImage()),

                _buildSectionTitle('Manage '),


                _buildMenuOption('RFID', Icons.rss_feed, theme, onTap: () {
                  Get.to(() => RfidPage(
                    userId: userId,
                    username: username,
                    emailId: emailId,
                    token: token,
                  ));
                },), // RFID typically represented by a wireless signal icon
                _buildMenuOption('Vehicle', Icons.directions_car, theme, onTap: () {
                  Get.to(() => VehiclePage(
                    userId: userId,
                    username: username,
                    emailId: emailId,
                    token: token,
                  ));
                },), // Vehicle should use a car-related icon
                _buildMenuOption('Saved Device', Icons.devices, theme),
            


            
                SizedBox(height: 16),
                _buildSectionTitle('Stations'),
                _buildMenuOption('Saved Stations', Icons.bookmark, theme), // Bookmark icon for saved stations
                // _buildMenuOption('Captitative Stations', Icons.ev_station, theme), // EV station icon for captitative stations
            
                _buildSectionTitle('Transactions'),
                _buildMenuOption('Payment History', Icons.payment, theme, onTap: () {
                  Get.to(() => PaymentHistoryPage(
                    userId: userId,
                    username: username,
                    emailId: emailId,
                    token: token,
                  ));
                },),
                SizedBox(height: 16),
                _buildSectionTitle('Shop'),
                _buildMenuOption('Order a Device', Icons.shopping_cart, theme, onTap: _launchURL),

                SizedBox(height: 16),

                _buildSectionTitle('App'),
                Obx(() => SwitchListTile(
                  title: Text("Notification"),
                  subtitle: Text("Manage and stay updated with app alerts.",style: TextStyle(color: Colors.black38),),
                  value: moreController.isNotificationEnabled.value,
                  onChanged: (value) {
                    moreController.toggleNotification(value);
                  },
                )),

                SizedBox(height: 16),
                _buildSectionTitle('Help & Support'),
                _buildMenuOption('Contact Us', Icons.contact_support, theme,onTap: () {
                  Get.to(() => ContactUs());
                },),
                SizedBox(height: 16),
                _buildSectionTitle('Account'),
                _buildMenuOption('Privacy and Policy', Icons.privacy_tip, theme, onTap: () {
                  Get.to(() => AccountAndPrivacyPage());
                },),
                _buildMenuOption(
                  'Logout',
                  Icons.exit_to_app,
                  theme,
                  iconColor: Colors.red, // Set logout icon to red
                  titleColor: Colors.red, // Set logout text to red
                  onTap: handleLogout,
                ),


                const SizedBox(height: 20),
            FutureBuilder<String>(
              future: _getAppVersion(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return CircularProgressIndicator();
                }
                if (snapshot.hasData) {
                  return _buildFooter(snapshot.data!);
                } else {
                  return _buildFooter('Unknown Version');
                }
              },)
            
            
            
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
      padding: EdgeInsets.symmetric(vertical: 8),
      child: Text(title,
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.grey[600])
      ),
    );
  }

  Widget _buildMenuOption(
      String title,
      IconData icon,
      ThemeData theme, {
        Widget? trailing,
        Color? titleColor,
        Color? iconColor,
        VoidCallback? onTap,
      }) {
    bool isLogout = title.toLowerCase() == 'logout'; // Check if it's the logout option

    return InkWell(
      onTap: onTap,
      splashColor: isLogout ? Colors.red.withOpacity(0.2) : theme.primaryColor.withOpacity(0.2),
      highlightColor: isLogout ? Colors.red.withOpacity(0.1) : theme.primaryColor.withOpacity(0.1),
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10.0, horizontal: 8.0),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8.0),
              decoration: BoxDecoration(
                color: isLogout ? Colors.red.withOpacity(0.1) : theme.primaryColor.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                color: isLogout ? Colors.red : (iconColor ?? theme.primaryColor),
                size: 24,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: isLogout ? Colors.red : (titleColor ?? theme.textTheme.bodyLarge?.color),
                ),
              ),
            ),
            trailing ?? const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
          ],
        ),
      ),
    );
  }


  Widget _buildSwitchTile(String title, bool value, ThemeData theme,
      {String? subtitle, required Function(bool) onChanged}) {
    return SwitchListTile(
      title: Text(title, style: theme.textTheme.bodyLarge),
      subtitle: subtitle != null ? Text(subtitle, style: theme.textTheme.bodySmall) : null,
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
              textAlign: TextAlign.center, // Center the text inside the Row
              style: TextStyle(
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
