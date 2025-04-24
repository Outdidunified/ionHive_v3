import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:ionhive/core/controllers/session_controller.dart';

import 'package:ionhive/feature/session_history/presentation/controllers/session_history_controllers.dart';
import 'package:ionhive/feature/session_history/presentation/pages/session_bill.dart';
import 'package:shimmer/shimmer.dart';

class SessionHistoryPage extends StatefulWidget {
  SessionHistoryPage({super.key}) {
    debugPrint("SessionHistoryPage: Constructor called");
  }

  @override
  State<SessionHistoryPage> createState() => _SessionHistoryPageState();
}

class _SessionHistoryPageState extends State<SessionHistoryPage> {
  // Controllers
  late final SessionController sessionController;
  late final SessionHistoryControllers controller;

  // State variables
  bool isLoading = true;
  bool controllersInitialized = false;
  String errorMessage = '';

  @override
  void initState() {
    super.initState();
    // Initialize controllers
    _initControllers();
    // Load data after widget is built if controllers are initialized
    if (controllersInitialized) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        loadData();
      });
    }
  }

  void _initControllers() {
    try {
      // Get SessionController
      sessionController = Get.find<SessionController>();

      // Initialize SessionHistoryControllers
      controller = Get.put(SessionHistoryControllers());

      controllersInitialized = true;
    } catch (e) {
      debugPrint("SessionHistoryPage: Error initializing controllers: $e");
      errorMessage = "Failed to initialize: $e";
      controllersInitialized = false;
    }
  }

  // Simple method to load data
  Future<void> loadData() async {
    if (!controllersInitialized) {
      debugPrint(
          "SessionHistoryPage: Controllers not initialized, cannot load data");
      return;
    }

    setState(() {
      isLoading = true;
    });

    try {
      await controller.refreshAllData();
    } catch (e) {
      debugPrint("SessionHistoryPage: Error loading data: $e");
      errorMessage = "Failed to load data: $e";
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      } else {
        debugPrint("SessionHistoryPage: Widget no longer mounted");
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Check if controllers are initialized
    if (!controllersInitialized) {
      return Scaffold(
        backgroundColor: theme.colorScheme.background,
        body: SafeArea(
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  "Error initializing session history",
                  style: theme.textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                Text(
                  errorMessage.isNotEmpty
                      ? errorMessage
                      : "Please restart the app",
                  style: theme.textTheme.bodyMedium,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () {
                    _initControllers();
                    if (controllersInitialized) {
                      loadData();
                      // Force rebuild
                      setState(() {});
                    }
                  },
                  child: Text("Retry"),
                ),
              ],
            ),
          ),
        ),
      );
    }
    if (controller.hasError.value) {
      return _buildContentLoading(
          context); // Use the enhanced error state from the previous response
    }
    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      floatingActionButton: Obx(() => FloatingActionButton(
            onPressed: controller.isLoading.value
                ? null
                : () async {
                    await controller.downloadSessionDetails();
                  },
            backgroundColor: theme.colorScheme.primary,
            child: Image.asset(
              'assets/icons/download.png',
              width: 24,
              height: 24,
              color: theme.colorScheme.onPrimary,
            ),
          )),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: isLoading
              ? _buildContentLoading(context)
              : Obx(() => ListView(
                    physics:
                        const ClampingScrollPhysics(), // Changed to prevent pull effect
                    children: [
                      _buildHeader(context),
                      const SizedBox(height: 20),
                      _buildSessionStatsRow(context, controller),
                      const SizedBox(height: 20),
                      _buildSectionTitle(context, 'Your Charging History'),
                      const SizedBox(height: 12),
                      _buildTransactionList(context),
                    ],
                  )),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "EV Session Tracker",
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              "You power the future. We power your ride.",
              style: theme.textTheme.bodyMedium,
            ),
          ],
        ),
        const Spacer(),
        Padding(
          padding: const EdgeInsets.only(top: 3, right: 5),
          child: IconButton(
            icon: Image.asset('assets/icons/info.png',
                height: 18, width: 18, color: theme.iconTheme.color),
            onPressed: () {
              _showWalletInfoBottomSheet(context, theme);
            },
          ),
        ),
      ],
    );
  }

