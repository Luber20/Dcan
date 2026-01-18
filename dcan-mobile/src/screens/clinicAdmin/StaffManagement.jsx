import React, { useEffect, useState, useMemo } from "react";
import { View, StyleSheet, FlatList, Alert, Modal, TouchableOpacity } from "react-native";
import { Text, Card, FAB, Button, TextInput, Title, ActivityIndicator, IconButton, Avatar } from "react-native-paper";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { API_URL } from "../../config/api";

export default function StaffManagement() {
  const { token } = useAuth();
  const { theme } = useTheme();

  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal y Edición
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVet, setEditingVet] = useState(null); 

  // Formulario
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState(""); 
  const [saving, setSaving] = useState(false);

  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  }), [token]);

  useEffect(() => {
    fetchVets();
  }, []);

  const fetchVets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/clinic-veterinarians`, { headers });
      setVets(res.data);
    } catch (error) {
      console.log("Error cargando vets", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingVet(null);
    setName(""); setEmail(""); setPhone(""); setPassword("");
    setModalVisible(true);
  };

  const openEdit = (vet) => {
    setEditingVet(vet);
    setName(vet.name || "");
    setEmail(vet.email || "");
    setPhone(vet.phone || "");
    setPassword(""); // Vacío porque no es obligatorio cambiarla al editar
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name || !email) {
      Alert.alert("Error", "Nombre y correo son obligatorios.");
      return;
    }
    // Si estamos creando, la contraseña es obligatoria
    if (!editingVet && !password) {
      Alert.alert("Error", "Debes asignar una contraseña al nuevo veterinario.");
      return;
    }

    setSaving(true);
    try {
      if (editingVet) {
        // ✅ EDITAR (PUT)
        await axios.put(`${API_URL}/clinic-veterinarians/${editingVet.id}`, {
          name, email, phone
        }, { headers });
        Alert.alert("Éxito", "Datos del veterinario actualizados.");
      } else {
        // ✅ CREAR (POST)
        await axios.post(`${API_URL}/register-veterinarian`, {
          name, email, phone, password
        }, { headers });
        Alert.alert("Éxito", "Veterinario registrado correctamente.");
      }
      setModalVisible(false);
      fetchVets();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Eliminar", "¿Estás seguro de eliminar a este veterinario?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar", style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/clinic-veterinarians/${id}`, { headers });
            fetchVets();
          } catch (e) {
            Alert.alert("Error", "No se pudo eliminar.");
          }
        }
      }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Title style={[styles.headerTitle, { color: theme.colors.primary }]}>Equipo Médico</Title>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={vets}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content style={styles.cardRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Avatar.Icon size={40} icon="doctor" style={{ backgroundColor: '#e0f2f1', marginRight: 10 }} color="#2E8B57" />
                    <View style={{ flex: 1 }}>
                        <Title style={{ fontSize: 16 }}>{item.name}</Title>
                        <Text style={{ fontSize: 13, opacity: 0.7 }}>{item.email}</Text>
                        {!!item.phone && <Text style={{ fontSize: 13, color: '#2E8B57' }}>{item.phone}</Text>}
                    </View>
                </View>
                
                <View style={{ flexDirection: 'row' }}>
                  <IconButton icon="pencil" iconColor="blue" size={20} onPress={() => openEdit(item)} />
                  <IconButton icon="delete" iconColor="red" size={20} onPress={() => handleDelete(item.id)} />
                </View>
              </Card.Content>
            </Card>
          )}
          ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20, opacity: 0.6 }}>No tienes veterinarios registrados.</Text>}
        />
      )}

      <FAB style={styles.fab} icon="plus" onPress={openCreate} label="Agregar" />

      {/* Modal Formulario */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Title style={{ textAlign: 'center', marginBottom: 15 }}>
                {editingVet ? "Editar Veterinario" : "Nuevo Veterinario"}
            </Title>
            
            <TextInput label="Nombre completo" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
            <TextInput label="Correo electrónico" value={email} onChangeText={setEmail} mode="outlined" autoCapitalize="none" style={styles.input} />
            <TextInput label="Teléfono" value={phone} onChangeText={setPhone} mode="outlined" keyboardType="phone-pad" style={styles.input} />
            
            {!editingVet && (
              <TextInput label="Contraseña" value={password} onChangeText={setPassword} mode="outlined" secureTextEntry style={styles.input} />
            )}

            <View style={styles.modalButtons}>
              <Button mode="outlined" onPress={() => setModalVisible(false)} style={{ flex: 1, marginRight: 5 }}>Cancelar</Button>
              <Button mode="contained" onPress={handleSave} loading={saving} style={{ flex: 1, marginLeft: 5 }}>Guardar</Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerTitle: { textAlign: "center", marginBottom: 15, fontWeight: "bold" },
  card: { marginBottom: 10, borderRadius: 12, elevation: 2, backgroundColor: 'white' },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  fab: { position: "absolute", margin: 16, right: 0, bottom: 0, backgroundColor: "#2E8B57" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: "white", padding: 20, borderRadius: 15, elevation: 5 },
  input: { marginBottom: 10, backgroundColor: "white", height: 45 },
  modalButtons: { flexDirection: "row", marginTop: 10 }
});