import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/feature/more/presentation/pages/account/presentation/pages/delete_account_page.dart';

class AccountAndPrivacyPage extends StatelessWidget {
  const AccountAndPrivacyPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context); // Retrieve the theme data here

    return Scaffold(
      appBar: AppBar(
        title: const Text('Account Privacy'),
        centerTitle: true,
        backgroundColor: theme.primaryColor,
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
                    text: 'www.statiq.in ("Website").',
                    style: const TextStyle(color: Colors.blue),
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
                    text: 'dataprivacy@statiq.in',
                    style: const TextStyle(color: Colors.blue),
                  ),
                  const TextSpan(text: '.'),
                ],
              ),
            ),
            const SizedBox(height: 16),
            _buildDeleteAccountButton(theme, onTap: () {}),
          ],
        ),
      ),
    );
  }

  Widget _buildDeleteAccountButton(ThemeData theme, {VoidCallback? onTap}) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      color: theme.cardColor,
      child: InkWell(
        onTap: () {
          Get.to(() => DeleteAccountPage());
        },
        borderRadius: BorderRadius.circular(15),
        splashColor: Colors.red.withOpacity(0.2),
        highlightColor: Colors.red.withOpacity(0.1),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  'Delete Account',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: Colors.red, // Red text color
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
