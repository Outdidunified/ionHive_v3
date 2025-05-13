import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'dart:math';
import 'package:flutter/services.dart';
import 'package:ionhive/feature/Chargingpage/presentation/controllers/Chargingpage_controller.dart';
import 'package:ionhive/feature/Chargingpage/presentation/controllers/LivePriceController.dart';
import 'package:ionhive/feature/Chargingpage/presentation/pages/status_helper.dart';
import 'package:ionhive/feature/more/presentation/pages/help&support/presentation/pages/contact%20us.dart';
import 'package:ionhive/utils/slide_action.dart';
import 'package:ionhive/utils/widgets/loading/loading_indicator.dart';
import 'package:ionhive/utils/widgets/loading/loading_overlay.dart';
import 'package:ionhive/feature/landing_page.dart';

void _showAutoStopSettingsModal(BuildContext context, controller) {
  final currentData = controller.chargingData.value;
  final timeController =
      TextEditingController(text: currentData?.autostopTime?.toString() ?? '');
  final unitController =
      TextEditingController(text: currentData?.autostopUnit?.toString() ?? '');
  final priceController =
      TextEditingController(text: currentData?.autostopPrice?.toString() ?? '');
  final isTimeEnabled = RxBool(currentData?.autostopTimeIsChecked ?? false);
  final isUnitEnabled = RxBool(currentData?.autostopUnitIsChecked ?? false);
  final isPriceEnabled = RxBool(currentData?.autostopPriceIsChecked ?? false);

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
            'Auto Stop Settings',
            style: Theme.of(context)
                .textTheme
                .titleLarge
                ?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),
          Obx(() => Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Stop After Time',
                          style: Theme.of(context).textTheme.bodyLarge),
                      Switch(
                        value: isTimeEnabled.value,
                        onChanged: (value) => isTimeEnabled.value = value,
                        activeColor: Theme.of(context).primaryColor,
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: timeController,
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      labelText: 'Minutes',
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8)),
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 12),
                    ),
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  ),
                  const SizedBox(height: 16),
                ],
              )),
          Obx(() => Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Stop After Units',
                          style: Theme.of(context).textTheme.bodyLarge),
                      Switch(
                        value: isUnitEnabled.value,
                        onChanged: (value) => isUnitEnabled.value = value,
                        activeColor: Theme.of(context).primaryColor,
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: unitController,
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      labelText: 'kWh',
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8)),
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 12),
                    ),
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  ),
                  const SizedBox(height: 16),
                ],
              )),
          Obx(() => Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Stop After Price',
                          style: Theme.of(context).textTheme.bodyLarge),
                      Switch(
                        value: isPriceEnabled.value,
                        onChanged: (value) => isPriceEnabled.value = value,
                        activeColor: Theme.of(context).primaryColor,
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: priceController,
                    keyboardType:
                        TextInputType.numberWithOptions(decimal: true),
                    decoration: InputDecoration(
                      labelText: 'Rupees',
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8)),
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 12),
                    ),
                    inputFormatters: [
                      FilteringTextInputFormatter.allow(
                          RegExp(r'^\d+\.?\d{0,2}'))
                    ],
                  ),
                  const SizedBox(height: 16),
                ],
              )),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => Get.back(),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('CANCEL'),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: ElevatedButton(
                  onPressed: () async {
                    try {
                      if (isTimeEnabled.value && timeController.text.isEmpty) {
                        throw 'Please enter time value or disable time setting';
                      }
                      if (isUnitEnabled.value && unitController.text.isEmpty) {
                        throw 'Please enter unit value or disable unit setting';
                      }
                      if (isPriceEnabled.value &&
                          priceController.text.isEmpty) {
                        throw 'Please enter price value or disable price setting';
                      }
                      if (isTimeEnabled.value &&
                          int.tryParse(timeController.text) == 0) {
                        throw 'Time value must be greater than 0';
                      }
                      if (isUnitEnabled.value &&
                          int.tryParse(unitController.text) == 0) {
                        throw 'Unit value must be greater than 0';
                      }
                      if (isPriceEnabled.value &&
                          double.tryParse(priceController.text) == 0) {
                        throw 'Price value must be greater than 0';
                      }
                      final updateData = {
                        'autostop_time': timeController.text.isNotEmpty
                            ? int.tryParse(timeController.text)
                            : null,
                        'autostop_time_is_checked': isTimeEnabled.value,
                        'autostop_unit': unitController.text.isNotEmpty
                            ? int.tryParse(unitController.text)
                            : null,
                        'autostop_unit_is_checked': isUnitEnabled.value,
                        'autostop_price': priceController.text.isNotEmpty
                            ? double.tryParse(priceController.text)
                            : null,
                        'autostop_price_is_checked': isPriceEnabled.value,
                      };
                      await controller.updateAutoStopSettings(updateData);
                    } catch (e) {
                      Get.snackbar('Error', e.toString(),
                          snackPosition: SnackPosition.BOTTOM);
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('SAVE'),
                ),
              ),
            ],
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

    final controller = Get.put(
      ChargingPageController()
        ..chargerId = chargerId
        ..connectorId = int.parse(connectorId)
        ..connectorType = connectorType,
      tag: '$chargerId-$connectorId',
    );

    // Add state variable for disabling the stop button
    final isStopButtonDisabled = RxBool(false);

    final theme = Theme.of(context);
    final iconColor = theme.iconTheme.color;
    final textStyle = theme.textTheme.bodyLarge!;
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;

    debugPrint('Charging details: $chargerDetails');
    debugPrint('Connector details: $connectorDetails');

    return WillPopScope(
      onWillPop: () async => false,
      child: Obx(() => LoadingOverlay(
            isLoading: controller.isLoading.value ||
                controller.isEndingSession.value ||
                controller.isWaitingForStatusUpdate.value,
            child: Scaffold(
              backgroundColor: theme.scaffoldBackgroundColor,
              body: Stack(
                children: [
                  SafeArea(
                    child: SingleChildScrollView(
                      child: Column(
                        children: [
                          Padding(
                            padding: EdgeInsets.symmetric(
                                horizontal: screenWidth * 0.04),
                            child: SizedBox(
                              width: double.infinity,
                              child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  IconButton(
                                    icon: Icon(Icons.arrow_back,
                                        color: iconColor),
                                    onPressed: () async {
                                      controller.isLoading.value = true;
                                      try {
                                        controller.isPageActive(false);
                                        controller.disconnectWebSocket();
                                        await controller.endChargingSession(
                                          connectorId: int.parse(connectorId),
                                          chargerId: chargerId,
                                        );
                                        // Delete the controller instance to prevent memory leaks
                                        Get.delete<ChargingPageController>(
                                            tag: '$chargerId-$connectorId');
                                        // Navigation is handled in endChargingSession with Get.offAll
                                      } catch (e) {
                                        // If there's an error, still navigate to landing page
                                        Get.offAll(
                                          () => LandingPage(),
                                          transition: Transition.rightToLeft,
                                          duration:
                                              const Duration(milliseconds: 300),
                                        );
                                      }
                                    },
                                  ),
                                  Row(
                                    children: [
                                      Obx(() {
                                        final isCharging = controller
                                                .chargingData
                                                .value
                                                ?.chargerStatus ==
                                            'Charging';
                                        return Stack(
                                          alignment: Alignment.center,
                                          children: [
                                            IconButton(
                                              icon: Icon(
                                                Icons.settings,
                                                color: isCharging
                                                    ? Colors.indigo
                                                        .withOpacity(0.5)
                                                    : Colors.indigo,
                                              ),
                                              onPressed: isCharging
                                                  ? null
                                                  : () =>
                                                      _showAutoStopSettingsModal(
                                                          context, controller),
                                            ),
                                            if (isCharging)
                                              Positioned(
                                                left: 8,
                                                right: 8,
                                                child: Transform.rotate(
                                                  angle: 45 * 3.14159 / 180,
                                                  child: Container(
                                                      height: 2,
                                                      color: Colors.red),
                                                ),
                                              ),
                                          ],
                                        );
                                      }),
                                      GestureDetector(
                                        onTap: () {
                                          // Use Get.off to prevent going back to charging page
                                          controller.isPageActive(false);
                                          controller.disconnectWebSocket();
                                          Get.off(() => ContactUs(),
                                              transition:
                                                  Transition.rightToLeft);
                                        },
                                        child: Container(
                                          padding: EdgeInsets.all(
                                              screenWidth * 0.02),
                                          decoration: BoxDecoration(
                                            color: theme.colorScheme.surface
                                                .withOpacity(0.3),
                                            shape: BoxShape.circle,
                                          ),
                                          child: Image.asset(
                                            'assets/icons/Help1.png',
                                            color: theme.iconTheme.color,
                                            height: screenWidth * 0.04,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                          Container(height: screenHeight * 0.01),
                          Padding(
                            padding: EdgeInsets.symmetric(
                                horizontal: screenWidth * 0.04),
                            child: Container(
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
                                            ? 'Connecting...'
                                            : 'Live Data Disconnected',
                                    style: theme.textTheme.bodySmall?.copyWith(
                                      color:
                                          controller.isWebSocketConnected.value
                                              ? Colors.green
                                              : controller.isReconnecting.value
                                                  ? Colors.orange
                                                  : Colors.red,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  if (controller.isReconnecting.value) ...[
                                    SizedBox(width: screenWidth * 0.02),
                                    OutlinedButton(
                                      onPressed: () {
                                        controller.initWebSocket();
                                        controller.fetchLastStatusData();
                                      },
                                      style: OutlinedButton.styleFrom(
                                        padding: EdgeInsets.symmetric(
                                          horizontal: screenWidth * 0.03,
                                          vertical: screenHeight * 0.005,
                                        ),
                                        shape: RoundedRectangleBorder(
                                            borderRadius:
                                                BorderRadius.circular(8)),
                                        side: BorderSide(
                                            color: Colors.orange, width: 1),
                                      ),
                                      child: Text(
                                        'Retry',
                                        style:
                                            theme.textTheme.bodySmall?.copyWith(
                                          color: Colors.orange,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ),
                          Container(height: screenHeight * 0.01),
                          Padding(
                            padding: EdgeInsets.symmetric(
                                horizontal: screenWidth * 0.04),
                            child: Container(
                              padding: EdgeInsets.all(screenWidth * 0.03),
                              decoration: BoxDecoration(
                                border: Border.all(
                                    color: theme.dividerColor, width: 0.5),
                                borderRadius: BorderRadius.circular(8),
                                color: theme.cardColor,
                              ),
                              child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceAround,
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
                                          color: theme.dividerColor),
                                      SizedBox(width: screenWidth * 0.01),
                                      Container(
                                          width: 2,
                                          height: screenHeight * 0.04,
                                          color: theme.dividerColor),
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
                                          style: textStyle),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                          Container(
                            height: screenHeight * 0.33,
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
                          Container(height: screenHeight * 0.02),
                          Container(
                            width: double.infinity,
                            padding: EdgeInsets.all(screenWidth * 0.04),
                            margin: EdgeInsets.symmetric(
                                horizontal: screenWidth * 0.04),
                            decoration: BoxDecoration(
                              color: theme.cardColor,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                  color: theme.dividerColor, width: 0.5),
                            ),
                            child: Obx(() {
                              if (controller.chargingData.value == null) {
                                return const SizedBox.shrink();
                              }

                              final data = controller.chargingData.value!;
                              final hasMeterValues =
                                  controller.energy.value != null ||
                                      controller.current.value != null ||
                                      controller.power.value != null;

                              return Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Flexible(
                                        child: Container(
                                          padding: EdgeInsets.symmetric(
                                            horizontal: screenWidth * 0.03,
                                            vertical: screenHeight * 0.005,
                                          ),
                                          decoration: BoxDecoration(
                                            color: getStatusColor(
                                                    data.chargerStatus)
                                                .withOpacity(0.2),
                                            borderRadius:
                                                BorderRadius.circular(20),
                                          ),
                                          child: Text(
                                            data.chargerStatus,
                                            overflow: TextOverflow.ellipsis,
                                            maxLines: 1,
                                            style: textStyle.copyWith(
                                              color: getStatusColor(
                                                  data.chargerStatus),
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                      ),
                                      if (controller.isWebSocketConnected.value)
                                        Flexible(
                                          child: Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.end,
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
                                                style: theme.textTheme.bodySmall
                                                    ?.copyWith(
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
                                    physics:
                                        const NeverScrollableScrollPhysics(),
                                    crossAxisCount: 2,
                                    childAspectRatio: 3.5,
                                    crossAxisSpacing: screenWidth * 0.05,
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
                                          color:
                                              Theme.of(context).iconTheme.color,
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
                                          color:
                                              Theme.of(context).iconTheme.color,
                                        ),
                                      ),
                                      if (data.chargerStatus == 'Faulted' &&
                                          data.errorCode != null)
                                        _buildDetailItem(
                                          context,
                                          'Error',
                                          data.errorCode,
                                          Icon(Icons.error_outline,
                                              size: 20, color: Colors.red),
                                          isError: true,
                                        ),
                                    ],
                                  ),
                                  SizedBox(height: screenHeight * 0.02),
                                  if (controller.showMeterValues.value &&
                                      hasMeterValues) ...[
                                    SizedBox(height: screenHeight * 0.02),
                                    Container(
                                      padding:
                                          EdgeInsets.all(screenWidth * 0.02),
                                      decoration: BoxDecoration(
                                        color: theme.cardTheme.color,
                                        borderRadius: BorderRadius.circular(10),
                                        border: Border.all(
                                            color: theme.dividerColor
                                                .withOpacity(0.5)),
                                      ),
                                      child: Column(
                                        children: [
                                          GridView.count(
                                            shrinkWrap: true,
                                            physics:
                                                const NeverScrollableScrollPhysics(),
                                            crossAxisCount: 2,
                                            childAspectRatio: 1.5,
                                            crossAxisSpacing:
                                                screenWidth * 0.02,
                                            mainAxisSpacing:
                                                screenHeight * 0.01,
                                            children: [
                                              if (controller.energy.value !=
                                                  null)
                                                _buildMeterValueItem(
                                                  context,
                                                  'Energy',
                                                  controller.energy.value!,
                                                  'wh',
                                                  theme.cardTheme.color ??
                                                      const Color(
                                                          0xFFF5F5F5), // Use theme color
                                                  'assets/icons/save.png',
                                                ),
                                              if (controller.energy.value !=
                                                  null)
                                                buildLivePriceItem(
                                                  context,
                                                  'Live Price',
                                                  controller.livePrice.value,
                                                  'Rs',
                                                  theme.cardTheme.color ??
                                                      const Color(
                                                          0xFFF5F5F5), // Use theme color
                                                ),
                                              if (controller.current.value !=
                                                  null)
                                                _buildMeterValueItem(
                                                  context,
                                                  'Current',
                                                  controller.current.value!,
                                                  'A',
                                                  theme.cardTheme.color ??
                                                      const Color(
                                                          0xFFF5F5F5), // Use theme color
                                                  'assets/icons/flash.png',
                                                ),
                                              if (controller.power.value !=
                                                  null)
                                                _buildMeterValueItem(
                                                  context,
                                                  'Speed',
                                                  controller.power.value!,
                                                  'kW',
                                                  theme.cardTheme.color ??
                                                      const Color(
                                                          0xFFF5F5F5), // Use theme color
                                                  'assets/icons/speedometer.png',
                                                ),
                                            ],
                                          ),
                                          if (controller.startedAt.value !=
                                              null)
                                            Center(
                                              child: Padding(
                                                padding: EdgeInsets.only(
                                                    top: screenHeight * 0.01),
                                                child: Text(
                                                  'Started At: ${DateFormat('dd-mm-yyyy HH:mm:ss a').format(controller.startedAt.value!)}',
                                                  style: theme
                                                      .textTheme.bodySmall
                                                      ?.copyWith(
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
                                  if (data.chargerStatus == 'Charging') ...[
                                    SizedBox(height: screenHeight * 0.02),
                                    Padding(
                                      padding: EdgeInsets.symmetric(
                                          horizontal: screenWidth * 0.04),
                                      child: SizedBox(
                                        width: double.infinity,
                                        child: CustomSlideAction(
                                          label:
                                              '            Slide to Stop Charging',
                                          onSubmit: () async {
                                            if (controller.isLoading.value ||
                                                controller
                                                    .isEndingSession.value ||
                                                isStopButtonDisabled.value) {
                                              return;
                                            }
                                            controller.isEndingSession.value =
                                                true;
                                            try {
                                              await controller
                                                  .stopchargingsession(
                                                connectorId:
                                                    int.parse(connectorId),
                                                chargerId: chargerId,
                                              );
                                              isStopButtonDisabled.value = true;
                                            } catch (e) {
                                              Get.snackbar(
                                                'Error',
                                                'Failed to stop charging: ${e.toString()}',
                                                snackPosition:
                                                    SnackPosition.BOTTOM,
                                                backgroundColor: Colors.red,
                                                colorText: Colors.white,
                                              );
                                            } finally {
                                              controller.isEndingSession.value =
                                                  false;
                                            }
                                          },
                                          icon: Icon(
                                            Icons.stop,
                                            color: theme.brightness ==
                                                    Brightness.dark
                                                ? Colors.white
                                                : Colors
                                                    .white, // Match theme-based coloring
                                          ),
                                          height: 65,
                                          borderRadius: 20,
                                          backgroundColor: theme.brightness ==
                                                  Brightness.dark
                                              ? theme.colorScheme.surface
                                              : Colors.grey
                                                  .shade200, // Match Start Charging background
                                          sliderButtonColor: Colors
                                              .red, // Distinct color for stop action
                                          textColor:
                                              theme.textTheme.bodyLarge?.color,
                                        ),
                                      ),
                                    ),
                                  ],
                                ],
                              );
                            }),
                          ),
                          Container(height: screenHeight * 0.03),
                          Padding(
                            padding: EdgeInsets.symmetric(
                                horizontal: screenWidth * 0.04),
                            child: SizedBox(
                              width: double.infinity,
                              child: Obx(() {
                                final chargerStatus = controller
                                    .chargingData.value?.chargerStatus;
                                if (chargerStatus == 'Preparing') {
                                  return CustomSlideAction(
                                    label: 'Slide to Start Charging',
                                    onSubmit: () async {
                                      if (controller.isLoading.value ||
                                          controller.isEndingSession.value) {
                                        return;
                                      }
                                      try {
                                        controller.isLoading.value = true;
                                        await controller.startChargingSession(
                                          connectorId: int.parse(connectorId),
                                          chargerId: chargerId,
                                        );
                                      } catch (e) {
                                        Get.snackbar('Error',
                                            'Failed to start charging: $e');
                                      } finally {
                                        controller.isLoading.value = false;
                                      }
                                    },
                                    icon: Icon(
                                      Icons.bolt,
                                      color: theme.brightness == Brightness.dark
                                          ? Colors.white
                                          : Colors.green,
                                    ),
                                    height: 65,
                                    borderRadius: 20,
                                    backgroundColor:
                                        theme.brightness == Brightness.dark
                                            ? theme.colorScheme.surface
                                            : Colors.grey.shade200,
                                    sliderButtonColor:
                                        theme.brightness == Brightness.dark
                                            ? Colors.green
                                            : Colors.black,
                                    textColor: theme.textTheme.bodyLarge?.color,
                                  );
                                }
                                return const SizedBox.shrink();
                              }),
                            ),
                          ),
                          Container(height: screenHeight * 0.03),
                        ],
                      ),
                    ),
                  ),
                  Obx(() => controller.isInitialLoading.value
                      ? Container(
                          color: theme.scaffoldBackgroundColor.withOpacity(0.8),
                          child: const Center(child: LoadingIndicator()),
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
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(width: 20, height: 50, child: icon),
        SizedBox(width: MediaQuery.of(context).size.width * 0.02),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Flexible(
                child: Text(
                  title,
                  style: theme.textTheme.bodySmall
                      ?.copyWith(color: theme.hintColor),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              SizedBox(height: 2),
              Flexible(
                child: Text(
                  value,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: isError ? Colors.red : null,
                  ),
                  softWrap: true,
                  overflow: TextOverflow.visible,
                ),
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
    String iconPath,
  ) {
    final theme = Theme.of(context);
    final screenWidth = MediaQuery.of(context).size.width;
    return Container(
      padding: EdgeInsets.all(screenWidth * 0.03),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(10),
        border:
            Border.all(color: theme.dividerColor.withOpacity(0.5), width: 1),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          Image.asset(
            iconPath,
            width: screenWidth * 0.08,
            height: screenWidth * 0.08,
            color: theme.brightness == Brightness.dark
                ? Colors.white
                : Colors.black, // Dynamic icon color
          ),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 8),
              Text(
                label,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.hintColor,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                '${value.toStringAsFixed(2)} $unit',
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: theme.textTheme.bodyLarge?.color,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget buildLivePriceItem(
    BuildContext context,
    String label,
    double value,
    String unit,
    Color backgroundColor,
  ) {
    final theme = Theme.of(context);
    final screenWidth = MediaQuery.of(context).size.width;
    final LivePriceController controller = Get.find();
    return Container(
      padding: EdgeInsets.all(screenWidth * 0.03),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(10),
        border:
            Border.all(color: theme.dividerColor.withOpacity(0.5), width: 1),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          AnimatedBuilder(
            animation: controller.rotationController,
            builder: (context, child) {
              return Transform(
                alignment: Alignment.center,
                transform: Matrix4.rotationY(
                    controller.rotationController.value * 1 * pi),
                child: Image.asset(
                  'assets/icons/rupee.png',
                  width: screenWidth * 0.09,
                  height: screenWidth * 0.09,
                ),
              );
            },
          ),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                label,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.hintColor,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 500),
                transitionBuilder: (child, animation) => FadeTransition(
                  opacity: animation,
                  child: ScaleTransition(scale: animation, child: child),
                ),
                child: Text(
                  '${value.toStringAsFixed(2)} $unit',
                  key: ValueKey<double>(value),
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Colors.green,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
