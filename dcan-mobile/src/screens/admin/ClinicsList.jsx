import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Platform, StatusBar } from "react-native";
import { Title, Card, Paragraph, Chip } from "react-native-paper";
import axios from "axios";
import { API_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";

export default function ClinicsList() {
  const { user, token } = useAuth();
  const { theme } = useTheme();
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
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start'}}>
              <View style={{flex: 1}}>
                  <Title style={{fontWeight:'bold'}}>{item.name}</Title>
                  <Paragraph style={{color:'#666'}}>{item.address}</Paragraph>
              </View>
              <Chip icon={item.is_active ? "check" : "close"} style={{backgroundColor: item.is_active ? '#e8f5e9' : '#ffebee'}}>
                {item.is_active ? "Activa" : "Inactiva"}
              </Chip>
          </View>
          <View style={{marginTop: 10}}>
             <Paragraph style={{fontSize:12}}>📞 {item.phone || "Sin teléfono"}</Paragraph>
             <Paragraph style={{fontSize:12}}>🕒 {item.hours || "Sin horarios"}</Paragraph>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) return <View style={styles.center}><Paragraph>Cargando clínicas...</Paragraph></View>;

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={styles.headerContainer}>
        <Title style={[styles.headerTitle, { color: theme.colors.primary }]}>Mis Clínicas</Title>
        <Paragraph>Selecciona una para editar</Paragraph>
      </View>
      <FlatList
        data={clinics}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderClinic}
        contentContainerStyle={{padding: 16}}
        ListEmptyComponent={<Paragraph style={{textAlign:'center'}}>No hay clínicas registradas.</Paragraph>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 0 },
  headerContainer: { paddingHorizontal: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 26, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { marginBottom: 16, borderRadius: 16, elevation: 3, backgroundColor: 'white' },
});