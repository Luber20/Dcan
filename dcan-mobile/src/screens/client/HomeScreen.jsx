import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Card, Title, Paragraph, Avatar } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.welcome}>¡Hola, {user?.name || "Usuario"}! 🐾</Title>
        <Paragraph style={styles.clinic}>
          Clínica: {user?.clinic_id ? "Veterinaria D’CAN" : "Super Admin"}
        </Paragraph>
        <Paragraph style={styles.role}>Rol: {user?.roles?.[0]?.name || "Cliente"}</Paragraph>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Próxima cita</Title>
          <Paragraph style={styles.cardText}>Marti con Dr. Pérez - 15 dic, 10:30 AM</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Mis mascotas</Title>
          <View style={styles.pets}>
            <Avatar.Text size={60} label="M" style={styles.avatar1} />
            <Avatar.Text size={60} label="L" style={styles.avatar2} />
            <Avatar.Text size={60} label="T" style={styles.avatar3} />
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E8F5E8" },
  header: { padding: 30, alignItems: "center", backgroundColor: "#2E8B57", borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  welcome: { fontSize: 32, fontWeight: "bold", color: "#fff" },
  clinic: { fontSize: 18, color: "#fff", marginTop: 8 },
  role: { fontSize: 16, color: "#E8F5E8", marginTop: 4 },
  card: { margin: 20, borderRadius: 20, elevation: 8, backgroundColor: "#fff" },
  cardTitle: { fontSize: 22, color: "#2E8B57" },
  cardText: { fontSize: 16, color: "#666", marginTop: 8 },
  pets: { flexDirection: "row", justifyContent: "space-around", marginTop: 20 },
  avatar1: { backgroundColor: "#FF9800" },
  avatar2: { backgroundColor: "#4CAF50" },
  avatar3: { backgroundColor: "#2196F3" },
});