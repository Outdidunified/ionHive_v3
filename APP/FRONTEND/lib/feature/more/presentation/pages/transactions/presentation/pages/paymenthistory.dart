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
    // Reset controller state
    controller.hasInitialData.value = false;
    controller.hasError.value = false;
    controller.isLoading.value = false;

    debugPrint("PaymentHistoryPage: Constructor called, initializing data");
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!controller.hasInitialData.value) {
        debugPrint("PaymentHistoryPage: Triggering refreshAllData");
        controller.refreshAllData().then((_) {
          debugPrint("PaymentHistoryPage: Data refresh completed");
        }).catchError((e) {
          debugPrint("PaymentHistoryPage: Error during refresh: $e");
        });
      }
    });
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
        debugPrint(
            "PaymentHistoryPage: hasInitialData = ${controller.hasInitialData.value}");
        debugPrint(
            "PaymentHistoryPage: transactions.length = ${controller.transactions.length}");
        debugPrint(
            "PaymentHistoryPage: filteredTransactions.length = ${controller.filteredTransactions.length}");
        debugPrint(
            "PaymentHistoryPage: isLoading = ${controller.isLoading.value}");

        if (controller.hasError.value) {
          debugPrint("PaymentHistoryPage: Showing error state");
          return _buildShimmerList(context);
        }

        if (!controller.hasInitialData.value) {
          debugPrint("PaymentHistoryPage: Showing loading state");
          return _buildShimmerList(context);
        }

        return Stack(
          children: [
            SingleChildScrollView(
              physics:
                  const NeverScrollableScrollPhysics(), // Disable pull-to-refresh
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
                                    value: 'Credited', child: Text('Credited')),
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
                              builder: (context) => _buildFilterModal(context),
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
                  if (controller.isLoading.value)
                    Padding(
                      padding:
                          EdgeInsets.symmetric(horizontal: screenWidth * 0.05),
                      child: TweenAnimationBuilder<double>(
                        tween: Tween<double>(begin: 0.0, end: 1.0),
                        duration: const Duration(milliseconds: 500),
                        builder: (context, value, child) {
                          return LinearProgressIndicator(
                            value: value,
                            backgroundColor:
                                theme.colorScheme.primary.withOpacity(0.1),
                            valueColor: AlwaysStoppedAnimation<Color>(
                              theme.colorScheme.primary,
                            ),
                            minHeight: 2,
                          );
                        },
                      ),
                    ),
                  SizedBox(
                    height: screenHeight * 0.75,
                    child: Obx(() {
                      debugPrint(
                          "PaymentHistoryPage: Building transaction list");
                      debugPrint(
                          "PaymentHistoryPage: filteredTransactions.length = ${controller.filteredTransactions.length}");
                      debugPrint(
                          "PaymentHistoryPage: isLoading = ${controller.isLoading.value}");

                      return ListView.builder(
                        padding: EdgeInsets.only(bottom: screenHeight * 0.05),
                        itemCount: controller.filteredTransactions.isEmpty
                            ? 1 // Show 1 item for "No data found"
                            : controller.filteredTransactions.length,
                        itemBuilder: (context, index) {
                          if (controller.filteredTransactions.isEmpty) {
                            return _buildNoTransactionsFoundItem(
                                context, screenWidth);
                          }
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
              Text(
                "FILTER BY DAYS",
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.onSurface, // Dynamic text color
                ),
              ),
              IconButton(
                icon: Icon(
                  Icons.close,
                  color: theme.iconTheme.color, // Dynamic icon color
                ),
                onPressed: () => Get.back(),
              ),
            ],
          ),
          const Divider(
            color:
                Colors.grey, // Optional: Use theme divider color if available
            thickness: 1,
          ),
          Column(
            children: [
              _buildRadioButton("none", 0),
              _buildRadioButton("Last 24 hours", 1),
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
                icon: Icon(
                  Icons.clear,
                  color: theme.colorScheme.primary, // Dynamic icon color
                ),
                label: Text(
                  "Clear Filters",
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.primary, // Dynamic text color
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                style: TextButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                    side: BorderSide(
                      color: theme.colorScheme.primary, // Dynamic border color
                      width: 1.5,
                    ),
                  ),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  backgroundColor: theme.cardColor, // Dynamic background color
                ),
              ),
              ElevatedButton.icon(
                onPressed: () {
                  controller.applyFilters();
                  Get.back();
                },
                icon: Icon(
                  Icons.check,
                  color: theme.colorScheme.onPrimary, // Dynamic icon color
                ),
                label: Text(
                  "Apply",
                  style: theme.textTheme.titleSmall?.copyWith(
                    color: theme.colorScheme.onPrimary, // Dynamic text color
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor:
                      theme.colorScheme.primary, // Dynamic background
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
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
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: MediaQuery.of(context).size.width * 0.05,
              vertical: MediaQuery.of(context).size.height * 0.02,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  width: 150,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
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
                        Container(
                          width: 24,
                          height: 24,
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 12),
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

  Widget _buildNoTransactionsFoundItem(
      BuildContext context, double screenWidth) {
    final theme = Theme.of(context);
    final screenHeight = MediaQuery.of(context).size.height;

    final noTransactionsImage = Image.asset(
      'assets/icons/no-history-found1.png',
      width: screenWidth * 0.3,
      height: screenWidth * 0.3,
      errorBuilder: (context, error, stackTrace) {
        return Icon(
          Icons.payment,
          size: screenWidth * 0.2,
          color: theme.colorScheme.primary.withOpacity(0.7),
        );
      },
    );

    return Center(
      child: Padding(
        padding: EdgeInsets.only(top: screenHeight * 0.2),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            noTransactionsImage,
            const SizedBox(height: 20),
            Text(
              'No Payment History Found',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.primary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              'No payment transactions available at the moment. \nStart a transaction to see your history.',
              style: theme.textTheme.bodyLarge?.copyWith(
                color: theme.textTheme.bodyLarge?.color?.withOpacity(0.7),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
