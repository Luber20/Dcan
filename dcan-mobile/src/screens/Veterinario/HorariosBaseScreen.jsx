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
  const [activeConfig, setActiveConfig] = useState(null);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [esNuevoRegistro, setEsNuevoRegistro] = useState(true);

  useEffect(() => { fetchCurrentAvailability(); }, []);
  const fetchCurrentAvailability = async () => {
  try {
    setLoading(true);
    const token = await SecureStore.getItemAsync("authToken");
    
    // El timestamp ?t= es vital para que no te traiga datos viejos
    const response = await axios.get(`${API_URL}/veterinarian/availability?t=${Date.now()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = response.data.dias || response.data;

    // --- LA NUEVA LÓGICA MÁS FLEXIBLE ---
    // Si 'data' existe y tiene el día 'Lunes', asumimos que ya hay horario guardado.
    // No verificamos IDs, solo la existencia de la estructura.
    if (data && data.Lunes) {
      console.log("✅ Horario detectado. Modo: Actualizar.");
      setDias(data);
      setEsNuevoRegistro(false); 
    } else {
      console.log("ℹ️ No hay datos guardados. Modo: Establecer.");
      setEsNuevoRegistro(true);
      setDias(VALORES_DEFAULT);
    }

  } catch (error) {
    // Si la API da 404 (No encontrado), es correcto que sea Nuevo Registro
    console.log("❌ Error o sin registros: ", error.message);
    setEsNuevoRegistro(true);
    setDias(VALORES_DEFAULT);
  } finally {
    setLoading(false);
  }
};

  const abrirReloj = (dia, campo) => {
    const horaString = dias[dia][campo] || "09:00";
    const [h, m] = horaString.split(':').map(Number);
    
    // TRUCO 1: Seteamos una fecha pero con milisegundos variables 
    // para que React siempre detecte un cambio de estado
    const d = new Date(); 
    d.setHours(h, m, 0, Math.floor(Math.random() * 1000));
    
    setPickerDate(d); 
    setActiveConfig({ dia, campo }); 
    setShowPicker(true);
  };

  const handlePickerChange = (event, selectedDate) => {
    // IMPORTANTE: Primero cerramos para Android
    setShowPicker(false);

    if (event.type === 'set' && selectedDate && activeConfig) {
      const h = String(selectedDate.getHours()).padStart(2, '0');
      const m = String(selectedDate.getMinutes()).padStart(2, '0');
      const nuevaHora = `${h}:${m}`;
      
      const { dia, campo } = activeConfig;
      
      setDias(prev => ({ 
        ...prev, 
        [dia]: { ...prev[dia], [campo]: nuevaHora } 
      }));
    }
    // TRUCO 2: Limpiamos absolutamente todo para la siguiente vuelta
    setActiveConfig(null);
  };

  const saveAvailability = () => {
    const titulo = esNuevoRegistro ? "¿Confirmar Horario Definitivo?" : "¿Actualizar Jornada Laboral?";
    const mensaje = esNuevoRegistro
      ? "Has configurado los horarios de tu clínica por primera vez. Una vez confirmados, los clientes podrán visualizar estos bloques para agendar citas. ¿Deseas establecer esta configuración?"
      : "Advertencia: Estás modificando tu jornada laboral actual. Recuerda que podrías tener citas agendadas en las horas modificadas. Si existen compromisos previos, aparecerán como 'Nivelación' y deberás atenderlos. ¿Deseas aplicar los cambios?";

    Alert.alert(titulo, mensaje, [
      { text: "Revisar", style: "cancel" },
      { text: "Confirmar", onPress: ejecutarGuardado }
    ]);
  };

  const ejecutarGuardado = async () => {
    setSaving(true);
    try {
      const token = await SecureStore.getItemAsync("authToken");
      await axios.post(`${API_URL}/veterinarian/availability`, { dias }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert("¡Éxito!", "La configuración ha sido guardada.");
      setEsNuevoRegistro(false); 
    } catch (error) { 
      Alert.alert("Error", "No se pudo conectar con el servidor."); 
    } finally { setSaving(false); }
  };

  if (loading) return (
    <View style={{flex: 1, justifyContent: 'center', backgroundColor: colors.background}}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{padding: 20}}>
        <Text style={[styles.mainTitle, {color: colors.primary}]}>Horarios de Atención</Text>
        <Text style={[styles.mainSubtitle, {color: colors.text}]}>Configura tus horas base y tiempos de descanso.</Text>

        {Object.keys(dias).map((dia) => (
          <Surface key={dia} style={[styles.surface, { backgroundColor: colors.card }]} elevation={2}>
            <View style={styles.innerContainer}>
              <List.Item
                title={dia}
                titleStyle={{fontWeight: 'bold', color: colors.text, fontSize: 18}}
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
                  <Text style={[styles.sectionLabel, {color: colors.primary}]}>Jornada Laboral</Text>
                  <View style={styles.row}>
                    <TouchableOpacity style={[styles.timeBox, {backgroundColor: isDarkMode ? '#2c2c2c' : '#f0fdf4'}]} onPress={() => abrirReloj(dia, 'inicio')}>
                      <Text style={styles.timeLabel}>Entrada</Text>
                      <Text style={[styles.timeValue, {color: colors.text}]}>{dias[dia].inicio}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.timeBox, {backgroundColor: isDarkMode ? '#2c2c2c' : '#f0fdf4'}]} onPress={() => abrirReloj(dia, 'fin')}>
                      <Text style={styles.timeLabel}>Salida</Text>
                      <Text style={[styles.timeValue, {color: colors.text}]}>{dias[dia].fin}</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.sectionLabel, {color: colors.primary, marginTop: 15}]}>Tiempo de Almuerzo</Text>
                  <View style={styles.row}>
                    <TouchableOpacity style={[styles.timeBox, {backgroundColor: isDarkMode ? '#2c2c2c' : '#eff6ff'}]} onPress={() => abrirReloj(dia, 'almuerzo_inicio')}>
                      <Text style={styles.timeLabel}>Inicia</Text>
                      <Text style={[styles.timeValue, {color: colors.text}]}>{dias[dia].almuerzo_inicio}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.timeBox, {backgroundColor: isDarkMode ? '#2c2c2c' : '#eff6ff'}]} onPress={() => abrirReloj(dia, 'almuerzo_fin')}>
                      <Text style={styles.timeLabel}>Finaliza</Text>
                      <Text style={[styles.timeValue, {color: colors.text}]}>{dias[dia].almuerzo_fin}</Text>
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
          buttonColor={esNuevoRegistro ? colors.primary : '#E67E22'}
          style={styles.btn}
        >
          {esNuevoRegistro ? "Establecer Horario" : "Actualizar Jornada"}
        </Button>
      </ScrollView>

      {showPicker && (
        <DateTimePicker 
          // El KEY dinámico obliga al componente a destruirse y reconstruirse siempre
          key={`picker-${activeConfig?.dia}-${activeConfig?.campo}-${new Date().getTime()}`}
          value={pickerDate} 
          mode="time" 
          is24Hour={true} 
          display={Platform.OS === 'ios' ? 'spinner' : 'clock'} 
          onChange={handlePickerChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  mainSubtitle: { fontSize: 14, marginBottom: 20, opacity: 0.7 },
  surface: { marginBottom: 15, borderRadius: 12, elevation: 2 },
  innerContainer: { borderRadius: 12, overflow: 'hidden' },
  timeSection: { padding: 15, paddingTop: 0 },
  row: { flexDirection: 'row', gap: 12 },
  timeBox: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  timeLabel: { fontSize: 10, marginBottom: 2, textTransform: 'uppercase', color: '#666' },
  timeValue: { fontSize: 18, fontWeight: 'bold' },
  btn: { marginVertical: 20, borderRadius: 10, paddingVertical: 5 }
});