import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, FlatList, Alert } from "react-native";
import { Title, Card, Paragraph, List, Button, TextInput, Dialog, Portal } from "react-native-paper";
import axios from "axios";
import { API_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

export default function ClientManagement() {
  const { user, token } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", password: "", phone: "" });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API_URL}/clinic-clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async () => {
    if (!newClient.name || !newClient.email || !newClient.password) {
      Alert.alert("Error", "Nombre, email y contraseña son obligatorios");
      return;
    }
    try {
      await axios.post(`${API_URL}/clinic-clients`, newClient, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert("Éxito", "Cliente creado");
      setNewClient({ name: "", email: "", password: "", phone: "" });
      setDialogVisible(false);
      fetchClients();
    } catch (error) {
      Alert.alert("Error", "No se pudo crear el cliente");
    }
  };

  const handleDeleteClient = async (clientId) => {
    Alert.alert("Confirmar", "¿Eliminar este cliente?", [
      { text: "Cancelar" },
      {
        text: "Eliminar",
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/clinic-clients/${clientId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert("Éxito", "Cliente eliminado");
            fetchClients();
          } catch (error) {
            Alert.alert("Error", "No se pudo eliminar");
          }
        },
      },
    ]);
  };

  const handleToggleClient = async (clientId) => {
    try {
      await axios.patch(`${API_URL}/clinic-clients/${clientId}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert("Éxito", "Estado del cliente actualizado");
      fetchClients();
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar");
    }
  };

  const renderClient = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Paragraph>Nombre: {item.name}</Paragraph>
        <Paragraph>Teléfono: {item.phone}</Paragraph>
        <Paragraph>Email: {item.email}</Paragraph>
        <Paragraph>Mascotas: {item.pets_count}</Paragraph>
        <Paragraph>Citas totales: {item.appointments_count}</Paragraph>
        <Paragraph>Última cita: {item.last_appointment}</Paragraph>
        <Paragraph>Servicio más usado: {item.most_used_service}</Paragraph>
        <Paragraph>Último veterinario: {item.last_veterinarian}</Paragraph>
        <Paragraph>Estado: {item.is_restricted ? "Restringido" : "Activo"}</Paragraph>
        {item.pets && item.pets.length > 0 && (
          <View>
            <Paragraph style={styles.subTitle}>Mascotas:</Paragraph>
            {item.pets.map((pet) => (
              <Paragraph key={pet.id}>- {pet.name} ({pet.species}, {pet.breed})</Paragraph>
            ))}
          </View>
        )}
        <View style={styles.buttonRow}>
          <Button mode="outlined" onPress={() => handleToggleClient(item.id)} style={styles.button}>
            {item.is_restricted ? "Activar" : "Restringir"}
          </Button>
          <Button mode="contained" onPress={() => handleDeleteClient(item.id)} buttonColor="red" style={styles.button}>
            Eliminar
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return <View style={styles.center}><Paragraph>Cargando...</Paragraph></View>;
  }

  return (
    <View style={styles.container}>
      <Title>Gestión de Clientes</Title>
      <Button mode="contained" onPress={() => setDialogVisible(true)} style={styles.addButton}>
        Crear Nuevo Cliente
      </Button>
      <FlatList
        data={clients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderClient}
        ListEmptyComponent={<Paragraph>No hay clientes</Paragraph>}
      />
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Crear Cliente</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Nombre" value={newClient.name} onChangeText={(text) => setNewClient({ ...newClient, name: text })} />
            <TextInput label="Email" value={newClient.email} onChangeText={(text) => setNewClient({ ...newClient, email: text })} keyboardType="email-address" />
            <TextInput label="Contraseña" value={newClient.password} onChangeText={(text) => setNewClient({ ...newClient, password: text })} secureTextEntry />
            <TextInput label="Teléfono" value={newClient.phone} onChangeText={(text) => setNewClient({ ...newClient, phone: text })} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancelar</Button>
            <Button onPress={handleCreateClient}>Crear</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { marginBottom: 16 },
  subTitle: { fontWeight: "bold", marginTop: 8 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  button: { flex: 1, marginHorizontal: 4 },
  addButton: { marginBottom: 16 },
});