// import React, { useEffect } from "react";
// import { View, Text, Image, TouchableOpacity } from "react-native";
// import { Ionicons } from "@expo/vector-icons";

// const ProductCard = ({
//   item,
//   styles,
//   handleEditProduct,
//   handleDeleteProduct,
// }) => {
//   // Add this effect to debug the problem
//   useEffect(() => {
//     console.log("===== DEBUGGING PRODUCT CARD =====");
//     console.log("Product item:", JSON.stringify(item, null, 2));

//     if (item.photos && item.photos.length > 0) {
//       // Log all possible URL formats to test
//       const photoPath = item.photos[0];
//       console.log("Original photo path:", photoPath);

//       const urls = [
//         `http://192.168.18.85:3001/${photoPath.replace(/\\/g, "/")}`,
//         `http://192.168.18.85:3001/uploads/${photoPath
//           .replace(/^uploads\\/, "")
//           .replace(/\\/g, "/")}`,
//         `http://192.168.18.85:3001/api/${photoPath.replace(/\\/g, "/")}`,
//         `http://192.168.18.85:3001/api/uploads/${photoPath
//           .replace(/^uploads\\/, "")
//           .replace(/\\/g, "/")}`,
//       ];

//       console.log("Test URLs:");
//       urls.forEach((url, index) => {
//         console.log(`URL ${index + 1}: ${url}`);
//       });

//       // We'll use URL format 1 for now (without /api)
//       console.log("Using URL format 1");
//     }
//   }, [item]);

//   // Generate image URL - directly use URL format 1 (no /api)
//   const getImageUrl = (photoPath) => {
//     if (!photoPath) return null;
//     return `http://192.168.18.85:3001/${photoPath.replace(/\\/g, "/")}`;
//   };

//   return (
//     <View style={styles.productCard}>
//       {item.photos && item.photos.length > 0 ? (
//         <Image
//           source={{ uri: getImageUrl(item.photos[0]) }}
//           style={styles.productImage}
//           resizeMode="cover"
//           onError={(e) => {
//             console.log("Image load error:", e.nativeEvent.error);

//             // Force a retry with URL format 2 on error
//             const retryUrl = `http://192.168.18.85:3001/uploads/${item.photos[0]
//               .replace(/^uploads\\/, "")
//               .replace(/\\/g, "/")}`;
//             console.log("Retrying with URL:", retryUrl);

//             // Note: We can't actually change the URL in onError,
//             // but this log helps for debugging
//           }}
//         />
//       ) : (
//         <View style={styles.noImageContainer}>
//           <Ionicons name="image-outline" size={50} color="#ccc" />
//         </View>
//       )}

//       <View style={styles.productInfo}>
//         <Text style={styles.productName}>{item.name}</Text>
//         <Text style={styles.productPrice}>Rs {item.price.amount}</Text>
//         <Text style={styles.productLocation}>
//           {item.location.location || item.location.address}
//         </Text>
//         <Text style={styles.productDate}>Added: {item.created_at}</Text>
//       </View>

//       <View style={styles.actionButtons}>
//         <TouchableOpacity
//           style={[styles.actionButton, styles.editButton]}
//           onPress={() => handleEditProduct(item)}
//         >
//           <Ionicons name="create-outline" size={20} color="#fff" />
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.actionButton, styles.deleteButton]}
//           onPress={() => handleDeleteProduct(item.id)}
//         >
//           <Ionicons name="trash-outline" size={20} color="#fff" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default ProductCard;
///////////////////////////////////////////////////////////////////////////////////
// import { View, Text, Image, TouchableOpacity } from "react-native";
// import { Ionicons } from "@expo/vector-icons";

// const ProductCard = ({
//   item,
//   styles,
//   handleEditProduct,
//   handleDeleteProduct,
// }) => {
//   // Server base URL without the /api prefix
//   const serverBaseUrl = "http://192.168.18.85:3001/api";

//   const getImageUrl = (photoPath) => {
//     if (!photoPath) return null;

//     // Clean up the path - replace backslashes with forward slashes
//     const cleanPath = photoPath.replace(/\\/g, "/");

//     // The server might be serving static files directly from the root
//     // not through the /api route
//     return `${serverBaseUrl}/${cleanPath}`;
//   };

//   return (
//     <View style={styles.productCard}>
//       {item.photos && item.photos.length > 0 ? (
//         <Image
//           source={{ uri: getImageUrl(item.photos[0]) }}
//           style={styles.productImage}
//           resizeMode="cover"
//           onError={(e) => {
//             console.log("Product image error for path:", item.photos[0]);
//             console.log("Error details:", e.nativeEvent.error);
//           }}
//         />
//       ) : (
//         <View style={styles.noImageContainer}>
//           <Ionicons name="image-outline" size={50} color="#ccc" />
//         </View>
//       )}

//       <View style={styles.productInfo}>
//         <Text style={styles.productName}>{item.name}</Text>
//         <Text style={styles.productPrice}>Rs {item.price.amount}</Text>
//         <Text style={styles.productLocation}>
//           {item.location.location || item.location.address}
//         </Text>
//         <Text style={styles.productDate}>Added: {item.created_at}</Text>
//       </View>

//       <View style={styles.actionButtons}>
//         <TouchableOpacity
//           style={[styles.actionButton, styles.editButton]}
//           onPress={() => handleEditProduct(item)}
//         >
//           <Ionicons name="create-outline" size={20} color="#fff" />
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.actionButton, styles.deleteButton]}
//           onPress={() => handleDeleteProduct(item.id)}
//         >
//           <Ionicons name="trash-outline" size={20} color="#fff" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default ProductCard;
/////////////////////////////////////////////////////////////////////////////////
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
// const ProductCard = ({
//   item,
//   styles,
//   handleEditProduct,
//   handleDeleteProduct,
// }) => {
//   const baseUrl = "http://192.168.18.85:3001/api/";
//   return (
//     <View style={styles.productCard}>
//       {item.photos && item.photos.length > 0 ? (
//         <Image
//           source={{ uri: `${baseUrl}${item.photos[0]}` }} // Concatenate base URL with image path
//           style={styles.productImage}
//           resizeMode="cover"
//           onError={(e) =>
//             console.log("Product image error:", e.nativeEvent.error)
//           }
//         />
//       ) : (
//         <View style={styles.noImageContainer}>
//           <Ionicons name="image-outline" size={50} color="#ccc" />
//         </View>
//       )}
const ProductCard = ({
  item,
  styles,
  handleEditProduct,
  handleDeleteProduct,
  showActions = true,
}) => {
  const getImageUrl = (photoPath) => {
    const cleanPath = photoPath.replace(/\\/g, "/");
    return `http://192.168.18.85:3001/${cleanPath}`;
  };

  return (
    <View style={styles.productCard}>
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
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>Rs {item.price.amount}</Text>
        <Text style={styles.productLocation}>
          {item.location.location || item.location.address}
        </Text>
        <Text style={styles.productDate}>Added: {item.created_at}</Text>
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
    </View>
  );
};

export default ProductCard;
