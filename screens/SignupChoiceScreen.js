// SignupChoiceScreen.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const SignupChoiceScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up As</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("ConsumerSignup")}
      >
        <Text style={styles.buttonText}>Consumer</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("BusinessSignup")}
      >
        <Text style={styles.buttonText}>Business</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignupChoiceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007BFF",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});
