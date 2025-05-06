import 'package:flutter/material.dart';

class AppTheme {
  // Light Theme
  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    fontFamily: 'CustomFont', // ✅ Apply your custom font globally
    primaryColor: Colors.green,
    primaryColorDark: Colors.green[800],
    primarySwatch: Colors.green,
    brightness: Brightness.light,
    scaffoldBackgroundColor: Colors.white,
    appBarTheme: const AppBarTheme(
      color: Colors.white,
      iconTheme: IconThemeData(color: Colors.black),
      titleTextStyle: TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.bold,
        color: Colors.black,
      ),
      elevation: 0,
      surfaceTintColor: Colors.transparent,
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
    colorScheme: ColorScheme.light(
      primary: Colors.green,
      secondary: Colors.greenAccent,
      surface: Colors.white,
      background: Colors.grey[50]!,
    ),
    extensions: <ThemeExtension<dynamic>>[
      ShimmerColors(
        baseColor: Colors.grey[200]!,
        highlightColor: Colors.grey[100]!,
      ),
    ],
    cardTheme: CardTheme(
      color: Colors.white,
      elevation: 2,
      margin: EdgeInsets.zero,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade300),
      ),
    ),
    dividerColor: Colors.grey[300],
    iconTheme: const IconThemeData(color: Colors.black54),
  );

  // Dark Theme
  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    fontFamily: 'CustomFont', // ✅ Apply your custom font globally
    primaryColor: Colors.green,
    primaryColorDark: Colors.green[800],
    primarySwatch: Colors.green,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: const Color(0xFF121212),
    appBarTheme: const AppBarTheme(
      color: Colors.black,
      iconTheme: IconThemeData(color: Colors.white),
      titleTextStyle: TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.bold,
        color: Colors.white,
      ),
      elevation: 0,
      surfaceTintColor: Colors.transparent,
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
      bodyLarge: TextStyle(fontSize: 14, color: Colors.white70),
      bodyMedium: TextStyle(fontSize: 12, color: Colors.white70),
    ),
    colorScheme: ColorScheme.dark(
      primary: Colors.green,
      secondary: Colors.greenAccent[400]!,
      surface: const Color(0xFF1E1E1E),
      background: const Color(0xFF121212),
    ),
    extensions: <ThemeExtension<dynamic>>[
      ShimmerColors(
        baseColor: Colors.grey,
        highlightColor: Colors.grey[500]!,
      ),
    ],
    cardTheme: CardTheme(
      color: const Color(0xFF1E1E1E),
      elevation: 2,
      margin: EdgeInsets.zero,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: Color(0x45000000)), // black27 equivalent
      ),
    ),
    dividerColor: const Color(0xFF303030),
    iconTheme: const IconThemeData(color: Colors.white70),
  );
}

// Custom shimmer colors extension
class ShimmerColors extends ThemeExtension<ShimmerColors> {
  final Color baseColor;
  final Color highlightColor;

  const ShimmerColors({
    required this.baseColor,
    required this.highlightColor,
  });

  @override
  ThemeExtension<ShimmerColors> copyWith({
    Color? baseColor,
    Color? highlightColor,
  }) {
    return ShimmerColors(
      baseColor: baseColor ?? this.baseColor,
      highlightColor: highlightColor ?? this.highlightColor,
    );
  }

  @override
  ThemeExtension<ShimmerColors> lerp(
      ThemeExtension<ShimmerColors>? other, double t) {
    if (other is! ShimmerColors) {
      return this;
    }
    return ShimmerColors(
      baseColor: Color.lerp(baseColor, other.baseColor, t)!,
      highlightColor: Color.lerp(highlightColor, other.highlightColor, t)!,
    );
  }
}
