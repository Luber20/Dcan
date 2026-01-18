import React, { useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Card, Title, Paragraph, TextInput, Button, Switch, Divider, HelperText } from "react-native-paper";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { API_URL } from "../../config/api";

export default function ProfileScreenSuperAdmin() {
  const { user, token, logout, loadToken } = useAuth();
  const { theme, toggleTheme } = useTheme(); 
  const isDark = !!theme?.isDarkMode;

  const headers = useMemo(() => ({
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
  }), [token]);

  // Datos Perfil
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || ""); 
  const [phone, setPhone] = useState(user?.phone || ""); 
  const [savingProfile, setSavingProfile] = useState(false);

  // Datos Contraseña
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPass, setSavingPass] = useState(false);

  // ✅ 1. GUARDAR PERFIL (Usa PUT /profile/update)
  const saveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Error", "Nombre y correo son obligatorios.");
      return;
    }

    setSavingProfile(true);
    try {
      await axios.put(`${API_URL}/profile/update`, { 
          name, 
          email, 
          phone 
      }, { headers });

      Alert.alert("Éxito", "Perfil actualizado.");
      await loadToken(); // Recargar datos en la app
    } catch (e) {
      console.log(e.response?.data);
      Alert.alert("Error", e.response?.data?.message || "No se pudo actualizar.");
    } finally {
      setSavingProfile(false);
    }
  };

  // ✅ 2. CAMBIAR CONTRASEÑA (Usa POST /profile/change-password)
  const changePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert("Error", "Completa todos los campos.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
        Alert.alert("Error", "Las contraseñas nuevas no coinciden.");
        return;
    }

    setSavingPass(true);
    try {
      // Importante: Enviamos new_password_confirmation para que Laravel no de error
      await axios.post(`${API_URL}/profile/change-password`,
        {
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword 
        },
        { headers }
      );

      Alert.alert("Éxito", "Contraseña cambiada correctamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      const msg = e.response?.data?.message || "Error al cambiar contraseña.";
      Alert.alert("Error", msg);
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Title style={[styles.title, { color: theme.colors.primary }]}>Mi Perfil</Title>

        {/* Tarjeta Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>{user?.name}</Title>
            <Paragraph style={{ opacity: 0.7 }}>{user?.email}</Paragraph>
            <Divider style={{ marginVertical: 12 }} />
            <View style={styles.rowBetween}>
              <Paragraph>Modo Oscuro</Paragraph>
              <Switch value={isDark} onValueChange={toggleTheme} />
            </View>
          </Card.Content>
        </Card>

        {/* Editar Datos */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={{ marginBottom: 10 }}>Editar Información</Title>
            <TextInput label="Nombre" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
            <TextInput label="Correo" value={email} onChangeText={setEmail} mode="outlined" style={styles.input} autoCapitalize="none" />
            <TextInput label="Teléfono" value={phone} onChangeText={setPhone} mode="outlined" style={styles.input} keyboardType="phone-pad" />
            
            <Button mode="contained" onPress={saveProfile} loading={savingProfile} disabled={savingProfile}>
              Guardar Cambios
            </Button>
          </Card.Content>
        </Card>

        {/* Cambiar Contraseña */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={{ marginBottom: 10 }}>Seguridad</Title>
            <TextInput label="Contraseña Actual" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry mode="outlined" style={styles.input} />
            <TextInput label="Nueva Contraseña" value={newPassword} onChangeText={setNewPassword} secureTextEntry mode="outlined" style={styles.input} />
            <TextInput label="Confirmar Nueva" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry mode="outlined" style={styles.input} />

            <Button mode="contained" onPress={changePassword} loading={savingPass} disabled={savingPass} buttonColor="#555">
              Cambiar Contraseña
            </Button>
          </Card.Content>
        </Card>

        <View style={{ paddingHorizontal: 16 }}>
            <Button mode="contained" onPress={logout} buttonColor="#D32F2F" icon="logout" style={{ marginTop: 10 }}>
                Cerrar Sesión
            </Button>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginTop: 20, marginBottom: 10 },
  card: { marginHorizontal: 16, marginVertical: 8, borderRadius: 12, elevation: 2, backgroundColor: 'white' },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  input: { marginBottom: 10, backgroundColor: 'white', height: 45 },
});