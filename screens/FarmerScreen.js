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

// FIXED: Use a configuration file or environment variable for the API URL
// Consider using a .env file with react-native-dotenv
const API_URL = "http://192.168.18.85:3001/api"; // Replace with your actual API URL

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
  const [modalVisible, setModalVisible] = useState(false);
  const [token, setToken] = useState("");

  // Form state for adding/editing products
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    location: "",
    latitude: "",
    longitude: "",
    category_id: "",
    item_id: null, // null for new products, populated for editing
  });
  const [photos, setPhotos] = useState([]);

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
      // FIXED: Log the API call
      logApiCall("GET", `${API_URL}/categories`);

      // FIXED: Make sure your route is correct - check if we need '/api' prefix
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

      // FIXED: More detailed error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
      } else {
        // Something happened in setting up the request
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

      // FIXED: Log the API call and verify the URL
      const url = `${API_URL}/items/farmer/products?category_id=${categoryId}`;
      logApiCall("GET", url);

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Products response:", response.data);

      if (response.data && response.data.data) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);

      // FIXED: More detailed error logging
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

  const handleAddProduct = () => {
    // Reset form data for new product
    setFormData({
      name: "",
      price: "",
      location: "",
      latitude: "",
      longitude: "",
      category_id: selectedCategory,
      item_id: null,
    });
    setPhotos([]);
    setModalVisible(true);
  };

  const handleEditProduct = (product) => {
    setFormData({
      name: product.name,
      price: product.price.amount.toString(),
      location: product.location.location || product.location.address,
      latitude: product.location.latitude?.toString() || "",
      longitude: product.location.longitude?.toString() || "",
      category_id: product.category_id,
      item_id: product.id,
    });
    // We can't set photos here because we only have URLs, not actual files
    setPhotos([]);
    setModalVisible(true);
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
              setLoading(true);

              // FIXED: Ensure the URL matches your backend route
              const url = `${API_URL}/items/farmer/product?item_id=${productId}`;
              logApiCall("DELETE", url);

              const response = await axios.delete(url, {
                headers: { Authorization: `Bearer ${token}` },
              });

              console.log("Delete response:", response.data);

              if (response.data && response.data.status === "200") {
                Alert.alert("Success", "Product deleted successfully");
                // Refresh products list
                fetchProducts(selectedCategory);
              }
            } catch (error) {
              console.error("Error deleting product:", error);

              // FIXED: Better error handling
              if (error.response) {
                console.error("Error response data:", error.response.data);
                console.error("Error response status:", error.response.status);
              }

              Alert.alert(
                "Error",
                "Failed to delete product. Please try again."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const pickImage = async () => {
    try {
      // FIXED: Update to use new MediaType API
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const newPhoto = result.assets[0];
        setPhotos([...photos, newPhoto]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.price || !formData.location) {
        Alert.alert("Error", "Please fill in all required fields");
        return;
      }

      setLoading(true);
      const formDataObj = new FormData();

      // Append text fields
      formDataObj.append("name", formData.name);
      formDataObj.append("price", formData.price);
      formDataObj.append("location", formData.location);
      formDataObj.append("category_id", formData.category_id);

      if (formData.latitude && formData.longitude) {
        formDataObj.append("latitude", formData.latitude);
        formDataObj.append("longitude", formData.longitude);
      }

      // For edit, include item_id
      if (formData.item_id) {
        formDataObj.append("item_id", formData.item_id);
      }

      // Append photos
      photos.forEach((photo, index) => {
        const localUri = photo.uri;
        const filename = localUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image";

        formDataObj.append("photos", {
          uri: localUri,
          name: filename,
          type,
        });
      });

      const currentToken = await AsyncStorage.getItem("token");
      console.log("Token for submission:", currentToken);

      let response;
      if (formData.item_id) {
        // Update existing product
        const url = `${API_URL}/items/farmer/product`;
        logApiCall("PUT", url, formDataObj);

        response = await axios.put(url, formDataObj, {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // Add new product
        const url = `${API_URL}/items/farmer/product`;
        logApiCall("POST", url, formDataObj);

        response = await axios.post(url, formDataObj, {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      console.log("Submit response:", response.data);

      if (
        response.data &&
        (response.data.status === "200" || response.data.status === "201")
      ) {
        Alert.alert(
          "Success",
          formData.item_id
            ? "Product updated successfully"
            : "Product added successfully"
        );
        setModalVisible(false);
        // Refresh products list
        fetchProducts(selectedCategory);
      }
    } catch (error) {
      console.error("Error submitting product:", error);

      // FIXED: Better error handling
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
        "Failed to save product. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const removePhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
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
    <View style={styles.productCard}>
      {item.photos && item.photos.length > 0 ? (
        <Image
          source={{ uri: item.photos[0] }}
          style={styles.productImage}
          resizeMode="cover"
          onError={(e) =>
            console.log("Product image error:", e.nativeEvent.error)
          }
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
        <Text style={styles.productDate}>Added: {item.created_at}</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditProduct(item)}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteProduct(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Farmer Dashboard</Text>
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

            {/* Product Form Modal */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      {formData.item_id ? "Edit Product" : "Add New Product"}
                    </Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.formContainer}>
                    {/* Product Name */}
                    <Text style={styles.inputLabel}>Product Name *</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.name}
                      onChangeText={(text) =>
                        setFormData({ ...formData, name: text })
                      }
                      placeholder="Enter product name"
                    />

                    {/* Price */}
                    <Text style={styles.inputLabel}>Price (PKR) *</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.price}
                      onChangeText={(text) =>
                        setFormData({ ...formData, price: text })
                      }
                      placeholder="Enter price"
                      keyboardType="numeric"
                    />

                    {/* Location */}
                    <Text style={styles.inputLabel}>Location *</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.location}
                      onChangeText={(text) =>
                        setFormData({ ...formData, location: text })
                      }
                      placeholder="Enter location"
                    />

                    {/* Coordinates (Optional) */}
                    <View style={styles.coordsContainer}>
                      <View style={styles.coordInput}>
                        <Text style={styles.inputLabel}>Latitude</Text>
                        <TextInput
                          style={styles.input}
                          value={formData.latitude}
                          onChangeText={(text) =>
                            setFormData({ ...formData, latitude: text })
                          }
                          placeholder="Latitude"
                          keyboardType="numeric"
                        />
                      </View>

                      <View style={styles.coordInput}>
                        <Text style={styles.inputLabel}>Longitude</Text>
                        <TextInput
                          style={styles.input}
                          value={formData.longitude}
                          onChangeText={(text) =>
                            setFormData({ ...formData, longitude: text })
                          }
                          placeholder="Longitude"
                          keyboardType="numeric"
                        />
                      </View>
                    </View>

                    {/* Category Selection */}
                    <Text style={styles.inputLabel}>Category</Text>
                    <View style={styles.categorySelector}>
                      {categories.map((category) => (
                        <TouchableOpacity
                          key={category.id}
                          style={[
                            styles.categorySelectorItem,
                            formData.category_id === category.id &&
                              styles.selectedCategorySelectorItem,
                          ]}
                          onPress={() =>
                            setFormData({
                              ...formData,
                              category_id: category.id,
                            })
                          }
                        >
                          <Text
                            style={[
                              styles.categorySelectorText,
                              formData.category_id === category.id &&
                                styles.selectedCategorySelectorText,
                            ]}
                          >
                            {category.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Photos */}
                    <Text style={styles.inputLabel}>Photos</Text>
                    <TouchableOpacity
                      style={styles.photoPickerButton}
                      onPress={pickImage}
                    >
                      <Ionicons name="camera-outline" size={24} color="#fff" />
                      <Text style={styles.photoPickerButtonText}>
                        Add Photo
                      </Text>
                    </TouchableOpacity>

                    {photos.length > 0 && (
                      <View style={styles.photosContainer}>
                        {photos.map((photo, index) => (
                          <View key={index} style={styles.photoItem}>
                            <Image
                              source={{ uri: photo.uri }}
                              style={styles.photoThumbnail}
                            />
                            <TouchableOpacity
                              style={styles.removePhotoButton}
                              onPress={() => removePhoto(index)}
                            >
                              <Ionicons
                                name="close-circle"
                                size={20}
                                color="#FF6B6B"
                              />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Submit Button */}
                    <TouchableOpacity
                      style={styles.submitButton}
                      onPress={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.submitButtonText}>
                          {formData.item_id ? "Update Product" : "Add Product"}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </View>
            </Modal>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Styles remain the same as in your original file
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
    height: 200,
  },
  noImageContainer: {
    width: "100%",
    height: 200,
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
  // Modal styles remain the same
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
    maxHeight: "90%",
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
  formContainer: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
    color: "#555",
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  coordsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  coordInput: {
    width: "48%",
  },
  categorySelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  categorySelectorItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedCategorySelectorItem: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  categorySelectorText: {
    color: "#333",
  },
  selectedCategorySelectorText: {
    color: "#fff",
  },
  photoPickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  photoPickerButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "500",
  },
  photosContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  photoItem: {
    width: 80,
    height: 80,
    marginRight: 8,
    marginBottom: 8,
    position: "relative",
  },
  photoThumbnail: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
  },
  removePhotoButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default FarmerScreen;
//////////////////////////////////////////////////////////////////////////////////////////////////////
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   FlatList,
//   Image,
//   TextInput,
//   Modal,
//   ScrollView,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import { Ionicons } from "@expo/vector-icons";
// import { useNavigation } from "@react-navigation/native";
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { SafeAreaView } from "react-native-safe-area-context";

// const API_URL = "http://192.168.18.85:3001/api"; // Replace with your actual API URL

// const FarmerScreen = () => {
//   const navigation = useNavigation();
//   const [categories, setCategories] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [token, setToken] = useState("");

//   // Form state for adding/editing products
//   const [formData, setFormData] = useState({
//     name: "",
//     price: "",
//     location: "",
//     latitude: "",
//     longitude: "",
//     category_id: "",
//     item_id: null, // null for new products, populated for editing
//   });
//   const [photos, setPhotos] = useState([]);
//   //////////MY CHANGES////////////////////////////////////////////////////////////////////
//   // Get token on component mount
//   useEffect(() => {
//     const getToken = async () => {
//       try {
//         const userToken = await AsyncStorage.getItem("token");
//         if (userToken) {
//           setToken(userToken);
//         } else {
//           // Redirect to login if no token
//           navigation.replace("Login");
//         }
//       } catch (error) {
//         console.error("Failed to get token", error);
//       }
//     };

//     getToken();
//   }, []);

//   // Fetch categories
//   useEffect(() => {
//     if (token) {
//       fetchCategories();
//     }
//   }, [token]);

//   // Fetch products when category changes
//   useEffect(() => {
//     if (selectedCategory && token) {
//       fetchProducts(selectedCategory);
//     }
//   }, [selectedCategory, token]);

//   const fetchCategories = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${API_URL}/categories`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (response.data && response.data.data) {
//         setCategories(response.data.data);
//         if (response.data.data.length > 0) {
//           setSelectedCategory(response.data.data[0].id);
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//       Alert.alert("Error", "Failed to load categories");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchProducts = async (categoryId) => {
//     try {
//       setLoading(true);
//       const response = await axios.get(
//         `${API_URL}/items/farmer/products?category_id=${categoryId}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (response.data && response.data.data) {
//         setProducts(response.data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching products:", error);
//       Alert.alert("Error", "Failed to load products");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddProduct = () => {
//     // Reset form data for new product
//     setFormData({
//       name: "",
//       price: "",
//       location: "",
//       latitude: "",
//       longitude: "",
//       category_id: selectedCategory,
//       item_id: null,
//     });
//     setPhotos([]);
//     setModalVisible(true);
//   };

//   const handleEditProduct = (product) => {
//     setFormData({
//       name: product.name,
//       price: product.price.amount.toString(),
//       location: product.location.location || product.location.address,
//       latitude: product.location.latitude?.toString() || "",
//       longitude: product.location.longitude?.toString() || "",
//       category_id: product.category_id,
//       item_id: product.id,
//     });
//     // We can't set photos here because we only have URLs, not actual files
//     setPhotos([]);
//     setModalVisible(true);
//   };

//   const handleDeleteProduct = async (productId) => {
//     Alert.alert(
//       "Confirm Delete",
//       "Are you sure you want to delete this product?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               setLoading(true);
//               const response = await axios.delete(
//                 `${API_URL}/items/farmer/product?item_id=${productId}`,
//                 { headers: { Authorization: `Bearer ${token}` } }
//               );

//               if (response.data && response.data.status === "200") {
//                 Alert.alert("Success", "Product deleted successfully");
//                 // Refresh products list
//                 fetchProducts(selectedCategory);
//               }
//             } catch (error) {
//               console.error("Error deleting product:", error);
//               Alert.alert("Error", "Failed to delete product");
//             } finally {
//               setLoading(false);
//             }
//           },
//         },
//       ]
//     );
//   };
//   ////////////////////////////////////////////////////////////////////

//   const pickImage = async () => {
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 1,
//       });

//       if (!result.canceled) {
//         const newPhoto = result.assets[0];
//         setPhotos([...photos, newPhoto]);
//       }
//     } catch (error) {
//       console.error("Error picking image:", error);
//       Alert.alert("Error", "Failed to pick image");
//     }
//   };

//   const handleSubmit = async () => {
//     try {
//       if (!formData.name || !formData.price || !formData.location) {
//         Alert.alert("Error", "Please fill in all required fields");
//         return;
//       }

//       setLoading(true);
//       const formDataObj = new FormData();

//       // Append text fields
//       formDataObj.append("name", formData.name);
//       formDataObj.append("price", formData.price);
//       formDataObj.append("location", formData.location);
//       formDataObj.append("category_id", formData.category_id);

//       if (formData.latitude && formData.longitude) {
//         formDataObj.append("latitude", formData.latitude);
//         formDataObj.append("longitude", formData.longitude);
//       }

//       // For edit, include item_id
//       if (formData.item_id) {
//         formDataObj.append("item_id", formData.item_id);
//       }

//       // Append photos
//       photos.forEach((photo, index) => {
//         const localUri = photo.uri;
//         const filename = localUri.split("/").pop();
//         const match = /\.(\w+)$/.exec(filename);
//         const type = match ? `image/${match[1]}` : "image";

//         formDataObj.append("photos", {
//           uri: localUri,
//           name: filename,
//           type,
//         });
//       });
//       const token = await AsyncStorage.getItem("token"); // Get the token from AsyncStorage
//       console.log("Token:", token); // Log the token for debugging
//       let response;
//       if (formData.item_id) {
//         // Update existing product
//         response = await axios.put(
//           `${API_URL}/items/farmer/product`,
//           formDataObj,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "multipart/form-data",
//             },
//           }
//         );
//       } else {
//         // Add new product
//         response = await axios.post(
//           `${API_URL}/items/farmer/product`,
//           formDataObj,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "multipart/form-data",
//             },
//           }
//         );
//       }

//       if (
//         response.data &&
//         (response.data.status === "200" || response.data.status === "201")
//       ) {
//         Alert.alert(
//           "Success",
//           formData.item_id
//             ? "Product updated successfully"
//             : "Product added successfully"
//         );
//         setModalVisible(false);
//         // Refresh products list
//         fetchProducts(selectedCategory);
//       }
//     } catch (error) {
//       console.error("Error submitting product:", error);
//       Alert.alert("Error", "Failed to save product");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const removePhoto = (index) => {
//     const newPhotos = [...photos];
//     newPhotos.splice(index, 1);
//     setPhotos(newPhotos);
//   };

//   const renderCategoryItem = ({ item }) => (
//     <TouchableOpacity
//       style={[
//         styles.categoryItem,
//         selectedCategory === item.id && styles.selectedCategory,
//       ]}
//       onPress={() => setSelectedCategory(item.id)}
//     >
//       <Image
//         source={{ uri: item.icon }}
//         style={styles.categoryIcon}
//         resizeMode="contain"
//       />
//       <Text
//         style={[
//           styles.categoryText,
//           selectedCategory === item.id && styles.selectedCategoryText,
//         ]}
//       >
//         {item.name}
//       </Text>
//     </TouchableOpacity>
//   );
//   // const renderCategoryItem = ({ item }) => (
//   //   <TouchableOpacity
//   //     style={[
//   //       styles.categoryItem,
//   //       selectedCategory === item.id && styles.selectedCategory,
//   //     ]}
//   //     onPress={() => setSelectedCategory(item.id)}
//   //   >
//   //     <Text
//   //       style={[
//   //         styles.categoryText,
//   //         selectedCategory === item.id && styles.selectedCategoryText,
//   //       ]}
//   //     >
//   //       {item.name}
//   //     </Text>
//   //   </TouchableOpacity>
//   // );

//   const renderProductItem = ({ item }) => (
//     <View style={styles.productCard}>
//       {item.photos && item.photos.length > 0 ? (
//         <Image
//           source={{ uri: item.photos[0] }}
//           style={styles.productImage}
//           resizeMode="cover"
//         />
//       ) : (
//         <View style={styles.noImageContainer}>
//           <Ionicons name="image-outline" size={50} color="#ccc" />
//         </View>
//       )}

//       <View style={styles.productInfo}>
//         <Text style={styles.productName}>{item.name}</Text>
//         <Text style={styles.productPrice}>Rs {item.price.amount}</Text>
//         <Text style={styles.productLocation}>
//           {item.location.location || item.location.address}
//         </Text>
//         <Text style={styles.productDate}>Added: {item.created_at}</Text>
//       </View>

//       <View style={styles.actionButtons}>
//         <TouchableOpacity
//           style={[styles.actionButton, styles.editButton]}
//           onPress={() => handleEditProduct(item)}
//         >
//           <Ionicons name="create-outline" size={20} color="#fff" />
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.actionButton, styles.deleteButton]}
//           onPress={() => handleDeleteProduct(item.id)}
//         >
//           <Ionicons name="trash-outline" size={20} color="#fff" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.container}>
//         <View style={styles.header}>
//           <Text style={styles.headerTitle}>Farmer Dashboard</Text>
//         </View>

//         {loading && !categories.length ? (
//           <ActivityIndicator
//             size="large"
//             color="#4CAF50"
//             style={styles.loader}
//           />
//         ) : (
//           <>
//             {/* Categories List */}
//             <View style={styles.categoriesContainer}>
//               <FlatList
//                 horizontal
//                 data={categories}
//                 renderItem={renderCategoryItem}
//                 keyExtractor={(item) => item.id.toString()}
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={styles.categoriesList}
//               />
//             </View>

//             {/* Add Product Button */}
//             <TouchableOpacity
//               style={styles.addButton}
//               onPress={handleAddProduct}
//             >
//               <Ionicons name="add" size={24} color="#fff" />
//               <Text style={styles.addButtonText}>Add New Product</Text>
//             </TouchableOpacity>

//             {/* Products List */}
//             {loading ? (
//               <ActivityIndicator
//                 size="large"
//                 color="#4CAF50"
//                 style={styles.loader}
//               />
//             ) : (
//               <FlatList
//                 data={products}
//                 renderItem={renderProductItem}
//                 keyExtractor={(item) => item.id.toString()}
//                 contentContainerStyle={styles.productsList}
//                 ListEmptyComponent={
//                   <View style={styles.emptyContainer}>
//                     <Ionicons name="leaf-outline" size={60} color="#ccc" />
//                     <Text style={styles.emptyText}>
//                       No products in this category
//                     </Text>
//                     <Text style={styles.emptySubtext}>
//                       Tap "Add New Product" to add your first product
//                     </Text>
//                   </View>
//                 }
//               />
//             )}

//             {/* Product Form Modal */}
//             <Modal
//               animationType="slide"
//               transparent={true}
//               visible={modalVisible}
//               onRequestClose={() => setModalVisible(false)}
//             >
//               <View style={styles.modalContainer}>
//                 <View style={styles.modalContent}>
//                   <View style={styles.modalHeader}>
//                     <Text style={styles.modalTitle}>
//                       {formData.item_id ? "Edit Product" : "Add New Product"}
//                     </Text>
//                     <TouchableOpacity onPress={() => setModalVisible(false)}>
//                       <Ionicons name="close" size={24} color="#333" />
//                     </TouchableOpacity>
//                   </View>

//                   <ScrollView style={styles.formContainer}>
//                     {/* Product Name */}
//                     <Text style={styles.inputLabel}>Product Name *</Text>
//                     <TextInput
//                       style={styles.input}
//                       value={formData.name}
//                       onChangeText={(text) =>
//                         setFormData({ ...formData, name: text })
//                       }
//                       placeholder="Enter product name"
//                     />

//                     {/* Price */}
//                     <Text style={styles.inputLabel}>Price (PKR) *</Text>
//                     <TextInput
//                       style={styles.input}
//                       value={formData.price}
//                       onChangeText={(text) =>
//                         setFormData({ ...formData, price: text })
//                       }
//                       placeholder="Enter price"
//                       keyboardType="numeric"
//                     />

//                     {/* Location */}
//                     <Text style={styles.inputLabel}>Location *</Text>
//                     <TextInput
//                       style={styles.input}
//                       value={formData.location}
//                       onChangeText={(text) =>
//                         setFormData({ ...formData, location: text })
//                       }
//                       placeholder="Enter location"
//                     />

//                     {/* Coordinates (Optional) */}
//                     <View style={styles.coordsContainer}>
//                       <View style={styles.coordInput}>
//                         <Text style={styles.inputLabel}>Latitude</Text>
//                         <TextInput
//                           style={styles.input}
//                           value={formData.latitude}
//                           onChangeText={(text) =>
//                             setFormData({ ...formData, latitude: text })
//                           }
//                           placeholder="Latitude"
//                           keyboardType="numeric"
//                         />
//                       </View>

//                       <View style={styles.coordInput}>
//                         <Text style={styles.inputLabel}>Longitude</Text>
//                         <TextInput
//                           style={styles.input}
//                           value={formData.longitude}
//                           onChangeText={(text) =>
//                             setFormData({ ...formData, longitude: text })
//                           }
//                           placeholder="Longitude"
//                           keyboardType="numeric"
//                         />
//                       </View>
//                     </View>

//                     {/* Category Selection */}
//                     <Text style={styles.inputLabel}>Category</Text>
//                     <View style={styles.categorySelector}>
//                       {categories.map((category) => (
//                         <TouchableOpacity
//                           key={category.id}
//                           style={[
//                             styles.categorySelectorItem,
//                             formData.category_id === category.id &&
//                               styles.selectedCategorySelectorItem,
//                           ]}
//                           onPress={() =>
//                             setFormData({
//                               ...formData,
//                               category_id: category.id,
//                             })
//                           }
//                         >
//                           <Text
//                             style={[
//                               styles.categorySelectorText,
//                               formData.category_id === category.id &&
//                                 styles.selectedCategorySelectorText,
//                             ]}
//                           >
//                             {category.name}
//                           </Text>
//                         </TouchableOpacity>
//                       ))}
//                     </View>

//                     {/* Photos */}
//                     <Text style={styles.inputLabel}>Photos</Text>
//                     <TouchableOpacity
//                       style={styles.photoPickerButton}
//                       onPress={pickImage}
//                     >
//                       <Ionicons name="camera-outline" size={24} color="#fff" />
//                       <Text style={styles.photoPickerButtonText}>
//                         Add Photo
//                       </Text>
//                     </TouchableOpacity>

//                     {photos.length > 0 && (
//                       <View style={styles.photosContainer}>
//                         {photos.map((photo, index) => (
//                           <View key={index} style={styles.photoItem}>
//                             <Image
//                               source={{ uri: photo.uri }}
//                               style={styles.photoThumbnail}
//                             />
//                             <TouchableOpacity
//                               style={styles.removePhotoButton}
//                               onPress={() => removePhoto(index)}
//                             >
//                               <Ionicons
//                                 name="close-circle"
//                                 size={20}
//                                 color="#FF6B6B"
//                               />
//                             </TouchableOpacity>
//                           </View>
//                         ))}
//                       </View>
//                     )}

//                     {/* Submit Button */}
//                     <TouchableOpacity
//                       style={styles.submitButton}
//                       onPress={handleSubmit}
//                       disabled={loading}
//                     >
//                       {loading ? (
//                         <ActivityIndicator size="small" color="#fff" />
//                       ) : (
//                         <Text style={styles.submitButtonText}>
//                           {formData.item_id ? "Update Product" : "Add Product"}
//                         </Text>
//                       )}
//                     </TouchableOpacity>
//                   </ScrollView>
//                 </View>
//               </View>
//             </Modal>
//           </>
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
//     backgroundColor: "#f5f5f5",
//   },
//   header: {
//     backgroundColor: "#4CAF50",
//     paddingVertical: 20,
//     paddingHorizontal: 16,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   headerTitle: {
//     color: "#fff",
//     fontSize: 20,
//     fontWeight: "bold",
//   },
//   loader: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   categoriesContainer: {
//     marginVertical: 10,
//   },
//   categoriesList: {
//     paddingHorizontal: 16,
//   },
//   categoryItem: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     marginRight: 10,
//     borderWidth: 1,
//     borderColor: "#e0e0e0",
//   },
//   selectedCategory: {
//     backgroundColor: "#4CAF50",
//     borderColor: "#4CAF50",
//   },
//   categoryIcon: {
//     width: 40,
//     height: 40,
//     marginBottom: 5,
//   },
//   categoryText: {
//     color: "#333",
//     fontWeight: "500",
//   },
//   selectedCategoryText: {
//     color: "#fff",
//   },
//   addButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#4CAF50",
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     margin: 16,
//     justifyContent: "center",
//   },
//   addButtonText: {
//     color: "#fff",
//     fontWeight: "bold",
//     marginLeft: 8,
//   },
//   productsList: {
//     padding: 16,
//   },
//   productCard: {
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     marginBottom: 16,
//     overflow: "hidden",
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   productImage: {
//     width: "100%",
//     height: 200,
//   },
//   noImageContainer: {
//     width: "100%",
//     height: 200,
//     backgroundColor: "#f0f0f0",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   productInfo: {
//     padding: 16,
//   },
//   productName: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 4,
//   },
//   productPrice: {
//     fontSize: 16,
//     color: "#4CAF50",
//     fontWeight: "bold",
//     marginBottom: 4,
//   },
//   productLocation: {
//     fontSize: 14,
//     color: "#666",
//     marginBottom: 4,
//   },
//   productDate: {
//     fontSize: 12,
//     color: "#999",
//   },
//   actionButtons: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     padding: 8,
//     borderTopWidth: 1,
//     borderTopColor: "#eee",
//   },
//   actionButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: "center",
//     alignItems: "center",
//     marginLeft: 8,
//   },
//   editButton: {
//     backgroundColor: "#2196F3",
//   },
//   deleteButton: {
//     backgroundColor: "#FF5722",
//   },
//   emptyContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 50,
//   },
//   emptyText: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#999",
//     marginTop: 16,
//   },
//   emptySubtext: {
//     fontSize: 14,
//     color: "#999",
//     marginTop: 8,
//     textAlign: "center",
//   },
//   // Modal styles
//   modalContainer: {
//     flex: 1,
//     justifyContent: "flex-end",
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//   },
//   modalContent: {
//     backgroundColor: "#fff",
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//     paddingBottom: 20,
//     maxHeight: "90%",
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   formContainer: {
//     padding: 16,
//   },
//   inputLabel: {
//     fontSize: 14,
//     fontWeight: "500",
//     marginBottom: 4,
//     color: "#555",
//   },
//   input: {
//     backgroundColor: "#f5f5f5",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: "#e0e0e0",
//   },
//   coordsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   coordInput: {
//     width: "48%",
//   },
//   categorySelector: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     marginBottom: 16,
//   },
//   categorySelectorItem: {
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 16,
//     marginRight: 8,
//     marginBottom: 8,
//     backgroundColor: "#f5f5f5",
//     borderWidth: 1,
//     borderColor: "#e0e0e0",
//   },
//   selectedCategorySelectorItem: {
//     backgroundColor: "#4CAF50",
//     borderColor: "#4CAF50",
//   },
//   categorySelectorText: {
//     color: "#333",
//   },
//   selectedCategorySelectorText: {
//     color: "#fff",
//   },
//   photoPickerButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#2196F3",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 16,
//   },
//   photoPickerButtonText: {
//     color: "#fff",
//     marginLeft: 8,
//     fontWeight: "500",
//   },
//   photosContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     marginBottom: 16,
//   },
//   photoItem: {
//     width: 80,
//     height: 80,
//     marginRight: 8,
//     marginBottom: 8,
//     position: "relative",
//   },
//   photoThumbnail: {
//     width: "100%",
//     height: "100%",
//     borderRadius: 4,
//   },
//   removePhotoButton: {
//     position: "absolute",
//     top: -8,
//     right: -8,
//     backgroundColor: "#fff",
//     borderRadius: 10,
//   },
//   submitButton: {
//     backgroundColor: "#4CAF50",
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 16,
//   },
//   submitButtonText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
// });

// export default FarmerScreen;
