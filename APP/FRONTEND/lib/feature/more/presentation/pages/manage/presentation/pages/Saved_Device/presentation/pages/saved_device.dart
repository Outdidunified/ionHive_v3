import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/feature/landing_page.dart';
import 'package:ionhive/feature/landing_page_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/Saved_Device/presentation/controllers/saved_device_controllers.dart';
import 'package:ionhive/utils/widgets/loading/loading_indicator.dart';

class SavedDevicepage extends StatelessWidget {
  final int userId;
  final String username;
  final String emailId;
  final String token;

  const SavedDevicepage({
    super.key,
    required this.userId,
    required this.username,
    required this.emailId,
    required this.token,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final bool isDarkTheme = theme.brightness == Brightness.dark;
    final SavedDeviceControllers controller = Get.put(SavedDeviceControllers());

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Saved Devices',
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
            fontSize: 20,
            color: isDarkTheme ? Colors.white : Colors.black,
          ),
        ),
        centerTitle: true,
        backgroundColor: isDarkTheme ? const Color(0xFF121212) : Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back,
            color: isDarkTheme ? Colors.white : Colors.black,
          ),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      backgroundColor: isDarkTheme ? const Color(0xFF121212) : Colors.white,
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Obx(() {
          if (controller.isLoading.value) {
            return const LoadingIndicator();
          } else if (controller.errorMessage.value.isNotEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Image.asset(
                    'assets/icons/error-history.png',
                    width: 200,
                    height: 200,
                    color: isDarkTheme ? Colors.white : null,
                  ),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.info_outline,
                        color: isDarkTheme ? Colors.white70 : Colors.grey,
                        size: 14,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        "Couldn't reach server",
                        style: theme.textTheme.bodyMedium?.copyWith(
                          fontSize: 12,
                          color:
                              isDarkTheme ? Colors.white70 : Colors.grey[700],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          } else if (controller.savedDevices.isEmpty) {
            final screenWidth = MediaQuery.of(context).size.width;
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Image.asset(
                    'assets/icons/save_device.png', // Replace with actual device icon asset
                    width: screenWidth * 0.3,
                    height: screenWidth * 0.3,
                    errorBuilder: (context, error, stackTrace) {
                      return Icon(
                        Icons.devices_other,
                        size: 60,
                        color: isDarkTheme ? Colors.white70 : Colors.grey[600],
                      );
                    },
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'No Saved Devices',
                    style: theme.textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: isDarkTheme ? Colors.white : Colors.black87,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 10),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20.0),
                    child: Text(
                      'You haven’t saved any devices yet. Start exploring devices and save your favorites to access them quickly!',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: isDarkTheme ? Colors.white70 : Colors.grey[600],
                        fontSize: 14,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: () {
                      Get.to(
                        () => LandingPage(),
                        transition: Transition.rightToLeft,
                        duration: const Duration(milliseconds: 300),
                      );
                      final LandingPageController landingController =
                          Get.find<LandingPageController>();
                      landingController.clearPageIndex();
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: theme.colorScheme.primary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 10,
                      ),
                    ),
                    child: Text(
                      'Explore Devices',
                      style: theme.textTheme.labelLarge?.copyWith(
                        color: theme.colorScheme.onPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            );
          } else {
            return ListView.builder(
              itemCount: controller.savedDevices.length,
              itemBuilder: (context, index) {
                final device = controller.savedDevices[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10.0),
                  child: DeviceCard(device: device),
                );
              },
            );
          }
        }),
      ),
    );
  }
}

class DeviceCard extends StatelessWidget {
  final Map<String, dynamic> device;

