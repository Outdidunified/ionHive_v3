import 'package:flutter/material.dart';
import 'package:ionhive/utils/widgets/loading/loading_indicator.dart';
import 'package:ionhive/utils/debug/build_guard.dart';

/// A transparent overlay that displays a loading indicator on top of the current page.
///
/// This widget creates a semi-transparent background that covers the entire screen
/// and displays a loading indicator in the center, allowing the user to see the
/// content behind the loading indicator.
class LoadingOverlay extends StatelessWidget {
  /// Whether the loading overlay is visible.
  final bool isLoading;

  /// The child widget to display behind the loading overlay.
  final Widget child;

  /// The color of the loading indicator. If null, uses the primary color from the theme.
  final Color? loadingColor;

  /// The size of the loading indicator. Default is 50.0.
  final double loadingSize;

  /// The opacity of the background overlay. Default is 0.5.
  final double opacity;

  /// Creates a loading overlay with a semi-transparent background.
  const LoadingOverlay({
    super.key,
    required this.isLoading,
    required this.child,
    this.loadingColor,
    this.loadingSize = 50.0,
    this.opacity = 0.5,
  });

  @override
  Widget build(BuildContext context) {
    // Store the loading state locally to avoid accessing it multiple times
    // which could potentially change during build
    final bool currentlyLoading = isLoading;

    return Stack(
      children: [
        // The main content
        child,

        // The loading overlay - only show if loading
        if (currentlyLoading)
          Positioned.fill(
            child: Container(
              color: Colors.black.withOpacity(opacity),
              child: Center(
                child: LoadingIndicator(
                  color: loadingColor,
                  size: loadingSize,
                ),
              ),
            ),
          ),
      ],
    );
  }
}

/// Extension method to easily show a loading overlay on any widget.
extension LoadingOverlayExtension on Widget {
  /// Wraps the widget with a loading overlay.
  Widget withLoadingOverlay({
    required bool isLoading,
    Color? loadingColor,
    double loadingSize = 50.0,
    double opacity = 0.5,
  }) {
    return LoadingOverlay(
      isLoading: isLoading,
      loadingColor: loadingColor,
      loadingSize: loadingSize,
      opacity: opacity,
      child: this,
    );
  }
}
