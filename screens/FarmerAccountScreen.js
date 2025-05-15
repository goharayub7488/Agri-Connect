import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import ProductCard from "../components/ProductCard";
import { handleLogout } from "../components/Logout";
import { useFocusEffect } from "@react-navigation/native";

const API_URL = "http://192.168.120.83:3001/api";

const FarmerAccountScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const getTokenAndUser = async () => {
      try {
        const userToken = await AsyncStorage.getItem("token");
        const user = await AsyncStorage.getItem("user");
        if (userToken && user) {
          setToken(userToken);
          setUserId(JSON.parse(user).id);
        }
      } catch (error) {
        console.error("Failed to get token/user", error);
      }
    };
    getTokenAndUser();
  }, []);

  useEffect(() => {
    if (token) fetchCategories();
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      if (selectedCategory && token && userId) fetchProducts(selectedCategory);
    }, [selectedCategory, token, userId])
  );

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.data) {
        setCategories(response.data.data);
        if (response.data.data.length > 0)
          setSelectedCategory(response.data.data[0].id);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load categories");
    } finally {
      setLoading(false);
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
        // Filter products by userId if needed (if backend doesn't already do this)
        setProducts(response.data.data);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load products");
    } finally {
      setLoading(false);
    }
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
      {item.icon ? (
        <Image
          source={{ uri: item.icon }}
          style={styles.categoryIcon}
          resizeMode="contain"
        />
      ) : (
        <Ionicons
          name="pricetag"
          size={32}
          color="#ccc"
          style={styles.categoryIcon}
        />
      )}
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
      showActions={true}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Products</Text>
        <TouchableOpacity onPress={() => handleLogout(navigation)}>
          <Ionicons name="log-out-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesList}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.productsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="leaf-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No products in this category</Text>
              <Text style={styles.emptySubtext}>
                Tap "Add New Product" to add your first product
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#4CAF50",
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  categoriesList: { maxHeight: 100, paddingHorizontal: 26 },
  categoryItem: {
    alignItems: "center",
    marginRight: 16,
    marginTop: 24,
    marginBottom: 24,
  },
  selectedCategory: { borderColor: "#4CAF50", backgroundColor: "#E8F5E9" },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f5f5f5",
    marginBottom: 4,
    borderWidth: 2,
    borderColor: "#eee",
    overflow: "hidden",
  },
  categoryText: { fontSize: 12, color: "#666" },
  selectedCategoryText: { color: "#4CAF50", fontWeight: "bold" },
  productsList: { padding: 26, justifyContent: "center" },
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

export default FarmerAccountScreen;
