import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';

class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed; // Nullable to support disabled state
  final double borderRadius;
  final EdgeInsetsGeometry padding;
  final LinearGradient? gradient;
  final TextStyle textStyle;
  final BoxShadow? boxShadow;
  final bool isLoading;

  const CustomButton({
    super.key,
    required this.text,
    this.onPressed, // Optional now
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
    final bool isDisabled = onPressed == null;
    final bool isButtonDisabled = isLoading || isDisabled;

    return GestureDetector(
      onTap: isButtonDisabled ? null : () => onPressed?.call(),
      child: LayoutBuilder(
        builder: (context, constraints) {
          double fullWidth = constraints.maxWidth;

          return AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeInOut,
            width: fullWidth,
            height: 50, // Fixed height for consistent animation
            decoration: BoxDecoration(
              gradient: isDisabled
                  ? LinearGradient(
                      colors: [
                        Colors.grey.shade300,
                        Colors.grey.shade400,
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    )
                  : gradient ??
                      LinearGradient(
                        colors: [
                          Theme.of(context).primaryColor,
                          Theme.of(context).primaryColorDark,
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
              borderRadius: BorderRadius.circular(borderRadius),
              boxShadow:
                  boxShadow != null && !isButtonDisabled ? [boxShadow!] : [],
            ),
            child: Center(
              child: isLoading
                  ? SpinKitThreeBounce(
                      color: isDisabled
                          ? Colors.grey.shade600
                          : Theme.of(context).colorScheme.onPrimary,
                      size: 20.0,
                    )
                  : Text(
                      text,
                      style: textStyle.copyWith(
                        color: isDisabled
                            ? Colors.grey.shade600
                            : Theme.of(context).colorScheme.onPrimary,
                        fontSize:
                            Theme.of(context).textTheme.titleLarge?.fontSize ??
                                16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
            ),
          );
        },
      ),
    );
  }
}
