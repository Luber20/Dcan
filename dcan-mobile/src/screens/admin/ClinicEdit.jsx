import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, SafeAreaView, Platform, StatusBar } from "react-native";
import { TextInput, Button, Title, Card, Paragraph, Avatar } from "react-native-paper";
import axios from "axios";
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

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [hours, setHours] = useState("");

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
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
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
            <TextInput label="Dirección" value={address} onChangeText={setAddress} mode="outlined" style={styles.input} />
            <TextInput label="Teléfono" value={phone} onChangeText={setPhone} mode="outlined" keyboardType="phone-pad" style={styles.input} />
            <TextInput label="Horarios de Atención" value={hours} onChangeText={setHours} mode="outlined" multiline style={[styles.input, {height: 80}]} />
            
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