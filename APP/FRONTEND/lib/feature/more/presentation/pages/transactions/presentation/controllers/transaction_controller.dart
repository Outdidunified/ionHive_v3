import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/transactions/domain/repositories/transaction_repository.dart';
import 'package:ionhive/utils/widgets/snackbar/custom_snackbar.dart';

class TransactionController extends GetxController {
  final RxList<Map<String, dynamic>> transactions =
      <Map<String, dynamic>>[].obs;
  var isLoading = false.obs;
  var hasInitialData = false.obs;
  var hasError = false.obs;
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

    try {
      fetchTransactionFilter().then((_) {
        // Delay the fetch to avoid blocking the UI thread
        Future.delayed(Duration(milliseconds: 500), () {
          fetchFilteredTransactions(); // Ensure correct filtering
        });
      });
    } catch (e) {
      debugPrint("TransactionController: Error in onInit: $e");
    }
  }

  /// Fetch all transactions from the repository
  Future<void> fetchAllTransactions() async {
    // Reset error state
    hasError.value = false;
    errorMessage.value = '';

    isLoading.value = true;

    try {
      final response = await _transactionrepository.fetchAllTransactions(
          email, userId, authToken);

      if (!response.error) {
        transactions.assignAll(response.transactions.map((t) {
          return {
            "date": t.time != null ? t.time.toString() : '',
            "status": t.status,
            "amount": t.amount,
            "type": t.status == "Credited" ? "Credited" : "Debited",
          };
        }).toList());

        // Set hasInitialData to true after first successful data load
        if (!hasInitialData.value) {
          hasInitialData.value = true;
        }
      } else {
        throw Exception(response.message ?? "Failed to fetch transactions.");
      }
    } catch (e) {
      debugPrint("TransactionController: fetchAllTransactions error: $e");

      // Determine the error message based on the exception
      String errorMsg = "Failed to fetch transactions. Please try again.";
      if (e.toString().contains("Unable to reach the server")) {
        errorMsg = "Unable to connect to the server. Please try again later.";
      } else if (e is Exception) {
        errorMsg = e.toString().replaceAll(
            "Exception: ", ""); // Use the exception message if available
      }

      // Update error state and message
      errorMessage.value = errorMsg;

      // Only show error UI if we don't have any data yet
      if (!hasInitialData.value) {
        hasError.value = true;
      } else {
        // If we already have data, show a snackbar with the specific error
        CustomSnackbar.showError(message: errorMsg);
      }
    } finally {
      isLoading.value = false;
    }
  }

  /// Fetch filtered transactions based on applied filters
  Future<void> fetchFilteredTransactions() async {
    // Reset error state only if we don't have initial data yet
    if (!hasInitialData.value) {
      hasError.value = false;
      errorMessage.value = '';
    }

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
                _isWithinSelectedDays(t.time.toString())) // Ensure filtering
            .map((t) {
          return {
            "date": t.time.toString(),
            "status": t.status,
            "amount": t.amount,
            "type": t.status == "Credited" ? "Credited" : "Debited",
          };
        }).toList());

        // Set hasInitialData to true after first successful data load
        if (!hasInitialData.value) {
          hasInitialData.value = true;
        }
      } else {
        throw Exception(response.message ?? "Failed to fetch transactions.");
      }
    } catch (e) {
      debugPrint("TransactionController: fetchFilteredTransactions error: $e");

      // Determine the error message based on the exception
      String errorMsg = "Failed to fetch transactions. Please try again.";
      if (e.toString().contains("Unable to reach the server")) {
        errorMsg = "Unable to connect to the server. Please try again later.";
      } else if (e is Exception) {
        errorMsg = e.toString().replaceAll(
            "Exception: ", ""); // Use the exception message if available
      }

      // Update error state and message
      errorMessage.value = errorMsg;

      // Only show error UI if we don't have any data yet
      if (!hasInitialData.value) {
        hasError.value = true;
        CustomSnackbar.showError(message: errorMsg);
      } else {
        // If we already have data, show a snackbar with the specific error
        CustomSnackbar.showError(message: errorMsg);
      }
    } finally {
      isLoading.value = false;
    }
  }

  /// Apply filters and update transactions accordingly
  Future<void> applyFilters() async {
    try {
      final response = await _transactionrepository.SaveFilter(
        email,
        userId,
        authToken,
        selectedDays.value,
      );

      if (!response.error) {
        if (response.days != null) {
          selectedDays.value = response.days!;
        }

        // Fetch filtered transactions after applying the filter
        await fetchFilteredTransactions();
      } else {
        debugPrint("Failed to apply filter: ${response.message}");
      }
    } catch (e) {
      debugPrint("Error applying filter: $e");
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
      } else {
        debugPrint("Failed to fetch transaction filter: ${response.message}");
      }
    } catch (e) {
      debugPrint("Error fetching transaction filter: $e");
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

        // Fetch all transactions after clearing the filter
        fetchAllTransactions();
      } else {
        debugPrint("Failed to clear transaction filter: ${response.message}");
      }
    } catch (e) {
      debugPrint("Error clearing transaction filter: $e");
    } finally {
      isLoading.value = false;
    }
  }

  /// Helper function to filter transactions within the selected days
  bool _isWithinSelectedDays(String? timeString) {
    if (timeString == null ||
        timeString.isEmpty ||
        selectedDays.value == null) {
      return true; // If null, show all
    }

    try {
      DateTime date = DateTime.parse(timeString);
      final now = DateTime.now();
      final difference = now.difference(date).inDays;

      return difference < selectedDays.value!; // Fix comparison
    } catch (e) {
      debugPrint("Error parsing date: $e");
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

  /// Refreshes all data at once with synchronized loading state
  Future<void> refreshAllData() async {
    try {
      if (email.isEmpty || authToken.isEmpty || userId == 0) {
        CustomSnackbar.showError(message: "User details are incomplete");
        isLoading.value = false;
        return;
      }

      // Reset error state
      hasError.value = false;
      errorMessage.value = '';
      isLoading.value = true;

      try {
        // Run both requests in parallel and wait for all to complete
        await Future.wait([fetchTransactionFilter(), fetchAllTransactions()]);

        // Set hasInitialData to true after first successful data load
        if (!hasInitialData.value) {
          hasInitialData.value = true;
        }
      } catch (e) {
        debugPrint("TransactionController: refreshAllData error: $e");

        // Determine the error message based on the exception
        String errorMsg =
            "An error occurred while loading data. Please try again later.";
        if (e.toString().contains("Unable to reach the server")) {
          errorMsg = "Unable to connect to the server. Please try again later.";
        } else if (e is Exception) {
          errorMsg = e.toString().replaceAll(
              "Exception: ", ""); // Use the exception message if available
        }

        // Update error state and message
        errorMessage.value = errorMsg;

        // Only show error UI if we don't have any data yet
        if (!hasInitialData.value) {
          hasError.value = true;
          CustomSnackbar.showError(message: errorMsg);
        } else {
          // If we already have data, show a snackbar with the specific error
          CustomSnackbar.showError(message: errorMsg);
        }
      } finally {
        debugPrint("TransactionController: Setting isLoading to false");
        isLoading.value = false;
      }
    } catch (e) {
      debugPrint(
          "TransactionController: Unexpected error in refreshAllData: $e");
      isLoading.value = false;
    }
  }

  @override
  void onClose() {
    super.onClose();
    Get.closeAllSnackbars(); // Close all active snackbars
  }
}
