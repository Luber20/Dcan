import React, { useState, useEffect } from "react";
import { ScrollView, Alert, View, StyleSheet, KeyboardAvoidingView, Platform, Text, TouchableOpacity, Image, Modal, FlatList } from "react-native";
import { TextInput, Button, Chip, Title, Searchbar, ActivityIndicator } from "react-native-paper";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../../context/ThemeContext";
import { API_URL } from "../../config/api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

export default function EditPetScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { token } = useAuth(); // Importante si catalogs requiere auth
  const [permissionResponse, requestPermission] = ImagePicker.useMediaLibraryPermissions();

  const pet = route.params?.pet;
  if (!pet) return null; 

  // --- ESTADOS ---
  const [name, setName] = useState(pet.name);
  const [gender, setGender] = useState(pet.gender);
  const [age, setAge] = useState(pet.age || "");
  const [weight, setWeight] = useState(pet.weight ? String(pet.weight) : "");
  
  // Vacunas (Mantenemos lógica simple por ahora)
  const isStandardVaccine = ["Al día", "Pendientes", "Ninguna"].includes(pet.vaccines);
  const [vaccineStatus, setVaccineStatus] = useState(isStandardVaccine ? pet.vaccines : "Otro");
  const [customVaccines, setCustomVaccines] = useState(isStandardVaccine ? "" : pet.vaccines);

  const [image, setImage] = useState(pet.photo_url); 
  const [newImageSelected, setNewImageSelected] = useState(false); 
  const [loading, setLoading] = useState(false);

  // --- CATÁLOGO ---
  const [catalogs, setCatalogs] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  
  // Especie y Raza (Inicializados con los datos actuales)
  // Nota: Al editar, 'selectedSpecies' será un objeto simulado {name: 'Perro'} hasta que cargue el catálogo real
  const [selectedSpecies, setSelectedSpecies] = useState({ name: pet.species }); 
  const [selectedBreed, setSelectedBreed] = useState({ name: pet.breed }); 

  const [showSpeciesModal, setShowSpeciesModal] = useState(false);
  const [showBreedModal, setShowBreedModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Cargar Catálogo y Sincronizar
  useEffect(() => {
    fetchCatalogs();
  }, []);

  const fetchCatalogs = async () => {
    try {
      const res = await axios.get(`${API_URL}/catalogs`);
      const list = res.data;
      setCatalogs(list);
      
      // Intentar encontrar el objeto especie real en la lista para habilitar las razas correctas
      const foundSpecies = list.find(s => s.name === pet.species);
      if (foundSpecies) {
        setSelectedSpecies(foundSpecies);
        // Intentar encontrar la raza
        const foundBreed = foundSpecies.breeds.find(b => b.name === pet.breed);
        if (foundBreed) setSelectedBreed(foundBreed);
        else setSelectedBreed({ name: pet.breed }); // Mantener el texto original si no está en la lista
      }
    } catch (e) {
      console.log("Error catálogo:", e);
    } finally {
      setCatalogLoading(false);
    }
  };

  // 📸 ELEGIR FOTO
  const pickImage = async () => {
    try {
        if (permissionResponse?.status !== 'granted') {
            const { status } = await requestPermission();
            if (status !== 'granted') return Alert.alert("Permiso denegado");
        }
        
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [4, 3], quality: 0.2,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setNewImageSelected(true);
        }
    } catch (err) {
        Alert.alert("Error", "No se pudo abrir la galería.");
    }
  };

  // 💾 GUARDAR CAMBIOS
  const handleUpdate = async () => {
    if (!name.trim()) return Alert.alert("Error", "El nombre es obligatorio");

    const finalVaccines = vaccineStatus === "Otro" ? customVaccines : vaccineStatus;
    setLoading(true);

    try {
        const formData = new FormData();
        formData.append("_method", "PUT"); 
        formData.append("name", String(name));
        // Enviamos nombres del catálogo o el texto original
        formData.append("species", selectedSpecies?.name || pet.species);
        formData.append("breed", selectedBreed?.name || pet.breed);
        formData.append("gender", String(gender));
        formData.append("age", String(age));
        formData.append("weight", String(weight));
        formData.append("vaccines", String(finalVaccines || ""));

        if (newImageSelected) {
            let localUri = image;
            let filename = localUri.split('/').pop();
            let match = /\.(\w+)$/.exec(filename);
            let type = match ? `image/${match[1]}` : `image/jpeg`;
            formData.append("photo", { uri: localUri, name: filename, type });
        }

        await axios.post(`${API_URL}/pets/${pet.id}`, formData, {
            headers: { 
                "Accept": "application/json",
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${token}`
            },
            transformRequest: (data) => data, 
        });

        Alert.alert("¡Éxito!", "Mascota actualizada correctamente");
        navigation.goBack();

    } catch (error) {
        Alert.alert("Error", "No se pudieron guardar los cambios.");
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Eliminar", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar", style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/pets/${pet.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigation.goBack();
          } catch (error) {
            Alert.alert("Error", "No se pudo eliminar.");
          }
        },
      },
    ]);
  };

  // Helper Input Selección
  const SelectionInput = ({ label, value, onPress, disabled }) => (
    <TouchableOpacity onPress={disabled ? null : onPress} activeOpacity={0.7} style={{marginBottom: 15}}>
        <View pointerEvents="none">
            <TextInput
                label={label}
                value={value}
                mode="outlined"
                style={{backgroundColor: disabled ? '#f0f0f0' : 'white'}}
                right={<TextInput.Icon icon="chevron-down" />}
                editable={false} 
            />
        </View>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* 📸 FOTO */}
        <View style={styles.imageContainer}>
            <TouchableOpacity onPress={pickImage}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.image} />
                ) : (
                    <View style={[styles.imagePlaceholder, {backgroundColor: theme.colors.card}]}>
                        <Ionicons name="camera" size={40} color={theme.colors.subtitle} />
                    </View>
                )}
                <View style={styles.editBadge}>
                    <Ionicons name="pencil" size={16} color="#fff" />
                </View>
            </TouchableOpacity>
            <Text style={{color: '#666', marginTop: 5, fontSize: 12}}>Editar Foto</Text>
        </View>

        <TextInput label="Nombre" value={name} onChangeText={setName} mode="outlined" style={styles.input} />

        {/* 🐾 SELECTOR DE ESPECIE */}
        {catalogLoading ? <ActivityIndicator style={{marginBottom:10}} /> : (
            <SelectionInput 
                label="Especie" 
                value={selectedSpecies?.name} 
                onPress={() => setShowSpeciesModal(true)} 
            />
        )}

        {/* 🐕 SELECTOR DE RAZA */}
        <SelectionInput 
            label="Raza" 
            value={selectedBreed?.name} 
            onPress={() => { setSearchQuery(""); setShowBreedModal(true); }}
            disabled={!selectedSpecies || !selectedSpecies.breeds} // Desactivado si no hay razas cargadas
        />

        <View style={styles.rowInput}>
            <TextInput label="Edad" value={age} onChangeText={setAge} mode="outlined" style={[styles.input, {flex: 1, marginRight: 5}]} />
            <TextInput label="Peso (Kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" mode="outlined" style={[styles.input, {flex: 1, marginLeft: 5}]} />
        </View>

        {/* GÉNERO */}
        <Text style={[styles.label, {color: theme.colors.text}]}>Género:</Text>
        <View style={styles.chipContainer}>
            {["Macho", "Hembra"].map((opt) => (
                <Chip key={opt} mode="outlined" selected={gender === opt} onPress={() => setGender(opt)} style={[styles.chip, gender === opt && {backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary}]}>{opt}</Chip>
            ))}
        </View>

        {/* VACUNAS */}
        <Text style={[styles.label, {color: theme.colors.text}]}>Vacunas:</Text>
        <View style={styles.chipContainer}>
            {["Al día", "Pendientes", "Ninguna", "Otro"].map((opt) => (
                <Chip key={opt} mode="outlined" selected={vaccineStatus === opt} onPress={() => setVaccineStatus(opt)} style={[styles.chip, vaccineStatus === opt && {backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary}]}>{opt}</Chip>
            ))}
        </View>
        {vaccineStatus === "Otro" && (
             <TextInput label="Detalla vacunas..." value={customVaccines} onChangeText={setCustomVaccines} mode="outlined" style={styles.input} />
        )}

        <Button mode="contained" onPress={handleUpdate} loading={loading} style={[styles.button, { backgroundColor: theme.colors.primary }]}>
          Guardar Cambios
        </Button>

        <Button mode="outlined" onPress={handleDelete} style={[styles.button, { borderColor: 'red', marginTop: 15 }]} textColor="red">
          Eliminar Mascota
        </Button>
        <View style={{height: 50}} />
      </ScrollView>

      {/* ================= MODAL ESPECIES ================= */}
      <Modal visible={showSpeciesModal} transparent animationType="slide" onRequestClose={() => setShowSpeciesModal(false)}>
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {backgroundColor: 'white'}]}>
                <Title style={{textAlign:'center', marginBottom:15}}>Cambiar Especie</Title>
                <FlatList 
                    data={catalogs}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({item}) => (
                        <TouchableOpacity style={styles.listItem} onPress={() => {
                                setSelectedSpecies(item);
                                setSelectedBreed({name: ""}); // Reset raza al cambiar
                                setShowSpeciesModal(false);
                            }}>
                            <MaterialCommunityIcons name="paw" size={24} color={theme.colors.primary} />
                            <Text style={styles.listText}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                />
                <Button mode="text" onPress={() => setShowSpeciesModal(false)}>Cancelar</Button>
            </View>
        </View>
      </Modal>

      {/* ================= MODAL RAZAS ================= */}
      <Modal visible={showBreedModal} transparent animationType="slide" onRequestClose={() => setShowBreedModal(false)}>
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {backgroundColor: 'white'}]}>
                <Title style={{textAlign:'center', marginBottom:10}}>Cambiar Raza</Title>
                <Searchbar placeholder="Buscar..." onChangeText={setSearchQuery} value={searchQuery} style={{marginBottom: 10, height: 45}} inputStyle={{minHeight: 0}} />
                
                <FlatList 
                    data={selectedSpecies?.breeds?.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase())) || []}
                    keyExtractor={(item) => item.id.toString()}
                    ListEmptyComponent={<Text style={{textAlign:'center', padding:20, color:'#888'}}>Sin resultados.</Text>}
                    renderItem={({item}) => (
                        <TouchableOpacity style={styles.listItem} onPress={() => { setSelectedBreed(item); setShowBreedModal(false); }}>
                            <Text style={styles.listText}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                />
                <TouchableOpacity style={[styles.listItem, {borderTopWidth:1, borderColor:'#eee'}]} onPress={() => { setSelectedBreed({name: "Mestizo/Otro"}); setShowBreedModal(false); }}>
                    <Text style={[styles.listText, {color: theme.colors.primary}]}>Mestizo / Otro</Text>
                </TouchableOpacity>
                <Button mode="text" onPress={() => setShowBreedModal(false)}>Cancelar</Button>
            </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 24 },
  imageContainer: { alignItems: 'center', marginBottom: 20 },
  image: { width: 120, height: 120, borderRadius: 60 },
  imagePlaceholder: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee' },
  editBadge: { position: 'absolute', right: 0, bottom: 0, backgroundColor: '#2E8B57', borderRadius: 15, padding: 5, elevation: 2 },
  input: { marginBottom: 15, backgroundColor: '#fff' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 5, marginBottom: 5 },
  rowInput: { flexDirection: 'row', justifyContent: 'space-between' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
  chip: { backgroundColor: '#fff' },
  button: { marginTop: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 20, padding: 20, maxHeight: '80%', elevation: 5 },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  listText: { flex: 1, fontSize: 16, marginLeft: 10, color: '#333' }
}); 