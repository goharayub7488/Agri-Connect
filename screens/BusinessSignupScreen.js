import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase"; // Make sure this path is correct
import Spinner from "react-native-loading-spinner-overlay"; // added
import { fetchSignInMethodsForEmail } from "firebase/auth"; //added
import Toast from "react-native-toast-message";

const BusinessSignupScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [picture, setPicture] = useState("");
  const [userType, setUserType] = useState("consumer");
  const [loading, setLoading] = useState(false);

  const handleBusinessSignup = async () => {
    if (!name || !email || !phone || !password || !userType) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long!");
      return;
    }

    setLoading(true);

    try {
      // Check if the email exists in Firebase Authentication
      const methods = await fetchSignInMethodsForEmail(auth, email);

      if (methods.length > 0) {
        setLoading(false);
        Alert.alert("Error", "Email is already in use");
        return;
      }

      // Proceed with creating the user if email doesn't exist
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save full profile to Firestore
      await setDoc(doc(db, "users", user.uid), {
        picture: "",
        name: name,
        email: email,
        phone: phone,
        userType: userType,
        location: location,
        createdAt: new Date(),
      });

      setLoading(false);

      Toast.show({
        type: "success",
        text1: "Account created successfully!",
        text2: "You can now log in",
      });

      navigation.navigate("Login");
    } catch (error) {
      setLoading(false);
      Alert.alert("Signup Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Spinner
        visible={loading}
        textContent={"Creating account..."}
        textStyle={{ color: "#FFF" }}
      />
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
        autoCapitalize="none"
        keyboardType="default"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Text style={styles.label}>Select User Type</Text>
      <View style={styles.selectionContainer}>
        <TouchableOpacity
          style={[
            styles.optionBox,
            userType === "consumer" && styles.selectedBox,
          ]}
          onPress={() => setUserType("consumer")}
        >
          <Text
            style={[
              styles.optionText,
              userType === "consumer" && styles.selectedText,
            ]}
          >
            Consumer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionBox,
            userType === "business" && styles.selectedBox,
          ]}
          onPress={() => setUserType("business")}
        >
          <Text
            style={[
              styles.optionText,
              userType === "business" && styles.selectedText,
            ]}
          >
            Business
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleBusinessSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BusinessSignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#007BFF",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },

  label: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 10,
  },

  selectionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  optionBox: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },

  selectedBox: {
    borderColor: "#007BFF",
    backgroundColor: "#EAF3FF",
  },

  optionText: {
    fontSize: 16,
    color: "#333",
  },

  selectedText: {
    color: "#007BFF",
    fontWeight: "bold",
  },
});
