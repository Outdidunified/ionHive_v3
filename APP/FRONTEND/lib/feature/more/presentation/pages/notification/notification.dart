import 'package:flutter/material.dart';

class NotificationCard extends StatelessWidget {
  final ThemeData theme;

  const NotificationCard({super.key, required this.theme});

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
              _buildMenuOption(
                'Notifications',
                Icons.notification_important_outlined,
                theme,
                onTap: () {
                  // Navigate to the Bluetooth page
                  // Get.to(() => BluetoothPage());
                },
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
