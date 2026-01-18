import React, { useMemo, useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Card, Title, Paragraph, TextInput, Button, Switch, Divider } from "react-native-paper";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { API_URL } from "../../config/api";

export default function AdminProfileScreen() {
  const { user, token, logout, updateUser } = useAuth(); // ✅ Usamos updateUser
  const { theme, toggleTheme } = useTheme();
  const isDark = !!theme?.isDarkMode;

  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  }), [token]);

  // Estados locales para el formulario
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPass, setSavingPass] = useState(false);

  // Cargar datos iniciales cuando el componente se monta o el usuario cambia
  useEffect(() => {
    if (user) {
        setName(user.name || "");
        setEmail(user.email || "");
        setPhone(user.phone || "");
    }
  }, [user]);

  const saveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Error", "Nombre y correo son obligatorios.");
      return;
    }
    setSavingProfile(true);
    try {
      const res = await axios.put(`${API_URL}/profile/update`, { 
        name, email, phone 
      }, { headers });
      
      // ✅ MAGIA AQUÍ: Actualizamos el contexto inmediatamente con la respuesta del servidor
      // El backend debe devolver el objeto 'user' actualizado
      if (res.data.user) {
          updateUser(res.data.user);
      }
      
      Alert.alert("Éxito", "Perfil actualizado correctamente.");
    } catch (e) {
      Alert.alert("Error", e.response?.data?.message || "No se pudo actualizar.");
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert("Error", "Completa los campos de contraseña.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las nuevas contraseñas no coinciden.");
      return;
    }

    setSavingPass(true);
    try {
      await axios.post(`${API_URL}/profile/change-password`, {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword
      }, { headers });

      Alert.alert("Éxito", "Contraseña cambiada.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      Alert.alert("Error", e.response?.data?.message || "Contraseña actual incorrecta.");
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Title style={[styles.title, { color: theme.colors.primary }]}>Mi Perfil</Title>

        <Card style={styles.card}>
          <Card.Content>
            {/* Estos datos ahora se actualizarán solos gracias a updateUser */}
            <Title>{user?.name}</Title>
            <Paragraph style={{ opacity: 0.7 }}>{user?.email}</Paragraph>
            <Paragraph style={{ color: '#2E8B57', fontWeight: 'bold' }}>
                {user?.roles?.[0]?.name || "Usuario"}
            </Paragraph>
            
            <Divider style={{ marginVertical: 12 }} />
            <View style={styles.rowBetween}>
              <Paragraph>Modo Oscuro</Paragraph>
              <Switch value={isDark} onValueChange={toggleTheme} />
            </View>
          </Card.Content>
        </Card>

        {/* Formulario Editar */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={{ marginBottom: 10 }}>Mis Datos</Title>
            <TextInput label="Nombre" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
            <TextInput label="Correo" value={email} onChangeText={setEmail} mode="outlined" autoCapitalize="none" style={styles.input} />
            <TextInput label="Teléfono" value={phone} onChangeText={setPhone} mode="outlined" keyboardType="phone-pad" style={styles.input} />
            
            <Button mode="contained" onPress={saveProfile} loading={savingProfile} disabled={savingProfile}>
              Actualizar Datos
            </Button>
          </Card.Content>
        </Card>

        {/* Formulario Password */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={{ marginBottom: 10 }}>Cambiar Contraseña</Title>
            <TextInput label="Actual" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry mode="outlined" style={styles.input} />
            <TextInput label="Nueva" value={newPassword} onChangeText={setNewPassword} secureTextEntry mode="outlined" style={styles.input} />
            <TextInput label="Confirmar Nueva" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry mode="outlined" style={styles.input} />
            
            <Button mode="outlined" onPress={changePassword} loading={savingPass} disabled={savingPass}>
              Actualizar Contraseña
            </Button>
          </Card.Content>
        </Card>

        <View style={{ padding: 16 }}>
          <Button mode="contained" buttonColor="#D32F2F" icon="logout" onPress={logout}>
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
  card: { marginHorizontal: 16, marginVertical: 8, borderRadius: 12, elevation: 2, backgroundColor: "white" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  input: { marginBottom: 10, backgroundColor: "white", height: 45 },
});