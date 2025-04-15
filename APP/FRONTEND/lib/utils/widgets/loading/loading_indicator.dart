import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:ionhive/utils/debug/build_guard.dart';

/// A reusable loading indicator widget that shows a fading circle animation.
///
/// This widget provides a consistent loading experience throughout the app.
/// The color and size can be customized, with defaults that match the app's theme.
class LoadingIndicator extends StatelessWidget {
  /// The color of the loading indicator. If null, uses the primary color from the theme.
  final Color? color;

  /// The size of the loading indicator. Default is 50.0.
  final double size;

  /// Creates a loading indicator with optional custom color and size.
  const LoadingIndicator({
    super.key,
    this.color,
    this.size = 50.0,
  });

  @override
  Widget build(BuildContext context) {
    // Cache the theme color to avoid multiple Theme.of() calls which could trigger rebuilds
    final themeColor = color ?? Theme.of(context).colorScheme.primary;
    final currentSize = size;

    return Center(
      child: SpinKitFadingCircle(
        color: themeColor,
        size: currentSize,
        // Use a key to help Flutter identify this widget uniquely
        key: ValueKey('loading_indicator_${currentSize}_${themeColor.value}'),
      ),
    );
  }
}
