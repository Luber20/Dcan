import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, SafeAreaView, Platform, StatusBar, Alert } from "react-native";
import { Card, Title, Paragraph, Button, TextInput, FAB, Switch, Chip, Text } from "react-native-paper";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { API_URL } from "../../config/api";

export default function ClinicsScreen() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const [tab, setTab] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);

  // Campos existentes
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [ruc, setRuc] = useState("");

  // ✅ NUEVOS CAMPOS: Ubicación
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}`, Accept: "application/json" }), [token]);

  // ✅ Traer solicitudes en estado "pending_payment" y "pending_review"
  // Como el backend filtra por status 1 a la vez, las traemos en paralelo y unimos
  const fetchRequests = async () => {
    try {
      const [payRes, reviewRes] = await Promise.all([
        axios.get(`${API_URL}/admin/clinic-requests?status=pending_payment`, { headers }),
        axios.get(`${API_URL}/admin/clinic-requests?status=pending_review`, { headers }),
      ]);

      const payList = Array.isArray(payRes.data) ? payRes.data : payRes.data?.data || [];
      const reviewList = Array.isArray(reviewRes.data) ? reviewRes.data : reviewRes.data?.data || [];

      // Unimos y ordenamos por id desc
      const merged = [...payList, ...reviewList].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
      setRequests(merged);
    } catch (e) {
      setRequests([]);
    }
  };

  const fetchClinics = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/clinics`, { headers });
      setClinics(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (e) {
      setError("No se pudo cargar clínicas.");
    }
  };

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      await Promise.all([fetchRequests(), fetchClinics()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const resetForm = () => {
    setEditing(null);
    setName("");
    setAddress("");
    setPhone("");
    setAdminEmail("");
    setRuc("");
    setLatitude("");
    setLongitude("");
    setError("");
  };

  const openCreate = () => {
    resetForm();
    setOpenForm(true);
  };

  const openEdit = (clinic) => {
    setEditing(clinic);
    setName(clinic.name || "");
    setAddress(clinic.address || "");
    setPhone(clinic.phone || "");
    setAdminEmail(clinic.admin_email || clinic.adminEmail || "");
    setRuc(clinic.ruc || "");
    setLatitude(clinic.latitude ? String(clinic.latitude) : "");
    setLongitude(clinic.longitude ? String(clinic.longitude) : "");
    setOpenForm(true);
  };

  const onFabPress = () => {
    if (openForm) {
      setOpenForm(false);
      resetForm();
      return;
    }
    openCreate();
  };

  const saveClinic = async () => {
    if (!name.trim()) return setError("Nombre obligatorio.");
    setError("");
    try {
      const payload = {
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        admin_email: adminEmail.trim().toLowerCase(),
        ruc: ruc.trim(),
        latitude: latitude || null,
        longitude: longitude || null,
      };

      if (editing) {
        await axios.put(`${API_URL}/admin/clinics/${editing.id}`, payload, { headers });
      } else {
        await axios.post(`${API_URL}/admin/clinics`, payload, { headers });
      }

      setOpenForm(false);
      resetForm();
      await fetchClinics();
    } catch (e) {
      setError(e?.response?.data?.message || "Error guardando.");
    }
  };

  const toggleClinic = async (clinic) => {
    try {
      await axios.patch(`${API_URL}/admin/clinics/${clinic.id}/toggle`, {}, { headers });
      await fetchClinics();
    } catch (e) {
      setError("Error al cambiar estado.");
    }
  };

  // ✅ Pago manual: marcar como pagado
  const markPaid = async (req) => {
    try {
      // opcional: puedes pedir referencia
      // por ahora, marcamos pagado sin referencia
      await axios.patch(`${API_URL}/admin/clinic-requests/${req.id}/mark-paid`, {}, { headers });
      await loadAll();
    } catch (e) {
      setError(e?.response?.data?.message || "Error al marcar pagado.");
    }
  };

  // ✅ API es PATCH, no POST
  const approveRequest = async (req) => {
    try {
      await axios.patch(`${API_URL}/admin/clinic-requests/${req.id}/approve`, {}, { headers });
      await loadAll();
    } catch (e) {
      setError(e?.response?.data?.message || "Error al aprobar.");
    }
  };

  const rejectRequest = async (req) => {
    try {
      await axios.patch(`${API_URL}/admin/clinic-requests/${req.id}/reject`, {}, { headers });
      await loadAll();
    } catch (e) {
      setError(e?.response?.data?.message || "Error al rechazar.");
    }
  };

  const filteredClinics = clinics.filter((c) => {
    const text = `${c?.name ?? ""} ${c?.address ?? ""} ${c?.phone ?? ""} ${c?.admin_email ?? ""}`.toLowerCase();
    return text.includes(q.trim().toLowerCase());
  });

  const activeCount = clinics.filter((c) => !!c.is_active).length;

  const changeTab = (next) => {
    setTab(next);
    if (next !== "clinics" && openForm) {
      setOpenForm(false);
      resetForm();
    }
  };

  const renderRequestStatusChip = (r) => {
    const unpaid = (r.payment_status || "unpaid") !== "paid";
    const status = r.status || "";

    if (unpaid || status === "pending_payment") {
      return (
        <Chip
          icon="cash-clock"
          style={{ alignSelf: "flex-start", marginTop: 8, backgroundColor: "#FFF3E0" }}
          textStyle={{ fontSize: 11 }}
        >
          Pago pendiente
        </Chip>
      );
    }

    return (
      <Chip
        icon="clipboard-check"
        style={{ alignSelf: "flex-start", marginTop: 8, backgroundColor: "#E8F5E9" }}
        textStyle={{ fontSize: 11 }}
      >
        En revisión
      </Chip>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.headerContainer}>
          <Title style={[styles.headerTitle, { color: theme.colors.primary }]}>Gestión Global</Title>
          <Paragraph>Control de clínicas y solicitudes</Paragraph>
        </View>

        <View style={styles.tabsRow}>
          <Chip selected={tab === "requests"} icon="bell" onPress={() => changeTab("requests")} style={styles.tabChip}>
            Solicitudes ({requests.length})
          </Chip>
          <Chip selected={tab === "clinics"} icon="domain" onPress={() => changeTab("clinics")} style={styles.tabChip}>
            Clínicas ({clinics.length})
          </Chip>
        </View>

        {!!error && <Paragraph style={{ color: theme.colors.error, textAlign: "center", marginBottom: 6 }}>{error}</Paragraph>}
        {loading && <Paragraph style={{ textAlign: "center" }}>Cargando...</Paragraph>}

        {tab === "requests" && (
          <View style={{ paddingHorizontal: 16 }}>
            {requests.length === 0 && <Paragraph style={styles.emptyText}>No hay solicitudes pendientes.</Paragraph>}

            {requests.map((r) => {
              const isPaid = (r.payment_status || "unpaid") === "paid";
              return (
                <Card key={r.id} style={styles.card}>
                  <Card.Content>
                    <Title>{r.clinic_name}</Title>
                    <Paragraph style={styles.detail}>
                      📍 {r.address || "Sin dirección"} · {r.canton || "-"} · {r.province || "-"}
                    </Paragraph>
                    <Paragraph style={styles.detail}>👤 Responsable: {r.owner_name || "N/D"}</Paragraph>
                    <Paragraph style={styles.detail}>✉️ {r.email || "N/D"} · ☎️ {r.phone || "N/D"}</Paragraph>

                    {/* ✅ Monto y referencia (si existen) */}
                    {!!r.amount && (
                      <Paragraph style={styles.detail}>
                        💵 Pago: {r.amount} {r.currency || "USD"} · Ref: {r.public_token || "—"}
                      </Paragraph>
                    )}

                    {renderRequestStatusChip(r)}

                    {/* ✅ Botones según pago */}
                    {!isPaid ? (
                      <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                        <Button
                          mode="contained"
                          icon="cash-check"
                          style={{ flex: 1 }}
                          onPress={() => markPaid(r)}
                        >
                          Marcar pagado
                        </Button>
                        <Button
                          mode="outlined"
                          icon="close"
                          style={{ flex: 1 }}
                          onPress={() => rejectRequest(r)}
                        >
                          Rechazar
                        </Button>
                      </View>
                    ) : (
                      <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                        <Button
                          mode="contained"
                          icon="check"
                          style={{ flex: 1 }}
                          onPress={() => approveRequest(r)}
                        >
                          Aprobar
                        </Button>
                        <Button
                          mode="outlined"
                          icon="close"
                          style={{ flex: 1 }}
                          onPress={() => rejectRequest(r)}
                        >
                          Rechazar
                        </Button>
                      </View>
                    )}
                  </Card.Content>
                </Card>
              );
            })}
          </View>
        )}

        {tab === "clinics" && (
          <View style={{ paddingHorizontal: 16 }}>
            <View style={styles.statsRow}>
              <Text style={styles.statText}>Total: {clinics.length}</Text>
              <Text style={[styles.statText, { color: "green" }]}>Activas: {activeCount}</Text>
            </View>

            <TextInput
              label="Buscar clínica..."
              value={q}
              onChangeText={setQ}
              mode="outlined"
              style={{ marginBottom: 15, backgroundColor: "white" }}
              left={<TextInput.Icon icon="magnify" />}
            />

            {openForm && (
              <Card style={styles.formCard}>
                <Card.Content>
                  <Title style={{ marginBottom: 10 }}>{editing ? "Editar clínica" : "Nueva clínica"}</Title>
                  <TextInput label="Nombre" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
                  <TextInput label="Dirección" value={address} onChangeText={setAddress} mode="outlined" style={styles.input} />
                  <TextInput label="Teléfono" value={phone} onChangeText={setPhone} mode="outlined" style={styles.input} />
                  <TextInput
                    label="Email Admin"
                    value={adminEmail}
                    onChangeText={setAdminEmail}
                    mode="outlined"
                    style={styles.input}
                    autoCapitalize="none"
                  />
                  <TextInput label="RUC" value={ruc} onChangeText={setRuc} mode="outlined" style={styles.input} />

                  <Paragraph style={{ fontWeight: "bold", marginTop: 5 }}>Ubicación (Manual):</Paragraph>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <TextInput label="Latitud" value={latitude} onChangeText={setLatitude} mode="outlined" style={[styles.input, { flex: 1 }]} keyboardType="numeric" />
                    <TextInput label="Longitud" value={longitude} onChangeText={setLongitude} mode="outlined" style={[styles.input, { flex: 1 }]} keyboardType="numeric" />
                  </View>

                  <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                    <Button mode="contained" onPress={saveClinic} style={{ flex: 1 }}>
                      Guardar
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => {
                        setOpenForm(false);
                        resetForm();
                      }}
                      style={{ flex: 1 }}
                    >
                      Cancelar
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            )}

            {filteredClinics.map((c) => (
              <Card key={c.id} style={styles.card}>
                <Card.Content>
                  <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <Title style={{ fontSize: 18 }}>{c.name}</Title>
                      <Paragraph style={styles.detail}>{c.address}</Paragraph>
                      <Paragraph style={styles.detail}>Admin: {c.admin_email}</Paragraph>

                      {c.latitude && c.longitude ? (
                        <Chip
                          icon="map-marker-check"
                          style={{ alignSelf: "flex-start", marginTop: 5, height: 26 }}
                          textStyle={{ fontSize: 10, lineHeight: 14 }}
                        >
                          GPS Activo
                        </Chip>
                      ) : (
                        <Chip
                          icon="map-marker-off"
                          style={{ alignSelf: "flex-start", marginTop: 5, height: 26, backgroundColor: "#eee" }}
                          textStyle={{ fontSize: 10, lineHeight: 14 }}
                        >
                          Sin GPS
                        </Chip>
                      )}
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Switch value={!!c.is_active} onValueChange={() => toggleClinic(c)} />
                      <Text style={{ fontSize: 10, color: "#666" }}>{c.is_active ? "Activa" : "Suspendida"}</Text>
                    </View>
                  </View>
                  <Button mode="text" onPress={() => openEdit(c)} style={{ marginTop: 5, alignSelf: "flex-start" }}>
                    Editar Datos
                  </Button>
                </Card.Content>
              </Card>
            ))}

            {!loading && filteredClinics.length === 0 && <Paragraph style={styles.emptyText}>Sin resultados.</Paragraph>}
          </View>
        )}
      </ScrollView>

      {tab === "clinics" && (
        <FAB
          icon={openForm ? "close" : "plus"}
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={onFabPress}
          color="white"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 0 },
  headerContainer: { paddingHorizontal: 20, paddingBottom: 10, alignItems: "center" },
  headerTitle: { fontSize: 24, fontWeight: "bold" },
  tabsRow: { flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 15 },
  tabChip: { height: 35 },
  card: { marginBottom: 12, borderRadius: 16, elevation: 3, backgroundColor: "white" },
  formCard: { marginBottom: 15, borderRadius: 16, elevation: 5, backgroundColor: "white", borderColor: "#ddd", borderWidth: 1 },
  input: { marginBottom: 10, backgroundColor: "white", height: 45 },
  detail: { opacity: 0.7, fontSize: 13 },
  row: { flexDirection: "row", gap: 12 },
  emptyText: { textAlign: "center", opacity: 0.7, marginTop: 18 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  statText: { fontWeight: "bold", fontSize: 12, color: "#666" },
  fab: { position: "absolute", right: 16, bottom: 16 },
});
