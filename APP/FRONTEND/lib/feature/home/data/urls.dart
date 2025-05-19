import 'package:ionhive/core/core.dart';

class HomeUrls {
  // API endpoint paths
  static final String fetchnearbystations =
      '${iOnHiveCore.baseUrl}/map/fetchNearbyStations';
  static final String fetchnearbystationsForGuest =
      '${iOnHiveCore.baseUrl}/map/fetchNearbyStationsForGuestUser';
  static final String fetchactivechargers =
      '${iOnHiveCore.baseUrl}/map/fetchActiveChargersOfUser';
}
