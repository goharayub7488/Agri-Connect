// FarmerScreen.js - Fixed version

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import ProductCard from "../components/ProductCard";
import { handleLogout } from "../components/Logout";

// FIXED: Use a configuration file or environment variable for the API URL
// Consider using a .env file with react-native-dotenv
const API_URL = "http://192.168.18.85:3001/api"; // Replace with your actual API URL
console.log("📷 MediaType Enum:", ImagePicker.MediaType);
// Debug function to help troubleshoot API calls
const logApiCall = (method, url, data = null) => {
  console.log(`🚀 API ${method} request to: ${url}`);
  if (data) console.log("Request data:", JSON.stringify(data, null, 2));
};

const FarmerScreen = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

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
      const response = await axios.get(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.data) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      Alert.alert("Error", "Failed to load categories");
    }
  };

  const fetchProducts = async (categoryId) => {
    try {
      setLoading(true);
      const url = `${API_URL}/farmer/products?category_id=${categoryId}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.data) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      Alert.alert("Error", "Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    navigation.navigate("AddProduct", { categoryId: selectedCategory });
  };

  const handleEditProduct = (product) => {
    navigation.navigate("AddProduct", {
      product: product,
      categoryId: product.category_id,
    });
  };

  const handleDeleteProduct = async (productId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await axios.delete(
                `${API_URL}/farmer/product?item_id=${productId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              if (response.data && response.data.status === "200") {
                Alert.alert("Success", "Product deleted successfully");
                fetchProducts(selectedCategory);
              }
            } catch (error) {
              console.error("Error deleting product:", error);
              Alert.alert(
                "Error",
                "Failed to delete product. Please try again."
              );
            }
          },
        },
      ]
    );
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
    <ProductCard
      item={item}
      styles={styles}
      handleEditProduct={handleEditProduct}
      handleDeleteProduct={handleDeleteProduct}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Farmer Dashboard</Text>
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

            {/* Add Product Button */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddProduct}
            >
              <Ionicons name="add" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Add New Product</Text>
            </TouchableOpacity>

            {/* Products List */}
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
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="leaf-outline" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>
                      No products in this category
                    </Text>
                    <Text style={styles.emptySubtext}>
                      Tap "Add New Product" to add your first product
                    </Text>
                  </View>
                }
              />
            )}
          </>
        )}
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
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    margin: 16,
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  productsList: {
    padding: 16,
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

export default FarmerScreen;
