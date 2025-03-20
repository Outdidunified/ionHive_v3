import 'package:flutter/material.dart';

class ManageAllCard extends StatelessWidget {
  final ThemeData theme;

  const ManageAllCard({super.key, required this.theme});

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
                    'Manage',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Icon(Icons.manage_history, color: theme.primaryColor),
                ],
              ),
              const SizedBox(height: 16),
              _buildMenuOption(
                'Vehicle',
                Icons.directions_car,
                theme,
                onTap: () {
                  // Navigate to the Bluetooth page
                  // Get.to(() => BluetoothPage());
                },
              ),
              _buildMenuOption(
                'RFID',
                Icons.nfc,
                theme,
                onTap: () {
                  // Navigate to the Bluetooth page
                  // Get.to(() => BluetoothPage());
                },
              ),
              _buildMenuOption(
                'Devices',
                Icons.devices,
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
