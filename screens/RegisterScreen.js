import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { registerUser } from "../api/APIService"; // Assuming the API is in the 'api.js' file
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native"; // For navigation

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [userType, setUserType] = useState("Consumer");
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const handleUserTypeSelect = (type) => {
    setUserType(type);
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const image = ""; // Placeholder for image handling if necessary
      const response = await registerUser(
        name,
        email,
        password,
        phone,
        image,
        location,
        userType
      );
      setLoading(false);
      Toast.show({
        type: "success",
        text1: "Registration Successful!",
        text2: "You have been registered successfully.",
      });

      // Navigate based on user type
      const destination =
        userType === "Consumer" ? "ConsumerHome" : "BusinessHome";
      navigation.navigate(destination);
    } catch (error) {
      setLoading(false);
      Toast.show({
        type: "error",
        text1: "Registration Failed!",
        text2: "There was an error during registration. Please try again.",
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Register</Text>

      <TouchableOpacity style={styles.imageContainer}>
        <View style={styles.imageCircle}>
          <Icon name="camera" size={24} color="#fff" />
        </View>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Phone"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />

      <View style={styles.userTypeContainer}>
        {["Consumer", "Business"].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.userTypeOption,
              userType === type && styles.selectedUserType,
            ]}
            onPress={() => handleUserTypeSelect(type)}
          >
            <Text
              style={[
                styles.userTypeText,
                userType === type && styles.selectedUserTypeText,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      )}

      <Text style={styles.loginText}>
        Already have an account?{" "}
        <Text
          style={styles.loginLink}
          onPress={() => navigation.navigate("Login")}
        >
          Login
        </Text>
      </Text>

      <Toast ref={(ref) => Toast.setRef(ref)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  imageCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  userTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  userTypeOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  selectedUserType: {
    backgroundColor: "#4CAF50",
  },
  userTypeText: {
    fontSize: 16,
    color: "#333",
  },
  selectedUserTypeText: {
    color: "#fff",
    fontWeight: "600",
  },
  registerButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loginText: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
  },
  loginLink: {
    color: "#1E90FF",
    textDecorationLine: "underline",
  },
  loader: {
    marginVertical: 20,
  },
});

export default RegisterScreen;
