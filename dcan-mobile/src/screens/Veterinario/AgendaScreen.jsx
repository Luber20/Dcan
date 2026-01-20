import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert, TextInput, Modal } from 'react-native';
import { Card, Badge, Avatar, Chip, Button } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../../config/api";

export default function AgendaScreen() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterDate, setFilterDate] = useState('today');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [verFichaVisible, setVerFichaVisible] = useState(false); 
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [formConsulta, setFormConsulta] = useState({ peso: '', diagnostico: '' });

  const fetchCitas = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("authToken");
      const response = await axios.get(`${API_URL}/veterinarian/appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCitas(response.data);
    } catch (error) {
      console.log('Error:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchCitas(); }, []));

  const getFilteredCitas = () => {
    if (filterDate === 'all') return citas;
    const today = new Date().toISOString().split('T')[0];
    return citas.filter(c => c.date === today);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    if (newStatus === 'completed') {
      const cita = citas.find(c => c.id === id);
      setCitaSeleccionada(cita);
      setFormConsulta({ peso: '', diagnostico: '' }); 
      setModalVisible(true);
    } else {
      ejecutarCambioEstado(id, 'cancelled');
    }
  };

  const ejecutarCambioEstado = async (id, status) => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      await axios.patch(`${API_URL}/appointments/${id}/status`, { status }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchCitas();
    } catch (error) { Alert.alert('Error', 'No se pudo actualizar'); }
  };

  const guardarConsultaYFinalizar = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      await axios.post(`${API_URL}/veterinarian/complete-appointment`, {
        appointment_id: citaSeleccionada.id,
        diagnostico: formConsulta.diagnostico,
        peso: formConsulta.peso,
      }, { headers: { 'Authorization': `Bearer ${token}` } });

      setModalVisible(false);
      Alert.alert('Éxito', 'Ficha guardada');
      fetchCitas();
    } catch (error) { Alert.alert('Error', 'No se pudo guardar'); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={styles.container}>
        <Text style={styles.title}>Agenda Veterinaria 📅</Text>
        
        <View style={styles.filterContainer}>
          <Chip selected={filterDate === 'today'} onPress={() => setFilterDate('today')} style={styles.chip}>Hoy</Chip>
          <Chip selected={filterDate === 'all'} onPress={() => setFilterDate('all')} style={styles.chip}>Todas</Chip>
        </View>

        <FlatList
          data={getFilteredCitas()}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchCitas();}} />}
          renderItem={({ item }) => {
            const status = item.status?.toLowerCase();
            return (
              <Card style={styles.card}>
                <Card.Title
                  title={item.mascota?.nombre || 'Paciente'}
                  subtitle={`${item.date} - ${item.hora_formateada}`}
                  // ✅ SOLUCIÓN AL ERROR COMPACT: Envolver en View y no pasar argumentos
                  left={() => (
                    <View style={styles.iconWrapper}>
                      <Avatar.Icon size={40} icon="dog" style={{ backgroundColor: '#2E8B57' }} />
                    </View>
                  )}
                  right={() => (
                    <View style={styles.badgeWrapper}>
                      <Badge style={{ backgroundColor: status === 'completed' ? '#2E8B57' : status === 'cancelled' ? '#D32F2F' : '#FFA500' }}>
                        {status?.toUpperCase()}
                      </Badge>
                    </View>
                  )}
                />
                <Card.Actions>
                  {status === 'pending' ? (
                    <>
                      <Button textColor="red" onPress={() => handleUpdateStatus(item.id, 'cancelled')}>Rechazar</Button>
                      <Button mode="contained" buttonColor="#2E8B57" onPress={() => handleUpdateStatus(item.id, 'completed')}>Atender</Button>
                    </>
                  ) : status === 'completed' ? (
                    <Button icon="eye" onPress={() => { setCitaSeleccionada(item); setVerFichaVisible(true); }}>Ver Ficha</Button>
                  ) : null}
                </Card.Actions>
              </Card>
            );
          }}
        />
      </View>

      {/* MODAL: REGISTRAR ATENCIÓN */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Ficha Médica</Text>
            <TextInput placeholder="Peso (kg)" style={styles.input} keyboardType="numeric" onChangeText={(t) => setFormConsulta({...formConsulta, peso: t})} />
            <TextInput placeholder="Diagnóstico..." multiline style={[styles.input, {height: 80}]} onChangeText={(t) => setFormConsulta({...formConsulta, diagnostico: t})} />
            <Button mode="contained" onPress={guardarConsultaYFinalizar} buttonColor="#2E8B57">Guardar</Button>
            <Button onPress={() => setModalVisible(false)} textColor="red">Cerrar</Button>
          </View>
        </View>
      </Modal>

      {/* MODAL: VER FICHA */}
      <Modal visible={verFichaVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Detalles Guardados</Text>
            <Text style={styles.label}>Peso: <Text style={styles.val}>{citaSeleccionada?.weight} kg</Text></Text>
            <Text style={styles.label}>Diagnóstico:</Text>
            <Text style={styles.diagnosisText}>{citaSeleccionada?.diagnosis || 'Sin registro'}</Text>
            <Button mode="contained" onPress={() => setVerFichaVisible(false)} buttonColor="#2E8B57" style={{marginTop: 15}}>Cerrar</Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  title: { fontSize: 22, fontWeight: 'bold', marginTop: 35, marginBottom: 10 },
  filterContainer: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  chip: { backgroundColor: '#e0e0e0' },
  card: { marginBottom: 10, borderRadius: 12, backgroundColor: '#fff' },
  iconWrapper: { paddingLeft: 10 }, // Protege al Avatar de props externos
  badgeWrapper: { paddingRight: 10, justifyContent: 'center' }, // Protege al Badge
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: 'white', padding: 20, borderRadius: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10, marginBottom: 10 },
  label: { fontWeight: 'bold', marginTop: 10 },
  val: { fontWeight: 'normal' },
  diagnosisText: { marginTop: 5, fontStyle: 'italic', color: '#666' }
});