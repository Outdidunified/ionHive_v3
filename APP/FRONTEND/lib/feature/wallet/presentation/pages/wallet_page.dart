import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/transactions/presentation/pages/paymenthistory.dart';
import 'package:ionhive/feature/wallet/presentation/pages/add_credits.dart';
import 'package:shimmer/shimmer.dart';

import '../controller/wallet_controller.dart';

class WalletPage extends StatelessWidget {
  final sessionController = Get.find<SessionController>();
  final walletController =
      Get.put(WalletController(), permanent: true, tag: 'wallet');

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
          child: Obx(() {
            // Show loading state
            if (!walletController.hasInitialData.value) {
              return _buildLoadingState(theme);
            }

            // Show content without refresh indicator
            return Stack(
              children: [
                ListView(
                  physics:
                      const ClampingScrollPhysics(), // Changed to prevent pull effect
                  children: [
                    _buildHeader(username, theme, context),
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
                    // Add extra space at bottom for better scrolling
                    const SizedBox(height: 60),
                  ],
                ),
              ],
            );
          }),
        ),
      ),
    );
  }

  Widget _buildHeader(String username, ThemeData theme, BuildContext context) {
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
            'Hii $greeting!\n$username This your wallet',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        IconButton(
          icon: Image.asset('assets/icons/info.png',
              height: 18, width: 18, color: theme.iconTheme.color),
          onPressed: () {
            _showWalletInfoBottomSheet(context, theme);
          },
        ),
      ],
    );
  }

// Helper method to get greeting based on time of day
  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

