import { useTheme } from '../../context/ThemeContext';
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { Searchbar, List, Avatar, Surface, Button, Divider, Badge } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../../config/api";

export default function GestionMedicaScreen() {
  const { theme } = useTheme();
  const { isDarkMode, colors } = theme;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [verFichaVisible, setVerFichaVisible] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("authToken");
      const response = await axios.get(`${API_URL}/veterinarian/patients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (Array.isArray(response.data)) {
        setPacientes(response.data);
        // DEPURACIÓN: Esto imprimirá en tu terminal lo que llega del servidor
        console.log("DATOS RECIBIDOS:", JSON.stringify(response.data.map(p => ({
            pet: p.nombre,
            citas: p.appointments.map(a => a.status)
        }))));
      }
    } catch (error) {
      console.log("❌ Error fetching patients:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchPacientes(); }, []));

  const filteredPacientes = pacientes.filter(p =>
    p.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.dueno?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primary }]}>Historial de Pacientes 🐾</Text>
      
      <Searchbar
        placeholder="Buscar mascota o dueño..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.search, { backgroundColor: colors.surface }]}
        iconColor={colors.primary}
        placeholderTextColor={colors.textSecondary}
        theme={{ colors: { text: colors.text } }}
      />

      {loading && !refreshing ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredPacientes}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={() => {setRefreshing(true); fetchPacientes();}}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => {
            // CAMBIO CLAVE: Quitamos cualquier filtro de status. 
            // Si Laravel envía la cita, React la mostrará.
            const historialCitas = item.appointments || [];

            return (
              <Surface style={[styles.itemContainer, { backgroundColor: colors.surface }]} elevation={1}>
                <View style={styles.innerContainer}>
                  <List.Accordion
                    title={item.nombre || "Paciente"}
                    titleStyle={{ color: colors.text, fontWeight: 'bold' }}
                    description={`👤 Dueño: ${item.dueno || 'N/A'} • ${item.especie || ''}`}
                    descriptionStyle={{ color: colors.textSecondary }}
                    style={{ backgroundColor: colors.surface }}
                    left={props => (
                      <View style={{ justifyContent: 'center', paddingLeft: 10 }}>
                        <Avatar.Text 
                          size={40} 
                          label={item.nombre?.substring(0,2).toUpperCase()} 
                          style={{backgroundColor: colors.primary}}
                        />
                      </View>
                    )}
                  >
                    <View style={[styles.historyContainer, { backgroundColor: isDarkMode ? colors.surfaceVariant : '#f1f8f4' }]}>
                      <Text style={[styles.historyTitle, { color: colors.primary }]}>HISTORIAL DE ACTIVIDAD</Text>
                      
                      {historialCitas.map((cita, index) => {
                        // Verificamos si es cualquier cosa que NO sea "completed"
                        const esInasistencia = cita.status?.toLowerCase() !== 'completed';

                        return (
                          <View key={cita.id || index} style={[styles.appointmentRow, { borderBottomColor: colors.border }]}>
                            <View style={{ flex: 1 }}>
                              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
                                <Text style={[styles.dateText, { color: colors.text, fontWeight: 'bold' }]}>
                                  📅 {cita.date}
                                </Text>
                                {esInasistencia ? (
                                  <Badge style={styles.badgeRed}>NO ASISTIÓ</Badge>
                                ) : (
                                  <Badge style={[styles.badgeGreen, { backgroundColor: colors.primary }]}>ATENDIDO</Badge>
                                )}
                              </View>
                              <Text style={[styles.reasonText, { color: colors.textSecondary }]}>
                                Estado: {cita.status} • Tipo: {cita.type || 'Consulta'}
                              </Text>
                            </View>
                            
                            {!esInasistencia && (
                              <Button 
                                mode="outlined" 
                                onPress={() => { 
                                  setCitaSeleccionada(cita); 
                                  setPacienteSeleccionado(item); 
                                  setVerFichaVisible(true); 
                                }}
                                textColor={colors.primary}
                                style={{ borderColor: colors.primary }}
                                labelStyle={{fontSize: 10}}
                              >
                                VER FICHA
                              </Button>
                            )}
                          </View>
                        );
                      })}
                      
                      {historialCitas.length === 0 && (
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hay registros para este paciente.</Text>
                      )}
                    </View>
                  </List.Accordion>
                </View>
              </Surface>
            );
          }}
        />
      )}

      {/* MODAL FICHA */}
      <Modal visible={verFichaVisible} transparent animationType="slide" onRequestClose={() => setVerFichaVisible(false)}>
        <View style={styles.overlay}>
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
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={[styles.modalTitle, { color: colors.primary }]}>Ficha Médica Digital</Text>
                
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>🐾 Información del Paciente</Text>
                </View>
                <View style={[styles.patientInfoBox, { 
                  backgroundColor: isDarkMode ? '#2A2A2A' : '#f8f9fa', 
                  borderColor: colors.border 
                }]}>
                    <View style={styles.infoGrid}>
                        <View style={styles.gridItem}>
                            <Text style={[styles.labelSmall, { color: colors.textSecondary }]}>Especie</Text>
                            <Text style={[styles.valSmall, { color: colors.text }]}>{pacienteSeleccionado?.especie || 'N/A'}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={[styles.labelSmall, { color: colors.textSecondary }]}>Sexo</Text>
                            <Text style={[styles.valSmall, { color: colors.text }]}>{pacienteSeleccionado?.sexo || 'N/A'}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={[styles.labelSmall, { color: colors.textSecondary }]}>Edad</Text>
                            <Text style={[styles.valSmall, { color: colors.text }]}>{pacienteSeleccionado?.edad || 'N/A'}</Text>
                        </View>
                    </View>
                    <View style={[styles.infoRowSimple, { borderTopColor: colors.border }]}>
                        <Text style={[styles.label, { color: colors.text }]}>Dueño: </Text>
                        <Text style={[styles.val, { color: colors.textSecondary }]}>{pacienteSeleccionado?.dueno}</Text>
                    </View>
                </View>

                <Divider style={{ marginVertical: 15, backgroundColor: colors.border }} />

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>🩺 Evaluación Clínica</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <View style={{flex: 1}}>
                    <Text style={[styles.label, { color: colors.text }]}>Peso: </Text>
                    <Text style={[styles.val, { color: colors.textSecondary }]}>{citaSeleccionada?.weight || '--'} kg</Text>
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={[styles.label, { color: colors.text }]}>Temperatura: </Text>
                    <Text style={[styles.val, { color: colors.textSecondary }]}>{citaSeleccionada?.temperatura || '--'} °C</Text>
                  </View>
                </View>

                <Text style={[styles.label, { color: colors.text }]}>Diagnóstico:</Text>
                <View style={[styles.diagBox, { 
                  backgroundColor: isDarkMode ? '#2A2A2A' : '#f5f5f5', 
                  borderLeftColor: colors.primary 
                }]}>
                  <Text style={[styles.diagText, { color: colors.text }]}>{citaSeleccionada?.diagnosis || 'Sin registro'}</Text>
                </View>

                <Text style={[styles.label, {marginTop: 15, color: colors.text}]}>Tratamiento:</Text>
                <View style={[styles.diagBox, {
                  backgroundColor: isDarkMode ? '#2A2A2A' : '#e8f5e9', 
                  borderLeftColor: colors.primary
                }]}>
                  <Text style={[styles.diagText, { color: colors.text }]}>{citaSeleccionada?.tratamiento || 'Sin registro'}</Text>
                </View>

                <Button mode="contained" onPress={() => setVerFichaVisible(false)} buttonColor={colors.primary} style={{marginTop: 25, borderRadius: 10}}>
                  Cerrar
                </Button>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, marginTop: 40 },
  search: { marginBottom: 20, borderRadius: 10 },
  itemContainer: { marginBottom: 10, borderRadius: 12 },
  innerContainer: { borderRadius: 12, overflow: 'hidden' },
  historyContainer: { padding: 15 },
  historyTitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 10 },
  appointmentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  dateText: { fontSize: 14, fontWeight: '700' },
  reasonText: { fontSize: 12 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '92%', maxHeight: '85%', padding: 20, borderRadius: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  sectionHeader: { marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold' },
  patientInfoBox: { padding: 15, borderRadius: 12, borderWidth: 1 },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  gridItem: { alignItems: 'center', flex: 1 },
  labelSmall: { fontSize: 10, textTransform: 'uppercase' },
  valSmall: { fontSize: 13, fontWeight: 'bold' },
  infoRowSimple: { flexDirection: 'row', marginTop: 5, borderTopWidth: 1, paddingTop: 5 },
  infoRow: { flexDirection: 'row', marginBottom: 10 },
  label: { fontSize: 13, fontWeight: 'bold', marginBottom: 3 },
  val: { fontSize: 14 },
  diagBox: { padding: 12, borderRadius: 10, marginTop: 5, borderLeftWidth: 4 },
  diagText: { lineHeight: 20, fontSize: 13 },
  emptyText: { fontSize: 12, textAlign: 'center', padding: 10 },
  badgeRed: { backgroundColor: '#d32f2f', color: 'white', marginLeft: 8 },
  badgeGreen: { color: 'white', marginLeft: 8 }
});