import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  FAB,
  Switch,
  Chip,
  HelperText,
} from "react-native-paper";
import axios from "axios";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { API_URL } from "../../config/api";

export default function ClinicsScreen() {
  const { token } = useAuth();
  const { theme } = useTheme();

  const [tab, setTab] = useState("requests"); // "requests" | "clinics"

  const [requests, setRequests] = useState([]);
  const [clinics, setClinics] = useState([]);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);

  // Campos
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [ruc, setRuc] = useState("");
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    }),
    [token]
  );

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/clinic-requests`, { headers });
      setRequests(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (e) {
      setRequests([]);
    }
  };

  const fetchClinics = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/clinics`, { headers });
      setClinics(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (e) {
      setError("No se pudo cargar clínicas. Verifica conexión o servidor.");
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
    setOpenForm(true);
  };

  // ✅ FAB toggle (abre/cierra)
  const onFabPress = () => {
    if (openForm) {
      setOpenForm(false);
      resetForm();
      return;
    }
    openCreate();
  };

  const validateClinicForm = () => {
    if (!name.trim()) return "El nombre es obligatorio.";
    if (!adminEmail.trim()) return "El correo del administrador es obligatorio.";
    if (!adminEmail.includes("@")) return "Correo del administrador inválido.";
    if (phone && phone.trim().length < 7) return "Teléfono inválido.";
    return "";
  };

  const saveClinic = async () => {
    const msg = validateClinicForm();
    if (msg) return setError(msg);

    setError("");
    try {
      const payload = {
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        admin_email: adminEmail.trim().toLowerCase(),
        ruc: ruc.trim(),
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
      setError("Error guardando clínica. Revisa validaciones del servidor.");
    }
  };

  const toggleClinic = async (clinic) => {
    setError("");
    try {
      await axios.patch(`${API_URL}/admin/clinics/${clinic.id}/toggle`, {}, { headers });
      await fetchClinics();
    } catch (e) {
      setError("No se pudo activar/suspender la clínica.");
    }
  };

  const approveRequest = async (req) => {
    setError("");
    try {
      await axios.post(`${API_URL}/admin/clinic-requests/${req.id}/approve`, {}, { headers });
      await loadAll();
    } catch (e) {
      setError("No se pudo aprobar la solicitud.");
    }
  };

  const rejectRequest = async (req) => {
    setError("");
    try {
      await axios.post(`${API_URL}/admin/clinic-requests/${req.id}/reject`, {}, { headers });
      await loadAll();
    } catch (e) {
      setError("No se pudo rechazar la solicitud.");
    }
  };

  const filteredClinics = clinics.filter((c) => {
    const text = `${c?.name ?? ""} ${c?.address ?? ""} ${c?.phone ?? ""} ${c?.admin_email ?? ""}`.toLowerCase();
    return text.includes(q.trim().toLowerCase());
  });

  const activeCount = clinics.filter((c) => !!c.is_active).length;

  // ✅ si cambias de tab, cierra el formulario para evitar "form fantasma"
  const changeTab = (next) => {
    setTab(next);
    if (next !== "clinics" && openForm) {
      setOpenForm(false);
      resetForm();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Title style={[styles.title, { color: theme.colors.primary }]}>Gestión de Clínicas</Title>

        <View style={styles.tabsRow}>
          <Chip selected={tab === "requests"} icon="bell" onPress={() => changeTab("requests")}>
            Solicitudes ({requests.length})
          </Chip>
          <Chip selected={tab === "clinics"} icon="domain" onPress={() => changeTab("clinics")}>
            Clínicas ({clinics.length})
          </Chip>
        </View>

        {!!error && (
          <Paragraph style={{ color: theme.colors.error, textAlign: "center", marginBottom: 6 }}>
            {error}
          </Paragraph>
        )}
        {loading && <Paragraph style={{ textAlign: "center" }}>Cargando...</Paragraph>}

        {/* ====== SOLICITUDES ====== */}
        {tab === "requests" && (
          <>
            {requests.length === 0 && (
              <Paragraph style={{ textAlign: "center", opacity: 0.7, marginTop: 12 }}>
                No hay solicitudes pendientes.
              </Paragraph>
            )}

            {requests.map((r) => (
              <Card key={r.id} style={styles.card}>
                <Card.Content>
                  <Title style={{ fontSize: 18 }}>{r.name || "Solicitud de clínica"}</Title>
                  <Paragraph style={styles.detail}>Dirección: {r.address || "—"}</Paragraph>
                  <Paragraph style={styles.detail}>Teléfono: {r.phone || "—"}</Paragraph>
                  <Paragraph style={styles.detail}>Admin: {r.admin_email || r.email || "—"}</Paragraph>
                  {!!r.ruc && <Paragraph style={styles.detail}>RUC: {r.ruc}</Paragraph>}

                  <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                    <Button mode="contained" icon="check" style={{ flex: 1 }} onPress={() => approveRequest(r)}>
                      Aprobar
                    </Button>
                    <Button mode="outlined" icon="close" style={{ flex: 1 }} onPress={() => rejectRequest(r)}>
                      Rechazar
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </>
        )}

        {/* ====== CLÍNICAS ====== */}
        {tab === "clinics" && (
          <>
            <View style={styles.headerRow}>
              <Chip icon="domain" style={styles.chip}>Total: {clinics.length}</Chip>
              <Chip icon="check-circle" style={styles.chip}>Activas: {activeCount}</Chip>
              <Button mode="outlined" icon="refresh" onPress={loadAll} disabled={loading}>
                Actualizar
              </Button>
            </View>

            <TextInput
              label="Buscar clínica..."
              value={q}
              onChangeText={setQ}
              mode="outlined"
              style={{ marginHorizontal: 16, marginBottom: 10 }}
              left={<TextInput.Icon icon="magnify" />}
            />

            {openForm && (
              <Card style={styles.formCard}>
                <Card.Content>
                  <Title style={{ marginBottom: 10 }}>
                    {editing ? "Editar clínica" : "Crear clínica (manual)"}
                  </Title>

                  <TextInput label="Nombre" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
                  <TextInput label="Dirección" value={address} onChangeText={setAddress} mode="outlined" style={styles.input} />
                  <TextInput label="Teléfono" value={phone} onChangeText={setPhone} mode="outlined" style={styles.input} />
                  <TextInput
                    label="Correo del administrador"
                    value={adminEmail}
                    onChangeText={setAdminEmail}
                    mode="outlined"
                    autoCapitalize="none"
                    style={styles.input}
                  />
                  <TextInput label="RUC (opcional)" value={ruc} onChangeText={setRuc} mode="outlined" style={styles.input} />

                  <HelperText type="info" visible={true}>Gestión de clínica y acceso</HelperText>

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
                      <Title style={styles.clinicName}>{c.name}</Title>
                      <Paragraph style={styles.detail}>{c.address || "—"}</Paragraph>
                      <Paragraph style={styles.detail}>Tel: {c.phone || "—"}</Paragraph>
                      <Paragraph style={styles.detail}>Admin: {c.admin_email || "—"}</Paragraph>
                    </View>

                    <View style={{ alignItems: "flex-end", justifyContent: "center" }}>
                      <Chip icon={c.is_active ? "check" : "close"} style={{ marginBottom: 8 }}>
                        {c.is_active ? "Activa" : "Suspendida"}
                      </Chip>
                      <Switch value={!!c.is_active} onValueChange={() => toggleClinic(c)} />
                    </View>
                  </View>

                  <Button mode="text" onPress={() => openEdit(c)} style={{ marginTop: 6 }}>
                    Editar
                  </Button>
                </Card.Content>
              </Card>
            ))}

            {!loading && filteredClinics.length === 0 && (
              <Paragraph style={{ textAlign: "center", opacity: 0.7, marginTop: 18 }}>
                No hay clínicas que coincidan con la búsqueda.
              </Paragraph>
            )}
          </>
        )}
      </ScrollView>

      {/* ✅ FAB solo en tab clínicas, y ahora es toggle */}
      {tab === "clinics" && (
        <FAB
          icon={openForm ? "close" : "plus"}
          style={styles.fab}
          onPress={onFabPress}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginTop: 16, marginBottom: 10 },
  tabsRow: { flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 10 },
  headerRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  chip: { borderRadius: 999 },
  card: { marginHorizontal: 16, marginVertical: 8, borderRadius: 16, elevation: 3 },
  formCard: { marginHorizontal: 16, marginVertical: 10, borderRadius: 16, elevation: 5 },
  input: { marginBottom: 12 },
  row: { flexDirection: "row", gap: 12 },
  clinicName: { fontSize: 18 },
  detail: { opacity: 0.75 },
  fab: { position: "absolute", right: 16, bottom: 16 },
});
