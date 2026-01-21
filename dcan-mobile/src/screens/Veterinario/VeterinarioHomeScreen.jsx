import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext'; 
import { useTheme } from '../../context/ThemeContext'; // Importamos el tema

const VeterinarianHomeScreen = ({ navigation }) => {
  const { user } = useAuth(); 
  const { theme } = useTheme(); // Obtenemos colores globales
  const { isDarkMode, colors } = theme;
  
  const nombreVet = user?.name || 'Doctor';

  // Definimos estilos dinámicos basados en el tema
  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    card: { backgroundColor: colors.card },
    text: { color: colors.text },
    subText: { color: isDarkMode ? colors.subtitle : '#C8E6C9' },
    cardTitle: { color: colors.text }
  };

  return (
    <ScrollView style={[styles.container, dynamicStyles.container]}>
      {/* HEADER: Mantiene su color verde para identidad de marca */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>¡Hola, Dr. {nombreVet}! 🐾</Text>
          <Text style={[styles.subText, dynamicStyles.subText]}>Panel de Gestión Médica</Text>
        </View>
      </View>

      {/* TARJETA 1: AGENDA */}
      <View style={[styles.card, dynamicStyles.card]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons name="calendar-multiselect" size={26} color="white" />
          </View>
          <Text style={[styles.cardTitle, dynamicStyles.cardTitle]}>Mi Agenda</Text>
        </View>
        <TouchableOpacity 
          style={[styles.mainButton, { backgroundColor: colors.primary }]} 
          onPress={() => navigation.navigate('Agenda')}
        >
          <Text style={styles.mainButtonText}>Ver Citas de Hoy</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* TARJETA 2: PACIENTES */}
      <View style={[styles.card, dynamicStyles.card]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, { backgroundColor: '#3498DB' }]}>
            <MaterialCommunityIcons name="dog-side" size={26} color="white" />
          </View>
          <Text style={[styles.cardTitle, dynamicStyles.cardTitle]}>Mis Pacientes</Text>
        </View>
        <TouchableOpacity 
          style={[styles.mainButton, { backgroundColor: '#3498DB' }]} 
          onPress={() => navigation.navigate('Pacientes')}
        >
          <Text style={styles.mainButtonText}>Ver Historiales</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* TARJETA 3: HORARIOS */}
      <View style={[styles.card, dynamicStyles.card]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, { backgroundColor: '#F39C12' }]}>
            <MaterialCommunityIcons name="clock-check" size={26} color="white" />
          </View>
          <Text style={[styles.cardTitle, dynamicStyles.cardTitle]}>Mis Horarios</Text>
        </View>
        <TouchableOpacity 
          style={[styles.mainButton, { backgroundColor: '#F39C12' }]}
          onPress={() => navigation.navigate('Horarios')}
        >
          <Text style={styles.mainButtonText}>Gestionar Horarios</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Espaciador final para Scroll */}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    paddingTop: 60, paddingBottom: 40, 
    borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
    marginBottom: 20, elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContent: { alignItems: 'center' },
  welcomeText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  subText: { marginTop: 5, fontSize: 16 },
  card: {
    marginHorizontal: 20,
    padding: 20, borderRadius: 25, marginBottom: 15, 
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconCircle: { padding: 10, borderRadius: 15, marginRight: 12 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  mainButton: { 
    flexDirection: 'row', 
    padding: 14, borderRadius: 15, justifyContent: 'center', alignItems: 'center' 
  },
  mainButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginRight: 5 }
});

export default VeterinarianHomeScreen;