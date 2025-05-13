# Charging Notifications Feature

This document explains the implementation of the notification system for charging status updates in the ionHive app.

## Overview

The notification system sends alerts to users when:
1. Charging is successfully completed
2. Charging is interrupted due to a fault

## Implementation Details

### Files Modified/Created

1. **New Service:**
   - `lib/core/services/notification_service.dart` - Core service for handling notifications

2. **Modified Files:**
   - `lib/main.dart` - Added initialization of notification service
   - `lib/feature/Chargingpage/presentation/controllers/Chargingpage_controller.dart` - Added notification triggers
   - `ios/Runner/Info.plist` - Added iOS notification permissions
   - `android/app/src/main/AndroidManifest.xml` - Already had notification permissions

### Notification Types

1. **Charging Complete Notification**
   - Triggered when charging finishes successfully
   - Shows energy consumed and total cost
   - Appears when bill is generated

2. **Charging Fault Notification**
   - Triggered when charging is interrupted due to a fault
   - Shows error code if available
   - Appears for both cases:
     - When fault occurs during active charging (with bill generation)
     - When fault occurs before charging starts (no bill generated)

3. **Error Notification**
   - Triggered when there's an error generating the bill
   - Generic error message

## How It Works

1. The notification service is initialized at app startup
2. When charging status changes to "Finishing" or "Faulted", the appropriate notification is triggered
3. For successful charging, the notification shows energy consumed and cost
4. For faulted charging, the notification shows the error code

## Testing

To test notifications:
1. Start a charging session
2. Wait for it to complete or simulate a fault
3. Verify that the appropriate notification appears

## Permissions

The app requests notification permissions at startup. Users can manage notification settings in their device settings.

## Dependencies

- flutter_local_notifications: ^19.2.0
- timezone: ^0.10.1