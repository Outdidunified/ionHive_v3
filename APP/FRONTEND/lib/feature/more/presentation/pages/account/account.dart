import 'package:flutter/material.dart';
import 'package:get/get.dart'; // Ensure you have GetX imported for Get.find() and Get.offAll()
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/auth/presentation/pages/login_page.dart';
import 'package:ionhive/feature/landing_page_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/account/presentation/pages/account_privacy_page.dart';

// Account Management Card Widget
class AccountManagementCard extends StatelessWidget {
  final ThemeData theme;

  const AccountManagementCard({super.key, required this.theme});

// Function to handle logout
  void handleLogout() {
    final landingPageController = Get.find<LandingPageController>();

    // Clear the page index
    landingPageController.clearPageIndex();
    Get.find<SessionController>().clearSession();
    Get.offAll(() => LoginPage());
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Card(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
        color: theme.cardColor,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Account',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Icon(Icons.manage_accounts, color: theme.primaryColor),
                ],
              ),
              const SizedBox(height: 16),
              _buildMenuOption(
                'Account Privacy',
                Icons.lock,
                theme,
                onTap: () {
                  Get.to(() => AccountAndPrivacyPage());
                },
              ),
              _buildMenuOption(
                'Logout',
                Icons.exit_to_app,
                theme,
                titleColor: Colors.red, // Set logout text to red
                onTap: handleLogout,
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Enhanced Menu Option Widget
  Widget _buildMenuOption(
    String title,
    IconData icon,
    ThemeData theme, {
    VoidCallback? onTap,
    Color? titleColor,
  }) {
    return InkWell(
      onTap: onTap,
      splashColor: theme.primaryColor.withOpacity(0.2),
      highlightColor: theme.primaryColor.withOpacity(0.1),
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10.0, horizontal: 8.0),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8.0),
              decoration: BoxDecoration(
                color: (titleColor ?? theme.primaryColor).withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child:
                  Icon(icon, color: titleColor ?? theme.primaryColor, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: titleColor ?? theme.textTheme.bodyLarge?.color,
                ),
              ),
            ),
            const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
          ],
        ),
      ),
    );
  }
}
