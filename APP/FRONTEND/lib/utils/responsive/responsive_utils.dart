import 'package:flutter/material.dart';

/// A utility class for responsive design in the ionHive app
/// Provides methods to calculate sizes based on screen dimensions
class ResponsiveUtils {
  /// Base dimensions for reference device (iPhone 8 - 4.7 inch)
  static const double baseWidth = 375.0;
  static const double baseHeight = 667.0;

  /// Get the screen width
  static double screenWidth(BuildContext context) {
    return MediaQuery.of(context).size.width;
  }

  /// Get the screen height
  static double screenHeight(BuildContext context) {
    return MediaQuery.of(context).size.height;
  }

  /// Calculate responsive width based on design width
  static double getResponsiveWidth(BuildContext context, double designWidth) {
    double screenWidth = MediaQuery.of(context).size.width;
    return (designWidth / baseWidth) * screenWidth;
  }

  /// Calculate responsive height based on design height
  static double getResponsiveHeight(BuildContext context, double designHeight) {
    double screenHeight = MediaQuery.of(context).size.height;
    return (designHeight / baseHeight) * screenHeight;
  }

  /// Calculate responsive font size
  static double getResponsiveFontSize(BuildContext context, double fontSize) {
    double screenWidth = MediaQuery.of(context).size.width;
    double scaleFactor = screenWidth / baseWidth;
    double responsiveFontSize = fontSize * scaleFactor;

    // Limit the font size to prevent it from becoming too large on tablets
    if (screenWidth > 600) {
      return responsiveFontSize * 0.8;
    }

    return responsiveFontSize;
  }

  /// Calculate responsive padding
  static EdgeInsets getResponsivePadding(
    BuildContext context, {
    double horizontal = 0.0,
    double vertical = 0.0,
    double left = 0.0,
    double top = 0.0,
    double right = 0.0,
    double bottom = 0.0,
  }) {
    double screenWidth = MediaQuery.of(context).size.width;
    double scaleFactor = screenWidth / baseWidth;

    return EdgeInsets.fromLTRB(
      left > 0 ? left * scaleFactor : horizontal * scaleFactor,
      top > 0 ? top * scaleFactor : vertical * scaleFactor,
      right > 0 ? right * scaleFactor : horizontal * scaleFactor,
      bottom > 0 ? bottom * scaleFactor : vertical * scaleFactor,
    );
  }

  /// Calculate responsive margin
  static EdgeInsets getResponsiveMargin(
    BuildContext context, {
    double horizontal = 0.0,
    double vertical = 0.0,
    double left = 0.0,
    double top = 0.0,
    double right = 0.0,
    double bottom = 0.0,
  }) {
    return getResponsivePadding(
      context,
      horizontal: horizontal,
      vertical: vertical,
      left: left,
      top: top,
      right: right,
      bottom: bottom,
    );
  }

  /// Get responsive radius
  static double getResponsiveRadius(BuildContext context, double radius) {
    double screenWidth = MediaQuery.of(context).size.width;
    double scaleFactor = screenWidth / baseWidth;
    return radius * scaleFactor;
  }

  /// Get responsive icon size
  static double getResponsiveIconSize(BuildContext context, double size) {
    double screenWidth = MediaQuery.of(context).size.width;
    double scaleFactor = screenWidth / baseWidth;
    return size * scaleFactor;
  }

  /// Get responsive spacing (for SizedBox, etc.)
  static double getResponsiveSpacing(BuildContext context, double spacing) {
    double screenWidth = MediaQuery.of(context).size.width;
    double scaleFactor = screenWidth / baseWidth;
    return spacing * scaleFactor;
  }

  /// Get device type based on screen width
  static DeviceType getDeviceType(BuildContext context) {
    double width = MediaQuery.of(context).size.width;
    if (width < 600) {
      return DeviceType.phone;
    } else if (width < 900) {
      return DeviceType.tablet;
    } else {
      return DeviceType.desktop;
    }
  }
}

/// Enum representing different device types
enum DeviceType {
  phone,
  tablet,
  desktop,
}
