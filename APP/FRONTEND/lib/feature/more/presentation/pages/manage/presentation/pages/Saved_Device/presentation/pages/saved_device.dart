import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/feature/landing_page.dart';
import 'package:ionhive/feature/landing_page_controller.dart';
import 'package:ionhive/feature/ChargingStation/presentation/controllers/Chargingstation_controllers.dart';
import 'package:ionhive/feature/Chargingpage/presentation/pages/Chargingpage.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/Saved_Device/presentation/controllers/saved_device_controllers.dart';
import 'package:ionhive/utils/widgets/loading/loading_indicator.dart';
import 'package:ionhive/utils/widgets/snackbar/custom_snackbar.dart';

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
    final SavedDeviceControllers savedController = Get.put(SavedDeviceControllers());
    final ChargingStationController chargingController = Get.put(ChargingStationController());

    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;

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
      body: Stack(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Obx(() {
              if (savedController.isLoading.value) {
                return const LoadingIndicator();
              } else if (savedController.errorMessage.value.isNotEmpty) {
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
                              color: isDarkTheme ? Colors.white70 : Colors.grey[700],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              } else if (savedController.savedDevices.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Image.asset(
                        'assets/icons/save_device.png',
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
                  itemCount: savedController.savedDevices.length,
                  itemBuilder: (context, index) {
                    final device = savedController.savedDevices[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10.0),
                      child: DeviceCard(
                        device: device,
                        userId: userId,
                        emailId: emailId,
                        token: token,
                        controller: chargingController,
                        savedController: savedController,
                        index: index,
                      ),
                    );
                  },
                );
              }
            }),
          ),
          // "Charge Now" Button
          Obx(() {
            if (savedController.selectedConnector['connectorIndex'] != -1) {
              final chargerId = savedController.selectedConnector['chargerId'];
              final selectedDevice = savedController.savedDevices
                  .firstWhere((device) => device['charger_id'].toString() == chargerId);
              final connectorIndex = savedController.selectedConnector['connectorIndex'];
              final connector = (selectedDevice['connectors'] as List<dynamic>)[connectorIndex];
              return Positioned(
                left: 0,
                right: 0,
                bottom: screenHeight * 0.02,
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: screenWidth * 0.1),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.green,
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black26,
                          blurRadius: 10,
                          offset: Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ElevatedButton(
                      onPressed: () {
                        Get.to(() => Chargingpage(
                          chargerId: selectedDevice['charger_id'],
                          chargerDetails: selectedDevice,
                          connectorId: connector['connector_id'].toString(),
                          connectorDetails: {
                            'type': connector['connector_type'] == 1 ? 'Socket' : 'Gun',
                            'power': selectedDevice['max_power'] ?? 'N/A',
                            'status': connector['charger_status'] ?? ' - ',
                          },
                          unitPrice: 0,
                        ));
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        padding: EdgeInsets.symmetric(vertical: screenHeight * 0.015),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: Text(
                        'Charge Now',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: screenWidth * 0.045,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }
            return const SizedBox.shrink();
          }),
        ],
      ),
    );
  }
}

class DeviceCard extends StatelessWidget {
  final Map<String, dynamic> device;
  final int userId;
  final String emailId;
  final String token;
  final ChargingStationController controller;
  final SavedDeviceControllers savedController;
  final int index;

