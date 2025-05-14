import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ProductFormModal = ({
  visible,
  onClose,
  formData,
  setFormData,
  categories,
  photos,
  pickImage,
  removePhoto,
  handleSubmit,
  loading,
  styles,
}) => {
  return (
    <KeyboardAvoidingView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {formData.item_id ? "Edit Product" : "Add New Product"}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              {/* Product Name */}
              <Text style={styles.inputLabel}>Product Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                placeholder="Enter product name"
              />

              {/* Price */}
              <Text style={styles.inputLabel}>Price (PKR) *</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) =>
                  setFormData({ ...formData, price: text })
                }
                placeholder="Enter price"
                keyboardType="numeric"
              />

              {/* Location */}
              <Text style={styles.inputLabel}>Location *</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(text) =>
                  setFormData({ ...formData, location: text })
                }
                placeholder="Enter location"
              />

              {/* Coordinates */}
              <View style={styles.coordsContainer}>
                <View style={styles.coordInput}>
                  <Text style={styles.inputLabel}>Latitude</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.latitude}
                    onChangeText={(text) =>
                      setFormData({ ...formData, latitude: text })
                    }
                    placeholder="Latitude"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.coordInput}>
                  <Text style={styles.inputLabel}>Longitude</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.longitude}
                    onChangeText={(text) =>
                      setFormData({ ...formData, longitude: text })
                    }
                    placeholder="Longitude"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Category Selection */}
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categorySelector}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categorySelectorItem,
                      formData.category_id === category.id &&
                        styles.selectedCategorySelectorItem,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, category_id: category.id })
                    }
                  >
                    <Text
                      style={[
                        styles.categorySelectorText,
                        formData.category_id === category.id &&
                          styles.selectedCategorySelectorText,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Photo Picker */}
              <Text style={styles.inputLabel}>Photos</Text>
              <TouchableOpacity
                style={styles.photoPickerButton}
                onPress={pickImage}
              >
                <Ionicons name="camera-outline" size={24} color="#fff" />
                <Text style={styles.photoPickerButtonText}>Add Photo</Text>
              </TouchableOpacity>

              {photos.length > 0 && (
                <View style={styles.photosContainer}>
                  {photos.map((photo, index) => (
                    <View key={index} style={styles.photoItem}>
                      <Image
                        source={{ uri: photo.uri }}
                        style={styles.photoThumbnail}
                      />
                      <TouchableOpacity
                        style={styles.removePhotoButton}
                        onPress={() => removePhoto(index)}
                      >
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color="#FF6B6B"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Submit */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {formData.item_id ? "Update Product" : "Add Product"}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ProductFormModal;
