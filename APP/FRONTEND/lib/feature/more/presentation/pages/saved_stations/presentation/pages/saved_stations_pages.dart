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
    return Stack(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
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
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 5),
              Row(
                children: [
                  Expanded(
                    child: Text(
                      title,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ),
                  Icon(
                    isBookmarked ? Icons.bookmark : Icons.bookmark_border,
                    color: Colors.blueGrey,
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: const TextStyle(
                  fontSize: 13,
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Text(
                    isAvailable ? 'Available ✅' : 'Unavailable ❌',
                    style: TextStyle(
                      fontSize: 13,
                      color: isAvailable ? Colors.green : Colors.red,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.grey[200],
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      chargerType,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                  )
                ],
              ),
            ],
          ),
        ),
        if (isPublic)
          const CornerTag(label: 'Public'), // Label only, no icon
      ],
    );
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
    return Positioned(
      top: 0,
      right: 0,
      child: CustomPaint(
        painter: TabBorderPainter(),
        child: ClipPath(
          clipper: TabClipper(),
          child: Container(
            width: 60,
            height: 28,
            color: Colors.white,
            alignment: Alignment.center,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF00C853), // Green
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
class TabBorderPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    const double curveHeight = 10;
    final Paint paint = Paint()
      ..color = Colors.grey // Green border
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    final Path path = Path();
    path.moveTo(0, 0);
    path.lineTo(size.width - curveHeight, 0);
    path.quadraticBezierTo(size.width, 0, size.width, curveHeight);
    path.lineTo(size.width, size.height);
    path.lineTo(0, size.height);
    path.close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}

class TabClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    const double curveHeight = 10;

    Path path = Path();
    path.moveTo(0, 0);
    path.lineTo(size.width - curveHeight, 0);
    path.quadraticBezierTo(size.width, 0, size.width, curveHeight);
    path.lineTo(size.width, size.height);
    path.lineTo(0, size.height);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(CustomClipper<Path> oldClipper) => false;
}

