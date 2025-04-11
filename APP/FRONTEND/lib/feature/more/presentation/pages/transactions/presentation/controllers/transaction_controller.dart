import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/transactions/domain/repositories/transaction_repository.dart';
import 'package:ionhive/utils/widgets/snackbar/custom_snackbar.dart';

class TransactionController extends GetxController {
  final RxList<Map<String, dynamic>> transactions =
      <Map<String, dynamic>>[].obs;
  var isLoading = false.obs;
  var errorMessage = ''.obs;
  var selectedFilter = 'All transactions'.obs; // Track selected filter
  var selectedDateFilter = "Last 30 days".obs;
  Rxn<int> selectedDays = Rxn<int>(); // Allows null value

  final Transactionrepository _transactionrepository = Transactionrepository();
  final sessionController = Get.find<SessionController>();

  final String email;
  final int userId;
  final String authToken;

  TransactionController()
      : email = Get.find<SessionController>().emailId.value,
        userId = Get.find<SessionController>().userId.value,
        authToken = Get.find<SessionController>().token.value;

  @override
  void onInit() {
    super.onInit();
    fetchTransactionFilter().then((_) {
      print("Selected Days After Fetch: ${selectedDays.value}");
      fetchFilteredTransactions(); // Ensure correct filtering
    });
  }

  /// Fetch all transactions from the repository
  void fetchAllTransactions() async {
    isLoading.value = true;
    errorMessage.value = '';

    try {
      final response = await _transactionrepository.fetchAllTransactions(
          email, userId, authToken);

      if (!response.error) {
        transactions.assignAll(response.transactions.map((t) {
          return {
            "date": t.time != null ? t.time.toString() : '',
            "status": t.status ?? '',
            "amount": t.amount ?? 0.0,
            "type": t.status == "Credited" ? "Credited" : "Debited",
          };
        }).toList());
      } else {
        errorMessage.value = "Failed to fetch transactions.";
        CustomSnackbar.showError(message: errorMessage.value);
      }
    } catch (e) {
      errorMessage.value = "Failed to fetch transactions. Please try again.";
      print("Error fetching transactions: $e");

      CustomSnackbar.showError(message: errorMessage.value);
    } finally {
      isLoading.value = false;
    }
  }

  /// Fetch filtered transactions based on applied filters
  Future<void> fetchFilteredTransactions() async {
    isLoading.value = true;

    try {
      final response = await _transactionrepository.fetchAllTransactions(
        email,
        userId,
        authToken,
      );

      if (!response.error) {
        transactions.assignAll(response.transactions
            .where((t) =>
                _isWithinSelectedDays(t.time?.toString())) // Ensure filtering
            .map((t) {
          return {
            "date": t.time?.toString() ?? '',
            "status": t.status ?? '',
            "amount": t.amount ?? 0.0,
            "type": t.status == "Credited" ? "Credited" : "Debited",
          };
        }).toList());

        print("Filtered transactions updated successfully.");
      } else {
        print("Failed to fetch transactions.");
      }
    } catch (e) {
      print("Error fetching filtered transactions: $e");
    } finally {
      isLoading.value = false;
    }
  }

  /// Apply filters and update transactions accordingly
  Future<void> applyFilters() async {
    try {
      print("Applying filter for last ${selectedDays.value} days");

      final response = await _transactionrepository.SaveFilter(
        email,
        userId,
        authToken,
        selectedDays.value,
      );

      if (!response.error) {
        print("Filter applied successfully: ${response.message}");

        if (response.days != null) {
          selectedDays.value = response.days!;
          print("Updated days: ${selectedDays.value}");
        }

        // Fetch filtered transactions after applying the filter
        await fetchFilteredTransactions();
      } else {
        print("Failed to apply filter: ${response.message}");
      }
    } catch (e) {
      print("Error applying filter: $e");
    }
  }

  Future<void> fetchTransactionFilter() async {
    // Change void to Future<void>
    isLoading.value = true;
    try {
      final response = await _transactionrepository.fetchTransactionFilterRep(
          email, userId, authToken);
      if (!response.error) {
        selectedDays.value =
            response.days ?? 1; // Ensure selectedDays updates correctly
        print("Transaction filter fetched: ${selectedDays.value}");
      } else {
        print("Failed to fetch transaction filter: ${response.message}");
      }
    } catch (e) {
      print("Error fetching transaction filter: $e");
    } finally {
      isLoading.value = false;
    }
  }

  void clearsavedfilter() async {
    isLoading.value = true;
    try {
      final response = await _transactionrepository.Clearsavedfilterrep(
          email, userId, authToken);
      if (!response.error) {
        selectedDays.value = null; // Reset the filter to null
        print("Transaction filter cleared. Fetching all transactions...");

        // Fetch all transactions after clearing the filter
        fetchAllTransactions();
      } else {
        print("Failed to clear transaction filter: ${response.message}");
      }
    } catch (e) {
      print("Error clearing transaction filter: $e");
    } finally {
      isLoading.value = false;
    }
  }

  /// Helper function to filter transactions within the selected days
  bool _isWithinSelectedDays(String? timeString) {
    if (timeString == null || timeString.isEmpty || selectedDays.value == null)
      return true; // If null, show all

    try {
      DateTime date = DateTime.parse(timeString);
      final now = DateTime.now();
      final difference = now.difference(date).inDays;

      return difference < selectedDays.value!; // Fix comparison
    } catch (e) {
      print("Error parsing date: $e");
      return false;
    }
  }

  /// Get filtered transactions based on the selected type
  List<Map<String, dynamic>> get filteredTransactions {
    if (selectedFilter.value == 'All transactions') {
      return transactions;
    }
    return transactions
        .where((t) => t['type'] == selectedFilter.value)
        .toList();
  }

  /// Clear applied filters
}

@override
void onClose() {
  Get.closeAllSnackbars(); // Close all active snackbars
}
