import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { Ionicons } from "@expo/vector-icons";

const AccountScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigation.navigate("Login");
          return;
        }

        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUserData({
            id: user.uid,
            email: user.email,
            ...userDoc.data(),
          });
        } else {
          Alert.alert("Error", "User profile not found.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Error", "Failed to sign out.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: "https://via.placeholder.com/150" }}
            style={styles.profileImage}
          />
        </View>
        <Text style={styles.userName}>
          {userData?.businessName ||
            userData?.name ||
            userData?.email ||
            "User"}
        </Text>
        <Text style={styles.userType}>
          {userData?.userType === "business"
            ? "Business Account"
            : "Consumer Account"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>

        <View style={styles.infoItem}>
          <Ionicons name="mail-outline" size={22} color="#666" />
          <Text style={styles.infoText}>{userData?.email}</Text>
        </View>

        {userData?.userType === "business" && (
          <>
            {userData?.businessName && (
              <View style={styles.infoItem}>
                <Ionicons name="business-outline" size={22} color="#666" />
                <Text style={styles.infoText}>{userData.businessName}</Text>
              </View>
            )}
            {userData?.location && (
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={22} color="#666" />
                <Text style={styles.infoText}>{userData.location}</Text>
              </View>
            )}
          </>
        )}

        {userData?.userType === "consumer" && (
          <>
            {userData?.name && (
              <View style={styles.infoItem}>
                <Ionicons name="person-outline" size={22} color="#666" />
                <Text style={styles.infoText}>{userData.name}</Text>
              </View>
            )}
            {userData?.phone && (
              <View style={styles.infoItem}>
                <Ionicons name="call-outline" size={22} color="#666" />
                <Text style={styles.infoText}>{userData.phone}</Text>
              </View>
            )}
          </>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#007BFF",
    padding: 20,
    alignItems: "center",
    paddingTop: 60, // For status bar
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  userType: {
    fontSize: 16,
    color: "#f0f0f0",
    marginBottom: 10,
  },
  section: {
    backgroundColor: "#fff",
    padding: 20,
    marginHorizontal: 15,
    marginTop: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  infoText: {
    fontSize: 16,
    marginLeft: 10,
    color: "#333",
  },
  button: {
    backgroundColor: "#ff4757",
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AccountScreen;
