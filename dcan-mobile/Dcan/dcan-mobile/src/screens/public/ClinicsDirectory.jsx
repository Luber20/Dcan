import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  Text,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  TextInput,
  Chip,
  Button,
  Modal,
  Portal,
  List,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

// ⚠️ NOTA: Estos IDs (1, 2, 3...) deben coincidir con los de tu base de datos Laravel
// Si haces 'php artisan migrate:refresh --seed', coincidirán perfectamente.
const CLINICS = [
  { id: "1", name: "Austrovet Cuenca", province: "Azuay", canton: "Cuenca", address: "Huayna-Cápac y Av. Loja", phone: "07-2246815" },
  { id: "2", name: "Instavet Guayaquil", province: "Guayas", canton: "Guayaquil", address: "Av. Francisco de Orellana", phone: "04-6002132" },
  { id: "3", name: "Happy Pet Quito", province: "Pichincha", canton: "Quito", address: "Av. Amazonas", phone: "02-1234567" },
  { id: "4", name: "AvicMartin Guayaquil", province: "Guayas", canton: "Guayaquil", address: "Km 13 vía Daule", phone: "04-1234567" },
  { id: "5", name: "Veterinaria Norte Quito", province: "Pichincha", canton: "Quito", address: "Carapungo", phone: "02-9876543" },
  { id: "6", name: "D’Can Vet Manta", province: "Manabí", canton: "Manta", address: "Av. Malecón", phone: "05-1234567" },
  { id: "7", name: "Rintintin Machala", province: "El Oro", canton: "Machala", address: "Centro", phone: "07-9876543" },
  { id: "8", name: "Veterinaria Azogues", province: "Cañar", canton: "Azogues", address: "Av. 24 de Mayo", phone: "07-2246815" },
  { id: "9", name: "Clínica Loja", province: "Loja", canton: "Loja", address: "Centro histórico", phone: "07-5678901" },
  { id: "10", name: "My Pet Quito", province: "Pichincha", canton: "Quito", address: "Valle de los Chillos", phone: "02-3456789" },
];

function uniqueSorted(arr) {
  return Array.from(new Set(arr)).sort((a, b) => a.localeCompare(b));
}