  const DeviceCard({super.key, required this.device});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final width = MediaQuery.of(context).size.width;

    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(
          color: Colors.grey,
          width: 0.6,
        ),
      ),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            /// Top section with title + favorite icon
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                /// Title and info section
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${device['vendor'] ?? 'Unknown'} | ${device['charger_id']}',
                        style: theme.textTheme.bodyLarge?.copyWith(
                          fontWeight: FontWeight.w600,
                          fontSize: width * 0.038,
                          color: theme.colorScheme.onBackground,
                        ),
                      ),
                      const SizedBox(height: 5),
                      Row(
                        children: [
                          Text(
                            'Last used: ${device['last_used'] ?? 'N/A'}',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: Colors.grey[600],
                              fontSize: width * 0.028,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '•',
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: width * 0.028,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '${device['type'] ?? 'N/A'} | ${device['max_power'] ?? 'N/A'}',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: Colors.grey[700],
                              fontSize: width * 0.028,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 5),
                      Text(
                        '₹ ${device['unit_price'] ?? '-'}/kWh',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: Colors.orange[500],
                          fontSize: width * 0.028,
                        ),
                      ),
                    ],
                  ),
                ),

                /// Favorite Icon
                Icon(
                  Icons.favorite,
                  color: Colors.redAccent,
                  size: width * 0.055,
                ),
              ],
            ),

            const SizedBox(height: 8),
            Divider(
              thickness: 0.2,
              color: Colors.grey,
              height: 8,
            ),

            /// Connector Cards (only two)
            const SizedBox(height: 6),
            if (device['connectors'] != null &&
                (device['connectors'] as List).isNotEmpty)
              _buildConnectorCard(
                context,
                title: 'Connector ${device['connectors'][0]['connector_id']}',
                status: device['connectors'][0]['charger_status'] ?? 'Unknown',
                type: device['connectors'][0]['connector_type_name'] ?? 'N/A',
                power: '${device['max_power'] ?? 'N/A'}',
                width: width,
              ),
            const SizedBox(height: 6),
            if (device['connectors'] != null &&
                (device['connectors'] as List).length > 1)
              _buildConnectorCard(
                context,
                title: 'Connector ${device['connectors'][1]['connector_id']}',
                status: device['connectors'][1]['charger_status'] ?? 'Unknown',
                type: device['connectors'][1]['connector_type_name'] ?? 'N/A',
                power: '${device['max_power'] ?? 'N/A'}',
                width: width,
              ),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'available':
        return Colors.green[600]!;
      case 'unavailable':
        return Colors.grey[600]!;
      case 'faulted':
        return Colors.red[600]!;
      case 'preparing':
        return Colors.blue[600]!;
      case 'charging':
        return Colors.orange[600]!;
      case 'finishing':
        return Colors.purple[600]!;
      default:
        return Colors.black; // Default color for unknown statuses
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'available':
        return Icons.check_circle;
      case 'unavailable':
        return Icons.remove_circle_outline;
      case 'faulted':
        return Icons.error_outline;
      case 'preparing':
        return Icons.hourglass_empty;
      case 'charging':
        return Icons.bolt;
      case 'finishing':
        return Icons.done_all;
      default:
        return Icons.help_outline; // Default icon for unknown statuses
    }
  }

  Widget _buildConnectorCard(
    BuildContext context, {
    required String title,
    required String status,
    required String type,
    required String power,
    required double width,
  }) {
    final theme = Theme.of(context);
    final bool isDarkTheme = theme.brightness == Brightness.dark;

    return Card(
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(
          color: theme.dividerColor, // Use theme divider color for consistency
          width: 0.2,
        ),
      ),
      elevation: 0.5,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 10.0),
        child: Row(
          children: [
            /// Left Section
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    title,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      fontSize: width * 0.035,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Text(
                        status,
                        style: TextStyle(
                          color: _getStatusColor(status),
                          fontWeight: FontWeight.w500,
                          fontSize: width * 0.03,
                        ),
                      ),
                      const SizedBox(width: 2),
                      Icon(
                        _getStatusIcon(status),
                        color: _getStatusColor(status),
                        size: 14,
                      ),
                    ],
                  ),
                ],
              ),
            ),

            /// Right Section
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (type.toLowerCase() == 'gun')
                  Image.asset(
                    'assets/icons/charger_gun1.png',
                    width: 22,
                    height: 22,
                    color: isDarkTheme ? Colors.white : const Color(0xFF0A1F44),
                  )
                else if (type.toLowerCase() == 'socket')
                  Image.asset(
                    'assets/icons/wall-socket.png',
                    width: 22,
                    height: 22,
                    color: isDarkTheme ? Colors.white : const Color(0xFF0A1F44),
                  ),
                const SizedBox(width: 10),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      type,
                      style: theme.textTheme.bodySmall?.copyWith(
                        fontSize: width * 0.03,
                      ),
                    ),
                    Text(
                      power,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.textTheme.bodyMedium?.color
                            ?.withOpacity(0.6), // Use theme color
                        fontSize: width * 0.028,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
