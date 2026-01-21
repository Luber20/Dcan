import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { Searchbar, List, Avatar, Surface, Button, Divider, Badge } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../../config/api";

export default function GestionMedicaScreen() {
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
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Pacientes 🐾</Text>
      
      <Searchbar
        placeholder="Buscar mascota o dueño..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.search}
      />

      {loading && !refreshing ? (
        <ActivityIndicator color="#2E8B57" size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredPacientes}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchPacientes();}} />}
          renderItem={({ item }) => {
            // CAMBIO CLAVE: Quitamos cualquier filtro de status. 
            // Si Laravel envía la cita, React la mostrará.
            const historialCitas = item.appointments || [];

            return (
              <Surface style={styles.itemContainer} elevation={1}>
                <View style={styles.innerContainer}>
                  <List.Accordion
                    title={item.nombre || "Paciente"}
                    description={`👤 Dueño: ${item.dueno || 'N/A'} • ${item.especie || ''}`}
                    left={props => (
                      <View style={{ justifyContent: 'center', paddingLeft: 10 }}>
                        <Avatar.Text 
                          size={40} 
                          label={item.nombre?.substring(0,2).toUpperCase()} 
                          style={{backgroundColor: '#2E8B57'}}
                        />
                      </View>
                    )}
                  >
                    <View style={styles.historyContainer}>
                      <Text style={styles.historyTitle}>HISTORIAL DE ACTIVIDAD</Text>
                      
                      {historialCitas.map((cita, index) => {
                        // Verificamos si es cualquier cosa que NO sea "completed"
                        const esInasistencia = cita.status?.toLowerCase() !== 'completed';

                        return (
                          <View key={cita.id || index} style={styles.appointmentRow}>
                            <View style={{ flex: 1 }}>
                              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Text style={styles.dateText}>📅 {cita.date}</Text>
                                {esInasistencia ? (
                                  <Badge style={styles.badgeRed}>NO ASISTIÓ</Badge>
                                ) : (
                                  <Badge style={styles.badgeGreen}>ATENDIDO</Badge>
                                )}
                              </View>
                              <Text style={styles.reasonText}>Estado: {cita.status} • Tipo: {cita.type || 'Consulta'}</Text>
                            </View>
                            
                            {!esInasistencia && (
                              <Button 
                                mode="outlined" 
                                onPress={() => { 
                                  setCitaSeleccionada(cita); 
                                  setPacienteSeleccionado(item); 
                                  setVerFichaVisible(true); 
                                }}
                                textColor="#2E8B57"
                                style={{ borderColor: '#2E8B57' }}
                                labelStyle={{fontSize: 10}}
                              >
                                VER FICHA
                              </Button>
                            )}
                          </View>
                        );
                      })}
                      
                      {historialCitas.length === 0 && (
                        <Text style={styles.emptyText}>No hay registros para este paciente.</Text>
                      )}
                    </View>
                  </List.Accordion>
                </View>
              </Surface>
            );
          }}
        />
      )}

      {/* MODAL FICHA (Sin cambios) */}
      <Modal visible={verFichaVisible} transparent animationType="slide" onRequestClose={() => setVerFichaVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Ficha Médica Digital</Text>
                
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>🐾 Información del Paciente</Text>
                </View>
                <View style={styles.patientInfoBox}>
                    <View style={styles.infoGrid}>
                        <View style={styles.gridItem}>
                            <Text style={styles.labelSmall}>Especie</Text>
                            <Text style={styles.valSmall}>{pacienteSeleccionado?.especie || 'N/A'}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.labelSmall}>Sexo</Text>
                            <Text style={styles.valSmall}>{pacienteSeleccionado?.sexo || 'N/A'}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.labelSmall}>Edad</Text>
                            <Text style={styles.valSmall}>{pacienteSeleccionado?.edad || 'N/A'}</Text>
                        </View>
                    </View>
                    <View style={styles.infoRowSimple}>
                        <Text style={styles.label}>Dueño: </Text>
                        <Text style={styles.val}>{pacienteSeleccionado?.dueno}</Text>
                    </View>
                </View>

                <Divider style={{ marginVertical: 15 }} />

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>🩺 Evaluación Clínica</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <View style={{flex: 1}}>
                    <Text style={styles.label}>Peso: </Text>
                    <Text style={styles.val}>{citaSeleccionada?.weight || '--'} kg</Text>
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.label}>Temperatura: </Text>
                    <Text style={styles.val}>{citaSeleccionada?.temperatura || '--'} °C</Text>
                  </View>
                </View>

                <Text style={styles.label}>Diagnóstico:</Text>
                <View style={styles.diagBox}>
                  <Text style={styles.diagText}>{citaSeleccionada?.diagnosis || 'Sin registro'}</Text>
                </View>

                <Text style={[styles.label, {marginTop: 15}]}>Tratamiento:</Text>
                <View style={[styles.diagBox, {backgroundColor: '#e8f5e9'}]}>
                  <Text style={styles.diagText}>{citaSeleccionada?.tratamiento || 'Sin registro'}</Text>
                </View>

                <Button mode="contained" onPress={() => setVerFichaVisible(false)} buttonColor="#2E8B57" style={{marginTop: 25, borderRadius: 10}}>
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
  container: { flex: 1, padding: 15, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, marginTop: 40, color: '#2E8B57' },
  search: { marginBottom: 20, borderRadius: 10, backgroundColor: '#fff' },
  itemContainer: { marginBottom: 10, borderRadius: 12, backgroundColor: '#fff' },
  innerContainer: { borderRadius: 12, overflow: 'hidden' },
  historyContainer: { padding: 15, backgroundColor: '#f1f8f4' },
  historyTitle: { fontSize: 11, fontWeight: 'bold', color: '#2E8B57', marginBottom: 10 },
  appointmentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  dateText: { fontSize: 14, fontWeight: '700', color: '#333' },
  reasonText: { fontSize: 12, color: '#666' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '92%', maxHeight: '85%', backgroundColor: '#fff', padding: 20, borderRadius: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#2E8B57' },
  sectionHeader: { marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#2E8B57' },
  patientInfoBox: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#eee' },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  gridItem: { alignItems: 'center', flex: 1 },
  labelSmall: { fontSize: 10, color: '#999', textTransform: 'uppercase' },
  valSmall: { fontSize: 13, fontWeight: 'bold', color: '#444' },
  infoRowSimple: { flexDirection: 'row', marginTop: 5, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 5 },
  infoRow: { flexDirection: 'row', marginBottom: 10 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#333', marginBottom: 3 },
  val: { fontSize: 14, color: '#555' },
  diagBox: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 10, marginTop: 5, borderLeftWidth: 4, borderLeftColor: '#2E8B57' },
  diagText: { color: '#444', lineHeight: 20, fontSize: 13 },
  emptyText: { fontSize: 12, color: '#999', textAlign: 'center', padding: 10 },
  badgeRed: { backgroundColor: '#d32f2f', color: 'white', marginLeft: 8 },
  badgeGreen: { backgroundColor: '#2E8B57', color: 'white', marginLeft: 8 }
});