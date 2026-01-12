import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { TextInput, Button, Title, Card, Paragraph } from "react-native-paper";
import axios from "axios";
import { API_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { useRoute } from "@react-navigation/native";

export default function ClinicEdit() {
  const { user, token } = useAuth();
  const route = useRoute();
  const { clinicId } = route.params;
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [hours, setHours] = useState("");

  useEffect(() => {
    fetchClinic();
  }, []);

  const fetchClinic = async () => {
    try {
      const response = await axios.get(`${API_URL}/clinics/${clinicId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      setClinic(data);
      setName(data.name || "");
      setAddress(data.address || "");
      setPhone(data.phone || "");
      setHours(data.hours || "");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/clinics/${clinicId}`, {
        name,
        address,
        phone,
        hours,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Clínica actualizada");
      fetchClinic(); // Recargar
    } catch (error) {
      alert("Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><Paragraph>Cargando...</Paragraph></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Title>Editar Clínica</Title>
      <Card style={styles.card}>
        <Card.Content>
          <TextInput label="Nombre" value={name} onChangeText={setName} />
          <TextInput label="Dirección" value={address} onChangeText={setAddress} />
          <TextInput label="Teléfono" value={phone} onChangeText={setPhone} />
          <TextInput label="Horarios" value={hours} onChangeText={setHours} multiline />
          <Button mode="contained" onPress={handleSave} loading={saving} style={styles.button}>
            Guardar Cambios
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { marginBottom: 16 },
  button: { marginTop: 16 },
});