import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Card, Title, Paragraph, Avatar } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function HomeScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      
      {/* HEADER */}
      <View
        style={[
          styles.header,
          { backgroundColor: theme.colors.primary },
        ]}
      >
        <Title style={[styles.welcome, { color: "#fff" }]}>
          ¡Hola, {user?.name || "Usuario"}! 🐾
        </Title>

        <Paragraph style={{ color: "#fff", marginTop: 8 }}>
          Clínica: {user?.clinic_id ? "Veterinaria D’CAN" : "Super Admin"}
        </Paragraph>

        <Paragraph style={{ color: "#E8F5E8", marginTop: 4 }}>
          Rol: {user?.roles?.[0]?.name || "Cliente"}
        </Paragraph>
      </View>

      {/* PRÓXIMA CITA */}
      <Card
        style={[
          styles.card,
          { backgroundColor: theme.colors.card },
        ]}
      >
        <Card.Content>
          <Title style={{ color: theme.colors.primary }}>
            Próxima cita
          </Title>

          <Paragraph style={{ color: theme.colors.subtitle, marginTop: 8 }}>
            Marti con Dr. Pérez - 15 dic, 10:30 AM
          </Paragraph>
        </Card.Content>
      </Card>

      {/* MASCOTAS */}
      <Card
        style={[
          styles.card,
          { backgroundColor: theme.colors.card },
        ]}
      >
        <Card.Content>
          <Title style={{ color: theme.colors.primary }}>
            Mis mascotas
          </Title>

          <View style={styles.pets}>
            <Avatar.Text size={60} label="M" style={{ backgroundColor: "#FF9800" }} />
            <Avatar.Text size={60} label="L" style={{ backgroundColor: "#4CAF50" }} />
            <Avatar.Text size={60} label="T" style={{ backgroundColor: "#2196F3" }} />
          </View>
        </Card.Content>
      </Card>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 30,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  welcome: {
    fontSize: 32,
    fontWeight: "bold",
  },
  card: {
    margin: 20,
    borderRadius: 20,
    elevation: 8,
  },
  pets: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
});
