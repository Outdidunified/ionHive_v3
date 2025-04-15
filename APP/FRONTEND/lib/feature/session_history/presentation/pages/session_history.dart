import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import 'package:ionhive/feature/session_history/presentation/controllers/session_history_controllers.dart';
import 'package:shimmer/shimmer.dart';

class SessionHistoryPage extends StatefulWidget {
  const SessionHistoryPage({super.key});

  @override
  State<SessionHistoryPage> createState() => _SessionHistoryPageState();
}

class _SessionHistoryPageState extends State<SessionHistoryPage>
    with AutomaticKeepAliveClientMixin, WidgetsBindingObserver {
  late final SessionHistoryControllers controller;
  bool _isFirstLoad = true;
  bool _isVisible = true;

  @override
  void initState() {
    super.initState();
    controller = Get.put(SessionHistoryControllers());
    WidgetsBinding.instance.addObserver(this);

    // Small delay to ensure the page is fully built before refreshing
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _isVisible = true;
      refreshData();
      _isFirstLoad = false;
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && _isVisible) {
      // App came to foreground and our page is visible, refresh data
      refreshData();
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // This is called when the page becomes visible again
    if (!_isFirstLoad) {
      _isVisible = true;
      // Refresh data when returning to this page
      refreshData();
    }
  }

  @override
  void deactivate() {
    // This is called when navigating away from the page
    _isVisible = false;
    super.deactivate();
  }

  Future<void> refreshData() async {
    // Use the controller's method to refresh all data at once
    await controller.refreshAllData();
  }

  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context); // Required for AutomaticKeepAliveClientMixin
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Implement download functionality
        },
        backgroundColor: theme.colorScheme.primary,
        child: Image.asset(
          'assets/icons/download.png',
          width: 24,
          height: 24,
          color: theme.colorScheme.onPrimary,
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Obx(() {
            if (controller.isLoading.value) {
              return _buildContentLoading(context);
            }

            return RefreshIndicator(
              onRefresh: refreshData,
              color: theme.colorScheme.primary,
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  _buildHeader(context),
                  const SizedBox(height: 20),
                  _buildSessionStatsRow(context, controller),
                  const SizedBox(height: 20),
                  _buildSectionTitle(context, 'Your Charging History'),
                  const SizedBox(height: 12),
                  _buildTransactionList(context),
                ],
              ),
            );
          }),
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
              style: theme.textTheme.headlineSmall,
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
          child: Image.asset(
            'assets/icons/info.png',
            width: 18,
            height: 18,
            color: theme.iconTheme.color,
          ),
        ),
      ],
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

          return Container(
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
                      'Charger: ${session.chargerId}',
                      style: txStyle!.copyWith(
                        fontWeight: FontWeight.w600,
                        color:
                            theme.textTheme.bodyMedium?.color?.withOpacity(0.6),
                      ),
                    ),
                    Text(
                      '-\Rs.${session.price.toStringAsFixed(2)}',
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
    final theme = Theme.of(context);
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
                    width: 120,
                    height: 16,
                    color: Colors.white,
                  ),
                  Container(
                    width: 60,
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
                    width: 100,
                    height: 14,
                    color: Colors.white,
                  ),
                  Container(
                    width: 50,
                    height: 14,
                    color: Colors.white,
                  ),
                ],
              ),
            ],
          ),
        );
      }),
    );
  }
}
