import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, FlatList, Image, Text, StatusBar } from "react-native";
import { Card, Title, Paragraph, TextInput, Chip, Button, Modal, Portal, List, ActivityIndicator, IconButton, Avatar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { API_URL } from "../../config/api";
import { Ionicons } from '@expo/vector-icons';

// 🇪🇨 DATOS DE ECUADOR (Provincias y Cantones)
const ECUADOR_DATA = {
  "Azuay": ["Cuenca", "Gualaceo", "Paute", "Santa Isabel", "Camilo Ponce Enríquez"],
  "Bolívar": ["Guaranda", "Chillanes", "Chimbo", "Echeandía", "San Miguel"],
  "Cañar": ["Azogues", "Biblián", "Cañar", "La Troncal"],
  "Carchi": ["Tulcán", "Bolívar", "Espejo", "Mira", "Montúfar"],
  "Chimborazo": ["Riobamba", "Alausí", "Chambo", "Guano", "Colta"],
  "Cotopaxi": ["Latacunga", "La Maná", "Pujilí", "Salcedo", "Saquisilí"],
  "El Oro": ["Machala", "Pasaje", "Santa Rosa", "Zaruma", "Huaquillas", "Arenillas"],
  "Esmeraldas": ["Esmeraldas", "Atacames", "Quinindé", "San Lorenzo", "Muisne"],
  "Galápagos": ["San Cristóbal", "Santa Cruz", "Isabela"],
  "Guayas": ["Guayaquil", "Samborondón", "Durán", "Daule", "Milagro", "Salitre", "Playas"],
  "Imbabura": ["Ibarra", "Otavalo", "Cotacachi", "Antonio Ante", "Pimampiro"],
  "Loja": ["Loja", "Catamayo", "Saraguro", "Macará", "Paltas"],
  "Los Ríos": ["Babahoyo", "Quevedo", "Ventanas", "Vinces", "Buena Fe"],
  "Manabí": ["Portoviejo", "Manta", "Chone", "Montecristi", "Jipijapa", "Pedernales", "El Carmen"],
  "Morona Santiago": ["Macas", "Gualaquiza", "Sucúa", "Palora"],
  "Napo": ["Tena", "Archidona", "El Chaco", "Quijos"],
  "Orellana": ["Francisco de Orellana", "La Joya de los Sachas", "Loreto"],
  "Pastaza": ["Puyo", "Mera", "Santa Clara"],
  "Pichincha": ["Quito", "Cayambe", "Mejía", "Pedro Moncayo", "Rumiñahui", "San Miguel de los Bancos"],
  "Santa Elena": ["Santa Elena", "La Libertad", "Salinas"],
  "Santo Domingo": ["Santo Domingo", "La Concordia"],
  "Sucumbíos": ["Nueva Loja", "Shushufindi", "Gonzalo Pizarro"],
  "Tungurahua": ["Ambato", "Baños", "Pelileo", "Píllaro"],
  "Zamora Chinchipe": ["Zamora", "Yantzaza", "El Pangui"]
};

function uniqueSorted(arr) {
  return Array.from(new Set(arr.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export default function ClinicsDirectory() {
  const { user } = useAuth();
  const navigation = useNavigation();

  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filtros
  const [search, setSearch] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("Todas");
  const [selectedCanton, setSelectedCanton] = useState("Todos");
  
  // Modales
  const [provinceModal, setProvinceModal] = useState(false);
  const [cantonModal, setCantonModal] = useState(false);

  const fetchClinics = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/clinics`);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setClinics(list);
    } catch (e) {
      setClinics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  // Listas para los modales
  const provincesList = useMemo(() => ["Todas", ...Object.keys(ECUADOR_DATA).sort()], []);
  
  const cantonsList = useMemo(() => {
    if (selectedProvince === "Todas") return ["Todos"];
    return ["Todos", ...(ECUADOR_DATA[selectedProvince] || []).sort()];
  }, [selectedProvince]);

  // Filtrado
  const filteredClinics = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clinics.filter((c) => {
      const clinicProv = c.province || "";
      const clinicCant = c.canton || "";
      
      const matchesProvince = selectedProvince === "Todas" || clinicProv.includes(selectedProvince);
      const matchesCanton = selectedCanton === "Todos" || clinicCant.includes(selectedCanton);
      
      const matchesSearch = q === "" || 
        `${c.name} ${c.address} ${clinicProv} ${clinicCant}`.toLowerCase().includes(q);
      
      return matchesProvince && matchesCanton && matchesSearch;
    });
  }, [clinics, search, selectedProvince, selectedCanton]);

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.iconContainer}>
            {item.photo_url ? (
                <Avatar.Image size={65} source={{uri: item.photo_url}} />
            ) : (
                <Avatar.Icon size={65} icon="hospital-marker" style={{backgroundColor: '#E8F5E9'}} color="#2E8B57" />
            )}
        </View>

        <View style={styles.infoContainer}>
            <Title style={styles.cardTitle} numberOfLines={2}>{item.name}</Title>
            <View style={styles.badgeRow}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.province}</Text>
                </View>
                <View style={[styles.badge, {backgroundColor: '#E3F2FD'}]}>
                    <Text style={[styles.badgeText, {color: '#1565C0'}]}>{item.canton}</Text>
                </View>
            </View>
            <Paragraph numberOfLines={1} style={styles.address}>
                <Ionicons name="location-sharp" size={14} color="#666"/> {item.address || "Sin dirección"}
            </Paragraph>
        </View>
      </View>

      <Card.Actions style={styles.cardActions}>
        {/* BOTÓN VER INFO: Público */}
        <Button 
            mode="outlined" 
            textColor="#2E8B57"
            style={{flex: 1, borderColor: '#2E8B57', marginRight: 5}}
            onPress={() => navigation.navigate("ClinicDetails", { clinic: item })}
        >
            Ver Info
        </Button>

        {/* BOTÓN AGENDAR: Privado o Login */}
        <Button 
            mode="contained" 
            buttonColor="#2E8B57"
            style={{flex: 1, marginLeft: 5}}
            onPress={() => {
                if (!user) {
                    // Si NO hay usuario, vamos al Login con la clínica seleccionada
                    navigation.navigate("Login", { selectedClinic: item });
                } else {
                    // Si SÍ hay usuario, vamos directo al Dashboard
                    navigation.navigate("ClientDashboard", { screen: "Citas", params: { screen: "Agendar" } });
                }
            }}
        >
            Agendar
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#2E8B57" />
      
      {/* HEADER VERDE */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
             <Image source={require("../../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
             <View style={styles.headerTitles}>
                 <Text style={styles.appName}>D'CAN Ecuador</Text>
                 <Text style={styles.appSlogan}>Encuentra tu veterinaria ideal</Text>
             </View>
        </View>

        {/* BUSCADOR */}
        <View style={styles.searchContainer}>
            <TextInput
                mode="outlined"
                placeholder="Buscar veterinaria..."
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
                theme={{ roundness: 12 }}
                left={<TextInput.Icon icon="magnify" color="#2E8B57" />}
            />
        </View>
      </View>

      <View style={styles.bodyContainer}>
        {/* FILTROS */}
        <View style={styles.filtersContainer}>
            <Chip 
                mode="outlined" 
                icon="map"
                onPress={() => setProvinceModal(true)} 
                style={styles.chip}
                textStyle={{color: selectedProvince !== "Todas" ? "#2E8B57" : "#555"}}
            >
                {selectedProvince === "Todas" ? "Provincia" : selectedProvince}
            </Chip>
            
            <Chip 
                mode="outlined" 
                icon="city"
                onPress={() => setCantonModal(true)} 
                style={styles.chip}
                textStyle={{color: selectedCanton !== "Todos" ? "#2E8B57" : "#555"}}
            >
                {selectedCanton === "Todos" ? "Cantón" : selectedCanton}
            </Chip>

            {(selectedProvince !== "Todas" || selectedCanton !== "Todos" || search !== "") && (
                <IconButton 
                    icon="filter-off" 
                    size={20} 
                    iconColor="red"
                    onPress={() => {
                        setSelectedProvince("Todas");
                        setSelectedCanton("Todos");
                        setSearch("");
                    }} 
                />
            )}
        </View>

        {/* LISTA DE CLÍNICAS */}
        {loading ? (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2E8B57" />
                <Text style={{marginTop: 10, color: '#666'}}>Cargando veterinarias...</Text>
            </View>
        ) : (
            <FlatList
                data={filteredClinics}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="paw" size={60} color="#ddd" />
                        <Text style={{color: '#888', marginTop: 10, textAlign: 'center'}}>
                            No encontramos veterinarias en esta zona.{'\n'}Intenta con otra provincia.
                        </Text>
                    </View>
                }
            />
        )}
      </View>

      {/* MODAL PROVINCIA */}
      <Portal>
        <Modal visible={provinceModal} onDismiss={() => setProvinceModal(false)} contentContainerStyle={styles.modalContent}>
            <Title style={styles.modalTitle}>Selecciona Provincia</Title>
            <FlatList 
                data={provincesList} 
                keyExtractor={i => i} 
                initialNumToRender={10}
                renderItem={({item}) => (
                <List.Item 
                    title={item} 
                    onPress={() => {setSelectedProvince(item); setSelectedCanton("Todos"); setProvinceModal(false)}} 
                    left={props => <List.Icon {...props} icon={selectedProvince===item ? "check-circle" : "map-marker-outline"} color={selectedProvince===item ? "#2E8B57" : "#888"}/>} 
                />
            )} />
        </Modal>

        {/* MODAL CANTÓN */}
        <Modal visible={cantonModal} onDismiss={() => setCantonModal(false)} contentContainerStyle={styles.modalContent}>
            <Title style={styles.modalTitle}>Selecciona Cantón</Title>
            {selectedProvince === "Todas" ? (
                <Paragraph style={{textAlign:'center', padding: 20}}>Primero selecciona una provincia.</Paragraph>
            ) : (
                <FlatList 
                    data={cantonsList} 
                    keyExtractor={i => i} 
                    renderItem={({item}) => (
                    <List.Item 
                        title={item} 
                        onPress={() => {setSelectedCanton(item); setCantonModal(false)}} 
                        left={props => <List.Icon {...props} icon={selectedCanton===item ? "check-circle" : "city-variant-outline"} color={selectedCanton===item ? "#2E8B57" : "#888"}/>} 
                    />
                )} />
            )}
        </Modal>
      </Portal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#2E8B57" },
  
  // Header
  headerContainer: { backgroundColor: "#2E8B57", paddingBottom: 25, paddingTop: 15 },
  headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  logo: { width: 80, height: 80, marginRight: 15, borderRadius: 10 }, // Logo grande
  headerTitles: { flex: 1 },
  appName: { fontSize: 26, fontWeight: "bold", color: "white", letterSpacing: 0.5 },
  appSlogan: { fontSize: 14, color: "#E8F5E9", fontStyle: 'italic' },
  
  searchContainer: { paddingHorizontal: 20 },
  searchInput: { backgroundColor: "white", height: 48, fontSize: 15, elevation: 4 },

  // Body
  bodyContainer: { flex: 1, backgroundColor: "#F5F7FA", borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
  filtersContainer: { flexDirection: 'row', alignItems: 'center', padding: 15, paddingBottom: 5 },
  chip: { marginRight: 8, backgroundColor: "white", borderColor: '#E0E0E0', elevation: 2 },
  
  // Lista
  listContent: { padding: 15, paddingBottom: 50 },
  card: { marginBottom: 15, backgroundColor: "white", borderRadius: 16, elevation: 4 },
  cardRow: { flexDirection: 'row', padding: 15 },
  iconContainer: { marginRight: 15, justifyContent: 'center' },
  infoContainer: { flex: 1, justifyContent: 'center' },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 5 },
  
  badgeRow: { flexDirection: 'row', marginBottom: 8, flexWrap: 'wrap' },
  badge: { backgroundColor: '#E8F5E9', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginRight: 5, marginBottom: 2 },
  badgeText: { fontSize: 11, color: '#2E8B57', fontWeight: 'bold' },
  address: { fontSize: 13, color: "#666" },
  
  cardActions: { justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 12, paddingTop: 5 },
  
  // Utils
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', marginTop: 60, opacity: 0.7 },
  modalContent: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 15, maxHeight: '80%' },
  modalTitle: { textAlign: 'center', color: '#2E8B57', fontWeight: 'bold', marginBottom: 15 }
});