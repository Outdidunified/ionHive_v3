import 'package:flutter/material.dart';

class AppTheme {
  // Light Theme
  static ThemeData lightTheme = ThemeData(
    primaryColor: Colors.green,
    primaryColorDark: Colors.green[800],
    primarySwatch: Colors.green,
    brightness: Brightness.light,
    scaffoldBackgroundColor: Colors.white, // Clean white background
    appBarTheme: AppBarTheme(
      color: Colors.green[700], // AppBar color
      iconTheme: const IconThemeData(color: Colors.white), // AppBar icon color
      titleTextStyle: const TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.bold,
        color: Colors.white,
      ),
    ),
    textTheme: const TextTheme(
      displayLarge: TextStyle(
          fontSize: 32, fontWeight: FontWeight.bold, color: Colors.black),
      displayMedium: TextStyle(
          fontSize: 28, fontWeight: FontWeight.bold, color: Colors.black),
      displaySmall: TextStyle(
          fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black),
      headlineMedium: TextStyle(
          fontSize: 20, fontWeight: FontWeight.bold, color: Colors.black),
      headlineSmall: TextStyle(fontSize: 18, color: Colors.black87),
      titleLarge: TextStyle(
          fontSize: 16, fontWeight: FontWeight.w500, color: Colors.black87),
      bodyLarge: TextStyle(fontSize: 14, color: Colors.black54),
      bodyMedium: TextStyle(fontSize: 12, color: Colors.black45),
    ),
    colorScheme: const ColorScheme.light(
      primary: Colors.green,
      onPrimary: Colors.white,
      secondary: Colors.greenAccent,
      onSecondary: Colors.black,
      surface: Colors.white,
      onSurface: Colors.black,
      error: Colors.red,
      onError: Colors.white,
    ),
    buttonTheme: ButtonThemeData(
      buttonColor: Colors.green[600],
      textTheme: ButtonTextTheme.primary,
    ),
    cardColor: Colors.grey[50],
    dividerColor: Colors.grey[300],
    iconTheme: const IconThemeData(
      color: Colors.black54,
    ),
  );

  // Dark Theme
  static ThemeData darkTheme = ThemeData(
    primaryColor: Colors.green,
    primaryColorDark: Colors.green[800],
    primarySwatch: Colors.green,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: const Color(0xFF121212), // Dark background
    appBarTheme: AppBarTheme(
      color: Colors.green[900], // AppBar color
      iconTheme: const IconThemeData(color: Colors.white),
      titleTextStyle: const TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.bold,
        color: Colors.white,
      ),
    ),
    textTheme: const TextTheme(
      displayLarge: TextStyle(
          fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white),
      displayMedium: TextStyle(
          fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white),
      displaySmall: TextStyle(
          fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
      headlineMedium: TextStyle(
          fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
      headlineSmall: TextStyle(fontSize: 18, color: Colors.white70),
      titleLarge: TextStyle(
          fontSize: 16, fontWeight: FontWeight.w500, color: Colors.white70),
      bodyLarge: TextStyle(fontSize: 14, color: Colors.white60),
      bodyMedium: TextStyle(fontSize: 12, color: Colors.white60),
    ),
    colorScheme: ColorScheme.dark(
      primary: Colors.green,
      onPrimary: Colors.black,
      secondary: Colors.greenAccent[400]!,
      onSecondary: Colors.white70,
      surface: const Color(0xFF1E1E1E),
      onSurface: Colors.white,
      error: Colors.red[400]!,
      onError: Colors.black,
    ),
    buttonTheme: ButtonThemeData(
      buttonColor: Colors.green[600],
      textTheme: ButtonTextTheme.primary,
    ),
    cardColor: const Color(0xFF1E1E1E),
    dividerColor: const Color(0xFF303030),
    iconTheme: const IconThemeData(
      color: Colors.white70,
    ),
  );
}
