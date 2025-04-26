import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/ChargingStation/presentation/controllers/Chargingstation_controllers.dart';
import 'package:ionhive/feature/ChargingStation/presentation/pages/Chargingstation.dart';
import 'package:ionhive/feature/more/presentation/pages/saved_stations/presentation/controllers/saved_stations_controllers.dart';
import 'package:shimmer/shimmer.dart';

class SavedStationsPages extends StatelessWidget {
  final int userId;
  final String username;
  final String emailId;
  final String token;

  const SavedStationsPages({
    super.key,
    required this.userId,
    required this.username,
    required this.emailId,
    required this.token,
  });

  @override
  Widget build(BuildContext context) {
    // Initialize controllers
    final sessionController = Get.put(SessionController());
    sessionController.userId.value = userId;
    sessionController.emailId.value = emailId;
    sessionController.token.value = token;

    Get.put(ChargingStationController());
    final SavedStationsControllers controller = Get.put(SavedStationsControllers());

    final theme = Theme.of(context);
    final bool isDarkTheme = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Saved Stations',
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
          icon: Icon(Icons.arrow_back,
              color: isDarkTheme ? Colors.white : Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      backgroundColor: isDarkTheme ? const Color(0xFF121212) : Colors.white,
      body: Obx(() {
        // Show shimmer loading effect
        if (controller.isLoading.value) {
          return _buildShimmerLoading(context, isDarkTheme);
        }

        // Show error state
        if (controller.errorMessage.value.isNotEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('ERROR',
                    style: theme.textTheme.displayLarge?.copyWith(
                        fontSize: 50,
                        color: isDarkTheme ? Colors.white : null)),
                const SizedBox(height: 5),
                Image.asset(
                  'assets/icons/error-history.png',
                  width: 200,
                  height: 200,
                  color: isDarkTheme ? Colors.white : null,
                ),
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
                        fontSize: 10,
                        color: isDarkTheme ? Colors.white70 : Colors.grey[700],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        }

        // Show empty state
        if (controller.savedStations.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.info_outline,
                      color: isDarkTheme ? Colors.white70 : Colors.grey,
                      size: 16,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      "No saved stations found",
                      style: theme.textTheme.bodyLarge?.copyWith(
                        fontSize: 14,
                        color: isDarkTheme ? Colors.white70 : Colors.grey[700],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Image.asset(
                  'assets/icons/no-history-found1.png',
                  width: 200,
                  height: 200,
                  color: isDarkTheme ? Colors.white : null,
                ),
              ],
            ),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16.0),
          itemCount: controller.savedStations.length,
          itemBuilder: (context, index) {
            final station = controller.savedStations[index];
            return _buildStationCard(
              context: context,
              controller: controller,
              station: station,
              isDarkTheme: isDarkTheme,
            );
          },
        );
      }),
    );
  }

  Widget _buildStationCard({
    required BuildContext context,
    required SavedStationsControllers controller,
    required Map<String, dynamic> station,
    required bool isDarkTheme,
  }) {
    final screenWidth = MediaQuery.of(context).size.width;
    final stationId = station['station_id'] as int;
    final title = '${station['location_id']} | ${station['station_address']}';

    final String availabilityStatus =
        station['availability']?.toString().toLowerCase() ?? 'unknown';

    final bool isOpen = availabilityStatus.contains('open');
    final bool isClosed = availabilityStatus.contains('closed');
    final bool isUnderMaintenance = availabilityStatus.contains('maintenance');

    final isCaptive =
        station['accessibility']?.toString().toLowerCase() == 'captive';

    return Stack(
      clipBehavior: Clip.none,
      children: [
        GestureDetector(
          onTap: () {
            Get.to(() => ChargingStationPage(station: station),
                transition: Transition.leftToRight);
          },
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
                        title,
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w600,
                          fontSize: screenWidth * 0.036,
                          color: isDarkTheme ? Colors.white70 : null,
                        ),
                      ),
                    ),
                    Obx(() => GestureDetector(
                      onTap: () => controller.toggleBookmark(stationId, context),
                      child: Icon(
                        controller.bookmarkStatus[stationId] ?? false
                            ? Icons.bookmark
                            : Icons.bookmark_border,
                        color: (controller.bookmarkStatus[stationId] ?? false)
                            ? (isDarkTheme ? Colors.white : Colors.black)
                            : (isDarkTheme ? Colors.white70 : Colors.black54),
                        size: screenWidth * 0.055,
                      ),
                    )),
                  ],
                ),
                const SizedBox(height: 4),
                Padding(
                  padding: const EdgeInsets.only(left: 0),
                  child: Text(
                    station['landmark'] ?? '',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      fontSize: screenWidth * 0.031,
                      color: isDarkTheme ? Colors.white60 : Colors.grey[600],
                    ),
                  ),
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
                            ? _getAvailabilityColor(isOpen, isClosed, isUnderMaintenance)
                            .withOpacity(0.1)
                            : _getAvailabilityColor(isOpen, isClosed, isUnderMaintenance)
                            .withOpacity(0.1),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: _getAvailabilityColor(isOpen, isClosed, isUnderMaintenance)
                              .withOpacity(isDarkTheme ? 0.3 : 0.3),
                          width: 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            _getAvailabilityIcon(isOpen, isClosed, isUnderMaintenance),
                            color: _getAvailabilityColor(isOpen, isClosed, isUnderMaintenance),
                            size: screenWidth * 0.04,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            isOpen
                                ? _capitalizeFirstLetter(station['availability'] ?? 'Open')
                                : isClosed
                                ? "Closed"
                                : isUnderMaintenance
                                ? "Under Maintenance"
                                : "Unknown",
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              fontSize: screenWidth * 0.03,
                              fontWeight: FontWeight.w500,
                              color: _getAvailabilityColor(isOpen, isClosed, isUnderMaintenance),
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
                        color: isDarkTheme ? Colors.grey[800] : Colors.grey[200],
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        station['charger_type'] ?? '',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontSize: screenWidth * 0.03,
                          fontWeight: FontWeight.w500,
                          color: isDarkTheme ? Colors.white70 : Colors.black87,
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

  Widget _buildShimmerLoading(BuildContext context, bool isDarkTheme) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Shimmer.fromColors(
        baseColor: isDarkTheme ? Colors.grey[700]! : Colors.grey[300]!,
        highlightColor: isDarkTheme ? Colors.grey[600]! : Colors.grey[100]!,
        child: ListView.builder(
          itemCount: 5,
          itemBuilder: (_, __) => Padding(
            padding: const EdgeInsets.only(bottom: 16.0),
            child: Container(
              height: 140,
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
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          height: 20,
                          color: isDarkTheme ? Colors.grey[700] : Colors.white,
                        ),
                      ),
                      Container(
                        height: 24,
                        width: 24,
                        decoration: BoxDecoration(
                          color: isDarkTheme ? Colors.grey[700] : Colors.white,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Container(
                    height: 16,
                    width: 150,
                    color: isDarkTheme ? Colors.grey[700] : Colors.white,
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Container(
                        height: 16,
                        width: 100,
                        color: isDarkTheme ? Colors.grey[700] : Colors.white,
                      ),
                      const Spacer(),
                      Container(
                        height: 24,
                        width: 60,
                        decoration: BoxDecoration(
                          color: isDarkTheme ? Colors.grey[700] : Colors.white,
                          borderRadius: BorderRadius.circular(20),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

IconData _getAvailabilityIcon(bool isOpen, bool isClosed, bool isUnderMaintenance) {
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

Color _getAvailabilityColor(bool isOpen, bool isClosed, bool isUnderMaintenance) {
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
              fontSize: isCapitative ? screenWidth * 0.026 : screenWidth * 0.028,
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