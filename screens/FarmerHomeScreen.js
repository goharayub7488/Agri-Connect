import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

const FarmerHomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome Farmer!</Text>
      <Button title="Logout" onPress={() => navigation.replace("Login")} />
    </View>
  );
};

export default FarmerHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
  },
});
