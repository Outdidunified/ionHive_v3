import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/Chargingpage/domain/repositories/Chargingpage_repositories.dart';
import 'package:ionhive/feature/landing_page.dart';

class ChargingPageController extends GetxController {
  final Chargingpagerepo _repo = Chargingpagerepo();
  var isLoading = false.obs;
  final sessionController = Get.find<SessionController>();

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
      Get.off(() => LandingPage()); // Changed to off() to remove current route
    } catch (e) {
      isLoading(false);
      Get.snackbar('Error', 'Failed to end charging session: $e');
      rethrow;
    }
  }
}