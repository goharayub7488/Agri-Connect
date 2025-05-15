import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";

import FarmerHomeScreen from "./screens/FarmerHomeScreen";
import AddProduct from "./screens/AddProduct";
import FarmerAccountScreen from "./screens/FarmerAccountScreen";
import ProductDetailScreen from "./screens/ProductDetailScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const FarmerTabs = () => (
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
    <Tab.Screen name="Add" component={AddProduct} />
    <Tab.Screen name="Account" component={FarmerAccountScreen} />
  </Tab.Navigator>
);
const ConsumerTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: "#4CAF50",
      tabBarInactiveTintColor: "#888",
      tabBarShowLabel: true,
      tabBarIcon: ({ color, size }) => {
        return <Ionicons name="home" size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={FarmerHomeScreen} />
  </Tab.Navigator>
);

const AppNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        {/* <Stack.Screen name="MainScreen" component={MainHomeScreen} /> */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ConsumerTabs" component={ConsumerTabs} />
        <Stack.Screen name="FarmerTabs" component={FarmerTabs} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen
          name="AddProduct"
          component={AddProduct}
          options={{
            headerShown: true,
            title: "Add Product",
            headerStyle: { backgroundColor: "#4CAF50" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  logo: { width: 120, height: 120, resizeMode: "contain", alignSelf: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
  },
  inputFlex: { flex: 1 },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 8,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginVertical: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  userType: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#aaa",
    alignItems: "center",
    marginHorizontal: 5,
  },
  selected: { borderColor: "green" },
  roundImage: { width: 50, height: 50, borderRadius: 25, margin: 5 },
});
