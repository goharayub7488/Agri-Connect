import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const apiBaseUrl = "http://192.168.18.85:3001/api"; // Replace with your actual API base URL

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      // Call your API endpoint for login
      const response = await axios.post(`${apiBaseUrl}/auth/login`, {
        email,
        password,
      });
      console.log("API Response:", response.data);

      // Check response status
      if (response.data.status === 200) {
        // Login successful
        const userData = response.data.data;

        // Store user data and token in AsyncStorage
        try {
          await AsyncStorage.setItem("token", userData.token);
          console.log("Token stored:", userData.token);
          await AsyncStorage.setItem(
            "user",
            JSON.stringify({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              location: userData.location,
              userType: userData.userType,
              image: userData.image,
            })
          );
        } catch (storageError) {
          console.error("AsyncStorage Error:", storageError);
        }
        console.log("User type:", userData.userType);

        // Determine which screen to navigate to based on userType
        const destinationScreen =
          userData.userType.trim().toLowerCase() === "business"
            ? "FarmerTabs"
            : "MainScreen";
        console.log("Navigating to:", destinationScreen);
        // Success message
        Alert.alert("Success", `Logged in as ${userData.userType}`, [
          {
            text: "OK",
            onPress: () => {
              // Navigate based on user type
              setTimeout(() => {
                navigation.navigate(destinationScreen);
              }, 100);
            },
          },
        ]);
      } else {
        // Login failed with a defined error
        Alert.alert(
          "Login Failed",
          response.data.message || "Invalid credentials"
        );
      }
    } catch (error) {
      // Handle network or unexpected errors
      console.error("Login Error:", error);

      let errorMessage =
        "Network error. Please check your connection and try again.";

      // If we have a response from the server with an error message
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      }

      Alert.alert("Login Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Agri-Connect</Text>
        <Text style={styles.subtitle}>Login to your account</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          disabled={loading}
        >
          <Text style={styles.signupText}>
            Don't have an account?{" "}
            <Text style={styles.signupLink}>SignUp!</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 28,
    textAlign: "center",
    color: "#4CAF50",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    height: 55,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#4CAF50",
    height: 55,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 15,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  signupText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  signupLink: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
});

export default LoginScreen;
////////////////////////////////////////////////

//////////////////////////////////////////////////////
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
// } from "react-native";
// import Icon from "react-native-vector-icons/Ionicons";

// const LoginScreen = ({ navigation }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.heading}>Login</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         keyboardType="email-address"
//         autoCapitalize="none"
//         value={email}
//         onChangeText={setEmail}
//       />

//       <View style={styles.passwordContainer}>
//         <TextInput
//           style={styles.passwordInput}
//           placeholder="Password"
//           secureTextEntry={!showPassword}
//           value={password}
//           onChangeText={setPassword}
//         />
//         <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//           <Icon
//             name={showPassword ? "eye-off" : "eye"}
//             size={20}
//             color="#666"
//           />
//         </TouchableOpacity>
//       </View>

//       <TouchableOpacity style={styles.loginButton}>
//         <Text style={styles.loginButtonText}>Login</Text>
//       </TouchableOpacity>

// <Text style={styles.signupText}>
//   Don't have an account?{" "}
//   <Text
//     style={styles.signupLink}
//     onPress={() => navigation.navigate("Register")}
//   >
//     SignUp!
//   </Text>
// </Text>
//     </View>
//   );
// };

// export default LoginScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 24,
//     justifyContent: "center",
//     backgroundColor: "#fff",
//   },
//   heading: {
//     fontSize: 28,
//     fontWeight: "bold",
//     marginBottom: 30,
//     textAlign: "center",
//     color: "#333",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 15,
//     fontSize: 16,
//   },
//   passwordContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#ccc",
//     paddingHorizontal: 12,
//     borderRadius: 8,
//     marginBottom: 20,
//   },
//   passwordInput: {
//     flex: 1,
//     paddingVertical: 12,
//     fontSize: 16,
//   },
//   loginButton: {
//     backgroundColor: "#4CAF50",
//     paddingVertical: 14,
//     borderRadius: 8,
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   loginButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   signupText: {
//     textAlign: "center",
//     fontSize: 16,
//     color: "#555",
//   },
//   signupLink: {
//     color: "#1E90FF",
//     textDecorationLine: "underline",
//   },
// });
