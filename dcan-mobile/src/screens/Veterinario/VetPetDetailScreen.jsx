import React, { useEffect, useState, useMemo } from "react";
import { View, StyleSheet, ScrollView, SafeAreaView, Platform, StatusBar, Alert } from "react-native";
import { Avatar, Title, Paragraph, Card, ActivityIndicator } from "react-native-paper";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { API_URL } from "../../config/api";

export default function VetPetDetailScreen({ route, navigation }) {
  const { token } = useAuth();
  const { theme } = useTheme();
  
  // Recibimos el ID desde el Escáner
  const { petId } = route.params; 

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // ✅ CAMBIO AQUÍ: Usamos la ruta especial para veterinarios
        const res = await axios.get(`${API_URL}/vet/pets/${petId}`, { 
            headers: { Authorization: `Bearer ${token}` } 
        });
        setPet(res.data);
      } catch (error) {
        Alert.alert("Error", "No se encontró información de la mascota.");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [petId]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary}/></View>;
  if (!pet) return null;

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* Encabezado con Foto */}
        <View style={{alignItems: 'center', marginBottom: 20}}>
            {pet.photo_url ? (
                <Avatar.Image size={120} source={{uri: pet.photo_url}} />
            ) : (
                <Avatar.Icon size={120} icon="paw" style={{backgroundColor: theme.colors.primary}} color="white" />
            )}
            <Title style={{fontSize: 28, marginTop: 10, fontWeight: 'bold'}}>{pet.name}</Title>
            <Paragraph style={{fontSize: 16}}>{pet.species} - {pet.breed}</Paragraph>
        </View>

        {/* Datos Clínicos */}
        <Card style={styles.card}>
            <Card.Title title="Datos Clínicos" left={(props) => <Avatar.Icon {...props} icon="medical-bag" style={{backgroundColor: '#E0F2F1'}} color="#009688"/>} />
            <Card.Content>
                <Paragraph style={{fontSize:16, marginBottom:5}}>⚖️ Peso: <Title>{pet.weight} kg</Title></Paragraph>
                <Paragraph style={{fontSize:16, marginBottom:5}}>🎂 Edad: {pet.age}</Paragraph>
                <Paragraph style={{fontSize:16, marginBottom:5}}>⚧ Sexo: {pet.gender}</Paragraph>
                <Paragraph style={{fontSize:16, marginBottom:5}}>💉 Vacunas: {pet.vaccines}</Paragraph>
            </Card.Content>
        </Card>

        {/* Datos del Dueño */}
        <Card style={styles.card}>
            <Card.Title title="Propietario" left={(props) => <Avatar.Icon {...props} icon="account" style={{backgroundColor: '#E3F2FD'}} color="#2196F3"/>} />
            <Card.Content>
                {pet.user ? (
                    <>
                        <Title>{pet.user.name}</Title>
                        <Paragraph>📧 {pet.user.email}</Paragraph>
                        <Paragraph>📞 {pet.user.phone || "Sin teléfono"}</Paragraph>
                    </>
                ) : (
                    <Paragraph>No hay información del dueño.</Paragraph>
                )}
            </Card.Content>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { marginBottom: 15, borderRadius: 15, elevation: 3, backgroundColor: 'white' }
});