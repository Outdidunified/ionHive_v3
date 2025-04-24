import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/wallet/presentation/controller/addcredits_controller.dart';
import 'package:ionhive/feature/wallet/presentation/controller/wallet_controller.dart';
import 'package:ionhive/utils/theme/theme_controller.dart';
import 'package:ionhive/utils/widgets/button/custom_button.dart';

class AddCreditsPage extends StatelessWidget {
  AddCreditsPage({super.key});

  final sessionController = Get.find<SessionController>();
  final walletController =
      Get.put(WalletController(), permanent: true, tag: 'wallet');
  final addCreditsController = Get.put(AddCreditsController());
  final themeController = Get.find<ThemeController>();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    final primaryColor = theme.primaryColor;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Add Credits', style: theme.textTheme.headlineMedium),
      ),
      body: SingleChildScrollView(
        physics: const ClampingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 8),
            Text(
              "Add Credits to Wallet",
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              "Add money to your wallet for quick payments",
              style: theme.textTheme.bodyMedium?.copyWith(
                color: isDarkMode ? Colors.white70 : Colors.black54,
              ),
            ),
            const SizedBox(height: 30),
            _buildWalletCard(theme, isDarkMode, primaryColor),
            const SizedBox(height: 30),
            Text(
              "Add Amount",
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Obx(() => _buildAmountInputField(
                addCreditsController.formattedAmount, isDarkMode)),
            const SizedBox(height: 20),
            _buildQuickAmountSelection(theme),
            const SizedBox(height: 30),
            _buildPaymentMethodsSection(theme, isDarkMode),
            const SizedBox(height: 30),
            _buildAddCreditsButton(theme),
            const SizedBox(height: 12),
            Text(
              "Money will be added to your wallet and can be used for all transactions within the app.",
              style: theme.textTheme.bodyMedium?.copyWith(
                color: isDarkMode ? Colors.white60 : Colors.black54,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildAmountInputField(String amount, bool isDarkMode) {
    return Builder(builder: (context) {
      final theme = Theme.of(context);

      return Container(
        decoration: BoxDecoration(
          color: isDarkMode
              ? theme.colorScheme.surface
              : theme.colorScheme.primary.withOpacity(0.05),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isDarkMode
                ? theme.dividerColor
                : theme.colorScheme.primary.withOpacity(0.2),
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: isDarkMode
                  ? Colors.black.withOpacity(0.2)
                  : theme.colorScheme.primary.withOpacity(0.1),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: TextField(
          readOnly: false,
          controller: addCreditsController.amountController,
          keyboardType: TextInputType.number,
          onChanged: addCreditsController.onAmountChanged,
          textAlign: TextAlign.center,
          style: theme.textTheme.displaySmall?.copyWith(
            fontWeight: FontWeight.bold,
            color: isDarkMode ? Colors.white : Colors.black,
          ),
          decoration: InputDecoration(
            border: InputBorder.none,
            contentPadding:
                const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
            prefixIcon: Icon(
              Icons.currency_rupee,
              color: theme.colorScheme.primary,
              size: 24,
            ),
            hintText: "Enter amount",
            hintStyle: theme.textTheme.titleMedium?.copyWith(
              color: isDarkMode ? Colors.white54 : Colors.black38,
            ),
          ),
        ),
      );
    });
  }

  Widget _buildQuickAmountSelection(ThemeData theme) {
    final amounts = ['100', '200', '500', '1000', '2000'];
    final isDarkMode = theme.brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "Quick Select",
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w500,
            color: isDarkMode ? Colors.white70 : Colors.black54,
          ),
        ),
        const SizedBox(height: 12),
        Obx(() {
          final selected = addCreditsController.selectedAmount.value;
          return Wrap(
            spacing: 24,
            runSpacing: 24,
            children: amounts.map((amount) {
              final isSelected = selected == amount;
              return Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () => addCreditsController.updateAmount(amount),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? theme.colorScheme.primary
                          : (isDarkMode
                              ? theme.colorScheme.surface
                              : Colors.white),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isSelected
                            ? theme.colorScheme.primary
                            : theme.dividerColor,
                        width: 1.5,
                      ),
                      boxShadow: isSelected
                          ? [
                              BoxShadow(
                                color:
                                    theme.colorScheme.primary.withOpacity(0.3),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ]
                          : null,
                    ),
                    child: Text(
                      '₹$amount',
                      style: theme.textTheme.titleMedium?.copyWith(
                        color: isSelected
                            ? theme.colorScheme.onPrimary
                            : (isDarkMode ? Colors.white : Colors.black),
                        fontWeight:
                            isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          );
        }),
      ],
    );
  }

  Widget _buildPaymentMethodsSection(ThemeData theme, bool isDarkMode) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "Payment Method Available",
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w500,
            color: isDarkMode ? Colors.white70 : Colors.black54,
          ),
        ),
        const SizedBox(height: 12),
        Container(
          decoration: BoxDecoration(
            color: isDarkMode ? theme.colorScheme.surface : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: theme.dividerColor,
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: isDarkMode
                    ? Colors.black.withOpacity(0.2)
                    : Colors.grey.withOpacity(0.1),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: [
              _buildPaymentOption(
                "UPI Payment",
                Icons.account_balance,
                true,
                theme,
                isDarkMode,
              ),
              Divider(
                color: theme.dividerColor,
                height: 1,
                indent: 16,
                endIndent: 16,
              ),
              _buildPaymentOption(
                "Credit / Debit Card",
                Icons.credit_card,
                true,
                theme,
                isDarkMode,
              ),
              Divider(
                color: theme.dividerColor,
                height: 1,
                indent: 16,
                endIndent: 16,
              ),
              _buildPaymentOption(
                "Net Banking",
                Icons.account_balance_wallet,
                true,
                theme,
                isDarkMode,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPaymentOption(String title, IconData icon, bool isSelected,
      ThemeData theme, bool isDarkMode) {
    return InkWell(
      onTap: () {
        // Handle payment method selection
      },
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isSelected
                    ? theme.colorScheme.primary.withOpacity(0.1)
                    : (isDarkMode ? Colors.white10 : Colors.grey[100]),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                color: isSelected
                    ? theme.colorScheme.primary
                    : theme.iconTheme.color,
                size: 20,
              ),
            ),
            const SizedBox(width: 16),
            Text(
              title,
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected
                    ? theme.colorScheme.primary
                    : theme.textTheme.titleMedium?.color,
              ),
            ),
            const Spacer(),
            if (isSelected)
              Icon(
                Icons.check_circle,
                color: theme.colorScheme.primary,
                size: 20,
              )
            else
              Icon(
                Icons.circle_outlined,
                color: theme.iconTheme.color?.withOpacity(0.5),
                size: 20,
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildAddCreditsButton(ThemeData theme) {
    return Obx(() {
      final amount = addCreditsController.selectedAmount.value;
      final isLoading = addCreditsController.isLoading.value;

      // Use a simpler approach that doesn't rely on AnimatedBuilder
      // This avoids the LateInitializationError
      final scale = addCreditsController.scaleAnimation.value;

      return Transform.scale(
        scale: scale,
        child: CustomButton(
          text: "Add ₹$amount",
          onPressed: isLoading
              ? () {} // Provide empty function instead of null
              : () => addCreditsController.processPayment(),
          isLoading: isLoading,
          borderRadius: 16.0,
          textStyle: theme.textTheme.bodyLarge!,
          boxShadow: BoxShadow(
            color: theme.primaryColor.withOpacity(0.5),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ),
      );
    });
  }

  // Helper methods for balance status
  Color _getBalanceStatusColor(double balance, ThemeData theme) {
    if (balance < 100) {
      return Colors.amber; // Low balance
    } else if (balance < 5000) {
      return theme.colorScheme.primary; // Average balance
    } else {
      return Colors.green; // Full/Good balance
    }
  }

  String _getBalanceStatusText(double balance) {
    if (balance < 100) {
      return "Low Balance";
    } else if (balance < 5000) {
      return "Average";
    } else {
      return "Full";
    }
  }

  Widget _buildWalletCard(
      ThemeData theme, bool isDarkMode, Color primaryColor) {
    return Stack(
      alignment: Alignment.topCenter,
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: isDarkMode
                  ? [
                      theme.colorScheme.surface,
                      Color.lerp(theme.colorScheme.surface,
                              theme.colorScheme.primary, 0.1) ??
                          theme.colorScheme.surface
                    ]
                  : [
                      theme.colorScheme.primary.withOpacity(0.1),
                      theme.colorScheme.secondary.withOpacity(0.05)
                    ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: isDarkMode
                    ? Colors.black.withOpacity(0.3)
                    : theme.colorScheme.primary.withOpacity(0.1),
                blurRadius: 10,
                offset: const Offset(0, 5),
              ),
            ],
            border: isDarkMode
                ? Border.all(color: theme.dividerColor, width: 0.5)
                : null,
          ),
          child: Obx(() {
            final balanceStr = walletController.walletBalance.value;
            final balance =
                double.tryParse(balanceStr.replaceAll('Rs.', '').trim()) ?? 0.0;
            final progress = balance / 10000.0;
            final percentage = (progress * 100).toStringAsFixed(0);

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "Current Balance",
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        color: isDarkMode ? Colors.white70 : Colors.black54,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: _getBalanceStatusColor(balance, theme),
                        borderRadius: BorderRadius.circular(30),
                        boxShadow: [
                          BoxShadow(
                            color: _getBalanceStatusColor(balance, theme)
                                .withOpacity(0.3),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Text(
                        _getBalanceStatusText(balance),
                        style: TextStyle(
                          color: _getBalanceStatusColor(balance, theme) ==
                                  Colors.amber
                              ? Colors.black
                              : Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  "₹${balance.toStringAsFixed(2)}",
                  style: theme.textTheme.displaySmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: isDarkMode ? Colors.white : Colors.black,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "Max ₹10,000",
                      style: theme.textTheme.bodyLarge,
                    ),
                    Text(
                      "$percentage% used",
                      style: theme.textTheme.bodyLarge?.copyWith(
                        fontWeight: FontWeight.w500,
                        color: _getBalanceStatusColor(balance, theme),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: progress,
                    minHeight: 8,
                    backgroundColor:
                        isDarkMode ? Colors.white24 : Colors.grey[300],
                    valueColor: AlwaysStoppedAnimation<Color>(
                      _getBalanceStatusColor(balance, theme),
                    ),
                  ),
                ),
              ],
            );
          }),
        ),
        Positioned(
          top: -20,
          child: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: theme.colorScheme.primary,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: theme.colorScheme.primary.withOpacity(0.3),
                  blurRadius: 10,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: Icon(
              Icons.account_balance_wallet,
              color: theme.colorScheme.onPrimary,
              size: 24,
            ),
          ),
        ),
      ],
    );
  }
}
