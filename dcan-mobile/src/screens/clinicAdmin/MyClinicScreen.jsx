import React, { useEffect, useState, useMemo } from "react";
import { View, StyleSheet, ScrollView, Alert, SafeAreaView, Platform, StatusBar } from "react-native";
import { Text, TextInput, Button, Card, ActivityIndicator, Title, Paragraph, Avatar } from "react-native-paper";
import axios from "axios";
import * as Location from 'expo-location'; // 📍 IMPORTANTE: GPS
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { API_URL } from "../../config/api";

export default function MyClinicScreen() {
  const { user, token } = useAuth();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [gettingLoc, setGettingLoc] = useState(false); // Cargando GPS
  
  // Formulario
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("");
  const [desc, setDesc] = useState("");

  // 📍 Coordenadas
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  }), [token]);

  useEffect(() => {
    if (user?.clinic_id) {
      fetchClinicData();
    }
  }, [user]);

  const fetchClinicData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/clinics/${user.clinic_id}`, { headers });
      const data = res.data;
      
      setName(data.name || "");
      setPhone(data.phone || "");
      setAddress(data.address || "");
      setHours(data.hours || "");
      setDesc(data.description || "");
      // Cargar coordenadas si existen
      setLatitude(data.latitude ? String(data.latitude) : "");
      setLongitude(data.longitude ? String(data.longitude) : "");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "No se pudo cargar la información.");
    } finally {
      setLoading(false);
    }
  };

  // 📍 FUNCIÓN GPS
  const getCurrentLocation = async () => {
    setGettingLoc(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permiso denegado", "Necesitamos acceso a tu ubicación para que los clientes te encuentren.");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLatitude(String(location.coords.latitude));
      setLongitude(String(location.coords.longitude));
      Alert.alert("¡Ubicación Detectada!", "Ahora guarda los cambios para confirmar.");
    } catch (error) {
      Alert.alert("Error", "No pudimos obtener tu ubicación. Verifica tu GPS.");
    } finally {
      setGettingLoc(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/clinics/${user.clinic_id}`, {
        name,
        phone,
        address,
        hours,
        description: desc,
        // Enviamos coordenadas
        latitude: latitude || null,
        longitude: longitude || null
      }, { headers });

      Alert.alert("Éxito", "Información de la clínica actualizada.");
    } catch (error) {
      const msg = error.response?.data?.message || "Error al guardar.";
      Alert.alert("Error", msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 10 }}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{padding: 20}}>
        
        <View style={{alignItems:'center', marginBottom: 20}}>
            <Avatar.Icon size={70} icon="store-marker" style={{backgroundColor: theme.colors.primary}} />
            <Title style={{marginTop: 10, fontWeight: 'bold', fontSize: 24}}>Mi Veterinaria</Title>
            <Paragraph>Información Pública y Ubicación</Paragraph>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={{marginBottom: 15, fontSize:18}}>Datos Generales</Title>
            
            <TextInput label="Nombre Comercial" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
            <TextInput label="Teléfono Público" value={phone} onChangeText={setPhone} mode="outlined" keyboardType="phone-pad" style={styles.input} />
            <TextInput label="Dirección (Texto)" value={address} onChangeText={setAddress} mode="outlined" style={styles.input} />
            <TextInput label="Horarios (Ej: Lun-Vie 9-18)" value={hours} onChangeText={setHours} mode="outlined" style={styles.input} />
            <TextInput label="Descripción" value={desc} onChangeText={setDesc} mode="outlined" multiline numberOfLines={3} style={styles.input} />

            {/* SECCIÓN GPS */}
            <Title style={{marginBottom: 10, marginTop: 10, fontSize:18}}>Ubicación GPS</Title>
            <Paragraph style={{marginBottom: 10, fontSize:12, color:'#666'}}>
                Presiona el botón estando en tu local para guardar la ubicación exacta.
            </Paragraph>

            <View style={{flexDirection:'row', gap:10}}>
                <TextInput label="Latitud" value={latitude} onChangeText={setLatitude} mode="outlined" style={[styles.input, {flex:1}]} keyboardType="numeric" />
                <TextInput label="Longitud" value={longitude} onChangeText={setLongitude} mode="outlined" style={[styles.input, {flex:1}]} keyboardType="numeric" />
            </View>

            <Button 
                mode="outlined" 
                icon="crosshairs-gps" 
                onPress={getCurrentLocation} 
                loading={gettingLoc}
                style={{marginBottom: 20, borderColor: theme.colors.primary}}
            >
                Usar mi ubicación actual
            </Button>

            <Button 
              mode="contained" 
              icon="content-save" 
              onPress={handleUpdate} 
              loading={saving}
              disabled={saving}
              style={{ marginTop: 10, borderRadius: 12 }}
              contentStyle={{height: 50}}
            >
              Guardar Cambios
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
  input: { marginBottom: 12, backgroundColor: "white" },
});