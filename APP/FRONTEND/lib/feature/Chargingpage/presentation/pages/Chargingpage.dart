import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:flutter/services.dart';
import 'package:ionhive/core/Networks/websocket_service.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/core/core.dart';
import 'package:ionhive/feature/Chargingpage/domain/models/Chargingpage_model.dart';
import 'package:ionhive/feature/Chargingpage/domain/repositories/Chargingpage_repositories.dart';
import 'package:ionhive/feature/Chargingpage/presentation/controllers/Chargingpage_controller.dart';
import 'package:ionhive/feature/Chargingpage/presentation/pages/status_helper.dart';
import 'package:ionhive/feature/landing_page.dart';
import 'package:slider_button/slider_button.dart';
import 'package:ionhive/utils/widgets/loading/loading_indicator.dart';
import 'package:ionhive/utils/widgets/loading/loading_overlay.dart';

// Standalone function for showing the auto-stop settings modal
void _showAutoStopSettingsModal(BuildContext context) {
  RxBool isTimeEnabled = false.obs;
  RxBool isUnitEnabled = false.obs;
  RxBool isPriceEnabled = false.obs;

  TextEditingController timeController = TextEditingController();
  TextEditingController unitController = TextEditingController();
  TextEditingController priceController = TextEditingController();

  Get.bottomSheet(
    Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Set Your Auto Stop',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
              color: Theme.of(context).textTheme.bodyLarge?.color,
            ),
          ),
          const SizedBox(height: 20),
          Obx(() => Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Time',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              Switch(
                value: isTimeEnabled.value,
                onChanged: (value) {
                  isTimeEnabled.value = value;
                  if (!value) timeController.clear();
                },
                activeColor: Colors.indigo,
              ),
            ],
          )),
          Obx(() => isTimeEnabled.value
              ? Row(
            children: [
              Expanded(
                child: TextField(
                  controller: timeController,
                  keyboardType: TextInputType.number,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                  ],
                  decoration: InputDecoration(
                    labelText: 'Enter Time',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Text(
                'mins',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
            ],
          )
              : const SizedBox.shrink()),
          const SizedBox(height: 20),
          Obx(() => Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Unit',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              Switch(
                value: isUnitEnabled.value,
                onChanged: (value) {
                  isUnitEnabled.value = value;
                  if (!value) unitController.clear();
                },
                activeColor: Colors.indigo,
              ),
            ],
          )),
          Obx(() => isUnitEnabled.value
              ? Row(
            children: [
              Expanded(
                child: TextField(
                  controller: unitController,
                  keyboardType: TextInputType.number,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                  ],
                  decoration: InputDecoration(
                    labelText: 'Enter Unit',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Text(
                'unit',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
            ],
          )
              : const SizedBox.shrink()),
          const SizedBox(height: 20),
          Obx(() => Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Price',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              Switch(
                value: isPriceEnabled.value,
                onChanged: (value) {
                  isPriceEnabled.value = value;
                  if (!value) priceController.clear();
                },
                activeColor: Colors.indigo,
              ),
            ],
          )),
          Obx(() => isPriceEnabled.value
              ? Row(
            children: [
              Expanded(
                child: TextField(
                  controller: priceController,
                  keyboardType: TextInputType.number,
                  inputFormatters: [
                    FilteringTextInputFormatter.allow(RegExp(r'[0-9.]')),
                    TextInputFormatter.withFunction((oldValue, newValue) {
                      final parts = newValue.text.split('.');
                      if (parts.length > 2) {
                        return oldValue;
                      }
                      if (parts.length == 2 && parts[1].length > 3) {
                        return oldValue;
                      }
                      return newValue;
                    }),
                  ],
                  decoration: InputDecoration(
                    labelText: 'Enter Price',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Text(
                'Rs',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
            ],
          )
              : const SizedBox.shrink()),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                if (isTimeEnabled.value && timeController.text.isNotEmpty) {
                  final time = int.tryParse(timeController.text);
                  if (time == null || time < 1) {
                    Get.snackbar('Error', 'Time must be at least 1 minute');
                    return;
                  }
                }
                if (isPriceEnabled.value && priceController.text.isNotEmpty) {
                  final price = double.tryParse(priceController.text);
                  if (price == null || price <= 0) {
                    Get.snackbar('Error', 'Price must be a positive number');
                    return;
                  }
                }
                if (isUnitEnabled.value && unitController.text.isNotEmpty) {
                  final unit = int.tryParse(unitController.text);
                  if (unit == null || unit < 1) {
                    Get.snackbar('Error', 'Unit must be at least 1');
                    return;
                  }
                }
                Map<String, dynamic> autoStopSettings = {};
                if (isTimeEnabled.value && timeController.text.isNotEmpty) {
                  autoStopSettings['time'] = int.tryParse(timeController.text);
                }
                if (isUnitEnabled.value && unitController.text.isNotEmpty) {
                  autoStopSettings['unit'] = int.tryParse(unitController.text);
                }
                if (isPriceEnabled.value && priceController.text.isNotEmpty) {
                  autoStopSettings['price'] = double.tryParse(priceController.text);
                }
                debugPrint('Auto-stop settings: $autoStopSettings');
                Get.back();
                Get.snackbar('Success', 'Auto-stop settings saved');
              },
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 15),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                'Save',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ],
      ),
    ),
    isScrollControlled: true,
  );
}

