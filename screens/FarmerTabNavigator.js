import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import FarmerHomeScreen from "./FarmerHomeScreen";
import AddProduct from "./AddProduct";
import FarmerAccountScreen from "./FarmerAccountScreen";

const Tab = createBottomTabNavigator();

const FarmerTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "#888",
        tabBarShowLabel: true,
        tabBarIcon: ({ color, size }) => {
          if (route.name === "Home") {
            return <Ionicons name="home" size={size} color={color} />;
          } else if (route.name === "Add") {
            return <Ionicons name="add-circle" size={size + 8} color={color} />;
          } else if (route.name === "Account") {
            return <Ionicons name="person" size={size} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={FarmerHomeScreen} />
      <Tab.Screen
        name="Add"
        component={AddProduct}
        options={{ tabBarLabel: "Add" }}
      />
      <Tab.Screen name="Account" component={FarmerAccountScreen} />
    </Tab.Navigator>
  );
};

export default FarmerTabNavigator;
