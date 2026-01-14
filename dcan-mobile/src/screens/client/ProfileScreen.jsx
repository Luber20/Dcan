import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Avatar, Title, Text, List, Divider, Switch, Button, Portal, Modal, TextInput } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import axios from "axios";
import { API_URL } from "../../config/api";

export default function ProfileScreen() {
  const { user, updateUserData } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // Estados para UI y Carga
  const [isNotifEnabled, setIsNotifEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  // Estados para Modal de Contraseña
  const [isPassModalVisible, setIsPassModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Estados para visibilidad de contraseña (ojitos)
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Estados para Modal de Editar Perfil
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [newEmail, setNewEmail] = useState(user?.email || "");

  // --- LÓGICA: CAMBIAR CONTRASEÑA ---
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      return Alert.alert("Error", "Por favor, completa todos los campos correctamente.");
    }

    if (newPassword.length < 8) {
      return Alert.alert("Error", "La nueva contraseña debe tener al menos 8 caracteres.");
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/profile/change-password`, {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      Alert.alert("Éxito", "Tu contraseña ha sido actualizada correctamente.");
      setIsPassModalVisible(false);
      // Limpiar estados
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setShowCurrentPass(false); setShowNewPass(false); setShowConfirmPass(false);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "No se pudo actualizar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA: ACTUALIZAR PERFIL ---
  const handleUpdateProfile = async () => {
    if (!newName.trim() || !newEmail.trim()) return;

    setLoading(true);
    try {
      const response = await axios.put(`${API_URL}/profile/update`, {
        name: newName,
        email: newEmail,
      });

      updateUserData(response.data.user);
      Alert.alert("Éxito", "Perfil actualizado correctamente.");
      setIsEditModalVisible(false);
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.avatarContainer}>
          <Avatar.Text
            size={90}
            label={user?.name?.charAt(0).toUpperCase() || "U"}
            style={{ backgroundColor: "#fff" }}
            labelStyle={{ color: theme.colors.primary, fontWeight: 'bold' }}
          />
        </View>
        <Title style={[styles.userName, { color: '#ffffff' }]}>{user?.name || "Usuario"}</Title>
        <Text style={[styles.userEmail, { color: '#E8F5E8' }]}>{user?.email}</Text>
        
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            ROL: {user?.roles?.[0]?.name?.toUpperCase() || "CLIENTE"}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        
        {/* SECCIÓN CUENTA */}
        <List.Section>
          <List.Subheader style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Cuenta y Seguridad</List.Subheader>
          <List.Item
            title="Editar Perfil"
            titleStyle={{ color: theme.colors.text }}
            left={props => <List.Icon {...props} icon="account-edit-outline" color={theme.colors.primary} />}
            onPress={() => setIsEditModalVisible(true)}
          />
          <Divider />
          <List.Item
            title="Cambiar Contraseña"
            titleStyle={{ color: theme.colors.text }}
            left={props => <List.Icon {...props} icon="lock-outline" color={theme.colors.primary} />}
            onPress={() => setIsPassModalVisible(true)}
          />
        </List.Section>

        {/* SECCIÓN PREFERENCIAS */}
        <List.Section>
          <List.Subheader style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Preferencias</List.Subheader>
          <List.Item
            title="Modo Oscuro"
            titleStyle={{ color: theme.colors.text }}
            right={() => <Switch value={theme.isDarkMode} onValueChange={toggleTheme} color={theme.colors.primary} />}
            left={props => <List.Icon {...props} icon="theme-light-dark" color={theme.colors.primary} />}
          />
          <Divider />
          <List.Item
            title="Notificaciones de Citas"
            titleStyle={{ color: theme.colors.text }}
            description="Avisar 30 min antes de mi cita"
            right={() => <Switch value={isNotifEnabled} onValueChange={setIsNotifEnabled} color={theme.colors.primary} />}
            left={props => <List.Icon {...props} icon="bell-outline" color={theme.colors.primary} />}
          />
        </List.Section>

        <Text style={styles.versionText}>v 1.0.2 - Clínica Veterinaria D’CAN</Text>
      </View>

      {/* MODAL: CAMBIAR CONTRASEÑA */}
      <Portal>
        <Modal 
          visible={isPassModalVisible} 
          onDismiss={() => !loading && setIsPassModalVisible(false)} 
          contentContainerStyle={[styles.modalStyle, {backgroundColor: theme.colors.card}]}
        >
          <Title style={{color: theme.colors.text, marginBottom: 15}}>Seguridad</Title>
          
          <TextInput 
            label="Contraseña Actual" 
            value={currentPassword} 
            onChangeText={setCurrentPassword} 
            secureTextEntry={!showCurrentPass} 
            mode="outlined" 
            style={styles.modalInput}
            right={<TextInput.Icon icon={showCurrentPass ? "eye-off" : "eye"} onPress={() => setShowCurrentPass(!showCurrentPass)} />}
          />
          
          <TextInput 
            label="Nueva Contraseña" 
            value={newPassword} 
            onChangeText={setNewPassword} 
            secureTextEntry={!showNewPass} 
            mode="outlined" 
            style={styles.modalInput}
            right={<TextInput.Icon icon={showNewPass ? "eye-off" : "eye"} onPress={() => setShowNewPass(!showNewPass)} />}
          />
          
          <TextInput 
            label="Confirmar Nueva" 
            value={confirmPassword} 
            onChangeText={setConfirmPassword} 
            secureTextEntry={!showConfirmPass} 
            mode="outlined" 
            style={styles.modalInput}
            right={<TextInput.Icon icon={showConfirmPass ? "eye-off" : "eye"} onPress={() => setShowConfirmPass(!showConfirmPass)} />}
          />
          
          <Button 
            mode="contained" 
            onPress={handleChangePassword} 
            loading={loading} 
            disabled={loading} 
            style={{marginTop: 10, backgroundColor: theme.colors.primary}}
          >
            Actualizar Contraseña
          </Button>
          <Button onPress={() => setIsPassModalVisible(false)} disabled={loading} textColor={theme.colors.primary}>Cancelar</Button>
        </Modal>

        {/* MODAL: EDITAR PERFIL */}
        <Modal 
          visible={isEditModalVisible} 
          onDismiss={() => !loading && setIsEditModalVisible(false)} 
          contentContainerStyle={[styles.modalStyle, {backgroundColor: theme.colors.card}]}
        >
          <Title style={{color: theme.colors.text, marginBottom: 15}}>Editar Perfil</Title>
          <TextInput label="Nombre" value={newName} onChangeText={setNewName} mode="outlined" style={styles.modalInput} />
          <TextInput label="Email" value={newEmail} onChangeText={setNewEmail} keyboardType="email-address" mode="outlined" style={styles.modalInput} />
          
          <Button mode="contained" onPress={handleUpdateProfile} loading={loading} disabled={loading} style={{marginTop: 10, backgroundColor: theme.colors.primary}}>
            Guardar Cambios
          </Button>
          <Button onPress={() => setIsEditModalVisible(false)} disabled={loading} textColor={theme.colors.primary}>Cancelar</Button>
        </Modal>
      </Portal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingVertical: 45, alignItems: "center", borderBottomLeftRadius: 40, borderBottomRightRadius: 40, elevation: 5 },
  avatarContainer: { backgroundColor: '#fff', borderRadius: 50, padding: 3, elevation: 10 },
  userName: { fontSize: 26, fontWeight: "bold", marginTop: 15 },
  userEmail: { fontSize: 16, opacity: 0.9 },
  badge: { backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 20, paddingVertical: 6, borderRadius: 20, marginTop: 15 },
  badgeText: { color: "#ffffff", fontSize: 12, fontWeight: "bold", letterSpacing: 1 },
  content: { padding: 10 },
  versionText: { textAlign: "center", color: "#888", fontSize: 12, marginTop: 30, marginBottom: 20 },
  modalStyle: { padding: 25, margin: 20, borderRadius: 20 },
  modalInput: { marginBottom: 12 }
});