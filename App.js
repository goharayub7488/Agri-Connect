import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import SignupChoiceScreen from "./screens/SignupChoiceScreen";
import ConsumerSignupScreen from "./screens/ConsumerSignupScreen";
import BusinessSignupScreen from "./screens/BusinessSignupScreen";
import BusinessHomeScreen from "./screens/BusinessHomeScreen";
import ConsumerHomeScreen from "./screens/ConsumerHomeScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignupChoice" component={SignupChoiceScreen} />
        <Stack.Screen name="ConsumerSignup" component={ConsumerSignupScreen} />
        <Stack.Screen name="BusinessSignup" component={BusinessSignupScreen} />
        <Stack.Screen name="BusinessHome" component={BusinessHomeScreen} />
        <Stack.Screen name="ConsumerHome" component={ConsumerHomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
