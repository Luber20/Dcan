import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, FlatList, TouchableOpacity } from "react-native";
import { Title, Card, Paragraph } from "react-native-paper";
import axios from "axios";
import { API_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

export default function ClinicsList() {
  const { user, token } = useAuth();
  const navigation = useNavigation();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const response = await axios.get(`${API_URL}/my-clinics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClinics(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const renderClinic = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('ClinicEdit', { clinicId: item.id })}>
      <Card style={styles.card}>
        <Card.Content>
          <Paragraph>Nombre: {item.name}</Paragraph>
          <Paragraph>Dirección: {item.address}</Paragraph>
          <Paragraph>Teléfono: {item.phone}</Paragraph>
          <Paragraph>Horarios: {item.hours}</Paragraph>
          <Paragraph>Activa: {item.is_active ? "Sí" : "No"}</Paragraph>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return <View style={styles.center}><Paragraph>Cargando...</Paragraph></View>;
  }

  return (
    <View style={styles.container}>
      <Title>Mis Clínicas</Title>
      <FlatList
        data={clinics}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderClinic}
        ListEmptyComponent={<Paragraph>No hay clínicas</Paragraph>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { marginBottom: 16 },
});