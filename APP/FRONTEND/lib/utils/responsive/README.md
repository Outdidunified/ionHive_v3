# Responsive Design Utilities for ionHive

This package provides a set of utilities and widgets to make your ionHive app responsive across different screen sizes, starting from 4.7 inches (iPhone 8) and larger.

## Getting Started

To use these responsive utilities in your app, simply import the responsive package:

```dart
import 'package:ionhive/utils/responsive/responsive.dart';
```

## Key Components

### ResponsiveUtils

A utility class that provides methods to calculate sizes based on screen dimensions:

- `screenWidth(context)`: Get the screen width
- `screenHeight(context)`: Get the screen height
- `getResponsiveWidth(context, designWidth)`: Calculate responsive width
- `getResponsiveHeight(context, designHeight)`: Calculate responsive height
- `getResponsiveFontSize(context, fontSize)`: Calculate responsive font size
- `getResponsivePadding(context, ...)`: Calculate responsive padding
- `getResponsiveMargin(context, ...)`: Calculate responsive margin
- `getResponsiveRadius(context, radius)`: Get responsive radius
- `getResponsiveIconSize(context, size)`: Get responsive icon size
- `getResponsiveSpacing(context, spacing)`: Get responsive spacing
- `getDeviceType(context)`: Get device type (phone, tablet, desktop)

### Responsive Widgets

A set of widgets that automatically adapt to different screen sizes:

- `ResponsiveText`: A text widget that scales based on screen size
- `ResponsiveContainer`: A container that scales based on screen size
- `ResponsiveSizedBox`: A sized box that scales based on screen size
- `ResponsivePadding`: A padding widget that scales based on screen size
- `ResponsiveButton`: A button that scales based on screen size
- `ResponsiveIcon`: An icon that scales based on screen size
- `ResponsiveCard`: A card that scales based on screen size
- `ResponsiveImage`: An image that scales based on screen size
- `ResponsiveGridView`: A grid view that adapts to different screen sizes
- `ResponsiveListView`: A list view that adapts to different screen sizes

### Responsive Screen

A wrapper widget that provides responsive sizing for any screen:

- `ResponsiveScreen`: A scaffold wrapper that provides responsive sizing
- `ResponsiveLayoutBuilder`: A builder that provides different layouts for different device types

### Extension Methods

Extension methods for BuildContext to easily access responsive utilities:

- `context.screenWidth`: Get screen width
- `context.screenHeight`: Get screen height
- `context.rWidth(width)`: Get responsive width
- `context.rHeight(height)`: Get responsive height
- `context.rFontSize(fontSize)`: Get responsive font size
- `context.rSpacing(spacing)`: Get responsive spacing
- `context.rRadius(radius)`: Get responsive radius
- `context.rIconSize(size)`: Get responsive icon size
- `context.deviceType`: Get device type
- `context.isPhone`: Check if device is phone
- `context.isTablet`: Check if device is tablet
- `context.isDesktop`: Check if device is desktop

## Usage Examples

### Using Responsive Widgets

```dart
// Instead of:
Text(
  "Hello World",
  style: TextStyle(fontSize: 16),
)

// Use:
ResponsiveText(
  text: "Hello World",
  fontSize: 16,
)

// Instead of:
SizedBox(
  width: 100,
  height: 50,
  child: myWidget,
)

// Use:
ResponsiveSizedBox(
  width: 100,
  height: 50,
  child: myWidget,
)

// Instead of:
Padding(
  padding: EdgeInsets.all(16),
  child: myWidget,
)

// Use:
ResponsivePadding(
  horizontal: 16,
  vertical: 16,
  child: myWidget,
)
```

### Using Extension Methods

```dart
// Instead of:
Container(
  width: MediaQuery.of(context).size.width * 0.8,
  height: 50,
  child: myWidget,
)

// Use:
Container(
  width: context.rWidth(300), // 300 is the design width
  height: context.rHeight(50), // 50 is the design height
  child: myWidget,
)

// For font sizes:
Text(
  "Hello World",
  style: TextStyle(fontSize: context.rFontSize(16)),
)

// For spacing:
SizedBox(height: context.rSpacing(20))

// For checking device type:
if (context.isPhone) {
  // Phone-specific layout
} else if (context.isTablet) {
  // Tablet-specific layout
}
```

### Using ResponsiveScreen

```dart
ResponsiveScreen(
  builder: (context, size, deviceType) {
    return Column(
      children: [
        // Your responsive UI here
      ],
    );
  },
)
```

### Using ResponsiveLayoutBuilder

```dart
ResponsiveLayoutBuilder(
  mobileBuilder: (context, size) {
    return MobileLayout();
  },
  tabletBuilder: (context, size) {
    return TabletLayout();
  },
  desktopBuilder: (context, size) {
    return DesktopLayout();
  },
)
```

## Best Practices

1. **Use the responsive utilities for all UI elements** that need to adapt to different screen sizes.
2. **Start with the smallest screen size (4.7 inches)** and make sure your UI looks good there first.
3. **Test your UI on different screen sizes** to ensure it adapts correctly.
4. **Use the extension methods** for cleaner code.
5. **Consider using ResponsiveLayoutBuilder** for completely different layouts on different device types.
6. **Avoid hard-coded sizes** whenever possible.
7. **Use responsive font sizes** to ensure text is readable on all screen sizes.
8. **Use responsive spacing** to ensure proper spacing between elements on all screen sizes.
9. **Use responsive padding and margin** to ensure proper layout on all screen sizes.
10. **Use responsive radius** for consistent rounded corners on all screen sizes.

## Reference Devices

The responsive utilities are designed to work well on the following reference devices:

- **Phone (Small)**: iPhone SE (4.7 inches)
- **Phone (Medium)**: iPhone 12/13 (6.1 inches)
- **Phone (Large)**: iPhone 12/13 Pro Max (6.7 inches)
- **Tablet (Small)**: iPad Mini (8.3 inches)
- **Tablet (Medium)**: iPad (10.2 inches)
- **Tablet (Large)**: iPad Pro (12.9 inches)

The base reference device is the iPhone 8 (4.7 inches) with dimensions of 375x667 points.