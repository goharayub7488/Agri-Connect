import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.18.85:3001/api";

const AddProduct = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    location: "",
    latitude: "",
    longitude: "",
    category_id: route.params?.categoryId || "",
    item_id: null,
  });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [token, setToken] = useState("");

  useEffect(() => {
    const getToken = async () => {
      try {
        const userToken = await AsyncStorage.getItem("token");
        if (userToken) {
          setToken(userToken);
          fetchCategories();
        } else {
          navigation.replace("Login");
        }
      } catch (error) {
        console.error("Failed to get token", error);
      }
    };

    getToken();
  }, []);

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

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setPhotos([...photos, result.assets[0]]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const removePhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.location) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("price", formData.price);
      formDataObj.append("location", formData.location);
      formDataObj.append("latitude", formData.latitude);
      formDataObj.append("longitude", formData.longitude);
      formDataObj.append("category_id", formData.category_id);

      // Append photos
      photos.forEach((photo, index) => {
        formDataObj.append("photos", {
          uri: photo.uri,
          type: "image/jpeg",
          name: `photo${index}.jpg`,
        });
      });

      let response;
      if (route.params?.product) {
        // Editing: send PUT with item_id
        formDataObj.append("item_id", route.params.product.id);
        response = await axios.put(`${API_URL}/farmer/product`, formDataObj, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // Adding: send POST
        response = await axios.post(`${API_URL}/farmer/product`, formDataObj, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (
        response.data &&
        (response.data.status === "201" || response.data.status === "200")
      ) {
        Alert.alert(
          "Success",
          route.params?.product
            ? "Product updated successfully"
            : "Product added successfully"
        );
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      Alert.alert("Error", "Failed to save product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          {/* Product Name */}
          <Text style={styles.inputLabel}>Product Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Enter product name"
          />

          {/* Price */}
          <Text style={styles.inputLabel}>Price (PKR) *</Text>
          <TextInput
            style={styles.input}
            value={formData.price}
            onChangeText={(text) => setFormData({ ...formData, price: text })}
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

          {/* Coordinates */}
          <View style={styles.coordinatesContainer}>
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
          <View style={styles.categoriesContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categorySelectorItem,
                  formData.category_id === category.id &&
                    styles.selectedCategorySelectorItem,
                ]}
                onPress={() =>
                  setFormData({ ...formData, category_id: category.id })
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

          {/* Photo Picker */}
          <Text style={styles.inputLabel}>Photos</Text>
          <TouchableOpacity
            style={styles.photoPickerButton}
            onPress={pickImage}
          >
            <Ionicons name="camera-outline" size={24} color="#fff" />
            <Text style={styles.photoPickerButtonText}>Add Photo</Text>
          </TouchableOpacity>

          {/* Photo Preview */}
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
                    <Ionicons name="close-circle" size={20} color="#FF6B6B" />
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
              <Text style={styles.submitButtonText}>Add Product</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  formContainer: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  coordinatesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  coordInput: {
    width: "48%",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  categorySelectorItem: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategorySelectorItem: {
    borderColor: "#4CAF50",
    backgroundColor: "#E8F5E9",
  },
  categorySelectorText: {
    color: "#666",
  },
  selectedCategorySelectorText: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  photoPickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  photoPickerButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
  },
  photosContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  photoItem: {
    width: 100,
    height: 100,
    margin: 4,
    position: "relative",
  },
  photoThumbnail: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removePhotoButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddProduct;
