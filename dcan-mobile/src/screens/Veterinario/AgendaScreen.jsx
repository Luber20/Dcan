import { useTheme } from '../../context/ThemeContext';
import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, RefreshControl, Alert, 
  TextInput, Modal, TouchableOpacity, ScrollView, 
  KeyboardAvoidingView, Platform 
} from 'react-native';
import { Badge, Avatar, Button, Surface, Divider, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../../config/api";

const AgendaScreen = () => {
  const { theme } = useTheme();
  const { isDarkMode, colors } = theme;

  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  
  const [formConsulta, setFormConsulta] = useState({ 
    peso: '', 
    temperatura: '',
    diagnostico: '',
    tratamiento: '' 
  });

  const fetchCitas = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      const response = await axios.get(`${API_URL}/veterinarian/appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (Array.isArray(response.data)) {
        const soloPendientes = response.data.filter(c => c.status?.toLowerCase() === 'pending');
        const ordenadas = soloPendientes.sort((a, b) => {
          const fechaA = new Date(`${a.date}T${a.hora_formateada || a.time}`);
          const fechaB = new Date(`${b.date}T${b.hora_formateada || b.time}`);
          return fechaA - fechaB;
        });
        setCitas(ordenadas);
      }
    } catch (error) {
      console.log('Error fetchCitas:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchCitas(); }, []));

  const cancelarCita = (id) => {
    Alert.alert(
      "Confirmar inasistencia",
      "¿Deseas marcar esta cita como 'No asistió'?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sí, No asistió", 
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync("authToken");
              await axios.post(`${API_URL}/veterinarian/update-status/${id}`, 
                { status: 'cancelled' }, 
                { headers: { 'Authorization': `Bearer ${token}` } }
              );
              Alert.alert("Actualizado", "La cita ha sido marcada como inasistencia.");
              fetchCitas();
            } catch (e) {
              console.log("Error status:", e.response?.status, e.response?.data);
              Alert.alert("Error", `Servidor respondió: ${e.response?.status || 'Error de red'}`);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleNumericInput = (text, field) => {
    let normalized = text.replace(',', '.').replace(/[^0-9.]/g, '');
    const parts = normalized.split('.');
    if (parts.length > 2) return;
    if (normalized.length > 4) return;
    setFormConsulta({ ...formConsulta, [field]: normalized });
  };

  const guardarConsultaYFinalizar = async () => {
    const { peso, temperatura, diagnostico, tratamiento } = formConsulta;
    
    if (!peso.trim() || !temperatura.trim() || !diagnostico.trim() || !tratamiento.trim()) {
      Alert.alert('Campos Obligatorios', 'Por favor, completa todos los campos: Peso, Temperatura, Diagnóstico y Tratamiento.');
      return;
    }

    try {
      const token = await SecureStore.getItemAsync("authToken");
      await axios.post(`${API_URL}/veterinarian/complete-appointment`, {
        appointment_id: citaSeleccionada.id,
        diagnostico: diagnostico,
        peso: peso,
        temperatura: temperatura,
        tratamiento: tratamiento
      }, { headers: { 'Authorization': `Bearer ${token}` } });

      setModalVisible(false);
      Alert.alert('Éxito', 'Ficha guardada correctamente.');
      fetchCitas(); 
    } catch (error) {
      console.log("Error al completar:", error.response?.data || error.message);
      Alert.alert('Error', 'Hubo un problema al guardar la ficha médica.');
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background}}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primary }]}>Agenda Médica 🐾</Text>
      
      <FlatList
        data={citas}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => {setRefreshing(true); fetchCitas();}} 
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hay citas pendientes.</Text>}
        renderItem={({ item }) => {
          const mascota = item.mascota || {};
          const notaCliente = item.notes || "El cliente no dejó comentarios.";
          const esExtraordinaria = item.fuera_de_horario;

          return (
            <Surface 
              style={[
                styles.cardCustom,
                { backgroundColor: colors.surface },
                esExtraordinaria && { borderLeftWidth: 5, borderLeftColor: '#FFA500' }
              ]} 
              elevation={2}
            >
              {esExtraordinaria && (
                <View style={{ backgroundColor: isDarkMode ? 'rgba(255, 164, 0, 0.2)' : '#FFF4E5', padding: 8, borderRadius: 8, marginBottom: 10 }}>
                  <Text style={{ color: '#CC7A00', fontWeight: 'bold', fontSize: 11 }}>
                    ⚠️ COMPROMISO PREVIO (FUERA DE JORNADA)
                  </Text>
                </View>
              )}

              <View style={styles.headerRow}>
                <Avatar.Text 
                  size={45} 
                  label={mascota.nombre?.substring(0,2).toUpperCase() || 'PA'} 
                  style={{ backgroundColor: esExtraordinaria ? '#FFA500' : colors.primary }} 
                />
                <View style={styles.headerText}>
                  <Text style={[styles.petNameText, { color: colors.text }]}>{mascota.nombre}</Text>
                  <Text style={[styles.ownerText, { color: colors.textSecondary }]}>👤 Dueño: {item.cliente?.name || 'N/A'}</Text>
                </View>
                <Badge style={[styles.statusBadge, esExtraordinaria && { backgroundColor: '#FFA500' }]}>
                  {esExtraordinaria ? 'NIVELACIÓN' : 'PENDIENTE'}
                </Badge>
              </View>

              <Divider style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.detailsContainer}>
                <View style={styles.infoLine}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>🏥 Servicio:</Text>
                  <Text style={[styles.infoValBold, {color: esExtraordinaria ? '#FFA500' : colors.primary}]}>
                    {item.motivo}
                  </Text>
                </View>

                <View style={[
                  styles.notesBox, 
                  { backgroundColor: isDarkMode ? colors.surfaceVariant : '#F9F9F9' },
                  esExtraordinaria && { borderLeftColor: '#FFA500' },
                  !esExtraordinaria && { borderLeftColor: colors.primary }
                ]}>
                  <Text style={[styles.notesLabel, esExtraordinaria ? { color: '#FFA500' } : { color: colors.primary }]}>
                    📝 NOTA DEL CLIENTE:
                  </Text>
                  <Text style={[styles.notesText, { color: colors.text }]}>"{notaCliente}"</Text>
                </View>

                <View style={styles.infoLine}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>📅 Cuándo:</Text>
                  <Text style={[styles.infoVal, { color: colors.text }, esExtraordinaria && { fontWeight: 'bold' }]}>
                    {item.date} • {item.hora_formateada || item.time}
                  </Text>
                </View>

                <View style={[styles.infoRowGrid, { backgroundColor: isDarkMode ? colors.surfaceVariant : '#F8FDF9' }]}>
                  <Text style={[styles.infoVal, { color: colors.text }]}><Text style={{fontWeight:'bold'}}>Edad:</Text> {mascota.edad}</Text>
                  <Text style={[styles.infoVal, { color: colors.text }]}><Text style={{fontWeight:'bold'}}>Sexo:</Text> {mascota.sexo}</Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity onPress={() => cancelarCita(item.id)} style={[styles.btnAction, styles.btnOutline]}>
                  <Text style={styles.btnTextRed}>No asistió</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => {
                    setCitaSeleccionada(item);
                    setFormConsulta({ peso: '', temperatura: '', diagnostico: '', tratamiento: '' });
                    setModalVisible(true);
                  }}
                  style={[styles.btnAction, styles.btnSolid, { backgroundColor: esExtraordinaria ? '#FFA500' : colors.primary }]}
                >
                  <Text style={styles.btnTextWhite}>Atender ahora</Text>
                </TouchableOpacity>
              </View>
            </Surface>
          );
        }}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}>
          <View style={[
            styles.modalContent, 
            { 
              backgroundColor: isDarkMode ? '#1E1E1E' : 'white',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5
            }
          ]}>
            <Text style={[styles.modalHeader, { color: colors.primary }]}>Ficha de Atención</Text>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
                Paciente: <Text style={{fontWeight: 'bold', color: colors.text}}>{citaSeleccionada?.mascota?.nombre}</Text>
              </Text>

              <View style={styles.modalRow}>
                <View style={{flex: 1, marginRight: 10}}>
                  <Text style={[styles.labelInput, { color: colors.text }]}>Peso (kg)</Text>
                  <TextInput 
                    placeholder="0.0" 
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.input, { 
                      borderColor: colors.border, 
                      backgroundColor: isDarkMode ? '#2A2A2A' : '#FAFAFA',
                      color: colors.text 
                    }]} 
                    keyboardType="numeric" 
                    value={formConsulta.peso} 
                    onChangeText={(t) => handleNumericInput(t, 'peso')} 
                    maxLength={4}
                  />
                </View>
                <View style={{flex: 1}}>
                  <Text style={[styles.labelInput, { color: colors.text }]}>Temp (°C)</Text>
                  <TextInput 
                    placeholder="38.5"
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.input, { 
                      borderColor: colors.border, 
                      backgroundColor: isDarkMode ? '#2A2A2A' : '#FAFAFA',
                      color: colors.text 
                    }]} 
                    keyboardType="numeric" 
                    value={formConsulta.temperatura} 
                    onChangeText={(t) => handleNumericInput(t, 'temperatura')} 
                    maxLength={4}
                  />
                </View>
              </View>

              <Text style={[styles.labelInput, { color: colors.text }]}>Diagnóstico Médico</Text>
              <TextInput 
                placeholder="Escribe el diagnóstico..."
                placeholderTextColor={colors.textSecondary}
                multiline 
                value={formConsulta.diagnostico} 
                style={[styles.input, styles.textArea, { 
                  borderColor: colors.border, 
                  backgroundColor: isDarkMode ? '#2A2A2A' : '#FAFAFA',
                  color: colors.text 
                }]} 
                onChangeText={(t) => setFormConsulta({...formConsulta, diagnostico: t})} 
              />

              <Text style={[styles.labelInput, { color: colors.text }]}>Tratamiento / Receta</Text>
              <TextInput 
                placeholder="Indica el tratamiento..."
                placeholderTextColor={colors.textSecondary}
                multiline 
                value={formConsulta.tratamiento} 
                style={[styles.input, styles.textArea, { 
                  borderColor: colors.border, 
                  backgroundColor: isDarkMode ? '#2A2A2A' : '#FAFAFA',
                  color: colors.text 
                }]} 
                onChangeText={(t) => setFormConsulta({...formConsulta, tratamiento: t})} 
              />
              
              <Button mode="contained" onPress={guardarConsultaYFinalizar} buttonColor={colors.primary} style={styles.btnFinish}>Finalizar Consulta</Button>
              <Button onPress={() => setModalVisible(false)} textColor={colors.textSecondary}>Cerrar</Button>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, padding: 15 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 40, marginBottom: 15 },
  cardCustom: { borderRadius: 15, padding: 16, marginBottom: 15 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerText: { flex: 1, marginLeft: 12 },
  petNameText: { fontSize: 17, fontWeight: 'bold' },
  ownerText: { fontSize: 13 },
  statusBadge: { backgroundColor: '#FFA500', color: 'white', fontSize: 10, paddingHorizontal: 8 },
  divider: { marginVertical: 12 },
  detailsContainer: { marginBottom: 10 },
  infoLine: { flexDirection: 'row', marginBottom: 5, alignItems: 'center' },
  infoLabel: { fontWeight: 'bold', width: 85, fontSize: 13 },
  infoVal: { fontSize: 13, flex: 1 },
  infoValBold: { fontSize: 13, fontWeight: 'bold' },
  notesBox: { padding: 10, borderRadius: 8, marginVertical: 8, borderLeftWidth: 4 },
  notesLabel: { fontSize: 11, fontWeight: 'bold', marginBottom: 2 },
  notesText: { fontSize: 12, fontStyle: 'italic' },
  infoRowGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, padding: 8, borderRadius: 8 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  btnAction: { flex: 0.48, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnOutline: { borderWidth: 1.5, borderColor: '#d32f2f' },
  btnSolid: {},
  btnTextRed: { color: '#d32f2f', fontWeight: 'bold', fontSize: 13 },
  btnTextWhite: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '92%', maxHeight: '85%', padding: 20, borderRadius: 20 },
  modalHeader: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  modalSub: { textAlign: 'center', fontSize: 14, marginBottom: 15 },
  modalRow: { flexDirection: 'row' },
  labelInput: { fontSize: 13, fontWeight: 'bold', marginBottom: 4, marginTop: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10 },
  textArea: { height: 80, textAlignVertical: 'top' },
  btnFinish: { marginTop: 10, borderRadius: 8 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16 }
});

export default AgendaScreen;