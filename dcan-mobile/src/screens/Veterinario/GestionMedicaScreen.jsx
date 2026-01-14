import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Searchbar, List, Avatar, Surface } from 'react-native-paper';

const pacientesEjemplo = [
  { id: '1', nombre: 'Toby', especie: 'Perro', raza: 'Golden Retriever', ultimaVisita: '2023-10-15' },
  { id: '2', nombre: 'Michi', especie: 'Gato', raza: 'Siamés', ultimaVisita: '2023-11-02' },
  { id: '3', nombre: 'Coco', especie: 'Loro', raza: 'Cabeza Azul', ultimaVisita: '2023-11-20' },
];

export default function GestionMedicaScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Pacientes 🐾</Text>
      
      <Searchbar
        placeholder="Buscar mascota o dueño..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.search}
      />

      <FlatList
        data={pacientesEjemplo}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Surface style={styles.itemContainer}>
            <List.Item
              title={item.nombre}
              description={`${item.especie} • ${item.raza}\nÚltima visita: ${item.ultimaVisita}`}
              left={props => (
                <Avatar.Text 
                  {...props} 
                  size={48} 
                  label={item.nombre.substring(0, 1)} 
                  backgroundColor="#2E8B57" 
                />
              )}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              descriptionNumberOfLines={2}
            />
          </Surface>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, marginTop: 40, color: '#2E8B57' },
  search: { marginBottom: 20, elevation: 2, backgroundColor: '#fff' },
  itemContainer: { marginBottom: 10, borderRadius: 10, elevation: 1, backgroundColor: '#fff' }
});