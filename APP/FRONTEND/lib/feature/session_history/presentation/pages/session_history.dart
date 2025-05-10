import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/session_history/presentation/controllers/session_history_controllers.dart';
import 'package:ionhive/feature/session_history/presentation/pages/session_bill.dart';
import 'package:shimmer/shimmer.dart';

class SessionHistoryPage extends StatefulWidget {
  const SessionHistoryPage({super.key});

  @override
  State<SessionHistoryPage> createState() => _SessionHistoryPageState();
}

class _SessionHistoryPageState extends State<SessionHistoryPage>
    with AutomaticKeepAliveClientMixin {
  late final SessionHistoryControllers controller;

  @override
  void initState() {
    super.initState();
    // Use a unique tag to ensure a fresh controller instance or find existing
    controller = Get.put(SessionHistoryControllers(), tag: 'session_history');

    // Fetch data when the widget is first created
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted && !controller.isLoading.value) {
        controller.refreshAllData().catchError((e) {
          debugPrint("SessionHistoryPage: Error loading data: $e");
        });
      }
    });
  }

  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context);
    final theme = Theme.of(context);

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
          child: RefreshIndicator(
            onRefresh: () => controller.refreshAllData(),
            child: Obx(() {
              debugPrint(
                  "SessionHistoryPage: isLoading = ${controller.isLoading.value}");
              debugPrint(
                  "SessionHistoryPage: sessions.isEmpty = ${controller.sessions.isEmpty}");
              debugPrint(
                  "SessionHistoryPage: sessions.length = ${controller.sessions.length}");

              if (controller.isLoading.value) {
                return _buildContentLoading(context);
              } else {
                return ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  children: [
                    _buildHeader(context),
                    const SizedBox(height: 20),
                    _buildSessionStatsRow(context, controller),
                    const SizedBox(height: 20),
                    _buildSectionTitle(context, 'Your Charging History'),
                    const SizedBox(height: 12),
                    _buildTransactionList(context, controller),
                  ],
                );
              }
            }),
          ),
        ),
      ),
    );
  }

  // Helper method to create a Future that completes after 2 seconds
  Future<void> _delayForProgressIndicator() {
    return Future.delayed(const Duration(seconds: 2));
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

  void _showWalletInfoBottomSheet(BuildContext context, ThemeData theme) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
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
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: const BoxDecoration(
                      borderRadius:
                          BorderRadius.vertical(top: Radius.circular(20)),
                    ),
                    child: Center(
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
                  ),
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
                          const SizedBox(height: 70),
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

  Widget _buildNoSessionsFound(BuildContext context) {
    final theme = Theme.of(context);
    final screenHeight = MediaQuery.of(context).size.height;
    final screenWidth = MediaQuery.of(context).size.width;

    final noSessionsImage = Image.asset(
      'assets/icons/history.png',
      width: screenWidth * 0.2,
      height: screenWidth * 0.2,
      errorBuilder: (context, error, stackTrace) {
        return Icon(
          Icons.error,
          size: screenWidth * 0.15,
          color: theme.colorScheme.primary.withOpacity(0.7),
        );
      },
    );

    debugPrint("SessionHistoryPage: Building No Sessions Found UI");

    return Center(
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Padding(
          padding: EdgeInsets.only(top: screenHeight * 0.2),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              noSessionsImage,
              const SizedBox(height: 20),
              Text(
                'No Session Data Found',
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.primary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                'No charging sessions available at the moment.',
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: theme.textTheme.bodyLarge?.color?.withOpacity(0.7),
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTransactionList(
      BuildContext context, SessionHistoryControllers controller) {
    final theme = Theme.of(context);
    final txStyle = theme.textTheme.titleLarge;
    final txSubStyle = theme.textTheme.bodyMedium;
    final cardColor = theme.cardTheme.color;
    final SessionController sessionController = Get.find<SessionController>();

    return Obx(() {
      debugPrint(
          "_buildTransactionList: isLoading = ${controller.isLoading.value}");
      debugPrint(
          "_buildTransactionList: sessions.isEmpty = ${controller.sessions.isEmpty}");

      if (controller.sessions.isEmpty && !controller.isLoading.value) {
        return FutureBuilder<void>(
          future: _delayForProgressIndicator(),
          builder: (context, snapshot) {
            if (snapshot.connectionState != ConnectionState.done) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 8.0),
                child: TweenAnimationBuilder<double>(
                  tween: Tween<double>(begin: 0.0, end: 1.0),
                  duration: const Duration(milliseconds: 500),
                  builder: (context, value, child) {
                    return LinearProgressIndicator(
                      value: value,
                      backgroundColor:
                          theme.colorScheme.primary.withOpacity(0.1),
                      valueColor: AlwaysStoppedAnimation<Color>(
                        theme.colorScheme.primary,
                      ),
                      minHeight: 2,
                    );
                  },
                ),
              );
            }
            return _buildNoSessionsFound(context);
          },
        );
      }

      return ListView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: controller.sessions.length,
        itemBuilder: (context, index) {
          final session = controller.sessions[index];
          // Convert and format start date in IST
          final istStartTime = session.startTime.toUtc().add(Duration(hours: 5, minutes: 30));
          final startDate = DateFormat('MMM dd, yyyy').format(istStartTime);
          final startTime = DateFormat('hh:mm a').format(istStartTime);

// Convert and format stop time in IST, if available
          String endTime = 'In Progress';
          if (session.stopTime != null) {
            final istStopTime = session.stopTime!.toUtc().add(Duration(hours: 5, minutes: 30));
            endTime = DateFormat('hh:mm a').format(istStopTime);}

          String duration = '';
          if (session.stopTime != null) {
            final diff = session.stopTime!.difference(session.startTime);
            duration = '${diff.inHours}h ${diff.inMinutes.remainder(60)}m';
          }

          return GestureDetector(
            onTap: () {
              // Updated sessionData map to include all fees and modified_date
              final Map<String, dynamic> sessionData = {
                '_id': session.id,
                'charger_id': session.chargerId,
                'session_id': session.sessionId,
                'start_time': session.startTime.toIso8601String(),
                'stop_time': session.stopTime?.toIso8601String(),
                'unit_consummed': session.unitConsumed,
                'price': session.price,
                'connector_id': session.connectorId ?? 1,
                'connector_type': session.connectorType ?? 1,
                'email_id': sessionController.emailId.value,
                'user': sessionController.username.value.split('@')[0],
                'EB_fee': session.ebFee,
                'association_commission': session.associationCommission,
                'client_commission': session.clientCommission,
                'convenience_fee': session.convenienceFee,
                'gst_amount': session.gstAmount,
                'gst_percentage': session.gstPercentage,
                'parking_fee': session.parkingFee,
                'processing_fee': session.processingFee,
                'reseller_commission': session.resellerCommission,
                'service_fee': session.serviceFee,
                'station_fee': session.stationFee,
                'modified_date': session.modifiedDate?.toIso8601String(),
              };

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
        },
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
