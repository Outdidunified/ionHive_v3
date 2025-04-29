import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';

class LoadingIndicator extends StatelessWidget {
  final Color? color;
  final double size;

  const LoadingIndicator({
    super.key,
    this.color,
    this.size = 50.0,
  });

  @override
  Widget build(BuildContext context) {
    final themeColor = color ?? Theme.of(context).colorScheme.primary;
    final currentSize = size;

    return Center(
      child: SpinKitFadingCircle(
        color: themeColor,
        size: currentSize,
        key: ValueKey('loading_indicator_${currentSize}_${themeColor.value}'),
      ),
    );
  }
}
