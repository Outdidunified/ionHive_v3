import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/feature/more/presentation/pages/saved_stations/presentation/controllers/saved_stations_controllers.dart';
import 'package:shimmer/shimmer.dart';

class SavedStationsPages extends StatelessWidget {
  final int userId;
  final String username;
  final String emailId;
  final String token;

  const SavedStationsPages(
      {Key? key,
      required this.userId,
      required this.username,
      required this.emailId,
      required this.token})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final SavedStationsControllers controller =
        Get.put(SavedStationsControllers());

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Saved Stations',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 20,
            color: Colors.black,
          ),
        ),
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      backgroundColor: Colors.white,
      body: Obx(() {
        // Show shimmer loading effect
        if (controller.isLoading.value) {
          return _buildShimmerLoading();
        }

        // Show error state
        if (controller.errorMessage.value.isNotEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('ERROR', style: TextStyle(fontSize: 50)),
                const SizedBox(height: 5),
                Image.asset(
                  'assets/icons/error-history.png',
                  width: 200,
                  height: 200,
                ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.info_outline,
                      color: Colors.grey,
                      size: 14,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      "Couldn't reach server",
                      style: TextStyle(
                        fontSize: 10,
                        color: Colors.grey[700],
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
                      color: Colors.grey,
                      size: 16,
                    ),
                    SizedBox(width: 4),
                    Text(
                      "No saved stations found",
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[700],
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 10),
                Image.asset(
                  'assets/icons/no-history-found1.png',
                  width: 200,
                  height: 200,
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
  }) {
    final screenWidth = MediaQuery.of(context).size.width;
    final stationId = station['station_id'] as int;
    final title = '${station['location_id']} | ${station['station_address']}';
    final isAvailable =
        station['availability']?.toString().toLowerCase() == 'available';
    final isCaptive =
        station['accessibility']?.toString().toLowerCase() == 'captive';

    return Stack(
      clipBehavior: Clip.none,
      children: [
        GestureDetector(
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content:
                    Text('Selected station: ${station['station_address']}'),
                duration: const Duration(seconds: 1),
                behavior: SnackBarBehavior.floating,
              ),
            );
          },
          child: Container(
            padding: const EdgeInsets.all(16),
            margin: const EdgeInsets.symmetric(vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black12.withOpacity(0.1),
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
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: screenWidth * 0.036,
                        ),
                      ),
                    ),
                    Obx(() => GestureDetector(
                          onTap: () =>
                              controller.toggleBookmark(stationId, context),
                          child: Icon(
                            controller.bookmarkStatus[stationId] ?? false
                                ? Icons.bookmark
                                : Icons.bookmark_border,
                            color: controller.bookmarkStatus[stationId] ?? false
                                ? Colors.black
                                : Colors.black54,
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
                    style: TextStyle(
                      fontSize: screenWidth * 0.031,
                      color: Colors.grey[600],
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Row(
                      children: [
                        Icon(
                          isAvailable ? Icons.check_circle : Icons.cancel,
                          color: isAvailable ? Colors.green : Colors.red,
                          size: screenWidth * 0.045,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          station['availability'] ?? 'Unknown',
                          style: TextStyle(
                            fontSize: screenWidth * 0.032,
                            fontWeight: FontWeight.w500,
                            color: isAvailable ? Colors.green : Colors.red,
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.grey[200],
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        station['charger_type'] ?? '',
                        style: TextStyle(
                          fontSize: screenWidth * 0.03,
                          fontWeight: FontWeight.w500,
                          color: Colors.black87,
                        ),
                      ),
                    )
                  ],
                ),
              ],
            ),
          ),
        ),
        CornerTag(
          label: isCaptive ? 'Captive' : 'Public',
          isCapitative: isCaptive,
        ),
      ],
    );
  }

  // Shimmer loading effect for station cards
  Widget _buildShimmerLoading() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Shimmer.fromColors(
        baseColor: Colors.grey[300]!,
        highlightColor: Colors.grey[100]!,
        child: ListView.builder(
          itemCount: 5, // Show 5 shimmer items
          itemBuilder: (_, __) => Padding(
            padding: const EdgeInsets.only(bottom: 16.0),
            child: Container(
              height: 140,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black12.withOpacity(0.1),
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
                          color: Colors.white,
                        ),
                      ),
                      Container(
                        height: 24,
                        width: 24,
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Container(
                    height: 16,
                    width: 150,
                    color: Colors.white,
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Container(
                        height: 16,
                        width: 100,
                        color: Colors.white,
                      ),
                      const Spacer(),
                      Container(
                        height: 24,
                        width: 60,
                        decoration: BoxDecoration(
                          color: Colors.white,
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

class CornerTag extends StatelessWidget {
  final String label;
  final bool isCapitative;

  const CornerTag({
    Key? key,
    required this.label,
    required this.isCapitative,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;

    return Positioned(
      top: 0, // Align with the top of the card
      right: 0, // Align with the right of the card
      child: Container(
        width: isCapitative ? screenWidth * 0.25 : screenWidth * 0.18,
        height: screenWidth * 0.06,
        decoration: BoxDecoration(
          color: isCapitative ? Colors.purple.shade700 : Colors.green[700],
          borderRadius: const BorderRadius.only(
            topRight: Radius.circular(12),
            bottomLeft: Radius.circular(16),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.2),
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
