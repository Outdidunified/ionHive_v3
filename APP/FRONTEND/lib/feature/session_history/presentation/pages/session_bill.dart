import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:ionhive/feature/more/presentation/pages/help&support/presentation/pages/contact%20us.dart';

class SessionBill extends StatefulWidget {
  final Map<String, dynamic> session;
  final VoidCallback? onShare;

  const SessionBill(this.session, {super.key, this.onShare});

  @override
  _SessionBillState createState() => _SessionBillState();
}

class _SessionBillState extends State<SessionBill>
    with TickerProviderStateMixin {
  final GlobalKey usageReportKey = GlobalKey();
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;
  late AnimationController _tapController;
  late Animation<double> _tapAnimation;
  bool _isArrowVisible = true;

  @override
  void initState() {
    super.initState();
    // Initialize the pulse AnimationController for idle animation
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.3).animate(
      CurvedAnimation(
        parent: _pulseController,
        curve: Curves.easeInOut,
      ),
    );

    // Initialize the tap AnimationController for click animation
    _tapController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );

    _tapAnimation = Tween<double>(begin: 1.0, end: 1.5).animate(
      CurvedAnimation(
        parent: _tapController,
        curve: Curves.elasticOut,
      ),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _tapController.dispose();
    super.dispose();
  }

  String _getConnectorTypeName(int? connectorType) {
    switch (connectorType) {
      case 1:
        return 'Socket';
      case 2:
        return 'Gun';
      default:
        return 'Unknown';
    }
  }

  String formatDate(String? dateString) {
    if (dateString == null) return 'N/A';
    try {
      return DateFormat('dd MMM yyyy, hh:mm a')
          .format(DateTime.parse(dateString).toLocal());
    } catch (e) {
      return 'Invalid Date';
    }
  }

  Widget _buildInfoRow(BuildContext context, String label, String? value,
      {IconData? icon}) {
    final theme = Theme.of(context);
    final mediaQuery = MediaQuery.of(context).size; // Define mediaQuery here
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      margin: const EdgeInsets.symmetric(vertical: 8.0),
      padding: EdgeInsets.all(mediaQuery.width * 0.03), // Responsive padding
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: theme.dividerColor),
        boxShadow: [
          BoxShadow(
            color: theme.shadowColor.withOpacity(0.1),
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (icon != null) ...[
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding:
                  EdgeInsets.all(mediaQuery.width * 0.02), // Responsive padding
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withOpacity(0.15),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: theme.colorScheme.primary.withOpacity(0.1),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Icon(
                icon,
                color: theme.colorScheme.primary,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
          ],
          Flexible(
            fit: FlexFit.loose,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  label,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w500,
                    color: theme.colorScheme.onSurface,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  value ?? 'N/A',
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: theme.textTheme.bodyLarge?.color?.withOpacity(0.7),
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void scrollToUsageReport() {
    // Trigger tap animation
    _tapController.forward().then((_) {
      _tapController.reverse();
      // Fade out the arrow after animation
      setState(() {
        _isArrowVisible = false;
      });
    });

    // Scroll to usage report
    final BuildContext? context = usageReportKey.currentContext;
    if (context != null) {
      Scrollable.ensureVisible(
        context,
        alignment: 0.0,
        duration: const Duration(milliseconds: 550),
        curve: Curves.easeInOutQuad,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context).size;
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'Charging Receipt',
          style: theme.textTheme.headlineMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          if (widget.onShare != null)
            IconButton(
              icon: const Icon(Icons.share),
              onPressed: widget.onShare,
              color: theme.colorScheme.primary,
            ),
        ],
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              theme.colorScheme.primary.withOpacity(0.05),
              theme.scaffoldBackgroundColor,
            ],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            stops: const [0.0, 0.7],
          ),
        ),
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              physics: const ClampingScrollPhysics(),
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight: constraints.maxHeight,
                ),
                child: IntrinsicHeight(
                  child: Column(
                    children: [
                      // Spacer to push content below the center
                      SizedBox(
                          height: constraints.maxHeight *
                              0.25), // Adjusted to center below
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Container(
                            padding: EdgeInsets.all(mediaQuery.width * 0.06),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  theme.colorScheme.primary,
                                  theme.colorScheme.secondary.withOpacity(0.8),
                                ],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: theme.colorScheme.primary
                                      .withOpacity(0.3),
                                  blurRadius: 20,
                                  spreadRadius: 5,
                                ),
                              ],
                            ),
                            child: CircleAvatar(
                              radius: mediaQuery.width * 0.14,
                              backgroundColor:
                                  theme.colorScheme.primary.withOpacity(0.2),
                              backgroundImage: const AssetImage(
                                  "assets/ionHive_logo's/ionHive.png"),
                            ),
                          ),
                          SizedBox(height: mediaQuery.height * 0.02),
                          Text(
                            'To ion Hive',
                            style: theme.textTheme.headlineSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: theme.colorScheme.onSurface,
                            ),
                          ),
                          SizedBox(height: mediaQuery.height * 0.01),
                          Text(
                            '₹${widget.session['price'] ?? 0}',
                            style: theme.textTheme.displayMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: theme.colorScheme.primary,
                            ),
                          ),
                          SizedBox(height: mediaQuery.height * 0.01),
                          AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            padding: EdgeInsets.symmetric(
                                horizontal: mediaQuery.width * 0.04,
                                vertical: mediaQuery.height * 0.01),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  theme.colorScheme.primary.withOpacity(0.1),
                                  theme.colorScheme.primary.withOpacity(0.2),
                                ],
                                begin: Alignment.centerLeft,
                                end: Alignment.centerRight,
                              ),
                              borderRadius: BorderRadius.circular(25),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.check_circle,
                                    color: theme.colorScheme.primary, size: 22),
                                SizedBox(width: mediaQuery.width * 0.025),
                                Text(
                                  'Completed',
                                  style: theme.textTheme.bodyLarge?.copyWith(
                                    color: theme.colorScheme.primary,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Padding(
                            padding: EdgeInsets.symmetric(
                                vertical: mediaQuery.height * 0.02),
                            child: Stack(
                              alignment: Alignment.center,
                              children: [
                                Divider(
                                    color: theme.dividerColor, thickness: 1.5),
                                Container(
                                  padding: EdgeInsets.symmetric(
                                      horizontal: mediaQuery.width * 0.04,
                                      vertical: mediaQuery.height * 0.01),
                                  decoration: BoxDecoration(
                                    color: theme.scaffoldBackgroundColor,
                                    borderRadius: BorderRadius.circular(20),
                                    border:
                                        Border.all(color: theme.dividerColor),
                                  ),
                                  child: RichText(
                                    text: TextSpan(
                                      text: 'Charged By ',
                                      style:
                                          theme.textTheme.bodyMedium?.copyWith(
                                        color: theme.textTheme.bodyMedium?.color
                                            ?.withOpacity(0.7),
                                      ),
                                      children: [
                                        TextSpan(
                                          text: widget.session['user'] ??
                                              'Unknown',
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            color: theme.colorScheme.primary,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: mediaQuery.height * 0.02),
                      GestureDetector(
                        onTap: scrollToUsageReport,
                        child: AnimatedOpacity(
                          opacity:
                              _isArrowVisible ? 1.0 : 1.0, // Fixed to fade out
                          duration: const Duration(milliseconds: 500),
                          child: ScaleTransition(
                            scale: _tapAnimation,
                            child: ScaleTransition(
                              scale: _pulseAnimation,
                              child: Icon(
                                Icons.keyboard_double_arrow_down,
                                size: 50,
                                color: theme.colorScheme.primary,
                              ),
                            ),
                          ),
                        ),
                      ),
                      SizedBox(height: mediaQuery.height * 0.23),
                      Container(
                        key: usageReportKey,
                        child: Card(
                          elevation: 4,
                          color: theme.cardTheme.color,
                          surfaceTintColor: Colors.transparent,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Padding(
                            padding: EdgeInsets.all(mediaQuery.width * 0.04),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  padding: EdgeInsets.symmetric(
                                      horizontal: mediaQuery.width * 0.03,
                                      vertical: mediaQuery.height * 0.01),
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [
                                        theme.colorScheme.primary
                                            .withOpacity(0.1),
                                        theme.colorScheme.primary
                                            .withOpacity(0.2),
                                      ],
                                      begin: Alignment.centerLeft,
                                      end: Alignment.centerRight,
                                    ),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.info_outline,
                                          size: 20,
                                          color: theme.colorScheme.primary),
                                      SizedBox(width: mediaQuery.width * 0.025),
                                      Text(
                                        'Usage Report',
                                        style: theme.textTheme.titleLarge
                                            ?.copyWith(
                                          fontWeight: FontWeight.bold,
                                          color: theme.colorScheme.primary,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                SizedBox(height: 10),
                                Divider(color: theme.dividerColor),
                                SizedBox(height: mediaQuery.height * 0.01),
                                Container(
                                  padding:
                                      EdgeInsets.all(mediaQuery.width * 0.03),
                                  decoration: BoxDecoration(
                                    color: theme.colorScheme.surface,
                                    borderRadius: BorderRadius.circular(10),
                                    border:
                                        Border.all(color: theme.dividerColor),
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Container(
                                        padding: EdgeInsets.all(
                                            mediaQuery.width * 0.025),
                                        decoration: BoxDecoration(
                                          color: theme.colorScheme.primary
                                              .withOpacity(0.15),
                                          shape: BoxShape.circle,
                                        ),
                                        child: Icon(
                                          Icons.ev_station,
                                          color: theme.colorScheme.primary,
                                          size: 24,
                                        ),
                                      ),
                                      SizedBox(width: 15),
                                      Flexible(
                                        fit: FlexFit.loose,
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Text(
                                              'Charger ID',
                                              style: theme.textTheme.bodyMedium
                                                  ?.copyWith(
                                                fontWeight: FontWeight.w500,
                                              ),
                                            ),
                                            SizedBox(height: 4),
                                            Flexible(
                                              fit: FlexFit.loose,
                                              child: RichText(
                                                text: TextSpan(
                                                  children: [
                                                    TextSpan(
                                                      text:
                                                          '${widget.session['charger_id']} - ',
                                                      style: theme
                                                          .textTheme.bodyLarge
                                                          ?.copyWith(
                                                        color: theme.textTheme
                                                            .bodyLarge?.color
                                                            ?.withOpacity(0.7),
                                                      ),
                                                    ),
                                                    TextSpan(
                                                      text:
                                                          '[${widget.session['connector_id'].toString()}] ',
                                                      style: TextStyle(
                                                        color: theme.colorScheme
                                                            .primary,
                                                      ),
                                                    ),
                                                    TextSpan(
                                                      text: '│ ',
                                                      style: theme
                                                          .textTheme.bodyLarge
                                                          ?.copyWith(
                                                        color: theme.textTheme
                                                            .bodyLarge?.color
                                                            ?.withOpacity(0.7),
                                                      ),
                                                    ),
                                                    TextSpan(
                                                      text: _getConnectorTypeName(
                                                              widget.session[
                                                                  'connector_type'])
                                                          .toString(),
                                                      style: theme
                                                          .textTheme.bodyLarge
                                                          ?.copyWith(
                                                        color: theme.textTheme
                                                            .bodyLarge?.color
                                                            ?.withOpacity(0.7),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                                maxLines: 2,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                SizedBox(height: 8),
                                _buildInfoRow(
                                  context,
                                  'Session ID',
                                  widget.session['session_id'].toString(),
                                  icon: Icons.confirmation_number_outlined,
                                ),
                                _buildInfoRow(
                                  context,
                                  'Start Time',
                                  formatDate(widget.session['start_time']),
                                  icon: Icons.play_circle_outline,
                                ),
                                _buildInfoRow(
                                  context,
                                  'Stop Time',
                                  formatDate(widget.session['stop_time']),
                                  icon: Icons.stop_circle_outlined,
                                ),
                                _buildInfoRow(
                                  context,
                                  'Unit Consumed',
                                  '${widget.session['unit_consummed']} kWh',
                                  icon: Icons.bolt,
                                ),
                                _buildInfoRow(
                                  context,
                                  'Reason',
                                  widget.session['Error'] != null &&
                                          widget.session['Error'].toString() !=
                                              'NoError'
                                      ? widget.session['Error']
                                      : 'Stopped by User',
                                  icon: Icons.info_outline,
                                ),
                                SizedBox(height: 10),
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceEvenly,
                                  children: [
                                    ElevatedButton.icon(
                                      onPressed: () {
                                        Get.to(
                                          () => const ContactUs(),
                                          transition: Transition.rightToLeft,
                                          duration:
                                              const Duration(milliseconds: 300),
                                        );
                                      },
                                      icon: Icon(
                                        Icons.help_outline,
                                        color: theme.colorScheme.primary,
                                        size: 20,
                                      ),
                                      label: Text(
                                        "Having Issue",
                                        style:
                                            theme.textTheme.bodyLarge?.copyWith(
                                          color: theme.colorScheme.primary,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: theme
                                            .colorScheme.primary
                                            .withOpacity(0.1),
                                        elevation: 0,
                                        padding: EdgeInsets.symmetric(
                                            horizontal: mediaQuery.width * 0.04,
                                            vertical: mediaQuery.height * 0.01),
                                        shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(8),
                                          side: BorderSide(
                                              color: theme.colorScheme.primary
                                                  .withOpacity(0.3)),
                                        ),
                                      ),
                                    ),
                                    ElevatedButton.icon(
                                      onPressed: widget.onShare ??
                                          () {
                                            // Placeholder for download invoice action
                                          },
                                      icon: Icon(
                                        Icons.download,
                                        color: theme.colorScheme.primary,
                                        size: 20,
                                      ),
                                      label: Text(
                                        "Invoice",
                                        style:
                                            theme.textTheme.bodyLarge?.copyWith(
                                          color: theme.colorScheme.primary,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: theme
                                            .colorScheme.primary
                                            .withOpacity(0.1),
                                        elevation: 0,
                                        padding: EdgeInsets.symmetric(
                                            horizontal: mediaQuery.width * 0.04,
                                            vertical: mediaQuery.height * 0.01),
                                        shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(8),
                                          side: BorderSide(
                                              color: theme.colorScheme.primary
                                                  .withOpacity(0.3)),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      SizedBox(height: mediaQuery.height * 0.10),
                      Text(
                        "Powered by \nOutdid Unified Pvt Ltd",
                        textAlign: TextAlign.center,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.textTheme.bodyMedium?.color
                              ?.withOpacity(0.7),
                        ),
                      ),
                      SizedBox(height: mediaQuery.height * 0.020),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
