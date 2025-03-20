import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/feature/more/presentation/pages/banner_image/presentation/controllers/image_controller.dart';
import 'package:flutter_swiper_null_safety/flutter_swiper_null_safety.dart';
import 'package:url_launcher/url_launcher.dart';

class BannerImage extends StatelessWidget {
  BannerImage({super.key});

  final BannerController controller = Get.put(BannerController());

  void _launchURL() async {
    const url = 'https://www.ionhive.in/';
    if (await canLaunch(url)) {
      await launch(url);
    } else {
      throw 'Could not launch $url';
    }
  }

  @override
  Widget build(BuildContext context) {
    final double screenWidth = MediaQuery.of(context).size.width;
    final double screenHeight = MediaQuery.of(context).size.height;

    return Scaffold(
      body: Column(
        children: [
          SizedBox(
            height: screenHeight * 0.2,
            width: screenWidth,
            child: Stack(
              children: [
                Swiper(
                  controller: controller.swiperController,
                  itemBuilder: (BuildContext context, int index) {
                    return ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.asset(
                        controller.imageList[index],
                        width: screenWidth,
                        fit: BoxFit.cover,
                      ),
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
                  top: 10,
                  left: 10,
                  child: ElevatedButton(
                    onPressed: _launchURL,
                    style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF001F3F),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: const Text('Explore'),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
        ],
      ),
    );
  }
}
