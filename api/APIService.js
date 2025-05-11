import api, { setAuthToken } from "./ApiClient";
import { USER_ENDPOINTS } from "./Endpoints";

/******************************* AUTH & USER *******************************/

// Register User

// Register User
export const registerUser = async (
  name,
  email,
  password,
  phone,
  image,
  location,
  userType
) => {
  try {
    const response = await api.post(USER_ENDPOINTS.REGISTER, {
      name,
      email,
      password,
      phone,
      image,
      location,
      userType,
    });

    // Return the response data if the request was successful
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);

    // Handle different types of errors
    if (error.response) {
      // The request was made, but the server responded with a status other than 200
      console.error("Response error:", error.response.data);
      throw new Error(
        error.response.data.message || "An error occurred while registering."
      );
    } else if (error.request) {
      // The request was made, but no response was received
      console.error("Request error:", error.request);
      throw new Error("No response received from the server.");
    } else {
      // Something else happened during the setup of the request
      console.error("General error:", error.message);
      throw new Error(error.message || "An unknown error occurred.");
    }
  }
};

// Login User

export const loginUser = async (email, password) => {
  try {
    const response = await api.post(USER_ENDPOINTS.LOGIN, { email, password });
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

// Fetch User Profile

export const fetchProfile = async (token) => {
  try {
    setAuthToken(token);
    const response = await api.get(USER_ENDPOINTS.PROFILE);
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

// Update User Profile

export const updateProfile = async (
  token,
  name,
  email,
  phone,
  image,
  location
) => {
  try {
    setAuthToken(token);
    const response = await api.put(USER_ENDPOINTS.PROFILE, {
      name,
      email,
      phone,
      image,
      location,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

// Change User Password

export const changePassword = async (token, currentPassword, newPassword) => {
  try {
    setAuthToken(token);
    const response = await api.put(USER_ENDPOINTS.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};

// Get Categories

export const getCategories = async () => {
  try {
    const response = await api.get(USER_ENDPOINTS.GET_CATEGORIES);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

/******************************* FARMER *******************************/

// Fetch Farmer Products

export const fetchFarmerProducts = async (category_id, token) => {
  try {
    setAuthToken(token);
    const response = await api.get(
      `${USER_ENDPOINTS.FETCH_FARMER_PRODUCTS}?category_id=${category_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching farmer products:", error);
    throw error;
  }
};

// Add Product

export const addProduct = async (
  category_id,
  name,
  price,
  photos,
  location,
  latitude,
  longitude,
  token
) => {
  try {
    setAuthToken(token);
    const response = await api.post(USER_ENDPOINTS.PRODUCT, {
      category_id,
      name,
      price,
      photos,
      location,
      latitude,
      longitude,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

// Update Product

export const updateProduct = async (
  item_id,
  category_id,
  name,
  price,
  photos,
  location,
  latitude,
  longitude,
  token
) => {
  try {
    setAuthToken(token);
    const response = await api.put(USER_ENDPOINTS.PRODUCT, {
      item_id,
      category_id,
      name,
      price,
      photos,
      location,
      latitude,
      longitude,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// Delete Product

export const deleteProduct = async (item_id, token) => {
  try {
    setAuthToken(token);
    const response = await api.delete(
      `${USER_ENDPOINTS.DELETE_PRODUCT}?item_id=${item_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

/******************************* CONSUMER *******************************/

// Fetch Consumer Products

export const fetchConsumerProducts = async (category_id, token) => {
  try {
    setAuthToken(token);
    const response = await api.get(
      `${USER_ENDPOINTS.FETCH_CONSUMER_PRODUCTS}?category_id=${category_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching consumer products:", error);
    throw error;
  }
};
