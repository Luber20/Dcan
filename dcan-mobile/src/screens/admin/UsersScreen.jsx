import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from "react-native";
import {
  Card, Title, Paragraph, Button, TextInput, FAB, Switch, Chip, HelperText, Divider
} from "react-native-paper";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { API_URL } from "../../config/api";

// 🔧 AJUSTA ESTAS CLAVES SEGÚN TU BASE DE DATOS
// Backend suele usar: 'superadmin' (o super_admin), 'clinic_admin', 'veterinarian', 'client'
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

  // UX
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Formulario
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roleKey, setRoleKey] = useState("cliente"); // Usamos la key del array local
  const [clinicId, setClinicId] = useState(null);
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  const headers = useMemo(() => ({
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
  }), [token]);

  const fetchClinics = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/clinics`, { headers });
      setClinics(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (e) {}
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_URL}/admin/users`, { headers });
      setUsers(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (e) {
      setError("No se pudo cargar usuarios.");
    } finally {
      setLoading(false);
    }
  };

  const loadAll = async () => { await Promise.all([fetchUsers(), fetchClinics()]); };
  useEffect(() => { loadAll(); }, []);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  // --- LÓGICA DE FORMULARIO ---
  const resetForm = () => {
    setEditing(null);
    setFullName(""); setEmail(""); setPhone(""); setRoleKey("cliente");
    setClinicId(null); setPassword(""); setFormError("");
  };

  const openCreate = () => { resetForm(); setOpenForm(true); };

  const openEdit = (u) => {
    setEditing(u);
    setFullName(u.name || "");
    setEmail(u.email || "");
    setPhone(u.phone || "");

    // Detectar rol actual del usuario
    const uRole = u.roles && u.roles.length > 0 ? u.roles[0].name : (u.role || "client");
    
    // Mapear el rol de la BD a nuestra key local
    const foundOption = ROLE_OPTIONS.find(opt => 
        opt.dbRole === uRole || opt.dbRole === uRole.replace('_', '')
    );
    setRoleKey(foundOption ? foundOption.key : "cliente");

    setClinicId(u.clinic_id ?? u.clinicId ?? null);
    setPassword(""); // Vacía para no sobreescribir si no quiere cambiarla
    setFormError("");
    setOpenForm(true);
  };

  const requiresClinic = (key) => key === "admin" || key === "veterinario";

  const saveUser = async () => {
    if (!fullName.trim() || !email.trim()) return setFormError("Nombre y correo obligatorios.");
    if (!editing && !password.trim()) return setFormError("Contraseña obligatoria al crear.");

    setFormError("");
    try {
      // Buscar el nombre real del rol para la BD (ej: 'clinic_admin')
      const selectedOption = ROLE_OPTIONS.find(r => r.key === roleKey);
      const dbRoleName = selectedOption ? selectedOption.dbRole : "client";

      const payload = {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role: dbRoleName,
        clinic_id: requiresClinic(roleKey) ? clinicId : null,
      };

      if (password.trim()) payload.password = password.trim();

      if (editing) {
        await axios.put(`${API_URL}/admin/users/${editing.id}`, payload, { headers });
        Alert.alert("Éxito", "Usuario actualizado.");
      } else {
        await axios.post(`${API_URL}/admin/users`, payload, { headers });
        Alert.alert("Éxito", "Usuario creado.");
      }

      setOpenForm(false);
      resetForm();
      fetchUsers();
    } catch (e) {
      console.log(e);
      setFormError("Error al guardar. Revisa que el correo no esté duplicado.");
    }
  };

  // --- ELIMINAR ---
  const handleDelete = (u) => {
    Alert.alert(
      "Eliminar Usuario",
      `¿Estás seguro de eliminar a ${u.name}? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/admin/users/${u.id}`, { headers });
              Alert.alert("Eliminado", "El usuario ha sido eliminado correctamente.");
              fetchUsers();
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar el usuario.");
            }
          }
        }
      ]
    );
  };

  const toggleUser = async (u) => {
    try {
      await axios.patch(`${API_URL}/admin/users/${u.id}/toggle`, {}, { headers });
      fetchUsers();
    } catch (e) { setError("Error cambiando estado."); }
  };

  // --- FILTRADO ---
  const filtered = users.filter((u) => {
    // Normalizar rol del usuario
    const uRole = u.roles && u.roles.length > 0 ? u.roles[0].name : (u.role || "");
    
    // Texto de búsqueda
    const text = `${u.name} ${u.email} ${uRole}`.toLowerCase();
    const matchQ = text.includes(q.trim().toLowerCase());

    // Filtro por tabs
    let matchRole = true;
    if (roleFilter !== "all") {
        // Buscar qué roles de BD corresponden a la pestaña seleccionada
        const targetOption = ROLE_OPTIONS.find(opt => opt.key === roleFilter);
        if (targetOption) {
            // Comparamos el rol de la BD con el que esperamos (ej: clinic_admin)
            // Usamos includes por si acaso hay variaciones 'superadmin' vs 'super_admin'
            matchRole = uRole.includes(targetOption.dbRole) || uRole === targetOption.dbRole;
            
            // Fix específico para SuperAdmin si hay inconsistencia de guiones bajos
            if (roleFilter === 'superadmin' && (uRole === 'super_admin' || uRole === 'superadmin')) matchRole = true;
        }
    }

    return matchQ && matchRole;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Title style={[styles.title, { color: theme.colors.primary }]}>Usuarios</Title>

        <View style={styles.topRow}>
          <Chip icon="account-multiple">Total: {users.length}</Chip>
          <Button mode="outlined" icon="refresh" onPress={loadAll} disabled={loading}>Actualizar</Button>
        </View>

        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          <TextInput label="Buscar..." value={q} onChangeText={setQ} mode="outlined" left={<TextInput.Icon icon="magnify" />} />
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            <Chip selected={roleFilter === "all"} onPress={() => setRoleFilter("all")}>Todos</Chip>
            <Chip selected={roleFilter === "superadmin"} onPress={() => setRoleFilter("superadmin")}>SuperAdmin</Chip>
            <Chip selected={roleFilter === "admin"} onPress={() => setRoleFilter("admin")}>Dueños</Chip>
            <Chip selected={roleFilter === "veterinario"} onPress={() => setRoleFilter("veterinario")}>Vets</Chip>
            <Chip selected={roleFilter === "cliente"} onPress={() => setRoleFilter("cliente")}>Clientes</Chip>
          </ScrollView>
        </View>

        {loading && <Paragraph style={{ textAlign: "center", marginTop: 10 }}>Cargando...</Paragraph>}

        {/* FORMULARIO */}
        {openForm && (
          <Card style={styles.formCard}>
            <Card.Content>
              <Title>{editing ? "Editar" : "Nuevo"}</Title>
              <TextInput label="Nombre" value={fullName} onChangeText={setFullName} mode="outlined" style={styles.input} />
              <TextInput label="Correo" value={email} onChangeText={setEmail} mode="outlined" style={styles.input} />
              <TextInput label="Teléfono" value={phone} onChangeText={setPhone} mode="outlined" style={styles.input} />

              <Paragraph style={{marginTop: 5}}>Rol:</Paragraph>
              <View style={styles.roleGrid}>
                {ROLE_OPTIONS.map((opt) => (
                  <Chip key={opt.key} selected={roleKey === opt.key} onPress={() => setRoleKey(opt.key)} style={styles.roleChip}>
                    {opt.label}
                  </Chip>
                ))}
              </View>

              {requiresClinic(roleKey) && (
                <View>
                   <Paragraph style={{marginTop: 10}}>Clínica:</Paragraph>
                   <View style={styles.roleGrid}>
                    {clinics.map((c) => (
                      <Chip key={c.id} selected={clinicId === c.id} onPress={() => setClinicId(c.id)} style={styles.roleChip}>{c.name}</Chip>
                    ))}
                   </View>
                </View>
              )}

              <TextInput 
                label={editing ? "Nueva Contraseña (Opcional)" : "Contraseña"} 
                value={password} onChangeText={setPassword} mode="outlined" secureTextEntry style={[styles.input, { marginTop: 15 }]} 
              />
              
              {!!formError && <HelperText type="error">{formError}</HelperText>}

              <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                <Button mode="contained" onPress={saveUser} style={{ flex: 1 }}>Guardar</Button>
                <Button mode="outlined" onPress={() => setOpenForm(false)} style={{ flex: 1 }}>Cancelar</Button>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* LISTA */}
        {filtered.map((u) => {
           const uRole = u.roles && u.roles.length > 0 ? u.roles[0].name : (u.role || "client");
           const active = u.is_active ?? true;
           const assignedClinic = clinics.find((c) => c.id === u.clinic_id)?.name;

           return (
            <Card key={u.id} style={styles.card}>
              <Card.Content>
                <Title style={{ fontSize: 18 }}>{u.name}</Title>
                <Paragraph>{u.email} • {u.phone}</Paragraph>
                <View style={{flexDirection:'row', gap:5, marginTop:5}}>
                    <Chip style={{height:30}} textStyle={{fontSize:11}}>{uRole}</Chip>
                    {assignedClinic && <Chip icon="domain" style={{height:30}} textStyle={{fontSize:11}}>{assignedClinic}</Chip>}
                </View>

                <Divider style={{marginVertical: 10}} />
                
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems:'center' }}>
                  <View style={{flexDirection:'row', alignItems:'center'}}>
                      <Switch value={!!active} onValueChange={() => toggleUser(u)} />
                      <Paragraph style={{fontSize:12, marginLeft:5}}>{active ? "Activo" : "Bloqueado"}</Paragraph>
                  </View>
                  <View style={{flexDirection:'row'}}>
                      <Button onPress={() => openEdit(u)}>Editar</Button>
                      <Button textColor="red" onPress={() => handleDelete(u)}>Eliminar</Button>
                  </View>
                </View>
              </Card.Content>
            </Card>
           );
        })}
      </ScrollView>

      <FAB icon={openForm ? "close" : "plus"} style={styles.fab} onPress={() => { openForm ? setOpenForm(false) : openCreate() }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginTop: 16, marginBottom: 10 },
  topRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 10 },
  filterRow: { gap: 8, paddingBottom: 5 },
  card: { marginHorizontal: 16, marginVertical: 6, borderRadius: 12, elevation: 2 },
  formCard: { marginHorizontal: 16, marginVertical: 10, borderRadius: 16, elevation: 5 },
  input: { marginBottom: 10, backgroundColor: 'white' },
  roleGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop:5 },
  roleChip: { borderRadius: 8 },
  fab: { position: "absolute", right: 16, bottom: 16, backgroundColor:'#2E8B57' },
});