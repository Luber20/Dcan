import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { List, Switch, Button, Divider, Surface } from 'react-native-paper';

export default function DisponibilidadScreen() {
  const [dias, setDias] = useState({
    Lunes: true,
    Martes: true,
    Miercoles: true,
    Jueves: true,
    Viernes: true,
    Sabado: false,
  });

  const toggleDia = (dia) => {
    setDias({ ...dias, [dia]: !dias[dia] });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Disponibilidad ⏰</Text>
      <Text style={styles.subtitle}>Configura los días que atiendes en la clínica.</Text>

      <ScrollView style={styles.scroll}>
        {Object.keys(dias).map((dia) => (
          <Surface key={dia} style={styles.surface}>
            <List.Item
              title={dia}
              description={dias[dia] ? "Atendiendo: 09:00 - 18:00" : "Cerrado / Descanso"}
              left={props => <List.Icon {...props} icon="calendar-check" color={dias[dia] ? "#2E8B57" : "#ccc"} />}
              right={() => (
                <Switch
                  value={dias[dia]}
                  onValueChange={() => toggleDia(dia)}
                  color="#2E8B57"
                />
              )}
            />
          </Surface>
        ))}
        
        <Button 
          mode="contained" 
          onPress={() => console.log('Guardado')} 
          style={styles.button}
          buttonColor="#2E8B57"
        >
          Guardar Cambios
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 40, color: '#2E8B57' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  scroll: { flex: 1 },
  surface: { marginBottom: 10, borderRadius: 8, elevation: 1 },
  button: { marginTop: 20, marginBottom: 40, paddingVertical: 5 }
});