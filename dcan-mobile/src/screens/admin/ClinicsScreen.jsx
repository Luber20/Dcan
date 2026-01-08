import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Card, Title, Paragraph, Button, TextInput, FAB, Switch } from "react-native-paper";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const API_URL = "http://192.168.18.10:8000/api";

export default function ClinicsScreen() {
  const { token } = useAuth(); // <- debe existir en tu AuthContext
  const { theme } = useTheme();

  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);

  // formulario
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };

  const fetchClinics = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_URL}/admin/clinics`, { headers });
      setClinics(res.data);
    } catch (e) {
      setError("No se pudo cargar clínicas. Revisa servidor/token.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setName("");
    setAddress("");
    setPhone("");
    setError("");
  };

  const openCreate = () => {
    resetForm();
    setOpenForm(true);
  };

  const openEdit = (clinic) => {
    setEditing(clinic);
    setName(clinic.name || "");
    setAddress(clinic.address || "");
    setPhone(clinic.phone || "");
    setOpenForm(true);
  };

  const saveClinic = async () => {
    if (!name.trim()) return setError("El nombre es obligatorio.");

    setError("");
    try {
      if (editing) {
        await axios.put(
          `${API_URL}/admin/clinics/${editing.id}`,
          { name: name.trim(), address: address.trim(), phone: phone.trim() },
          { headers }
        );
      } else {
        await axios.post(
          `${API_URL}/admin/clinics`,
          { name: name.trim(), address: address.trim(), phone: phone.trim() },
          { headers }
        );
      }

      setOpenForm(false);
      resetForm();
      fetchClinics();
    } catch (e) {
      setError("Error guardando clínica (revisa Laravel logs).");
    }
  };

  const toggleClinic = async (clinic) => {
    try {
      await axios.patch(`${API_URL}/admin/clinics/${clinic.id}/toggle`, {}, { headers });
      fetchClinics();
    } catch (e) {
      setError("No se pudo activar/inactivar.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        <Title style={[styles.title, { color: theme.colors.primary }]}>Clínicas</Title>

        {!!error && <Paragraph style={{ color: "red", textAlign: "center" }}>{error}</Paragraph>}
        {loading && <Paragraph style={{ textAlign: "center" }}>Cargando...</Paragraph>}

        {/* FORM */}
        {openForm && (
          <Card style={styles.formCard}>
            <Card.Content>
              <Title style={{ marginBottom: 10 }}>{editing ? "Editar clínica" : "Nueva clínica"}</Title>

              <TextInput label="Nombre" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
              <TextInput label="Dirección" value={address} onChangeText={setAddress} mode="outlined" style={styles.input} />
              <TextInput label="Teléfono" value={phone} onChangeText={setPhone} mode="outlined" style={styles.input} />

              <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                <Button mode="contained" onPress={saveClinic} style={{ flex: 1 }}>
                  Guardar
                </Button>
                <Button mode="outlined" onPress={() => { setOpenForm(false); resetForm(); }} style={{ flex: 1 }}>
                  Cancelar
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* LISTA */}
        {clinics.map((c) => (
          <Card key={c.id} style={styles.card}>
            <Card.Content>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Title style={styles.clinicName}>{c.name}</Title>
                  <Paragraph style={styles.detail}>{c.address || "—"}</Paragraph>
                  <Paragraph style={styles.detail}>{c.phone || "—"}</Paragraph>
                </View>

                <View style={{ alignItems: "flex-end", justifyContent: "center" }}>
                  <Paragraph style={{ marginBottom: 6 }}>
                    {c.is_active ? "Activa" : "Inactiva"}
                  </Paragraph>
                  <Switch value={!!c.is_active} onValueChange={() => toggleClinic(c)} />
                </View>
              </View>

              <Button mode="text" onPress={() => openEdit(c)} style={{ marginTop: 6 }}>
                Editar
              </Button>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <FAB icon="plus" style={styles.fab} onPress={openCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginTop: 16, marginBottom: 10 },
  card: { marginHorizontal: 16, marginVertical: 8, borderRadius: 16, elevation: 4 },
  formCard: { marginHorizontal: 16, marginVertical: 10, borderRadius: 16, elevation: 6 },
  input: { marginBottom: 12 },
  row: { flexDirection: "row", gap: 12 },
  clinicName: { fontSize: 18 },
  detail: { color: "#666" },
  fab: { position: "absolute", right: 16, bottom: 16 },
});
