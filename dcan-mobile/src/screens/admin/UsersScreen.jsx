import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, Alert, SafeAreaView, Platform, StatusBar } from "react-native";
import { Card, Title, Paragraph, Button, TextInput, FAB, Switch, Chip, HelperText, Divider, Avatar } from "react-native-paper";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { API_URL } from "../../config/api";

const ROLE_OPTIONS = [
  { key: "superadmin", dbRole: "superadmin", label: "Super Admin" }, 
  { key: "admin", dbRole: "clinic_admin", label: "Admin (Dueño)" },
  { key: "veterinario", dbRole: "veterinarian", label: "Veterinario" },
  { key: "cliente", dbRole: "client", label: "Cliente" },
];

export default function UsersScreen() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roleKey, setRoleKey] = useState("cliente"); 
  const [clinicId, setClinicId] = useState(null);
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}`, Accept: "application/json" }), [token]);

  const loadAll = async () => {
    setLoading(true); setError("");
    try {
      const [uRes, cRes] = await Promise.all([
        axios.get(`${API_URL}/admin/users`, { headers }),
        axios.get(`${API_URL}/admin/clinics`, { headers })
      ]);
      setUsers(Array.isArray(uRes.data) ? uRes.data : uRes.data?.data || []);
      setClinics(Array.isArray(cRes.data) ? cRes.data : cRes.data?.data || []);
    } catch (e) { setError("Error cargando datos."); } 
    finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);
  const onRefresh = async () => { setRefreshing(true); await loadAll(); setRefreshing(false); };

  const resetForm = () => { setEditing(null); setFullName(""); setEmail(""); setPhone(""); setRoleKey("cliente"); setClinicId(null); setPassword(""); setFormError(""); };
  const openCreate = () => { resetForm(); setOpenForm(true); };
  
  const openEdit = (u) => {
    setEditing(u); setFullName(u.name || ""); setEmail(u.email || ""); setPhone(u.phone || "");
    const uRole = u.roles && u.roles.length > 0 ? u.roles[0].name : (u.role || "client");
    const foundOption = ROLE_OPTIONS.find(opt => opt.dbRole === uRole || opt.dbRole === uRole.replace('_', ''));
    setRoleKey(foundOption ? foundOption.key : "cliente");
    setClinicId(u.clinic_id ?? u.clinicId ?? null); setPassword(""); setFormError(""); setOpenForm(true);
  };

  const requiresClinic = (key) => key === "admin" || key === "veterinario" || key === "cliente";

  const saveUser = async () => {
    if (!fullName.trim() || !email.trim()) return setFormError("Nombre y correo obligatorios.");
    if (!editing && !password.trim()) return setFormError("Contraseña obligatoria al crear.");
    if (requiresClinic(roleKey) && !clinicId) return setFormError("Debes asignar una clínica.");

    setFormError("");
    try {
      const selectedOption = ROLE_OPTIONS.find(r => r.key === roleKey);
      const dbRoleName = selectedOption ? selectedOption.dbRole : "client";
      const payload = { name: fullName.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), role: dbRoleName, clinic_id: requiresClinic(roleKey) ? clinicId : null };
      if (password.trim()) payload.password = password.trim();

      if (editing) { await axios.put(`${API_URL}/admin/users/${editing.id}`, payload, { headers }); Alert.alert("Éxito", "Actualizado."); } 
      else { await axios.post(`${API_URL}/admin/users`, payload, { headers }); Alert.alert("Éxito", "Creado."); }
      setOpenForm(false); resetForm(); loadAll();
    } catch (e) { setFormError(e.response?.data?.message || "Error al guardar."); }
  };

  const handleDelete = (u) => {
    Alert.alert("Eliminar", `¿Borrar a ${u.name}?`, [{ text: "Cancelar" }, { text: "Eliminar", style: "destructive", onPress: async () => { try { await axios.delete(`${API_URL}/admin/users/${u.id}`, { headers }); loadAll(); } catch (e) { Alert.alert("Error"); } } }]);
  };

  const toggleUser = async (u) => { try { await axios.patch(`${API_URL}/admin/users/${u.id}/toggle`, {}, { headers }); loadAll(); } catch (e) { setError("Error estado."); } };

  const filtered = users.filter((u) => {
    const uRole = u.roles && u.roles.length > 0 ? u.roles[0].name : (u.role || "");
    const text = `${u.name} ${u.email} ${uRole}`.toLowerCase();
    const matchQ = text.includes(q.trim().toLowerCase());
    let matchRole = true;
    if (roleFilter !== "all") {
        const targetOption = ROLE_OPTIONS.find(opt => opt.key === roleFilter);
        if (targetOption) { matchRole = uRole.includes(targetOption.dbRole) || uRole === targetOption.dbRole; if (roleFilter === 'superadmin' && (uRole === 'super_admin' || uRole === 'superadmin')) matchRole = true; }
    }
    return matchQ && matchRole;
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerContainer}>
           <Title style={[styles.headerTitle, { color: theme.colors.primary }]}>Usuarios</Title>
           <Paragraph>Gestión de roles y accesos</Paragraph>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        
        <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
          <TextInput label="Buscar usuario..." value={q} onChangeText={setQ} mode="outlined" left={<TextInput.Icon icon="magnify" />} style={styles.input} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {["all", "superadmin", "admin", "veterinario", "cliente"].map(role => (
                <Chip key={role} selected={roleFilter === role} onPress={() => setRoleFilter(role)} style={{marginRight: 8}}>{role === 'all' ? 'Todos' : role.charAt(0).toUpperCase() + role.slice(1)}</Chip>
            ))}
          </ScrollView>
        </View>

        {openForm && (
          <Card style={styles.formCard}>
            <Card.Content>
              <Title>{editing ? "Editar" : "Nuevo Usuario"}</Title>
              <TextInput label="Nombre" value={fullName} onChangeText={setFullName} mode="outlined" style={styles.input} />
              <TextInput label="Correo" value={email} onChangeText={setEmail} mode="outlined" style={styles.input} />
              <TextInput label="Teléfono" value={phone} onChangeText={setPhone} mode="outlined" style={styles.input} />
              
              <Paragraph style={{marginTop:5, fontWeight:'bold'}}>Rol:</Paragraph>
              <View style={styles.roleGrid}>{ROLE_OPTIONS.map((opt) => (<Chip key={opt.key} selected={roleKey === opt.key} onPress={() => setRoleKey(opt.key)} style={styles.roleChip}>{opt.label}</Chip>))}</View>
              
              {requiresClinic(roleKey) && (
                <View>
                   <Paragraph style={{marginTop:10, fontWeight:'bold'}}>Clínica:</Paragraph>
                   <View style={styles.roleGrid}>{clinics.map((c) => (<Chip key={c.id} selected={clinicId === c.id} onPress={() => setClinicId(c.id)} style={styles.roleChip}>{c.name}</Chip>))}</View>
                </View>
              )}
              <TextInput label={editing ? "Nueva Contraseña (Opcional)" : "Contraseña"} value={password} onChangeText={setPassword} mode="outlined" secureTextEntry style={[styles.input, { marginTop: 15 }]} />
              {!!formError && <HelperText type="error">{formError}</HelperText>}
              <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                <Button mode="contained" onPress={saveUser} style={{ flex: 1 }}>Guardar</Button>
                <Button mode="outlined" onPress={() => setOpenForm(false)} style={{ flex: 1 }}>Cancelar</Button>
              </View>
            </Card.Content>
          </Card>
        )}

        {filtered.map((u) => {
           const uRole = u.roles && u.roles.length > 0 ? u.roles[0].name : (u.role || "client");
           const active = u.is_active ?? true;
           const assignedClinic = clinics.find((c) => c.id === u.clinic_id)?.name;
           return (
            <Card key={u.id} style={styles.card}>
              <Card.Content>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                    <Avatar.Text size={40} label={u.name.substring(0,2).toUpperCase()} style={{backgroundColor: theme.colors.primary}} />
                    <View style={{marginLeft: 10, flex: 1}}>
                        <Title style={{ fontSize: 18 }}>{u.name}</Title>
                        <Paragraph style={{fontSize:12, color:'#666'}}>{u.email}</Paragraph>
                    </View>
                    <Switch value={!!active} onValueChange={() => toggleUser(u)} />
                </View>

                <View style={{flexDirection:'row', gap:5, marginTop:10, flexWrap:'wrap'}}>
                    <Chip style={{height:28}} textStyle={{fontSize:10}}>{uRole}</Chip>
                    {assignedClinic && <Chip icon="domain" style={{height:28}} textStyle={{fontSize:10}}>{assignedClinic}</Chip>}
                </View>

                <Divider style={{marginVertical: 10}} />
                <View style={{flexDirection:'row', justifyContent:'flex-end', gap: 10}}>
                      <Button onPress={() => openEdit(u)} mode="text" compact>Editar</Button>
                      <Button textColor="red" onPress={() => handleDelete(u)} mode="text" compact>Eliminar</Button>
                </View>
              </Card.Content>
            </Card>
           );
        })}
      </ScrollView>
      <FAB icon={openForm ? "close" : "plus"} style={[styles.fab, {backgroundColor: theme.colors.primary}]} onPress={() => { openForm ? setOpenForm(false) : openCreate() }} color="white" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 0 },
  headerContainer: { paddingHorizontal: 20, paddingBottom: 10, borderBottomWidth: 1, borderColor: '#eee', marginBottom: 5 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  filterRow: { paddingBottom: 10 },
  card: { marginHorizontal: 16, marginVertical: 6, borderRadius: 16, elevation: 2, backgroundColor: 'white' },
  formCard: { marginHorizontal: 16, marginVertical: 10, borderRadius: 16, elevation: 5, backgroundColor: 'white' },
  input: { marginBottom: 10, backgroundColor: 'white', height: 45 },
  roleGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop:5 },
  roleChip: { borderRadius: 8 },
  fab: { position: "absolute", right: 16, bottom: 16 },
});