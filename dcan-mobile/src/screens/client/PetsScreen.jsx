import React, { useState, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl, Text, ActivityIndicator } from "react-native";
import { Card, Title, Paragraph, Avatar, FAB } from "react-native-paper"; // ✅ Esta línea solo debe estar una vez
import { useTheme } from "../../context/ThemeContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { API_URL } from "../../config/api";
import { Ionicons } from "@expo/vector-icons";

export default function PetsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar mascotas
  const fetchPets = async () => {
    try {
      const response = await axios.get(`${API_URL}/pets`);
      setPets(response.data);
    } catch (error) {
      console.log("Error cargando mascotas:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPets();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPets();
  };

  const renderItem = ({ item }) => (
    <Card 
      style={[styles.card, { backgroundColor: theme.colors.card }]}
      onPress={() => navigation.navigate("EditPet", { pet: item })}
    >
      <Card.Content style={styles.petCard}>
        
        {/* 📸 LOGICA DE FOTO: Si tiene URL usa foto, si no, usa texto */}
        {item.photo_url ? (
           <Avatar.Image 
              size={60} 
              source={{ uri: item.photo_url }} 
              style={{ backgroundColor: 'transparent' }}
           />
        ) : (
           <Avatar.Text 
              size={60} 
              label={item.name.substring(0, 2).toUpperCase()} 
              style={{ backgroundColor: theme.colors.primary }} 
              color="#fff"
           />
        )}

        <View style={styles.petInfo}>
          <Title style={[styles.petName, { color: theme.colors.text }]}>{item.name}</Title>
          <Paragraph style={{ color: theme.colors.subtitle }}>
            {item.species} {item.breed ? `• ${item.breed}` : ""}
          </Paragraph>
          {/* Mostramos edad si existe */}
          {item.age && (
            <Paragraph style={{ fontSize: 12, color: '#888' }}>{item.age}</Paragraph>
          )}
        </View>
        
        {/* Icono de lápiz */}
        <Ionicons name="pencil-outline" size={20} color={theme.colors.subtitle} />
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
                <Ionicons name="paw-outline" size={60} color="#ccc" />
                <Text style={{color: '#888', marginTop: 10}}>No tienes mascotas registradas.</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#fff"
        onPress={() => navigation.navigate("AddPet")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { marginHorizontal: 20, marginVertical: 8, borderRadius: 15, elevation: 3 },
  petCard: { flexDirection: "row", alignItems: "center" },
  petInfo: { marginLeft: 15, flex: 1 },
  petName: { fontSize: 18, fontWeight: "bold" },
  fab: { position: "absolute", margin: 20, right: 0, bottom: 0 },
  empty: { alignItems: 'center', marginTop: 100 }
});
