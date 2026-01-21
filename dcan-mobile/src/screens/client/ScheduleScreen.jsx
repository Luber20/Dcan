import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform, Linking } from "react-native"; 
import { Title, Text, Button, Avatar, Chip, ActivityIndicator, TextInput } from "react-native-paper";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from "axios";
import { API_URL } from "../../config/api";
import { useTheme } from "../../context/ThemeContext";
import { format, isSameDay, addDays } from "date-fns";
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
  const [otherService, setOtherService] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  
  const [availableSlots, setAvailableSlots] = useState([]);

  const services = ["Consulta", "Vacuna", "Estética", "Cirugía", "Otro"];

  // 🛠 LÓGICA: GENERACIÓN DINÁMICA DESDE EL BACKEND
  const generateTimeSlots = useCallback(async () => {
    if (!selectedVet) {
      setAvailableSlots([]);
      return;
    }

    try {
      const formattedDate = format(date, "yyyy-MM-dd");

      // 1. Obtener disponibilidad configurada del veterinario
      const configRes = await axios.get(`${API_URL}/veterinarians/${selectedVet}/availability`);
      const config = configRes.data; 

      // 2. Determinar el día de la semana (Normalizado)
      const nombreDiaRaw = format(date, "EEEE", { locale: es });
      const nombreDia = nombreDiaRaw.charAt(0).toUpperCase() + nombreDiaRaw.slice(1)
                        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      const diaConfig = config[nombreDia];

      if (!diaConfig || !diaConfig.is_active) {
        setAvailableSlots([]);
        return;
      }

      // 3. Obtener citas ocupadas
      const appointmentsRes = await axios.get(`${API_URL}/appointments`, {
        params: { date: formattedDate, veterinarian_id: selectedVet }
      });
      const occupiedTimes = appointmentsRes.data.map(app => app.time.substring(0, 5));

      // 4. Generar rangos basados en la DB
      let slots = [];
      let current = diaConfig.start_time.substring(0, 5); 
      const end = diaConfig.end_time.substring(0, 5);     
      const lunchS = diaConfig.lunch_start.substring(0, 5);
      const lunchE = diaConfig.lunch_end.substring(0, 5);

      const ahora = new Date();

      while (current < end) {
        const isLunch = current >= lunchS && current < lunchE;
        const isOccupied = occupiedTimes.includes(current);
        
        // Filtro de tiempo real + 2 horas de anticipación
        let isPast = false;
        if (isSameDay(date, ahora)) {
          // Calculamos la hora de la cita en objeto Date para comparar
          const [h, m] = current.split(':').map(Number);
          const horaCita = new Date(date);
          horaCita.setHours(h, m, 0, 0);
          
          // Bloquea si la cita es en menos de 2 horas desde ahora
          const margenAnticipacion = 2 * 60 * 60 * 1000; // 2 horas en ms
          if (horaCita.getTime() - ahora.getTime() < margenAnticipacion) {
            isPast = true;
          }
        }

        if (!isLunch && !isOccupied && !isPast) {
          let [h, m] = current.split(':').map(Number);
          let mEnd = m + 30;
          let hEnd = h;
          if (mEnd === 60) { hEnd++; mEnd = 0; }
          const nextTime = `${hEnd.toString().padStart(2, '0')}:${mEnd.toString().padStart(2, '0')}`;

          slots.push({
            label: `${current} - ${nextTime}`,
            value: current
          });
        }

        let [h, m] = current.split(':').map(Number);
        m += 30;
        if (m === 60) { h++; m = 0; }
        current = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      }

      setAvailableSlots(slots);
    } catch (error) {
      console.log("Error cargando disponibilidad dinámica:", error);
      setAvailableSlots([]);
    }
  }, [selectedVet, date]);

  useEffect(() => {
    generateTimeSlots();
  }, [selectedVet, date, generateTimeSlots]);

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
      console.log("Error inicial:", error);
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
      if (services.includes(editData.type)) setServiceType(editData.type);
      else { setServiceType("Otro"); setOtherService(editData.type); }
      setNotes(editData.notes || "");
      const cleanDate = editData.date.replace(/-/g, '/');
      const parsedDate = new Date(cleanDate);
      if (!isNaN(parsedDate.getTime())) setDate(parsedDate);
      if (editData.time) setSelectedTime(editData.time.substring(0, 5));
    }
  }, [editData]);

  const resetForm = () => {
    setSelectedPet(null); setSelectedVet(null); setServiceType("Consulta");
    setOtherService(""); setNotes(""); setDate(new Date()); setSelectedTime(null);
    navigation.setParams({ editData: null }); 
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      setSelectedTime(null); 
    }
  };

  const handleSchedule = async () => {
    if (!selectedPet || !selectedTime || !selectedVet) {
      return Alert.alert("Atención", "Por favor selecciona mascota, veterinario y horario.");
    }
    
    setSubmitting(true);
    try {
      const payload = {
        pet_id: selectedPet,
        veterinarian_id: selectedVet,
        date: format(date, "yyyy-MM-dd"),
        time: selectedTime,
        type: serviceType === "Otro" ? otherService : serviceType,
        notes: notes
      };

      if (editData) {
        await axios.put(`${API_URL}/appointments/${editData.id}`, payload);
        Alert.alert("¡Éxito!", "Cita actualizada.");
      } else {
        await axios.post(`${API_URL}/appointments`, payload);
        Alert.alert("¡Éxito!", "Cita agendada correctamente.");
      }
      resetForm(); setIsFormVisible(false); navigation.navigate("Mis Citas");
    } catch (error) {
      Alert.alert("Error", "No pudimos procesar la cita.");
    } finally { setSubmitting(false); }
  };

  // Límite de 30 días para el calendario
  const maxDate = addDays(new Date(), 30);

  if (!isFormVisible) {
    return (
      <View style={[styles.welcomeContainer, {backgroundColor: theme.colors.background}]}>
        <View style={[styles.iconCircle, {backgroundColor: theme.colors.primary + '20'}]}>
          <Avatar.Icon size={120} icon="calendar-heart" style={{backgroundColor: 'transparent'}} color={theme.colors.primary} />
        </View>
        <Title style={[styles.welcomeTitle, {color: theme.colors.text}]}>¿Agendamos una cita?</Title>
        <Text style={styles.welcomeSubtitle}>Reserva un espacio para el cuidado de tu mascota en pocos pasos.</Text>
        <Button mode="contained" onPress={() => setIsFormVisible(true)} style={[styles.startBtn, {backgroundColor: theme.colors.primary}]}>
          Agendar Cita Ahora
        </Button>
      </View>
    );
  }

  if (loading) return <ActivityIndicator style={{flex:1}} color={theme.colors.primary} />;

  return (
    <ScrollView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={styles.headerRow}>
        <Title style={[styles.mainTitle, {color: theme.colors.primary}]}>{editData ? "Editar Cita" : "Nueva Cita 📅"}</Title>
        <Button onPress={() => { resetForm(); setIsFormVisible(false); }} textColor="#FF5252">Cancelar</Button>
      </View>

      <Text style={[styles.label, {color: theme.colors.text}]}>1. ¿A quién llevas?</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {pets.map(pet => (
          <TouchableOpacity key={pet.id} onPress={() => setSelectedPet(pet.id)} style={[styles.petCard, selectedPet === pet.id && {borderColor: theme.colors.primary, borderWidth: 2, backgroundColor: '#f0fff0'}]}>
            {pet.photo_url ? <Avatar.Image size={60} source={{uri: pet.photo_url}} /> : <Avatar.Text size={60} label={pet.name[0].toUpperCase()} style={{backgroundColor: theme.colors.primary}} />}
            <Text style={[styles.petName, {color: theme.colors.text}]}>{pet.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={[styles.label, {color: theme.colors.text}]}>2. Servicio</Text>
      <View style={styles.chipGroup}>
        {services.map(s => (
          <Chip key={s} selected={serviceType === s} onPress={() => setServiceType(s)} style={[styles.chip, serviceType === s && {backgroundColor: theme.colors.primary}]} textStyle={{color: serviceType === s ? '#fff' : '#000'}}>{s}</Chip>
        ))}
      </View>

      <Text style={[styles.label, {color: theme.colors.text}]}>3. Veterinario</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {vets.map(vet => (
          <TouchableOpacity key={vet.id} onPress={() => setSelectedVet(vet.id)} style={[styles.vetCard, selectedVet === vet.id && {backgroundColor: '#f0fff0', borderColor: theme.colors.primary, borderWidth: 2}]}>
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
        <DateTimePicker 
          value={date} 
          mode="date" 
          display="default" 
          minimumDate={new Date()} 
          maximumDate={maxDate} 
          onChange={onDateChange} 
        />
      )}

      <Text style={[styles.label, {color: theme.colors.text}]}>5. Horario Disponible</Text>
      {!selectedVet ? (
        <Text style={{color: '#666', fontStyle: 'italic', marginBottom: 10}}>Selecciona un veterinario para ver disponibilidad</Text>
      ) : (
        <View style={styles.chipGroup}>
          {availableSlots.length > 0 ? (
            availableSlots.map(slot => (
              <Chip 
                key={slot.value} 
                selected={selectedTime === slot.value} 
                onPress={() => setSelectedTime(slot.value)} 
                style={[styles.chip, selectedTime === slot.value && {backgroundColor: theme.colors.primary}]} 
                textStyle={{color: selectedTime === slot.value ? '#fff' : '#000'}}
              >
                {slot.label}
              </Chip>
            ))
          ) : (
            <Text style={{color: 'red', marginBottom: 10}}>No hay horarios disponibles o es muy pronto para agendar hoy.</Text>
          )}
        </View>
      )}

      {serviceType === "Otro" && (
        <TextInput label="Especifique el servicio" value={otherService} onChangeText={setOtherService} mode="outlined" style={styles.input} />
      )}

      <TextInput label="Notas adicionales" value={notes} onChangeText={setNotes} mode="outlined" multiline numberOfLines={3} style={styles.input} />

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
  vetCard: { alignItems: 'center', marginRight: 12, padding: 12, borderRadius: 15, borderWidth: 1, borderColor: '#ddd', width: 95, backgroundColor: '#fff', elevation: 2 },
  vetName: { fontSize: 11, marginTop: 8, textAlign: 'center', fontWeight: 'bold' },
  input: { marginTop: 20, backgroundColor: '#fff' },
  submitBtn: { marginTop: 35, paddingVertical: 8, borderRadius: 15, elevation: 4 },
  dateButton: { borderRadius: 12, paddingVertical: 5, borderWidth: 1.5 }
});