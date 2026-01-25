import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, SafeAreaView, Platform, StatusBar, Alert } from "react-native";
import { TextInput, Button, Title, Card, Paragraph, Avatar } from "react-native-paper";
import axios from "axios";
import * as Location from 'expo-location'; // 📍 IMPORTANTE
import { API_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";

export default function ClinicEdit() {
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { clinicId } = route.params;
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gettingLoc, setGettingLoc] = useState(false); // Estado para el botón de GPS

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [hours, setHours] = useState("");
  
  // 📍 Nuevos estados para coordenadas
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  useEffect(() => {
    fetchClinic();
  }, []);

  const fetchClinic = async () => {
    try {
      const response = await axios.get(`${API_URL}/clinics/${clinicId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      setClinic(data);
      setName(data.name || "");
      setAddress(data.address || "");
      setPhone(data.phone || "");
      setHours(data.hours || "");
      // Cargar coordenadas si existen
      setLatitude(data.latitude ? String(data.latitude) : "");
      setLongitude(data.longitude ? String(data.longitude) : "");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // 📍 FUNCIÓN: Obtener GPS
  const getCurrentLocation = async () => {
    setGettingLoc(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permiso denegado", "Activa el GPS para guardar la ubicación exacta.");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLatitude(String(location.coords.latitude));
      setLongitude(String(location.coords.longitude));
      Alert.alert("¡Listo!", "Coordenadas actualizadas con tu posición actual.");
    } catch (error) {
      Alert.alert("Error", "No pudimos obtener tu ubicación. Verifica tu GPS.");
    } finally {
      setGettingLoc(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/clinics/${clinicId}`, {
        name,
        address,
        phone,
        hours,
        // Enviamos coordenadas
        latitude: latitude || null,
        longitude: longitude || null,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Clínica actualizada");
      fetchClinic(); 
    } catch (error) {
      alert("Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><Paragraph>Cargando datos...</Paragraph></View>;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{padding: 20}}>
        
        <View style={{alignItems:'center', marginBottom: 20}}>
            <Avatar.Icon size={60} icon="hospital-marker" style={{backgroundColor: theme.colors.primary}} />
            <Title style={{marginTop: 10, fontWeight: 'bold'}}>Editar Clínica</Title>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput label="Nombre de la Clínica" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
            <TextInput label="Dirección Escrita" value={address} onChangeText={setAddress} mode="outlined" style={styles.input} />
            <TextInput label="Teléfono" value={phone} onChangeText={setPhone} mode="outlined" keyboardType="phone-pad" style={styles.input} />
            <TextInput label="Horarios de Atención" value={hours} onChangeText={setHours} mode="outlined" multiline style={[styles.input, {height: 80}]} />
            
            {/* SECCIÓN UBICACIÓN */}
            <Title style={{fontSize: 16, marginTop: 10, marginBottom: 5}}>Ubicación GPS</Title>
            <View style={{flexDirection: 'row', gap: 10}}>
                <TextInput label="Latitud" value={latitude} onChangeText={setLatitude} mode="outlined" style={[styles.input, {flex: 1}]} keyboardType="numeric" />
                <TextInput label="Longitud" value={longitude} onChangeText={setLongitude} mode="outlined" style={[styles.input, {flex: 1}]} keyboardType="numeric" />
            </View>
            
            <Button 
                mode="outlined" 
                icon="crosshairs-gps" 
                onPress={getCurrentLocation} 
                loading={gettingLoc}
                style={{marginBottom: 15, borderColor: theme.colors.primary}}
            >
                Usar mi ubicación actual
            </Button>

            <Button 
                mode="contained" 
                onPress={handleSave} 
                loading={saving} 
                style={styles.button}
                contentStyle={{height: 50}}
            >
              Guardar Cambios
            </Button>
            
            <Button 
                mode="text" 
                onPress={() => navigation.goBack()} 
                style={{marginTop: 10}}
                textColor="#666"
            >
              Cancelar
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 0 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { borderRadius: 16, elevation: 4, backgroundColor: 'white' },
  input: { marginBottom: 12, backgroundColor: 'white' },
  button: { marginTop: 10, borderRadius: 12 },
});