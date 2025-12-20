import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Title, Card, TextInput, Button } from "react-native-paper";

export default function ScheduleScreen() {
  const [pet, setPet] = React.useState("");
  const [date, setDate] = React.useState("");
  const [reason, setReason] = React.useState("");

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Agendar Cita 📅</Title>

      <Card style={styles.card}>
        <Card.Content>
          <TextInput label="Nombre de la mascota" value={pet} onChangeText={setPet} mode="outlined" style={styles.input} />
          <TextInput label="Fecha y hora (ej: 20 dic, 10:30 AM)" value={date} onChangeText={setDate} mode="outlined" style={styles.input} />
          <TextInput label="Motivo de la consulta" value={reason} onChangeText={setReason} mode="outlined" multiline numberOfLines={4} style={styles.input} />

          <Button mode="contained" onPress={() => alert("Cita agendada!")} style={styles.button} contentStyle={styles.buttonContent}>
            Agendar Cita
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E8F5E8" },
  title: { fontSize: 32, fontWeight: "bold", color: "#2E8B57", textAlign: "center", marginTop: 30, marginBottom: 20 },
  card: { margin: 20, borderRadius: 20, elevation: 8 },
  input: { marginBottom: 16 },
  button: { marginTop: 20, backgroundColor: "#2E8B57" },
  buttonContent: { height: 55 },
});