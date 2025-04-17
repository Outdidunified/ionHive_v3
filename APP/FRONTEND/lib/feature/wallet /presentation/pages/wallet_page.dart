import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/transactions/presentation/pages/paymenthistory.dart';
import 'package:ionhive/feature/wallet /presentation/pages/add_credits.dart';

import '../controller/wallet_controller.dart';

class WalletPage extends StatelessWidget {
  final sessionController = Get.find<SessionController>();
  final walletController = Get.put(WalletController());

  WalletPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final username = sessionController.username.value;

    walletController.fetchwalletbalance();

    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: ListView(
            children: [
              _buildHeader(username, theme),
              const SizedBox(height: 20),
              _buildBalanceCard(theme),
              const SizedBox(height: 16),
              _buildIncomeOutcomeRow(theme),
              const SizedBox(height: 20),
              _buildSectionTitle('Options', theme),
              const SizedBox(height: 12),
              _buildOptionsRow(theme),
              const SizedBox(height: 20),
              _buildSectionTitle('Progress', theme),
              const SizedBox(height: 12),
              _buildProgressCards(theme),
              const SizedBox(height: 20),
              _buildSectionTitle('Transactions', theme),
              const SizedBox(height: 12),
              _buildTransactionList(theme),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(String username, ThemeData theme) {
    // Get dynamic greeting based on time of day
    final greeting = _getGreeting();

    return Row(
      children: [
        CircleAvatar(
          backgroundColor: theme.colorScheme.primary.withOpacity(0.2),
          child: Icon(
            Icons.person,
            color: theme.colorScheme.primary,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            'Hii $greeting!\n$username',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        Icon(Icons.notifications_none, color: theme.iconTheme.color),
      ],
    );
  }

  // Helper method to get appropriate greeting based on time of day
  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) {
      return 'Good Morning';
    } else if (hour < 17) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  }

  Widget _buildBalanceCard(ThemeData theme) {
    // Different gradient colors based on theme
    List<Color> gradientColors;
    Color shadowColor;

    // Use the theme's primary color as the base for gradients
    final primaryColor = theme.colorScheme.primary;

    if (theme.brightness == Brightness.dark) {
      // Dark theme - use primary color and a lighter variant
      gradientColors = [
        primaryColor,
        primaryColor.withOpacity(0.7),
      ];
      shadowColor = primaryColor;
    } else {
      // Light theme - use primary color and a lighter variant
      gradientColors = [
        primaryColor,
        Color.lerp(primaryColor, Colors.white, 0.3) ??
            primaryColor.withOpacity(0.7),
      ];
      shadowColor = primaryColor;
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: gradientColors,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: shadowColor.withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Total Balance',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: Colors.white.withOpacity(0.8),
            ),
          ),
          const SizedBox(height: 8),
          Obx(() => Text(
                walletController.walletBalance.value,
                style: theme.textTheme.headlineMedium?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              )),
        ],
      ),
    );
  }

  Widget _buildIncomeOutcomeRow(ThemeData theme) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Obx(() => _buildAmountBox(
              Icons.arrow_downward,
              'Credited',
              walletController.totalCredited.value,
              theme.colorScheme.primary,
              theme,
            )),
        Obx(() => _buildAmountBox(
              Icons.arrow_upward,
              'Debited',
              walletController.totalDebited.value,
              theme.colorScheme.error,
              theme,
            )),
      ],
    );
  }

  Widget _buildAmountBox(
      IconData icon, String label, String value, Color color, ThemeData theme) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: theme.cardColor,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: theme.shadowColor.withOpacity(0.1),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Icon(icon, color: color),
            const SizedBox(width: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: theme.textTheme.bodySmall,
                ),
                Text(
                  value,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: color,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title, ThemeData theme) {
    return Row(
      children: [
        Text(
          title,
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const Spacer(),
        // Only show "See All" for Transactions section
        if (title == 'Transactions')
          GestureDetector(
            onTap: () {
              final userId = sessionController.userId.value;
              final username = sessionController.username.value;
              final emailId = sessionController.emailId.value;
              final token = sessionController.token.value;

              Get.to(() => PaymentHistoryPage(
                    userId: userId,
                    username: username,
                    emailId: emailId,
                    token: token,
                  ));
            },
            child: Text(
              'See All',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.primary,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildOptionsRow(ThemeData theme) {
    // Use theme-based colors for the option cards
    final primaryLight = theme.colorScheme.primary.withOpacity(0.15);
    final secondaryLight = theme.colorScheme.secondary.withOpacity(0.15);
    final tertiaryLight = theme.colorScheme.tertiary != null
        ? theme.colorScheme.tertiary.withOpacity(0.15)
        : theme.colorScheme.primary.withOpacity(0.1);

    return Row(
      children: [
        _buildOptionCard(
            Icons.credit_card, 'Add Credits', 'To wallet', primaryLight, theme),
        _buildOptionCard(Icons.receipt_long, 'Transaction', 'History',
            secondaryLight, theme),
        _buildOptionCard(
            Icons.payments, 'Withdraw', 'To bank', tertiaryLight, theme),
      ],
    );
  }

  Widget _buildOptionCard(IconData icon, String title, String subtitle,
      Color color, ThemeData theme) {
    return Expanded(
      child: GestureDetector(
        onTap: () {
          // Handle navigation based on the option title
          if (title == 'Add Credits') {
            Get.to(() => AddCreditsPage());
          } else if (title == 'Transaction') {
            final userId = sessionController.userId.value;
            final username = sessionController.username.value;
            final emailId = sessionController.emailId.value;
            final token = sessionController.token.value;

            Get.to(() => PaymentHistoryPage(
                  userId: userId,
                  username: username,
                  emailId: emailId,
                  token: token,
                ));
          }
          // Add more conditions for other options if needed
        },
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 4),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: theme.cardColor,
                child: Icon(
                  icon,
                  size: 20,
                  color: theme.colorScheme.primary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                title,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                subtitle,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.textTheme.bodySmall?.color?.withOpacity(0.7),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProgressCards(ThemeData theme) {
    return Column(
      children: [
        Obx(() => _buildProgressItem(
            'Monthly Charging Goal',
            walletController.getMonthlyChargingGoalText(),
            walletController.getMonthlyChargingGoalProgress(),
            theme)),
        const SizedBox(height: 8),
        Obx(() => _buildProgressItem(
            'Energy Savings',
            walletController.getEnergySavingsText(),
            walletController.getEnergySavingsProgress(),
            theme)),
        const SizedBox(height: 8),
        Obx(() => _buildProgressItem(
            'Carbon Footprint Reduction',
            walletController.getCarbonFootprintReductionText(),
            walletController.getCarbonFootprintReductionProgress(),
            theme)),
      ],
    );
  }

  Widget _buildProgressItem(
      String title, String value, double progress, ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: theme.shadowColor.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(value, style: theme.textTheme.bodyMedium),
              Text(
                '${(progress * 100).toInt()}%',
                style: theme.textTheme.bodyMedium,
              ),
            ],
          ),
          const SizedBox(height: 6),
          LinearProgressIndicator(
            value: progress,
            color: theme.colorScheme.secondary,
            backgroundColor: theme.colorScheme.secondary.withOpacity(0.2),
            minHeight: 6,
          ),
        ],
      ),
    );
  }

  Widget _buildTransactionList(ThemeData theme) {
    return Column(
      children: [
        // Credited transactions summary
        Obx(() => _buildTransactionSummary(
              'Credited Transactions',
              walletController.creditedCount.value.toString(),
              Icons.arrow_downward,
              theme.colorScheme.primary,
              theme,
            )),
        const SizedBox(height: 8),
        // Debited transactions summary
        Obx(() => _buildTransactionSummary(
              'Debited Transactions',
              walletController.debitedCount.value.toString(),
              Icons.arrow_upward,
              theme.colorScheme.error,
              theme,
            )),
      ],
    );
  }

  Widget _buildTransactionSummary(
      String title, String count, IconData icon, Color color, ThemeData theme) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: theme.shadowColor.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Icon(
            icon,
            color: color,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              title,
              style: theme.textTheme.bodyMedium,
            ),
          ),
          Text(
            count,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
