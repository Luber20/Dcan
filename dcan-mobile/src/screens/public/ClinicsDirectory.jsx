import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, FlatList, Image, Text } from "react-native";
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
import axios from "axios";
import { API_URL } from "../../config/api";

function uniqueSorted(arr) {
  return Array.from(new Set(arr.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export default function ClinicsDirectory() {
  const { user } = useAuth();
  const navigation = useNavigation();

  // ✅ clínicas reales desde API
  //consumimos cosa de la API
  const [clinics, setClinics] = useState([]);
  const [loadingClinics, setLoadingClinics] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("Todas");
  const [selectedCanton, setSelectedCanton] = useState("Todos");
  const [provinceModal, setProvinceModal] = useState(false);
  const [cantonModal, setCantonModal] = useState(false);

  const fetchClinics = async () => {
    setLoadingClinics(true);
    try {
      const res = await axios.get(`${API_URL}/clinics`);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setClinics(list);
    } catch (e) {
      setClinics([]);
    } finally {
      setLoadingClinics(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  const provinces = useMemo(
    () => ["Todas", ...uniqueSorted(clinics.map((c) => c.province))],
    [clinics]
  );

  const cantons = useMemo(() => {
    const list =
      selectedProvince === "Todas"
        ? clinics.map((c) => c.canton)
        : clinics.filter((c) => c.province === selectedProvince).map((c) => c.canton);

    return ["Todos", ...uniqueSorted(list)];
  }, [clinics, selectedProvince]);

  const filteredClinics = useMemo(() => {
    const q = search.trim().toLowerCase();

    return clinics.filter((c) => {
      const matchesProvince = selectedProvince === "Todas" || c.province === selectedProvince;
      const matchesCanton = selectedCanton === "Todos" || c.canton === selectedCanton;
      const matchesSearch =
        q === "" ||
        `${c.name ?? ""} ${c.address ?? ""} ${c.province ?? ""} ${c.canton ?? ""}`
          .toLowerCase()
          .includes(q);

      return matchesProvince && matchesCanton && matchesSearch;
    });
  }, [clinics, search, selectedProvince, selectedCanton]);

  const handleSelectClinic = (clinic) => {
    if (!user) {
      navigation.navigate("Login", { selectedClinic: clinic });
    } else {
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

            <Chip
              mode="outlined"
              onPress={fetchClinics}
              style={styles.chip}
              textStyle={styles.chipText}
            >
              {loadingClinics ? "Cargando..." : "Actualizar"}
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
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ color: "#666" }}>
                {loadingClinics ? "Cargando clínicas..." : "No hay clínicas registradas."}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>{item.name}</Title>
                <Paragraph style={styles.cardMeta}>
                  {(item.province || "—")} - {(item.canton || "—")}
                </Paragraph>
                <Paragraph style={styles.cardAddress}>{item.address || "—"}</Paragraph>
                <Paragraph style={styles.cardPhone}>
                  <Text style={{ fontWeight: "bold", color: "#2E8B57" }}>Tel:</Text>{" "}
                  {item.phone || "—"}
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
                  left={() => (item === selectedProvince ? <List.Icon icon="check" color="#2E8B57" /> : null)}
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
                  left={() => (item === selectedCanton ? <List.Icon icon="check" color="#2E8B57" /> : null)}
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
