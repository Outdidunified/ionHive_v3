import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:get/get.dart';
import 'package:timezone/data/latest.dart' as tz_data;

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;

  final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
      FlutterLocalNotificationsPlugin();

  NotificationService._internal();

  Future<void> init() async {
    debugPrint('Starting notification service initialization');

    // Initialize timezone
    try {
      tz_data.initializeTimeZones();
      debugPrint('Timezone data initialized');
    } catch (e) {
      debugPrint('Error initializing timezone data: $e');
    }

    // Initialize notification settings
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    final DarwinInitializationSettings initializationSettingsIOS =
        DarwinInitializationSettings(
      requestAlertPermission: false, // We'll request permissions separately
      requestBadgePermission: false,
      requestSoundPermission: false,
      notificationCategories: [
        DarwinNotificationCategory(
          'charging_category',
          actions: [
            DarwinNotificationAction.plain(
              'view_action',
              'View',
              options: <DarwinNotificationActionOption>{
                DarwinNotificationActionOption.foreground,
              },
            ),
          ],
        ),
      ],
    );

    final InitializationSettings initializationSettings =
        InitializationSettings(
      android: initializationSettingsAndroid,
      iOS: initializationSettingsIOS,
    );

    try {
      final bool? result = await flutterLocalNotificationsPlugin.initialize(
        initializationSettings,
        onDidReceiveNotificationResponse:
            (NotificationResponse notificationResponse) async {
          // Handle notification tap
          debugPrint('Notification clicked: ${notificationResponse.payload}');
        },
      );
      debugPrint('Notification service initialized successfully: $result');

      // Create notification channels for Android after successful initialization
      await _createNotificationChannels();
    } catch (e) {
      debugPrint('Error initializing notification service: $e');
      // Rethrow to allow proper error handling in the caller
      rethrow;
    }
  }

  // Create notification channels for Android
  Future<void> _createNotificationChannels() async {
    // Only needed for Android 8.0+
    if (GetPlatform.isAndroid) {
      try {
        // Success channel
        const AndroidNotificationChannel successChannel =
            AndroidNotificationChannel(
          'charging_success_channel',
          'Charging Success Notifications',
          description: 'Notifications for successful charging sessions',
          importance: Importance.max,
        );

        // Fault channel
        const AndroidNotificationChannel faultChannel =
            AndroidNotificationChannel(
          'charging_fault_channel',
          'Charging Fault Notifications',
          description: 'Notifications for charging session faults',
          importance: Importance.max,
        );

        // General channel
        const AndroidNotificationChannel generalChannel =
            AndroidNotificationChannel(
          'charging_channel',
          'Charging Notifications',
          description: 'Notifications related to EV charging',
          importance: Importance.max,
        );

        final androidPlugin = flutterLocalNotificationsPlugin
            .resolvePlatformSpecificImplementation<
                AndroidFlutterLocalNotificationsPlugin>();

        // Create each channel individually
        await androidPlugin?.createNotificationChannel(successChannel);
        await androidPlugin?.createNotificationChannel(faultChannel);
        await androidPlugin?.createNotificationChannel(generalChannel);

        debugPrint('Notification channels created successfully');
      } catch (e) {
        debugPrint('Error creating notification channels: $e');
      }
    }
  }

  // Request notification permissions
  Future<void> requestPermissions() async {
    await flutterLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.requestNotificationsPermission();

    await flutterLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<
            IOSFlutterLocalNotificationsPlugin>()
        ?.requestPermissions(
          alert: true,
          badge: true,
          sound: true,
        );
  }

  // Show immediate notification
  Future<void> showNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
  }) async {
    try {
      debugPrint('Preparing to show notification: $title');

      const AndroidNotificationDetails androidPlatformChannelSpecifics =
          AndroidNotificationDetails(
        'charging_channel',
        'Charging Notifications',
        channelDescription: 'Notifications related to EV charging',
        importance: Importance.max,
        priority: Priority.high,
        showWhen: true,
      );

      const DarwinNotificationDetails iOSPlatformChannelSpecifics =
          DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      );

      const NotificationDetails platformChannelSpecifics = NotificationDetails(
        android: androidPlatformChannelSpecifics,
        iOS: iOSPlatformChannelSpecifics,
      );

      debugPrint('Calling show method on notification plugin');
      await flutterLocalNotificationsPlugin.show(
        id,
        title,
        body,
        platformChannelSpecifics,
        payload: payload,
      );
      debugPrint('Notification shown successfully');
    } catch (e) {
      debugPrint('Error showing notification: $e');
      // Don't rethrow here to prevent app crashes
      // Instead, log the error and continue
    }
  }

  // Show charging complete notification
  Future<void> showChargingCompleteNotification({
    required double energy,
    required double cost,
  }) async {
    try {
      debugPrint('Preparing to show charging complete notification');

      const AndroidNotificationDetails androidPlatformChannelSpecifics =
          AndroidNotificationDetails(
        'charging_success_channel',
        'Charging Success Notifications',
        channelDescription: 'Notifications for successful charging sessions',
        importance: Importance.max,
        priority: Priority.high,
        showWhen: true,
        color: Color(0xFF4CAF50), // Green color for success
        icon: '@mipmap/ic_launcher',
      );

      const DarwinNotificationDetails iOSPlatformChannelSpecifics =
          DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      );

      const NotificationDetails platformChannelSpecifics = NotificationDetails(
        android: androidPlatformChannelSpecifics,
        iOS: iOSPlatformChannelSpecifics,
      );

      debugPrint('Calling show method for charging complete notification');
      await flutterLocalNotificationsPlugin.show(
        1,
        'Charging Complete ✅',
        'Your vehicle has been charged with ${energy.toStringAsFixed(2)} kWh. Total cost: ₹${cost.toStringAsFixed(2)}',
        platformChannelSpecifics,
        payload: 'charging_complete',
      );
      debugPrint('Charging complete notification shown successfully');
    } catch (e) {
      debugPrint('Error showing charging complete notification: $e');
      // Don't rethrow to prevent app crashes
    }
  }

  // Show charging fault notification
  Future<void> showChargingFaultNotification({
    String? errorCode,
    double? energy,
    double? cost,
  }) async {
    try {
      debugPrint('Preparing to show charging fault notification');

      const AndroidNotificationDetails androidPlatformChannelSpecifics =
          AndroidNotificationDetails(
        'charging_fault_channel',
        'Charging Fault Notifications',
        channelDescription: 'Notifications for charging session faults',
        importance: Importance.max,
        priority: Priority.high,
        showWhen: true,
        color: Color(0xFFF44336), // Red color for errors
        icon: '@mipmap/ic_launcher',
      );

      const DarwinNotificationDetails iOSPlatformChannelSpecifics =
          DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      );

      const NotificationDetails platformChannelSpecifics = NotificationDetails(
        android: androidPlatformChannelSpecifics,
        iOS: iOSPlatformChannelSpecifics,
      );

      String bodyText = 'Your charging session was interrupted due to a fault.';

      if (errorCode != null && errorCode.isNotEmpty) {
        bodyText += ' Issue is $errorCode';
      }

      if (energy != null && energy > 0 && cost != null) {
        bodyText +=
            '\nCharged ${energy.toStringAsFixed(2)} kWh before fault. Cost: ₹${cost.toStringAsFixed(2)}';
      }

      debugPrint('Calling show method for charging fault notification');
      await flutterLocalNotificationsPlugin.show(
        2,
        'Charging Fault Detected ⚠️',
        bodyText,
        platformChannelSpecifics,
        payload: 'charging_fault',
      );
      debugPrint('Charging fault notification shown successfully');
    } catch (e) {
      debugPrint('Error showing charging fault notification: $e');
      // Don't rethrow to prevent app crashes
    }
  }
}
