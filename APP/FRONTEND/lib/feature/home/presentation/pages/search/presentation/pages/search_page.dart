import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/feature/home/presentation/pages/search/presentation/controllers/search_controllers.dart';
import 'package:ionhive/utils/widgets/loading/loading_overlay.dart';

class SearchPage extends StatelessWidget {
  SearchPage({super.key});

  final SearchpageController controller = Get.put(SearchpageController());
  final TextEditingController textEditingController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Clear search when page builds (handles back navigation)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // Always clear the text field and search query when the page is shown
      textEditingController.clear();
      controller.clearSearchQuery();
    });

    return WillPopScope(
      onWillPop: () async {
        // Clear search query when navigating back
        controller.clearSearchQuery();
        // Clear text editing controller
        textEditingController.clear();
        return true; // Allow navigation
      },
      child: Obx(
        () => LoadingOverlay(
          isLoading: controller.isLoading.value,
          opacity: 0.7,
          child: Scaffold(
            appBar: AppBar(elevation: 0),
            body: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 16),
                  _buildToggleButtons(context, isDark),
                  const SizedBox(height: 16),
                  _buildSearchInput(context, isDark, colorScheme),
                  if (!controller.isChargerId.value &&
                      controller.suggestedLocations.isNotEmpty &&
                      controller.searchQuery.value.isNotEmpty)
                    _buildSuggestedLocations(context),
                  if (controller.searchQuery.value.isEmpty) ...[
                    const SizedBox(height: 24),
                    _buildRecentSearchesHeader(context),
                    const SizedBox(height: 8),
                    _buildRecentSearchesList(context, isDark),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  // --- Helper Widgets ---

  Widget _buildToggleButtons(BuildContext context, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        height: 50,
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            _toggleButton(
              context,
              title: "Search by Charger ID",
              selected: controller.isChargerId.value,
              onTap: () {
                controller.toggleSearchType(true);
                controller.updateSearch('');
                textEditingController.clear();
              },
            ),
            _toggleButton(
              context,
              title: "Search by Location",
              selected: !controller.isChargerId.value,
              onTap: () {
                controller.toggleSearchType(false);
                controller.updateSearch('');
                textEditingController.clear();
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchInput(
      BuildContext context, bool isDark, ColorScheme colorScheme) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: textEditingController,
                  onChanged: (val) {
                    controller.updateSearch(val);
                    if (!controller.isChargerId.value) {
                      controller.updateSuggestions(val);
                    }
                  },
                  decoration: InputDecoration(
                    hintText: controller.isChargerId.value
                        ? 'Enter charger ID...'
                        : 'Enter location name...',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: controller.searchQuery.value.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              controller.updateSearch('');
                              textEditingController.clear();
                              FocusScope.of(context).unfocus();
                            },
                          )
                        : null,
                    border: _outlineBorder(context, isDark, colorScheme),
                    enabledBorder: _outlineBorder(context, isDark, colorScheme),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide:
                          BorderSide(color: colorScheme.primary, width: 2),
                    ),
                    filled: true,
                    fillColor: isDark ? Colors.grey[800] : Colors.grey[50],
                    contentPadding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  onSubmitted: (_) => controller.performSearch(),
                ),
              ),
              if (!controller.isChargerId.value) ...[
                const SizedBox(width: 8),
                _locationButton(context, isDark),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSuggestedLocations(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(top: 8),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
          ),
        ],
      ),
      child: ListView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: controller.suggestedLocations.length,
        itemBuilder: (context, index) {
          final suggestion = controller.suggestedLocations[index];
          return ListTile(
            title: Text(suggestion),
            leading: const Icon(Icons.place_outlined),
            onTap: () {
              controller.updateSearch(suggestion);
              textEditingController.text = suggestion;
              controller.performSearch();
            },
          );
        },
      ),
    );
  }

  Widget _buildRecentSearchesHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            controller.isChargerId.value
                ? 'Recent Charger ID Searches'
                : 'Recent Location Searches',
            style: Theme.of(context).textTheme.titleSmall!.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          TextButton(
            onPressed: () => controller.clearRecentSearches(),
            child: Text(
              'Clear All',
              style: TextStyle(
                color: Theme.of(context).colorScheme.primary,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentSearchesList(BuildContext context, bool isDark) {
    final list = controller.isChargerId.value
        ? controller.recentChargerSearches
        : controller.recentLocationSearches;

    if (list.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 24),
        child: Center(
          child: Column(
            children: [
              Image.asset(
                controller.isChargerId.value
                    ? 'assets/icons/saved_device.png'
                    : 'assets/icons/distance.png',
                width: 48,
                height: 48,
                color: Colors.grey[400],
              ),
              const SizedBox(height: 16),
              Text(
                controller.isChargerId.value
                    ? 'No recent charger ID searches'
                    : 'No recent location searches',
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
          ),
        ],
      ),
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: list.length,
        separatorBuilder: (context, index) => Divider(
          height: 1,
          indent: 56,
          color: Colors.grey.withOpacity(0.2),
        ),
        itemBuilder: (context, index) {
          final search = list[index];
          final bool isCurrentLocation =
              search.toLowerCase() == 'current location';

          return ListTile(
            leading: controller.isChargerId.value
                ? Image.asset(
                    'assets/icons/saved_device.png',
                    width: 24,
                    height: 24,
                    color: Theme.of(context).primaryColor,
                  )
                : (isCurrentLocation
                    ? Icon(
                        Icons.my_location,
                        color: Theme.of(context).primaryColor,
                      )
                    : Image.asset(
                        'assets/icons/distance.png',
                        width: 24,
                        height: 24,
                        color: Theme.of(context).primaryColor,
                      )),
            title: Text(
              search,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
            trailing: IconButton(
              icon: const Icon(Icons.close, size: 16),
              onPressed: () => controller.removeFromRecentSearches(search),
            ),
            onTap: () {
              textEditingController.text = search;
              controller.updateSearch(search);
              controller.performSearch();
            },
          );
        },
      ),
    );
  }

  // --- UI Components ---

  Widget _toggleButton(
    BuildContext context, {
    required String title,
    required bool selected,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
            color: selected
                ? Theme.of(context).colorScheme.primary
                : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
          ),
          alignment: Alignment.center,
          child: Text(
            title,
            style: Theme.of(context).textTheme.titleSmall!.copyWith(
                  color: selected
                      ? Colors.white
                      : Theme.of(context).colorScheme.onSurface,
                  fontWeight: FontWeight.bold,
                ),
          ),
        ),
      ),
    );
  }

  Widget _locationButton(BuildContext context, bool isDark) {
    return Container(
      height: 50,
      width: 50,
      decoration: BoxDecoration(
        color: isDark
            ? Colors.green[800]
            : const Color.fromARGB(255, 185, 227, 185),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.3 : 0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: IconButton(
        icon: Icon(
          Icons.my_location,
          size: 24,
          color: isDark
              ? const Color.fromARGB(255, 185, 227, 185)
              : Colors.green[800],
        ),
        onPressed: () async {
          controller.isLoading.value = true;
          try {
            await controller.updateSearchWithCurrentLocation();
            textEditingController.text = controller.searchQuery.value;
          } finally {
            controller.isLoading.value = false;
          }
        },
      ),
    );
  }

  OutlineInputBorder _outlineBorder(
      BuildContext context, bool isDark, ColorScheme colorScheme) {
    return OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide:
          BorderSide(color: isDark ? Colors.grey[700]! : Colors.grey[300]!),
    );
  }
}