class ChargingPage extends StatelessWidget {
  final String chargerId;
  final Map<String, dynamic> chargerDetails;
  final String connectorId;
  final Map<String, dynamic> connectorDetails;
  final double unitPrice;

  const ChargingPage({
    super.key,
    required this.chargerId,
    required this.chargerDetails,
    required this.connectorId,
    required this.connectorDetails,
    this.unitPrice = 0.0,
  });

  @override
  Widget build(BuildContext context) {
    final connectorType = connectorDetails['type'] is int
        ? connectorDetails['type'] as int
        : int.tryParse(connectorDetails['type'].toString()) ?? 0;

    // Initialize the controller
    final controller = Get.put(
      ChargingPageController()
        ..chargerId = chargerId
        ..connectorId = int.parse(connectorId)
        ..connectorType = connectorType,
      tag: '$chargerId-$connectorId',
    );

    final theme = Theme.of(context);
    final iconColor = theme.iconTheme.color;
    final textStyle = theme.textTheme.bodyLarge!;
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;

    debugPrint('Charging details: $chargerDetails');
    debugPrint('Connector details: $connectorDetails');

    return WillPopScope(
      onWillPop: () async {
        return false;
      },
      child: Obx(() => LoadingOverlay(
        isLoading: controller.isLoading.value || controller.isEndingSession.value,
        child: Scaffold(
          backgroundColor: theme.scaffoldBackgroundColor,
          body: Stack(
            children: [
              SafeArea(
                child: SingleChildScrollView(
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: screenWidth * 0.04),
                    child: Column(
                      children: [
                        Container(
                          width: double.infinity,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              IconButton(
                                icon: Icon(Icons.arrow_back, color: iconColor),
                                onPressed: () async {
                                  controller.isLoading.value = true;
                                  try {
                                    controller.isPageActive(false);
                                    controller.disconnectWebSocket();
                                    await controller.endChargingSession(
                                      connectorId: int.parse(connectorId),
                                      chargerId: chargerId,
                                    );
                                    Get.delete<ChargingPageController>(
                                        tag: '$chargerId-$connectorId');
                                  } catch (e) {
                                    // Error handling is done in endChargingSession
                                  }
                                },
                              ),
                              Row(
                                children: [
                                  IconButton(
                                    icon: Icon(Icons.settings, color: Colors.indigo),
                                    onPressed: () {
                                      _showAutoStopSettingsModal(context);
                                    },
                                  ),
                                  IconButton(
                                    icon: Icon(Icons.more_vert, color: iconColor),
                                    onPressed: () {
                                      Get.snackbar('Info', 'More options not yet implemented');
                                    },
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        Container(
                          height: screenHeight * 0.01,
                        ),
                        Container(
                          width: double.infinity,
                          padding: EdgeInsets.symmetric(
                            vertical: screenHeight * 0.01,
                            horizontal: screenWidth * 0.02,
                          ),
                          decoration: BoxDecoration(
                            color: controller.isWebSocketConnected.value
                                ? Colors.green.withOpacity(0.1)
                                : controller.isReconnecting.value
                                ? Colors.orange.withOpacity(0.1)
                                : Colors.red.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                controller.isWebSocketConnected.value
                                    ? Icons.wifi
                                    : controller.isReconnecting.value
                                    ? Icons.sync
                                    : Icons.wifi_off,
                                color: controller.isWebSocketConnected.value
                                    ? Colors.green
                                    : controller.isReconnecting.value
                                    ? Colors.orange
                                    : Colors.red,
                                size: 16,
                              ),
                              SizedBox(width: screenWidth * 0.01),
                              Text(
                                controller.isWebSocketConnected.value
                                    ? 'Live Data Connected'
                                    : controller.isReconnecting.value
                                    ? 'Reconnecting...'
                                    : 'Live Data Disconnected',
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: controller.isWebSocketConnected.value
                                      ? Colors.green
                                      : controller.isReconnecting.value
                                      ? Colors.orange
                                      : Colors.red,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          height: screenHeight * 0.01,
                        ),
                        Container(
                          padding: EdgeInsets.all(screenWidth * 0.03),
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: theme.dividerColor,
                              width: 0.5,
                            ),
                            borderRadius: BorderRadius.circular(8),
                            color: theme.cardColor,
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              Row(
                                children: [
                                  Image.asset(
                                    'assets/icons/saved_device.png',
                                    height: screenHeight * 0.03,
                                    color: iconColor,
                                  ),
                                  SizedBox(width: screenWidth * 0.02),
                                  Text(chargerId, style: textStyle),
                                ],
                              ),
                              Row(
                                children: [
                                  Container(
                                    width: 2,
                                    height: screenHeight * 0.04,
                                    color: theme.dividerColor,
                                  ),
                                  SizedBox(width: screenWidth * 0.01),
                                  Container(
                                    width: 2,
                                    height: screenHeight * 0.04,
                                    color: theme.dividerColor,
                                  ),
                                ],
                              ),
                              Row(
                                children: [
                                  Image.asset(
                                    connectorType == 1
                                        ? 'assets/icons/wall-socket.png'
                                        : 'assets/icons/charger_gun1.png',
                                    height: screenHeight * 0.03,
                                    color: iconColor,
                                  ),
                                  SizedBox(width: screenWidth * 0.02),
                                  Text(
                                    connectorType == 1 ? 'Socket' : 'Gun',
                                    style: textStyle,
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        Container(
                          height: screenHeight * 0.03,
                        ),
                        Container(
                          height: screenHeight * 0.2,
                          width: MediaQuery.of(context).size.width,
                          padding: EdgeInsets.zero,
                          margin: EdgeInsets.zero,
                          child: Image.asset(
                            Theme.of(context).brightness == Brightness.dark
                                ? 'assets/Image/evblack3.png'
                                : 'assets/Image/evwhite.png',
                            fit: BoxFit.cover,
                            width: MediaQuery.of(context).size.width,
                          ),
                        ),
                        Container(
                          height: screenHeight * 0.02,
                        ),
                        Container(
                          width: double.infinity,
                          padding: EdgeInsets.all(screenWidth * 0.04),
                          margin: EdgeInsets.symmetric(horizontal: screenWidth * 0.04),
                          decoration: BoxDecoration(
                            color: theme.cardColor,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: theme.dividerColor,
                              width: 0.5,
                            ),
                          ),
                          child: Obx(() {
                            if (controller.chargingData.value == null) {
                              return const SizedBox.shrink();
                            }

                            final data = controller.chargingData.value!;
                            final hasMeterValues = controller.energy.value != null ||
                                controller.current.value != null ||
                                controller.power.value != null;

                            return Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Flexible(
                                      child: Container(
                                        padding: EdgeInsets.symmetric(
                                          horizontal: screenWidth * 0.03,
                                          vertical: screenHeight * 0.005,
                                        ),
                                        decoration: BoxDecoration(
                                          color: getStatusColor(data.chargerStatus).withOpacity(0.2),
                                          borderRadius: BorderRadius.circular(20),
                                        ),
                                        child: Text(
                                          data.chargerStatus,
                                          overflow: TextOverflow.ellipsis,
                                          maxLines: 1,
                                          style: textStyle.copyWith(
                                            color: getStatusColor(data.chargerStatus),
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    ),
                                    if (controller.isWebSocketConnected.value)
                                      Flexible(
                                        child: Row(
                                          mainAxisAlignment: MainAxisAlignment.end,
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Container(
                                              width: 8,
                                              height: 8,
                                              decoration: BoxDecoration(
                                                color: Colors.green,
                                                shape: BoxShape.circle,
                                              ),
                                            ),
                                            SizedBox(width: 4),
                                            Text(
                                              'LIVE',
                                              overflow: TextOverflow.ellipsis,
                                              maxLines: 1,
                                              style: theme.textTheme.bodySmall?.copyWith(
                                                color: Colors.green,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                  ],
                                ),
                                SizedBox(height: screenHeight * 0.02),
                                GridView.count(
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  crossAxisCount: 2,
                                  childAspectRatio: 2.5,
                                  crossAxisSpacing: screenWidth * 0.3,
                                  mainAxisSpacing: screenHeight * 0.01,
                                  children: [
                                    _buildDetailItem(
                                      context,
                                      'Last Updated',
                                      data.timestampIST,
                                      Image.asset(
                                        'assets/icons/24-hour.png',
                                        width: 20,
                                        height: 20,
                                        color: Theme.of(context).iconTheme.color,
                                      ),
                                    ),
                                    _buildDetailItem(
                                      context,
                                      'Capacity',
                                      '${data.chargerCapacity} kW',
                                      Image.asset(
                                        'assets/icons/power.png',
                                        width: 20,
                                        height: 20,
                                        color: Theme.of(context).iconTheme.color,
                                      ),
                                    ),
                                    if (data.chargerStatus == 'Faulted' && data.errorCode != null)
                                      _buildDetailItem(
                                        context,
                                        'Error',
                                        data.errorCode!,
                                        Icon(
                                          Icons.error_outline,
                                          size: 20,
                                          color: Colors.red,
                                        ),
                                        isError: true,
                                      ),
                                  ],
                                ),
                                if (controller.showMeterValues.value && hasMeterValues) ...[
                                  SizedBox(height: screenHeight * 0.02),
                                  Container(
                                    padding: EdgeInsets.all(screenWidth * 0.02),
                                    decoration: BoxDecoration(
                                      color: Colors.grey.shade100,
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: Column(
                                      children: [
                                        GridView.count(
                                          shrinkWrap: true,
                                          physics: const NeverScrollableScrollPhysics(),
                                          crossAxisCount: 2,
                                          childAspectRatio: 1.5,
                                          crossAxisSpacing: screenWidth * 0.02,
                                          mainAxisSpacing: screenHeight * 0.01,
                                          children: [
                                            if (controller.energy.value != null)
                                              _buildMeterValueItem(
                                                context,
                                                'Energy',
                                                controller.energy.value!,
                                                'kWh',
                                                Colors.purpleAccent.withOpacity(0.1),
                                              ),
                                            if (controller.energy.value != null)
                                              _buildLivePriceItem(
                                                context,
                                                'Live Price',
                                                controller.livePrice.value,
                                                'Rs',
                                                Colors.cyanAccent.withOpacity(0.1),
                                              ),
                                            if (controller.current.value != null)
                                              _buildMeterValueItem(
                                                context,
                                                'Current',
                                                controller.current.value!,
                                                'A',
                                                Colors.orangeAccent.withOpacity(0.1),
                                              ),
                                            if (controller.power.value != null)
                                              _buildMeterValueItem(
                                                context,
                                                'Speed',
                                                controller.power.value!,
                                                'kW',
                                                Colors.greenAccent.withOpacity(0.1),
                                              ),
                                          ],
                                        ),
                                        if (controller.startedAt.value != null)
                                          Center(
                                            child: Padding(
                                              padding: EdgeInsets.only(top: screenHeight * 0.01),
                                              child: Text(
                                                'Started At: ${DateFormat('yyyy-MM-dd HH:mm:ss').format(controller.startedAt.value!)}',
                                                style: theme.textTheme.bodySmall?.copyWith(
                                                  color: theme.hintColor,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ),
                                          ),
                                      ],
                                    ),
                                  ),
                                ],
                                if (data.chargerStatus == 'Charging' &&
                                    controller.showMeterValues.value &&
                                    hasMeterValues) ...[
                                  SizedBox(height: screenHeight * 0.02),
                                  Container(
                                    width: double.infinity,
                                    padding: EdgeInsets.symmetric(horizontal: 10),
                                    child: SliderButton(
                                      action: () async {
                                        if (controller.isLoading.value || controller.isEndingSession.value) {
                                          return false;
                                        }
                                        controller.isEndingSession.value = true;
                                        try {
                                          await controller.stopchargingsession(
                                            connectorId: int.parse(connectorId),
                                            chargerId: chargerId,
                                          );
                                        } catch (e) {
                                          // Error handling is done in stopchargingsession
                                        }
                                        controller.isEndingSession.value = false;
                                        return true;
                                      },
                                      label: Text(
                                        'Slide to Stop Charging',
                                        style: TextStyle(
                                          color: Colors.black87,
                                          fontWeight: FontWeight.w500,
                                          fontSize: 16,
                                        ),
                                      ),
                                      icon: Icon(
                                        Icons.stop,
                                        color: Colors.white,
                                        size: 30,
                                      ),
                                      width: screenWidth * 0.9,
                                      height: 60,
                                      buttonSize: 50,
                                      radius: 12,
                                      buttonColor: Colors.red,
                                      backgroundColor: Colors.grey.shade200,
                                      highlightedColor: Colors.white,
                                      baseColor: Colors.red.shade300,
                                      shimmer: true,
                                      vibrationFlag: true,
                                      boxShadow: BoxShadow(
                                        color: Colors.black.withOpacity(0.2),
                                        blurRadius: 4,
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            );
                          }),
                        ),
                        Container(
                          height: screenHeight * 0.03,
                        ),
                        Container(
                          width: double.infinity,
                          child: Obx(() {
                            final chargerStatus = controller.chargingData.value?.chargerStatus;

                            if (chargerStatus == 'Preparing') {
                              return SliderButton(
                                action: () async {
                                  if (controller.isLoading.value || controller.isEndingSession.value) {
                                    return false;
                                  }
                                  try {
                                    controller.isLoading.value = true;
                                    await controller.startChargingSession(
                                      connectorId: int.parse(connectorId),
                                      chargerId: chargerId,
                                    );
                                    return true;
                                  } catch (e) {
                                    Get.snackbar('Error', 'Failed to start charging: $e');
                                    return false;
                                  } finally {
                                    controller.isLoading.value = false;
                                  }
                                },
                                label: Text(
                                  'Slide to Start Charging',
                                  style: TextStyle(
                                    color: Colors.black87,
                                    fontWeight: FontWeight.w500,
                                    fontSize: 16,
                                  ),
                                ),
                                icon: Icon(
                                  Icons.bolt,
                                  color: Colors.green,
                                  size: 30,
                                ),
                                width: screenWidth * 0.9,
                                height: 60,
                                buttonSize: 50,
                                radius: 12,
                                buttonColor: Colors.black,
                                backgroundColor: Colors.grey.shade200,
                                highlightedColor: Colors.white,
                                baseColor: Colors.green.shade300,
                                shimmer: true,
                                vibrationFlag: true,
                                boxShadow: BoxShadow(
                                  color: Colors.black.withOpacity(0.2),
                                  blurRadius: 4,
                                ),
                              );
                            }
                            return const SizedBox.shrink();
                          }),
                        ),
                        Container(
                          height: screenHeight * 0.03,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              Obx(() => controller.isInitialLoading.value
                  ? Container(
                color: theme.scaffoldBackgroundColor.withOpacity(0.8),
                child: const Center(
                  child: LoadingIndicator(),
                ),
              )
                  : const SizedBox.shrink()),
            ],
          ),
        ),
      )),
    );
  }

  Widget _buildDetailItem(
      BuildContext context,
      String title,
      String value,
      Widget icon, {
        bool isError = false,
      }) {
    final theme = Theme.of(context);
    return Row(
      children: [
        SizedBox(
          width: 20,
          height: 20,
          child: icon,
        ),
        SizedBox(width: MediaQuery.of(context).size.width * 0.02),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                title,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.hintColor,
                ),
                overflow: TextOverflow.ellipsis,
              ),
              Text(
                value,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: isError ? Colors.red : null,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMeterValueItem(
      BuildContext context,
      String label,
      double value,
      String unit,
      Color backgroundColor,
      ) {
    final theme = Theme.of(context);
    return Container(
      padding: EdgeInsets.all(MediaQuery.of(context).size.width * 0.03),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: theme.dividerColor.withOpacity(0.5),
          width: 1,
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.hintColor,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 4),
          Text(
            '${value.toStringAsFixed(2)} $unit',
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: theme.textTheme.bodyLarge?.color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLivePriceItem(
      BuildContext context,
      String label,
      double value,
      String unit,
      Color backgroundColor,
      ) {
    final theme = Theme.of(context);
    return Container(
      padding: EdgeInsets.all(MediaQuery.of(context).size.width * 0.03),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: theme.dividerColor.withOpacity(0.5),
          width: 1,
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.hintColor,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 4),
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 500),
            transitionBuilder: (Widget child, Animation<double> animation) {
              return FadeTransition(
                opacity: animation,
                child: ScaleTransition(
                  scale: animation,
                  child: child,
                ),
              );
            },
            child: Text(
              '${value.toStringAsFixed(2)} $unit',
              key: ValueKey<double>(value),
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: theme.textTheme.bodyLarge?.color,
              ),
            ),
          ),
        ],
      ),
    );
  }
}