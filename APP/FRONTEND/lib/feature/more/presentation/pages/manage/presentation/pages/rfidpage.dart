import 'package:flutter/material.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/controllers/controller.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:shimmer/shimmer.dart';

class RfidPage extends StatelessWidget {
  final int userId;
  final String username;
  final String emailId;
  final String token;

  const RfidPage({
    super.key,
    required this.userId,
    required this.username,
    required this.emailId,
    required this.token,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;
    final ManageController controller = Get.put(ManageController());

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.all(screenWidth * 0.1),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Manage Your RFID Card',
                      style: theme.textTheme.headlineSmall
                          ?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: screenHeight * 0.02),
                    Text(
                      "Your RFID card allows seamless and secure access. Register, manage, or deactivate your RFID here.",
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.6),
                      ),
                    ),
                    SizedBox(height: screenHeight * 0.1),
                    Container(
                      height: screenHeight * 0.34,
                      width: screenWidth * 0.9,
                      margin: EdgeInsets.only(
                          left: MediaQuery.of(context).size.width * 0.05),
                      child: Image.asset(
                        "assets/Image/Rfid.png",
                        fit: BoxFit.cover,
                      ),
                    ),
                    SizedBox(height: screenHeight * 0.05),
                  ],
                ),
              ),
            ),

            // Buttons
            Padding(
              padding: EdgeInsets.all(screenWidth * 0.05),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        padding:
                            EdgeInsets.symmetric(vertical: screenHeight * 0.02),
                        backgroundColor: theme.colorScheme.primary,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8)),
                      ),
                      onPressed: () async {
                        await controller.fetchRFIDData(emailId, token);
                        showModalBottomSheet(
                          context: context,
                          shape: RoundedRectangleBorder(
                            borderRadius:
                                BorderRadius.vertical(top: Radius.circular(16)),
                          ),
                          builder: (context) {
                            return RFIDBottomSheet(
                              controller: controller,
                              emailId: emailId,
                              userId: userId,
                              token: token,
                            );
                          },
                        );
                      },
                      icon: Icon(Icons.credit_card,
                          color: theme.colorScheme.onPrimary),
                      label: Text(
                        "Manage your RFID card",
                        style: theme.textTheme.labelLarge?.copyWith(
                          color: theme.colorScheme.onPrimary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(height: screenHeight * 0.02),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        padding:
                            EdgeInsets.symmetric(vertical: screenHeight * 0.02),
                        side: BorderSide(
                            color: theme.colorScheme.primary, width: 1),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8)),
                      ),
                      onPressed: () {
                        Navigator.pop(context);
                      },
                      icon: Icon(Icons.arrow_back,
                          color: theme.colorScheme.primary),
                      label: Text(
                        "Go Back",
                        style: theme.textTheme.labelLarge?.copyWith(
                          color: theme.colorScheme.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class RFIDBottomSheet extends StatelessWidget {
  final ManageController controller;
  final int userId;
  final String emailId;
  final String token;

  const RFIDBottomSheet({
    Key? key,
    required this.controller,
    required this.userId,
    required this.emailId,
    required this.token,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "RFID Details",
                style: theme.textTheme.titleLarge
                    ?.copyWith(fontWeight: FontWeight.bold),
              ),
              IconButton(
                icon: Icon(Icons.close,
                    color: theme.iconTheme.color?.withOpacity(0.6)),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          Divider(color: theme.dividerColor, thickness: 0.5),
          const SizedBox(height: 10),
          Obx(() {
            if (controller.isLoading.value) {
              return _buildShimmerEffect();
            }

            final rfidData = controller.rfidData.value;
            if (rfidData == null || rfidData.message == null) {
              return _buildMessageCard("No RFID data available.", theme);
            }

            if (rfidData.message is String) {
              return _buildMessageCard(rfidData.message, theme);
            }

            final data = rfidData.message as Map<String, dynamic>;
            String rfid = data['tag_id'] ?? "N/A";
            bool isActive = data['status'] ?? false;
            String statusText = isActive ? "Active" : "Inactive";
            String expirydate = formatToIST(data['tag_id_expiry_date']);

            return Column(
              children: [
                _buildInfoCard("Tag Id : $rfid", theme),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                        child:
                            _buildInfoCard("Expiry Date:\n$expirydate", theme)),
                    const SizedBox(width: 10),
                    Expanded(
                        child: _buildStatusCard(statusText, isActive, theme)),
                  ],
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: isActive
                        ? () async {
                            await controller.Deactivaterfidc(
                              emailId,
                              token,
                              userId,
                              rfid,
                              false,
                            );
                            await controller.fetchRFIDData(emailId, token);
                          }
                        : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isActive
                          ? theme.colorScheme.error
                          : theme.disabledColor,
                      foregroundColor: theme.colorScheme.onError,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8)),
                    ),
                    child: Text(
                      "Block RFID",
                      style: theme.textTheme.titleMedium?.copyWith(
                        color: theme.colorScheme.onError,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 10),
              ],
            );
          }),
        ],
      ),
    );
  }

  String formatToIST(String? dateString) {
    if (dateString == null || dateString.isEmpty || dateString == "N/A") {
      return "N/A";
    }
    try {
      DateTime utcTime = DateTime.parse(dateString).toUtc();
      DateTime istTime = utcTime.add(const Duration(hours: 5, minutes: 30));
      return DateFormat("dd/MM/yyyy hh:mm a").format(istTime);
    } catch (e) {
      return "Invalid Date";
    }
  }

  Widget _buildMessageCard(String message, ThemeData theme) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceVariant,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: theme.dividerColor),
      ),
      child: Center(
        child: Text(
          message,
          style: theme.textTheme.bodyMedium,
          textAlign: TextAlign.center,
        ),
      ),
    );
  }

  Widget _buildInfoCard(String text, ThemeData theme) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceVariant,
        border: Border.all(color: theme.dividerColor),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Center(
        child: Text(
          text,
          style: theme.textTheme.bodyMedium,
          textAlign: TextAlign.center,
        ),
      ),
    );
  }

  Widget _buildStatusCard(String statusText, bool isActive, ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceVariant,
        border: Border.all(color: theme.dividerColor),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Center(
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 10,
              height: 10,
              margin: const EdgeInsets.only(right: 6),
              decoration: BoxDecoration(
                color: isActive ? Colors.green : theme.colorScheme.error,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 10),
            Text(
              "Status:\n$statusText",
              style: theme.textTheme.bodyMedium
                  ?.copyWith(fontWeight: FontWeight.w500),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildShimmerEffect() {
    return Column(
      children: List.generate(4, (index) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: Shimmer.fromColors(
            baseColor: Colors.grey.shade300,
            highlightColor: Colors.white,
            child: Container(
              width: double.infinity,
              height: 50,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
        );
      }),
    );
  }
}
