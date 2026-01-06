import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { Title, Card, TextInput, Button } from "react-native-paper";
import { useTheme } from "../../context/ThemeContext";

export default function ScheduleScreen() {
  const [pet, setPet] = React.useState("");
  const [date, setDate] = React.useState("");
  const [reason, setReason] = React.useState("");

  const { theme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Title style={[styles.title, { color: theme.colors.primary }]}>
        Agendar Cita 📅
      </Title>

      <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Card.Content>
          <TextInput
            label="Nombre de la mascota"
            value={pet}
            onChangeText={setPet}
            mode="outlined"
            style={styles.input}
            textColor={theme.colors.text}
          />

          <TextInput
            label="Fecha y hora (ej: 20 dic, 10:30 AM)"
            value={date}
            onChangeText={setDate}
            mode="outlined"
            style={styles.input}
            textColor={theme.colors.text}
          />

          <TextInput
            label="Motivo de la consulta"
            value={reason}
            onChangeText={setReason}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
            textColor={theme.colors.text}
          />

          <Button
            mode="contained"
            onPress={() => alert("Cita agendada!")}
            style={styles.button}
            contentStyle={styles.buttonContent}
            buttonColor={theme.colors.primary}
            textColor="#fff"
          >
            Agendar Cita
          </Button>
        </Card.Content>
      </Card>
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
  card: { margin: 20, borderRadius: 20, elevation: 8 },
  input: { marginBottom: 16 },
  button: { marginTop: 20 },
  buttonContent: { height: 55 },
});
