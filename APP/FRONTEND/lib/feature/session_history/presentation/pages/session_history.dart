import 'package:flutter/material.dart';

class SessionHistoryPage extends StatelessWidget {
  const SessionHistoryPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);


    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Implement download functionality
        },
        backgroundColor: theme.colorScheme.primary,
        child: Image.asset(
          'assets/icons/download.png',
          width: 24,
          height: 24,
          color: Colors.white,
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: ListView(
            children: [
              _buildHeader(context),
              const SizedBox(height: 20),
              _buildSessionStatsRow(context),
              const SizedBox(height: 20),
              _buildSectionTitle(context, 'Your Charging History'),
              const SizedBox(height: 12),
              _buildTransactionList(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "EV Session Tracker",
              style: theme.textTheme.headlineSmall,
            ),
            const SizedBox(height: 4),
            Text(
              "You power the future. We power your ride.",
              style: theme.textTheme.bodyMedium,
            ),
          ],
        ),
        const Spacer(),
        Padding(
          padding: const EdgeInsets.only(top: 3, right: 5),
          child: Image.asset(
            'assets/icons/info.png',
            width: 18,
            height: 18,
            color: theme.iconTheme.color,
          ),
        ),
      ],
    );
  }

  Widget _buildSessionStatsRow(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        _buildStatBox(
          context,
          'assets/icons/save.png',
          'Total Sessions',
          '132',
          Colors.deepPurple,
        ),
        _buildStatBox(
          context,
          'assets/icons/charge.png',
          'Total Energy',
          '480.6 kWh',
          Colors.green.shade600,
        ),
      ],
    );
  }

  Widget _buildStatBox(
      BuildContext context,
      String assetPath,
      String label,
      String value,
      Color valueColor,
      ) {
    final theme = Theme.of(context);

    return Expanded(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: theme.cardTheme.color,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Image.asset(
              assetPath,
              width: 25,
              height: 25,
              color: theme.iconTheme.color,
            ),
            const SizedBox(width: 15),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: theme.textTheme.bodySmall),
                const SizedBox(height: 5),
                Text(
                  value,
                  style: theme.textTheme.titleLarge!.copyWith(
                    fontWeight: FontWeight.bold,
                    color: valueColor,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    return Row(
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        const Spacer(),
      ],
    );
  }

  Widget _buildTransactionList(BuildContext context) {
    final theme = Theme.of(context);
    final txStyle = theme.textTheme.titleLarge;
    final txSubStyle = theme.textTheme.bodyMedium;
    final cardColor = theme.cardTheme.color;

    final transactions = [
      {
        'chargerId': 'CHG-001',
        'amount': '-\Rs.32.00',
        'date': 'Apr 12, 2025',
        'kwh': '12.5 kWh',
      },
      {
        'chargerId': 'CHG-002',
        'amount': '-\Rs.    15.00',
        'date': 'Apr 10, 2025',
        'kwh': '6.8 kWh',
      },
    ];

    return Column(
      children: transactions.map((tx) {
        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: cardColor,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // First row: Charger ID and Amount
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Charger: ${tx['chargerId']}',
                    style: txStyle!.copyWith(fontWeight: FontWeight.w600,color: Colors.grey[600]),
                  ),
                  Text(
                    tx['amount']!,
                    style: txStyle.copyWith(
                      color: Colors.red,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              // Second row: Date and kWh
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(tx['date']!, style: txSubStyle),
                  Text(tx['kwh']!, style: txSubStyle!.copyWith(color: theme.colorScheme.onSurface)),
                ],
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}
