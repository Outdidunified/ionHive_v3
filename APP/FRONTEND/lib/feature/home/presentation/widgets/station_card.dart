import 'package:flutter/material.dart';

class StationCard extends StatelessWidget {
  final Map<String, dynamic> station;
  final bool isDarkTheme;
  final VoidCallback? onTap;

  const StationCard({
    super.key,
    required this.station,
    required this.isDarkTheme,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;
    final isSmallScreen = screenWidth < 360 || screenHeight < 600;

    // Adjust font sizes for smaller screens
    final titleFontSize =
        isSmallScreen ? screenWidth * 0.032 : screenWidth * 0.036;
    final subtitleFontSize =
        isSmallScreen ? screenWidth * 0.028 : screenWidth * 0.031;
    final smallFontSize =
        isSmallScreen ? screenWidth * 0.026 : screenWidth * 0.03;
    final iconSize = isSmallScreen ? screenWidth * 0.035 : screenWidth * 0.04;

    // Adjust padding and spacing for smaller screens
    final cardPadding = isSmallScreen ? 10.0 : 16.0;
    // Reduce top padding to account for the tag
    final cardPaddingEdgeInsets = EdgeInsets.fromLTRB(
        cardPadding, cardPadding - 2, cardPadding, cardPadding);
    final verticalSpacing = isSmallScreen ? 1.0 : 4.0;
    final verySmallScreen = screenWidth < 320 || screenHeight < 500;

    final title = '${station['location_id']} | ${station['station_address']}';

    // Get availability status
    final String availabilityStatus =
        station['availability']?.toString().toLowerCase() ?? 'unknown';

    // Determine status for UI display based on the actual API response values
    final bool isOpen = availabilityStatus.contains('open');
    final bool isClosed = availabilityStatus.contains('closed');
    final bool isUnderMaintenance = availabilityStatus.contains('maintenance');

    final isCaptive =
        station['accessibility']?.toString().toLowerCase() == 'captive';

    return Stack(
      clipBehavior: Clip.none,
      children: [
        // Main card container
        Container(
          width: screenWidth * 0.8,
          // Add top margin to make room for the tag that's positioned half outside
          margin: const EdgeInsets.only(top: 10, right: 12),
          child: GestureDetector(
            onTap: onTap,
            child: Container(
              padding: cardPaddingEdgeInsets,
              decoration: BoxDecoration(
                color: isDarkTheme ? const Color(0xFF1E1E1E) : Colors.white,
                borderRadius: const BorderRadius.all(Radius.circular(11)),
                boxShadow: [
                  BoxShadow(
                    color: isDarkTheme
                        ? Colors.black26.withOpacity(0.1)
                        : Colors.black12.withOpacity(0.1),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight: 0,
                  maxHeight: verySmallScreen ? 90 : (isSmallScreen ? 100 : 150),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.location_on),
                        SizedBox(width: 8),
                        Expanded( // 👈 This makes the Text take only the available space
                          child: Text(
                            title,
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                              fontSize: titleFontSize,
                              color: isDarkTheme ? Colors.white70 : null,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),

                    SizedBox(height: verticalSpacing),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          station['network'] ?? '',
                          style:
                              Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    fontSize: subtitleFontSize,
                                    color: isDarkTheme
                                        ? Colors.white60
                                        : Colors.grey[600],
                                  ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Row(
                          children: [
                            Icon(
                              Icons.location_on,
                              size: iconSize,
                              color: isDarkTheme
                                  ? Colors.white60
                                  : Colors.grey[600],
                            ),
                            const SizedBox(width: 2),
                            Text(
                              "${(station['distance'] as int) ~/ 1000} km away",
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(
                                    fontSize: smallFontSize,
                                    color: isDarkTheme
                                        ? Colors.white60
                                        : Colors.grey[600],
                                  ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    SizedBox(height: verticalSpacing * 2),
                    // First row with availability and charger type
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Availability tag
                        Flexible(
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: isDarkTheme
                                  ? _getAvailabilityColor(
                                          isOpen, isClosed, isUnderMaintenance)
                                      .withOpacity(0.1)
                                  : _getAvailabilityColor(
                                          isOpen, isClosed, isUnderMaintenance)
                                      .withOpacity(0.1),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: _getAvailabilityColor(
                                        isOpen, isClosed, isUnderMaintenance)
                                    .withOpacity(isDarkTheme ? 0.3 : 0.3),
                                width: 1,
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  _getAvailabilityIcon(
                                      isOpen, isClosed, isUnderMaintenance),
                                  color: _getAvailabilityColor(
                                      isOpen, isClosed, isUnderMaintenance),
                                  size: iconSize,
                                ),
                                const SizedBox(width: 2),
                                Flexible(
                                  child: Text(
                                    isOpen
                                        ? _capitalizeFirstLetter(
                                            station['availability'] ?? 'Open')
                                        : isClosed
                                            ? "Closed"
                                            : isUnderMaintenance
                                                ? "Maintenance"
                                                : "Unknown",
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodySmall
                                        ?.copyWith(
                                          fontSize: smallFontSize,
                                          fontWeight: FontWeight.w500,
                                          color: _getAvailabilityColor(isOpen,
                                              isClosed, isUnderMaintenance),
                                        ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const Spacer(),
                        // Charger type tag
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: isDarkTheme
                                ? Colors.grey[800]
                                : Colors.grey[200],
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            station['charger_type'] ?? '',
                            style:
                                Theme.of(context).textTheme.bodySmall?.copyWith(
                                      fontSize: smallFontSize,
                                      fontWeight: FontWeight.w500,
                                      color: isDarkTheme
                                          ? Colors.white70
                                          : Colors.black87,
                                    ),
                          ),
                        )
                      ],
                    ),
                    // SizedBox(height: verticalSpacing * 2),
                    // // Distance row
                  ],
                ),
              ),
            ),
          ),
        ),
        // Corner tag positioned half outside the card
        Positioned(
          top:
              1, // Position at the top of the stack (which is now offset by the container's top margin)
          right: 10, // Adjust right position to account for the card margin
          child: CornerTag(
            label: isCaptive ? 'Captive' : 'Public',
            isCapitative: isCaptive,
            isDarkTheme: isDarkTheme,
          ),
        ),
      ],
    );
  }
}

Color _getAvailabilityColor(
    bool isOpen, bool isClosed, bool isUnderMaintenance) {
  if (isOpen) {
    return Colors.green;
  } else if (isClosed) {
    return Colors.red;
  } else if (isUnderMaintenance) {
    return Colors.orange;
  } else {
    return Colors.grey;
  }
}

IconData _getAvailabilityIcon(
    bool isOpen, bool isClosed, bool isUnderMaintenance) {
  if (isOpen) {
    return Icons.check_circle;
  } else if (isClosed) {
    return Icons.cancel;
  } else if (isUnderMaintenance) {
    return Icons.build;
  } else {
    return Icons.help_outline;
  }
}

String _capitalizeFirstLetter(String text) {
  if (text.isEmpty) return text;
  return text
      .split(' ')
      .map((word) =>
          word.isNotEmpty ? '${word[0].toUpperCase()}${word.substring(1)}' : '')
      .join(' ');
}

class CornerTag extends StatelessWidget {
  final String label;
  final bool isCapitative;
  final bool isDarkTheme;

  const CornerTag({
    super.key,
    required this.label,
    required this.isCapitative,
    required this.isDarkTheme,
  });

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isSmallScreen = screenWidth < 360;
    final tagWidth = isSmallScreen
        ? (isCapitative ? screenWidth * 0.22 : screenWidth * 0.16)
        : (isCapitative ? screenWidth * 0.25 : screenWidth * 0.18);
    // Make the tag slightly taller to add space at the bottom
    final tagHeight = isSmallScreen ? screenWidth * 0.05 : screenWidth * 0.06;

    return Container(
      width: tagWidth,
      height: tagHeight,
      // All sides same margin
      decoration: BoxDecoration(
        color: isCapitative
            ? (isDarkTheme ? Colors.purple.shade900 : Colors.purple.shade700)
            : (isDarkTheme ? Colors.green.shade900 : Colors.green[700]),
        borderRadius: const BorderRadius.only(
          topRight: Radius.circular(11), // Match the card's corner radius
          bottomLeft: Radius.circular(16),
          bottomRight:
              Radius.circular(4), // Add a small curve at the bottom right
        ),
        boxShadow: [
          BoxShadow(
            color: isDarkTheme
                ? Colors.black45.withOpacity(0.3)
                : Colors.black.withOpacity(0.3),
            blurRadius: 6,
            spreadRadius: 1,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Padding(
        padding:
            const EdgeInsets.only(bottom: 1.0), // Add padding at the bottom
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              fontSize: isSmallScreen
                  ? (isCapitative ? screenWidth * 0.024 : screenWidth * 0.026)
                  : (isCapitative ? screenWidth * 0.026 : screenWidth * 0.028),
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}
