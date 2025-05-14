// utils/logout.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export const handleLogout = async (navigation) => {
  try {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    console.log("Logged out and AsyncStorage cleared.");
    Alert.alert("Logged out", "You have been logged out successfully.");
    navigation.navigate("Login"); // Navigate to Login screen after logout
  } catch (error) {
    console.error("Logout Error:", error);
    Alert.alert("Error", "An error occurred while logging out.");
  }
};
