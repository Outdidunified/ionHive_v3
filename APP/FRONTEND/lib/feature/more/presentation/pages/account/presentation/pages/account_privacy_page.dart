import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/feature/more/presentation/pages/account/presentation/pages/delete_account_page.dart';

class AccountAndPrivacyPage extends StatelessWidget {
  const AccountAndPrivacyPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Account & Privacy',
          style: TextStyle(
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        backgroundColor: colorScheme.primaryContainer,
        elevation: 3,
        iconTheme: IconThemeData(color: colorScheme.onPrimaryContainer),
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            bottom: Radius.circular(20),
          ),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Account privacy and policy',
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            RichText(
              text: TextSpan(
                style: theme.textTheme.bodyLarge,
                children: [
                  const TextSpan(
                    text:
                    'This Privacy Policy describes how we collect, use, process, and disclose your information, including personal information, in conjunction with your access to and use of our website and mobile application, ',
                  ),
                  TextSpan(
                    text: 'https://outdidunified.com/',
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: Colors.blueAccent,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'If you see an undefined term in this Privacy Policy, it has the same definition as in our Terms of Service. When this policy mentions "Company," "we," "us," or "our" it refers to the "Sharify Services Pvt. Ltd", the company(ies) responsible for your information under this Privacy Policy.',
              style: theme.textTheme.bodyLarge,
            ),
            const SizedBox(height: 16),
            RichText(
              text: TextSpan(
                style: theme.textTheme.bodyLarge,
                children: [
                  const TextSpan(
                    text:
                    'If you have any questions or complaints about this Privacy Policy or Company\'s information handling practices, you may email us at ',
                  ),
                  TextSpan(
                    text: 'info@outdidunified.com',
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: Colors.blueAccent,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                  const TextSpan(text: '.'),
                ],
              ),
            ),
            const SizedBox(height: 24),
            _buildDeleteAccountButton(theme, colorScheme),
          ],
        ),
      ),
    );
  }

  Widget _buildDeleteAccountButton(ThemeData theme, ColorScheme colorScheme) {
    final isDark = theme.brightness == Brightness.dark;

    return Card(
      elevation: isDark ? 0 : 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      color: colorScheme.surfaceVariant,
      shadowColor: Colors.black26,
      child: InkWell(
        onTap: () => Get.to(() =>  DeleteAccountPage()),
        borderRadius: BorderRadius.circular(16),
        splashColor: Colors.red.withOpacity(0.2),
        highlightColor: Colors.red.withOpacity(0.1),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16.0, horizontal: 20),
          child: Row(
            children: [
              const Icon(Icons.delete_forever, color: Colors.red, size: 26),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  'Delete Account',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: Colors.red,
                  ),
                ),
              ),
              const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
            ],
          ),
        ),
      ),
    );
  }
}
