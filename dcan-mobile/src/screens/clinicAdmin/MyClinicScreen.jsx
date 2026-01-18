import React, { useEffect, useState, useMemo } from "react";
import { View, StyleSheet, ScrollView, Alert, Image } from "react-native";
import {
  Text, TextInput, Button, Card, ActivityIndicator, Title, Divider
} from "react-native-paper";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { API_URL } from "../../config/api";

export default function MyClinicScreen() {
  const { user, token } = useAuth();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Formulario
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("");
  const [desc, setDesc] = useState("");

  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  }), [token]);

  useEffect(() => {
    // Si el usuario tiene una clínica asignada, cargamos esa
    if (user?.clinic_id) {
      fetchClinicData();
    }
  }, [user]);

  const fetchClinicData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/clinics/${user.clinic_id}`, { headers });
      const data = res.data;
      
      setName(data.name || "");
      setPhone(data.phone || "");
      setAddress(data.address || "");
      setHours(data.hours || "");
      setDesc(data.description || "");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "No se pudo cargar la información de tu clínica.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      // Endpoint para actualizar (Dueño)
      await axios.put(`${API_URL}/clinics/${user.clinic_id}`, {
        name,
        phone,
        address,
        hours,
        description: desc
      }, { headers });

      Alert.alert("Éxito", "Información de la clínica actualizada.");
    } catch (error) {
      const msg = error.response?.data?.message || "Error al guardar.";
      Alert.alert("Error", msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 10 }}>Cargando datos de tu clínica...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Title style={[styles.title, { color: theme.colors.primary }]}>Mi Veterinaria</Title>
      
      <Card style={styles.card}>
        <Card.Content>
            <Title style={{marginBottom: 10}}>Información General</Title>
            
            <TextInput
              label="Nombre Comercial"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Teléfono Público"
              value={phone}
              onChangeText={setPhone}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
            />

            <TextInput
              label="Dirección"
              value={address}
              onChangeText={setAddress}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Horarios (Ej: Lun-Vie 9-18)"
              value={hours}
              onChangeText={setHours}
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="Descripción"
              value={desc}
              onChangeText={setDesc}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />

            <Button 
              mode="contained" 
              icon="store-edit" 
              onPress={handleUpdate} 
              loading={saving}
              disabled={saving}
              style={{ marginTop: 10 }}
            >
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
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  card: { borderRadius: 12, elevation: 3, marginBottom: 20, backgroundColor: 'white' },
  input: { marginBottom: 12, backgroundColor: "white" },
});