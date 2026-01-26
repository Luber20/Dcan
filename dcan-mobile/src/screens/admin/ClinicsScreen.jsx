import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, SafeAreaView, Platform, StatusBar, Alert, Modal, Image } from "react-native";
import { Card, Title, Paragraph, Button, TextInput, FAB, Switch, Chip, Text, IconButton } from "react-native-paper";
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

  // Campos Formulario
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [ruc, setRuc] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  // ✅ ESTADO VISOR DE FOTO
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}`, Accept: "application/json" }), [token]);

  const fetchRequests = async () => {
    try {
      const [payRes, reviewRes] = await Promise.all([
        axios.get(`${API_URL}/admin/clinic-requests?status=pending_payment`, { headers }),
        axios.get(`${API_URL}/admin/clinic-requests?status=pending_review`, { headers }),
      ]);
      const payList = Array.isArray(payRes.data) ? payRes.data : payRes.data?.data || [];
      const reviewList = Array.isArray(reviewRes.data) ? reviewRes.data : reviewRes.data?.data || [];
      const merged = [...payList, ...reviewList].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
      setRequests(merged);
    } catch (e) { setRequests([]); }
  };

  const fetchClinics = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/clinics`, { headers });
      setClinics(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (e) { setError("Error cargando clínicas."); }
  };

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try { await Promise.all([fetchRequests(), fetchClinics()]); } finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);
  const onRefresh = async () => { setRefreshing(true); await loadAll(); setRefreshing(false); };

  const resetForm = () => { setEditing(null); setName(""); setAddress(""); setPhone(""); setAdminEmail(""); setRuc(""); setLatitude(""); setLongitude(""); setError(""); };
  const openCreate = () => { resetForm(); setOpenForm(true); };
  const openEdit = (clinic) => { setEditing(clinic); setName(clinic.name||""); setAddress(clinic.address||""); setPhone(clinic.phone||""); setAdminEmail(clinic.admin_email||""); setRuc(clinic.ruc||""); setLatitude(clinic.latitude?String(clinic.latitude):""); setLongitude(clinic.longitude?String(clinic.longitude):""); setOpenForm(true); };
  const onFabPress = () => { if (openForm) { setOpenForm(false); resetForm(); return; } openCreate(); };

  const saveClinic = async () => {
    if (!name.trim()) return setError("Nombre obligatorio.");
    try {
      const payload = { name:name.trim(), address:address.trim(), phone:phone.trim(), admin_email:adminEmail.trim().toLowerCase(), ruc:ruc.trim(), latitude:latitude||null, longitude:longitude||null };
      if (editing) await axios.put(`${API_URL}/admin/clinics/${editing.id}`, payload, { headers });
      else await axios.post(`${API_URL}/admin/clinics`, payload, { headers });
      setOpenForm(false); resetForm(); await fetchClinics();
    } catch (e) { setError(e?.response?.data?.message || "Error guardando."); }
  };

  const toggleClinic = async (c) => { try { await axios.patch(`${API_URL}/admin/clinics/${c.id}/toggle`, {}, { headers }); fetchClinics(); } catch (e) {} };
  const markPaid = async (req) => { try { await axios.patch(`${API_URL}/admin/clinic-requests/${req.id}/mark-paid`, {}, { headers }); loadAll(); } catch (e) { setError("Error."); } };
  const approveRequest = async (req) => { try { await axios.patch(`${API_URL}/admin/clinic-requests/${req.id}/approve`, {}, { headers }); loadAll(); } catch (e) { setError("Error."); } };
  const rejectRequest = async (req) => { try { await axios.patch(`${API_URL}/admin/clinic-requests/${req.id}/reject`, {}, { headers }); loadAll(); } catch (e) { setError("Error."); } };

  // ✅ VISOR DE FOTO
  const viewProof = (url) => {
    if(!url) return Alert.alert("Sin imagen", "Esta solicitud no tiene comprobante adjunto.");
    setSelectedImage(url);
    setImageModalVisible(true);
  };

  const filteredClinics = clinics.filter((c) => (`${c.name} ${c.address}`).toLowerCase().includes(q.toLowerCase()));
  const activeCount = clinics.filter((c) => !!c.is_active).length;
  const changeTab = (next) => { setTab(next); if (next !== "clinics" && openForm) { setOpenForm(false); resetForm(); } };

  const renderRequestStatusChip = (r) => {
    const unpaid = (r.payment_status || "unpaid") !== "paid";
    if (unpaid) return <Chip icon="cash-clock" style={{ alignSelf: "flex-start", marginTop: 8, backgroundColor: "#FFF3E0" }} textStyle={{ fontSize: 11 }}>Pago pendiente</Chip>;
    return <Chip icon="clipboard-check" style={{ alignSelf: "flex-start", marginTop: 8, backgroundColor: "#E8F5E9" }} textStyle={{ fontSize: 11 }}>En revisión</Chip>;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.headerContainer}>
          <Title style={[styles.headerTitle, { color: theme.colors.primary }]}>Gestión Global</Title>
        </View>

        <View style={styles.tabsRow}>
          <Chip selected={tab === "requests"} icon="bell" onPress={() => changeTab("requests")} style={styles.tabChip}>Solicitudes ({requests.length})</Chip>
          <Chip selected={tab === "clinics"} icon="domain" onPress={() => changeTab("clinics")} style={styles.tabChip}>Clínicas ({clinics.length})</Chip>
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
                    <Paragraph style={styles.detail}>📍 {r.address}</Paragraph>
                    <Paragraph style={styles.detail}>👤 {r.owner_name} · 📞 {r.phone}</Paragraph>

                    {renderRequestStatusChip(r)}

                    {/* ✅ BOTÓN DE COMPROBANTE - SIEMPRE VISIBLE */}
                    <Button 
                        mode="outlined" 
                        icon="image" 
                        compact 
                        style={{marginTop:10, borderColor: theme.colors.primary}}
                        onPress={() => viewProof(r.payment_proof_url)}
                        textColor={theme.colors.primary}
                    >
                        {r.payment_proof_url ? "Ver Comprobante" : "Sin Comprobante"}
                    </Button>

                    {!isPaid ? (
                      <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                        <Button mode="contained" icon="cash-check" style={{ flex: 1 }} onPress={() => markPaid(r)}>Confirmar Pago</Button>
                        <Button mode="outlined" icon="close" style={{ flex: 1 }} onPress={() => rejectRequest(r)} textColor="red">Rechazar</Button>
                      </View>
                    ) : (
                      <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                        <Button mode="contained" icon="check" style={{ flex: 1 }} onPress={() => approveRequest(r)} buttonColor="green">Aprobar</Button>
                        <Button mode="outlined" icon="close" style={{ flex: 1 }} onPress={() => rejectRequest(r)} textColor="red">Rechazar</Button>
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
            <TextInput label="Buscar..." value={q} onChangeText={setQ} mode="outlined" style={{ marginBottom: 15, backgroundColor: "white" }} />
            
            {openForm && (
              <Card style={styles.formCard}>
                <Card.Content>
                  <Title>{editing ? "Editar" : "Nueva"}</Title>
                  <TextInput label="Nombre" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
                  <TextInput label="Dirección" value={address} onChangeText={setAddress} mode="outlined" style={styles.input} />
                  <TextInput label="Teléfono" value={phone} onChangeText={setPhone} mode="outlined" style={styles.input} />
                  <TextInput label="Email Admin" value={adminEmail} onChangeText={setAdminEmail} mode="outlined" style={styles.input} autoCapitalize="none" />
                  <TextInput label="RUC" value={ruc} onChangeText={setRuc} mode="outlined" style={styles.input} />
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <TextInput label="Lat" value={latitude} onChangeText={setLatitude} mode="outlined" style={[styles.input, { flex: 1 }]} keyboardType="numeric" />
                    <TextInput label="Lon" value={longitude} onChangeText={setLongitude} mode="outlined" style={[styles.input, { flex: 1 }]} keyboardType="numeric" />
                  </View>
                  <Button mode="contained" onPress={saveClinic} style={{marginTop:10}}>Guardar</Button>
                  <Button onPress={() => { setOpenForm(false); resetForm(); }}>Cancelar</Button>
                </Card.Content>
              </Card>
            )}

            {filteredClinics.map((c) => (
              <Card key={c.id} style={styles.card}>
                <Card.Content>
                  <Title>{c.name}</Title>
                  <Paragraph>{c.address}</Paragraph>
                  <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                      <Button mode="text" onPress={() => openEdit(c)}>Editar Datos</Button>
                      <Switch value={!!c.is_active} onValueChange={() => toggleClinic(c)} />
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {tab === "clinics" && <FAB icon={openForm ? "close" : "plus"} style={[styles.fab, { backgroundColor: theme.colors.primary }]} onPress={onFabPress} color="white" />}

      {/* ✅ MODAL VISOR DE FOTO */}
      <Modal visible={imageModalVisible} transparent={true} onRequestClose={() => setImageModalVisible(false)}>
         <View style={{flex:1, backgroundColor:'rgba(0,0,0,0.9)', justifyContent:'center', alignItems:'center'}}>
             <IconButton icon="close" iconColor="white" size={30} style={{position:'absolute', top:40, right:20}} onPress={() => setImageModalVisible(false)} />
             {selectedImage && (
                 <Image source={{uri: selectedImage}} style={{width:'90%', height:'80%', resizeMode:'contain'}} />
             )}
         </View>
      </Modal>

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
  emptyText: { textAlign: "center", opacity: 0.7, marginTop: 18 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  statText: { fontWeight: "bold", fontSize: 12, color: "#666" },
  fab: { position: "absolute", right: 16, bottom: 16 },
});