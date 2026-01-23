import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Alert, SafeAreaView, Platform, StatusBar } from "react-native";
import { Title, Card, Paragraph, Button, TextInput, Dialog, Portal, FAB, Avatar, Text } from "react-native-paper";
import axios from "axios";
import { API_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function ClientManagement() {
  const { user, token } = useAuth();
  const { theme } = useTheme();
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
        style: "destructive",
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
      Alert.alert("Éxito", "Estado actualizado");
      fetchClients();
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar");
    }
  };

  const renderClient = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={{flexDirection:'row', alignItems:'center', marginBottom:10}}>
            <Avatar.Text size={40} label={item.name.substring(0,2).toUpperCase()} style={{backgroundColor: theme.colors.primary}} />
            <View style={{marginLeft: 10}}>
                <Title style={{fontSize:18}}>{item.name}</Title>
                <Paragraph style={{fontSize:12, color:'#666'}}>{item.email}</Paragraph>
            </View>
        </View>
        
        <View style={styles.statsRow}>
            <View style={styles.statItem}>
                <Text style={styles.statVal}>{item.pets_count}</Text>
                <Text style={styles.statLabel}>Mascotas</Text>
            </View>
            <View style={styles.statItem}>
                <Text style={styles.statVal}>{item.appointments_count}</Text>
                <Text style={styles.statLabel}>Citas</Text>
            </View>
            <View style={[styles.statItem, {borderRightWidth:0}]}>
                <Text style={[styles.statVal, {color: item.is_restricted ? 'red' : 'green'}]}>
                    {item.is_restricted ? "Restr." : "Activo"}
                </Text>
                <Text style={styles.statLabel}>Estado</Text>
            </View>
        </View>

        {item.pets && item.pets.length > 0 && (
          <View style={{marginTop: 10, backgroundColor: '#f5f5f5', padding: 8, borderRadius: 8}}>
            <Text style={{fontWeight:'bold', fontSize:12, marginBottom:4}}>Mascotas:</Text>
            {item.pets.map((pet) => (
              <Text key={pet.id} style={{fontSize:12}}>• {pet.name} ({pet.species})</Text>
            ))}
          </View>
        )}

        <View style={styles.buttonRow}>
          <Button mode="outlined" onPress={() => handleToggleClient(item.id)} style={styles.button}>
            {item.is_restricted ? "Activar" : "Bloquear"}
          </Button>
          <Button mode="outlined" textColor="red" onPress={() => handleDeleteClient(item.id)} style={[styles.button, {borderColor:'red'}]}>
            Eliminar
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) return <View style={styles.center}><Paragraph>Cargando clientes...</Paragraph></View>;

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={styles.headerContainer}>
         <Title style={[styles.headerTitle, { color: theme.colors.primary }]}>Clientes</Title>
         <Paragraph>Administración de usuarios</Paragraph>
      </View>

      <FlatList
        data={clients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderClient}
        contentContainerStyle={{padding: 16, paddingBottom: 80}}
        ListEmptyComponent={<Paragraph style={{textAlign:'center', marginTop:20}}>No hay clientes registrados.</Paragraph>}
      />
      
      <FAB
        style={[styles.fab, {backgroundColor: theme.colors.primary}]}
        icon="plus"
        label="Nuevo Cliente"
        onPress={() => setDialogVisible(true)}
        color="white"
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Nuevo Cliente</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Nombre" value={newClient.name} onChangeText={(text) => setNewClient({ ...newClient, name: text })} style={styles.input} mode="outlined"/>
            <TextInput label="Email" value={newClient.email} onChangeText={(text) => setNewClient({ ...newClient, email: text })} keyboardType="email-address" style={styles.input} mode="outlined"/>
            <TextInput label="Contraseña" value={newClient.password} onChangeText={(text) => setNewClient({ ...newClient, password: text })} secureTextEntry style={styles.input} mode="outlined"/>
            <TextInput label="Teléfono" value={newClient.phone} onChangeText={(text) => setNewClient({ ...newClient, phone: text })} style={styles.input} mode="outlined"/>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancelar</Button>
            <Button onPress={handleCreateClient}>Crear</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 0 },
  headerContainer: { paddingHorizontal: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 26, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { marginBottom: 12, borderRadius: 16, elevation: 2, backgroundColor: 'white' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#eee', paddingVertical: 8 },
  statItem: { flex: 1, alignItems: 'center', borderRightWidth: 1, borderColor: '#eee' },
  statVal: { fontWeight: 'bold', fontSize: 16 },
  statLabel: { fontSize: 10, color: '#888' },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 15, gap: 10 },
  button: { flex: 1 },
  input: { marginBottom: 10, backgroundColor: 'white' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});