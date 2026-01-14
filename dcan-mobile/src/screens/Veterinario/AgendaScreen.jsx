import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Card, Badge, Avatar } from 'react-native-paper';

const citasEjemplo = [
  { id: '1', mascota: 'Max', dueño: 'Juan Pérez', hora: '10:00 AM', motivo: 'Vacunación', tipo: 'Consulta' },
  { id: '2', mascota: 'Luna', dueño: 'María G.', hora: '11:30 AM', motivo: 'Cirugía', tipo: 'Urgencia' },
];

export default function AgendaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Citas de Hoy 📅</Text>
      <FlatList
        data={citasEjemplo}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Title
              title={`${item.mascota} - ${item.hora}`}
              subtitle={`Dueño: ${item.dueño}`}
              left={(props) => <Avatar.Icon {...props} icon="dog" backgroundColor="#2E8B57" />}
              right={() => (
                <Badge style={{ backgroundColor: item.tipo === 'Urgencia' ? 'red' : '#2E8B57', marginRight: 10 }}>
                  {item.tipo}
                </Badge>
              )}
            />
            <Card.Content>
              <Text style={styles.motivo}>Motivo: {item.motivo}</Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: 40, color: '#333' },
  card: { marginBottom: 15, elevation: 4 },
  motivo: { color: '#666', marginTop: 5 }
});