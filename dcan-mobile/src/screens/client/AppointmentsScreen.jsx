import React, { useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from "react-native";
// Se agrega Portal y Modal a las importaciones
import { Card, Title, Text, Button, Avatar, ActivityIndicator, Chip, Divider, Portal, Modal } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { API_URL } from "../../config/api";
import { useTheme } from "../../context/ThemeContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function AppointmentsScreen({ navigation }) {
  const { theme } = useTheme();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // NUEVOS ESTADOS PARA LA FICHA
  const [visible, setVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const loadAppointments = async () => {
    try {
      const response = await axios.get(`${API_URL}/appointments`);
      setAppointments(response.data);
    } catch (error) {
      console.log("Error cargando citas:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadAppointments(); }, []));

  const onRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  const showFicha = (item) => {
    setSelectedAppointment(item);
    setVisible(true);
  };

  const hideFicha = () => {
    setVisible(false);
    setSelectedAppointment(null);
  };

  const safeFormat = (dateStr, timeStr, formatStr) => {
    if (!dateStr) return "Fecha no disponible";
    try {
      const dateObj = new Date(dateStr.replace(/-/g, '/'));
      if (isNaN(dateObj.getTime())) return dateStr;
      return format(dateObj, formatStr, { locale: es });
    } catch (e) {
      return dateStr;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return '#4CAF50';
      case 'completed': return '#2E8B57';
      case 'cancelled': return '#F44336';
      default: return '#FF9800';
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={theme.colors.primary} />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Title style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>Mis Citas Agendadas</Title>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {appointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Avatar.Icon size={70} icon="calendar-blank" style={{ backgroundColor: '#f5f5f5' }} color="#ccc" />
            <Text style={styles.emptyText}>Aún no tienes citas.</Text>
          </View>
        ) : (
          appointments.map((item) => {
            const esCancelada = item.status === 'cancelled';
            const esCompletada = item.status === 'completed';

            return (
              <Card key={item.id} style={[styles.card, esCancelada && styles.cardInasistencia]}>
                <Card.Content>
                  <View style={styles.row}>
                    <Avatar.Text 
                      size={50} 
                      label={item.pet?.name?.substring(0,2).toUpperCase() || "PT"} 
                      style={{backgroundColor: theme.colors.primary}} 
                    />
                    <View style={{ marginLeft: 15, flex: 1 }}>
                      <Title style={{ fontSize: 18 }}>{item.pet?.name}</Title>
                      <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>{item.type}</Text>
                    </View>
                    <Chip style={{ backgroundColor: getStatusColor(item.status), height: 28 }}>
                      <Text style={{color: '#fff', fontSize: 10, fontWeight: 'bold'}}>
                        {esCancelada ? 'NO ASISTIÓ' : item.status?.toUpperCase()}
                      </Text>
                    </Chip>
                  </View>

                  <Divider style={{ marginVertical: 12 }} />

                  <View style={styles.infoRow}>
                    <Avatar.Icon size={20} icon="calendar-month" style={{ backgroundColor: 'transparent' }} color="#555" />
                    <Text style={styles.infoText}>{safeFormat(item.date, null, "EEEE d 'de' MMMM, yyyy")}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Avatar.Icon size={20} icon="clock-time-four-outline" style={{ backgroundColor: 'transparent' }} color="#555" />
                    <Text style={styles.infoText}>
                      Hora: {item.time ? item.time.substring(0, 5) : "Pendiente"}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Avatar.Icon size={20} icon="doctor" style={{ backgroundColor: 'transparent' }} color="#555" />
                    <Text style={styles.infoText}>Veterinario: {item.veterinarian?.name || "No asignado"}</Text>
                  </View>

                  {esCancelada && (
                    <View style={styles.inasistenciaBox}>
                      <Text style={styles.inasistenciaText}>⚠️ Marcada como inasistencia</Text>
                    </View>
                  )}

                  {/* BOTÓN PARA VER FICHA MÉDICA SI ESTÁ COMPLETADA */}
                  {esCompletada && (
                    <Button 
                      mode="contained-tonal" 
                      icon="file-document-outline"
                      onPress={() => showFicha(item)}
                      style={{ marginTop: 10, backgroundColor: '#E8F5E9' }}
                      labelStyle={{ color: '#2E8B57', fontSize: 12 }}
                    >
                      Ver Resultados Médicos
                    </Button>
                  )}
                </Card.Content>
              </Card>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MODAL DE LA FICHA MÉDICA PARA EL CLIENTE */}
      <Portal>
        <Modal visible={visible} onDismiss={hideFicha} contentContainerStyle={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Title style={{ color: '#fff' }}>Ficha de la Cita</Title>
            <Text style={{ color: '#fff', opacity: 0.8 }}>{selectedAppointment?.pet?.name}</Text>
          </View>
          <ScrollView style={{ padding: 20 }}>
            <Text style={styles.modalLabel}>🩺 DIAGNÓSTICO:</Text>
            <Text style={styles.modalText}>{selectedAppointment?.diagnosis || "No hay diagnóstico registrado."}</Text>
            
            <Divider style={styles.modalDivider} />
            
            <Text style={styles.modalLabel}>💊 TRATAMIENTO / RECETA:</Text>
            <Text style={styles.modalText}>{selectedAppointment?.treatment || "No hay tratamiento registrado."}</Text>

            <Divider style={styles.modalDivider} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={styles.modalLabel}>⚖️ PESO:</Text>
                <Text style={styles.modalText}>{selectedAppointment?.weight || "--"} kg</Text>
              </View>
              <View>
                <Text style={styles.modalLabel}>🌡️ TEMP:</Text>
                <Text style={styles.modalText}>{selectedAppointment?.temperature || "--"} °C</Text>
              </View>
            </View>

            <Button 
              mode="contained" 
              onPress={hideFicha} 
              style={{ marginTop: 20, marginBottom: 10, backgroundColor: theme.colors.primary }}
            >
              Cerrar
            </Button>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingVertical: 30, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center', elevation: 4 },
  scroll: { padding: 15 },
  card: { marginBottom: 20, borderRadius: 20, elevation: 3, backgroundColor: '#fff', overflow: 'hidden' },
  cardInasistencia: { borderLeftWidth: 6, borderLeftColor: '#F44336' },
  row: { flexDirection: 'row', alignItems: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoText: { marginLeft: 10, color: '#444', fontSize: 14, textTransform: 'capitalize' },
  inasistenciaBox: { marginTop: 10, padding: 8, backgroundColor: '#FFEBEE', borderRadius: 10, alignItems: 'center' },
  inasistenciaText: { color: '#D32F2F', fontSize: 12, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginVertical: 20, color: '#888', fontSize: 16 },
  
  // ESTILOS DEL MODAL
  modalContent: { backgroundColor: 'white', margin: 20, borderRadius: 20, overflow: 'hidden', maxHeight: '80%' },
  modalHeader: { backgroundColor: '#2E8B57', padding: 20, alignItems: 'center' },
  modalLabel: { fontWeight: 'bold', color: '#777', fontSize: 11, marginBottom: 5 },
  modalText: { fontSize: 15, color: '#333', marginBottom: 15, lineHeight: 22 },
  modalDivider: { marginVertical: 10 }
});