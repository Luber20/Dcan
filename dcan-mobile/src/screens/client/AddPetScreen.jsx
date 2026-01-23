import React, { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, Text, Image, TouchableOpacity, Modal, FlatList } from "react-native";
import { TextInput, Button, Title, Chip, Divider, ActivityIndicator, Searchbar, List, Surface } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../../context/ThemeContext";
import { API_URL } from "../../config/api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

export default function AddPetScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { token } = useAuth(); // Necesitamos el token si la ruta catalogs requiere auth, si es publica no importa

  // Estados Datos Básicos
  const [name, setName] = useState("");
  const [gender, setGender] = useState("Macho");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- LÓGICA CATÁLOGO ---
  const [catalogs, setCatalogs] = useState([]); // Toda la lista del backend
  const [catalogLoading, setCatalogLoading] = useState(true);
  
  // Selecciones
  const [selectedSpecies, setSelectedSpecies] = useState(null); // Objeto {id, name, breeds}
  const [selectedBreed, setSelectedBreed] = useState(null);     // Objeto {id, name}

  // Modales de Selección
  const [showSpeciesModal, setShowSpeciesModal] = useState(false);
  const [showBreedModal, setShowBreedModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Para buscar raza rápida

  // Lógica Vacunas (Mantenemos Chips visuales pero enviamos texto)
  const [vaccineStatus, setVaccineStatus] = useState("Al día");
  const [customVaccines, setCustomVaccines] = useState("");

  // 1. CARGAR CATÁLOGOS AL INICIAR
  useEffect(() => {
    fetchCatalogs();
  }, []);

  const fetchCatalogs = async () => {
    try {
      // Usamos la ruta pública o protegida según configuraste api.php
      const res = await axios.get(`${API_URL}/catalogs`);
      setCatalogs(res.data);
    } catch (e) {
      console.log("Error cargando catálogo:", e);
      // Fallback por si falla el server: dejar lista vacía (el usuario no podrá seleccionar)
    } finally {
      setCatalogLoading(false);
    }
  };

  // 2. FOTO
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [4, 3], quality: 0.5,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  // 3. GUARDAR
  const handleSave = async () => {
    if (!name.trim()) return Alert.alert("Falta información", "El nombre es obligatorio.");
    if (!selectedSpecies) return Alert.alert("Falta información", "Selecciona una especie.");

    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    // Enviamos el STRING del nombre para compatibilidad con tu BD actual
    formData.append("species", selectedSpecies.name); 
    formData.append("breed", selectedBreed ? selectedBreed.name : "Mestizo/Otro"); 
    formData.append("gender", gender);
    formData.append("age", age);
    formData.append("weight", weight);
    
    const finalVaccines = vaccineStatus === "Otro" ? customVaccines : vaccineStatus;
    formData.append("vaccines", finalVaccines);

    if (image) {
      let filename = image.split('/').pop();
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : `image`;
      formData.append("photo", { uri: image, name: filename, type });
    }

    try {
      await axios.post(`${API_URL}/pets`, formData, {
        headers: { 
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}` 
        },
      });
      Alert.alert("¡Éxito!", "Mascota guardada correctamente 🐾");
      navigation.goBack();
    } catch (error) {
      console.log("Error subiendo:", error.response?.data || error.message);
      Alert.alert("Error", "No se pudo guardar.");
    } finally {
      setLoading(false);
    }
  };

  // --- UI COMPONENTS HELPER ---
  
  // Input Simulado (Parece TextInput pero abre Modal)
  const SelectionInput = ({ label, value, onPress, disabled, icon }) => (
    <TouchableOpacity onPress={disabled ? null : onPress} activeOpacity={0.7} style={{marginBottom: 15}}>
        <View pointerEvents="none">
            <TextInput
                label={label}
                value={value}
                mode="outlined"
                style={{backgroundColor: disabled ? '#f0f0f0' : 'white'}}
                right={<TextInput.Icon icon={icon || "chevron-down"} />}
                editable={false} // No se puede escribir, solo tocar
            />
        </View>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* FOTO */}
        <View style={styles.imageContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.image} />
                ) : (
                    <View style={[styles.imagePlaceholder, {backgroundColor: theme.colors.card}]}>
                        <Ionicons name="camera" size={40} color={theme.colors.subtitle} />
                        <Text style={{color: theme.colors.subtitle, marginTop: 5}}>Subir Foto</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>

        <TextInput label="Nombre *" value={name} onChangeText={setName} mode="outlined" style={styles.input} />

        {/* 🐾 SELECTOR DE ESPECIE (CATÁLOGO) */}
        {catalogLoading ? (
            <ActivityIndicator style={{marginBottom:15}} />
        ) : (
            <SelectionInput 
                label="Especie *" 
                value={selectedSpecies?.name || ""} 
                onPress={() => setShowSpeciesModal(true)}
                icon="paw"
            />
        )}

        {/* 🐕 SELECTOR DE RAZA (Dependiente) */}
        <SelectionInput 
            label="Raza" 
            value={selectedBreed?.name || ""} 
            onPress={() => {
                setSearchQuery(""); // Reset búsqueda
                setShowBreedModal(true);
            }}
            disabled={!selectedSpecies} // Desactivado si no hay especie
            icon="format-list-bulleted"
        />

        {/* DATOS FÍSICOS */}
        <View style={styles.rowInput}>
            <TextInput label="Edad (Ej: 2 años)" value={age} onChangeText={setAge} mode="outlined" style={[styles.input, {flex: 1, marginRight: 5}]} />
            <TextInput label="Peso (Kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" mode="outlined" style={[styles.input, {flex: 1, marginLeft: 5}]} />
        </View>

        {/* ⚧ GÉNERO (Chips en lugar de Radio para mejor look) */}
        <Text style={[styles.label, {color: theme.colors.text}]}>Género:</Text>
        <View style={styles.chipContainer}>
            {["Macho", "Hembra"].map((opt) => (
                <Chip 
                    key={opt} 
                    mode="outlined" 
                    selected={gender === opt} 
                    onPress={() => setGender(opt)}
                    style={[styles.chip, gender === opt && {backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary}]}
                    textStyle={{color: gender === opt ? theme.colors.primary : "#666"}}
                    icon={opt === "Macho" ? "gender-male" : "gender-female"}
                >
                    {opt}
                </Chip>
            ))}
        </View>

        {/* 💉 VACUNAS */}
        <Text style={[styles.label, {color: theme.colors.text}]}>Vacunas:</Text>
        <View style={styles.chipContainer}>
            {["Al día", "Pendientes", "Ninguna", "Otro"].map((opt) => (
                <Chip 
                    key={opt} mode="outlined" selected={vaccineStatus === opt} onPress={() => setVaccineStatus(opt)}
                    style={[styles.chip, vaccineStatus === opt && {backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary}]}
                    textStyle={{color: vaccineStatus === opt ? theme.colors.primary : "#666"}}
                >
                    {opt}
                </Chip>
            ))}
        </View>
        {vaccineStatus === "Otro" && (
            <TextInput label="Detalla vacunas..." value={customVaccines} onChangeText={setCustomVaccines} mode="outlined" style={styles.input} />
        )}

        <Button mode="contained" onPress={handleSave} loading={loading} disabled={loading} style={[styles.button, { backgroundColor: theme.colors.primary }]} icon="check">
          Guardar Mascota
        </Button>
        <View style={{height: 50}} /> 
      </ScrollView>

      {/* ================= MODAL ESPECIES ================= */}
      <Modal visible={showSpeciesModal} transparent animationType="slide" onRequestClose={() => setShowSpeciesModal(false)}>
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {backgroundColor: 'white'}]}>
                <Title style={{textAlign:'center', marginBottom:15}}>Selecciona Especie</Title>
                <FlatList 
                    data={catalogs}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({item}) => (
                        <TouchableOpacity 
                            style={styles.listItem} 
                            onPress={() => {
                                setSelectedSpecies(item);
                                setSelectedBreed(null); // Reset raza al cambiar especie
                                setShowSpeciesModal(false);
                            }}
                        >
                            <MaterialCommunityIcons name="paw" size={24} color={theme.colors.primary} />
                            <Text style={styles.listText}>{item.name}</Text>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
                        </TouchableOpacity>
                    )}
                />
                <Button mode="text" onPress={() => setShowSpeciesModal(false)}>Cerrar</Button>
            </View>
        </View>
      </Modal>

      {/* ================= MODAL RAZAS ================= */}
      <Modal visible={showBreedModal} transparent animationType="slide" onRequestClose={() => setShowBreedModal(false)}>
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {backgroundColor: 'white'}]}>
                <Title style={{textAlign:'center', marginBottom:10}}>Selecciona Raza</Title>
                <Text style={{textAlign:'center', color:'#666', marginBottom:10}}>De: {selectedSpecies?.name}</Text>
                
                <Searchbar 
                    placeholder="Buscar raza..." 
                    onChangeText={setSearchQuery} 
                    value={searchQuery} 
                    style={{marginBottom: 10, backgroundColor:'#f0f0f0', height: 45}}
                    inputStyle={{minHeight: 0}}
                />

                <FlatList 
                    data={selectedSpecies?.breeds?.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase())) || []}
                    keyExtractor={(item) => item.id.toString()}
                    ListEmptyComponent={<Text style={{textAlign:'center', padding:20, color:'#888'}}>No se encontraron razas.</Text>}
                    renderItem={({item}) => (
                        <TouchableOpacity 
                            style={styles.listItem} 
                            onPress={() => {
                                setSelectedBreed(item);
                                setShowBreedModal(false);
                            }}
                        >
                            <Text style={styles.listText}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                />
                {/* Opción Mestizo/Otro siempre disponible */}
                <TouchableOpacity style={[styles.listItem, {borderTopWidth:1, borderColor:'#eee'}]} onPress={() => { setSelectedBreed({name: "Mestizo/Otro"}); setShowBreedModal(false); }}>
                    <Text style={[styles.listText, {color: theme.colors.primary, fontWeight:'bold'}]}>Mestizo / Otro</Text>
                </TouchableOpacity>

                <Button mode="text" onPress={() => setShowBreedModal(false)}>Cerrar</Button>
            </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 24 },
  imageContainer: { alignItems: 'center', marginBottom: 20 },
  imagePicker: { borderRadius: 60, overflow: 'hidden' },
  image: { width: 120, height: 120, borderRadius: 60 },
  imagePlaceholder: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderStyle: 'dashed' },
  input: { marginBottom: 15, backgroundColor: '#fff' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 5, marginBottom: 5 },
  rowInput: { flexDirection: 'row', justifyContent: 'space-between' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
  chip: { backgroundColor: '#fff' },
  button: { marginTop: 10, paddingVertical: 5, borderRadius: 10 },
  
  // Estilos Modales
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 20, padding: 20, maxHeight: '80%', elevation: 5 },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  listText: { flex: 1, fontSize: 16, marginLeft: 10, color: '#333' }
});