// Method to show wallet info as a bottom sheet sliding up from the bottom
  void _showWalletInfoBottomSheet(BuildContext context, ThemeData theme) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      backgroundColor: Colors.transparent,
      builder: (BuildContext context) {
        return DraggableScrollableSheet(
          expand: false,
          initialChildSize: 0.6,
          minChildSize: 0.35,
          maxChildSize: 0.9,
          builder: (BuildContext context, ScrollController scrollController) {
            return Container(
              decoration: BoxDecoration(
                color: theme.scaffoldBackgroundColor,
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(20)),
                boxShadow: [
                  BoxShadow(
                    color: theme.colorScheme.primary.withOpacity(0.15),
                    blurRadius: 12,
                    spreadRadius: 1,
                    offset: const Offset(0, -3),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header with drag handle and title
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      borderRadius:
                          const BorderRadius.vertical(top: Radius.circular(20)),
                    ),
                    child: Column(
                      children: [
                        // Drag handle
                        Center(
                          child: Container(
                            width: 60,
                            height: 5,
                            margin: const EdgeInsets.symmetric(vertical: 8),
                            decoration: BoxDecoration(
                              color: theme.textTheme.bodyMedium?.color
                                  ?.withOpacity(0.30),
                              borderRadius: BorderRadius.circular(8),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.1),
                                  blurRadius: 3,
                                  offset: const Offset(0, 1),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Scrollable content
                  Expanded(
                    child: SingleChildScrollView(
                      controller: scrollController,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 8),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildInfoSection(
                            theme,
                            'What is Session History?',
                            'Session History keeps a record of all your charging sessions at ion Hive stations. It includes details like session ID, start/stop times, units consumed, and more.',
                          ),
                          _buildInfoSection(
                            theme,
                            'How to View Your Session History',
                            '1. Navigate to the "History" section in the app.\n'
                                '2. Tap on "Session History".\n'
                                '3. Browse through your past charging sessions.\n'
                                '4. Tap on a session to view detailed information, such as charger ID, cost, and status.',
                          ),
                          _buildInfoSection(
                            theme,
                            'Important Details',
                            '• You can download a receipt for each session by tapping the "Invoice" button.\n'
                                '• Check the "Reason" field if a session ended unexpectedly.\n'
                                '• For disputes or issues, contact support via the "Having Issue" button.',
                          ),
                          const SizedBox(
                              height: 70), // Space for the close button
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

// Helper method to build info sections in the bottom sheet
  Widget _buildInfoSection(ThemeData theme, String title, String content) {
    return Card(
      elevation: theme.cardTheme.elevation,
      margin: const EdgeInsets.only(bottom: 16),
      shape: theme.cardTheme.shape,
      color: theme.cardTheme.color,
      surfaceTintColor: theme.cardTheme.surfaceTintColor,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w600,
                color: theme.colorScheme.primary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              content,
              style: theme.textTheme.bodyLarge?.copyWith(
                color: theme.textTheme.bodyLarge?.color?.withOpacity(0.85),
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSessionStatsRow(
      BuildContext context, SessionHistoryControllers controller) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildStatBox(context, 'assets/icons/save.png', 'Total Sessions',
                controller.totalSessions.value, Colors.deepPurple),
            _buildStatBox(context, 'assets/icons/charge.png', 'Total Energy',
                controller.totalEnergy.value, Colors.green.shade600),
          ],
        ),
      ],
    );
  }

  Widget _buildStatBox(BuildContext context, String assetPath, String label,
      String value, Color valueColor,
      {bool isFullWidth = false}) {
    final theme = Theme.of(context);

    Widget statContent = Row(
      children: [
        Image.asset(
          assetPath,
          width: 25,
          height: 25,
          color: theme.iconTheme.color,
          errorBuilder: (context, error, stackTrace) {
            return Icon(
              Icons.access_time,
              size: 25,
              color: theme.iconTheme.color,
            );
          },
        ),
        const SizedBox(width: 15),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: theme.textTheme.bodySmall),
              const SizedBox(height: 5),
              Text(
                value,
                style: theme.textTheme.titleLarge!.copyWith(
                  fontWeight: FontWeight.bold,
                  color: valueColor,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );

    Widget container = Container(
      margin: const EdgeInsets.symmetric(horizontal: 4),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: theme.cardTheme.color,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: theme.brightness == Brightness.dark
                ? Colors.black26.withOpacity(0.1)
                : Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: statContent,
    );

    return isFullWidth ? container : Expanded(child: container);
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    return Row(
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        const Spacer(),
      ],
    );
  }

  Widget _buildTransactionList(BuildContext context) {
    final theme = Theme.of(context);
    final txStyle = theme.textTheme.titleLarge;
    final txSubStyle = theme.textTheme.bodyMedium;
    final cardColor = theme.cardTheme.color;

    return Obx(() {
      if (controller.sessions.isEmpty) {
        return Center(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(
              'No charging sessions found',
              style: theme.textTheme.bodyLarge,
            ),
          ),
        );
      }

      return Column(
        children: controller.sessions.map((session) {
          // Format date and time
          final startDate =
              DateFormat('MMM dd, yyyy').format(session.startTime);
          final startTime = DateFormat('hh:mm a').format(session.startTime);
          final endTime = session.stopTime != null
              ? DateFormat('hh:mm a').format(session.stopTime!)
              : 'In Progress';

          // Calculate duration if session has ended
          String duration = '';
          if (session.stopTime != null) {
            final diff = session.stopTime!.difference(session.startTime);
            duration = '${diff.inHours}h ${diff.inMinutes.remainder(60)}m';
          }

          return GestureDetector(
            onTap: () {
              // Convert session to Map<String, dynamic> for SessionBill
              final Map<String, dynamic> sessionData = {
                '_id': session.id,
                'charger_id': session.chargerId,
                'session_id': session.sessionId,
                'start_time': session.startTime.toIso8601String(),
                'stop_time': session.stopTime?.toIso8601String(),
                'unit_consummed': session.unitConsumed,
                'price': session.price,
                'connector_id': 1, // Default if not available
                'connector_type': 1, // Default if not available
                'email_id': sessionController.emailId.value,
                'user': sessionController.username.value
                    .split('@')[0], // Username from email
              };

              // Navigate to session bill page
              Get.to(
                () => SessionBill(sessionData),
                transition: Transition.rightToLeft,
                duration: const Duration(milliseconds: 300),
              );
            },
            child: Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: cardColor,
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: theme.brightness == Brightness.dark
                        ? Colors.black26.withOpacity(0.1)
                        : Colors.black.withOpacity(0.05),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        session.chargerId,
                        style: txStyle!.copyWith(
                          fontWeight: FontWeight.w600,
                          color: theme.textTheme.bodyMedium?.color
                              ?.withOpacity(0.6),
                        ),
                      ),
                      Text(
                        '-Rs.${session.price.toStringAsFixed(2)}',
                        style: txStyle.copyWith(
                          color: theme.colorScheme.error,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('$startDate at $startTime', style: txSubStyle),
                      Text(
                        '${session.unitConsumed.toStringAsFixed(2)} kWh',
                        style: txSubStyle!
                            .copyWith(color: theme.colorScheme.onSurface),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  if (duration.isNotEmpty)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Duration: $duration', style: txSubStyle),
                        Text(
                          'Ended at $endTime',
                          style: txSubStyle,
                        ),
                      ],
                    )
                  else
                    Text(
                      'Ongoing session - Started at $startTime',
                      style: txSubStyle,
                    ),
                ],
              ),
            ),
          );
        }).toList(),
      );
    });
  }

  Widget _buildContentLoading(BuildContext context) {
    final theme = Theme.of(context);

    return Shimmer.fromColors(
      baseColor: theme.brightness == Brightness.dark
          ? Colors.grey[700]!
          : Colors.grey[300]!,
      highlightColor: theme.brightness == Brightness.dark
          ? Colors.grey[600]!
          : Colors.grey[100]!,
      child: ListView(
        physics: const NeverScrollableScrollPhysics(),
        children: [
          _buildHeaderLoading(context),
          const SizedBox(height: 20),
          _buildStatsLoading(context),
          const SizedBox(height: 20),
          _buildSectionTitleLoading(context),
          const SizedBox(height: 12),
          _buildTransactionsLoading(context),
        ],
      ),
    );
  }

  Widget _buildHeaderLoading(BuildContext context) {
    Theme.of(context);
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 150,
              height: 20,
              color: Colors.white,
            ),
            const SizedBox(height: 4),
            Container(
              width: 200,
              height: 16,
              color: Colors.white,
            ),
          ],
        ),
        const Spacer(),
        Padding(
          padding: const EdgeInsets.only(top: 3, right: 5),
          child: Container(
            width: 18,
            height: 18,
            color: Colors.white,
          ),
        ),
      ],
    );
  }

  Widget _buildStatsLoading(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        _buildStatBoxLoading(context),
        _buildStatBoxLoading(context),
      ],
    );
  }

  Widget _buildStatBoxLoading(BuildContext context) {
    final theme = Theme.of(context);
    return Expanded(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: theme.cardTheme.color,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 80,
              height: 12,
              color: Colors.white,
            ),
            const SizedBox(height: 5),
            Container(
              width: 60,
              height: 20,
              color: Colors.white,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitleLoading(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 150,
          height: 20,
          color: Colors.white,
        ),
        const Spacer(),
      ],
    );
  }

  Widget _buildTransactionsLoading(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      children: List.generate(2, (index) {
        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: theme.cardTheme.color,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    width: 100,
                    height: 16,
                    color: Colors.white,
                  ),
                  Container(
                    width: 80,
                    height: 16,
                    color: Colors.white,
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    width: 120,
                    height: 12,
                    color: Colors.white,
                  ),
                  Container(
                    width: 60,
                    height: 12,
                    color: Colors.white,
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Container(
                width: 150,
                height: 12,
                color: Colors.white,
              ),
            ],
          ),
        );
      }),
    );
  }
}
