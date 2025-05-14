import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import agricultureData from "../assets/data/agriculture_data.json";

const AgriTrendsCard = () => {
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const filteredData = agricultureData.filter(
      (item) => item["Country Name"] === "Pakistan"
    );

    const sorted = Object.entries(filteredData[0])
      .filter(([key]) => /^\d{4}$/.test(key))
      .map(([year, value]) => ({ year, value }))
      .filter((item) => item.value !== "")
      .sort((a, b) => b.year - a.year) // Most recent first
      .slice(0, 5); // Show last 5 years

    setTrendData(sorted);
    setLoading(false);
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.year}>{item.year}</Text>
      <Text style={styles.value}>{parseFloat(item.value).toFixed(2)}%</Text>
    </View>
  );

  return (
    <View style={styles.card}>
      <Text style={styles.title}>📊 Agriculture % of GDP (🇵🇰)</Text>
      {loading ? (
        <ActivityIndicator color="#4CAF50" />
      ) : (
        <FlatList
          data={trendData}
          keyExtractor={(item) => item.year}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

export default AgriTrendsCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#e8f5e9",
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1b5e20",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  year: {
    fontSize: 14,
    color: "#388e3c",
  },
  value: {
    fontSize: 14,
    color: "#2e7d32",
  },
});
