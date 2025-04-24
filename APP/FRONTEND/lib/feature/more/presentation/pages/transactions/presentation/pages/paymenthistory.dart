import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/feature/more/presentation/pages/transactions/presentation/controllers/transaction_controller.dart';
import 'package:intl/intl.dart';
import 'package:shimmer/shimmer.dart';

class PaymentHistoryPage extends StatelessWidget {
  final int userId;
  final String username;
  final String emailId;
  final String token;
  final TransactionController controller = Get.put(TransactionController(),
      permanent: true, tag: 'transaction_history');

  PaymentHistoryPage({
    super.key,
    required this.userId,
    required this.username,
    required this.emailId,
    required this.token,
  }) {
    // Use the refreshAllData method to load data with proper error handling
    controller.refreshAllData();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final screenHeight = MediaQuery.of(context).size.height;
    final screenWidth = MediaQuery.of(context).size.width;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          "Payment History",
          style: theme.textTheme.headlineMedium
              ?.copyWith(fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          color: theme.iconTheme.color,
          onPressed: () => Navigator.pop(context),
        ),
        backgroundColor: theme.scaffoldBackgroundColor,
        elevation: 0,
      ),
      body: Obx(() {
        // Show error state
        if (controller.hasError.value) {
          return _buildShimmerList(context);
        }

        // Show loading state
        if (!controller.hasInitialData.value) {
          return _buildShimmerList(context);
        }

        // Show content if we have data
        return RefreshIndicator(
          onRefresh: () => controller.refreshAllData(),
          child: Stack(
            children: [
              SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  children: [
                    Padding(
                      padding: EdgeInsets.symmetric(
                        horizontal: screenWidth * 0.05,
                        vertical: screenHeight * 0.02,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Obx(() => DropdownButton<String>(
                                value: controller.selectedFilter.value,
                                items: const [
                                  DropdownMenuItem(
                                      value: 'All transactions',
                                      child: Text('All transactions')),
                                  DropdownMenuItem(
                                      value: 'Credited',
                                      child: Text('Credited')),
                                  DropdownMenuItem(
                                      value: 'Debited', child: Text('Debited')),
                                ],
                                onChanged: (value) {
                                  if (value != null) {
                                    controller.selectedFilter.value = value;
                                  }
                                },
                              )),
                          ElevatedButton.icon(
                            onPressed: () {
                              showModalBottomSheet(
                                context: context,
                                shape: const RoundedRectangleBorder(
                                  borderRadius: BorderRadius.vertical(
                                      top: Radius.circular(16)),
                                ),
                                isScrollControlled: true,
                                builder: (context) =>
                                    _buildFilterModal(context),
                              );
                            },
                            icon: Icon(Icons.filter_list_alt,
                                color: theme.iconTheme.color),
                            label: Text('Filters',
                                style: theme.textTheme.bodyMedium),
                            style: ElevatedButton.styleFrom(
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(5),
                                side: BorderSide(
                                    color: Colors.grey.shade400, width: 0.5),
                              ),
                              backgroundColor: theme.cardColor,
                              elevation: 0,
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Show a subtle loading indicator at the top when refreshing
                    if (controller.isLoading.value)
                      Padding(
                        padding: EdgeInsets.symmetric(
                            horizontal: screenWidth * 0.05),
                        child: LinearProgressIndicator(
                          backgroundColor:
                              theme.colorScheme.primary.withOpacity(0.1),
                          valueColor: AlwaysStoppedAnimation<Color>(
                            theme.colorScheme.primary,
                          ),
                          minHeight: 2,
                        ),
                      ),
                    SizedBox(
                      height: screenHeight * 0.75,
                      child: Obx(() {
                        if (controller.filteredTransactions.isEmpty) {
                          return Center(
                            child: Text("No transactions found",
                                style: theme.textTheme.bodyMedium),
                          );
                        }
                        return ListView.builder(
                          padding: EdgeInsets.only(bottom: screenHeight * 0.05),
                          itemCount: controller.filteredTransactions.length,
                          itemBuilder: (context, index) {
                            var transaction =
                                controller.filteredTransactions[index];
                            return _buildTransactionItem(
                              transaction['date'] ?? '',
                              transaction['status'] ?? '',
                              transaction['amount']?.toDouble() ?? 0.0,
                              transaction['type'] ?? '',
                              screenWidth,
                              context,
                            );
                          },
                        );
                      }),
                    ),
                  ],
                ),
              ),
              // Show a loading indicator overlay when refreshing
              if (controller.isLoading.value)
                Positioned(
                  top: 10,
                  right: 10,
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.surface.withOpacity(0.7),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          theme.colorScheme.primary,
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildFilterModal(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text("FILTER BY DAYS",
                  style: theme.textTheme.titleMedium
                      ?.copyWith(fontWeight: FontWeight.bold)),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Get.back(),
              ),
            ],
          ),
          const Divider(),
          Column(
            children: [
              _buildRadioButton("Yesterday", 1),
              _buildRadioButton("Last 15 days", 15),
              _buildRadioButton("Last 30 days", 30),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              TextButton.icon(
                onPressed: () {
                  controller.clearsavedfilter();
                  Get.back();
                },
                icon: const Icon(Icons.clear, color: Color(0xFF00008B)),
                label: const Text(
                  "Clear Filters",
                  style: TextStyle(
                      color: Color(0xFF00008B),
                      fontSize: 14,
                      fontWeight: FontWeight.w600),
                ),
                style: TextButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                    side:
                        const BorderSide(color: Color(0xFF00008B), width: 1.5),
                  ),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                ),
              ),
              ElevatedButton.icon(
                onPressed: () {
                  controller.applyFilters();
                  Get.back();
                },
                icon: const Icon(Icons.check, color: Colors.white),
                label: const Text("Apply",
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00008B),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8)),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  elevation: 3,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRadioButton(String label, int days) {
    return Obx(() => RadioListTile<int>(
          title: Text(label),
          value: days,
          groupValue: controller.selectedDays.value,
          onChanged: (int? value) {
            if (value != null) {
              controller.selectedDays.value = value;
            }
          },
        ));
  }

  Widget _buildShimmerList(BuildContext context) {
    final theme = Theme.of(context);

    return Shimmer.fromColors(
      baseColor: theme.brightness == Brightness.dark
          ? Colors.grey[700]!
          : Colors.grey[300]!,
      highlightColor: theme.brightness == Brightness.dark
          ? Colors.grey[600]!
          : Colors.grey[100]!,
      child: Column(
        children: [
          // Filter row shimmer
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: MediaQuery.of(context).size.width * 0.05,
              vertical: MediaQuery.of(context).size.height * 0.02,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Dropdown button shimmer
                Container(
                  width: 150,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                // Filter button shimmer
                Container(
                  width: 100,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(5),
                  ),
                ),
              ],
            ),
          ),
          // Transaction list shimmer
          Expanded(
            child: ListView.builder(
              itemCount: 8,
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).size.height * 0.05,
              ),
              itemBuilder: (context, index) {
                return Container(
                  margin: EdgeInsets.symmetric(
                    horizontal: MediaQuery.of(context).size.width * 0.05,
                    vertical: 4,
                  ),
                  height: 80,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: Row(
                      children: [
                        // Icon placeholder
                        Container(
                          width: 24,
                          height: 24,
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 12),
                        // Content placeholder
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                width: double.infinity,
                                height: 14,
                                color: Colors.white,
                              ),
                              const SizedBox(height: 8),
                              Container(
                                width: 100,
                                height: 14,
                                color: Colors.white,
                              ),
                            ],
                          ),
                        ),
                        // Amount placeholder
                        Container(
                          width: 80,
                          height: 20,
                          color: Colors.white,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTransactionItem(
    String date,
    String status,
    double amount,
    String type,
    double screenWidth,
    BuildContext context,
  ) {
    final theme = Theme.of(context);
    bool isCredited = type.toUpperCase() == 'CREDITED';
    String formattedDate = date;

    try {
      final parsedDate = DateTime.parse(date);
      formattedDate = DateFormat('dd MMM yyyy').format(parsedDate);
    } catch (e) {
      debugPrint("Error parsing date: $e");
    }

    return Container(
      margin: EdgeInsets.symmetric(horizontal: screenWidth * 0.05, vertical: 4),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        color: theme.cardColor,
        boxShadow: [
          BoxShadow(
            color: theme.shadowColor.withOpacity(0.1),
            spreadRadius: 2,
            blurRadius: 5,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: ListTile(
        contentPadding:
            EdgeInsets.symmetric(horizontal: screenWidth * 0.04, vertical: 0),
        leading: Icon(
          isCredited ? Icons.arrow_downward : Icons.arrow_upward,
          color: isCredited ? Colors.green : Colors.red,
        ),
        title: Text(formattedDate, style: theme.textTheme.bodyMedium),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4.0),
          child: Text(
            '₹${amount.toStringAsFixed(2)}',
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: isCredited ? Colors.green : Colors.red,
            ),
          ),
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(type.toUpperCase(), style: theme.textTheme.bodySmall),
            const SizedBox(width: 4),
            Icon(Icons.circle,
                size: 8, color: isCredited ? Colors.green : Colors.red),
            const SizedBox(width: 4),
            Text("SUCCESS", style: theme.textTheme.bodySmall),
          ],
        ),
      ),
    );
  }
}
