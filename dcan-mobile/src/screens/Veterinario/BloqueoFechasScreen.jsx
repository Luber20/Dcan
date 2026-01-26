import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Text, Button, Surface } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import { API_URL } from "../../config/api";
import * as SecureStore from "expo-secure-store";

// Configuración en español
LocaleConfig.locales['es'] = {
  monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  dayNames: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
  dayNamesShort: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
};
LocaleConfig.defaultLocale = 'es';

export default function BloqueoFechasScreen() {
  const { theme } = useTheme();
  const [selectedDates, setSelectedDates] = useState({});
  const [loading, setLoading] = useState(false);

  // 1. Cargar bloqueos existentes al abrir la pantalla
  useEffect(() => {
    cargarBloqueos();
  }, []);

  const cargarBloqueos = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      const res = await axios.get(`${API_URL}/veterinarian/blocks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const marked = {};
      res.data.forEach(item => {
        marked[item.date] = { selected: true, selectedColor: '#FF5252', marked: true, dotColor: 'white' };
      });
      setSelectedDates(marked);
    } catch (error) {
      console.log("Error cargando bloqueos:", error);
    }
  };

  const onDayPress = async (day) => {
    const dateString = day.dateString;
    setLoading(true);

    try {
      const token = await SecureStore.getItemAsync("authToken");
      // Enviamos la fecha a la ruta toggle
      const res = await axios.post(`${API_URL}/veterinarian/blocks/toggle`, 
        { date: dateString },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Si Laravel responde bien, actualizamos el mapa visualmente
      let newSelectedDates = { ...selectedDates };
      if (newSelectedDates[dateString]) {
        delete newSelectedDates[dateString];
      } else {
        newSelectedDates[dateString] = { selected: true, selectedColor: '#FF5252', marked: true, dotColor: 'white' };
      }
      setSelectedDates(newSelectedDates);
      
    } catch (error) {
      const msg = error.response?.data?.message || "No se pudo cambiar el estado del día.";
      Alert.alert("Atención", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.primary }]}>Gestión de Días Libres 🏖️</Text>
      <Text style={styles.subtitle}>Toca un día para bloquearlo o desbloquearlo.</Text>

      <Surface style={styles.calendarCard} elevation={4}>
        <View style={{ position: 'relative' }}>
          <Calendar
            onDayPress={onDayPress}
            markedDates={selectedDates}
            theme={{
              calendarBackground: theme.colors.card,
              textSectionTitleColor: theme.colors.primary,
              selectedDayBackgroundColor: '#FF5252',
              todayTextColor: theme.colors.primary,
              dayTextColor: theme.colors.text,
              monthTextColor: theme.colors.text,
            }}
          />
          {loading && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator color={theme.colors.primary} size="large" />
            </View>
          )}
        </View>
      </Surface>
      
      <Text style={styles.footerNote}>* Los cambios se guardan automáticamente al tocar cada fecha.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 14, marginBottom: 20, opacity: 0.7 },
  calendarCard: { borderRadius: 15, overflow: 'hidden' },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999
  },
  footerNote: { marginTop: 20, textAlign: 'center', fontSize: 12, opacity: 0.5 }
});