import 'package:flutter/material.dart';
import 'package:ionhive/utils/responsive/responsive_utils.dart';

/// A responsive text widget that scales based on screen size
class ResponsiveText extends StatelessWidget {
  final String text;
  final TextStyle? style;
  final TextAlign? textAlign;
  final TextOverflow? overflow;
  final int? maxLines;
  final double? fontSize;
  final FontWeight? fontWeight;
  final Color? color;

  const ResponsiveText({
    super.key,
    required this.text,
    this.style,
    this.textAlign,
    this.overflow,
    this.maxLines,
    this.fontSize,
    this.fontWeight,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    TextStyle effectiveStyle = style ?? Theme.of(context).textTheme.bodyMedium!;

    if (fontSize != null) {
      effectiveStyle = effectiveStyle.copyWith(
        fontSize: ResponsiveUtils.getResponsiveFontSize(context, fontSize!),
      );
    }

    if (fontWeight != null) {
      effectiveStyle = effectiveStyle.copyWith(fontWeight: fontWeight);
    }

    if (color != null) {
      effectiveStyle = effectiveStyle.copyWith(color: color);
    }

    return Text(
      text,
      style: effectiveStyle,
      textAlign: textAlign,
      overflow: overflow,
      maxLines: maxLines,
    );
  }
}

/// A responsive container that scales based on screen size
class ResponsiveContainer extends StatelessWidget {
  final Widget child;
  final double? width;
  final double? height;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final Decoration? decoration;
  final Color? color;
  final Alignment? alignment;

  const ResponsiveContainer({
    super.key,
    required this.child,
    this.width,
    this.height,
    this.padding,
    this.margin,
    this.decoration,
    this.color,
    this.alignment,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width != null
          ? ResponsiveUtils.getResponsiveWidth(context, width!)
          : null,
      height: height != null
          ? ResponsiveUtils.getResponsiveHeight(context, height!)
          : null,
      padding: padding,
      margin: margin,
      decoration: decoration,
      color: color,
      alignment: alignment,
      child: child,
    );
  }
}

/// A responsive sized box that scales based on screen size
class ResponsiveSizedBox extends StatelessWidget {
  final double? width;
  final double? height;
  final Widget? child;

  const ResponsiveSizedBox({
    super.key,
    this.width,
    this.height,
    this.child,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width != null
          ? ResponsiveUtils.getResponsiveWidth(context, width!)
          : null,
      height: height != null
          ? ResponsiveUtils.getResponsiveHeight(context, height!)
          : null,
      child: child,
    );
  }
}

/// A responsive padding widget that scales based on screen size
class ResponsivePadding extends StatelessWidget {
  final Widget child;
  final double? horizontal;
  final double? vertical;
  final double? left;
  final double? top;
  final double? right;
  final double? bottom;

  const ResponsivePadding({
    super.key,
    required this.child,
    this.horizontal,
    this.vertical,
    this.left,
    this.top,
    this.right,
    this.bottom,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: ResponsiveUtils.getResponsivePadding(
        context,
        horizontal: horizontal ?? 0,
        vertical: vertical ?? 0,
        left: left ?? 0,
        top: top ?? 0,
        right: right ?? 0,
        bottom: bottom ?? 0,
      ),
      child: child,
    );
  }
}

/// A responsive button that scales based on screen size
class ResponsiveButton extends StatelessWidget {
  final VoidCallback onPressed;
  final Widget child;
  final double? width;
  final double? height;
  final EdgeInsetsGeometry? padding;
  final Color? backgroundColor;
  final BorderRadius? borderRadius;

  const ResponsiveButton({
    super.key,
    required this.onPressed,
    required this.child,
    this.width,
    this.height,
    this.padding,
    this.backgroundColor,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return SizedBox(
      width: width != null
          ? ResponsiveUtils.getResponsiveWidth(context, width!)
          : null,
      height: height != null
          ? ResponsiveUtils.getResponsiveHeight(context, height!)
          : null,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: backgroundColor ?? theme.primaryColor,
          padding: padding,
          shape: RoundedRectangleBorder(
            borderRadius: borderRadius ??
                BorderRadius.circular(
                  ResponsiveUtils.getResponsiveRadius(context, 8),
                ),
          ),
        ),
        child: child,
      ),
    );
  }
}

/// A responsive icon that scales based on screen size
class ResponsiveIcon extends StatelessWidget {
  final IconData icon;
  final double size;
  final Color? color;

  const ResponsiveIcon({
    super.key,
    required this.icon,
    required this.size,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Icon(
      icon,
      size: ResponsiveUtils.getResponsiveIconSize(context, size),
      color: color,
    );
  }
}

/// A responsive card that scales based on screen size
class ResponsiveCard extends StatelessWidget {
  final Widget child;
  final double? width;
  final double? height;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final Color? color;
  final double? elevation;
  final double? borderRadius;

