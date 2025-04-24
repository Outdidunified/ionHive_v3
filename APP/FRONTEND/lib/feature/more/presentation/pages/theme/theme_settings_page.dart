import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/utils/theme/theme_controller.dart';
import 'package:ionhive/utils/widgets/snackbar/custom_snackbar.dart';

class ThemeSettingsPage extends StatelessWidget {
  final themeController = Get.find<ThemeController>();

  ThemeSettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Theme Settings',
          style: TextStyle(
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSectionTitle('App Theme', theme),
            const SizedBox(height: 16),
            _buildThemeModeSelector(theme),
            // const SizedBox(height: 32),
            // _buildSectionTitle('Primary Color', theme),
            // const SizedBox(height: 16),
            // _buildColorPalette(theme),
            // const SizedBox(height: 32),
            // _buildThemePreview(theme),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title, ThemeData theme) {
    return Text(
      title,
      style: TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: theme.colorScheme.primary,
      ),
    );
  }

  Widget _buildThemeModeSelector(ThemeData theme) {
    return Obx(() => Column(
          children: [
            _buildThemeOption(
              title: 'Light Theme',
              icon: Icons.light_mode,
              isSelected: themeController.themeMode.value == ThemeMode.light,
              onTap: () {
                themeController.changeThemeMode(ThemeMode.light);
                CustomSnackbar.showSuccess(message: 'Light theme applied');
              },
              theme: theme,
            ),
            const SizedBox(height: 12),
            _buildThemeOption(
              title: 'Dark Theme',
              icon: Icons.dark_mode,
              isSelected: themeController.themeMode.value == ThemeMode.dark,
              onTap: () {
                themeController.changeThemeMode(ThemeMode.dark);
                CustomSnackbar.showSuccess(message: 'Dark theme applied');
              },
              theme: theme,
            ),
            const SizedBox(height: 12),
            _buildThemeOption(
              title: 'System Default',
              icon: Icons.settings_suggest,
              isSelected: themeController.themeMode.value == ThemeMode.system,
              onTap: () {
                themeController.changeThemeMode(ThemeMode.system);
                CustomSnackbar.showSuccess(message: 'System theme applied');
              },
              theme: theme,
            ),
          ],
        ));
  }

  Widget _buildThemeOption({
    required String title,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
    required ThemeData theme,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
        decoration: BoxDecoration(
          color: isSelected ? theme.colorScheme.primary.withOpacity(0.1) : null,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? theme.colorScheme.primary : theme.dividerColor,
            width: 1.5,
          ),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: isSelected
                  ? theme.colorScheme.primary
                  : theme.iconTheme.color,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                  color: isSelected
                      ? theme.colorScheme.primary
                      : theme.textTheme.bodyLarge?.color,
                ),
              ),
            ),
            if (isSelected)
              Icon(
                Icons.check_circle,
                color: theme.colorScheme.primary,
              ),
          ],
        ),
      ),
    );
  }

  // Widget _buildColorPalette(ThemeData theme) {
  //   return Obx(() => Wrap(
  //         spacing: 16,
  //         runSpacing: 16,
  //         children: themeController.availableColors.map((color) {
  //           final isSelected =
  //               themeController.primaryColor.value.value == color.value;
  //           final bool isDarkColor = color.computeLuminance() < 0.5;
  //           final Color borderColor = isSelected
  //               ? (isDarkColor ? Colors.white : Colors.black)
  //               : Colors.transparent;
  //           final Color checkColor = isDarkColor ? Colors.white : Colors.black;

  //           return GestureDetector(
  //             onTap: () {
  //               themeController.changePrimaryColor(color);
  //               CustomSnackbar.showSuccess(message: 'Color theme updated');
  //             },
  //             child: AnimatedContainer(
  //               duration: const Duration(milliseconds: 200),
  //               width: 60,
  //               height: 60,
  //               decoration: BoxDecoration(
  //                 color: color,
  //                 shape: BoxShape.circle,
  //                 border: Border.all(
  //                   color: borderColor,
  //                   width: 3,
  //                 ),
  //                 boxShadow: [
  //                   BoxShadow(
  //                     color: color.withOpacity(0.4),
  //                     blurRadius: 8,
  //                     spreadRadius: 2,
  //                   ),
  //                 ],
  //               ),
  //               child: isSelected
  //                   ? Icon(
  //                       Icons.check,
  //                       color: checkColor,
  //                       size: 30,
  //                     )
  //                   : null,
  //             ),
  //           );
  //         }).toList(),
  //       ));
  // }

  // Widget _buildThemePreview(ThemeData theme) {
  //   final bool isDarkMode = theme.brightness == Brightness.dark;

  //   return Column(
  //     crossAxisAlignment: CrossAxisAlignment.start,
  //     children: [
  //       _buildSectionTitle('Preview', theme),
  //       const SizedBox(height: 16),
  //       Container(
  //         padding: const EdgeInsets.all(20),
  //         decoration: BoxDecoration(
  //           color: theme.cardColor,
  //           borderRadius: BorderRadius.circular(16),
  //           boxShadow: [
  //             BoxShadow(
  //               color: isDarkMode
  //                   ? Colors.black.withOpacity(0.3)
  //                   : Colors.black.withOpacity(0.05),
  //               blurRadius: 10,
  //               spreadRadius: isDarkMode ? 0 : 1,
  //             ),
  //           ],
  //           border: isDarkMode
  //               ? Border.all(color: theme.dividerColor, width: 0.5)
  //               : null,
  //         ),
  //         child: Column(
  //           crossAxisAlignment: CrossAxisAlignment.start,
  //           children: [
  //             Text(
  //               'Theme Preview',
  //               style: TextStyle(
  //                 fontSize: 18,
  //                 fontWeight: FontWeight.bold,
  //                 color: theme.colorScheme.primary,
  //               ),
  //             ),
  //             const SizedBox(height: 16),
  //             Row(
  //               children: [
  //                 Expanded(
  //                   child: ElevatedButton(
  //                     onPressed: () {},
  //                     style: ElevatedButton.styleFrom(
  //                       backgroundColor: theme.colorScheme.primary,
  //                       foregroundColor: theme.colorScheme.onPrimary,
  //                       padding: const EdgeInsets.symmetric(vertical: 14),
  //                       shape: RoundedRectangleBorder(
  //                         borderRadius: BorderRadius.circular(10),
  //                       ),
  //                     ),
  //                     child: const Text('Primary Button'),
  //                   ),
  //                 ),
  //                 const SizedBox(width: 12),
  //                 Expanded(
  //                   child: OutlinedButton(
  //                     onPressed: () {},
  //                     style: OutlinedButton.styleFrom(
  //                       foregroundColor: theme.colorScheme.primary,
  //                       side: BorderSide(color: theme.colorScheme.primary),
  //                       padding: const EdgeInsets.symmetric(vertical: 14),
  //                       shape: RoundedRectangleBorder(
  //                         borderRadius: BorderRadius.circular(10),
  //                       ),
  //                     ),
  //                     child: const Text('Outlined Button'),
  //                   ),
  //                 ),
  //               ],
  //             ),
  //             const SizedBox(height: 20),
  //             Container(
  //               padding: const EdgeInsets.all(14),
  //               decoration: BoxDecoration(
  //                 gradient: LinearGradient(
  //                   colors: [
  //                     theme.colorScheme.primary,
  //                     theme.colorScheme.primary.withOpacity(0.7),
  //                   ],
  //                   begin: Alignment.topLeft,
  //                   end: Alignment.bottomRight,
  //                 ),
  //                 borderRadius: BorderRadius.circular(14),
  //               ),
  //               child: Row(
  //                 children: [
  //                   Icon(
  //                     Icons.info_outline,
  //                     color: theme.colorScheme.onPrimary,
  //                   ),
  //                   const SizedBox(width: 12),
  //                   Expanded(
  //                     child: Text(
  //                       'This is how your primary color looks in gradients',
  //                       style: TextStyle(
  //                         color: theme.colorScheme.onPrimary,
  //                         fontWeight: FontWeight.w500,
  //                       ),
  //                     ),
  //                   ),
  //                 ],
  //               ),
  //             ),
  //             const SizedBox(height: 20),
  //             Row(
  //               mainAxisAlignment: MainAxisAlignment.spaceEvenly,
  //               children: [
  //                 _buildIconPreview(Icons.home, 'Home', theme),
  //                 _buildIconPreview(Icons.favorite, 'Favorite', theme),
  //                 _buildIconPreview(Icons.settings, 'Settings', theme),
  //               ],
  //             ),
  //           ],
  //         ),
  //       ),
  //     ],
  //   );
  // }

  // Widget _buildIconPreview(IconData icon, String label, ThemeData theme) {
  //   final bool isDarkMode = theme.brightness == Brightness.dark;
  //   final double backgroundOpacity = isDarkMode ? 0.2 : 0.1;

  //   return Column(
  //     children: [
  //       Container(
  //         padding: const EdgeInsets.all(12),
  //         decoration: BoxDecoration(
  //           color: theme.colorScheme.primary.withOpacity(backgroundOpacity),
  //           shape: BoxShape.circle,
  //           border: isDarkMode
  //               ? Border.all(
  //                   color: theme.colorScheme.primary.withOpacity(0.3), width: 1)
  //               : null,
  //         ),
  //         child: Icon(
  //           icon,
  //           color: theme.colorScheme.primary,
  //           size: 26,
  //         ),
  //       ),
  //       const SizedBox(height: 8),
  //       Text(
  //         label,
  //         style: TextStyle(
  //           fontSize: 13,
  //           fontWeight: FontWeight.w500,
  //           color: theme.textTheme.bodyMedium?.color,
  //         ),
  //       ),
  //     ],
  //   );
  // }
}
