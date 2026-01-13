import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const VeterinarianHome = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      {/* CABECERA ESTILO D'CAN */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>¡Hola, Dr. Veterinario! 🐾</Text>
          <Text style={styles.subText}>Panel de Gestión Médica</Text>
        </View>
      </View>

      {/* SECCIÓN A: AGENDA DEL DÍA */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="calendar-check" size={24} color="#2D5A27" />
          <Text style={styles.cardTitle}> Citas de hoy</Text>
        </View>
        <Text style={styles.cardContent}>Tienes 4 citas programadas para hoy.</Text>
        <TouchableOpacity style={styles.buttonLink} onPress={() => navigation.navigate('Agenda')}>
          <Text style={styles.buttonText}>Ver Agenda Completa</Text>
        </TouchableOpacity>
      </View>

      {/* SECCIÓN B: GESTIÓN MÉDICA */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="stethoscope" size={24} color="#2D5A27" />
          <Text style={styles.cardTitle}> Consultas Rápidas</Text>
        </View>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>+ Registrar Diagnóstico / Receta</Text>
        </TouchableOpacity>
      </View>

      {/* SECCIÓN C: DISPONIBILIDAD */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="clock-outline" size={24} color="#2D5A27" />
          <Text style={styles.cardTitle}> Mi Disponibilidad</Text>
        </View>
        <Text style={styles.cardContent}>Estado actual: Disponible hasta las 18:00</Text>
        <TouchableOpacity style={styles.buttonLink}>
          <Text style={styles.buttonText}>Gestionar Horarios</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F5F0' },
  header: { 
    backgroundColor: '#2D8B4D', // El verde de tu imagen
    padding: 30, 
    borderBottomLeftRadius: 40, 
    borderBottomRightRadius: 40,
    marginBottom: 20 
  },
  welcomeText: { color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  subText: { color: '#E0E0E0', textAlign: 'center', marginTop: 5 },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    elevation: 3, // Sombra en Android
    shadowColor: '#000', // Sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#2D5A27' },
  cardContent: { color: '#666', marginBottom: 10 },
  buttonLink: { alignSelf: 'flex-end' },
  buttonText: { color: '#2D8B4D', fontWeight: 'bold' },
  actionButton: { 
    backgroundColor: '#2D8B4D', 
    padding: 12, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  actionText: { color: 'white', fontWeight: 'bold' }
});

export default VeterinarianHome;