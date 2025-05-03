import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/feature/ChargingStation/presentation/pages/Chargingstation.dart';
import 'package:ionhive/feature/home/presentation/controllers/home_controller.dart';

class ViewAllNearbyChargers extends StatelessWidget {
  final HomeController controller = Get.find<HomeController>();

  ViewAllNearbyChargers({super.key});

  @override
  Widget build(BuildContext context) {
    final isDarkTheme = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Nearby Charging Stations'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Get.back(),
        ),
      ),
      body: Obx(() => ListView.builder(
            padding: const EdgeInsets.all(16.0),
            itemCount: controller.chargers.length,
            itemBuilder: (context, index) {
              final station = controller.chargers[index];
              return _buildStationCard(
                context: context,
                station: station,
                isDarkTheme: isDarkTheme,
                onTap: () {
                  // Navigate to ChargingStation with the selected station details with left-to-right transition
                  Get.to(() => ChargingStationPage(station: station),
                      transition: Transition.leftToRight);
                },
              );
            },
          )),
    );
  }

  Widget _buildStationCard({
    required BuildContext context,
    required Map<String, dynamic> station,
    required bool isDarkTheme,
    required VoidCallback onTap,
  }) {
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;
    final isSmallScreen = screenWidth < 360 || screenHeight < 600;
    final iconSize = isSmallScreen ? screenWidth * 0.035 : screenWidth * 0.04;

    // Get availability status
    final String availabilityStatus =
        station['availability']?.toString().toLowerCase() ?? 'unknown';

    // Determine status for UI display based on the actual API response values
    final bool isOpen = availabilityStatus.contains('open');
    final bool isClosed = availabilityStatus.contains('closed');
    final bool isUnderMaintenance = availabilityStatus.contains('maintenance');

    final isCaptive =
        station['accessibility']?.toString().toLowerCase() == 'captive';

    return Stack(
      clipBehavior: Clip.none,
      children: [
        GestureDetector(
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.all(16),
            margin: const EdgeInsets.symmetric(vertical: 12),
            decoration: BoxDecoration(
              color: isDarkTheme ? const Color(0xFF1E1E1E) : Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: isDarkTheme
                      ? Colors.black26.withOpacity(0.1)
                      : Colors.black12.withOpacity(0.1),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        '${station['location_id']} | ${station['station_address']}',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.w600,
                              fontSize: screenWidth * 0.036,
                              color: isDarkTheme ? Colors.white70 : null,
                            ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(left: 0),
                      child: Text(
                        station['landmark'] ?? '',
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                              fontSize: screenWidth * 0.031,
                              color: isDarkTheme
                                  ? Colors.white60
                                  : Colors.grey[600],
                            ),
                      ),
                    ),
                    Row(
                      children: [
                        Icon(
                          Icons.location_on,
                          size: iconSize,
                          color:
                              isDarkTheme ? Colors.white60 : Colors.grey[600],
                        ),
                        const SizedBox(width: 2),
                        Padding(
                          padding: const EdgeInsets.only(left: 0),
                          child: Text(
                            "${(station['distance'] as int) ~/ 1000} km away",
                            style:
                                Theme.of(context).textTheme.bodyLarge?.copyWith(
                                      fontSize: screenWidth * 0.031,
                                      color: isDarkTheme
                                          ? Colors.white60
                                          : Colors.grey[600],
                                    ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: isDarkTheme
                            ? _getAvailabilityColor(
                                    isOpen, isClosed, isUnderMaintenance)
                                .withOpacity(0.1)
                            : _getAvailabilityColor(
                                    isOpen, isClosed, isUnderMaintenance)
                                .withOpacity(0.1),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: _getAvailabilityColor(
                                  isOpen, isClosed, isUnderMaintenance)
                              .withOpacity(isDarkTheme ? 0.3 : 0.3),
                          width: 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            _getAvailabilityIcon(
                                isOpen, isClosed, isUnderMaintenance),
                            color: _getAvailabilityColor(
                                isOpen, isClosed, isUnderMaintenance),
                            size: screenWidth * 0.04,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            isOpen
                                ? _capitalizeFirstLetter(
                                    station['availability'] ?? 'Open')
                                : isClosed
                                    ? "Closed"
                                    : isUnderMaintenance
                                        ? "Under Maintenance"
                                        : "Unknown",
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(
                                  fontSize: screenWidth * 0.03,
                                  fontWeight: FontWeight.w500,
                                  color: _getAvailabilityColor(
                                      isOpen, isClosed, isUnderMaintenance),
                                ),
                          ),
                        ],
                      ),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color:
                            isDarkTheme ? Colors.grey[800] : Colors.grey[200],
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        station['charger_type'] ?? '',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              fontSize: screenWidth * 0.03,
                              fontWeight: FontWeight.w500,
                              color:
                                  isDarkTheme ? Colors.white70 : Colors.black87,
                            ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        CornerTag(
          label: isCaptive ? 'Captive' : 'Public',
          isCapitative: isCaptive,
          isDarkTheme: isDarkTheme,
        ),
      ],
    );
  }
}

// Helper methods for availability status
IconData _getAvailabilityIcon(
    bool isOpen, bool isClosed, bool isUnderMaintenance) {
  if (isOpen) {
    return Icons.check_circle;
  } else if (isClosed) {
    return Icons.cancel;
  } else if (isUnderMaintenance) {
    return Icons.build;
  } else {
    return Icons.help_outline;
  }
}

Color _getAvailabilityColor(
    bool isOpen, bool isClosed, bool isUnderMaintenance) {
  if (isOpen) {
    return Colors.green;
  } else if (isClosed) {
    return Colors.red;
  } else if (isUnderMaintenance) {
    return Colors.orange;
  } else {
    return Colors.grey;
  }
}

String _capitalizeFirstLetter(String text) {
  if (text.isEmpty) return text;
  return text
      .split(' ')
      .map((word) =>
          word.isNotEmpty ? '${word[0].toUpperCase()}${word.substring(1)}' : '')
      .join(' ');
}

class CornerTag extends StatelessWidget {
  final String label;
  final bool isCapitative;
  final bool isDarkTheme;

  const CornerTag({
    super.key,
    required this.label,
    required this.isCapitative,
    required this.isDarkTheme,
  });

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;

    return Positioned(
      top: 0,
      right: 0,
      child: Container(
        width: isCapitative ? screenWidth * 0.25 : screenWidth * 0.18,
        height: screenWidth * 0.06,
        decoration: BoxDecoration(
          color: isCapitative
              ? (isDarkTheme ? Colors.purple.shade900 : Colors.purple.shade700)
              : (isDarkTheme ? Colors.green.shade900 : Colors.green[700]),
          borderRadius: const BorderRadius.only(
            topRight: Radius.circular(12),
            bottomLeft: Radius.circular(16),
          ),
          boxShadow: [
            BoxShadow(
              color: isDarkTheme
                  ? Colors.black45.withOpacity(0.2)
                  : Colors.black.withOpacity(0.2),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              fontSize:
                  isCapitative ? screenWidth * 0.026 : screenWidth * 0.028,
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}
