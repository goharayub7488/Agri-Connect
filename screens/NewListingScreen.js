import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Predefined categories
const predefinedCategories = [
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

const NewListingScreen = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [images, setImages] = useState([]);
  const [businessInfo, setBusinessInfo] = useState(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  useEffect(() => {
    // Load business info when component mounts
    const loadBusinessInfo = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("userData");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setBusinessInfo(userData);
        }
      } catch (error) {
        console.error("Error loading business info:", error);
      }
    };

    loadBusinessInfo();
  }, []);

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow access to your photo library to add images."
      );
      return;
    }

    // Maximum of 5 images
    if (images.length >= 5) {
      Alert.alert(
        "Limit reached",
        "You can only add up to 5 images per listing."
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const selectCategory = (selectedCat) => {
    setCategory(selectedCat.id);
    setCategoryName(selectedCat.name);
    setCategoryModalVisible(false);
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryModalItem}
      onPress={() => selectCategory(item)}
    >
      <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={24} color="white" />
      </View>
      <Text style={styles.categoryModalText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const handleSubmit = async () => {
    // Validate form
    if (
      !title ||
      !description ||
      !price ||
      !location ||
      !category ||
      images.length === 0
    ) {
      Alert.alert(
        "Missing Information",
        "Please fill all fields and add at least one image."
      );
      return;
    }

    // Create new listing object
    const newListing = {
      id: Date.now().toString(),
      title,
      description,
      price: parseFloat(price),
      location,
      category: categoryName,
      categoryId: category,
      images,
      createdAt: new Date().toISOString(),
      businessInfo: businessInfo || { name: "Unknown Business" },
    };

    try {
      // Get existing listings from storage
      const existingListingsString = await AsyncStorage.getItem("listings");
      const existingListings = existingListingsString
        ? JSON.parse(existingListingsString)
        : [];

      // Add new listing
      const updatedListings = [newListing, ...existingListings];

      // Save updated listings
      await AsyncStorage.setItem("listings", JSON.stringify(updatedListings));

      // Navigate back to home screen
      Alert.alert("Success", "Your listing has been added successfully!", [
        { text: "OK", onPress: () => navigation.navigate("Home") },
      ]);
    } catch (error) {
      console.error("Error saving listing:", error);
      Alert.alert("Error", "Failed to save your listing. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create New Listing</Text>

      {/* Image Selection Section */}
      <View style={styles.imageSection}>
        <Text style={styles.label}>Product Images (up to 5)</Text>
        <View style={styles.imagePreviewContainer}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close-circle" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ))}

          {images.length < 5 && (
            <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
              <Ionicons name="add" size={40} color="#555" />
              <Text>Add Image</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Product title"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe your product"
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Price ($)</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="0.00"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="City, State"
      />

      <Text style={styles.label}>Category</Text>
      <TouchableOpacity
        style={styles.categorySelector}
        onPress={() => setCategoryModalVisible(true)}
      >
        {category ? (
          <View style={styles.selectedCategory}>
            {predefinedCategories.find((cat) => cat.id === category) && (
              <View
                style={[
                  styles.smallCategoryIcon,
                  {
                    backgroundColor: predefinedCategories.find(
                      (cat) => cat.id === category
                    ).color,
                  },
                ]}
              >
                <Ionicons
                  name={
                    predefinedCategories.find((cat) => cat.id === category).icon
                  }
                  size={16}
                  color="white"
                />
              </View>
            )}
            <Text style={styles.selectedCategoryText}>{categoryName}</Text>
          </View>
        ) : (
          <Text style={styles.categorySelectorPlaceholder}>
            Select a category
          </Text>
        )}
        <Ionicons name="chevron-down" size={20} color="#555" />
      </TouchableOpacity>

      {/* Category Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={categoryModalVisible}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <Ionicons name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={predefinedCategories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.categoryListContainer}
            />
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Add Listing</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  imageSection: {
    marginBottom: 20,
  },
  imagePreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    margin: 5,
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  addImageBtn: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
  },
  removeImageBtn: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "white",
    borderRadius: 15,
  },
  categorySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  categorySelectorPlaceholder: {
    color: "#999",
  },
  selectedCategory: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedCategoryText: {
    fontSize: 16,
    color: "#333",
  },
  smallCategoryIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  categoryListContainer: {
    paddingBottom: 20,
  },
  categoryModalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  categoryModalText: {
    fontSize: 16,
  },
});

export default NewListingScreen;
