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
    final screenHeight = MediaQuery.of(context).size.height;
    final screenWidth = MediaQuery.of(context).size.width;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Payment History",
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
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
                        controller.selectedFilter.value = value; // Update filter
                      }
                    },
                  )),


                  ElevatedButton.icon(
                    onPressed: () {

                      showModalBottomSheet(
                        context: context,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                        ),
                        isScrollControlled: true,
                        builder: (context) => _buildFilterModal(),
                      );
                    },
                    icon: const Icon(Icons.filter_list_alt, color: Colors.black),
                    label: const Text('Filters', style: TextStyle(color: Colors.black)),
                    style: ElevatedButton.styleFrom(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(5),
                        side: const BorderSide(color: Colors.grey, width: 0.5),
                      ),
                      backgroundColor: Colors.white,
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
                  return const Center(child: Text("No transactions found"));
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

  Widget _buildFilterModal() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("FILTER BY DAYS", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Get.back(), // Close the modal
              ),
            ],
          ),
          const Divider(),

          // Filter Options (Example: Date Filter)
          Column(
            children: [
              _buildRadioButton("Yesterday", 1),
              _buildRadioButton("Last 15 days", 15),
              _buildRadioButton("Last 30 days", 30),
            ],
          ),

          const SizedBox(height: 20),

          // Buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              TextButton.icon(
                onPressed: ()  {
                  controller.clearsavedfilter();
                  Get.back(); // Close modal
                },
                icon: const Icon(Icons.clear, color: Color(0xFF00008B)), // 🗑️ Clear icon
                label: const Text(
                  "Clear Filters",
                  style: TextStyle(
                    color: Color(0xFF00008B),
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                style: TextButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8), // Rectangular with rounded edges
                    side: const BorderSide(color: Color(0xFF00008B), width: 1.5), // Blue border
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10), // Padding
                ),
              ),

              ElevatedButton.icon(
                onPressed: () {
                  controller.applyFilters();
                  Get.back(); // Close modal
                },
                icon: const Icon(Icons.check, color: Colors.white), // ✅ Icon added
                label: const Text("Apply", style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00008B), // Dark blue
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8), // Rectangular with slightly rounded corners
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12), // Better padding
                  elevation: 3, // Slight shadow effect
                ),
              ),

            ],
          ),
        ],
      ),
    );
  }

// Helper method to create radio buttons
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

  Widget _buildTransactionItem(String date, String status, double amount, String type, double screenWidth) {
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
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.2),
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
          color: isCredited ? Colors.indigo : Colors.red,
          size: 24,
        ),
        title: Text(
          formattedDate,
          style: const TextStyle(
            fontSize: 15,
            color: Colors.black87,
          ),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4.0),
          child: Text(
            '₹${amount.toStringAsFixed(2)}',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: isCredited ? Colors.green : Colors.red,
            ),
          ),
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              type.toUpperCase(),
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: Colors.black54,
              ),
            ),
            const SizedBox(width: 4),
            Icon(
              Icons.circle,
              size: 8,
              color: isCredited ? Colors.green : Colors.red,
            ),
            const SizedBox(width: 4),
            const Text(
              "SUCCESS",
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: Colors.black54,
              ),
            ),
          ],
        ),

      ),
    );
  }
}
