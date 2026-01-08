import React, { useState } from "react";
import { ScrollView, Alert, View, StyleSheet, KeyboardAvoidingView, Platform, Text, TouchableOpacity, Image } from "react-native";
import { TextInput, Button, RadioButton, Chip } from "react-native-paper";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../../context/ThemeContext";
import { API_URL } from "../../config/api";
import { Ionicons } from "@expo/vector-icons";

export default function EditPetScreen({ route, navigation }) {
  const { theme } = useTheme();
  
  const [permissionResponse, requestPermission] = ImagePicker.useMediaLibraryPermissions();

  const pet = route.params?.pet;
  if (!pet) return null; 

  // --- ESTADOS ---
  const [name, setName] = useState(pet.name);
  const isStandard = ["Perro", "Gato"].includes(pet.species);
  const [speciesSelection, setSpeciesSelection] = useState(isStandard ? pet.species : "Otro");
  const [customSpecies, setCustomSpecies] = useState(isStandard ? "" : pet.species);
  const [breed, setBreed] = useState(pet.breed || "");
  const [gender, setGender] = useState(pet.gender);
  const [age, setAge] = useState(pet.age || "");
  const [weight, setWeight] = useState(pet.weight ? String(pet.weight) : "");
  
  const isStandardVaccine = ["Al día", "Pendientes", "Ninguna"].includes(pet.vaccines);
  const [vaccineStatus, setVaccineStatus] = useState(isStandardVaccine ? pet.vaccines : "Otro");
  const [customVaccines, setCustomVaccines] = useState(isStandardVaccine ? "" : pet.vaccines);

  const [image, setImage] = useState(pet.photo_url); 
  const [newImageSelected, setNewImageSelected] = useState(false); 
  const [loading, setLoading] = useState(false);

  // 📸 ELEGIR FOTO
  const pickImage = async () => {
    try {
        if (permissionResponse?.status !== 'granted') {
            const { status } = await requestPermission();
            if (status !== 'granted') {
                Alert.alert("Permiso denegado", "Necesitamos acceso a la galería.");
                return;
            }
        }

        // Solución "inteligente" para el Warning: detecta qué usa tu versión de Expo
        const mediaTypes = ImagePicker.MediaType 
            ? ImagePicker.MediaType.Images 
            : ImagePicker.MediaTypeOptions.Images;

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: mediaTypes,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.2, // Mantenemos 0.2 para que no falle la red
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setNewImageSelected(true);
        }
    } catch (err) {
        Alert.alert("Error", "No se pudo abrir la galería.");
    }
  };

  // 💾 GUARDAR CAMBIOS (Lógica EXACTA de la versión que funcionó)
  const handleUpdate = async () => {
    if (!name.trim()) return Alert.alert("Error", "El nombre es obligatorio");

    const finalSpecies = speciesSelection === "Otro" ? customSpecies : speciesSelection;
    const finalVaccines = vaccineStatus === "Otro" ? customVaccines : vaccineStatus;

    setLoading(true);

    try {
        const formData = new FormData();
        
        // Laravel Method Spoofing
        formData.append("_method", "PUT"); 
        
        // Datos de texto
        formData.append("name", String(name));
        formData.append("species", String(finalSpecies));
        formData.append("breed", String(breed));
        formData.append("gender", String(gender));
        formData.append("age", String(age));
        formData.append("weight", String(weight));
        formData.append("vaccines", String(finalVaccines || ""));

        // Foto
        if (newImageSelected) {
            let localUri = image;
            // Fix Android
            if (Platform.OS === 'android' && !localUri.startsWith('file://') && !localUri.startsWith('content://')) {
                localUri = 'file://' + localUri;
            }

            let filename = localUri.split('/').pop();
            let match = /\.(\w+)$/.exec(filename);
            let type = match ? `image/${match[1]}` : `image/jpeg`;
            if (type === 'image/jpg') type = 'image/jpeg';

            formData.append("photo", { 
                uri: localUri, 
                name: filename, 
                type: type 
            });
        }

        // PETICIÓN (Idéntica a la que funcionó)
        await axios.post(`${API_URL}/pets/${pet.id}`, formData, {
            headers: {
                "Accept": "application/json",
                "Content-Type": "multipart/form-data", // Dejamos esto porque en la versión exitosa estaba
            },
            transformRequest: (data) => {
                return data; 
            },
        });

        Alert.alert("¡Éxito!", "Mascota actualizada correctamente");
        navigation.goBack();

    } catch (error) {
        // Manejo de error silencioso pero informativo para el usuario
        if (error.response) {
            Alert.alert("Error del Servidor", "No se pudieron guardar los cambios.");
        } else if (error.request) {
            Alert.alert("Error de Conexión", "El servidor no responde. Verifica tu Wifi.");
        } else {
            Alert.alert("Error", "Ocurrió un problema inesperado.");
        }
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Eliminar", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/pets/${pet.id}`);
            navigation.goBack();
          } catch (error) {
            Alert.alert("Error", "No se pudo eliminar.");
          }
        },
      },
    ]);
  };

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
            <Text style={{color: '#666', marginTop: 5, fontSize: 12}}>Toca para cambiar foto</Text>
        </View>

        <TextInput label="Nombre" value={name} onChangeText={setName} mode="outlined" style={styles.input} />

        <Text style={[styles.label, {color: theme.colors.text}]}>Especie:</Text>
        <RadioButton.Group onValueChange={setSpeciesSelection} value={speciesSelection}>
            <View style={styles.rowWrap}>
                <View style={styles.radioOption}><RadioButton value="Perro" color="#2E8B57"/><Text style={{color: theme.colors.text}}>Perro</Text></View>
                <View style={styles.radioOption}><RadioButton value="Gato" color="#2E8B57"/><Text style={{color: theme.colors.text}}>Gato</Text></View>
                <View style={styles.radioOption}><RadioButton value="Otro" color="#2E8B57"/><Text style={{color: theme.colors.text}}>Otro</Text></View>
            </View>
        </RadioButton.Group>
        
        {speciesSelection === "Otro" && (
            <TextInput label="Especifica especie" value={customSpecies} onChangeText={setCustomSpecies} mode="outlined" style={styles.input} />
        )}

        <View style={styles.rowInput}>
            <TextInput label="Edad" value={age} onChangeText={setAge} mode="outlined" style={[styles.input, {flex: 1, marginRight: 5}]} />
            <TextInput label="Peso" value={weight} onChangeText={setWeight} keyboardType="numeric" mode="outlined" style={[styles.input, {flex: 1, marginLeft: 5}]} />
        </View>

        <TextInput label="Raza" value={breed} onChangeText={setBreed} mode="outlined" style={styles.input} />

        <Text style={[styles.label, {color: theme.colors.text}]}>Vacunas:</Text>
        <View style={styles.chipContainer}>
            {["Al día", "Pendientes", "Ninguna", "Otro"].map((opt) => (
                <Chip 
                    key={opt} 
                    mode="outlined" 
                    selected={vaccineStatus === opt} 
                    onPress={() => setVaccineStatus(opt)}
                    style={styles.chip}
                    textStyle={{color: vaccineStatus === opt ? "#2E8B57" : "#666"}}
                >
                    {opt}
                </Chip>
            ))}
        </View>
        {vaccineStatus === "Otro" && (
             <TextInput label="Detalla vacunas..." value={customVaccines} onChangeText={setCustomVaccines} mode="outlined" style={styles.input} />
        )}

        <RadioButton.Group onValueChange={setGender} value={gender}>
            <View style={styles.row}>
                <View style={styles.radioOption}><RadioButton value="Macho" color="#2E8B57"/><Text style={{color: theme.colors.text}}>Macho</Text></View>
                <View style={styles.radioOption}><RadioButton value="Hembra" color="#2E8B57"/><Text style={{color: theme.colors.text}}>Hembra</Text></View>
            </View>
        </RadioButton.Group>

        <Button mode="contained" onPress={handleUpdate} loading={loading} style={[styles.button, { backgroundColor: theme.colors.primary }]}>
          Guardar Cambios
        </Button>

        <Button mode="outlined" onPress={handleDelete} style={[styles.button, { borderColor: 'red', marginTop: 15 }]} textColor="red">
          Eliminar Mascota
        </Button>
        <View style={{height: 50}} />
      </ScrollView>
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
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 },
  rowInput: { flexDirection: 'row', justifyContent: 'space-between' },
  radioOption: { flexDirection: 'row', alignItems: 'center', marginRight: 15 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
  chip: { backgroundColor: '#fff' },
  button: { marginTop: 10 },
});