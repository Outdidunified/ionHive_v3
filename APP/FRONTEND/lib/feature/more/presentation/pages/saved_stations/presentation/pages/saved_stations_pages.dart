import 'package:flutter/material.dart';

class SavedStationsPages extends StatelessWidget {
  final int userId;
  final String username;
  final String emailId;
  final String token;

  const SavedStationsPages({
    Key? key,
    required this.userId,
    required this.username,
    required this.emailId,
    required this.token,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Saved Stations',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 20,
            color: Colors.black,
          ),
        ),
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      backgroundColor: Colors.white,
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          _buildStationCard(
            title: 'AP | Visakhapatnam | A Square Gokarting',
            subtitle: 'Anandapuram Junction Bus Stop',
            isPublic: true,
            isAvailable: true,
            chargerType: 'DC',
            isBookmarked: true,
          ),
          const SizedBox(height: 12),
          _buildStationCard(
            title: 'KA | Bengaluru | The Pavilion 2',
            subtitle: 'Hyundai EVCS',
            isPublic: true,
            isAvailable: true,
            chargerType: 'DC',
            isBookmarked: true,
          ),
        ],
      ),
    );
  }

  Widget _buildStationCard({
    required String title,
    required String subtitle,
    required bool isPublic,
    required bool isAvailable,
    required String chargerType,
    required bool isBookmarked,
  }) {
    return Builder(builder: (context) {
      // Get responsive text styles
      final titleStyle = TextStyle(
        fontWeight: FontWeight.bold,
        fontSize: MediaQuery.of(context).size.width * 0.035,
      );

      final subtitleStyle = TextStyle(
        fontSize: MediaQuery.of(context).size.width * 0.032,
        color: Colors.grey,
      );

      final statusStyle = TextStyle(
        fontSize: MediaQuery.of(context).size.width * 0.032,
        color: isAvailable ? Colors.green : Colors.red,
        fontWeight: FontWeight.bold,
      );

      final chargerTypeStyle = TextStyle(
        fontSize: MediaQuery.of(context).size.width * 0.03,
        fontWeight: FontWeight.bold,
        color: Colors.black87,
      );

      return Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            padding: EdgeInsets.fromLTRB(12, 12, 12, 12),
            margin: const EdgeInsets.only(top: 10, bottom: 10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: const [
                BoxShadow(
                  color: Colors.black12,
                  blurRadius: 4,
                  offset: Offset(0, 2),
                )
              ],
            ),
            clipBehavior: Clip.none,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 5),
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        title,
                        style: titleStyle,
                      ),
                    ),
                    Icon(
                      isBookmarked ? Icons.bookmark : Icons.bookmark_border,
                      color: Colors.blueGrey,
                      size: MediaQuery.of(context).size.width * 0.055,
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: subtitleStyle,
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Text(
                      isAvailable ? 'Available ✅' : 'Unavailable ❌',
                      style: statusStyle,
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.grey[200],
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        chargerType,
                        style: chargerTypeStyle,
                      ),
                    )
                  ],
                ),
              ],
            ),
          ),
          if (isPublic) const CornerTag(label: 'Public'),
        ],
      );
    });
  }
}

class CornerTag extends StatelessWidget {
  final String label;

  const CornerTag({
    Key? key,
    required this.label,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;

    return Positioned(
      top: 10, // Match the top margin of the container
      right: -screenWidth * 0.05, // Extend outside the container
      child: SizedBox(
        width: screenWidth * 0.2,
        height: screenWidth * 0.07,
        child: CustomPaint(
          painter: RibbonPainter(
            color: const Color(0xFF00C853),
            labelWidth: screenWidth * 0.15,
          ),
          child: Align(
            alignment: Alignment.center,
            child: Padding(
              padding: EdgeInsets.only(
                  left: screenWidth * 0.02, bottom: screenWidth * 0.01),
              child: Text(
                label,
                style: TextStyle(
                  fontSize: screenWidth * 0.03,
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class RibbonPainter extends CustomPainter {
  final Color color;
  final double labelWidth;

  RibbonPainter({
    required this.color,
    required this.labelWidth,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final path = Path();

    // Starting from top-right corner
    path.moveTo(size.width, 0);

    // Draw the right edge (partial)
    path.lineTo(size.width, size.height * 0.5);

    // Draw the slanted edge going down and left (outside the container)
    path.lineTo(size.width - labelWidth, size.height);

    // Draw the left edge going up
    path.lineTo(size.width - labelWidth, 0);

    // Close the path
    path.close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
