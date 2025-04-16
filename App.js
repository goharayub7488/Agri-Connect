import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet, Text } from "react-native";

// Import your screens
import LoginScreen from "./screens/LoginScreen";
import BusinessSignupScreen from "./screens/BusinessSignupScreen";
import MainScreen from "./screens/MainScreen";
import AccountScreen from "./screens/AccountScreen";
import NewListingScreen from "./screens/NewListingScreen";
import Toast from "react-native-toast-message";
// import uploadCategories from "./Files/UploadCategories"; // Capital "F"

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom tab navigator for authenticated users
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Account") {
            iconName = focused ? "person" : "person-outline";
          }

          // Return the icon component
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007BFF",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={MainScreen} />
      <Tab.Screen
        name="AddListing"
        component={NewListingScreen}
        options={{
          tabBarLabel: "",
          tabBarIcon: ({ focused, color, size }) => (
            <View style={styles.addButton}>
              <Ionicons name="add" size={28} color="#fff" />
            </View>
          ),
        }}
      />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

// Main navigation container
export default function App() {
  // uploadCategories();
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignupChoice" component={BusinessSignupScreen} />
          <Stack.Screen
            name="BusinessSignup"
            component={BusinessSignupScreen}
          />
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast
        config={{
          success: (internalState) => (
            <View
              style={{
                padding: 15,
                backgroundColor: "green",
                borderRadius: 5,
                marginBottom: 15,
                width: "90%",
                alignSelf: "center",
              }}
            >
              <Text style={{ color: "white" }}>{internalState.text1}</Text>
              <Text style={{ color: "white" }}>{internalState.text2}</Text>
            </View>
          ),
        }}
        position="bottom" // Position toast at the bottom
        visibilityTime={3000} // Auto-hide after 3 seconds
      />
    </>
  );
}

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: "#ff4757",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
});

// import React from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import LoginScreen from "./screens/LoginScreen";
// import SignupChoiceScreen from "./screens/SignupChoiceScreen";
// import ConsumerSignupScreen from "./screens/ConsumerSignupScreen";
// import BusinessSignupScreen from "./screens/BusinessSignupScreen";
// import BusinessHomeScreen from "./screens/BusinessHomeScreen";
// import ConsumerHomeScreen from "./screens/ConsumerHomeScreen";

// const Stack = createNativeStackNavigator();

// export default function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator>
//         <Stack.Screen name="Login" component={LoginScreen} />
//         <Stack.Screen name="SignupChoice" component={SignupChoiceScreen} />
//         <Stack.Screen name="ConsumerSignup" component={ConsumerSignupScreen} />
//         <Stack.Screen name="BusinessSignup" component={BusinessSignupScreen} />
//         <Stack.Screen name="BusinessHome" component={BusinessHomeScreen} />
//         <Stack.Screen name="ConsumerHome" component={ConsumerHomeScreen} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }
