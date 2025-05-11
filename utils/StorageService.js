import AsyncStorage from "@react-native-async-storage/async-storage";
import User from "../models/User";

const USER_KEY = "@loggedInUser";
const TOKEN_KEY = "user_token";
const IS_LOGGED_IN_KEY = "isLoggedIn";

// Save User and Token
export const saveUser = async (user, token) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user.toJSON()));
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(IS_LOGGED_IN_KEY, "1"); // Set user as logged in
  } catch (e) {
    console.error("Failed to save user and token:", e);
  }
};

// Get User and Token
export const getUser = async () => {
  try {
    const userJson = await AsyncStorage.getItem(USER_KEY);
    return userJson != null ? User.fromJSON(JSON.parse(userJson)) : null;
  } catch (e) {
    console.error("Failed to fetch user:", e);
    return null;
  }
};

// Get Token
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (e) {
    console.error("Failed to fetch token", e);
    return null;
  }
};

// Remove User and Token
export const clearUser = async () => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(IS_LOGGED_IN_KEY); // Set user as logged out
  } catch (e) {
    console.error("Failed to clear user:", e);
  }
};

// Check if User is Logged In
export const isLoggedIn = async () => {
  try {
    const isLoggedInValue = await AsyncStorage.getItem(IS_LOGGED_IN_KEY);
    return isLoggedInValue === "1"; // Return true if logged in, false otherwise
  } catch (e) {
    console.error("Failed to check login status:", e);
    return false;
  }
};
