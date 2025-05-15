import React from "react";
import {
  View,
  Text,
  Image,
  Button,
  ScrollView,
  StyleSheet,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

const ProductDetailScreen = ({ route }) => {
  const { product } = route.params;
  const imageUrl = `http://192.168.120.83:3001/${product.photos[0].replace(
    /\\/g,
    "/"
  )}`;

  const latitude = product.location?.coordinates?.lat;
  const longitude = product.location?.coordinates?.lng;
  console.log("Latitude:", latitude);
  console.log("Longitude:", longitude);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <Text style={styles.title}>{product.product_name}</Text>
      <Text style={styles.price}>Rs {product.price.amount}</Text>
      <Text style={styles.location}>📍 {product.location?.address}</Text>
      <Button
        title="Contact Farmer"
        onPress={() => {
          // future call or chat feature
        }}
      />

      {latitude && longitude && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker
            coordinate={{ latitude, longitude }}
            title={product.product_name}
          />
        </MapView>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  image: { width: "100%", height: 250, borderRadius: 12 },
  title: { fontSize: 24, fontWeight: "bold", marginTop: 10 },
  price: { fontSize: 18, color: "green" },
  location: { fontSize: 16, marginVertical: 5 },
  map: { height: 300, marginTop: 20, borderRadius: 10 },
});

export default ProductDetailScreen;
