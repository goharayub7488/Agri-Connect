import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";

const ProductCard = ({
  item,
  styles,
  handleEditProduct,
  handleDeleteProduct,
  showActions = true,
}) => {
  const navigation = useNavigation();

  const getImageUrl = (photoPath) => {
    const cleanPath = photoPath.replace(/\\/g, "/");
    return `http://192.168.120.83:3001/${cleanPath}`;
  };

  const goToDetails = () => {
    navigation.navigate("ProductDetail", { product: item });
  };

  const { location } = item;
  const address = location?.address || "Unknown Location";
  const latitude = location?.coordinates?.lat;
  const longitude = location?.coordinates?.lng;

  return (
    <TouchableOpacity onPress={goToDetails} style={styles.productCard}>
      {item.photos && item.photos.length > 0 ? (
        <Image
          source={{ uri: getImageUrl(item.photos[0]) }}
          style={styles.productImage}
          resizeMode="cover"
          onError={(e) =>
            console.log("Product image error:", e.nativeEvent.error)
          }
        />
      ) : (
        <View style={styles.noImageContainer}>
          <Ionicons name="image-outline" size={50} color="#ccc" />
        </View>
      )}

      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.product_name}</Text>
        <Text style={styles.productPrice}>Rs {item.price.amount}</Text>
        <Text style={styles.productLocation}>📍 {address}</Text>
        <Text style={styles.productDate}>Added: {item.created_at}</Text>

        {latitude && longitude && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker
              coordinate={{ latitude, longitude }}
              title={item.product_name}
            />
          </MapView>
        )}
      </View>

      {showActions && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditProduct(item)}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteProduct(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ProductCard;
