import 'package:flutter/material.dart';

class MainCard extends StatelessWidget {
  final ThemeData theme;

  const MainCard({super.key, required this.theme});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        // Determine if the screen is small (e.g., mobile) or large (e.g., tablet)
        final isSmallScreen = constraints.maxWidth < 600;

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildCardOption(
                    Icons.account_balance_wallet,
                    'Wallet',
                    '₹ 0.00',
                    theme,
                    isSmallScreen,
                  ),
                  const SizedBox(width: 16),
                  _buildCardOption(
                    Icons.history,
                    'Session',
                    '0',
                    theme,
                    isSmallScreen,
                  ),
                ],
              ),
              if (!isSmallScreen)
                Padding(
                  padding: const EdgeInsets.only(top: 16.0),
                  child: Text(
                    'Additional content can go here on larger screens',
                    style: theme.textTheme.bodyLarge,
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  // Helper method for card options inside the main card
  Widget _buildCardOption(IconData icon, String title, String value,
      ThemeData theme, bool isSmallScreen) {
    return Expanded(
      child: GestureDetector(
        onTap: () {}, // Add navigation or functionality as needed
        child: Card(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          color: theme.cardColor,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8.0),
                  decoration: BoxDecoration(
                    color: theme.primaryColor.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    icon,
                    color: theme.primaryColor,
                    size: isSmallScreen ? 24 : 30, // Adjust icon size
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                          fontSize: isSmallScreen ? 11 : 14, // Adjust font size
                          fontWeight: FontWeight.bold,
                          color: theme.textTheme.titleLarge?.color,
                        ),
                      ),
                      const SizedBox(height: 5),
                      Text(
                        value,
                        style: TextStyle(
                          fontSize: isSmallScreen ? 12 : 14, // Adjust font size
                          color: theme.textTheme.bodyMedium?.color,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
