import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class ContactUs extends StatelessWidget {
  const ContactUs({super.key});

  final String phoneNumber = "+919972071514";
  final String email = "info@outdidunified.com";
  final String linkedInUrl = "https://www.linkedin.com/company/outdid-unified/";

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Contact Us'),
        centerTitle: true,
        backgroundColor: theme.scaffoldBackgroundColor,
        elevation: 0,
        iconTheme: IconThemeData(color: theme.iconTheme.color),
      ),
      backgroundColor: theme.scaffoldBackgroundColor,
      body: Padding(
        padding: EdgeInsets.all(screenWidth * 0.04),
        child: ListView(
          children: [
            Text(
              'Get in Touch',
              style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
            ),
            SizedBox(height: screenHeight * 0.01),
            Text(
              "We're here to help. Reach out to us with any questions, concerns, or feedback.",
              style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.6)),
            ),
            SizedBox(height: screenHeight * 0.03),

            // Contact Options
            Row(
              children: [
                _buildContactCard(
                  theme, Icons.call, 'Call us', 'Mon-Sat • 9.30-6.30', _makeCall, screenWidth,
                ),
                SizedBox(width: screenWidth * 0.03),
                _buildContactCard(
                  theme, Icons.email, 'Email us', 'Mon-Sat • 9.30-6.30', _sendEmail, screenWidth,
                ),
              ],
            ),
            SizedBox(height: screenHeight * 0.04),

            // Social Media Section
            Text(
              'Follow Us',
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w500),
            ),
            SizedBox(height: screenHeight * 0.02),

            _buildSocialCard(theme, 'LinkedIn', '286 Followers • 11 Posts', FontAwesomeIcons.linkedin, () => _launchURL(linkedInUrl)),
            _buildSocialCard(theme, 'WhatsApp', 'Available Mon-Sat • 9.30-6.30', FontAwesomeIcons.whatsapp, () => _launchWhatsApp(phoneNumber)),
          ],
        ),
      ),
    );
  }

  // Function to open dialer
  void _makeCall() async {
    final Uri callUri = Uri.parse("tel:$phoneNumber");
    if (await canLaunchUrl(callUri)) await launchUrl(callUri);
  }

  // Function to open email app
  void _sendEmail() async {
    final Uri emailUri = Uri(scheme: 'mailto', path: email, queryParameters: {'subject': 'Support Request'});
    if (await canLaunchUrl(emailUri)) await launchUrl(emailUri);
  }

  // Function to open WhatsApp
  void _launchWhatsApp(String phone) async {
    final Uri url = Uri.parse("https://wa.me/$phone");
    if (await canLaunchUrl(url)) await launchUrl(url);
  }

  // Function to open LinkedIn
  void _launchURL(String url) async {
    if (await canLaunchUrl(Uri.parse(url))) await launchUrl(Uri.parse(url));
  }

  Widget _buildContactCard(
      ThemeData theme, IconData icon, String title, String subtitle, VoidCallback onTap, double screenWidth) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: EdgeInsets.all(screenWidth * 0.04),
          decoration: BoxDecoration(
            color: theme.cardColor,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: theme.shadowColor.withOpacity(0.2),
                blurRadius: 8,
                spreadRadius: 2,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: [
              CircleAvatar(
                radius: screenWidth * 0.06,
                backgroundColor: theme.primaryColor,
                child: Icon(icon, color: Colors.white, size: screenWidth * 0.08),
              ),
              SizedBox(height: screenWidth * 0.02),
              Text(title, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w500),
              ),
              SizedBox(height: screenWidth * 0.01),
              Text(subtitle, textAlign: TextAlign.center,style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.6)),

              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSocialCard(ThemeData theme, String title, String details, IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(top: 10), // Margin at the top
        padding: const EdgeInsets.all(12), // Padding inside the card
        decoration: BoxDecoration(
          color: theme.cardColor, // Use theme's card color (adapts to light/dark mode)
          borderRadius: BorderRadius.circular(12), // Rounded corners
          boxShadow: [
            BoxShadow(
              color: theme.shadowColor.withOpacity(0.1), // Subtle shadow
              blurRadius: 8,
              spreadRadius: 2,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            CircleAvatar(
              radius: 20,
              backgroundColor: theme.primaryColor, // Use theme primary color for the icon background
              child: Icon(icon, color: Colors.white, size: 20), // White icon
            ),
            const SizedBox(width: 12), // Spacing between icon and text
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w500, // Medium font weight for title
                    ),
                  ),
                  Text(
                    details,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onSurface.withOpacity(0.6), // Subdued text color
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.arrow_forward_ios,
              color: theme.colorScheme.onSurface.withOpacity(0.6), // Adaptive arrow color
              size: 16,
            ),
          ],
        ),
      ),
    );
  }}