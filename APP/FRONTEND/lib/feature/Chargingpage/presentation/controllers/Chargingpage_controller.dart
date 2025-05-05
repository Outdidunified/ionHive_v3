import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/Chargingpage/domain/models/Chargingpage_model.dart';
import 'package:ionhive/feature/Chargingpage/domain/repositories/Chargingpage_repositories.dart';
import 'package:ionhive/feature/landing_page.dart';

class ChargingPageController extends GetxController {
  final Chargingpagerepo _repo = Chargingpagerepo();
  var isLoading = false.obs;
  var chargingData = Rx<ChargerStatusData?>(null); // Changed to ChargerStatusData
  final sessionController = Get.find<SessionController>();

  late final String chargerId;
  late final int connectorId;
  late final int connectorType;

  @override
  void onInit() {
    super.onInit();
    fetchLastStatusData();
  }

  Future<void> fetchLastStatusData() async {
    try {
      isLoading(true);
      final authToken = sessionController.token.value;
      final userId = sessionController.userId.value;
      final emailId = sessionController.emailId.value;

      final response = await _repo.fetchlastdata(
        userId,
        emailId,
        authToken,
        connectorId,
        chargerId,
        connectorType,
      );

      chargingData.value = response.data; // Now this should work
      isLoading(false);
    } catch (e) {
      isLoading(false);
      Get.snackbar('Error', 'Failed to fetch charging data: $e');
      rethrow;
    }
  }

  Future<void> endChargingSession({
    required int connectorId,
    required String chargerId,
  }) async {
    try {
      isLoading(true);
      final authToken = sessionController.token.value;
      final userId = sessionController.userId.value;
      final emailId = sessionController.emailId.value;

      await _repo.endchargingsession(
        userId,
        emailId,
        authToken,
        connectorId,
        chargerId,
      );
      isLoading(false);
      Get.off(() => LandingPage());
    } catch (e) {
      isLoading(false);
      Get.snackbar('Error', 'Failed to end charging session: $e');
      rethrow;
    }
  }
}