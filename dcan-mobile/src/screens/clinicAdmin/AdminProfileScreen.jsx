import React, { useMemo, useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert, SafeAreaView, Platform, StatusBar } from "react-native";
import { Card, Title, Paragraph, TextInput, Button, Switch, Divider, Avatar } from "react-native-paper";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { API_URL } from "../../config/api";

export default function AdminProfileScreen() {
  const { user, token, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = !!theme?.isDarkMode;

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}`, Accept: "application/json" }), [token]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    if (user) { setName(user.name || ""); setEmail(user.email || ""); setPhone(user.phone || ""); }
  }, [user]);

  const saveProfile = async () => {
    if (!name.trim() || !email.trim()) return Alert.alert("Error", "Nombre y correo obligatorios.");
    setSavingProfile(true);
    try {
      const res = await axios.put(`${API_URL}/profile/update`, { name, email, phone }, { headers });
      if (res.data.user) updateUser(res.data.user);
      Alert.alert("Éxito", "Perfil actualizado.");
    } catch (e) { Alert.alert("Error", "No se pudo actualizar."); } 
    finally { setSavingProfile(false); }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword) return Alert.alert("Error", "Completa los campos.");
    if (newPassword !== confirmPassword) return Alert.alert("Error", "No coinciden.");
    setSavingPass(true);
    try {
      await axios.post(`${API_URL}/profile/change-password`, { current_password: currentPassword, new_password: newPassword, new_password_confirmation: confirmPassword }, { headers });
      Alert.alert("Éxito", "Contraseña cambiada."); setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (e) { Alert.alert("Error", "Contraseña actual incorrecta."); } 
    finally { setSavingPass(false); }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 16 }}>
        
        <View style={{alignItems:'center', marginVertical: 20}}>
             <Avatar.Icon size={80} icon="account-circle" style={{backgroundColor: theme.colors.primary}} />
             <Title style={{marginTop: 10, fontSize: 24, fontWeight: 'bold'}}>Mi Perfil</Title>
             <Paragraph>Administrador</Paragraph>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.rowBetween}>
                <View>
                    <Title style={{fontSize:18}}>{user?.name}</Title>
                    <Paragraph style={{ opacity: 0.7 }}>{user?.email}</Paragraph>
                </View>
                <Switch value={isDark} onValueChange={toggleTheme} />
            </View>
            <Paragraph style={{ color: theme.colors.primary, fontWeight: 'bold', marginTop: 5 }}>
                Rol: {user?.roles?.[0]?.name || "Usuario"}
            </Paragraph>
          </Card.Content>
        </Card>

        <Title style={styles.sectionTitle}>Editar Información</Title>
        <Card style={styles.card}>
          <Card.Content>
            <TextInput label="Nombre" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
            <TextInput label="Correo" value={email} onChangeText={setEmail} mode="outlined" autoCapitalize="none" style={styles.input} />
            <TextInput label="Teléfono" value={phone} onChangeText={setPhone} mode="outlined" keyboardType="phone-pad" style={styles.input} />
            <Button mode="contained" onPress={saveProfile} loading={savingProfile} disabled={savingProfile} style={{marginTop:5}}>
              Actualizar Datos
            </Button>
          </Card.Content>
        </Card>

        <Title style={styles.sectionTitle}>Seguridad</Title>
        <Card style={styles.card}>
          <Card.Content>
            <TextInput label="Actual" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry mode="outlined" style={styles.input} />
            <TextInput label="Nueva" value={newPassword} onChangeText={setNewPassword} secureTextEntry mode="outlined" style={styles.input} />
            <TextInput label="Confirmar Nueva" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry mode="outlined" style={styles.input} />
            <Button mode="outlined" onPress={changePassword} loading={savingPass} disabled={savingPass} style={{marginTop:5}}>
              Cambiar Contraseña
            </Button>
          </Card.Content>
        </Card>

        <Button mode="contained" buttonColor="#D32F2F" icon="logout" onPress={logout} style={{ marginTop: 20 }}>
          Cerrar Sesión
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 0 },
  card: { marginBottom: 15, borderRadius: 12, elevation: 2, backgroundColor: "white" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  input: { marginBottom: 10, backgroundColor: "white", height: 45 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginTop: 10, marginLeft: 5, color: '#666' }
});