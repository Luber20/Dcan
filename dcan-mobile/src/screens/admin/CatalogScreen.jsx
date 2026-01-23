import React, { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, ScrollView, FlatList, Alert, SafeAreaView, Platform, StatusBar, KeyboardAvoidingView } from "react-native";
import { Title, Card, Paragraph, Button, TextInput, FAB, IconButton, List, Divider, Dialog, Portal, Text } from "react-native-paper";
import axios from "axios";
import { API_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function CatalogScreen() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modales
  const [visibleSpeciesModal, setVisibleSpeciesModal] = useState(false);
  const [visibleBreedModal, setVisibleBreedModal] = useState(false);
  
  // Inputs
  const [newSpeciesName, setNewSpeciesName] = useState("");
  const [newBreedName, setNewBreedName] = useState("");
  const [selectedSpeciesId, setSelectedSpeciesId] = useState(null);

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    fetchCatalogs();
  }, []);

  const fetchCatalogs = async () => {
    try {
      const res = await axios.get(`${API_URL}/catalogs`); // Ruta pública de lectura
      setCatalogs(res.data);
    } catch (e) {
      console.log("Error cargando catálogos", e);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA ESPECIES ---
  const handleAddSpecies = async () => {
    if (!newSpeciesName.trim()) return;
    try {
      await axios.post(`${API_URL}/admin/species`, { name: newSpeciesName }, { headers });
      setNewSpeciesName("");
      setVisibleSpeciesModal(false);
      fetchCatalogs();
    } catch (e) {
      Alert.alert("Error", "No se pudo crear la especie.");
    }
  };

  const handleDeleteSpecies = (id) => {
    Alert.alert("Eliminar Especie", "Esto eliminará también todas sus razas asociadas.", [
        { text: "Cancelar" },
        { text: "Eliminar", style: 'destructive', onPress: async () => {
            try {
                await axios.delete(`${API_URL}/admin/species/${id}`, { headers });
                fetchCatalogs();
            } catch(e) { Alert.alert("Error al eliminar"); }
        }}
    ]);
  };

  // --- LÓGICA RAZAS ---
  const openBreedModal = (speciesId) => {
    setSelectedSpeciesId(speciesId);
    setNewBreedName("");
    setVisibleBreedModal(true);
  };

  const handleAddBreed = async () => {
    if (!newBreedName.trim() || !selectedSpeciesId) return;
    try {
      await axios.post(`${API_URL}/admin/breeds`, { 
        species_id: selectedSpeciesId,
        name: newBreedName 
      }, { headers });
      setNewBreedName("");
      setVisibleBreedModal(false);
      fetchCatalogs();
    } catch (e) {
      Alert.alert("Error", "No se pudo agregar la raza.");
    }
  };

  const handleDeleteBreed = async (id) => {
     try {
        await axios.delete(`${API_URL}/admin/breeds/${id}`, { headers });
        fetchCatalogs();
     } catch(e) { Alert.alert("Error al eliminar raza"); }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerContainer}>
        <Title style={[styles.headerTitle, { color: theme.colors.primary }]}>Catálogo Global</Title>
        <Paragraph>Estandarización de Especies y Razas</Paragraph>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}>
        {catalogs.map((species) => (
          <List.Accordion
            key={species.id}
            title={species.name}
            titleStyle={{fontWeight:'bold', fontSize: 16}}
            left={props => <List.Icon {...props} icon="paw" color={theme.colors.primary} />}
            style={[styles.accordion, {backgroundColor: 'white'}]}
            onLongPress={() => handleDeleteSpecies(species.id)} // Mantener presionado para borrar especie
          >
            <View style={{backgroundColor: '#f9f9f9', paddingVertical: 5}}>
                {species.breeds.length === 0 && <Text style={{padding: 15, fontStyle:'italic', color:'#888'}}>No hay razas registradas.</Text>}
                
                {species.breeds.map(breed => (
                    <List.Item
                        key={breed.id}
                        title={breed.name}
                        right={props => <IconButton {...props} icon="delete-outline" iconColor="red" size={20} onPress={() => handleDeleteBreed(breed.id)} />}
                        style={{paddingLeft: 30}}
                    />
                ))}
                
                <Button 
                    mode="text" 
                    icon="plus" 
                    onPress={() => openBreedModal(species.id)}
                    style={{alignSelf:'flex-start', marginLeft: 20, marginTop: 5}}
                >
                    Agregar Raza a {species.name}
                </Button>
            </View>
          </List.Accordion>
        ))}
      </ScrollView>

      {/* FAB para crear nueva ESPECIE */}
      <FAB
        style={[styles.fab, {backgroundColor: theme.colors.primary}]}
        icon="plus"
        label="Nueva Especie"
        onPress={() => setVisibleSpeciesModal(true)}
        color="white"
      />

      {/* MODAL CREAR ESPECIE */}
      <Portal>
        <Dialog visible={visibleSpeciesModal} onDismiss={() => setVisibleSpeciesModal(false)}>
          <Dialog.Title>Nueva Especie</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Nombre (Ej: Perro, Gato)" value={newSpeciesName} onChangeText={setNewSpeciesName} mode="outlined" autoFocus />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisibleSpeciesModal(false)}>Cancelar</Button>
            <Button onPress={handleAddSpecies}>Crear</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* MODAL CREAR RAZA */}
      <Portal>
        <Dialog visible={visibleBreedModal} onDismiss={() => setVisibleBreedModal(false)}>
          <Dialog.Title>Nueva Raza</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Nombre de la Raza" value={newBreedName} onChangeText={setNewBreedName} mode="outlined" autoFocus />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisibleBreedModal(false)}>Cancelar</Button>
            <Button onPress={handleAddBreed}>Agregar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 0 },
  headerContainer: { paddingHorizontal: 20, paddingBottom: 15, alignItems:'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  accordion: { marginBottom: 10, borderRadius: 10, overflow: 'hidden', elevation: 2 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});