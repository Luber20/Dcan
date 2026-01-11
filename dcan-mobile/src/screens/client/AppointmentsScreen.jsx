import React, { useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from "react-native";
import { Card, Title, Text, Button, Avatar, ActivityIndicator, Chip, Divider } from "react-native-paper";
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

  useFocusEffect(
    useCallback(() => {
      loadAppointments();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  const safeFormat = (dateStr, timeStr, formatStr) => {
    if (!dateStr || !timeStr) return "Fecha no disponible";
    try {
      const dateTimeStr = `${dateStr.replace(/-/g, '/')} ${timeStr}`;
      const dateObj = new Date(dateTimeStr);
      if (isNaN(dateObj.getTime())) return dateStr;
      return format(dateObj, formatStr, { locale: es });
    } catch (e) {
      return dateStr;
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Eliminar Registro",
      "¿Estás seguro de eliminar esta cita permanentemente?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/appointments/${id}`);
              Alert.alert("Eliminado", "La cita ha sido borrada.");
              loadAppointments();
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar la cita.");
            }
          },
        },
      ]
    );
  };

  const handleEdit = (appointment) => {
    // Navegamos a Schedule pasándole los datos de la cita
    navigation.navigate("Agendar", { editData: appointment });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
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
            <Button mode="contained" onPress={() => navigation.navigate("Agendar")}>
              Agendar una cita
            </Button>
          </View>
        ) : (
          appointments.map((item) => (
            <Card key={item.id} style={styles.card}>
              <Card.Content>
                <View style={styles.row}>
                  {item.pet?.photo_url ? (
                    <Avatar.Image size={50} source={{ uri: item.pet.photo_url }} />
                  ) : (
                    <Avatar.Text size={50} label={item.pet?.name?.substring(0,2).toUpperCase()} style={{backgroundColor: theme.colors.primary}} />
                  )}
                  <View style={{ marginLeft: 15, flex: 1 }}>
                    <Title style={{ fontSize: 18 }}>{item.pet?.name}</Title>
                    <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>{item.type}</Text>
                  </View>
                  <Chip style={{ backgroundColor: getStatusColor(item.status), height: 28 }}>
                    <Text style={{color: '#fff', fontSize: 10, fontWeight: 'bold'}}>{item.status.toUpperCase()}</Text>
                  </Chip>
                </View>

                <Divider style={{ marginVertical: 12 }} />

                <View style={styles.infoRow}>
                  <Avatar.Icon size={20} icon="calendar-month" style={{ backgroundColor: 'transparent' }} color="#555" />
                  <Text style={styles.infoText}>{safeFormat(item.date, item.time, "EEEE d 'de' MMMM, yyyy")}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Avatar.Icon size={20} icon="clock-time-four-outline" style={{ backgroundColor: 'transparent' }} color="#555" />
                  <Text style={styles.infoText}>{safeFormat(item.date, item.time, "hh:mm a")}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Avatar.Icon size={20} icon="doctor" style={{ backgroundColor: 'transparent' }} color="#555" />
                  <Text style={styles.infoText}>Veterinario: {item.veterinarian?.name || "No asignado"}</Text>
                </View>

                {item.notes && (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesLabel}>Notas:</Text>
                    <Text style={styles.notesContent}>{item.notes}</Text>
                  </View>
                )}
              </Card.Content>

              <Card.Actions style={styles.actions}>
                <Button 
                    mode="outlined"
                    onPress={() => handleEdit(item)}
                    style={{borderColor: theme.colors.primary}}
                    textColor={theme.colors.primary}
                >
                  Editar
                </Button>
                <Button 
                    mode="contained"
                    onPress={() => handleDelete(item.id)}
                    style={{backgroundColor: '#F44336'}}
                >
                  Eliminar
                </Button>
              </Card.Actions>
            </Card>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingVertical: 30, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center', elevation: 4 },
  scroll: { padding: 15 },
  card: { marginBottom: 20, borderRadius: 20, elevation: 3, backgroundColor: '#fff', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoText: { marginLeft: 10, color: '#444', fontSize: 14, textTransform: 'capitalize' },
  notesBox: { marginTop: 10, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 10 },
  notesLabel: { fontWeight: 'bold', fontSize: 12, color: '#777' },
  notesContent: { fontSize: 13, color: '#555', fontStyle: 'italic' },
  actions: { justifyContent: 'flex-end', paddingBottom: 10, paddingRight: 10 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginVertical: 20, color: '#888', fontSize: 16 }
});