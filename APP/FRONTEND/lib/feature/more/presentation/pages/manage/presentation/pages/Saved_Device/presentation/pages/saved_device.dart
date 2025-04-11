import 'package:get/get.dart';
import 'package:flutter/material.dart';

class SavedDevicepage extends StatelessWidget {
  final int userId;
  final String username;
  final String emailId;
  final String token;

  const SavedDevicepage(
      {super.key,
      required this.userId,
      required this.username,
      required this.emailId,
      required this.token});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Saved Devices'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: DeviceCard(),
      ),
    );
  }
}

class DeviceCard extends StatelessWidget {
  const DeviceCard({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final width = MediaQuery.of(context).size.width;

    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(
          color: Colors.grey, // Light grey border
          width: 0.2,         // Border width
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
                        'ELC KA | Bengaluru',
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
                            'Last used: 10/04/2025',
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
                            'DC | 150kW',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: Colors.grey[700],
                              fontSize: width * 0.028,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 5),
                      Text(
                        '₹ 24/kWh',
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
                  Icons.favorite_border,
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
            _buildConnectorCard(
              context,
              title: 'Connector Gun 1',
              status: 'Available',
              type: 'CCS-2',
              power: 'Upto 150kW',
              width: width,
            ),
            const SizedBox(height: 6),
            _buildConnectorCard(
              context,
              title: 'Connector Gun 2',
              status: 'Available',
              type: 'CCS-2',
              power: 'Upto 30kW',
              width: width,
            ),
          ],
        ),
      ),
    );

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
          color: Colors.grey, // Light grey border
          width: 0.2,         // Border width
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
                          color: Colors.green[600],
                          fontWeight: FontWeight.w500,
                          fontSize: width * 0.03,
                        ),
                      ),
                      const SizedBox(width: 2),
                      Icon(Icons.check_circle, color: Colors.green, size: 14),
                    ],
                  ),
                ],
              ),
            ),

            /// Right Section
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.electric_car,
                    size: width * 0.06, color: Colors.indigo),
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
