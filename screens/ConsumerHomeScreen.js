import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Ionicons } from "@expo/vector-icons"; // Or whichever icon library you're using

const HomeScreen = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Get current user
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Fetch user details
      // ...
      setUser({
        name: "Mr. Ramesh", // You'll want to get this from Firestore
        photoURL: "https://example.com/user-photo.jpg", // Example placeholder
      });
    }

    // Fetch products from Firestore
    const fetchProducts = async () => {
      const productsCollection = collection(db, "products");
      const productsSnapshot = await getDocs(productsCollection);
      const productsList = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsList);
    };

    fetchProducts();
  }, []);

  const renderProductCard = (product, index) => {
    const isRental = product.type === "equipment";

    return (
      <View key={index} style={styles.productCard}>
        <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
        <Text style={styles.farmName}>
          {product.farmName}{" "}
          <Ionicons name="checkmark-circle" size={14} color="green" />
        </Text>
        <Text style={styles.productName}>{product.name}</Text>
        <View style={styles.ratingContainer}>
          {/* Rating stars */}
          <Text style={styles.reviewCount}>({product.reviews})</Text>
        </View>
        <View style={styles.availabilityRow}>
          <Text style={styles.availabilityText}>
            {isRental ? "Available" : "In Stock"}
          </Text>
          <Text style={styles.price}>₹{product.price}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: isRental ? "#28a745" : "#28a745" },
          ]}
        >
          <Text style={styles.actionButtonText}>
            {isRental ? "Rent Now" : "Add Cart"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (!user)
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={{ uri: user.photoURL }} style={styles.userPhoto} />
          <View>
            <Text style={styles.welcomeText}>Welcome</Text>
            <Text style={styles.userName}>{user.name}</Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="chatbubble-outline" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="cart-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchBar}>
        <TextInput placeholder="Search" style={styles.searchInput} />
        <Ionicons
          name="search"
          size={20}
          color="gray"
          style={styles.searchIcon}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.productsGrid}>{products.map(renderProductCard)}</View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    paddingTop: 50, // Adjust based on your device's safe area
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  welcomeText: {
    fontSize: 14,
    color: "#666",
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  headerIcons: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 15,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
  },
  searchIcon: {
    marginLeft: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  seeAllText: {
    color: "#007bff",
    fontWeight: "500",
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    width: "48%",
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  productImage: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  farmName: {
    fontSize: 12,
    color: "#555",
    marginBottom: 2,
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  availabilityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  availabilityText: {
    fontSize: 12,
    color: "#28a745",
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
  },
  actionButton: {
    backgroundColor: "#28a745",
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
});

export default HomeScreen;
