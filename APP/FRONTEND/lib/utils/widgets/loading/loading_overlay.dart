import 'package:flutter/material.dart';
import 'package:ionhive/utils/widgets/loading/loading_indicator.dart';

class LoadingOverlay extends StatelessWidget {
  final bool isLoading;
  final Widget child;
  final Color? loadingColor;
  final double loadingSize;
  final double opacity;

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
    final bool currentlyLoading = isLoading;
    final theme = Theme.of(context);

// Set overlay color based on theme
    final overlayColor = theme.brightness == Brightness.dark
        ? Colors.black.withOpacity(0.7)
        : Colors.white.withOpacity(0.7);
    return Stack(
      children: [
        // The main content
        child,

        // The loading overlay - only show if loading
        if (currentlyLoading)
          Positioned.fill(
            child: Container(
              color: overlayColor,
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
