import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, FlatList, Alert } from "react-native";
import { Title, Card, Paragraph, Button } from "react-native-paper";
import axios from "axios";
import { API_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

export default function AppointmentManagement() {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${API_URL}/clinic-appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    Alert.alert("Confirmar", "¿Eliminar esta cita?", [
      { text: "Cancelar" },
      {
        text: "Eliminar",
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/appointments/${appointmentId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert("Éxito", "Cita eliminada");
            fetchAppointments();
          } catch (error) {
            Alert.alert("Error", "No se pudo eliminar la cita");
          }
        },
      },
    ]);
  };

  const renderAppointment = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Paragraph>Fecha: {item.date}</Paragraph>
        <Paragraph>Hora: {item.time}</Paragraph>
        <Paragraph>Cliente: {item.client_name}</Paragraph>
        <Paragraph>Mascota: {item.pet_name}</Paragraph>
        <Paragraph>Servicio: {item.service}</Paragraph>
        <Paragraph>Veterinario: {item.veterinarian_name}</Paragraph>
        <Paragraph>Estado: {item.status}</Paragraph>
        <Button mode="contained" onPress={() => handleDeleteAppointment(item.id)} buttonColor="red" style={styles.button}>
          Eliminar Cita
        </Button>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return <View style={styles.center}><Paragraph>Cargando...</Paragraph></View>;
  }

  return (
    <View style={styles.container}>
      <Title>Gestión de Citas</Title>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAppointment}
        ListEmptyComponent={<Paragraph>No hay citas</Paragraph>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { marginBottom: 16 },
  button: { marginTop: 16 },
});