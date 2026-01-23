import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Alert, SafeAreaView, Platform, StatusBar } from "react-native";
import { Title, Card, Paragraph, Button, Avatar, Chip, Text } from "react-native-paper";
import axios from "axios";
import { API_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function AppointmentManagement() {
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${API_URL}/clinic-appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    Alert.alert("Confirmar", "¿Eliminar esta cita?", [
      { text: "Cancelar" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/appointments/${appointmentId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert("Éxito", "Cita eliminada");
            fetchAppointments();
          } catch (error) {
            Alert.alert("Error", "No se pudo eliminar la cita");
          }
        },
      },
    ]);
  };

  const renderAppointment = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
                <Avatar.Icon size={40} icon="calendar-clock" style={{backgroundColor: theme.colors.primary}} />
                <View style={{marginLeft: 10}}>
                    <Text style={{fontWeight:'bold', fontSize:16}}>{item.date}</Text>
                    <Text style={{fontSize:14, color:'#666'}}>{item.time}</Text>
                </View>
            </View>
            <Chip style={{height: 30}} textStyle={{fontSize: 10}}>{item.status}</Chip>
        </View>

        <View style={styles.infoRow}>
            <Paragraph style={styles.label}>Cliente:</Paragraph>
            <Paragraph style={styles.value}>{item.client_name}</Paragraph>
        </View>
        <View style={styles.infoRow}>
            <Paragraph style={styles.label}>Mascota:</Paragraph>
            <Paragraph style={styles.value}>{item.pet_name} ({item.service})</Paragraph>
        </View>
        <View style={styles.infoRow}>
            <Paragraph style={styles.label}>Vet:</Paragraph>
            <Paragraph style={styles.value}>{item.veterinarian_name}</Paragraph>
        </View>

        <Button 
            mode="outlined" 
            onPress={() => handleDeleteAppointment(item.id)} 
            textColor="#D32F2F" 
            style={{marginTop: 15, borderColor: '#D32F2F'}}
        >
          Eliminar Cita
        </Button>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return <View style={styles.center}><Paragraph>Cargando citas...</Paragraph></View>;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerContainer}>
         <Title style={[styles.headerTitle, { color: theme.colors.primary }]}>Gestión de Citas</Title>
         <Paragraph style={{opacity:0.6}}>Historial global de la clínica</Paragraph>
      </View>

      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAppointment}
        contentContainerStyle={{padding: 16}}
        ListEmptyComponent={<Paragraph style={{textAlign:'center', marginTop: 20}}>No hay citas registradas.</Paragraph>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 0 },
  headerContainer: { paddingHorizontal: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { marginBottom: 16, borderRadius: 16, elevation: 3, backgroundColor: 'white' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontWeight: 'bold', color: '#555' },
  value: { color: '#333' }
});