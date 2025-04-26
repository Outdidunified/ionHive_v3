import 'package:flutter/material.dart';
import 'package:get/get.dart';

// Popup Menu Overlay
class PopupMenuOverlay extends StatelessWidget {
  final Offset position;
  final VoidCallback onHidePopup;
  final VoidCallback onToggleSave;
  final VoidCallback onShare;
  final bool isSaved;

  const PopupMenuOverlay({
    super.key,
    required this.position,
    required this.onHidePopup,
    required this.onToggleSave,
    required this.onShare,
    required this.isSaved,
  });

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;

    return GestureDetector(
      behavior: HitTestBehavior.translucent,
      onTap: onHidePopup, // Dismiss popup when tapping outside
      child: Stack(
        children: [
          Positioned(
            top: position.dy + screenHeight * 0.04, // Slightly increased spacing from the top for better alignment
            left: position.dx - (screenWidth * 0.35), // Adjusted to ensure the popup is positioned nicely relative to the tap
            child: Material(
              color: Colors.transparent,
              child: Container(
                width: screenWidth * 0.40, // Slightly wider for better readability
                height: screenHeight * 0.14, // Slightly taller to accommodate spacing
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(screenWidth * 0.02), // Slightly larger radius for smoother corners
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black26,
                      blurRadius: screenWidth * 0.01, // Increased blur for a softer shadow
                      offset: Offset(0, screenHeight * 0.005), // Adjusted shadow offset for depth
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: EdgeInsets.symmetric(
                        horizontal: screenWidth * 0.03, // Increased horizontal padding for better spacing
                        vertical: screenHeight * 0.015, // Increased vertical padding for balance
                      ),
                      child: GestureDetector(
                        onTap: onToggleSave,
                        child: Row(
                          children: [
                            Icon(
                              isSaved ? Icons.bookmark : Icons.bookmark_border_outlined,
                              size: screenWidth * 0.06, // Slightly larger icon for visibility
                              color:  Colors.grey.shade600, // Consistent color for unsaved state
                            ),
                            SizedBox(width: screenWidth * 0.03), // Increased spacing between icon and text
                            Text(
                              isSaved ? 'Saved Station' : 'Save Station',
                              style: TextStyle(
                                fontSize: screenWidth * 0.035, // Slightly larger font for readability
                                color: Colors.grey.shade800, // Subtle color difference
                                fontWeight: FontWeight.w500, // Medium weight for better emphasis
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    Divider(
                      color: Colors.grey.shade400, // Softer color for the divider
                      thickness: screenHeight * 0.0005, // Slightly thicker divider for visibility
                      height: screenHeight * 0.01, // Increased height for better separation
                      indent: screenWidth * 0.03, // Indent to align with content
                      endIndent: screenWidth * 0.03, // Matching end indent
                    ),
                    Padding(
                      padding: EdgeInsets.symmetric(
                        horizontal: screenWidth * 0.03, // Consistent horizontal padding
                        vertical: screenHeight * 0.015, // Consistent vertical padding
                      ),
                      child: GestureDetector(
                        onTap: onShare,
                        child: Row(
                          children: [
                            Icon(
                              Icons.share,
                              size: screenWidth * 0.06, // Matching icon size
                              color: Colors.grey.shade600, // Consistent color
                            ),
                            SizedBox(width: screenWidth * 0.03), // Consistent spacing
                            Text(
                              'Share',
                              style: TextStyle(
                                fontSize: screenWidth * 0.035, // Matching font size
                                color: Colors.grey.shade800, // Matching color
                                fontWeight: FontWeight.w500, // Matching weight
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Station Header Widget
class StationHeader extends StatelessWidget {
  final String locationId;
  final String stationAddress;
  final String network;
  final String chargerType;
  final String availability;

  const StationHeader({
    super.key,
    required this.locationId,
    required this.stationAddress,
    required this.network,
    required this.chargerType,
    required this.availability,
  });

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;

    // Determine availability color and text
    Color availabilityColor = Colors.green;
    String availabilityText = availability;
    if (availability == 'Closed') {
      availabilityColor = Colors.red;
    } else if (availability == 'Under Maintenance') {
      availabilityColor = Colors.orange;
    }

    // Truncate stationAddress to 30 characters and append "..." if necessary
    final displayAddress = stationAddress.length > 30
        ? '${stationAddress.substring(0, 30)}...'
        : stationAddress;

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: screenWidth * 0.04, // 4% of screen width
        vertical: screenHeight * 0.02, // 2% of screen height
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            alignment: WrapAlignment.start,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              Text(
                "$locationId | ",
                style: TextStyle(
                  fontSize: screenWidth * 0.05, // 5% of screen width
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
              Text(
                displayAddress,
                softWrap: true,
                style: TextStyle(
                  fontSize: screenWidth * 0.05, // 5% of screen width
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            '$network $chargerType',
            style: TextStyle(
              color: Colors.black,
              fontSize: screenWidth * 0.04, // 4% of screen width
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Text(
                availabilityText,
                style: TextStyle(
                  color: availabilityColor,
                  fontSize: screenWidth * 0.035, // 3.5% of screen width
                ),
              ),
              SizedBox(width: screenWidth * 0.015), // 1.5% of screen width
              if (availability == 'Open 24/7')
                Text(
                  '• 24 Hours',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: screenWidth * 0.035, // 3.5% of screen width
                  ),
                ),
            ],
          ),
          SizedBox(height: screenHeight * 0.02), // 2% of screen height
          const TabBarHeader(),
        ],
      ),
    );
  }
}

// TabBarHeader Widget
class TabBarHeader extends StatelessWidget {
  const TabBarHeader({super.key});

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final screenWidth = mediaQuery.size.width;

    return Row(
      children: const [
        TabHeaderItem(label: 'Charger', isActive: true),
        SizedBox(width: 16),
        TabHeaderItem(label: 'Details'),
        SizedBox(width: 16),
        TabHeaderItem(label: 'Reviews'),
      ],
    );
  }
}

// TabHeaderItem Widget
class TabHeaderItem extends StatelessWidget {
  final String label;
  final bool isActive;

  const TabHeaderItem({super.key, required this.label, this.isActive = false});

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final screenWidth = mediaQuery.size.width;
    final screenHeight = mediaQuery.size.height;

    return Column(
      children: [
        Text(
          label,
          style: TextStyle(
            color: isActive ? Colors.orange : Colors.black54,
            fontSize: screenWidth * 0.04, // 4% of screen width
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        if (isActive)
          SizedBox(height: screenHeight * 0.008), // 0.8% of screen height
        if (isActive)
          Container(
            height: screenHeight * 0.003, // 0.3% of screen height
            width: screenWidth * 0.08, // 8% of screen width
            color: Colors.orange,
          ),
      ],
    );
  }
}

// ChargerCard Widget
class ChargerCard extends StatelessWidget {
  final String title;
  final String power;
  final String price;
  final String lastUsed;
  final String? sessions;
  final List<ConnectorInfo> connectors;

  const ChargerCard({
    super.key,
    required this.title,
    required this.power,
    required this.price,
    required this.lastUsed,
    this.sessions,
    required this.connectors,
  });

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final screenWidth = mediaQuery.size.width;
    final screenHeight = mediaQuery.size.height;

    return Card(
      elevation: 1.5,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(screenWidth * 0.03), // 3% of screen width
      ),
      child: Padding(
        padding: EdgeInsets.symmetric(
          vertical: screenHeight * 0.02, // 2% of screen height
          horizontal: screenWidth * 0.03, // 3% of screen width
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: TextStyle(
                fontSize: screenWidth * 0.045, // 4.5% of screen width
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: screenHeight * 0.015), // 1.5% of screen height
            Text(
              'DC | $power',
              style: TextStyle(fontSize: screenWidth * 0.035), // 3.5% of screen width
            ),
            Text(
              'Last used on - $lastUsed',
              style: TextStyle(fontSize: screenWidth * 0.035), // 3.5% of screen width
            ),
            Text(
              price,
              style: TextStyle(fontSize: screenWidth * 0.035), // 3.5% of screen width
            ),
            if (sessions != null) ...[
              SizedBox(height: screenHeight * 0.02), // 2% of screen height
              Row(
                children: [
                  Icon(
                    Icons.flash_on,
                    size: screenWidth * 0.04, // 4% of screen width
                    color: Colors.orange,
                  ),
                  SizedBox(width: screenWidth * 0.015), // 1.5% of screen width
                  Text(
                    '$sessions charging sessions done so far',
                    style: TextStyle(fontSize: screenWidth * 0.035), // 3.5% of screen width
                  ),
                  SizedBox(width: screenWidth * 0.015), // 1.5% of screen width
                  Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: screenWidth * 0.015, // 1.5% of screen width
                      vertical: screenHeight * 0.005, // 0.5% of screen height
                    ),
                    decoration: BoxDecoration(
                      color: Colors.red.shade100,
                      borderRadius: BorderRadius.circular(screenWidth * 0.01), // 1% of screen width
                    ),
                    child: Text(
                      'New',
                      style: TextStyle(
                        color: Colors.red,
                        fontSize: screenWidth * 0.03, // 3% of screen width
                      ),
                    ),
                  ),
                ],
              ),
            ],
            SizedBox(height: screenHeight * 0.03), // 3% of screen height
            for (final connector in connectors) ...[
              ConnectorCard(connector: connector),
              SizedBox(height: screenHeight * 0.025), // 2.5% of screen height
            ],
          ],
        ),
      ),
    );
  }
}

// ConnectorInfo Class
class ConnectorInfo {
  final String name;
  final String type;
  final String power;

  const ConnectorInfo({
    required this.name,
    required this.type,
    required this.power,
  });
}

// ConnectorCard Widget
class ConnectorCard extends StatelessWidget {
  final ConnectorInfo connector;

  const ConnectorCard({super.key, required this.connector});

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final screenWidth = mediaQuery.size.width;
    final screenHeight = mediaQuery.size.height;

    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.shade200),
        borderRadius: BorderRadius.circular(screenWidth * 0.03), // 3% of screen width
        color: Colors.grey.shade100,
      ),
      child: ListTile(
        contentPadding: EdgeInsets.all(screenWidth * 0.02), // 2% of screen width
        leading: Icon(
          Icons.bolt,
          color: Colors.black54,
          size: screenWidth * 0.04, // 4% of screen width
        ),
        title: Text(
          connector.name,
          style: TextStyle(fontSize: screenWidth * 0.035), // 3.5% of screen width
        ),
        subtitle: Text(
          '${connector.type} • Upto ${connector.power}',
          style: TextStyle(fontSize: screenWidth * 0.03), // 3% of screen width
        ),
        trailing: Text(
          'Available ✅',
          style: TextStyle(fontSize: screenWidth * 0.03), // 3% of screen width
        ),
      ),
    );
  }
}