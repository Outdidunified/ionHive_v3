// ignore_for_file: file_names

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/ChargingStation/presentation/controllers/Chargingstation_controllers.dart';
import 'package:shimmer/shimmer.dart';

// Popup Menu Overlay
class PopupMenuOverlay extends StatelessWidget {
  final Offset position;
  final VoidCallback onHidePopup;
  final VoidCallback onToggleSave;
  final VoidCallback onShare;
  final bool isSaved;

  const PopupMenuOverlay({
    super.key,
    required this.position,
    required this.onHidePopup,
    required this.onToggleSave,
    required this.onShare,
    required this.isSaved,
  });

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;

    return GestureDetector(
      behavior: HitTestBehavior.translucent,
      onTap: onHidePopup,
      child: Stack(
        children: [
          Positioned(
            top: position.dy + screenHeight * 0.04,
            left: position.dx - (screenWidth * 0.35),
            child: Material(
              color: Colors.transparent,
              child: Container(
                width: screenWidth * 0.40,
                height: screenHeight * 0.14,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(screenWidth * 0.02),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black26,
                      blurRadius: screenWidth * 0.01,
                      offset: Offset(0, screenHeight * 0.005),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: EdgeInsets.symmetric(
                        horizontal: screenWidth * 0.03,
                        vertical: screenHeight * 0.015,
                      ),
                      child: GestureDetector(
                        onTap: onToggleSave,
                        child: Row(
                          children: [
                            Icon(
                              isSaved
                                  ? Icons.bookmark
                                  : Icons.bookmark_border_outlined,
                              size: screenWidth * 0.06,
                              color: Colors.grey.shade600,
                            ),
                            SizedBox(width: screenWidth * 0.03),
                            Text(
                              isSaved ? 'Saved Station' : 'Save Station',
                              style: TextStyle(
                                fontSize: screenWidth * 0.035,
                                color: Colors.grey.shade800,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    Divider(
                      color: Colors.grey.shade400,
                      thickness: screenHeight * 0.0005,
                      height: screenHeight * 0.01,
                      indent: screenWidth * 0.03,
                      endIndent: screenWidth * 0.03,
                    ),
                    Padding(
                      padding: EdgeInsets.symmetric(
                        horizontal: screenWidth * 0.03,
                        vertical: screenHeight * 0.015,
                      ),
                      child: GestureDetector(
                        onTap: onShare,
                        child: Row(
                          children: [
                            Icon(
                              Icons.share,
                              size: screenWidth * 0.06,
                              color: Colors.grey.shade600,
                            ),
                            SizedBox(width: screenWidth * 0.03),
                            Text(
                              'Share',
                              style: TextStyle(
                                fontSize: screenWidth * 0.035,
                                color: Colors.grey.shade800,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Station Header Widget
class StationHeader extends StatelessWidget {
  final String locationId;
  final String stationAddress;
  final String network;
  final String chargerType;
  final String availability;

  const StationHeader({
    super.key,
    required this.locationId,
    required this.stationAddress,
    required this.network,
    required this.chargerType,
    required this.availability,
  });

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;

    Color availabilityColor = Colors.green;
    String availabilityText = availability;
    if (availability == 'Closed') {
      availabilityColor = Colors.red;
    } else if (availability == 'Under Maintenance') {
      availabilityColor = Colors.orange;
    }

    final displayAddress = stationAddress.length > 30
        ? '${stationAddress.substring(0, 30)}...'
        : stationAddress;

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: screenWidth * 0.04,
        vertical: screenHeight * 0.02,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            alignment: WrapAlignment.start,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              Text(
                "$locationId | ",
                style: TextStyle(
                  fontSize: screenWidth * 0.05,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
              Text(
                displayAddress,
                softWrap: true,
                style: TextStyle(
                  fontSize: screenWidth * 0.05,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            '$network $chargerType',
            style: TextStyle(
              color: Colors.black,
              fontSize: screenWidth * 0.04,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Text(
                availabilityText,
                style: TextStyle(
                  color: availabilityColor,
                  fontSize: screenWidth * 0.035,
                ),
              ),
              SizedBox(width: screenWidth * 0.015),
              if (availability == 'Open 24/7')
                Text(
                  '• 24 Hours',
                  style: TextStyle(
                    color: Colors.black,
                    fontSize: screenWidth * 0.035,
                  ),
                ),
            ],
          ),
          SizedBox(height: screenHeight * 0.02),
          const TabBarHeader(),
        ],
      ),
    );
  }
}

class TabBarHeader extends StatelessWidget {
  const TabBarHeader({super.key});

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final screenWidth = mediaQuery.size.width;
    final ChargingStationController controller =
        Get.find<ChargingStationController>();

    return Obx(() {
      return Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          GestureDetector(
            onTap: () {
              debugPrint('Tapping Charger tab');
              controller.onTabTapped(0);
            },
            child: TabHeaderItem(
              label: 'Charger',
              isActive: controller.selectedTabIndex.value == 0,
            ),
          ),
          GestureDetector(
            onTap: () {
              debugPrint('Tapping Details tab');
              controller.onTabTapped(1);
            },
            child: TabHeaderItem(
              label: 'Details',
              isActive: controller.selectedTabIndex.value == 1,
            ),
          ),
          GestureDetector(
            onTap: () {
              debugPrint('Tapping Reviews tab (no action)');
            },
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                TabHeaderItem(
                  label: 'Reviews',
                  isActive: controller.selectedTabIndex.value == 2,
                ),
                Positioned(
                  top: -screenWidth * 0.055,
                  right: -screenWidth * 0.005,
                  child: Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: screenWidth * 0.015,
                      vertical: screenWidth * 0.005,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.orange.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(screenWidth * 0.02),
                      border: Border.all(
                        color: Colors.orange,
                        width: 1,
                      ),
                    ),
                    child: Text(
                      'Coming Soon',
                      style: TextStyle(
                        color: Colors.orange,
                        fontSize: screenWidth * 0.025,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      );
    });
  }
}

class TabHeaderItem extends StatelessWidget {
  final String label;
  final bool isActive;

  const TabHeaderItem({super.key, required this.label, this.isActive = false});

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final screenWidth = mediaQuery.size.width;
    final screenHeight = mediaQuery.size.height;

    return Padding(
      padding: EdgeInsets.symmetric(
        horizontal: screenWidth * 0.03,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: TextStyle(
              color: isActive ? Colors.orange : Colors.black54,
              fontSize: screenWidth * 0.04,
              fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
            ),
          ),
          if (isActive) SizedBox(height: screenHeight * 0.008),
          if (isActive)
            Container(
              height: screenHeight * 0.003,
              width: screenWidth * 0.08,
              color: Colors.orange,
            ),
        ],
      ),
    );
  }
}

class ChargerCard extends StatelessWidget {
  final String title;
  final String power;
  final String price;
  final String lastUsed;
  final String? sessions;
  final List<ConnectorInfo> connectors;
  final bool isExpanded;
  final String vendor;
  final String chargerId;
  final String chargerType;
  final int index;

  const ChargerCard({
    super.key,
    required this.title,
    required this.power,
    required this.price,
    required this.lastUsed,
    this.sessions,
    required this.connectors,
    required this.isExpanded,
    required this.vendor,
    required this.chargerId,
    required this.chargerType,
    required this.index,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final width = MediaQuery.of(context).size.width;
    final controller = Get.find<ChargingStationController>();

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
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '$vendor | $chargerId',
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
                            'Last used: $lastUsed',
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
                            '$chargerType | $power',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: Colors.grey[700],
                              fontSize: width * 0.028,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 5),
                      Text(
                        price,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: Colors.orange[500],
                          fontSize: width * 0.028,
                        ),
                      ),
                    ],
                  ),
                ),
                GetBuilder<ChargingStationController>(
                  builder: (controller) {
                    final isSaved = controller.isChargerSaved(chargerId);
                    return GestureDetector(
                      onTap: () async {
                        final sessionController = Get.find<SessionController>();
                        if (isSaved) {
                          await controller.Removedevice(
                            sessionController.userId.value,
                            sessionController.emailId.value,
                            sessionController.token.value,
                            chargerId,
                          );
                        } else {
                          await controller.Savedevice(
                            sessionController.userId.value,
                            sessionController.emailId.value,
                            sessionController.token.value,
                            chargerId,
                          );
                        }
                      },
                      child: Icon(
                        isSaved ? Icons.favorite : Icons.favorite_border,
                        color: isSaved ? Colors.red : Colors.black,
                        size: width * 0.055,
                      ),
                    );
                  },
                ),
              ],
            ),
            const SizedBox(height: 8),
            Divider(
              thickness: 0.2,
              color: Colors.grey,
              height: 8,
            ),
            if (connectors.isNotEmpty)
              GetBuilder<ChargingStationController>(
                id: 'connectors',
                builder: (controller) {
                  // Ensure expanded state is preserved
                  final isExpandedState =
                      controller.expandedConnectorIndices[index] ?? false;
                  return Column(
                    children: connectors.asMap().entries.map((entry) {
                      final connectorIndex = entry.key;
                      final connector = entry.value;
                      // Show all connectors if expanded, otherwise limit to 2
                      final isVisible = isExpandedState || connectorIndex < 2;
                      return isVisible
                          ? Padding(
                              padding: const EdgeInsets.only(bottom: 6.0),
                              child: GestureDetector(
                                onTap: () {
                                  controller.setSelectedConnector(
                                      index, connectorIndex);
                                },
                                child: _buildConnectorCard(
                                  context,
                                  title: 'Connector ${connector.name}',
                                  status: connector.status,
                                  type: connector.type,
                                  power: connector.power,
                                  width: width,
                                  isSelected: controller.chargerDetails[index]
                                          ['selectedConnectorIndex'] ==
                                      connectorIndex,
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
                      if (!controller.isToggling) {
                        controller.isToggling = true;
                        debugPrint(
                            'Toggling connector details for index $index (before)');
                        controller.toggleConnectorDetails(index);
                        debugPrint(
                            'Toggling connector details for index $index (after), state: ${controller.expandedConnectorIndices[index]}');
                        Future.delayed(const Duration(milliseconds: 300), () {
                          controller.isToggling = false;
                          controller.update(['connectors', 'viewMoreButton']);
                        });
                      }
                    },
                    child: GetBuilder<ChargingStationController>(
                      id: 'viewMoreButton',
                      builder: (controller) {
                        final isExpanded =
                            controller.expandedConnectorIndices[index] ?? false;
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
                if (type.toLowerCase() == '1')
                  Image.asset(
                    'assets/icons/wall-socket.png',
                    width: 22,
                    height: 22,
                    color: isDarkTheme ? Colors.white : const Color(0xFF0A1F44),
                  )
                else if (type.toLowerCase() == '2')
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
                      type == '1' ? 'Socket' : 'Gun',
                      style: theme.textTheme.bodySmall?.copyWith(
                        fontSize: width * 0.03,
                      ),
                    ),
                    Text(
                      power,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color:
                            theme.textTheme.bodyMedium?.color?.withOpacity(0.6),
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

class ConnectorInfo {
  final String name;
  final String type;
  final String power;
  final String status;

  const ConnectorInfo({
    required this.name,
    required this.type,
    required this.power,
    required this.status,
  });
}

class ShimmerLoading extends StatelessWidget {
  const ShimmerLoading({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Shimmer.fromColors(
      baseColor: theme.brightness == Brightness.dark
          ? Colors.grey[700]!
          : Colors.grey[300]!,
      highlightColor: theme.brightness == Brightness.dark
          ? Colors.grey[600]!
          : Colors.grey[100]!,
      child: ListView(
        physics: const NeverScrollableScrollPhysics(),
        padding: EdgeInsets.all(MediaQuery.of(context).size.width * 0.04),
        children: [
          _buildCardLoading(context),
          const SizedBox(height: 20),
          // _buildCardLoading(context),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildCardLoading(BuildContext context) {
    Theme.of(context);
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;

    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: Colors.grey, width: 0.6),
      ),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: screenWidth * 0.4,
                        height: screenHeight * 0.02,
                        color: Colors.white,
                      ),
                      const SizedBox(height: 5),
                      Row(
                        children: [
                          Container(
                            width: screenWidth * 0.3,
                            height: screenHeight * 0.015,
                            color: Colors.white,
                          ),
                          const SizedBox(width: 8),
                          Container(
                            width: screenWidth * 0.02,
                            height: screenHeight * 0.015,
                            color: Colors.white,
                          ),
                          const SizedBox(width: 8),
                          Container(
                            width: screenWidth * 0.2,
                            height: screenHeight * 0.015,
                            color: Colors.white,
                          ),
                        ],
                      ),
                      const SizedBox(height: 5),
                      Container(
                        width: screenWidth * 0.15,
                        height: screenHeight * 0.015,
                        color: Colors.white,
                      ),
                    ],
                  ),
                ),
                Container(
                  width: screenWidth * 0.055,
                  height: screenWidth * 0.055,
                  color: Colors.white,
                ),
              ],
            ),
            const SizedBox(height: 8),
            Divider(
              thickness: 0.2,
              color: Colors.grey,
              height: 8,
            ),
            Padding(
              padding: const EdgeInsets.only(bottom: 6.0),
              child: _buildConnectorCardLoading(context),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildConnectorCardLoading(BuildContext context) {
    final theme = Theme.of(context);
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;

    return Card(
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(
          color: theme.dividerColor,
          width: 0.2,
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
                  Container(
                    width: screenWidth * 0.25,
                    height: screenHeight * 0.018,
                    color: Colors.white,
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Container(
                        width: screenWidth * 0.2,
                        height: screenHeight * 0.015,
                        color: Colors.white,
                      ),
                      const SizedBox(width: 2),
                      Container(
                        width: 14,
                        height: 14,
                        color: Colors.white,
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 22,
                  height: 22,
                  color: Colors.white,
                ),
                const SizedBox(width: 10),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: screenWidth * 0.1,
                      height: screenHeight * 0.015,
                      color: Colors.white,
                    ),
                    const SizedBox(height: 2),
                    Container(
                      width: screenWidth * 0.15,
                      height: screenHeight * 0.013,
                      color: Colors.white,
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
