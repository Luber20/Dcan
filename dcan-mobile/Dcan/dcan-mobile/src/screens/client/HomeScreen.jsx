import React, { useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { Card, Title, Paragraph, Avatar, ActivityIndicator, Text } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { API_URL } from "../../config/api";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function HomeScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();

  const [pets, setPets] = useState([]);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      // 1. Cargar Mascotas reales
      const petsRes = await axios.get(`${API_URL}/pets`);
      setPets(petsRes.data);

      // 2. Cargar la próxima cita real
      const apptRes = await axios.get(`${API_URL}/appointments/next`);
      setNextAppointment(apptRes.data);
    } catch (error) {
      console.log("Error cargando home:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  // Función para formatear fecha de forma segura
  const formatApptDate = (dateStr, timeStr) => {
    try {
      // Reemplazamos guiones por barras para compatibilidad total con JS Date
      const fixedDate = dateStr.replace(/-/g, '/');
      const dateObj = new Date(`${fixedDate} ${timeStr}`);
      return {
        fullDate: format(dateObj, "eeee d 'de' MMMM", { locale: es }),
        time: format(dateObj, "hh:mm a")
      };
    } catch (e) {
      return { fullDate: dateStr, time: timeStr };
    }
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Title style={[styles.welcome, { color: "#fff" }]}>
          ¡Hola, {user?.name?.split(' ')[0] || "Usuario"}! 🐾
        </Title>
        <Paragraph style={{ color: "#E8F5E8" }}>Bienvenido a D'CAN</Paragraph>
      </View>

      {/* TARJETA PRÓXIMA CITA */}
      <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Card.Content>
          <Title style={{ color: theme.colors.primary }}>📅 Próxima cita</Title>
          {loading ? (
             <ActivityIndicator color={theme.colors.primary} />
          ) : nextAppointment ? (
            <View style={styles.apptInfo}>
                <Avatar.Icon size={40} icon="calendar-check" style={{backgroundColor: theme.colors.primary}} />
                <View style={{marginLeft: 15, flex: 1}}>
                    <Text style={{fontWeight: 'bold', fontSize: 16}}>{nextAppointment.type}</Text>
                    
                    {/* Fecha Formateada */}
                    <Text style={{color: '#666', textTransform: 'capitalize'}}>
                        {formatApptDate(nextAppointment.date, nextAppointment.time).fullDate}
                    </Text>
                    
                    {/* Hora Formateada */}
                    <Text style={{color: theme.colors.primary, fontWeight: 'bold'}}>
                        {formatApptDate(nextAppointment.date, nextAppointment.time).time}
                    </Text>
                    
                    <Text style={{fontSize: 12, marginTop: 4, color: theme.colors.subtitle}}>
                        Paciente: <Text style={{fontWeight: 'bold'}}>{nextAppointment.pet?.name}</Text>
                    </Text>
                </View>
            </View>
          ) : (
            <Paragraph style={{ color: "#888", fontStyle: 'italic', marginTop: 10 }}>
              No tienes citas próximas. ¡Agenda una hoy!
            </Paragraph>
          )}
        </Card.Content>
      </Card>

      {/* SECCIÓN MIS MASCOTAS */}
      <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Card.Content>
          <Title style={{ color: theme.colors.primary, marginBottom: 15 }}>🐶 Mis mascotas</Title>
          {loading ? (
             <ActivityIndicator color={theme.colors.primary} />
          ) : pets.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {pets.map((pet) => (
                    <View key={pet.id} style={styles.petItem}>
                        {pet.photo_url ? (
                            <Avatar.Image size={60} source={{ uri: pet.photo_url }} />
                        ) : (
                            <Avatar.Text 
                                size={60} 
                                label={pet.name.substring(0,2).toUpperCase()} 
                                style={{backgroundColor: theme.colors.primary}}
                                labelStyle={{color: '#fff'}}
                            />
                        )}
                        <Text style={{marginTop: 5, fontSize: 12, fontWeight: 'bold', color: theme.colors.text}}>{pet.name}</Text>
                    </View>
                ))}
            </ScrollView>
          ) : (
            <Text style={{textAlign: 'center', color: '#888'}}>Aún no tienes mascotas registradas.</Text>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center', elevation: 5 },
  welcome: { fontSize: 28, fontWeight: "bold" },
  card: { margin: 20, borderRadius: 20, elevation: 4 },
  apptInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  petItem: { alignItems: 'center', marginRight: 20, paddingVertical: 5 }
});