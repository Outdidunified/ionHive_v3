import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';

class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final double borderRadius;
  final EdgeInsetsGeometry padding;
  final LinearGradient? gradient;
  final TextStyle textStyle;
  final BoxShadow? boxShadow;
  final bool isLoading;

  const CustomButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.borderRadius = 12.0,
    this.padding = const EdgeInsets.symmetric(vertical: 14),
    this.gradient,
    this.textStyle = const TextStyle(
      fontSize: 16,
      fontWeight: FontWeight.bold,
      color: Colors.white,
    ),
    this.boxShadow,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: isLoading ? null : onPressed,
      child: LayoutBuilder(
        builder: (context, constraints) {
          double fullWidth = constraints.maxWidth;

          return AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeInOut,
            width: fullWidth, // Shrink to 50 when loading
            height: 50, // Fixed height for consistent animation
            decoration: BoxDecoration(
              gradient: gradient ??
                  LinearGradient(
                    colors: [
                      Theme.of(context).primaryColor,
                      Theme.of(context).primaryColorDark,
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
              borderRadius: BorderRadius.circular(borderRadius),
              boxShadow: boxShadow != null && !isLoading ? [boxShadow!] : [],
            ),
            child: Center(
              child: isLoading
                  ? SpinKitThreeBounce(
                      color: Theme.of(context).colorScheme.onPrimary,
                      size: 20.0, // You can adjust the size
                    )
                  : Text(
                      text,
                      style: textStyle.copyWith(
                        color: Theme.of(context).colorScheme.onPrimary,
                        fontWeight: FontWeight.bold, // Make the text bold
                      ),
                    ),
            ),
          );
        },
      ),
    );
  }
}
