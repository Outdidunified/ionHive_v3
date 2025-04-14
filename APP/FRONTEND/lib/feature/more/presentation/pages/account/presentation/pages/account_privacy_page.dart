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
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        elevation: 3,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [

              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Terms & Conditions',
                    style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),

                  Text(
                    '1. App Usage:',
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    '• The App provides a platform to locate and charge electric vehicles at designated stations.\n'
                        '• Payment is facilitated through Razorpay, our integrated payment gateway.\n'
                        '• By using the App, users agree to comply with these terms and any local EV charging regulations.',
                    style: theme.textTheme.bodyLarge,
                  ),

                  const SizedBox(height: 12),
                  Text(
                    '2. Account Requirements:',
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    '• Users must create an account linked to a valid mobile number and email.\n'
                        '• Users are responsible for maintaining the security of their account with a strong password.\n'
                        '• Report any unauthorized access to the support team immediately.',
                    style: theme.textTheme.bodyLarge,
                  ),

                  const SizedBox(height: 12),
                  Text(
                    '3. Payments:',
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    '• All payments are securely processed via Razorpay.\n'
                        '• We do not store any sensitive payment data like credit card or UPI information.\n'
                        '• Razorpay’s terms govern all payment-related activities and disputes.',
                    style: theme.textTheme.bodyLarge,
                  ),

                  const SizedBox(height: 12),
                  Text(
                    '4. Permissions:',
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    '• The App may require access to:\n'
                        '  - Location services (for finding nearby chargers via Google Maps).\n'
                        '  - Camera (to scan QR codes at charging stations).\n'
                        '• We do not collect or store location data.',
                    style: theme.textTheme.bodyLarge,
                  ),

                  const SizedBox(height: 12),
                  Text(
                    '5. App Updates & Termination:',
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    '• The App may be updated to improve functionality or fix bugs.\n'
                        '• Users are responsible for keeping the App updated.\n'
                        '• We may discontinue the App at any time without notice.\n'
                        '• Upon termination, usage rights and licenses will be revoked.',
                    style: theme.textTheme.bodyLarge,
                  ),

                  const SizedBox(height: 12),
                  Text(
                    '6. Third-party Services & Disclaimers:',
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    '• Some features rely on third-party services (e.g., Razorpay, Google Maps).\n'
                        '• We are not liable for losses caused by these services.\n'
                        '• Users must ensure their devices are charged and functional during sessions.',
                    style: theme.textTheme.bodyLarge,
                  ),

                  const SizedBox(height: 24),
                  Text(
                    'Privacy Policy',
                    style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),

                  Text(
                    '1. Personal Information:',
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    '• We collect your mobile number and email during account registration.\n'
                        '• Passwords are encrypted and securely stored.',
                    style: theme.textTheme.bodyLarge,
                  ),

                  const SizedBox(height: 12),
                  Text(
                    '2. Payment Data:',
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    '• We do not store or process sensitive payment data.\n'
                        '• All payments are handled securely by Razorpay.\n'
                        '• Users are subject to Razorpay\'s privacy policy.',
                    style: theme.textTheme.bodyLarge,
                  ),

                  const SizedBox(height: 12),
                  Text(
                    '3. Location Data:',
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    '• We do not collect or retain location data.\n'
                        '• Google Maps API is used solely to help locate nearby chargers.',
                    style: theme.textTheme.bodyLarge,
                  ),

                  const SizedBox(height: 12),
                  Text(
                    '4. Communication & Notifications:',
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    '• Your contact info is used only for essential communication (e.g., password reset).\n'
                        '• We do not send promotional messages.',
                    style: theme.textTheme.bodyLarge,
                  ),

                  const SizedBox(height: 12),
                  Text(
                    '5. Data Protection:',
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    '• We apply reasonable security practices to protect your data.\n'
                        '• Access to personal data is restricted to authorized personnel.\n'
                        '• Jailbreaking/rooting your device may compromise app functionality and security.',
                    style: theme.textTheme.bodyLarge,
                  ),

                  const SizedBox(height: 12),
                  Text(
                    '6. Data Retention & Deletion:',
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    '• Your data is retained as long as your account is active.\n'
                        '• You may request data deletion by contacting support.\n'
                        '• Upon deletion, all personal information will be permanently removed.',
                    style: theme.textTheme.bodyLarge,
                  ),

                  const SizedBox(height: 12),
                  Text(
                    '7. User Rights:',
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    '• You have the right to access, update, or delete your account information.\n'
                        '• For assistance, contact: info@outdidunified.com',
                    style: theme.textTheme.bodyLarge,
                  ),

                  const SizedBox(height: 12),
                  Text(
                    '8. Updates to Privacy Policy:',
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    '• We may update this policy occasionally.\n'
                        '• Continued use of the App indicates acceptance of changes.',
                    style: theme.textTheme.bodyLarge,
                  ),
                ],
              ),

              const SizedBox(height: 24),
              _buildDeleteAccountButton(theme, colorScheme),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDeleteAccountButton(ThemeData theme, ColorScheme colorScheme) {
    final isDark = theme.brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0), // <-- Bottom margin added here
      child: Card(
        elevation: isDark ? 0 : 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(
            color: Colors.grey,
            width: 0.2,
          ),
        ),
        color: colorScheme.surfaceVariant,
        shadowColor: Colors.black26,
        child: InkWell(
          onTap: () => Get.to(() => DeleteAccountPage()),
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
      ),
    );
  }


}
