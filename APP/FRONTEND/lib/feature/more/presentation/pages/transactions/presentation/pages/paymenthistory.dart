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
  final TransactionController controller = Get.put(TransactionController());

  PaymentHistoryPage({
    super.key,
    required this.userId,
    required this.username,
    required this.emailId,
    required this.token,
  }) {
    controller.fetchTransactionFilter();
    controller.fetchAllTransactions();
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
          style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          color: theme.iconTheme.color,
          onPressed: () => Navigator.pop(context),
        ),
        backgroundColor: theme.scaffoldBackgroundColor,
        elevation: 0,
      ),
      body: SingleChildScrollView(
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
                      DropdownMenuItem(value: 'All transactions', child: Text('All transactions')),
                      DropdownMenuItem(value: 'Credited', child: Text('Credited')),
                      DropdownMenuItem(value: 'Debited', child: Text('Debited')),
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
                          borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                        ),
                        isScrollControlled: true,
                        builder: (context) => _buildFilterModal(context),
                      );
                    },
                    icon: Icon(Icons.filter_list_alt, color: theme.iconTheme.color),
                    label: Text('Filters', style: theme.textTheme.bodyMedium),
                    style: ElevatedButton.styleFrom(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(5),
                        side: BorderSide(color: Colors.grey.shade400, width: 0.5),
                      ),
                      backgroundColor: theme.cardColor,
                      elevation: 0,
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(
              height: screenHeight * 0.75,
              child: Obx(() {
                if (controller.isLoading.value) {
                  return _buildShimmerList();
                }
                if (controller.filteredTransactions.isEmpty) {
                  return Center(
                    child: Text("No transactions found", style: theme.textTheme.bodyMedium),
                  );
                }
                return ListView.builder(
                  padding: EdgeInsets.only(bottom: screenHeight * 0.02),
                  itemCount: controller.filteredTransactions.length,
                  itemBuilder: (context, index) {
                    var transaction = controller.filteredTransactions[index];
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
              Text("FILTER BY DAYS", style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
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
                  style: TextStyle(color: Color(0xFF00008B), fontSize: 14, fontWeight: FontWeight.w600),
                ),
                style: TextButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                    side: const BorderSide(color: Color(0xFF00008B), width: 1.5),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                ),
              ),
              ElevatedButton.icon(
                onPressed: () {
                  controller.applyFilters();
                  Get.back();
                },
                icon: const Icon(Icons.check, color: Colors.white),
                label: const Text("Apply", style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00008B),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
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

  Widget _buildShimmerList() {
    return ListView.builder(
      itemCount: 5,
      itemBuilder: (context, index) {
        return Shimmer.fromColors(
          baseColor: Colors.grey.shade300,
          highlightColor: Colors.grey.shade100,
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            height: 80,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        );
      },
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
      print("Error parsing date: $e");
    }

    return Container(
      margin: EdgeInsets.symmetric(horizontal: screenWidth * 0.05, vertical: 2),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.shade300, width: 0.2),
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
        contentPadding: EdgeInsets.symmetric(horizontal: screenWidth * 0.04, vertical: 0),
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
            Icon(Icons.circle, size: 8, color: isCredited ? Colors.green : Colors.red),
            const SizedBox(width: 4),
            Text("SUCCESS", style: theme.textTheme.bodySmall),
          ],
        ),
      ),
    );
  }
}
