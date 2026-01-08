import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, Text, Image, TouchableOpacity } from "react-native";
import { TextInput, Button, Title, RadioButton, HelperText, Chip } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker"; // 📸 Librería de imagen
import { useTheme } from "../../context/ThemeContext";
import { API_URL } from "../../config/api";
import { Ionicons } from "@expo/vector-icons";

export default function AddPetScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  
  // Estados
  const [name, setName] = useState("");
  
  // Lógica Especie
  const [speciesSelection, setSpeciesSelection] = useState("Perro"); // Lo que selecciona el Radio
  const [customSpecies, setCustomSpecies] = useState(""); // Si escribe "Otro"
  
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState("Macho");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  
  // Lógica Vacunas
  const [vaccineStatus, setVaccineStatus] = useState("Al día"); // Opción seleccionada
  const [customVaccines, setCustomVaccines] = useState("");
  
  const [image, setImage] = useState(null); // 📸 Foto seleccionada
  const [loading, setLoading] = useState(false);

  // 📸 FUNCIÓN PARA ELEGIR FOTO
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, // Calidad media para no saturar
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Falta información", "El nombre es obligatorio.");
      return;
    }

    // Definir el valor final de la especie
    const finalSpecies = speciesSelection === "Otro" ? customSpecies : speciesSelection;
    if (!finalSpecies.trim()) {
        Alert.alert("Error", "Por favor especifica la especie.");
        return;
    }

    // Definir vacunas
    const finalVaccines = vaccineStatus === "Otro" ? customVaccines : vaccineStatus;

    setLoading(true);

    // 📤 USAMOS FORMDATA PARA ENVIAR FOTO + TEXTO
    const formData = new FormData();
    formData.append("name", name);
    formData.append("species", finalSpecies);
    formData.append("breed", breed);
    formData.append("gender", gender);
    formData.append("age", age);
    formData.append("weight", weight);
    formData.append("vaccines", finalVaccines);

    if (image) {
      // Truco para extraer el nombre del archivo y tipo
      let filename = image.split('/').pop();
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : `image`;

      formData.append("photo", { uri: image, name: filename, type });
    }

    try {
      await axios.post(`${API_URL}/pets`, formData, {
        headers: { "Content-Type": "multipart/form-data" }, // Importante para enviar archivos
      });

      Alert.alert("¡Éxito!", "Mascota guardada correctamente 🐾");
      navigation.goBack();
      
    } catch (error) {
      console.log("Error subiendo:", error.response?.data || error.message);
      Alert.alert("Error", "No se pudo guardar. Revisa los datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* 📸 SECCIÓN FOTO */}
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

        {/* 🐶 ESPECIE */}
        <Text style={[styles.label, {color: theme.colors.text}]}>Especie:</Text>
        <RadioButton.Group onValueChange={setSpeciesSelection} value={speciesSelection}>
            <View style={styles.rowWrap}>
                <View style={styles.radioOption}><RadioButton value="Perro" color="#2E8B57"/><Text style={{color: theme.colors.text}}>Perro</Text></View>
                <View style={styles.radioOption}><RadioButton value="Gato" color="#2E8B57"/><Text style={{color: theme.colors.text}}>Gato</Text></View>
                <View style={styles.radioOption}><RadioButton value="Otro" color="#2E8B57"/><Text style={{color: theme.colors.text}}>Otro</Text></View>
            </View>
        </RadioButton.Group>
        
        {/* Si selecciona "Otro", mostramos el input */}
        {speciesSelection === "Otro" && (
            <TextInput 
                label="Escribe la especie (Ej: Conejo)" 
                value={customSpecies} 
                onChangeText={setCustomSpecies} 
                mode="outlined" 
                style={styles.input} 
            />
        )}

        {/* ⚖️ DATOS FÍSICOS */}
        <View style={styles.rowInput}>
            <TextInput 
                label="Edad (Ej: 2 años)" 
                value={age} 
                onChangeText={setAge} 
                mode="outlined" 
                style={[styles.input, {flex: 1, marginRight: 5}]} 
            />
            <TextInput 
                label="Peso (Kg)" 
                value={weight} 
                onChangeText={setWeight} 
                keyboardType="numeric"
                mode="outlined" 
                style={[styles.input, {flex: 1, marginLeft: 5}]} 
            />
        </View>

        <TextInput label="Raza (Opcional)" value={breed} onChangeText={setBreed} mode="outlined" style={styles.input} />

        {/* 💉 VACUNAS */}
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
             <TextInput 
                label="Detalla vacunas..." 
                value={customVaccines} 
                onChangeText={setCustomVaccines} 
                mode="outlined" 
                style={styles.input} 
            />
        )}

        {/* ⚧ GÉNERO */}
        <Text style={[styles.label, {color: theme.colors.text}]}>Género:</Text>
        <RadioButton.Group onValueChange={setGender} value={gender}>
            <View style={styles.row}>
                <View style={styles.radioOption}><RadioButton value="Macho" color="#2E8B57"/><Text style={{color: theme.colors.text}}>Macho</Text></View>
                <View style={styles.radioOption}><RadioButton value="Hembra" color="#2E8B57"/><Text style={{color: theme.colors.text}}>Hembra</Text></View>
            </View>
        </RadioButton.Group>

        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          icon="check"
        >
          Guardar Mascota
        </Button>
        <View style={{height: 50}} /> 
      </ScrollView>
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
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 },
  rowInput: { flexDirection: 'row', justifyContent: 'space-between' },
  radioOption: { flexDirection: 'row', alignItems: 'center', marginRight: 15 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
  chip: { backgroundColor: '#fff' },
  button: { marginTop: 10, paddingVertical: 5 },
});