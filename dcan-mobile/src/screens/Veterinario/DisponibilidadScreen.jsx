import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native'; 
import { List, Switch, Button, Surface, Text, ActivityIndicator, Divider } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { API_URL } from "../../config/api";
import * as SecureStore from "expo-secure-store";
import { useTheme } from '../../context/ThemeContext'; // Importamos tu tema

const VALORES_DEFAULT = {
  Lunes: { activo: true, inicio: "09:00", fin: "18:00", almuerzo_inicio: "12:00", almuerzo_fin: "13:00" },
  Martes: { activo: true, inicio: "09:00", fin: "18:00", almuerzo_inicio: "12:00", almuerzo_fin: "13:00" },
  Miercoles: { activo: true, inicio: "09:00", fin: "18:00", almuerzo_inicio: "12:00", almuerzo_fin: "13:00" },
  Jueves: { activo: true, inicio: "09:00", fin: "18:00", almuerzo_inicio: "12:00", almuerzo_fin: "13:00" },
  Viernes: { activo: true, inicio: "09:00", fin: "18:00", almuerzo_inicio: "12:00", almuerzo_fin: "13:00" },
  Sabado: { activo: false, inicio: "09:00", fin: "13:00", almuerzo_inicio: "12:00", almuerzo_fin: "13:00" },
  Domingo: { activo: false, inicio: "09:00", fin: "13:00", almuerzo_inicio: "12:00", almuerzo_fin: "13:00" },
};