  const DeviceCard({
    super.key,
    required this.device,
    required this.userId,
    required this.emailId,
    required this.token,
    required this.controller,
    required this.savedController,
    required this.index,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final width = MediaQuery.of(context).size.width;
    final RxBool isRemoving = false.obs;

    // Get all connectors as a single list
    final List<Map<String, dynamic>> connectors = (device['connectors'] as List<dynamic>? ?? [])
        .map((connector) => connector as Map<String, dynamic>)
        .toList();

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
                            'Last used: ${device['last_used']}',
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
                Obx(() => GestureDetector(
                  onTap: isRemoving.value
                      ? null
                      : () async {
                    final chargerId = device['charger_id']?.toString();
                    if (chargerId != null && chargerId.isNotEmpty) {
                      try {
                        isRemoving.value = true;
                        print('Attempting to remove charger: $chargerId');
                        await controller.Removedevice(
                          userId,
                          emailId,
                          token,
                          chargerId,
                        );
                        print('Successfully removed charger: $chargerId');

                        // Find and remove the specific device by chargerId
                        final deviceIndex = savedController.savedDevices
                            .indexWhere((d) => d['charger_id'] == chargerId);
                        if (deviceIndex != -1) {
                          savedController.savedDevices.removeAt(deviceIndex);
                          savedController.update();
                        }
                      } catch (e) {
                        print("Error removing charger: $e");
                        CustomSnackbar.showError(
                          message: e.toString().contains("Exception:")
                              ? e.toString().split("Exception:")[1].trim()
                              : "Failed to remove device",
                        );
                      } finally {
                        isRemoving.value = false;
                      }
                    } else {
                      print("Invalid chargerId: $chargerId");
                      CustomSnackbar.showError(
                        message: "Invalid charger ID",
                      );
                    }
                  },
                  child: isRemoving.value
                      ? SizedBox(
                    width: width * 0.055,
                    height: width * 0.055,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.redAccent,
                    ),
                  )
                      : Icon(
                    Icons.favorite,
                    color: Colors.redAccent,
                    size: width * 0.055,
                  ),
                )),
              ],
            ),
            const SizedBox(height: 8),
            Divider(
              thickness: 0.2,
              color: Colors.grey,
              height: 8,
            ),
            const SizedBox(height: 6),
            /// Connector Cards with Show More/Show Less
            if (connectors.isNotEmpty)
              GetBuilder<SavedDeviceControllers>(
                id: 'connectors',
                builder: (savedController) {
                  return Column(
                    children: connectors.asMap().entries.map((entry) {
                      final connectorIndex = entry.key;
                      final connector = entry.value;
                      final chargerId = device['charger_id'].toString();
                      final isSelected = savedController.selectedConnector['chargerId'] == chargerId &&
                          savedController.selectedConnector['connectorIndex'] == connectorIndex;
                      final isVisible = connectorIndex < 2 ||
                          (savedController.expandedConnectorIndices[index] ?? false);
                      return isVisible
                          ? Padding(
                        padding: const EdgeInsets.only(bottom: 6.0),
                        child: GestureDetector(
                          onTap: () {
                            savedController.setSelectedConnector(chargerId, connectorIndex);
                          },
                          child: _buildConnectorCard(
                            context,
                            title: 'Connector ${connectorIndex + 1}',
                            status: connector['charger_status'] ?? 'Unknown',
                            type: connector['connector_type'] == 1 ? 'Socket' : 'Gun',
                            power: device['max_power'] ?? 'N/A',
                            width: width,
                            isSelected: isSelected,
                          ),
                        ),
                      )
                          : const SizedBox.shrink();
                    }).toList(),
                  );
                },
              ),
            if (connectors.length > 2)
              Padding(
                padding: const EdgeInsets.only(top: 6.0),
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    borderRadius: BorderRadius.circular(8),
                    onTap: () {
                      if (!savedController.isToggling) {
                        savedController.isToggling = true;
                        print('Toggling connector details for index $index (before)');
                        savedController.toggleConnectorDetails(index);
                        print('Toggling connector details for index $index (after), state: ${savedController.expandedConnectorIndices[index]}');
                        Future.delayed(const Duration(milliseconds: 300), () {
                          savedController.isToggling = false;
                          savedController.update(['connectors', 'viewMoreButton']);
                        });
                      }
                    },
                    child: GetBuilder<SavedDeviceControllers>(
                      id: 'viewMoreButton',
                      builder: (savedController) {
                        final isExpanded =
                            savedController.expandedConnectorIndices[index] ?? false;
                        return Padding(
                          padding: const EdgeInsets.symmetric(
                              vertical: 8.0, horizontal: 16.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                isExpanded
                                    ? 'View less connectors'
                                    : 'View more connectors',
                                style: TextStyle(
                                  color: Colors.blue,
                                  fontSize: width * 0.035,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(width: 4),
                              Icon(
                                isExpanded
                                    ? Icons.keyboard_arrow_up
                                    : Icons.keyboard_arrow_down,
                                color: Colors.blue,
                                size: width * 0.04,
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                ),
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
        return Colors.black;
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
        return Icons.help_outline;
    }
  }

  Widget _buildConnectorCard(
      BuildContext context, {
        required String title,
        required String status,
        required String type,
        required String power,
        required double width,
        bool isSelected = false,
      }) {
    final theme = Theme.of(context);
    final bool isDarkTheme = theme.brightness == Brightness.dark;

    return Card(
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(
          color: isSelected ? Colors.blue : theme.dividerColor,
          width: isSelected ? 2.0 : 0.2,
        ),
      ),
      elevation: 0.5,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 10.0),
        child: Row(
          children: [
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
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (type.toLowerCase() == 'socket')
                  Image.asset(
                    'assets/icons/wall-socket.png',
                    width: 22,
                    height: 22,
                    color: isDarkTheme ? Colors.white : const Color(0xFF0A1F44),
                  )
                else if (type.toLowerCase() == 'gun')
                  Image.asset(
                    'assets/icons/charger_gun1.png',
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
                        color: theme.textTheme.bodyMedium?.color?.withOpacity(0.6),
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