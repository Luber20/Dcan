import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native'; 
import { List, Switch, Button, Surface, Text, ActivityIndicator } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { API_URL } from "../../config/api";
import * as SecureStore from "expo-secure-store";
import { useTheme } from '../../context/ThemeContext';

const VALORES_DEFAULT = {
  Lunes: { activo: true, inicio: "09:00", fin: "18:00", almuerzo_inicio: "12:00", almuerzo_fin: "13:00" },
  Martes: { activo: true, inicio: "09:00", fin: "18:00", almuerzo_inicio: "12:00", almuerzo_fin: "13:00" },
  Miercoles: { activo: true, inicio: "09:00", fin: "18:00", almuerzo_inicio: "12:00", almuerzo_fin: "13:00" },
  Jueves: { activo: true, inicio: "09:00", fin: "18:00", almuerzo_inicio: "12:00", almuerzo_fin: "13:00" },
  Viernes: { activo: true, inicio: "09:00", fin: "18:00", almuerzo_inicio: "12:00", almuerzo_fin: "13:00" },
  Sabado: { activo: false, inicio: "09:00", fin: "13:00", almuerzo_inicio: "12:00", almuerzo_fin: "13:00" },
  Domingo: { activo: false, inicio: "09:00", fin: "13:00", almuerzo_inicio: "12:00", almuerzo_fin: "13:00" },
};

export default function HorariosBaseScreen() {
  const { theme } = useTheme(); 
  const { isDarkMode, colors } = theme;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dias, setDias] = useState(VALORES_DEFAULT);
  const [showPicker, setShowPicker] = useState(false);
  const [activeConfig, setActiveConfig] = useState({ dia: null, campo: null });
  const [pickerDate, setPickerDate] = useState(new Date());

  useEffect(() => { fetchCurrentAvailability(); }, []);

  const fetchCurrentAvailability = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("authToken");
      const response = await axios.get(`${API_URL}/veterinarian/availability?t=${new Date().getTime()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataRecibida = response.data.dias || response.data;
      if (dataRecibida && typeof dataRecibida === 'object') setDias(dataRecibida);
    } catch (error) { console.log(error.message); } finally { setLoading(false); }
  };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      const token = await SecureStore.getItemAsync("authToken");
      await axios.post(`${API_URL}/veterinarian/availability`, { dias }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert("¡Éxito!", "Horarios guardados.");
    } catch (error) { Alert.alert("Error", "No se pudo guardar."); } finally { setSaving(false); }
  };

  const abrirReloj = (dia, campo) => {
    const [h, m] = dias[dia][campo].split(':').map(Number);
    const d = new Date(); d.setHours(h, m, 0, 0);
    setPickerDate(d); setActiveConfig({ dia, campo }); setShowPicker(true);
  };

  const confirmarHora = (fecha) => {
    const nuevaHora = `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`;
    setDias(prev => ({ ...prev, [activeConfig.dia]: { ...prev[activeConfig.dia], [activeConfig.campo]: nuevaHora } }));
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={{padding: 20}}>
        {Object.keys(dias).map((dia) => (
          <Surface key={dia} style={[styles.surface, { backgroundColor: colors.card }]} elevation={1}>
             <List.Item
                title={dia}
                titleStyle={{fontWeight: 'bold', color: colors.text}}
                right={() => <Switch value={dias[dia].activo} onValueChange={() => setDias(prev => ({...prev, [dia]: {...prev[dia], activo: !prev[dia].activo}}))} />}
              />
              {dias[dia].activo && (
                <View style={styles.timeSection}>
                  <View style={styles.row}>
                    <TouchableOpacity style={[styles.timeBox, {backgroundColor: isDarkMode ? '#252525' : '#F1F8E9'}]} onPress={() => abrirReloj(dia, 'inicio')}>
                      <Text style={styles.timeLabel}>Entrada</Text>
                      <Text style={[styles.timeValue, {color: colors.text}]}>{dias[dia].inicio}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.timeBox, {backgroundColor: isDarkMode ? '#252525' : '#F1F8E9'}]} onPress={() => abrirReloj(dia, 'fin')}>
                      <Text style={styles.timeLabel}>Salida</Text>
                      <Text style={[styles.timeValue, {color: colors.text}]}>{dias[dia].fin}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
          </Surface>
        ))}
        <Button mode="contained" onPress={saveAvailability} loading={saving} style={styles.btn}>Guardar Cambios</Button>
        <View style={{height: 50}} />
      </ScrollView>
      {showPicker && <DateTimePicker value={pickerDate} mode="time" is24Hour={true} display="default" onChange={(e, d) => { setShowPicker(false); if(d) confirmarHora(d); }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  surface: { marginBottom: 10, borderRadius: 10, overflow: 'hidden' },
  timeSection: { padding: 15 },
  row: { flexDirection: 'row', gap: 10 },
  timeBox: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
  timeLabel: { fontSize: 10, opacity: 0.6 },
  timeValue: { fontSize: 16, fontWeight: 'bold' },
  btn: { marginVertical: 20, paddingVertical: 5 }
});