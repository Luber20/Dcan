import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Card, Title, Paragraph } from "react-native-paper";

export default function AppointmentsScreen() {
  const appointments = [
    { pet: "Marti", vet: "Dr. Pérez", date: "15 dic 2025, 10:30 AM", status: "Confirmada" },
    { pet: "Luna", vet: "Dra. Gómez", date: "22 dic 2025, 14:00 PM", status: "Pendiente" },
  ];

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Mis Citas 📅</Title>

      {appointments.map((appt, index) => (
        <Card key={index} style={styles.card}>
          <Card.Content>
            <Title style={styles.pet}>{appt.pet}</Title>
            <Paragraph style={styles.detail}>Veterinario: {appt.vet}</Paragraph>
            <Paragraph style={styles.detail}>Fecha: {appt.date}</Paragraph>
            <Paragraph style={styles.status}>Estado: {appt.status}</Paragraph>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E8F5E8" },
  title: { fontSize: 32, fontWeight: "bold", color: "#2E8B57", textAlign: "center", marginTop: 30, marginBottom: 20 },
  card: { marginHorizontal: 20, marginVertical: 10, borderRadius: 20, elevation: 8 },
  pet: { fontSize: 22, color: "#2E8B57" },
  detail: { fontSize: 16, color: "#666" },
  status: { fontSize: 16, color: "#4CAF50", fontWeight: "bold", marginTop: 8 },
});