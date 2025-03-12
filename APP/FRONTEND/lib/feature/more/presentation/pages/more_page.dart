import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:package_info_plus/package_info_plus.dart'; // to Get Package Info
import 'package:ionhive/core/controllers/session_controller.dart'; // Session Controller

import 'package:ionhive/feature/more/presentation/pages/header/header.dart'; // Header
import 'package:ionhive/feature/more/presentation/pages/main_card/main_card.dart'; // Main
import 'package:ionhive/feature/more/presentation/pages/manage/manage.dart'; // manage All
import 'package:ionhive/feature/more/presentation/pages/trip/trip.dart'; // Trip
import 'package:ionhive/feature/more/presentation/pages/notification/notification.dart'; // Notifications
import 'package:ionhive/feature/more/presentation/pages/bluetooth_connection/bluetooth_connection.dart'; // Bluetooth connection page
import 'package:ionhive/feature/more/presentation/pages/help&support/help_support.dart'; // Help and Support
import 'package:ionhive/feature/more/presentation/pages/account/account.dart'; // Account

class MoreePage extends StatelessWidget {
  MoreePage({super.key});
  final sessionController = Get.find<SessionController>();

  // Fetch app version dynamically
  Future<String> _getAppVersion() async {
    PackageInfo packageInfo = await PackageInfo.fromPlatform();
    return packageInfo.version;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context); // Access theme inside build method

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: SingleChildScrollView(
        child: Column(
          children: [
            HeaderCard(theme: theme),
            const SizedBox(height: 20),
            MainCard(theme: theme),
            const SizedBox(height: 20),
            ManageAllCard(theme: theme),
            const SizedBox(height: 20),
            TripCard(theme: theme),
            const SizedBox(height: 20),
            NotificationCard(theme: theme),
            const SizedBox(height: 20),
            BluetoothDeviceCard(theme: theme),
            const SizedBox(height: 20),
            HelpandSupportcard(theme: theme),
            const SizedBox(height: 20),
            AccountManagementCard(theme: theme),
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
              },
            ),
          ],
        ),
      ),
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