export default function DisponibilidadScreen() {
  const { theme } = useTheme(); // Consumimos tu ThemeContext
  const { isDarkMode, colors } = theme;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dias, setDias] = useState(VALORES_DEFAULT);
  const [refreshKey, setRefreshKey] = useState(0); // Para forzar re-render sin rebotes

  const [showPicker, setShowPicker] = useState(false);
  const [activeConfig, setActiveConfig] = useState({ dia: null, campo: null });
  const [pickerDate, setPickerDate] = useState(new Date());

  useEffect(() => {
    fetchCurrentAvailability();
  }, []);

  const fetchCurrentAvailability = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("authToken");
      
      // SOLUCIÓN CACHÉ: Timestamp (?t=) para que el servidor no de datos viejos
      const response = await axios.get(`${API_URL}/veterinarian/availability?t=${new Date().getTime()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const dataRecibida = response.data.dias || response.data;
      
      if (dataRecibida && typeof dataRecibida === 'object' && Object.keys(dataRecibida).length > 0) {
        setDias(dataRecibida);
        setRefreshKey(prev => prev + 1); // Reset de UI
      }
    } catch (error) {
      console.log("❌ ERROR EN GET:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      const token = await SecureStore.getItemAsync("authToken");
      
      const response = await axios.post(`${API_URL}/veterinarian/availability`, { dias }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert("¡Éxito!", "Configuración guardada correctamente.");
        await fetchCurrentAvailability(); // Sincronización post-guardado
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  const abrirReloj = (dia, campo) => {
    const [h, m] = dias[dia][campo].split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    setPickerDate(d);
    setActiveConfig({ dia, campo });
    setShowPicker(true);
  };

  const onTimeChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === "set" && selectedDate) {
        confirmarHora(selectedDate);
      }
    } else if (selectedDate) {
      setPickerDate(selectedDate);
    }
  };

  const confirmarHora = (fecha) => {
    const h = fecha.getHours().toString().padStart(2, '0');
    const m = fecha.getMinutes().toString().padStart(2, '0');
    const nuevaHora = `${h}:${m}`;
    
    setDias(prev => ({
      ...prev,
      [activeConfig.dia]: { ...prev[activeConfig.dia], [activeConfig.campo]: nuevaHora }
    }));
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} key={refreshKey}>
      <Text style={[styles.title, { color: colors.primary }]}>Mi Disponibilidad ⏰</Text>
      <Text style={[styles.subtitle, { color: colors.subtitle }]}>Configura tus horarios de atención.</Text>

      <ScrollView style={styles.scroll}>
        {Object.keys(dias).map((dia) => (
          <Surface key={`${refreshKey}-${dia}`} style={[styles.surface, { backgroundColor: colors.card }]} elevation={2}>
            <View style={[styles.innerCard, !dias[dia].activo && styles.disabledCard]}>
              <List.Item
                title={dia}
                titleStyle={[styles.diaTitle, { color: colors.text }]}
                right={() => (
                  <Switch 
                    value={dias[dia].activo} 
                    onValueChange={() => setDias(prev => ({...prev, [dia]: {...prev[dia], activo: !prev[dia].activo}}))} 
                    color={colors.primary} 
                  />
                )}
              />

              {dias[dia].activo && (
                <View style={styles.timeSection}>
                  <View style={styles.row}>
                    <TouchableOpacity 
                      style={[styles.timeBox, { backgroundColor: isDarkMode ? '#252525' : '#F1F8E9' }]} 
                      onPress={() => abrirReloj(dia, 'inicio')}
                    >
                      <Text style={[styles.timeLabel, { color: colors.subtitle }]}>Entrada</Text>
                      <Text style={[styles.timeValue, { color: colors.text }]}>{dias[dia].inicio}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.timeBox, { backgroundColor: isDarkMode ? '#252525' : '#F1F8E9' }]} 
                      onPress={() => abrirReloj(dia, 'fin')}
                    >
                      <Text style={[styles.timeLabel, { color: colors.subtitle }]}>Salida</Text>
                      <Text style={[styles.timeValue, { color: colors.text }]}>{dias[dia].fin}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.row, {marginTop: 10}]}>
                    <TouchableOpacity 
                      style={[styles.timeBox, styles.lunchBox, { backgroundColor: isDarkMode ? '#2c1f10' : '#FFF3E0' }]} 
                      onPress={() => abrirReloj(dia, 'almuerzo_inicio')}
                    >
                      <Text style={[styles.timeLabel, { color: colors.subtitle }]}>Almuerzo</Text>
                      <Text style={[styles.timeValue, { color: colors.text }]}>{dias[dia].almuerzo_inicio}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.timeBox, styles.lunchBox, { backgroundColor: isDarkMode ? '#2c1f10' : '#FFF3E0' }]} 
                      onPress={() => abrirReloj(dia, 'almuerzo_fin')}
                    >
                      <Text style={[styles.timeLabel, { color: colors.subtitle }]}>Fin Almuerzo</Text>
                      <Text style={[styles.timeValue, { color: colors.text }]}>{dias[dia].almuerzo_fin}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </Surface>
        ))}
        
        <Button 
          mode="contained" 
          onPress={saveAvailability} 
          loading={saving} 
          disabled={saving}
          style={styles.button} 
          buttonColor={colors.primary}
        >
          {saving ? "Guardando..." : "Guardar Configuración"}
        </Button>
        <View style={{ height: 40 }} />
      </ScrollView>

      {showPicker && (
        <View style={[styles.iosWrapper, isDarkMode && { backgroundColor: '#1e1e1e', borderTopColor: '#333' }]}>
          {Platform.OS === 'ios' && (
            <View style={styles.iosBar}>
              <Button onPress={() => setShowPicker(false)} textColor="red">Cancelar</Button>
              <Button onPress={() => { setShowPicker(false); confirmarHora(pickerDate); }}>Aceptar</Button>
            </View>
          )}
          <DateTimePicker
            value={pickerDate}
            mode="time"
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
            onChange={onTimeChange}
            textColor={isDarkMode ? 'white' : 'black'}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginTop: 50 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  scroll: { flex: 1 },
  surface: { marginBottom: 15, borderRadius: 15 },
  innerCard: { borderRadius: 15, overflow: 'hidden' },
  disabledCard: { opacity: 0.4 },
  diaTitle: { fontWeight: 'bold', fontSize: 18 },
  timeSection: { padding: 15, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  row: { flexDirection: 'row', gap: 10 },
  timeBox: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
  lunchBox: { borderLeftWidth: 3, borderLeftColor: '#F39C12' },
  timeLabel: { fontSize: 10, textTransform: 'uppercase', marginBottom: 2 },
  timeValue: { fontSize: 18, fontWeight: 'bold' },
  button: { marginVertical: 20, borderRadius: 12, paddingVertical: 5 },
  iosWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#eee', zIndex: 1000 },
  iosBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 }
});