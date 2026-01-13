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
  Divider,
} from "react-native-paper";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { API_URL } from "../../config/api";

const ROLE_OPTIONS = [
  { key: "superadmin", label: "Super Admin" },
  { key: "admin", label: "Admin (Dueño)" },
  { key: "veterinario", label: "Veterinario" },
  { key: "cliente", label: "Cliente" },
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

  // form
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("cliente");
  const [clinicId, setClinicId] = useState(null);

  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    }),
    [token]
  );

  const requiresClinic = (r) => r === "admin" || r === "veterinario";

  const fetchClinics = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/clinics`, { headers });
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setClinics(list);
    } catch (e) {
      setClinics([]);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_URL}/admin/users`, { headers });
      setUsers(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (e) {
      setError("No se pudo cargar usuarios. Verifica conexión o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const loadAll = async () => {
    await Promise.all([fetchUsers(), fetchClinics()]);
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
    setFullName("");
    setEmail("");
    setPhone("");
    setRole("cliente");
    setClinicId(null);
    setPassword("");
    setFormError("");
  };

  const openCreate = () => {
    resetForm();
    setOpenForm(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setFullName(u.name || "");
    setEmail(u.email || "");
    setPhone(u.phone || "");

    const currentRole =
      u.role || (Array.isArray(u.roles) && u.roles[0]?.name) || "cliente";
    setRole(currentRole);

    setClinicId(u.clinic_id ?? u.clinicId ?? null);
    setPassword("");
    setFormError("");
    setOpenForm(true);
  };

  // ✅ FAB toggle (lo que te faltaba)
  const onFabPress = () => {
    if (openForm) {
      setOpenForm(false);
      resetForm();
      return;
    }
    openCreate();
  };

  const validateForm = () => {
    if (!fullName.trim()) return "El nombre es obligatorio.";
    if (!email.trim()) return "El correo es obligatorio.";
    if (!email.includes("@")) return "Correo inválido.";
    if (!role) return "Selecciona un rol.";

    if (!editing && !password.trim())
      return "La contraseña es obligatoria al crear un usuario.";

    if (requiresClinic(role) && !clinicId)
      return "Selecciona una clínica para este rol.";

    return "";
  };

  const saveUser = async () => {
    const msg = validateForm();
    if (msg) return setFormError(msg);

    setFormError("");
    try {
      const payload = {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role,
        clinic_id: requiresClinic(role) ? clinicId : null,
      };

      if (password.trim()) payload.password = password.trim();

      if (editing) {
        await axios.put(`${API_URL}/admin/users/${editing.id}`, payload, { headers });
      } else {
        await axios.post(`${API_URL}/admin/users`, payload, { headers });
      }

      setOpenForm(false);
      resetForm();
      fetchUsers();
    } catch (e) {
      setFormError("No se pudo guardar el usuario. Revisa validaciones del servidor.");
    }
  };

  const toggleUser = async (u) => {
    setError("");
    try {
      await axios.patch(`${API_URL}/admin/users/${u.id}/toggle`, {}, { headers });
      fetchUsers();
    } catch (e) {
      setError("No se pudo activar/inactivar el usuario.");
    }
  };

  const roleLabel = (r) =>
    ROLE_OPTIONS.find((x) => x.key === r)?.label || r || "—";

  const filtered = users.filter((u) => {
    const r = u.role || (Array.isArray(u.roles) && u.roles[0]?.name) || "cliente";
    const text = `${u?.name ?? ""} ${u?.email ?? ""} ${u?.phone ?? ""} ${r ?? ""}`.toLowerCase();
    const matchQ = text.includes(q.trim().toLowerCase());
    const matchRole = roleFilter === "all" ? true : r === roleFilter;
    return matchQ && matchRole;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Title style={[styles.title, { color: theme.colors.primary }]}>Usuarios</Title>

        <Paragraph style={{ textAlign: "center", opacity: 0.75, marginBottom: 8, paddingHorizontal: 16 }}>
          Administración de acceso: creación de usuarios, roles, activación e
          (si aplica) asignación a clínicas.
        </Paragraph>

        <View style={styles.topRow}>
          <Chip icon="account-multiple" style={styles.chip}>
            Total: {users.length}
          </Chip>
          <Button mode="outlined" icon="refresh" onPress={loadAll} disabled={loading}>
            Actualizar
          </Button>
        </View>

        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          <TextInput
            label="Buscar por nombre, correo o teléfono"
            value={q}
            onChangeText={setQ}
            mode="outlined"
            left={<TextInput.Icon icon="magnify" />}
          />

          <View style={styles.filterRow}>
            <Chip selected={roleFilter === "all"} onPress={() => setRoleFilter("all")}>Todos</Chip>
            <Chip selected={roleFilter === "superadmin"} onPress={() => setRoleFilter("superadmin")}>SuperAdmin</Chip>
            <Chip selected={roleFilter === "admin"} onPress={() => setRoleFilter("admin")}>Admin</Chip>
            <Chip selected={roleFilter === "veterinario"} onPress={() => setRoleFilter("veterinario")}>Vet</Chip>
            <Chip selected={roleFilter === "cliente"} onPress={() => setRoleFilter("cliente")}>Cliente</Chip>
          </View>
        </View>

        {!!error && (
          <Paragraph style={{ color: theme.colors.error, textAlign: "center", marginTop: 10 }}>
            {error}
          </Paragraph>
        )}
        {loading && <Paragraph style={{ textAlign: "center", marginTop: 10 }}>Cargando...</Paragraph>}

        {/* FORM */}
        {openForm && (
          <Card style={styles.formCard}>
            <Card.Content>
              <Title style={{ marginBottom: 10 }}>
                {editing ? "Editar usuario" : "Nuevo usuario"}
              </Title>

              <TextInput label="Nombre completo" value={fullName} onChangeText={setFullName} mode="outlined" style={styles.input} />
              <TextInput label="Correo" value={email} onChangeText={setEmail} mode="outlined" autoCapitalize="none" style={styles.input} />
              <TextInput label="Teléfono (opcional)" value={phone} onChangeText={setPhone} mode="outlined" style={styles.input} />

              <Divider style={{ marginVertical: 10 }} />

              <Paragraph style={{ marginBottom: 6, opacity: 0.75 }}>Rol</Paragraph>
              <View style={styles.roleGrid}>
                {ROLE_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.key}
                    selected={role === opt.key}
                    onPress={() => {
                      setRole(opt.key);
                      if (!requiresClinic(opt.key)) setClinicId(null);
                    }}
                    style={styles.roleChip}
                  >
                    {opt.label}
                  </Chip>
                ))}
              </View>

              {requiresClinic(role) && (
                <>
                  <Paragraph style={{ marginTop: 12, marginBottom: 6, opacity: 0.75 }}>
                    Clínica asignada
                  </Paragraph>
                  <View style={styles.roleGrid}>
                    {clinics.filter((c) => !!c.is_active).map((c) => (
                      <Chip
                        key={c.id}
                        selected={clinicId === c.id}
                        onPress={() => setClinicId(c.id)}
                        style={styles.roleChip}
                      >
                        {c.name}
                      </Chip>
                    ))}
                  </View>

                  {clinics.length === 0 && (
                    <HelperText type="info" visible={true}>
                      No hay clínicas activas disponibles para asignar.
                    </HelperText>
                  )}
                </>
              )}

              <TextInput
                label={editing ? "Nueva contraseña (opcional)" : "Contraseña"}
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry
                style={[styles.input, { marginTop: 12 }]}
              />

              <HelperText type="error" visible={!!formError}>
                {formError}
              </HelperText>

              <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                <Button mode="contained" onPress={saveUser} style={{ flex: 1 }}>
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

        {/* LISTA */}
        {filtered.map((u) => {
          const r = u.role || (Array.isArray(u.roles) && u.roles[0]?.name) || "cliente";
          const active = u.is_active ?? u.active ?? true;

          const assignedClinic =
            clinics.find((c) => c.id === (u.clinic_id ?? u.clinicId))?.name ||
            u.clinic?.name ||
            null;

          return (
            <Card key={u.id} style={styles.card}>
              <Card.Content>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Title style={styles.userName}>{u.name || "—"}</Title>
                    <Paragraph style={styles.detail}>{u.email || "—"}</Paragraph>
                    {!!u.phone && <Paragraph style={styles.detail}>{u.phone}</Paragraph>}

                    <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                      <Chip icon="account" style={styles.smallChip}>{roleLabel(r)}</Chip>
                      {assignedClinic && <Chip icon="domain" style={styles.smallChip}>{assignedClinic}</Chip>}
                    </View>
                  </View>

                  <View style={{ alignItems: "flex-end", justifyContent: "center" }}>
                    <Chip icon={active ? "check" : "close"} style={{ marginBottom: 8 }}>
                      {active ? "Activo" : "Inactivo"}
                    </Chip>
                    <Switch value={!!active} onValueChange={() => toggleUser(u)} />
                  </View>
                </View>

                <Button mode="text" onPress={() => openEdit(u)} style={{ marginTop: 6 }}>
                  Editar
                </Button>
              </Card.Content>
            </Card>
          );
        })}

        {!loading && filtered.length === 0 && (
          <Paragraph style={{ textAlign: "center", opacity: 0.7, marginTop: 18 }}>
            No hay usuarios que coincidan con el filtro/búsqueda.
          </Paragraph>
        )}
      </ScrollView>

      <FAB
        icon={openForm ? "close" : "plus"} // ✅ cambia icono
        style={styles.fab}
        onPress={onFabPress}               // ✅ toggle
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginTop: 16, marginBottom: 10 },
  topRow: { flexDirection: "row", gap: 10, alignItems: "center", paddingHorizontal: 16, marginBottom: 10, flexWrap: "wrap" },
  chip: { borderRadius: 999 },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  card: { marginHorizontal: 16, marginVertical: 8, borderRadius: 16, elevation: 3 },
  formCard: { marginHorizontal: 16, marginVertical: 10, borderRadius: 16, elevation: 5 },
  input: { marginBottom: 12 },
  row: { flexDirection: "row", gap: 12 },
  userName: { fontSize: 18 },
  detail: { opacity: 0.75 },
  roleGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  roleChip: { borderRadius: 999 },
  smallChip: { borderRadius: 999 },
  fab: { position: "absolute", right: 16, bottom: 16 },
});
