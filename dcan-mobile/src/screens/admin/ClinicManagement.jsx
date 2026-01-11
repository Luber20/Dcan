import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { TextInput, Button, Title, Card, Paragraph } from "react-native-paper";
import axios from "axios";
import { API_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";import { useNavigation } from "@react-navigation/native";
export default function ClinicManagement() {
  const { user, token } = useAuth();
  const navigation = useNavigation();
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
      const response = await axios.get(`${API_URL}/clinics/${user.clinic_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      setClinic(data);
      setName(data.name || "");
      setAddress(data.address || "");
      setPhone(data.phone || "");
      setHours(data.hours || "");
    } catch (error) {
      Alert.alert("Error", "No se pudo cargar la clínica");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/clinics/${user.clinic_id}`, {
        name,
        address,
        phone,
        hours,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert("Éxito", "Clínica actualizada");
      fetchClinic(); // Recargar
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><Paragraph>Cargando...</Paragraph></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Title>Gestión de la Clínica</Title>
      <Button mode="outlined" onPress={() => navigation.navigate('ClinicsList')} style={styles.viewAllButton}>
        Ver Todas las Clínicas
      </Button>
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
  viewAllButton: { marginBottom: 16 },
});