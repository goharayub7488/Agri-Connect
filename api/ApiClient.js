// api/ApiClient.js
import axios from "axios";

// Create the Axios instance
const api = axios.create({
  baseURL: "http://192.168.18.85:3001/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Utility function to set or remove the Authorization token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export default api;
