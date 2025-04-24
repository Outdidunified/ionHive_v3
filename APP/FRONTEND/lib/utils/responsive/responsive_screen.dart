import 'package:flutter/material.dart';
import 'package:ionhive/utils/responsive/responsive_utils.dart';

/// A responsive screen wrapper that provides responsive sizing for any screen
class ResponsiveScreen extends StatelessWidget {
  final Widget Function(BuildContext context, Size size, DeviceType deviceType)
      builder;
  final bool safeArea;
  final Color? backgroundColor;

  const ResponsiveScreen({
    Key? key,
    required this.builder,
    this.safeArea = true,
    this.backgroundColor,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final size = mediaQuery.size;
    final deviceType = ResponsiveUtils.getDeviceType(context);

    Widget content = builder(context, size, deviceType);

    if (safeArea) {
      content = SafeArea(child: content);
    }

    return Scaffold(
      backgroundColor: backgroundColor,
      body: content,
    );
  }
}

/// A responsive layout builder that provides different layouts for different device types
class ResponsiveLayoutBuilder extends StatelessWidget {
  final Widget Function(BuildContext context, Size size)? mobileBuilder;
  final Widget Function(BuildContext context, Size size)? tabletBuilder;
  final Widget Function(BuildContext context, Size size)? desktopBuilder;

  const ResponsiveLayoutBuilder({
    Key? key,
    this.mobileBuilder,
    this.tabletBuilder,
    this.desktopBuilder,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final size = mediaQuery.size;
    final deviceType = ResponsiveUtils.getDeviceType(context);

    switch (deviceType) {
      case DeviceType.phone:
        return mobileBuilder?.call(context, size) ?? const SizedBox.shrink();
      case DeviceType.tablet:
        return tabletBuilder?.call(context, size) ??
            mobileBuilder?.call(context, size) ??
            const SizedBox.shrink();
      case DeviceType.desktop:
        return desktopBuilder?.call(context, size) ??
            tabletBuilder?.call(context, size) ??
            mobileBuilder?.call(context, size) ??
            const SizedBox.shrink();
    }
  }
}

/// Extension methods for BuildContext to easily access responsive utilities
extension ResponsiveContext on BuildContext {
  /// Get screen width
  double get screenWidth => ResponsiveUtils.screenWidth(this);

  /// Get screen height
  double get screenHeight => ResponsiveUtils.screenHeight(this);

  /// Get responsive width
  double rWidth(double width) =>
      ResponsiveUtils.getResponsiveWidth(this, width);

  /// Get responsive height
  double rHeight(double height) =>
      ResponsiveUtils.getResponsiveHeight(this, height);

  /// Get responsive font size
  double rFontSize(double fontSize) =>
      ResponsiveUtils.getResponsiveFontSize(this, fontSize);

  /// Get responsive spacing
  double rSpacing(double spacing) =>
      ResponsiveUtils.getResponsiveSpacing(this, spacing);

  /// Get responsive radius
  double rRadius(double radius) =>
      ResponsiveUtils.getResponsiveRadius(this, radius);

  /// Get responsive icon size
  double rIconSize(double size) =>
      ResponsiveUtils.getResponsiveIconSize(this, size);

  /// Get device type
  DeviceType get deviceType => ResponsiveUtils.getDeviceType(this);

  /// Check if device is phone
  bool get isPhone => deviceType == DeviceType.phone;

  /// Check if device is tablet
  bool get isTablet => deviceType == DeviceType.tablet;

  /// Check if device is desktop
  bool get isDesktop => deviceType == DeviceType.desktop;
}
