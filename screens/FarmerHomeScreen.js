import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import ProductCard from "../components/ProductCard";
import { useFocusEffect } from "@react-navigation/native";

const API_URL = "http://192.168.120.83:3001/api";
// Check if there is a backend API version mismatch
console.log("API URL:", API_URL);

const FarmerHomeScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const getToken = async () => {
      try {
        const userToken = await AsyncStorage.getItem("token");
        if (userToken) {
          console.log("Token retrieved successfully");
          setToken(userToken);
        } else {
          console.log("No token found in AsyncStorage");
          Alert.alert("Authentication", "Please login to continue");
        }
      } catch (error) {
        console.error("Failed to get token", error);
      }
    };
    getToken();
  }, []);

  useEffect(() => {
    if (token) {
      fetchCategories();
      // Fetch all products initially
      fetchAllProducts();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      if (selectedCategory) {
        fetchProductsByCategory(selectedCategory);
      } else {
        fetchAllProducts();
      }
    }
  }, [selectedCategory, token]);

  useFocusEffect(
    useCallback(() => {
      if (token) {
        if (selectedCategory) {
          fetchProductsByCategory(selectedCategory);
        } else {
          fetchAllProducts();
        }
      }
    }, [selectedCategory, token])
  );

  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log("Fetching categories from:", `${API_URL}/categories`);
      const response = await axios.get(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Categories response:", response.data);

      if (response.data && response.data.data) {
        // Add "All Products" as the first category
        const allProductsCategory = {
          id: null,
          name: "All Products",
        };
        setCategories([allProductsCategory, ...response.data.data]);
        setSelectedCategory(null); // Set to null to show all products by default
      }
    } catch (error) {
      console.error(
        "Categories error:",
        error.response?.status,
        error.response?.data || error.message
      );
      Alert.alert(
        "Error",
        `Failed to load categories: ${error.response?.status || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };
  const fetchAllProducts = async () => {
    try {
      setLoading(true);

      // Load token from AsyncStorage
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("Token not found in AsyncStorage");
        return;
      }

      // Fetch from the universal endpoint
      console.log("Fetching all products from:", `${API_URL}/products`);
      const response = await axios.get(`${API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("All products response:", response.data);
      if (response.data && response.data.data) {
        setProducts(response.data.data);
      } else {
        console.warn("No products data found in response");
      }
    } catch (error) {
      console.error(
        "Failed to load products:",
        error.response?.data || error.message
      );
      Alert.alert("Error", `Failed to load products: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByCategory = async (categoryId) => {
    try {
      setLoading(true);
      console.log("Fetching products for category:", categoryId);

      // Try first with consumer endpoint
      try {
        const url = `${API_URL}/consumer/products?category_id=${categoryId}`;
        console.log("Fetching from:", url);
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Category products response:", response.data);
        if (response.data && response.data.data) {
          setProducts(response.data.data);
          return; // Success, exit early
        }
      } catch (consumerError) {
        console.error(
          "Consumer category error:",
          consumerError.response?.status,
          consumerError.response?.data || consumerError.message
        );
        // If failed, try with the farmer endpoint as fallback
        try {
          const fallbackUrl = `${API_URL}/farmer/products?category_id=${categoryId}`;
          console.log("Trying fallback:", fallbackUrl);
          const fallbackResponse = await axios.get(fallbackUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("Fallback category response:", fallbackResponse.data);
          if (fallbackResponse.data && fallbackResponse.data.data) {
            setProducts(fallbackResponse.data.data);
            return; // Success with fallback
          }
        } catch (farmerError) {
          console.error(
            "Farmer category error:",
            farmerError.response?.status,
            farmerError.response?.data || farmerError.message
          );
          throw consumerError; // Re-throw the original error
        }
      }
    } catch (error) {
      console.error(
        "Failed to load category products:",
        error.response?.status,
        error.response?.data || error.message
      );
      Alert.alert(
        "Error",
        `Failed to load products for category: ${
          error.response?.status || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Get category icon based on category name
  const getCategoryIcon = (category) => {
    if (!category.name)
      return <Ionicons name="apps-outline" size={14} color="#fff" />;

    const name = category.name.toLowerCase();

    if (name.includes("all products")) {
      return <Ionicons name="apps-outline" size={14} color="#fff" />;
    } else if (name.includes("grain")) {
      return <Ionicons name="water-outline" size={14} color="#fff" />;
    } else if (name.includes("fruit")) {
      return <Ionicons name="nutrition-outline" size={14} color="#fff" />;
    } else if (name.includes("vegetable")) {
      return <Ionicons name="flower-outline" size={14} color="#fff" />;
    } else if (name.includes("milk products") || name.includes("seed")) {
      return <Ionicons name="water-outline" size={14} color="#fff" />;
    } else {
      return <Ionicons name="pricetag-outline" size={14} color="#fff" />;
    }
  };

  const getCategoryColor = (category) => {
    if (!category.name) return "#64B5F6";

    const name = category.name.toLowerCase();

    if (name.includes("all products")) {
      return "#4CAF50"; // Green for All Products
    } else if (name.includes("grain")) {
      return "#FAC05E"; // Yellow for grains
    } else if (name.includes("fruit")) {
      return "#EA6A61"; // Red for fruits
    } else if (name.includes("vegetable")) {
      return "#5DC7A7"; // Green for vegetables
    } else if (name.includes("oil") || name.includes("seed")) {
      return "#9B7ADB"; // Purple for oilseeds
    } else {
      return "#64B5F6"; // Blue for others
    }
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        { backgroundColor: getCategoryColor(item) },
        selectedCategory === item.id && styles.selectedCategory,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <View style={styles.categoryIconContainer}>{getCategoryIcon(item)}</View>
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("ProductDetail", { product: item })}
    >
      <ProductCard item={item} styles={styles} showActions={false} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Marketplace</Text>
      </View>
      <FlatList
        horizontal
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => (item.id ? item.id.toString() : "all")}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) =>
            item.id ? item.id.toString() : Math.random().toString()
          }
          contentContainerStyle={styles.productsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="leaf-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubtext}>
                Check back later for available products!
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#4CAF50",
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  categoriesList: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 24,
    marginBottom: 8,
  },
  categoryItem: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 20,
    borderRadius: 100,
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  categoryIconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  selectedCategory: {
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  categoryText: {
    fontSize: 12,
    color: "#fff",
    marginTop: 6,
  },
  productsList: { padding: 16 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#999",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
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
  },
  productImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
  noImageContainer: {
    width: "100%",
    height: 150,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "bold",
    marginBottom: 4,
  },
  productLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  productDate: {
    fontSize: 12,
    color: "#999",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: "#2196F3",
  },
  deleteButton: {
    backgroundColor: "#FF5722",
  },
});

export default FarmerHomeScreen;