export default function ClinicsDirectory() {
  const { user } = useAuth();
  const navigation = useNavigation();

  const [search, setSearch] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("Todas");
  const [selectedCanton, setSelectedCanton] = useState("Todos");
  const [provinceModal, setProvinceModal] = useState(false);
  const [cantonModal, setCantonModal] = useState(false);

  const provinces = useMemo(() => ["Todas", ...uniqueSorted(CLINICS.map((c) => c.province))], []);

  const cantons = useMemo(() => {
    const list = selectedProvince === "Todas"
      ? CLINICS.map((c) => c.canton)
      : CLINICS.filter((c) => c.province === selectedProvince).map((c) => c.canton);
    return ["Todos", ...uniqueSorted(list)];
  }, [selectedProvince]);

  const filteredClinics = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CLINICS.filter((c) => {
      const matchesProvince = selectedProvince === "Todas" || c.province === selectedProvince;
      const matchesCanton = selectedCanton === "Todos" || c.canton === selectedCanton;
      const matchesSearch = q === "" || `${c.name} ${c.address} ${c.province} ${c.canton}`.toLowerCase().includes(q);
      return matchesProvince && matchesCanton && matchesSearch;
    });
  }, [search, selectedProvince, selectedCanton]);

  const handleSelectClinic = (clinic) => {
    // Si no hay usuario logueado, vamos al Login pasando la clínica elegida
    if (!user) {
      navigation.navigate("Login", { selectedClinic: clinic });
    } else {
      // Si ya está logueado, aquí podrías llevarlo a "Agendar Cita" directamente
      alert(`Clínica seleccionada: ${clinic.name}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={require("../../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
          <Title style={styles.title}>D’CAN Ecuador</Title>
          <Paragraph style={styles.subtitle}>Encuentra tu veterinaria de confianza</Paragraph>

          <TextInput
            mode="outlined"
            placeholder="Buscar por nombre o dirección..."
            value={search}
            onChangeText={setSearch}
            style={styles.search}
            theme={{ roundness: 15, colors: { primary: "#2E8B57" } }}
            left={<TextInput.Icon icon="magnify" color="#2E8B57" />}
          />

          <View style={styles.filters}>
            <Chip
              mode="outlined"
              selected={selectedProvince !== "Todas"}
              onPress={() => setProvinceModal(true)}
              style={styles.chip}
              textStyle={styles.chipText}
            >
              {selectedProvince === "Todas" ? "Provincia" : selectedProvince}
            </Chip>
            <Chip
              mode="outlined"
              selected={selectedCanton !== "Todos"}
              onPress={() => setCantonModal(true)}
              style={styles.chip}
              textStyle={styles.chipText}
            >
              {selectedCanton === "Todos" ? "Cantón" : selectedCanton}
            </Chip>
            {(selectedProvince !== "Todas" || selectedCanton !== "Todos" || search !== "") && (
              <Chip
                icon="close"
                onPress={() => {
                  setSelectedProvince("Todas");
                  setSelectedCanton("Todos");
                  setSearch("");
                }}
                style={styles.clearChip}
                textStyle={styles.clearChipText}
              >
                Limpiar
              </Chip>
            )}
          </View>
        </View>

        <FlatList
          data={filteredClinics}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>{item.name}</Title>
                <Paragraph style={styles.cardMeta}>{item.province} - {item.canton}</Paragraph>
                <Paragraph style={styles.cardAddress}>{item.address}</Paragraph>
                <Paragraph style={styles.cardPhone}>
                  <Text style={{ fontWeight: "bold", color: "#2E8B57" }}>Tel:</Text> {item.phone}
                </Paragraph>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => handleSelectClinic(item)}>Ver clínica</Button>
                <Button mode="contained" onPress={() => handleSelectClinic(item)} buttonColor="#2E8B57">
                  Agendar cita
                </Button>
              </Card.Actions>
            </Card>
          )}
        />

        <Portal>
          <Modal visible={provinceModal} onDismiss={() => setProvinceModal(false)} contentContainerStyle={styles.modal}>
            <Title style={styles.modalTitle}>Selecciona Provincia</Title>
            <FlatList
              data={provinces}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <List.Item
                  title={item}
                  onPress={() => {
                    setSelectedProvince(item);
                    setSelectedCanton("Todos");
                    setProvinceModal(false);
                  }}
                  left={() => item === selectedProvince ? <List.Icon icon="check" color="#2E8B57" /> : null}
                />
              )}
            />
          </Modal>

          <Modal visible={cantonModal} onDismiss={() => setCantonModal(false)} contentContainerStyle={styles.modal}>
            <Title style={styles.modalTitle}>Selecciona Cantón</Title>
            <FlatList
              data={cantons}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <List.Item
                  title={item}
                  onPress={() => {
                    setSelectedCanton(item);
                    setCantonModal(false);
                  }}
                  left={() => item === selectedCanton ? <List.Icon icon="check" color="#2E8B57" /> : null}
                />
              )}
            />
          </Modal>
        </Portal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#E8F5E8" },
  container: { flex: 1 },
  header: { padding: 15, alignItems: "center", backgroundColor: "#fff", paddingTop: 10 },
  logo: { width: 100, height: 100, marginBottom: 10 },
  title: { fontSize: 32, fontWeight: "bold", color: "#2E8B57" },
  subtitle: { fontSize: 16, color: "#666", textAlign: "center", marginBottom: 20 },
  search: { width: "100%", marginBottom: 10 },
  filters: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  chip: { backgroundColor: "#fff", borderColor: "#2E8B57" },
  chipText: { color: "#2E8B57" },
  clearChip: { backgroundColor: "#2E8B57" },
  clearChipText: { color: "#fff" },
  list: { padding: 10 },
  card: { marginVertical: 8, borderRadius: 12, elevation: 4, backgroundColor: "#fff" },
  cardTitle: { fontSize: 18, color: "#2E8B57", fontWeight: "bold" },
  cardMeta: { fontSize: 13, color: "#666" },
  cardAddress: { fontSize: 13, color: "#444" },
  cardPhone: { fontSize: 13, color: "#2E8B57", fontWeight: "bold" },
  modal: { backgroundColor: "#fff", margin: 20, borderRadius: 15, maxHeight: "80%" },
  modalTitle: { fontSize: 18, textAlign: "center", padding: 15, color: "#2E8B57", fontWeight: "bold" },
});