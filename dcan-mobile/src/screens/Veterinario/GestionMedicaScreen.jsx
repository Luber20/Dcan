import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { Searchbar, List, Avatar, Surface } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../../config/api";

export default function GestionMedicaScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ AQUÍ VA LA FUNCIÓN CORREGIDA
  const fetchPacientes = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("authToken");
      
      const response = await axios.get(`${API_URL}/veterinarian/patients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setPacientes(response.data);
    } catch (error) {
      // 🕵️‍♂️ LÓGICA DE DEPURACIÓN PARA EL ERROR 500
      if (error.response) {
        // Esto imprimirá en tu consola de VS Code el error real de Laravel
        console.log("🔴 ERROR 500 DETALLES:", error.response.data);
        Alert.alert("Error de Servidor", "Revisa la consola para ver el detalle técnico.");
      } else {
        console.log("❌ Error de red:", error.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Esto dispara la función cada vez que entras a la pantalla
  useFocusEffect(useCallback(() => { fetchPacientes(); }, []));

  // Filtro de búsqueda
  const filteredPacientes = pacientes.filter(p =>
    p.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.dueno?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Pacientes 🐾</Text>
      
      <Searchbar
        placeholder="Buscar mascota o dueño..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.search}
      />

      {loading && !refreshing ? (
        <ActivityIndicator color="#2E8B57" size="large" />
      ) : (
        <FlatList
          data={filteredPacientes}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchPacientes();}} />
          }
          renderItem={({ item }) => (
            <Surface style={styles.itemContainer}>
              <List.Item
                title={item.nombre}
                description={`${item.especie} • ${item.raza}\nÚltima visita: ${item.ultimaVisita}`}
                left={() => (
                  <View style={{ justifyContent: 'center', paddingLeft: 10 }}>
                    <Avatar.Text 
                      size={48} 
                      label={item.nombre.substring(0, 1).toUpperCase()} 
                      style={{ backgroundColor: "#2E8B57" }} 
                    />
                  </View>
                )}
                right={() => <List.Icon icon="chevron-right" color="#ccc" />}
                descriptionNumberOfLines={2}
              />
            </Surface>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, marginTop: 40, color: '#2E8B57' },
  search: { marginBottom: 20, elevation: 2, backgroundColor: '#fff', borderRadius: 10 },
  itemContainer: { marginBottom: 10, borderRadius: 10, elevation: 1, backgroundColor: '#fff' }
});