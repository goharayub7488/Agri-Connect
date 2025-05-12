import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace("Login");
    }, 2000); // Simulated delay
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the App</Text>
      <ActivityIndicator size="large" color="#000" />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
});
// import React, { useEffect } from "react";
// import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const SplashScreen = ({ navigation }) => {
//   useEffect(() => {
//     const checkLoginStatus = async () => {
//       const token = await AsyncStorage.getItem("token");
//       if (token) {
//         // User is logged in, navigate to FarmerScreen or MainScreen
//         navigation.replace("FarmerScreen"); // or "MainScreen" based on your logic
//       } else {
//         // User is not logged in, navigate to Login
//         navigation.replace("Login");
//       }
//     };

//     // Call the function to check login status
//     checkLoginStatus();
//   }, [navigation]);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.text}>Welcome to the App</Text>
//       <ActivityIndicator size="large" color="#000" />
//     </View>
//   );
// };

// export default SplashScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   text: {
//     fontSize: 24,
//     marginBottom: 20,
//   },
// });
