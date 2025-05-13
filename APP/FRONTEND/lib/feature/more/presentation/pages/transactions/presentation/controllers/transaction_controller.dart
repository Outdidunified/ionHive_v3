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
  var selectedFilter = 'All transactions'.obs;
  var selectedDateFilter = "Last 30 days".obs;
  Rxn<int> selectedDays = Rxn<int>();

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
        Future.delayed(Duration(milliseconds: 500), () {
          fetchFilteredTransactions();
        });
      });
    } catch (e) {
      debugPrint("TransactionController: Error in onInit: $e");
    }
  }

  Future<void> fetchAllTransactions() async {
    hasError.value = false;
    errorMessage.value = '';
    isLoading.value = true;
    debugPrint("TransactionController: call");

    try {
      final response = await _transactionrepository.fetchAllTransactions(
          email, userId, authToken);

      if (!response.error) {
        // Check if transactions list is empty
        if (response.transactions.isEmpty) {
          debugPrint("TransactionController: No transactions found");
          transactions.clear(); // Ensure the list is empty
        } else {
          print(response.transactions);
          // Map transactions to the required format
          transactions.assignAll(response.transactions.map((t) {
            return {
              "date": t.time != null ? t.time.toString() : '',
              "status": t.status,
              "amount": t.amount,
              "type": t.status == "Credited" ? "Credited" : "Debited",
            };
          }).toList());
        }

        // Set hasInitialData to true after successful data load
        if (!hasInitialData.value) {
          hasInitialData.value = true;
        }
      } else {
        // Handle error response
        if (response.message?.contains("No transactions found") == true ||
            response.message?.contains("No transaction records found") ==
                true) {
          // This is not an error, just an empty state
          debugPrint(
              "TransactionController: No transactions found - treating as empty state");
          transactions.clear(); // Ensure transactions list is empty

          // Set hasInitialData to true since we successfully determined there are no transactions
          if (!hasInitialData.value) {
            hasInitialData.value = true;
          }
        } else {
          throw Exception(response.message ?? "Failed to fetch transactions.");
        }
      }
    } catch (e) {
      debugPrint("TransactionController: fetchAllTransactions error: $e");

      // Check if the error is about no transactions found
      if (e.toString().contains("No transactions found") ||
          e.toString().contains("No transaction records found")) {
        // This is not an error, just an empty state
        debugPrint(
            "TransactionController: No transactions found - treating as empty state");
        transactions.clear(); // Ensure transactions list is empty

        // Set hasInitialData to true since we successfully determined there are no transactions
        if (!hasInitialData.value) {
          hasInitialData.value = true;
        }
      } else {
        // For other errors, show error message
        String errorMsg = "Failed to fetch transactions. Please try again.";
        if (e.toString().contains("Unable to reach the server")) {
          errorMsg = "Unable to connect to the server. Please try again later.";
        } else if (e is Exception) {
          errorMsg = e.toString().replaceAll("Exception: ", "");
        }
        errorMessage.value = errorMsg;
        if (!hasInitialData.value) {
          hasError.value = true;
        } else {
          CustomSnackbar.showError(message: errorMsg);
        }
      }
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> fetchFilteredTransactions() async {
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
        // Check if transactions list is empty
        if (response.transactions.isEmpty) {
          debugPrint(
              "TransactionController: No transactions found for filtering");
          transactions.clear(); // Ensure the list is empty
        } else {
          // Filter and map transactions
          transactions.assignAll(response.transactions
              .where((t) => _isWithinSelectedDays(t.time.toString()))
              .map((t) {
            return {
              "date": t.time.toString(),
              "status": t.status,
              "amount": t.amount,
              "type": t.status == "Credited" ? "Credited" : "Debited",
            };
          }).toList());
        }

        // Set hasInitialData to true after successful data load
        if (!hasInitialData.value) {
          hasInitialData.value = true;
        }
      } else {
        // Handle error response
        if (response.message?.contains("No transactions found") == true ||
            response.message?.contains("No transaction records found") ==
                true) {
          // This is not an error, just an empty state
          debugPrint(
              "TransactionController: No transactions found for filtering - treating as empty state");
          transactions.clear(); // Ensure transactions list is empty

          // Set hasInitialData to true since we successfully determined there are no transactions
          if (!hasInitialData.value) {
            hasInitialData.value = true;
          }
        } else {
          throw Exception(response.message ?? "Failed to fetch transactions.");
        }
      }
    } catch (e) {
      debugPrint("TransactionController: fetchFilteredTransactions error: $e");

      // Check if the error is about no transactions found
      if (e.toString().contains("No transactions found") ||
          e.toString().contains("No transaction records found")) {
        // This is not an error, just an empty state
        debugPrint(
            "TransactionController: No transactions found for filtering - treating as empty state");
        transactions.clear(); // Ensure transactions list is empty

        // Set hasInitialData to true since we successfully determined there are no transactions
        if (!hasInitialData.value) {
          hasInitialData.value = true;
        }
      } else {
        // For other errors, show error message
        String errorMsg = "Failed to fetch transactions. Please try again.";
        if (e.toString().contains("Unable to reach the server")) {
          errorMsg = "Unable to connect to the server. Please try again later.";
        } else if (e is Exception) {
          errorMsg = e.toString().replaceAll("Exception: ", "");
        }
        errorMessage.value = errorMsg;
        if (!hasInitialData.value) {
          hasError.value = true;
          CustomSnackbar.showError(message: errorMsg);
        } else {
          CustomSnackbar.showError(message: errorMsg);
        }
      }
    } finally {
      isLoading.value = false;
    }
  }

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
        await fetchFilteredTransactions();
      } else {
        debugPrint("Failed to apply filter: ${response.message}");
      }
    } catch (e) {
      debugPrint("Error applying filter: $e");
    }
  }

  Future<void> fetchTransactionFilter() async {
    isLoading.value = true;
    try {
      final response = await _transactionrepository.fetchTransactionFilterRep(
          email, userId, authToken);
      if (!response.error) {
        selectedDays.value = response.days;
      } else {
        // Check if the message indicates no filter found
        if (response.message.contains("No filter found") ||
            response.message.contains("No transaction filter found")) {
          // This is not an error, just use default value
          debugPrint(
              "TransactionController: No transaction filter found - using default value");
        } else {
          debugPrint("Failed to fetch transaction filter: ${response.message}");
        }
      }
    } catch (e) {
      debugPrint("Error fetching transaction filter: $e");

      // Check if the error is about type casting
      if (e.toString().contains("type '_Map<String, dynamic>'") ||
          e.toString().contains("is not a subtype of type 'List<dynamic>'")) {
        // This is a type casting error, use default value
        debugPrint(
            "TransactionController: Type casting error in filter - using default value");
      }
      // For other errors, we'll just continue with the current value
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
        selectedDays.value = null;
        await fetchAllTransactions();
      } else {
        debugPrint("Failed to clear transaction filter: ${response.message}");
      }
    } catch (e) {
      debugPrint("Error clearing transaction filter: $e");
    } finally {
      isLoading.value = false;
    }
  }

  bool _isWithinSelectedDays(String? timeString) {
    if (timeString == null ||
        timeString.isEmpty ||
        selectedDays.value == null) {
      return true;
    }
    try {
      DateTime date = DateTime.parse(timeString);
      final now = DateTime.now();
      final difference = now.difference(date).inDays;
      return difference < selectedDays.value!;
    } catch (e) {
      debugPrint("Error parsing date: $e");
      return false;
    }
  }

  List<Map<String, dynamic>> get filteredTransactions {
    debugPrint("TransactionController: Getting filteredTransactions");
    debugPrint(
        "TransactionController: transactions.length = ${transactions.length}");
    debugPrint(
        "TransactionController: selectedFilter.value = ${selectedFilter.value}");

    List<Map<String, dynamic>> result;
    if (selectedFilter.value == 'All transactions') {
      result = transactions;
    } else {
      result =
          transactions.where((t) => t['type'] == selectedFilter.value).toList();
    }

    debugPrint(
        "TransactionController: filteredTransactions.length = ${result.length}");
    return result;
  }

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

      // Set loading state
      isLoading.value = true;
      debugPrint("TransactionController: Starting data refresh");

      try {
        // Fetch data
        await Future.wait([fetchTransactionFilter(), fetchAllTransactions()]);

        // Debug print to check data state after fetching
        debugPrint("TransactionController: Data refresh completed");
        debugPrint(
            "TransactionController: transactions.length = ${transactions.length}");

        // Set hasInitialData to true after successful data load
        if (!hasInitialData.value) {
          hasInitialData.value = true;
          debugPrint("TransactionController: Setting hasInitialData to true");
        }
      } catch (e) {
        debugPrint("TransactionController: refreshAllData error: $e");

        // Check if the error is about no transactions found
        if (e.toString().contains("No transactions found") ||
            e.toString().contains("No transaction records found")) {
          // This is not an error, just an empty state
          debugPrint(
              "TransactionController: No transactions found - treating as empty state");
          transactions.clear(); // Ensure transactions list is empty

          // Set hasInitialData to true since we successfully determined there are no transactions
          if (!hasInitialData.value) {
            hasInitialData.value = true;
            debugPrint(
                "TransactionController: Setting hasInitialData to true (empty state)");
          }
        } else {
          // For other errors, show error message
          String errorMsg =
              "An error occurred while loading data. Please try again later.";
          if (e.toString().contains("Unable to reach the server")) {
            errorMsg =
                "Unable to connect to the server. Please try again later.";
          } else if (e is Exception) {
            errorMsg = e.toString().replaceAll("Exception: ", "");
          }
          errorMessage.value = errorMsg;
          if (!hasInitialData.value) {
            hasError.value = true;
            CustomSnackbar.showError(message: errorMsg);
          } else {
            CustomSnackbar.showError(message: errorMsg);
          }
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
    Get.closeAllSnackbars();
  }
}
