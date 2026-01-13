import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, FlatList, Alert } from "react-native";
import { TextInput, Button, Title, Card, Paragraph, Dialog, Portal } from "react-native-paper";
import axios from "axios";
import { API_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

export default function StaffManagement() {
  const { user, token } = useAuth();
  const [veterinarians, setVeterinarians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [selectedVet, setSelectedVet] = useState(null);
  const [newVet, setNewVet] = useState({ name: "", email: "", password: "" });
  const [editVet, setEditVet] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    fetchVeterinarians();
  }, []);

  const fetchVeterinarians = async () => {
    try {
      const response = await axios.get(`${API_URL}/clinic-veterinarians`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVeterinarians(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVet = async () => {
    if (!newVet.name || !newVet.email || !newVet.password) {
      Alert.alert("Error", "Nombre, email y contraseña son obligatorios");
      return;
    }
    if (newVet.password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }
    try {
      await axios.post(`${API_URL}/register-veterinarian`, newVet, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert("Éxito", `Veterinario creado. Credenciales: ${newVet.email} / ${newVet.password}`);
      setNewVet({ name: "", email: "", password: "" });
      setCreateDialogVisible(false);
      fetchVeterinarians();
    } catch (error) {
      console.log("Error creando veterinario:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "No se pudo crear el veterinario");
    }
  };

  const handleEditVet = async () => {
    try {
      await axios.put(`${API_URL}/clinic-veterinarians/${selectedVet.id}`, editVet, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      Alert.alert("Éxito", "Veterinario actualizado");
      setEditDialogVisible(false);
      fetchVeterinarians();
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar");
    }
  };

  const handleDeleteVet = async (vetId) => {
    Alert.alert("Confirmar", "¿Eliminar este veterinario?", [
      { text: "Cancelar" },
      {
        text: "Eliminar",
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/clinic-veterinarians/${vetId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert("Éxito", "Veterinario eliminado");
            fetchVeterinarians();
          } catch (error) {
            Alert.alert("Error", "No se pudo eliminar");
          }
        },
      },
    ]);
  };

  const openEditDialog = (vet) => {
    setSelectedVet(vet);
    setEditVet({ name: vet.name, email: vet.email, phone: vet.phone || "" });
    setEditDialogVisible(true);
  };

  const renderVet = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Paragraph>Nombre: {item.name}</Paragraph>
        <Paragraph>Email: {item.email}</Paragraph>
        <Paragraph>Teléfono: {item.phone}</Paragraph>
        <View style={styles.buttonRow}>
          <Button mode="outlined" onPress={() => openEditDialog(item)} style={styles.button}>
            Editar
          </Button>
          <Button mode="contained" onPress={() => handleDeleteVet(item.id)} buttonColor="red" style={styles.button}>
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
      <Title>Gestión de Personal</Title>
      <Button mode="contained" onPress={() => setCreateDialogVisible(true)} style={styles.addButton}>
        Crear Veterinario
      </Button>
      <FlatList
        data={veterinarians}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderVet}
        ListEmptyComponent={<Paragraph>No hay veterinarios</Paragraph>}
      />
      <Portal>
        <Dialog visible={createDialogVisible} onDismiss={() => setCreateDialogVisible(false)}>
          <Dialog.Title>Crear Veterinario</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Nombre" value={newVet.name} onChangeText={(text) => setNewVet({ ...newVet, name: text })} />
            <TextInput label="Email" value={newVet.email} onChangeText={(text) => setNewVet({ ...newVet, email: text })} keyboardType="email-address" />
            <TextInput label="Contraseña" value={newVet.password} onChangeText={(text) => setNewVet({ ...newVet, password: text })} secureTextEntry />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCreateDialogVisible(false)}>Cancelar</Button>
            <Button onPress={handleCreateVet}>Crear</Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog visible={editDialogVisible} onDismiss={() => setEditDialogVisible(false)}>
          <Dialog.Title>Editar Veterinario</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Nombre" value={editVet.name} onChangeText={(text) => setEditVet({ ...editVet, name: text })} />
            <TextInput label="Email" value={editVet.email} onChangeText={(text) => setEditVet({ ...editVet, email: text })} keyboardType="email-address" />
            <TextInput label="Teléfono" value={editVet.phone} onChangeText={(text) => setEditVet({ ...editVet, phone: text })} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)}>Cancelar</Button>
            <Button onPress={handleEditVet}>Guardar</Button>
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
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  button: { flex: 1, marginHorizontal: 4 },
  addButton: { marginBottom: 16 },
});