  const ResponsiveCard({
    super.key,
    required this.child,
    this.width,
    this.height,
    this.padding,
    this.margin,
    this.color,
    this.elevation,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      elevation: elevation ?? 1.0,
      margin: margin,
      color: color ?? theme.cardColor,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(
          borderRadius != null
              ? ResponsiveUtils.getResponsiveRadius(context, borderRadius!)
              : ResponsiveUtils.getResponsiveRadius(context, 8),
        ),
      ),
      child: Container(
        width: width != null
            ? ResponsiveUtils.getResponsiveWidth(context, width!)
            : null,
        height: height != null
            ? ResponsiveUtils.getResponsiveHeight(context, height!)
            : null,
        padding: padding,
        child: child,
      ),
    );
  }
}

/// A responsive image that scales based on screen size
class ResponsiveImage extends StatelessWidget {
  final String imagePath;
  final double width;
  final double height;
  final BoxFit? fit;
  final Color? color;

  const ResponsiveImage({
    super.key,
    required this.imagePath,
    required this.width,
    required this.height,
    this.fit,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      imagePath,
      width: ResponsiveUtils.getResponsiveWidth(context, width),
      height: ResponsiveUtils.getResponsiveHeight(context, height),
      fit: fit ?? BoxFit.contain,
      color: color,
    );
  }
}

/// A responsive grid view that scales based on screen size
class ResponsiveGridView extends StatelessWidget {
  final List<Widget> children;
  final int crossAxisCount;
  final double crossAxisSpacing;
  final double mainAxisSpacing;
  final double childAspectRatio;
  final EdgeInsetsGeometry? padding;
  final bool shrinkWrap;
  final ScrollPhysics? physics;

  const ResponsiveGridView({
    super.key,
    required this.children,
    required this.crossAxisCount,
    this.crossAxisSpacing = 10,
    this.mainAxisSpacing = 10,
    this.childAspectRatio = 1.0,
    this.padding,
    this.shrinkWrap = false,
    this.physics,
  });

  @override
  Widget build(BuildContext context) {
    // Adjust crossAxisCount based on screen width
    int effectiveCrossAxisCount = crossAxisCount;
    double width = MediaQuery.of(context).size.width;

    if (width < 600) {
      // Phone
      effectiveCrossAxisCount = crossAxisCount;
    } else if (width < 900) {
      // Tablet
      effectiveCrossAxisCount = crossAxisCount + 1;
    } else {
      // Desktop
      effectiveCrossAxisCount = crossAxisCount + 2;
    }

    return GridView.builder(
      padding: padding,
      shrinkWrap: shrinkWrap,
      physics: physics,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: effectiveCrossAxisCount,
        crossAxisSpacing:
            ResponsiveUtils.getResponsiveSpacing(context, crossAxisSpacing),
        mainAxisSpacing:
            ResponsiveUtils.getResponsiveSpacing(context, mainAxisSpacing),
        childAspectRatio: childAspectRatio,
      ),
      itemCount: children.length,
      itemBuilder: (context, index) => children[index],
    );
  }
}

/// A responsive list view that scales based on screen size
class ResponsiveListView extends StatelessWidget {
  final List<Widget> children;
  final EdgeInsetsGeometry? padding;
  final bool shrinkWrap;
  final ScrollPhysics? physics;
  final Axis scrollDirection;
  final double? itemSpacing;

  const ResponsiveListView({
    super.key,
    required this.children,
    this.padding,
    this.shrinkWrap = false,
    this.physics,
    this.scrollDirection = Axis.vertical,
    this.itemSpacing,
  });

  @override
  Widget build(BuildContext context) {
    if (itemSpacing == null) {
      return ListView(
        padding: padding,
        shrinkWrap: shrinkWrap,
        physics: physics,
        scrollDirection: scrollDirection,
        children: children,
      );
    }

    // Add spacing between items
    List<Widget> spacedChildren = [];
    for (int i = 0; i < children.length; i++) {
      spacedChildren.add(children[i]);

      if (i < children.length - 1) {
        if (scrollDirection == Axis.vertical) {
          spacedChildren.add(SizedBox(
            height: ResponsiveUtils.getResponsiveSpacing(context, itemSpacing!),
          ));
        } else {
          spacedChildren.add(SizedBox(
            width: ResponsiveUtils.getResponsiveSpacing(context, itemSpacing!),
          ));
        }
      }
    }

    return ListView(
      padding: padding,
      shrinkWrap: shrinkWrap,
      physics: physics,
      scrollDirection: scrollDirection,
      children: spacedChildren,
    );
  }
}
