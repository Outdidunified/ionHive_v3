import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/Saved_Device/presentation/controllers/saved_device_controllers.dart';

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
    final SavedDeviceControllers controller = Get.put(SavedDeviceControllers());

    return Scaffold(
      appBar: AppBar(
        title: const Text('Saved Devices'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Obx(() {
          if (controller.isLoading.value) {
            return const Center(child: CircularProgressIndicator());
          } else if (controller.errorMessage.value.isNotEmpty) {
            return Center(
              child: Text(
                controller.errorMessage.value,
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: theme.colorScheme.error,
                ),
                textAlign: TextAlign.center,
              ),
            );
          } else if (controller.savedDevices.isEmpty) {
            return Center(
              child: Text(
                'No saved devices found',
                style: theme.textTheme.bodyLarge,
              ),
            );
          } else {
            return ListView.builder(
              itemCount: controller.savedDevices.length,
              itemBuilder: (context, index) {
                final device = controller.savedDevices[index];
                return Padding(
                  padding: const EdgeInsets.only(
                      bottom: 10.0), // Add space below each card
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
          width: 0.2,
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
    return Card(
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: const BorderSide(
          color: Colors.grey,
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
                      'assets/icons/charger_gun1.png', // Replace with your actual asset filename
                      width: 22, // Match the size of the previous Icon (24)
                      height: 22,
                      color: Color(0xFF0A1F44) // A strong navy blue
                      // Optional: Match the icon color if needed
                      )
                else if (type.toLowerCase() == 'socket')
                  Image.asset(
                      'assets/icons/charger_socket1.png', // Replace with your actual asset filename
                      width: 22, // Match the size of the previous Icon (24)
                      height: 22,
                      color: Color(
                          0xFF0A1F44) // Optional: Match the icon color if needed
                      ),
                const SizedBox(width: 4),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      type,
                      style: theme.textTheme.bodySmall
                          ?.copyWith(fontSize: width * 0.03),
                    ),
                    Text(
                      power,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: Colors.grey[600],
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
