import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native'; 
import { Surface, Text, Avatar } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function DisponibilidadScreen({ navigation }) {
  const { theme } = useTheme(); 
  const { colors } = theme;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.primary }]}>Gestión de Horarios ⏰</Text>
        <Text style={[styles.subtitle, { color: colors.subtitle }]}>Configura tu agenda y días de descanso.</Text>
      </View>

      <View style={styles.menuContainer}>
        {/* BOTÓN 1: HORARIOS BASE */}
        <TouchableOpacity onPress={() => navigation.navigate('HorariosBase')}>
          <Surface style={[styles.card, { backgroundColor: colors.card }]} elevation={2}>
            <View style={styles.cardContent}>
              <Avatar.Icon size={50} icon="calendar-clock" style={{backgroundColor: colors.primary}} />
              <View style={styles.textGroup}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Horarios Base</Text>
                <Text style={styles.cardDesc}>Configura tus turnos de Lunes a Domingo.</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.primary} />
            </View>
          </Surface>
        </TouchableOpacity>

        {/* BOTÓN 2: DÍAS LIBRES */}
        <TouchableOpacity onPress={() => navigation.navigate('BloqueoFechas')} style={{ marginTop: 20 }}>
          <Surface style={[styles.card, { backgroundColor: colors.card }]} elevation={2}>
            <View style={styles.cardContent}>
              <Avatar.Icon size={50} icon="calendar-remove" style={{backgroundColor: '#E74C3C'}} />
              <View style={styles.textGroup}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Días Libres / Feriados</Text>
                <Text style={styles.cardDesc}>Bloquea fechas específicas en el calendario.</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#E74C3C" />
            </View>
          </Surface>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { marginTop: 60, marginBottom: 40 },
  title: { fontSize: 26, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 5 },
  menuContainer: { flex: 1 },
  card: { padding: 20, borderRadius: 15 },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  textGroup: { flex: 1, marginLeft: 15 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  cardDesc: { fontSize: 13, opacity: 0.6, marginTop: 2 }
});