// Method to show wallet info as a bottom sheet sliding up from the bottom
  void _showWalletInfoBottomSheet(BuildContext context, ThemeData theme) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      backgroundColor: Colors.transparent,
      builder: (BuildContext context) {
        return DraggableScrollableSheet(
          expand: false,
          initialChildSize: 0.6,
          minChildSize: 0.35,
          maxChildSize: 0.9,
          builder: (BuildContext context, ScrollController scrollController) {
            return Container(
              decoration: BoxDecoration(
                color: theme.scaffoldBackgroundColor,
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(20)),
                boxShadow: [
                  BoxShadow(
                    color: theme.colorScheme.primary.withOpacity(0.15),
                    blurRadius: 12,
                    spreadRadius: 1,
                    offset: const Offset(0, -3),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header with drag handle and title
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      borderRadius:
                          const BorderRadius.vertical(top: Radius.circular(20)),
                    ),
                    child: Column(
                      children: [
                        // Drag handle
                        Center(
                          child: Container(
                            width: 60,
                            height: 5,
                            margin: const EdgeInsets.symmetric(vertical: 8),
                            decoration: BoxDecoration(
                              color: theme.textTheme.bodyMedium?.color
                                  ?.withOpacity(0.30),
                              borderRadius: BorderRadius.circular(8),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.1),
                                  blurRadius: 3,
                                  offset: const Offset(0, 1),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Scrollable content
                  Expanded(
                    child: SingleChildScrollView(
                      controller: scrollController,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 8),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildInfoSection(
                            theme,
                            'What is the Wallet?',
                            'Your wallet stores the credits you can use for charging sessions at ion Hive stations. You can recharge your wallet to ensure uninterrupted access to charging services.',
                          ),
                          _buildInfoSection(
                            theme,
                            'How to Recharge Your Wallet',
                            '1. Navigate to the "Wallet" section in the app.\n'
                                '2. Tap on " Add Credits".\n'
                                '3. Enter the amount you wish to add.\n'
                                '4. Choose a payment method (Visa, Mastercard, PayPal.. and more!!).\n'
                                '5. Confirm the payment to add credits to your wallet.',
                          ),
                          _buildInfoSection(
                            theme,
                            'Important Details',
                            '• Wallet credits are non-refundable after 30 days.\n'
                                '• Ensure your payment method is linked in the app settings.\n'
                                '• Check your balance before starting a charging session.\n'
                                '• For issues, contact support via the "Having Issue" button.',
                          ),
                          const SizedBox(
                              height: 70), // Space for the close button
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

// Helper method to build info sections in the bottom sheet
  Widget _buildInfoSection(ThemeData theme, String title, String content) {
    return Card(
      elevation: theme.cardTheme.elevation,
      margin: const EdgeInsets.only(bottom: 16),
      shape: theme.cardTheme.shape,
      color: theme.cardTheme.color,
      surfaceTintColor: theme.cardTheme.surfaceTintColor,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w600,
                color: theme.colorScheme.primary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              content,
              style: theme.textTheme.bodyLarge?.copyWith(
                color: theme.textTheme.bodyLarge?.color?.withOpacity(0.85),
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
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
          Obx(() {
            if (walletController.isLoading.value &&
                !walletController.hasInitialData.value) {
              return Row(
                children: [
                  SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    'Loading...',
                    style: theme.textTheme.titleLarge?.copyWith(
                      color: Colors.white,
                    ),
                  ),
                ],
              );
            }

            return Text(
              walletController.walletBalance.value,
              style: theme.textTheme.headlineMedium?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            );
          }),
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

              Get.to(
                () => PaymentHistoryPage(
                  userId: userId,
                  username: username,
                  emailId: emailId,
                  token: token,
                ),
                transition: Transition.rightToLeft,
                duration: const Duration(milliseconds: 300),
              );
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
    bool showCornerTag = title == 'Withdraw';

    return Expanded(
      child: GestureDetector(
        onTap: () {
          if (title == 'Add Credits') {
            Get.to(() => AddCreditsPage(),
                transition: Transition.rightToLeft,
                duration: const Duration(milliseconds: 300));
          } else if (title == 'Transaction') {
            final userId = sessionController.userId.value;
            final username = sessionController.username.value;
            final emailId = sessionController.emailId.value;
            final token = sessionController.token.value;

            Get.to(
                  () => PaymentHistoryPage(
                userId: userId,
                username: username,
                emailId: emailId,
                token: token,
              ),
              transition: Transition.rightToLeft,
              duration: const Duration(milliseconds: 300),
            );
          }
        },
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            Container(
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
                      color:
                      theme.textTheme.bodySmall?.color?.withOpacity(0.7),
                    ),
                  ),
                ],
              ),
            ),

            // 👉 Positioned Corner Tag
            if (showCornerTag)
              Positioned(
                top: -7,
                right: 25,
                child: CornerTag(
                  label: 'Soon!',
                  isCapitative: false,
                  isDarkTheme: theme.brightness == Brightness.dark,
                ),
              ),
          ],
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
    return Obx(() {
      // Show shimmer loading effect if we're refreshing data for the first time
      if (walletController.isLoading.value &&
          !walletController.hasInitialData.value) {
        return _buildTransactionListShimmer(theme);
      }

      return Column(
        children: [
          // Show a subtle loading indicator at the top when refreshing
          if (walletController.isLoading.value)
            Padding(
              padding: const EdgeInsets.only(bottom: 8.0),
              child: LinearProgressIndicator(
                backgroundColor: theme.colorScheme.primary.withOpacity(0.1),
                valueColor: AlwaysStoppedAnimation<Color>(
                  theme.colorScheme.primary,
                ),
                minHeight: 2,
              ),
            ),

          // Credited transactions summary
          _buildTransactionSummary(
            'Credited Transactions',
            walletController.creditedCount.value.toString(),
            Icons.arrow_downward,
            theme.colorScheme.primary,
            theme,
          ),
          const SizedBox(height: 8),
          // Debited transactions summary
          _buildTransactionSummary(
            'Debited Transactions',
            walletController.debitedCount.value.toString(),
            Icons.arrow_upward,
            theme.colorScheme.error,
            theme,
          ),
        ],
      );
    });
  }

  Widget _buildTransactionListShimmer(ThemeData theme) {
    return Shimmer.fromColors(
      baseColor: theme.brightness == Brightness.dark
          ? Colors.grey[700]!
          : Colors.grey[300]!,
      highlightColor: theme.brightness == Brightness.dark
          ? Colors.grey[600]!
          : Colors.grey[100]!,
      child: Column(
        children: [
          // Shimmer for first transaction summary
          _buildTransactionSummaryShimmer(theme),
          const SizedBox(height: 8),
          // Shimmer for second transaction summary
          _buildTransactionSummaryShimmer(theme),
        ],
      ),
    );
  }

  Widget _buildTransactionSummaryShimmer(ThemeData theme) {
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
          // Icon placeholder
          Container(
            width: 24,
            height: 24,
            color: Colors.white,
          ),
          const SizedBox(width: 12),
          // Title placeholder
          Expanded(
            child: Container(
              height: 16,
              color: Colors.white,
            ),
          ),
          // Count placeholder
          Container(
            width: 30,
            height: 16,
            color: Colors.white,
          ),
        ],
      ),
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

  Widget _buildLoadingState(ThemeData theme) {
    return Shimmer.fromColors(
      baseColor: theme.brightness == Brightness.dark
          ? Colors.grey[700]!
          : Colors.grey[300]!,
      highlightColor: theme.brightness == Brightness.dark
          ? Colors.grey[600]!
          : Colors.grey[100]!,
      child: ListView(
        physics: const NeverScrollableScrollPhysics(),
        children: [
          _buildHeaderShimmer(theme),
          const SizedBox(height: 20),
          _buildBalanceCardShimmer(theme),
          const SizedBox(height: 16),
          _buildIncomeOutcomeRowShimmer(theme),
          const SizedBox(height: 20),
          _buildSectionTitleShimmer(theme),
          const SizedBox(height: 12),
          _buildOptionsRowShimmer(theme),
          const SizedBox(height: 20),
          _buildSectionTitleShimmer(theme),
          const SizedBox(height: 12),
          _buildProgressCardsShimmer(theme),
          const SizedBox(height: 20),
          _buildSectionTitleShimmer(theme),
          const SizedBox(height: 12),
          _buildTransactionListShimmer(theme),
        ],
      ),
    );
  }

  Widget _buildHeaderShimmer(ThemeData theme) {
    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 150,
                height: 16,
                color: Colors.white,
              ),
              const SizedBox(height: 4),
              Container(
                width: 200,
                height: 14,
                color: Colors.white,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBalanceCardShimmer(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.colorScheme.primary.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 100,
            height: 14,
            color: Colors.white,
          ),
          const SizedBox(height: 8),
          Container(
            width: 150,
            height: 30,
            color: Colors.white,
          ),
        ],
      ),
    );
  }

  Widget _buildIncomeOutcomeRowShimmer(ThemeData theme) {
    return Row(
      children: [
        Expanded(
          child: Container(
            height: 80,
            decoration: BoxDecoration(
              color: theme.cardColor,
              borderRadius: BorderRadius.circular(14),
            ),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Container(
            height: 80,
            decoration: BoxDecoration(
              color: theme.cardColor,
              borderRadius: BorderRadius.circular(14),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSectionTitleShimmer(ThemeData theme) {
    return Container(
      width: 120,
      height: 20,
      color: Colors.white,
    );
  }

  Widget _buildOptionsRowShimmer(ThemeData theme) {
    return Row(
      children: [
        Expanded(
          child: Container(
            height: 80,
            decoration: BoxDecoration(
              color: theme.cardColor,
              borderRadius: BorderRadius.circular(14),
            ),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Container(
            height: 80,
            decoration: BoxDecoration(
              color: theme.cardColor,
              borderRadius: BorderRadius.circular(14),
            ),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Container(
            height: 80,
            decoration: BoxDecoration(
              color: theme.cardColor,
              borderRadius: BorderRadius.circular(14),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildProgressCardsShimmer(ThemeData theme) {
    return Column(
      children: [
        Container(
          height: 80,
          decoration: BoxDecoration(
            color: theme.cardColor,
            borderRadius: BorderRadius.circular(14),
          ),
        ),
        const SizedBox(height: 8),
        Container(
          height: 80,
          decoration: BoxDecoration(
            color: theme.cardColor,
            borderRadius: BorderRadius.circular(14),
          ),
        ),
        const SizedBox(height: 8),
        Container(
          height: 80,
          decoration: BoxDecoration(
            color: theme.cardColor,
            borderRadius: BorderRadius.circular(14),
          ),
        ),
      ],
    );
  }
}

class CornerTag extends StatelessWidget {
  final String label;
  final bool isCapitative;
  final bool isDarkTheme;

  const CornerTag({
    Key? key,
    required this.label,
    required this.isCapitative,
    required this.isDarkTheme,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isSmallScreen = screenWidth < 360;
    final tagWidth = isSmallScreen
        ? (isCapitative ? screenWidth * 0.22 : screenWidth * 0.16)
        : (isCapitative ? screenWidth * 0.25 : screenWidth * 0.18);
    // Make the tag slightly taller to add space at the bottom
    final tagHeight = isSmallScreen ? screenWidth * 0.03 : screenWidth * 0.04;

    return Container(
      width: tagWidth,
      height: tagHeight,
      // All sides same margin
      decoration: BoxDecoration(
        color:  Colors.orange.shade800,
        borderRadius: const BorderRadius.only(
          topRight: Radius.circular(11), // Match the card's corner radius
          bottomLeft: Radius.circular(16),
          bottomRight:
          Radius.circular(4), // Add a small curve at the bottom right
        ),
        boxShadow: [
          BoxShadow(
            color: isDarkTheme
                ? Colors.black45.withOpacity(0.3)
                : Colors.black.withOpacity(0.3),
            blurRadius: 6,
            spreadRadius: 1,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Padding(
        padding:
        const EdgeInsets.only(bottom: 1.0), // Add padding at the bottom
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              fontSize: isSmallScreen
                  ? (isCapitative ? screenWidth * 0.024 : screenWidth * 0.026)
                  : (isCapitative ? screenWidth * 0.026 : screenWidth * 0.028),
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}
