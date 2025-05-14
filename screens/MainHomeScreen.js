// MainScreen.js - Consumer view of all products

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { handleLogout } from "../components/Logout";

// Use a configuration file or environment variable for the API URL
const API_URL = "http://192.168.18.85:3001/api"; // Replace with your actual API URL

// Debug function to help troubleshoot API calls
const logApiCall = (method, url, data = null) => {
  console.log(`🚀 API ${method} request to: ${url}`);
  if (data) console.log("Request data:", JSON.stringify(data, null, 2));
};

const MainScreen = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Get token on component mount
  useEffect(() => {
    const getToken = async () => {
      try {
        const userToken = await AsyncStorage.getItem("token");
        if (userToken) {
          setToken(userToken);
          console.log("Token retrieved successfully");
        } else {
          console.log("No token found, redirecting to login");
          navigation.replace("Login");
        }
      } catch (error) {
        console.error("Failed to get token", error);
      }
    };

    getToken();
  }, []);

  // Fetch categories
  useEffect(() => {
    if (token) {
      fetchCategories();
    }
  }, [token]);

  // Fetch products when category changes
  useEffect(() => {
    if (selectedCategory && token) {
      fetchProducts(selectedCategory);
    }
  }, [selectedCategory, token]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      logApiCall("GET", `${API_URL}/categories`);

      const response = await axios.get(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Categories response:", response.data);

      if (response.data && response.data.data) {
        setCategories(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedCategory(response.data.data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);

      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error message:", error.message);
      }

      Alert.alert(
        "Error",
        "Failed to load categories. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (categoryId) => {
    try {
      setLoading(true);

      // This endpoint should be different from the farmer endpoint - it should get ALL products
      const url = `${API_URL}/products?category_id=${categoryId}`;
      logApiCall("GET", url);

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Products response:", response.data);

      if (response.data && response.data.data) {
        const fetchedProducts = response.data.data;
        console.log("Fetched Products:", fetchedProducts);
        setProducts(fetchedProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);

      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error message:", error.message);
      }

      Alert.alert("Error", "Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setProductModalVisible(true);
  };

  const handleContactFarmer = (farmerId, farmerName) => {
    // Navigate to chat or contact screen with the farmer ID
    // This is a placeholder - implement based on your app's navigation structure
    Alert.alert(
      "Contact Farmer",
      `You are about to contact ${farmerName}. This feature will be implemented in future updates.`
    );

    // Example navigation:
    // navigation.navigate('Chat', { farmerId, farmerName });
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.selectedCategory,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Image
        source={{ uri: item.icon }}
        style={styles.categoryIcon}
        resizeMode="contain"
        onError={(e) =>
          console.log("Image loading error:", e.nativeEvent.error)
        }
      />
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.selectedCategoryText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleViewProduct(item)}
    >
      {item.photos && item.photos.length > 0 ? (
        <Image
          source={{ uri: item.photos[0] }}
          style={styles.productImage}
          resizeMode="cover"
          onError={(e) => console.log("Image error:", e.nativeEvent.error)}
        />
      ) : (
        <View style={styles.noImageContainer}>
          <Ionicons name="image-outline" size={50} color="#ccc" />
        </View>
      )}

      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>Rs {item.price.amount}</Text>
        <Text style={styles.productLocation}>
          {item.location.location || item.location.address}
        </Text>

        {/* Show farmer info */}
        {item.farmer && (
          <View style={styles.farmerInfo}>
            <Ionicons name="person-outline" size={14} color="#666" />
            <Text style={styles.farmerName}>{item.farmer.name}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const ProductDetailModal = () => {
    if (!selectedProduct) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={productModalVisible}
        onRequestClose={() => setProductModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
              <TouchableOpacity onPress={() => setProductModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollContent}>
              {/* Product Images */}
              {selectedProduct.photos && selectedProduct.photos.length > 0 ? (
                <View style={styles.imageCarousel}>
                  <FlatList
                    horizontal
                    data={selectedProduct.photos}
                    renderItem={({ item }) => (
                      <Image
                        source={{ uri: item }}
                        style={styles.carouselImage}
                        resizeMode="cover"
                      />
                    )}
                    keyExtractor={(item, index) => index.toString()}
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                  />
                </View>
              ) : (
                <View style={styles.noImageContainerModal}>
                  <Ionicons name="image-outline" size={80} color="#ccc" />
                </View>
              )}

              {/* Product Details */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Product Details</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Price:</Text>
                  <Text style={styles.detailValue}>
                    Rs {selectedProduct.price.amount}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Location:</Text>
                  <Text style={styles.detailValue}>
                    {selectedProduct.location.location ||
                      selectedProduct.location.address}
                  </Text>
                </View>
                {selectedProduct.created_at && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Listed on:</Text>
                    <Text style={styles.detailValue}>
                      {selectedProduct.created_at}
                    </Text>
                  </View>
                )}
              </View>

              {/* Farmer Info */}
              {selectedProduct.farmer && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Farmer Details</Text>
                  <View style={styles.farmerDetailCard}>
                    <View style={styles.farmerAvatarContainer}>
                      <Ionicons
                        name="person-circle-outline"
                        size={50}
                        color="#4CAF50"
                      />
                    </View>
                    <View style={styles.farmerDetails}>
                      <Text style={styles.farmerDetailName}>
                        {selectedProduct.farmer.name}
                      </Text>
                      {selectedProduct.farmer.phone && (
                        <Text style={styles.farmerDetailContact}>
                          {selectedProduct.farmer.phone}
                        </Text>
                      )}
                      {selectedProduct.farmer.email && (
                        <Text style={styles.farmerDetailContact}>
                          {selectedProduct.farmer.email}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Contact Button */}
            {selectedProduct.farmer && (
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => {
                  setProductModalVisible(false);
                  handleContactFarmer(
                    selectedProduct.farmer.id,
                    selectedProduct.farmer.name
                  );
                }}
              >
                <Ionicons name="chatbubble-outline" size={20} color="#fff" />
                <Text style={styles.contactButtonText}>Contact Farmer</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Farm Fresh</Text>
          <TouchableOpacity
            onPress={() => handleLogout(navigation)}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {loading && !categories.length ? (
          <ActivityIndicator
            size="large"
            color="#4CAF50"
            style={styles.loader}
          />
        ) : (
          <>
            {/* Categories List */}
            <View style={styles.categoriesContainer}>
              <FlatList
                horizontal
                data={categories}
                renderItem={renderCategoryItem}
                keyExtractor={(item) => item.id.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesList}
              />
            </View>

            {/* Products Grid */}
            {loading ? (
              <ActivityIndicator
                size="large"
                color="#4CAF50"
                style={styles.loader}
              />
            ) : (
              <FlatList
                data={products}
                renderItem={renderProductItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.productsList}
                numColumns={2}
                columnWrapperStyle={styles.productsRow}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="leaf-outline" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>
                      No products in this category
                    </Text>
                    <Text style={styles.emptySubtext}>
                      Check back later for new products
                    </Text>
                  </View>
                }
              />
            )}
          </>
        )}

        {/* Product Detail Modal */}
        <ProductDetailModal />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#4CAF50",
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  categoriesContainer: {
    marginVertical: 10,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedCategory: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  categoryIcon: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  categoryText: {
    color: "#333",
    fontWeight: "500",
  },
  selectedCategoryText: {
    color: "#fff",
  },
  productsList: {
    padding: 8,
  },
  productsRow: {
    justifyContent: "space-between",
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: "48%", // For 2 columns with spacing
  },
  productImage: {
    width: "100%",
    height: 120,
  },
  noImageContainer: {
    width: "100%",
    height: 120,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "bold",
    marginBottom: 4,
  },
  productLocation: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  farmerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  farmerName: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#999",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
    height: "90%", // Take up most of the screen
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalScrollContent: {
    flex: 1,
  },
  imageCarousel: {
    height: 250,
  },
  carouselImage: {
    width: 350, // Adjust based on your design
    height: 250,
  },
  noImageContainerModal: {
    height: 250,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  detailSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    width: 80,
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  farmerDetailCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
  },
  farmerAvatarContainer: {
    marginRight: 12,
  },
  farmerDetails: {
    flex: 1,
  },
  farmerDetailName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  farmerDetailContact: {
    fontSize: 14,
    color: "#666",
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
  },
});

export default MainScreen;
/////////////////////////////////////////////////////////////////////////
// // MainScreen.js
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { handleLogout } from "../components/Logout";
// import AgriTrendsCard from "../components/AgriTrendsCard";

// const MainScreen = ({ navigation }) => {
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [refreshing, setRefreshing] = useState(false);

//   const categories = [
//     "All",
//     "Vegetables",
//     "Fruits",
//     "Grains",
//     "Dairy",
//     "Other",
//   ];
//   const apiBaseUrl = "http://192.168.18.85:3001/api";
//   useEffect(() => {
//     fetchAllProducts();
//   }, []);

//   useEffect(() => {
//     filterProducts();
//   }, [searchQuery, selectedCategory, products]);

//   const fetchAllProducts = async () => {
//     try {
//       setLoading(true);
//       const token = await AsyncStorage.getItem("token");

//       if (!token) {
//         Alert.alert("Error", "You need to login first");
//         return;
//       }

//       const response = await axios.get(`${apiBaseUrl}/auth/login`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       setProducts(response.data);
//       setFilteredProducts(response.data);
//     } catch (error) {
//       console.error("Error fetching products:", error);
//       Alert.alert("Error", "Failed to load products");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRefresh = () => {
//     setRefreshing(true);
//     fetchAllProducts().then(() => setRefreshing(false));
//   };

//   const filterProducts = () => {
//     let filtered = products;

//     // Filter by search query
//     if (searchQuery) {
//       filtered = filtered.filter(
//         (product) =>
//           product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           product.description.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }

//     // Filter by category
//     if (selectedCategory !== "All") {
//       filtered = filtered.filter(
//         (product) =>
//           product.category.toLowerCase() === selectedCategory.toLowerCase()
//       );
//     }

//     setFilteredProducts(filtered);
//   };

//   const handleCategorySelect = (category) => {
//     setSelectedCategory(category);
//   };

//   const renderCategoryItem = ({ item }) => (
//     <TouchableOpacity
//       style={[
//         styles.categoryItem,
//         selectedCategory === item && styles.selectedCategoryItem,
//       ]}
//       onPress={() => handleCategorySelect(item)}
//     >
//       <Text
//         style={[
//           styles.categoryText,
//           selectedCategory === item && styles.selectedCategoryText,
//         ]}
//       >
//         {item}
//       </Text>
//     </TouchableOpacity>
//   );

//   const renderProduct = ({ item }) => (
//     <TouchableOpacity
//       style={styles.productCard}
//       onPress={() => navigation.navigate("ProductDetail", { product: item })}
//     >
//       <Image
//         source={{ uri: item.imageUrl || "https://via.placeholder.com/150" }}
//         style={styles.productImage}
//       />
//       <View style={styles.productInfo}>
//         <Text style={styles.productName}>{item.name}</Text>
//         <Text style={styles.productDescription} numberOfLines={2}>
//           {item.description}
//         </Text>
//         <View style={styles.productMetaContainer}>
//           <Text style={styles.productPrice}>₹{item.price}</Text>
//           <Text style={styles.productCategory}>{item.category}</Text>
//         </View>
//         <Text style={styles.farmerInfo}>
//           By {item.farmerName || "Local Farmer"}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.container}>
//         <View style={styles.header}>
//           <Text style={styles.headerTitle}>Agri-Connect</Text>
//           <TouchableOpacity
//             onPress={() => handleLogout(navigation)}
//             style={styles.logoutButton}
//           >
//             <Text style={styles.logoutText}>Logout</Text>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.searchContainer}>
//           <Ionicons
//             name="search"
//             size={20}
//             color="#757575"
//             style={styles.searchIcon}
//           />
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Search for products..."
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//           />
//         </View>

//         <View style={styles.categoriesContainer}>
//           <FlatList
//             data={categories}
//             renderItem={renderCategoryItem}
//             keyExtractor={(item) => item}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//           />
//         </View>
//         {/* <AgriTrendsCard /> */}
//         {loading ? (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color="#4CAF50" />
//           </View>
//         ) : (
//           <FlatList
//             data={filteredProducts}
//             renderItem={renderProduct}
//             keyExtractor={(item) => item._id}
//             contentContainerStyle={styles.productList}
//             refreshing={refreshing}
//             onRefresh={handleRefresh}
//             ListEmptyComponent={
//               <View style={styles.emptyContainer}>
//                 <Text style={styles.emptyText}>No products found</Text>
//               </View>
//             }
//           />
//         )}
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   container: {
//     flex: 1,
//     backgroundColor: "#F5F5F5",
//   },
//   header: {
//     backgroundColor: "#4CAF50",
//     paddingVertical: 20,
//     paddingHorizontal: 16,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   logoutButton: {
//     backgroundColor: "#4CAF50",
//     padding: 6,
//     borderRadius: 5,
//   },
//   logoutText: {
//     color: "#fff",
//     fontSize: 16,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#fff",
//   },
//   searchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     margin: 16,
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   searchIcon: {
//     marginRight: 8,
//   },
//   searchInput: {
//     flex: 1,
//     padding: 12,
//   },
//   categoriesContainer: {
//     marginBottom: 16,
//     paddingLeft: 16,
//   },
//   categoryItem: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     marginRight: 8,
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//   },
//   selectedCategoryItem: {
//     backgroundColor: "#4CAF50",
//     borderColor: "#4CAF50",
//   },
//   categoryText: {
//     color: "#333",
//   },
//   selectedCategoryText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   productList: {
//     padding: 16,
//   },
//   productCard: {
//     flexDirection: "row",
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     marginBottom: 16,
//     overflow: "hidden",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   productImage: {
//     width: 120,
//     height: 120,
//   },
//   productInfo: {
//     flex: 1,
//     padding: 12,
//   },
//   productName: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   productDescription: {
//     fontSize: 14,
//     color: "#757575",
//     marginTop: 4,
//   },
//   productMetaContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginTop: 8,
//   },
//   productPrice: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#4CAF50",
//   },
//   productCategory: {
//     fontSize: 12,
//     color: "#757575",
//     backgroundColor: "#F5F5F5",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 4,
//   },
//   farmerInfo: {
//     fontSize: 12,
//     color: "#757575",
//     marginTop: 8,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingVertical: 40,
//   },
//   emptyText: {
//     color: "#757575",
//     fontSize: 16,
//   },
// });

// export default MainScreen;
//////////////////////////////////////////////////////////////////////////////////////////////////////
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   Dimensions,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   Image,
//   FlatList,
//   TextInput,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useIsFocused } from "@react-navigation/native";
// import axios from "axios";

// const MainHomeScreen = ({ navigation }) => {
//   const [categories, setCategories] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState("all");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [activeIndices, setActiveIndices] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [userType, setUserType] = useState("consumer"); // Default to consumer
//   const [tokenData, setTokenData] = useState(null);

//   const isFocused = useIsFocused();
//   const screenWidth = Dimensions.get("window").width;
//   const cardWidth = screenWidth - 32;

//   const apiBaseUrl = "http://your-api-base-url.com"; // Replace with your API base URL

//   // Load user info and categories when screen is focused
//   useEffect(() => {
//     if (isFocused) {
//       loadUserInfo();
//       fetchCategories();
//     }
//   }, [isFocused]);

//   // Filter products based on selected category and search query
//   useEffect(() => {
//     if (!products.length) return;

//     let result = [...products];

//     // Apply category filter
//     if (selectedCategory !== "all") {
//       result = result.filter((item) => item.category_id === selectedCategory);
//     }

//     // Apply search filter
//     if (searchQuery) {
//       result = result.filter((item) =>
//         item.name.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }

//     setFilteredProducts(result);
//   }, [selectedCategory, searchQuery, products]);

//   const loadUserInfo = async () => {
//     try {
//       const userData = await AsyncStorage.getItem("user");
//       const token = await AsyncStorage.getItem("token");

//       if (userData && token) {
//         const user = JSON.parse(userData);
//         setUserType(user.userType);
//         setTokenData({ user, token });
//         // Fetch products based on user type
//         fetchProductsByUserType(user.userType, token);
//       } else {
//         // Handle not logged in state
//         navigation.replace("Login");
//       }
//     } catch (error) {
//       console.error("Error loading user info:", error);
//       Alert.alert("Error", "Unable to load user information");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchCategories = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");
//       const response = await axios.get(`${apiBaseUrl}/api/categories`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (response.data.status === "200") {
//         // Map the API response to include colors and icons
//         const categoriesWithUI = response.data.data.map((cat, index) => {
//           // Define a set of colors to cycle through
//           const colors = [
//             "#F8B951",
//             "#E7625F",
//             "#55C2AC",
//             "#9F5BCC",
//             "#4A8FE7",
//           ];
//           // Default icons to use (these should match what your API provides or have fallbacks)
//           const defaultIcons = [
//             "nutrition-outline",
//             "leaf-outline",
//             "flower-outline",
//             "water-outline",
//             "cafe-outline",
//             "basket-outline",
//           ];

//           return {
//             id: cat.id,
//             name: cat.name,
//             // Use icon from API or fallback to a default
//             icon: cat.icon || defaultIcons[index % defaultIcons.length],
//             color: colors[index % colors.length],
//           };
//         });

//         setCategories(categoriesWithUI);
//       } else {
//         console.error("Failed to fetch categories");
//       }
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//     }
//   };

//   const fetchProductsByUserType = async (userType, token) => {
//     try {
//       setLoading(true);
//       // Default to fetching all products (without category filter)
//       let endpoint =
//         userType === "business"
//           ? `${apiBaseUrl}/api/items/business`
//           : `${apiBaseUrl}/api/items/consumer`;

//       const response = await axios.get(endpoint, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (response.data.status === "200") {
//         setProducts(response.data.data);
//         setFilteredProducts(response.data.data);
//       } else {
//         console.error("Failed to fetch products");
//       }
//     } catch (error) {
//       console.error("Error fetching products:", error);
//       Alert.alert("Error", "Unable to load products");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchProductsByCategory = async (categoryId) => {
//     if (!tokenData) return;

//     try {
//       setLoading(true);
//       const { token, user } = tokenData;

//       // Determine endpoint based on user type
//       const endpoint =
//         user.userType === "business"
//           ? `${apiBaseUrl}/api/items/business?category_id=${categoryId}`
//           : `${apiBaseUrl}/api/items/consumer?category_id=${categoryId}`;

//       const response = await axios.get(endpoint, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (response.data.status === "200") {
//         setProducts(response.data.data);
//         setFilteredProducts(response.data.data);
//       } else {
//         console.error("Failed to fetch products by category");
//       }
//     } catch (error) {
//       console.error("Error fetching products by category:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCategoryChange = (categoryId) => {
//     setSelectedCategory(categoryId);

//     if (categoryId === "all") {
//       // Fetch all products
//       const { user, token } = tokenData;
//       fetchProductsByUserType(user.userType, token);
//     } else {
//       // Fetch products by category
//       fetchProductsByCategory(categoryId);
//     }
//   };

//   const handleScroll = (event, productId) => {
//     const slideSize = event.nativeEvent.layoutMeasurement.width;
//     const index = event.nativeEvent.contentOffset.x / slideSize;
//     const roundIndex = Math.round(index);

//     setActiveIndices((prev) => ({
//       ...prev,
//       [productId]: roundIndex,
//     }));
//   };

//   const renderCategoryItem = ({ item }) => (
//     <TouchableOpacity
//       style={[
//         styles.categoryItem,
//         selectedCategory === item.id && styles.selectedCategoryItem,
//       ]}
//       onPress={() => handleCategoryChange(item.id)}
//     >
//       <View
//         style={[styles.categoryIconContainer, { backgroundColor: item.color }]}
//       >
//         <Ionicons name={item.icon} size={22} color="white" />
//       </View>
//       <Text
//         style={[
//           styles.categoryName,
//           selectedCategory === item.id && styles.selectedCategoryName,
//         ]}
//       >
//         {item.name}
//       </Text>
//     </TouchableOpacity>
//   );

//   const renderProductItem = ({ item }) => {
//     // Process photos to create full URLs if needed
//     const photos =
//       item.photos?.map((photo) =>
//         photo.startsWith("http") ? photo : `${apiBaseUrl}/${photo}`
//       ) || [];

//     return (
//       <View style={styles.listingCard}>
//         {/* Image Section */}
//         <View style={styles.imageSection}>
//           {photos.length > 0 ? (
//             <FlatList
//               horizontal
//               pagingEnabled
//               showsHorizontalScrollIndicator={false}
//               data={photos}
//               keyExtractor={(_, index) => index.toString()}
//               onScroll={(e) => handleScroll(e, item.id)}
//               scrollEventThrottle={16}
//               renderItem={({ item: imageUri }) => (
//                 <View style={[styles.imageWrapper, { width: cardWidth }]}>
//                   <Image
//                     source={{ uri: imageUri }}
//                     style={[styles.listingImage, { width: cardWidth }]}
//                     resizeMode="cover"
//                   />
//                 </View>
//               )}
//               snapToInterval={cardWidth}
//               decelerationRate="fast"
//               bounces={false}
//             />
//           ) : (
//             <View style={[styles.noImageContainer, { width: cardWidth }]}>
//               <Ionicons name="image-outline" size={40} color="#aaa" />
//             </View>
//           )}
//           {/* Only show pagination dots if there are multiple images */}
//           {photos.length > 1 && (
//             <View style={styles.imagePagination}>
//               {photos.map((_, index) => (
//                 <View
//                   key={index}
//                   style={[
//                     styles.paginationDot,
//                     index === (activeIndices[item.id] || 0) && styles.activeDot,
//                   ]}
//                 />
//               ))}
//             </View>
//           )}
//         </View>

//         {/* Description Section */}
//         <View style={styles.descriptionSection}>
//           <View style={styles.titlePriceContainer}>
//             <Text style={styles.listingTitle} numberOfLines={1}>
//               {item.name}
//             </Text>
//             <Text style={styles.listingPrice}>
//               {item.price?.currency || "PKR"} {item.price?.amount?.toFixed(2)}
//             </Text>
//           </View>

//           <View style={styles.locationContainer}>
//             <Ionicons name="location-outline" size={16} color="#666" />
//             <Text style={styles.listingLocation} numberOfLines={1}>
//               {item.location?.address || "Location not specified"}
//             </Text>
//           </View>

//           <View style={styles.dateContainer}>
//             <Ionicons name="calendar-outline" size={16} color="#666" />
//             <Text style={styles.listingDate} numberOfLines={1}>
//               Added on {item.created_at || "Unknown date"}
//             </Text>
//           </View>
//         </View>
//       </View>
//     );
//   };

//   const renderHeader = () => (
//     <>
//       {/* Search Bar */}
//       <View style={styles.searchContainer}>
//         <Ionicons
//           name="search-outline"
//           size={20}
//           color="#999"
//           style={styles.searchIcon}
//         />
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search products..."
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//         />
//         {searchQuery ? (
//           <TouchableOpacity
//             onPress={() => setSearchQuery("")}
//             style={styles.clearButton}
//           >
//             <Ionicons name="close-circle" size={20} color="#999" />
//           </TouchableOpacity>
//         ) : null}
//       </View>

//       {/* All Categories Button */}
//       <View style={styles.allCategoriesContainer}>
//         <TouchableOpacity
//           style={[
//             styles.allCategoriesButton,
//             selectedCategory === "all" && styles.selectedAllCategories,
//           ]}
//           onPress={() => handleCategoryChange("all")}
//         >
//           <Ionicons
//             name="grid-outline"
//             size={20}
//             color={selectedCategory === "all" ? "white" : "#555"}
//           />
//           <Text
//             style={[
//               styles.allCategoriesText,
//               selectedCategory === "all" && styles.selectedAllCategoriesText,
//             ]}
//           >
//             All Categories
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Categories Horizontal Scroll */}
//       <FlatList
//         horizontal
//         data={categories}
//         renderItem={renderCategoryItem}
//         keyExtractor={(item) => item.id}
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={styles.categoryList}
//       />

//       <Text style={styles.sectionTitle}>
//         {selectedCategory === "all"
//           ? "All Products"
//           : categories.find((cat) => cat.id === selectedCategory)?.name ||
//             "Products"}
//       </Text>
//     </>
//   );

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#2196F3" />
//         <Text style={styles.loadingText}>Loading...</Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.container}>
//         <FlatList
//           data={filteredProducts}
//           renderItem={renderProductItem}
//           keyExtractor={(item) => item.id}
//           contentContainerStyle={styles.listContainer}
//           showsVerticalScrollIndicator={false}
//           ListHeaderComponent={renderHeader}
//           ListEmptyComponent={
//             <View style={styles.emptyContainer}>
//               <Ionicons name="list-outline" size={60} color="#ccc" />
//               <Text style={styles.emptyText}>No products found</Text>
//               <Text style={styles.emptySubText}>
//                 {selectedCategory !== "all"
//                   ? "Try a different category"
//                   : userType === "business"
//                   ? "Add your first product!"
//                   : "No products available yet"}
//               </Text>
//               {userType === "business" && (
//                 <TouchableOpacity
//                   style={styles.addButton}
//                   onPress={() => navigation.navigate("AddProduct")}
//                 >
//                   <Text style={styles.addButtonText}>Add Product</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           }
//         />
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f5f5f5",
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: "#666",
//   },
//   listContainer: {
//     padding: 12,
//   },
//   searchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "white",
//     borderRadius: 25,
//     paddingHorizontal: 15,
//     marginBottom: 16,
//     height: 50,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   searchIcon: {
//     marginRight: 10,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//     height: "100%",
//   },
//   clearButton: {
//     padding: 5,
//   },
//   allCategoriesContainer: {
//     marginBottom: 10,
//   },
//   allCategoriesButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#f0f0f0",
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//     alignSelf: "flex-start",
//   },
//   selectedAllCategories: {
//     backgroundColor: "#2196F3",
//   },
//   allCategoriesText: {
//     marginLeft: 5,
//     fontWeight: "500",
//     color: "#555",
//   },
//   selectedAllCategoriesText: {
//     color: "white",
//   },
//   categoryList: {
//     paddingVertical: 10,
//   },
//   categoryItem: {
//     alignItems: "center",
//     marginRight: 16,
//     width: 80,
//   },
//   categoryIconContainer: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   selectedCategoryItem: {
//     opacity: 1,
//   },
//   categoryName: {
//     fontSize: 12,
//     textAlign: "center",
//     color: "#555",
//   },
//   selectedCategoryName: {
//     fontWeight: "bold",
//     color: "#2196F3",
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginTop: 10,
//     marginBottom: 12,
//   },
//   listingCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//     overflow: "hidden",
//   },
//   imageSection: {
//     height: 200,
//     position: "relative",
//     backgroundColor: "#f5f5f5",
//     overflow: "hidden",
//   },
//   descriptionSection: {
//     padding: 12,
//     backgroundColor: "#fff",
//   },
//   imageWrapper: {
//     height: 200,
//   },
//   listingImage: {
//     height: "100%",
//     resizeMode: "cover",
//   },
//   noImageContainer: {
//     height: 200,
//     backgroundColor: "#f5f5f5",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   imagePagination: {
//     position: "absolute",
//     bottom: 8,
//     left: 0,
//     right: 0,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     paddingVertical: 4,
//   },
//   paginationDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: "rgba(255,255,255,0.5)",
//     marginHorizontal: 3,
//   },
//   activeDot: {
//     backgroundColor: "#fff",
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//   },
//   titlePriceContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   listingTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#333",
//     flex: 1,
//     marginRight: 8,
//   },
//   listingPrice: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#007BFF",
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
//     flex: 1,
//   },
//   dateContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   listingDate: {
//     fontSize: 14,
//     color: "#666",
//     marginLeft: 4,
//     flex: 1,
//   },
//   emptyContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 40,
//     marginTop: 20,
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
//     marginBottom: 16,
//   },
//   addButton: {
//     backgroundColor: "#2196F3",
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 25,
//     marginTop: 10,
//   },
//   addButtonText: {
//     color: "white",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
// });

// export default MainHomeScreen;
