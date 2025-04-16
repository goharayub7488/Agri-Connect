import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";

const categories = [
  {
    id: "grains",
    name: "Grains",
    icon: "nutrition-outline",
    color: "#F8B951",
  },
  {
    id: "fruits",
    name: "Fruits",
    icon: "leaf-outline",
    color: "#E7625F",
  },
  {
    id: "vegetables",
    name: "Vegetables",
    icon: "flower-outline",
    color: "#55C2AC",
  },
  {
    id: "oilseeds",
    name: "Oilseeds",
    icon: "water-outline",
    color: "#9F5BCC",
  },
  {
    id: "milk-products",
    name: "Milk Products",
    icon: "cafe-outline",
    color: "#4A8FE7",
  },
];

const MainHomeScreen = ({ navigation }) => {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const isFocused = useIsFocused();

  // Load listings when screen is focused
  useEffect(() => {
    if (isFocused) {
      loadListings();
    }
  }, [isFocused]);

  // Filter listings based on selected category and search query
  useEffect(() => {
    let result = [...listings];

    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter(
        (item) =>
          item.categoryId === selectedCategory ||
          item.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredListings(result);
  }, [selectedCategory, searchQuery, listings]);

  const loadListings = async () => {
    try {
      const listingsData = await AsyncStorage.getItem("listings");
      if (listingsData) {
        const parsedListings = JSON.parse(listingsData);
        setListings(parsedListings);
        setFilteredListings(parsedListings);
      }
    } catch (error) {
      console.error("Error loading listings:", error);
    }
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.selectedCategoryItem,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <View
        style={[styles.categoryIconContainer, { backgroundColor: item.color }]}
      >
        <Ionicons name={item.icon} size={22} color="white" />
      </View>
      <Text
        style={[
          styles.categoryName,
          selectedCategory === item.id && styles.selectedCategoryName,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderListingItem = ({ item }) => {
    // Use the first image as the main display image
    const mainImage =
      item.images && item.images.length > 0 ? item.images[0] : null;

    return (
      <TouchableOpacity
        style={styles.listingCard}
        onPress={() => navigation.navigate("ListingDetails", { listing: item })}
      >
        {mainImage ? (
          <Image source={{ uri: mainImage }} style={styles.listingImage} />
        ) : (
          <View style={styles.noImageContainer}>
            <Ionicons name="image-outline" size={40} color="#aaa" />
          </View>
        )}

        <View style={styles.listingInfo}>
          <Text style={styles.listingTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.listingPrice}>${item.price.toFixed(2)}</Text>

          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.listingLocation} numberOfLines={1}>
              {item.location}
            </Text>
          </View>

          <View style={styles.businessInfoContainer}>
            <Ionicons name="business-outline" size={16} color="#666" />
            <Text style={styles.businessName} numberOfLines={1}>
              {item.businessInfo?.name || "Unknown Business"}
            </Text>
          </View>

          {item.images?.length > 1 && (
            <View style={styles.multipleImagesIndicator}>
              <Ionicons name="images-outline" size={16} color="#666" />
              <Text style={styles.imageCount}>{item.images.length} images</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Featured Banner - Using a colored View instead of an image */}
      <TouchableOpacity
        style={styles.bannerContainer}
        onPress={() => navigation.navigate("AllListings")}
      >
        <View style={styles.bannerOverlay}>
          <Ionicons name="leaf" size={40} color="white" />
          <Text style={styles.bannerTitle}>Featured Products</Text>
          <Text style={styles.bannerSubtitle}>
            Discover quality agricultural products
          </Text>
          <View style={styles.bannerButton}>
            <Text style={styles.bannerButtonText}>Browse Now</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* All Categories Button */}
      <View style={styles.allCategoriesContainer}>
        <TouchableOpacity
          style={[
            styles.allCategoriesButton,
            selectedCategory === "all" && styles.selectedAllCategories,
          ]}
          onPress={() => setSelectedCategory("all")}
        >
          <Ionicons
            name="grid-outline"
            size={20}
            color={selectedCategory === "all" ? "white" : "#555"}
          />
          <Text
            style={[
              styles.allCategoriesText,
              selectedCategory === "all" && styles.selectedAllCategoriesText,
            ]}
          >
            All Categories
          </Text>
        </TouchableOpacity>
      </View>

      {/* Categories Horizontal Scroll */}
      <FlatList
        horizontal
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      />

      <Text style={styles.sectionTitle}>
        {selectedCategory === "all"
          ? "All Products"
          : categories.find((cat) => cat.id === selectedCategory)?.name ||
            "Products"}
      </Text>
    </>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredListings}
        renderItem={renderListingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="list-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubText}>
              {selectedCategory !== "all"
                ? "Try a different category"
                : "Be the first to add a product!"}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    padding: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 16,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  clearButton: {
    padding: 5,
  },
  bannerContainer: {
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#2196F3", // Use a solid color instead of image
  },
  bannerOverlay: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 8,
  },
  bannerSubtitle: {
    color: "white",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  bannerButton: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "white",
  },
  bannerButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  allCategoriesContainer: {
    marginBottom: 10,
  },
  allCategoriesButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  selectedAllCategories: {
    backgroundColor: "#2196F3",
  },
  allCategoriesText: {
    marginLeft: 5,
    fontWeight: "500",
    color: "#555",
  },
  selectedAllCategoriesText: {
    color: "white",
  },
  categoryList: {
    paddingVertical: 10,
  },
  categoryItem: {
    alignItems: "center",
    marginRight: 16,
    width: 80,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  selectedCategoryItem: {
    opacity: 1,
  },
  categoryName: {
    fontSize: 12,
    textAlign: "center",
    color: "#555",
  },
  selectedCategoryName: {
    fontWeight: "bold",
    color: "#2196F3",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 12,
  },
  listingCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  listingImage: {
    width: 100,
    height: 100,
  },
  noImageContainer: {
    width: 100,
    height: 100,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  listingInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2196F3",
    marginBottom: 6,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  listingLocation: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  businessInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  businessName: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    marginLeft: 4,
  },
  multipleImagesIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageCount: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#999",
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
});

export default MainHomeScreen;

//////////////////////////////////////////////////////////////////////////

// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useIsFocused } from "@react-navigation/native";

// const HomeScreen = ({ navigation }) => {
//   const [listings, setListings] = useState([]);
//   const isFocused = useIsFocused();

//   // Load listings when screen is focused
//   useEffect(() => {
//     if (isFocused) {
//       loadListings();
//     }
//   }, [isFocused]);

//   const loadListings = async () => {
//     try {
//       const listingsData = await AsyncStorage.getItem("listings");
//       if (listingsData) {
//         setListings(JSON.parse(listingsData));
//       }
//     } catch (error) {
//       console.error("Error loading listings:", error);
//     }
//   };

//   const renderListingItem = ({ item }) => {
//     // Use the first image as the main display image
//     const mainImage =
//       item.images && item.images.length > 0 ? item.images[0] : null;

//     return (
//       <TouchableOpacity
//         style={styles.listingCard}
//         onPress={() => navigation.navigate("ListingDetails", { listing: item })}
//       >
//         {mainImage ? (
//           <Image source={{ uri: mainImage }} style={styles.listingImage} />
//         ) : (
//           <View style={styles.noImageContainer}>
//             <Ionicons name="image-outline" size={40} color="#aaa" />
//           </View>
//         )}

//         <View style={styles.listingInfo}>
//           <Text style={styles.listingTitle} numberOfLines={1}>
//             {item.title}
//           </Text>
//           <Text style={styles.listingPrice}>${item.price.toFixed(2)}</Text>

//           <View style={styles.locationContainer}>
//             <Ionicons name="location-outline" size={16} color="#666" />
//             <Text style={styles.listingLocation} numberOfLines={1}>
//               {item.location}
//             </Text>
//           </View>

//           <View style={styles.businessInfoContainer}>
//             <Ionicons name="business-outline" size={16} color="#666" />
//             <Text style={styles.businessName} numberOfLines={1}>
//               {item.businessInfo?.name || "Unknown Business"}
//             </Text>
//           </View>

//           {item.images?.length > 1 && (
//             <View style={styles.multipleImagesIndicator}>
//               <Ionicons name="images-outline" size={16} color="#666" />
//               <Text style={styles.imageCount}>{item.images.length} images</Text>
//             </View>
//           )}
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={listings}
//         renderItem={renderListingItem}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={styles.listContainer}
//         showsVerticalScrollIndicator={false}
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <Ionicons name="list-outline" size={60} color="#ccc" />
//             <Text style={styles.emptyText}>No listings available</Text>
//             <Text style={styles.emptySubText}>
//               Be the first to add a listing!
//             </Text>
//           </View>
//         }
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//   },
//   listContainer: {
//     padding: 12,
//   },
//   listingCard: {
//     flexDirection: "row",
//     backgroundColor: "white",
//     borderRadius: 12,
//     marginBottom: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//     overflow: "hidden",
//   },
//   listingImage: {
//     width: 100,
//     height: 100,
//   },
//   noImageContainer: {
//     width: 100,
//     height: 100,
//     backgroundColor: "#f0f0f0",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   listingInfo: {
//     flex: 1,
//     padding: 12,
//     justifyContent: "space-between",
//   },
//   listingTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginBottom: 4,
//   },
//   listingPrice: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#2196F3",
//     marginBottom: 6,
//   },
//   locationContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 4,
//   },
//   listingLocation: {
//     fontSize: 14,
//     color: "#666",
//     marginLeft: 4,
//   },
//   businessInfoContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 4,
//   },
//   businessName: {
//     fontSize: 14,
//     color: "#666",
//     fontWeight: "500",
//     marginLeft: 4,
//   },
//   multipleImagesIndicator: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   imageCount: {
//     fontSize: 12,
//     color: "#666",
//     marginLeft: 4,
//   },
//   emptyContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 40,
//   },
//   emptyText: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#999",
//     marginTop: 12,
//   },
//   emptySubText: {
//     fontSize: 14,
//     color: "#999",
//     marginTop: 8,
//   },
// });

// export default HomeScreen;
