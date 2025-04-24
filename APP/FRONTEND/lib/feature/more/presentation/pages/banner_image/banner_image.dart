import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/feature/more/presentation/pages/banner_image/presentation/controllers/image_controller.dart';
import 'package:flutter_swiper_null_safety/flutter_swiper_null_safety.dart';
import 'package:ionhive/utils/responsive/responsive.dart';
import 'package:url_launcher/url_launcher.dart';

class BannerImage extends StatelessWidget {
  BannerImage({super.key});

  final BannerController controller = Get.put(BannerController());

  void _launchURL() async {
    const url = 'https://www.ionhive.in/';
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url));
    } else {
      throw 'Could not launch $url';
    }
  }

  @override
  Widget build(BuildContext context) {
    Theme.of(context);
    final bool isSmallScreen = context.screenWidth < 375;
    final bool isLargeScreen = context.screenWidth > 600;

    // Use the full height provided by the parent SizedBox
    final double bannerHeight =
        context.rHeight(isLargeScreen ? 140 : (isSmallScreen ? 100 : 120));

    return ClipRRect(
      borderRadius: BorderRadius.circular(context.rRadius(12)),
      child: SizedBox(
        height: bannerHeight, // Match the parent height to avoid overflow
        width: double.infinity,
        child: Stack(
          children: [
            Swiper(
              controller: controller.swiperController,
              itemBuilder: (BuildContext context, int index) {
                return Image.asset(
                  controller.imageList[index],
                  width: double.infinity,
                  height: bannerHeight,
                  fit: BoxFit.cover,
                );
              },
              itemCount: controller.imageList.length,
              autoplay: true,
              autoplayDelay: 3000,
              onIndexChanged: (index) => controller.updateIndex(index),
              pagination: const SwiperPagination(
                builder: DotSwiperPaginationBuilder(
                  activeColor: Colors.black,
                  color: Colors.grey,
                ),
              ),
            ),
            Positioned(
              top: context
                  .rHeight(isLargeScreen ? 12 : (isSmallScreen ? 8 : 10)),
              left:
                  context.rWidth(isLargeScreen ? 12 : (isSmallScreen ? 8 : 10)),
              child: ElevatedButton(
                onPressed: _launchURL,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF001F3F),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(context.rRadius(8)),
                  ),
                  padding: EdgeInsets.symmetric(
                    horizontal: context
                        .rWidth(isLargeScreen ? 16 : (isSmallScreen ? 8 : 12)),
                    vertical: context
                        .rHeight(isLargeScreen ? 10 : (isSmallScreen ? 6 : 8)),
                  ),
                ),
                child: Text(
                  'Explore',
                  style: TextStyle(
                    fontSize: context.rFontSize(
                        isLargeScreen ? 16 : (isSmallScreen ? 12 : 14)),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
