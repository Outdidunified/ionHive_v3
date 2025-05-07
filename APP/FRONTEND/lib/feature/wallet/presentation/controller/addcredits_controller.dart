import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/feature/wallet/domain/models/payment_request.dart';
import 'package:ionhive/feature/wallet/domain/repositories/wallet_repository.dart';
import 'package:ionhive/feature/wallet/presentation/controller/wallet_controller.dart';
import 'package:ionhive/utils/widgets/snackbar/custom_snackbar.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import 'package:ionhive/core/controllers/session_controller.dart';

class AddCreditsController extends GetxController
    with GetSingleTickerProviderStateMixin {
  RxString selectedAmount = '500'.obs;
  final RxBool isLoading = false.obs;
  final RxString errorMessage = ''.obs;
  final TextEditingController amountController =
      TextEditingController(text: '500');

  Razorpay? _razorpay;
  double? _lastPaymentAmount;

  final sessionController = Get.find<SessionController>();
  final walletController =
      Get.put(WalletController(), permanent: true, tag: 'wallet');
  final walletRepository = WalletRepository();

  AnimationController? _animationController;
  Animation<double>? _scaleAnimation;

  AnimationController get animationController => _animationController!;
  Animation<double> get scaleAnimation =>
      _scaleAnimation ?? AlwaysStoppedAnimation<double>(1.0);

  @override
  void onInit() {
    super.onInit();

    _razorpay = Razorpay();
    _razorpay!.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay!.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    _razorpay!.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);

    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );

    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController!, curve: Curves.easeOutBack),
    );

    _animationController!.forward();
  }

  @override
  void onClose() {
    _razorpay?.clear();
    _animationController?.dispose();
    amountController.dispose();
    super.onClose();
  }

  void updateAmount(String amount) {
    final cleanAmount = amount.replaceAll('₹', '').replaceAll(',', '');
    selectedAmount.value = cleanAmount;
    amountController.text = cleanAmount;
  }

  String get formattedAmount => '₹${selectedAmount.value}';

  void onAmountChanged(String value) {
    // Only allow digits
    final cleanValue = value.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleanValue.isNotEmpty) {
      selectedAmount.value = cleanValue;
    } else {
      selectedAmount.value = '0';
    }
  }

  void _handlePaymentSuccess(PaymentSuccessResponse paymentSuccess) async {
    try {
      final userId = sessionController.userId.value;
      final email = sessionController.emailId.value;
      final authToken = sessionController.token.value;
      final amount = _lastPaymentAmount;

      // Update wallet balance in the background
      walletController.fetchwalletbalance();

      // Navigate immediately
      Get.until((route) => route.isFirst || Get.currentRoute == '/wallet');

      // Create payment request
      final paymentRequest = PaymentRequest(
        emailId: email,
        userId: userId,
        rechargeAmount: amount ?? 0.0,
        transactionId: paymentSuccess.paymentId ?? 'UNKNOWN',
        responseCode: 'SUCCESS',
        dateTime: DateTime.now().toIso8601String(),
        paymentMethod: 'UPI',
      );

      // Show success message immediately
      CustomSnackbar.showSuccess(
        message:
            'Payment Successful! Your wallet has been recharged with ₹$amount',
      );

      // Save payment details in the background
      walletRepository
          .savePayment(paymentRequest, authToken)
          .then((paymentResponse) {
        if (paymentResponse == null || paymentResponse.error) {
          // Only show error if saving failed
          CustomSnackbar.showError(
            message:
                'Payment was successful but details were not saved. Please contact support.',
          );
        }
      });
    } catch (error) {
      debugPrint('Error saving payment details: $error');
      CustomSnackbar.showError(
        message: 'issue in processing payment. Please try again.',
      );
    } finally {
      isLoading.value = false;
    }
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    isLoading.value = false;

    final errorCode = response.code;
    final errorMessage = _getFriendlyErrorMessage(errorCode);

    debugPrint('Razorpay Error Code: $errorCode');
    debugPrint('Razorpay Error Message: ${response.message ?? 'No message'}');

    CustomSnackbar.showError(
      message: errorMessage,
    );
  }

  String _getFriendlyErrorMessage(int? code) {
    switch (code) {
      case 0:
        return 'Payment failed: Network error or invalid request.';
      case 1:
        return 'Payment failed: Invalid payment credentials.';
      case 2:
        return 'Payment cancelled by User.';
      default:
        return 'Payment failed. Please try again later.';
    }
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    CustomSnackbar.showInfo(
      message: 'External Wallet Selected: ${response.walletName ?? 'Unknown'}',
    );
  }

  Future<void> processPayment() async {
    // Use the value from the text controller to ensure we have the latest input
    final amount = double.tryParse(amountController.text) ?? 0.0;

    if (amount <= 0) {
      CustomSnackbar.showError(
        message: 'Please enter a valid amount',
      );
      return;
    }

    if (amount < 1.0) {
      CustomSnackbar.showError(
        message: 'Amount must be at least ₹1',
      );
      return;
    }

    final currentBalance = double.tryParse(walletController.walletBalance.value
            .replaceAll('Rs.', '')
            .trim()) ??
        0.0;

    if (currentBalance + amount > 10000) {
      CustomSnackbar.showError(
        message:
            'Maximum wallet limit is ₹10,000. You can add up to ₹${(10000 - currentBalance).toStringAsFixed(2)}',
      );

      return;
    }

    isLoading.value = true;
    _lastPaymentAmount = amount;

    try {
      final userId = sessionController.userId.value;
      final username = sessionController.username.value;
      final authToken = sessionController.token.value;

      // Create order using repository
      final orderResponse = await walletRepository.createOrder(
          amount: amount,
          currency: 'INR',
          userId: userId,
          authToken: authToken);

      if (orderResponse.success) {
        final order = orderResponse.order;
        final orderId = order.id;

        var options = {
          // 'key': 'rzp_live_62NvZ13QGMQk1S',
          'key': 'rzp_test_D9PcSutYWQ2e71',
          'amount': (amount * 100).toInt(), // Amount in smallest currency unit
          'name': 'ionHive',
          'description': 'Wallet Recharge',
          'order_id': orderId,
          'prefill': {
            'email': sessionController.emailId.value,
            'name': username
          },
          'theme': {'color': '#3399cc'},
          'method': {
            'card': true,
            'netbanking': true,
            'upi': true,
          }
        };

        _razorpay!.open(options);
      } else {
        CustomSnackbar.showError(
          message: 'issue in creating payment order. Please try again.',
        );
      }
    } catch (error) {
      debugPrint('Error during payment: $error');
      CustomSnackbar.showError(
        message: 'Cannot reach server. Please try again later.',
      );
    } finally {
      isLoading.value = false;
    }
  }
}
