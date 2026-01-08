import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform } from "react-native";
import { Title, Text, Button, Avatar, Chip, ActivityIndicator, TextInput } from "react-native-paper";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from "axios";
import { API_URL } from "../../config/api";
import { useTheme } from "../../context/ThemeContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ScheduleScreen({ navigation }) {
  const { theme } = useTheme();
  const route = useRoute();
  const editData = route.params?.editData; 
  
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [pets, setPets] = useState([]);
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Estados del Formulario
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedVet, setSelectedVet] = useState(null);
  const [serviceType, setServiceType] = useState("Consulta");
  const [otherService, setOtherService] = useState(""); // 👈 Estado para el servicio personalizado
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);

  const services = ["Consulta", "Vacuna", "Estética", "Cirugía", "Otro"]; // 👈 Agregamos "Otro"
  const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00"];

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [petsRes, vetsRes] = await Promise.all([
        axios.get(`${API_URL}/pets`),
        axios.get(`${API_URL}/veterinarians`)
      ]);
      setPets(petsRes.data);
      setVets(vetsRes.data);
    } catch (error) {
      console.log("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadInitialData(); }, []));

  useEffect(() => {
    if (editData) {
      setIsFormVisible(true);
      setSelectedPet(editData.pet_id);
      setSelectedVet(editData.veterinarian_id);
      
      // Lógica para detectar si el servicio era uno de la lista o "Otro"
      if (services.includes(editData.type)) {
        setServiceType(editData.type);
      } else {
        setServiceType("Otro");
        setOtherService(editData.type);
      }

      setNotes(editData.notes || "");
      const cleanDate = editData.date.replace(/-/g, '/');
      const parsedDate = new Date(cleanDate);
      if (!isNaN(parsedDate.getTime())) setDate(parsedDate);
      if (editData.time) setSelectedTime(editData.time.substring(0, 5));
    }
  }, [editData]);

  const resetForm = () => {
    setSelectedPet(null);
    setSelectedVet(null);
    setServiceType("Consulta");
    setOtherService("");
    setNotes("");
    setDate(new Date());
    setSelectedTime(null);
    navigation.setParams({ editData: null }); 
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleSchedule = async () => {
    if (!selectedPet || !selectedTime) {
      return Alert.alert("Atención", "Por favor selecciona la mascota y la hora de la cita.");
    }
    
    // Si eligió "Otro" pero no escribió nada
    if (serviceType === "Otro" && !otherService.trim()) {
      return Alert.alert("Atención", "Por favor escribe el tipo de servicio que necesitas.");
    }

    setSubmitting(true);
    try {
      const payload = {
        pet_id: selectedPet,
        veterinarian_id: selectedVet,
        date: format(date, "yyyy-MM-dd"),
        time: selectedTime,
        type: serviceType === "Otro" ? otherService : serviceType, // 👈 Enviamos el texto personalizado si es "Otro"
        notes: notes
      };

      if (editData) {
        await axios.put(`${API_URL}/appointments/${editData.id}`, payload);
        Alert.alert("¡Éxito!", "Cita actualizada correctamente.");
      } else {
        await axios.post(`${API_URL}/appointments`, payload);
        Alert.alert("¡Éxito!", "Tu cita ha sido agendada con éxito.");
      }
      
      resetForm();
      setIsFormVisible(false);
      navigation.navigate("Mis Citas"); 
    } catch (error) {
      Alert.alert("Error", "No pudimos procesar tu cita.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isFormVisible) {
    return (
      <View style={[styles.welcomeContainer, {backgroundColor: theme.colors.background}]}>
        <View style={[styles.iconCircle, {backgroundColor: theme.colors.primary + '20'}]}>
          <Avatar.Icon size={120} icon="calendar-heart" style={{backgroundColor: 'transparent'}} color={theme.colors.primary} />
        </View>
        <Title style={[styles.welcomeTitle, {color: theme.colors.text}]}>¿Agendamos una cita?</Title>
        <Text style={styles.welcomeSubtitle}>Reserva un espacio para el cuidado de tu mascota en pocos pasos.</Text>
        <Button 
          mode="contained" 
          onPress={() => setIsFormVisible(true)}
          style={[styles.startBtn, {backgroundColor: theme.colors.primary}]}
          contentStyle={{paddingVertical: 10}}
        >
          Agendar Cita Ahora
        </Button>
      </View>
    );
  }

  if (loading) return <ActivityIndicator style={{flex:1}} color={theme.colors.primary} />;

  return (
    <ScrollView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={styles.headerRow}>
        <Title style={[styles.mainTitle, {color: theme.colors.primary}]}>
            {editData ? "Editar Cita" : "Nueva Cita 📅"}
        </Title>
        <Button onPress={() => { resetForm(); setIsFormVisible(false); }} textColor="#FF5252" mode="text">
          Cancelar
        </Button>
      </View>

      <Text style={[styles.label, {color: theme.colors.text}]}>1. ¿A quién llevas?</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {pets.map(pet => (
          <TouchableOpacity 
            key={pet.id} 
            onPress={() => setSelectedPet(pet.id)}
            style={[styles.petCard, selectedPet === pet.id && {borderColor: theme.colors.primary, borderWidth: 2, backgroundColor: '#f0fff0'}]}
          >
            {pet.photo_url ? <Avatar.Image size={60} source={{uri: pet.photo_url}} /> : <Avatar.Text size={60} label={pet.name[0].toUpperCase()} style={{backgroundColor: theme.colors.primary}} />}
            <Text style={[styles.petName, {color: theme.colors.text}]}>{pet.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={[styles.label, {color: theme.colors.text}]}>2. Servicio</Text>
      <View style={styles.chipGroup}>
        {services.map(s => (
          <Chip 
            key={s} 
            selected={serviceType === s} 
            onPress={() => setServiceType(s)} 
            style={[styles.chip, serviceType === s && {backgroundColor: theme.colors.primary}]}
            textStyle={{color: serviceType === s ? '#fff' : '#000'}}
          >
            {s}
          </Chip>
        ))}
      </View>

      {/* 👈 CAMPO DINÁMICO PARA "OTRO" */}
      {serviceType === "Otro" && (
        <TextInput
          label="¿Qué servicio necesitas?"
          value={otherService}
          onChangeText={setOtherService}
          mode="flat"
          style={styles.otherInput}
          placeholder="Ej: Desparasitación interna"
          theme={{ colors: { primary: theme.colors.primary }}}
        />
      )}

      <Text style={[styles.label, {color: theme.colors.text}]}>3. Veterinario</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        <TouchableOpacity 
          onPress={() => setSelectedVet(null)}
          style={[styles.vetCard, selectedVet === null && {backgroundColor: '#f0fff0', borderColor: theme.colors.primary, borderWidth: 2}]}
        >
          <Avatar.Icon size={45} icon="account-group" style={{backgroundColor: '#ccc'}} />
          <Text style={styles.vetName}>Cualquiera</Text>
        </TouchableOpacity>
        {vets.map(vet => (
          <TouchableOpacity 
            key={vet.id} 
            onPress={() => setSelectedVet(vet.id)}
            style={[styles.vetCard, selectedVet === vet.id && {backgroundColor: '#f0fff0', borderColor: theme.colors.primary, borderWidth: 2}]}
          >
            <Avatar.Text size={45} label={vet.name[0]} style={{backgroundColor: theme.colors.primary}} />
            <Text style={styles.vetName}>{vet.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={[styles.label, {color: theme.colors.text}]}>4. Fecha</Text>
      <Button mode="outlined" onPress={() => setShowDatePicker(true)} icon="calendar" style={styles.dateButton} textColor={theme.colors.primary}>
        {format(date, "PPPP", { locale: es })}
      </Button>

      {showDatePicker && (
        <DateTimePicker value={date} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} minimumDate={new Date()} onChange={onDateChange} />
      )}

      <Text style={[styles.label, {color: theme.colors.text}]}>5. Hora Disponible</Text>
      <View style={styles.chipGroup}>
        {timeSlots.map(t => (
          <Chip key={t} selected={selectedTime === t} onPress={() => setSelectedTime(t)} style={[styles.chip, selectedTime === t && {backgroundColor: theme.colors.primary}]} textStyle={{color: selectedTime === t ? '#fff' : '#000'}}>
            {t}
          </Chip>
        ))}
      </View>

      <TextInput label="Notas adicionales" value={notes} onChangeText={setNotes} mode="outlined" multiline numberOfLines={3} style={styles.input} theme={{ colors: { primary: theme.colors.primary }}} />

      <Button mode="contained" onPress={handleSchedule} loading={submitting} disabled={submitting} style={[styles.submitBtn, {backgroundColor: theme.colors.primary}]}>
        {editData ? "Guardar Cambios" : "Confirmar y Agendar"}
      </Button>
      <View style={{height: 50}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  welcomeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  iconCircle: { padding: 20, borderRadius: 100, marginBottom: 20 },
  welcomeTitle: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  welcomeSubtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 10, marginBottom: 40 },
  startBtn: { width: '100%', borderRadius: 15, elevation: 5 },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  mainTitle: { fontSize: 24, fontWeight: 'bold' },
  label: { fontWeight: 'bold', marginTop: 25, marginBottom: 10, fontSize: 16 },
  row: { flexDirection: 'row', marginBottom: 10, paddingVertical: 5 },
  petCard: { alignItems: 'center', marginRight: 15, padding: 12, borderRadius: 15, backgroundColor: '#fff', elevation: 3, width: 95, borderWidth: 1, borderColor: '#eee' },
  petName: { marginTop: 8, fontSize: 13, fontWeight: 'bold' },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { marginBottom: 5, borderRadius: 10 },
  otherInput: { marginTop: 10, backgroundColor: 'transparent' }, // Estilo para el input extra
  vetCard: { alignItems: 'center', marginRight: 12, padding: 12, borderRadius: 15, borderWidth: 1, borderColor: '#ddd', width: 95, backgroundColor: '#fff', elevation: 2 },
  vetName: { fontSize: 11, marginTop: 8, textAlign: 'center', fontWeight: 'bold' },
  input: { marginTop: 20, backgroundColor: '#fff' },
  submitBtn: { marginTop: 35, paddingVertical: 8, borderRadius: 15, elevation: 4 },
  dateButton: { borderRadius: 12, paddingVertical: 5, borderWidth: 1.5 }
});