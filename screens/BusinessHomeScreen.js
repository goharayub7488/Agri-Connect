import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Switch,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "../firebase"; // Make sure to add storage to your firebase.js

const BusinessProductScreen = ({ navigation }) => {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState(null);
  const [isRental, setIsRental] = useState(false);
  const [loading, setLoading] = useState(false);
  const [businessName, setBusinessName] = useState("");

  useEffect(() => {
    // Fetch business name from Firestore
    const fetchBusinessInfo = async () => {
      try {
        const userId = auth.currentUser.uid;
        const userRef = query(
          collection(db, "users"),
          where("userId", "==", userId)
        );
        const userSnapshot = await getDocs(userRef);

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setBusinessName(userData.businessName || "Your Farm");
        }
      } catch (error) {
        console.error("Error fetching business info:", error);
      }
    };

    fetchBusinessInfo();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const filename = `products/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}`;
    const storageRef = ref(storage, filename);

    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
  };

  const handleSubmit = async () => {
    if (!productName || !price || !image) {
      Alert.alert("Error", "Please fill all required fields and add an image");
      return;
    }

    setLoading(true);

    try {
      // Upload image first
      const imageUrl = await uploadImage(image);

      // Add product to Firestore
      await addDoc(collection(db, "products"), {
        name: productName,
        price: Number(price),
        description: description,
        imageUrl: imageUrl,
        type: isRental ? "equipment" : "produce",
        stock: isRental ? null : Number(stock),
        available: true,
        createdAt: new Date(),
        userId: auth.currentUser.uid,
        farmName: businessName,
        reviews: 0, // Initial values
        rating: 5, // Initial values
        specialOffer: false,
      });

      Alert.alert("Success", "Product added successfully!");

      // Reset form
      setProductName("");
      setPrice("");
      setDescription("");
      setStock("");
      setImage(null);
    } catch (error) {
      console.error("Error adding product:", error);
      Alert.alert("Error", "Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Product</Text>

      <TouchableOpacity style={styles.imageSelector} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.previewImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>+ Add Product Image</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Product Name*</Text>
      <TextInput
        style={styles.input}
        value={productName}
        onChangeText={setProductName}
        placeholder="Enter product name"
      />

      <Text style={styles.label}>Price (₹)*</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="Enter price"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter product description"
        multiline
        numberOfLines={4}
      />

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Is this equipment for rent?</Text>
        <Switch
          value={isRental}
          onValueChange={setIsRental}
          trackColor={{ false: "#767577", true: "#4CAF50" }}
        />
      </View>

      {!isRental && (
        <>
          <Text style={styles.label}>Stock Available</Text>
          <TextInput
            style={styles.input}
            value={stock}
            onChangeText={setStock}
            placeholder="Enter available quantity"
            keyboardType="numeric"
          />
        </>
      )}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Add Product</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  imageSelector: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  previewImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 200,
    height: 150,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
  },
  imagePlaceholderText: {
    color: "#888",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 15,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#28a745",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
});

export default BusinessProductScreen;
