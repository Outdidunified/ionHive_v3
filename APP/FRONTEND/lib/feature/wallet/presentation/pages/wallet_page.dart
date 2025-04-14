import 'package:flutter/material.dart';

class WalletPage extends StatelessWidget {
  const WalletPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: ListView(
            children: [
              _buildHeader(),
              const SizedBox(height: 20),
              _buildBalanceCard(),
              const SizedBox(height: 16),
              _buildIncomeOutcomeRow(),
              const SizedBox(height: 20),
              _buildSectionTitle('Earnings'),
              const SizedBox(height: 12),
              _buildEarningsRow(),
              const SizedBox(height: 20),
              _buildSectionTitle('Savings'),
              const SizedBox(height: 12),
              _buildSavingsCards(),
              const SizedBox(height: 20),
              _buildSectionTitle('Transactions'),
              const SizedBox(height: 12),
              _buildTransactionList(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: const [
        CircleAvatar(
          backgroundImage: AssetImage('assets/avatar.png'), // Replace with real asset
        ),
        SizedBox(width: 12),
        Text(
          'Good Morning!\nC Muthu Krishnan wallet' ,
          style: TextStyle(fontWeight: FontWeight.w600),
        ),
        Spacer(),
        Icon(Icons.notifications_none),
      ],
    );
  }

  Widget _buildBalanceCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          Text('Total Balance', style: TextStyle(color: Colors.white70)),
          SizedBox(height: 8),
          Text('\$25,000.40', style: TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildIncomeOutcomeRow() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        _buildAmountBox(Icons.arrow_downward, 'Income', '\$20,000', Colors.green),
        _buildAmountBox(Icons.arrow_upward, 'Outcome', '\$17,000', Colors.red),
      ],
    );
  }

  Widget _buildAmountBox(IconData icon, String label, String value, Color color) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          children: [
            Icon(icon, color: color),
            const SizedBox(width: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontSize: 12)),
                Text(value, style: TextStyle(color: color, fontWeight: FontWeight.bold)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Row(
      children: [
        Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
        const Spacer(),
        const Text('See All', style: TextStyle(color: Colors.blue)),
      ],
    );
  }

  Widget _buildEarningsRow() {
    return Row(
      children: [
        _buildEarningCard('U', 'Upwork', '\$3,000', Colors.red.shade100),
        _buildEarningCard('F', 'Freepik', '\$3,000', Colors.pink.shade100),
        _buildEarningCard('W', 'Envato', '\$2,000', Colors.blue.shade100),
      ],
    );
  }

  Widget _buildEarningCard(String initial, String title, String value, Color color) {
    return Expanded(
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
              radius: 14,
              backgroundColor: Colors.white,
              child: Text(initial, style: const TextStyle(fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 8),
            Text(title),
            Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildSavingsCards() {
    return Column(
      children: [
        _buildSavingsItem('Iphone 13 Mini', '\$699', 0.3),
        const SizedBox(height: 8),
        _buildSavingsItem('Macbook Pro M1', '\$1,499', 0.6),
        const SizedBox(height: 8),
        _buildSavingsItem('House', '\$30,500', 0.9),
      ],
    );
  }

  Widget _buildSavingsItem(String title, String value, double progress) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(value),
              Text('${(progress * 100).toInt()}%'),
            ],
          ),
          const SizedBox(height: 6),
          LinearProgressIndicator(
            value: progress,
            color: Colors.purple,
            backgroundColor: Colors.purple.shade100,
            minHeight: 6,
          ),
        ],
      ),
    );
  }

  Widget _buildTransactionList() {
    final transactions = [
      {'title': 'Adobe Illustrator', 'amount': '-\$32.00'},
      {'title': 'Dribbble', 'amount': '-\$15.00'},
    ];

    return Column(
      children: transactions
          .map((tx) => Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          children: [
            const Icon(Icons.subscriptions, color: Colors.orange),
            const SizedBox(width: 12),
            Expanded(child: Text(tx['title']!)),
            Text(tx['amount']!, style: const TextStyle(color: Colors.red)),
          ],
        ),
      ))
          .toList(),
    );
  }
}
