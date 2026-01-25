import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { TextInput, Button, Title, Paragraph, Card } from "react-native-paper";
import axios from "axios";
import { API_URL } from "../../config/api";

export default function ClinicRequestScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  const [clinicName, setClinicName] = useState("");
  const [province, setProvince] = useState("");
  const [canton, setCanton] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ruc, setRuc] = useState("");
  const [notes, setNotes] = useState("");

  const submit = async () => {
    if (!clinicName.trim()) {
      Alert.alert("Falta información", "Ingresa el nombre de la clínica.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/clinic-requests`, {
        clinic_name: clinicName.trim(),
        province: province.trim() || null,
        canton: canton.trim() || null,
        address: address.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        owner_name: ownerName.trim() || null,
        ruc: ruc.trim() || null,
        notes: notes.trim() || null,
      });

      // ✅ Tomamos instrucciones de pago manual desde el backend
      const instructions = res.data?.payment_instructions || null;
      const ref = instructions?.reference || res.data?.data?.public_token || null;
      const amount = instructions?.amount ?? res.data?.data?.amount ?? null;
      const currency = instructions?.currency ?? res.data?.data?.currency ?? "USD";

      // ✅ Mensaje final para el usuario
      const msgLines = [
        "Tu solicitud fue enviada y está pendiente de verificación.",
        "",
        "PAGO MANUAL (obligatorio):",
        amount ? `• Monto: ${amount} ${currency}` : null,
        ref ? `• Referencia: ${ref}` : null,
        instructions?.note ? `• Nota: ${instructions.note}` : "• Incluye la referencia en el comprobante.",
        "",
        "Cuando el administrador confirme el pago, tu solicitud pasará a revisión.",
      ].filter(Boolean);

      Alert.alert("Solicitud creada ✅", msgLines.join("\n"));

      navigation.goBack();
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        "No se pudo enviar la solicitud. Intenta nuevamente.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>Registrar clínica</Title>
      <Paragraph style={styles.subtitle}>
        Completa estos datos para solicitar que tu clínica aparezca en D’CAN.
      </Paragraph>

      <Card style={styles.card}>
        <Card.Content>
          <TextInput
            label="Nombre de la clínica *"
            value={clinicName}
            onChangeText={setClinicName}
            mode="outlined"
            style={styles.input}
          />
          <TextInput label="Provincia" value={province} onChangeText={setProvince} mode="outlined" style={styles.input} />
          <TextInput label="Cantón" value={canton} onChangeText={setCanton} mode="outlined" style={styles.input} />
          <TextInput label="Dirección" value={address} onChangeText={setAddress} mode="outlined" style={styles.input} />
          <TextInput label="Teléfono" value={phone} onChangeText={setPhone} mode="outlined" style={styles.input} />
          <TextInput
            label="Email de contacto"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput label="Responsable" value={ownerName} onChangeText={setOwnerName} mode="outlined" style={styles.input} />
          <TextInput label="RUC (opcional)" value={ruc} onChangeText={setRuc} mode="outlined" style={styles.input} />
          <TextInput
            label="Observaciones"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={submit}
            loading={loading}
            disabled={loading}
            buttonColor="#2E8B57"
            style={{ marginTop: 10 }}
          >
            Enviar solicitud
          </Button>

          <Button mode="text" onPress={() => navigation.goBack()} style={{ marginTop: 6 }} textColor="#2E8B57">
            Cancelar
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "bold", color: "#2E8B57", marginBottom: 6 },
  subtitle: { color: "#555", marginBottom: 14 },
  card: { borderRadius: 16, backgroundColor: "white" },
  input: { marginBottom: 10, backgroundColor: "white" },
});
