import 'package:ionhive/core/core.dart';

class Sessionurl {
  static final String fetchtotalsessions =
      '${iOnHiveCore.baseUrl}/session/fetchTotalChargingSessionDetails';

  static final String fetchSessionHistoryDetails =
      '${iOnHiveCore.baseUrl}/session/fetchChargingSessionDetails';

  static final String downloadChargingSessionDetails =
      '${iOnHiveCore.baseUrl}/session/downloadChargingSessionDetails';

  static final String downloadinvoice =
      '${iOnHiveCore.baseUrl}/session/downloadInvoice';
}
