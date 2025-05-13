import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ionhive/utils/theme/themes.dart';

class ThemeController extends GetxController {
  // ignore: constant_identifier_names
  static const String THEME_MODE_KEY = 'theme_mode';
  // ignore: constant_identifier_names
  static const String PRIMARY_COLOR_KEY = 'primary_color';

  // Observable variables
  final Rx<ThemeMode> themeMode = ThemeMode.light.obs;
  final Rx<MaterialColor> primaryColor = Colors.green.obs;

  // Available theme colors
  final List<MaterialColor> availableColors = [
    Colors.green,
    Colors.blue,
    Colors.purple,
    Colors.orange,
    Colors.red,
    Colors.teal,
    Colors.indigo,
  ];

  @override
  void onInit() {
    super.onInit();
    loadThemePreferences();
  }

  // Load saved theme preferences
  Future<void> loadThemePreferences() async {
    final prefs = await SharedPreferences.getInstance();

    // Load primary color first so theme is updated before applying theme mode
    final savedColorValue = prefs.getInt(PRIMARY_COLOR_KEY);
    if (savedColorValue != null) {
      // Find the color in available colors or default to green
      final savedColor = availableColors.firstWhere(
        (color) => color.value == savedColorValue,
        orElse: () => Colors.green,
      );
      primaryColor.value = savedColor;

      // Update the app theme with the saved color
      updateAppTheme(savedColor);
    }

    // Load theme mode
    final savedThemeMode = prefs.getString(THEME_MODE_KEY);
    if (savedThemeMode != null) {
      switch (savedThemeMode) {
        case 'light':
          themeMode.value = ThemeMode.light;
          break;
        case 'dark':
          themeMode.value = ThemeMode.dark;
          break;
        default:
          themeMode.value = ThemeMode.system;
      }
    }

    // Apply the theme - properly refresh by setting theme data first
    Get.changeTheme(themeMode.value == ThemeMode.dark
        ? AppTheme.darkTheme
        : AppTheme.lightTheme);
    Get.changeThemeMode(themeMode.value);
  }

  // Change theme mode (light, dark, system)
  Future<void> changeThemeMode(ThemeMode mode) async {
    themeMode.value = mode;

    // Apply the theme - properly refresh by setting theme data first
    Get.changeTheme(
        mode == ThemeMode.dark ? AppTheme.darkTheme : AppTheme.lightTheme);
    Get.changeThemeMode(mode);

    final prefs = await SharedPreferences.getInstance();
    String modeString;

    switch (mode) {
      case ThemeMode.light:
        modeString = 'light';
        break;
      case ThemeMode.dark:
        modeString = 'dark';
        break;
      default:
        modeString = 'system';
    }

    await prefs.setString(THEME_MODE_KEY, modeString);
  }

  // Change primary color
  Future<void> changePrimaryColor(MaterialColor color) async {
    primaryColor.value = color;

    // Update the app theme with the new color
    updateAppTheme(color);

    // Apply the theme - properly refresh by setting theme data
    Get.changeTheme(themeMode.value == ThemeMode.dark
        ? AppTheme.darkTheme
        : AppTheme.lightTheme);
    Get.changeThemeMode(themeMode.value); // Also update the theme mode

    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(PRIMARY_COLOR_KEY, color.value);
  }

  // Update app theme with new primary color
  void updateAppTheme(MaterialColor color) {
    // Update light theme
    AppTheme.lightTheme = AppTheme.lightTheme.copyWith(
      primaryColor: color,
      primaryColorDark: color[800],
      colorScheme: ColorScheme.light(
        primary: color,
        secondary: color.shade200,
        surface: Colors.white,
        background: Colors.grey[50]!,
      ),
    );

    // Update dark theme
    AppTheme.darkTheme = AppTheme.darkTheme.copyWith(
      primaryColor: color,
      primaryColorDark: color[800],
      colorScheme: ColorScheme.dark(
        primary: color,
        secondary: color.shade200,
        surface: const Color(0xFF1E1E1E),
        background: const Color(0xFF121212),
      ),
    );
  }

  // Get current theme data
  ThemeData get currentThemeData {
    if (themeMode.value == ThemeMode.dark) {
      return AppTheme.darkTheme;
    } else if (themeMode.value == ThemeMode.light) {
      return AppTheme.lightTheme;
    } else {
      // For system mode, check the platform brightness
      final platformBrightness =
          WidgetsBinding.instance.platformDispatcher.platformBrightness;
      return platformBrightness == Brightness.dark
          ? AppTheme.darkTheme
          : AppTheme.lightTheme;
    }
  }
}
