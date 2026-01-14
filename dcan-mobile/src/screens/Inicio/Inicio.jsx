import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/api";

function uniqueSorted(arr) {
  return Array.from(new Set(arr.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export default function Inicio({ navigation }) {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("Inicio");
  const [search, setSearch] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("Todas");
  const [selectedCanton, setSelectedCanton] = useState("Todos");

  const [provinceModal, setProvinceModal] = useState(false);
  const [cantonModal, setCantonModal] = useState(false);

  // ✅ clínicas reales
  const [clinics, setClinics] = useState([]);
  const [loadingClinics, setLoadingClinics] = useState(false);
  const [clinicsError, setClinicsError] = useState("");

  // ✅ cargar clínicas desde API (público)
  // Recomendado backend: GET /api/clinics (solo activas)
  const fetchClinics = async () => {
    setLoadingClinics(true);
    setClinicsError("");
    try {
      const res = await axios.get(`${API_URL}/clinics`);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setClinics(list);
    } catch (e) {
      setClinicsError("No se pudo cargar el directorio de clínicas.");
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
    const list = clinics
      .filter((c) => (selectedProvince === "Todas" ? true : c.province === selectedProvince))
      .map((c) => c.canton);

    return ["Todos", ...uniqueSorted(list)];
  }, [clinics, selectedProvince]);

  const filteredClinics = useMemo(() => {
    const q = search.trim().toLowerCase();

    return clinics.filter((c) => {
      const matchesProvince = selectedProvince === "Todas" ? true : c.province === selectedProvince;
      const matchesCanton = selectedCanton === "Todos" ? true : c.canton === selectedCanton;

      const matchesSearch =
        q.length === 0
          ? true
          : `${c.name ?? ""} ${c.address ?? ""} ${c.province ?? ""} ${c.canton ?? ""}`
              .toLowerCase()
              .includes(q);

      return matchesProvince && matchesCanton && matchesSearch;
    });
  }, [clinics, search, selectedProvince, selectedCanton]);

  const headerSubtitle = useMemo(() => {
    if (activeTab === "Provincia") return "Filtra por provincia";
    if (activeTab === "Cantones") return "Filtra por cantón";
    return "Encuentra una veterinaria y agenda tu cita";
  }, [activeTab]);

  function openProvince() {
    setActiveTab("Provincia");
    setProvinceModal(true);
  }

  function openCanton() {
    setActiveTab("Cantones");
    setCantonModal(true);
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <View style={styles.navbarTopRow}>
          <Text style={styles.brand}>Veterinaria Ecuador</Text>

          {!user && (
            <Pressable onPress={() => navigation.navigate("Login")} style={styles.loginBtn}>
              <Text style={styles.loginBtnText}>Iniciar sesión</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.navTabs}>
          <NavTab label="Inicio" active={activeTab === "Inicio"} onPress={() => setActiveTab("Inicio")} />
          <NavTab label="Provincia" active={activeTab === "Provincia"} onPress={openProvince} />
          <NavTab label="Cantones" active={activeTab === "Cantones"} onPress={openCanton} />
        </View>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Directorio de Veterinarias</Text>
        <Text style={styles.subtitle}>{headerSubtitle}</Text>

        {/* Search */}
        <View style={styles.searchRow}>
          <TextInput
            placeholder="Buscar veterinaria, dirección, provincia..."
            placeholderTextColor="#6B7280"
            value={search}
            onChangeText={setSearch}
            style={styles.search}
          />
        </View>

        {/* Active filters chips */}
        <View style={styles.chipsRow}>
          <Chip label={`Provincia: ${selectedProvince}`} onPress={() => setProvinceModal(true)} />
          <Chip label={`Cantón: ${selectedCanton}`} onPress={() => setCantonModal(true)} />
          <Pressable
            style={styles.clearBtn}
            onPress={() => {
              setSelectedProvince("Todas");
              setSelectedCanton("Todos");
              setSearch("");
              setActiveTab("Inicio");
            }}
          >
            <Text style={styles.clearBtnText}>Limpiar</Text>
          </Pressable>

          <Pressable style={styles.clearBtn} onPress={fetchClinics}>
            <Text style={styles.clearBtnText}>Actualizar</Text>
          </Pressable>
        </View>

        {/* Estado carga */}
        {loadingClinics && (
          <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <ActivityIndicator />
            <Text style={{ color: "#4B5563" }}>Cargando clínicas...</Text>
          </View>
        )}

        {!!clinicsError && (
          <Text style={{ color: "#B91C1C", marginTop: 10 }}>{clinicsError}</Text>
        )}
      </View>

      {/* List */}
      <FlatList
        data={filteredClinics}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <ClinicCard clinic={item} navigation={navigation} user={user} />}
        ListEmptyComponent={
          !loadingClinics ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Sin resultados</Text>
              <Text style={styles.emptyText}>Prueba cambiando filtros o el texto de búsqueda.</Text>
            </View>
          ) : null
        }
      />

      {/* Province Modal */}
      <PickerModal
        visible={provinceModal}
        title="Selecciona una provincia"
        items={provinces}
        selected={selectedProvince}
        onClose={() => setProvinceModal(false)}
        onSelect={(val) => {
          setSelectedProvince(val);
          setSelectedCanton("Todos");
          setProvinceModal(false);
        }}
      />

      {/* Canton Modal */}
      <PickerModal
        visible={cantonModal}
        title="Selecciona un cantón"
        items={cantons}
        selected={selectedCanton}
        onClose={() => setCantonModal(false)}
        onSelect={(val) => {
          setSelectedCanton(val);
          setCantonModal(false);
        }}
      />
    </SafeAreaView>
  );
}

function NavTab({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active ? styles.tabActive : null]}>
      <Text style={[styles.tabText, active ? styles.tabTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

function Chip({ label, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

function ClinicCard({ clinic, navigation, user }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{clinic.name}</Text>
      <Text style={styles.cardMeta}>
        {clinic.province || "—"} • {clinic.canton || "—"}
      </Text>
      <Text style={styles.cardText}>{clinic.address || "—"}</Text>
      {!!clinic.phone && <Text style={[styles.cardText, { opacity: 0.8 }]}>Tel: {clinic.phone}</Text>}

      <View style={styles.cardActions}>
        <Pressable style={styles.btnPrimary} onPress={() => {}}>
          <Text style={styles.btnPrimaryText}>Ver clínica</Text>
        </Pressable>

        <Pressable
          style={styles.btnOutline}
          onPress={() => {
            if (!user) {
              navigation.navigate("Login");
              return;
            }
            console.log("Agendar cita para:", clinic.name);
          }}
        >
          <Text style={styles.btnOutlineText}>Agendar cita</Text>
        </Pressable>
      </View>
    </View>
  );
}

function PickerModal({ visible, title, items, selected, onClose, onSelect }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable onPress={onClose} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </Pressable>
          </View>

          <FlatList
            data={items}
            keyExtractor={(it) => it}
            renderItem={({ item }) => {
              const isSelected = item === selected;
              return (
                <Pressable
                  style={[styles.modalItem, isSelected && styles.modalItemActive]}
                  onPress={() => onSelect(item)}
                >
                  <Text style={[styles.modalItemText, isSelected && styles.modalItemTextActive]}>
                    {item}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },
  navbar: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, backgroundColor: "#2E8B57" },
  navbarTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { color: "white", fontSize: 18, fontWeight: "700" },
  loginBtn: { backgroundColor: "white", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10 },
  loginBtnText: { color: "#2E8B57", fontWeight: "800", fontSize: 13 },
  navTabs: { flexDirection: "row", gap: 8, marginTop: 10 },
  tab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.10)" },
  tabActive: { backgroundColor: "rgba(255,255,255,0.22)" },
  tabText: { color: "white", fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: "white" },

  header: { paddingHorizontal: 16, paddingVertical: 14 },
  title: { fontSize: 22, fontWeight: "800", color: "#2E8B57" },
  subtitle: { marginTop: 4, color: "#4B5563" },

  searchRow: { marginTop: 12 },
  search: {
    backgroundColor: "white",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#111827",
  },

  chipsRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" },
  chip: { backgroundColor: "white", borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  chipText: { color: "#111827", fontWeight: "600", fontSize: 12 },

  clearBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: "#2E8B57" },
  clearBtnText: { color: "white", fontWeight: "700", fontSize: 12 },

  listContent: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  card: { backgroundColor: "white", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "#E5E7EB" },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#2E8B57" },
  cardMeta: { marginTop: 4, color: "#6B7280", fontWeight: "600" },
  cardText: { marginTop: 8, color: "#2E8B57" },
  cardActions: { flexDirection: "row", gap: 10, marginTop: 12 },

  btnPrimary: { flex: 1, backgroundColor: "#2E8B57", borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  btnPrimaryText: { color: "white", fontWeight: "800" },

  btnOutline: { flex: 1, borderWidth: 1, borderColor: "#2E8B57", borderRadius: 12, paddingVertical: 10, alignItems: "center", backgroundColor: "white" },
  btnOutlineText: { color: "#111827", fontWeight: "800" },

  empty: { padding: 16, alignItems: "center" },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  emptyText: { marginTop: 6, color: "#6B7280", textAlign: "center" },

  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" },
  modalSheet: { backgroundColor: "white", borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: "70%", paddingBottom: 18 },
  modalHeader: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#E5E7EB", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  modalClose: { paddingVertical: 6, paddingHorizontal: 10 },
  modalCloseText: { color: "#111827", fontWeight: "800" },

  modalItem: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  modalItemActive: { backgroundColor: "#F3F4F6" },
  modalItemText: { color: "#111827", fontWeight: "700" },
  modalItemTextActive: { color: "#2E8B57" },
});
