import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { Card, Title, Paragraph } from "react-native-paper";
import { useTheme } from "../../context/ThemeContext";

export default function AppointmentsScreen() {
  const { theme } = useTheme();

  const appointments = [
    { pet: "Marti", vet: "Dr. Pérez", date: "15 dic 2025, 10:30 AM", status: "Confirmada" },
    { pet: "Luna", vet: "Dra. Gómez", date: "22 dic 2025, 14:00 PM", status: "Pendiente" },
  ];

  const statusColor = (status) => {
    switch (status) {
      case "Confirmada":
        return "#4CAF50";
      case "Pendiente":
        return "#FF9800";
      case "Cancelada":
        return "#F44336";
      default:
        return theme.colors.subtitle;
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Title style={[styles.title, { color: theme.colors.primary }]}>
        Mis Citas 📅
      </Title>

      {appointments.map((appt, index) => (
        <Card
          key={index}
          style={[styles.card, { backgroundColor: theme.colors.card }]}
        >
          <Card.Content>
            <Title style={[styles.pet, { color: theme.colors.text }]}>
              {appt.pet}
            </Title>

            <Paragraph style={[styles.detail, { color: theme.colors.subtitle }]}>
              Veterinario: {appt.vet}
            </Paragraph>

            <Paragraph style={[styles.detail, { color: theme.colors.subtitle }]}>
              Fecha: {appt.date}
            </Paragraph>

            <Paragraph
              style={[
                styles.status,
                { color: statusColor(appt.status) },
              ]}
            >
              Estado: {appt.status}
            </Paragraph>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  card: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 20,
    elevation: 8,
  },
  pet: { fontSize: 22 },
  detail: { fontSize: 16 },
  status: { fontSize: 16, fontWeight: "bold", marginTop: 8 },
});
