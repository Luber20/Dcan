import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Avatar, Title, Text, List, Divider, Switch, Button, Portal, Modal, TextInput } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [isNotifEnabled, setIsNotifEnabled] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const handleChangePassword = () => {
    // Aquí conectaremos con Axios más adelante
    Alert.alert("Seguridad", "Solicitud de cambio enviada al servidor.");
    setIsModalVisible(false);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      {/* HEADER CON CONTRASTE MEJORADO */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.avatarContainer}>
          <Avatar.Text
            size={90}
            label={user?.name?.charAt(0).toUpperCase() || "U"}
            style={{ backgroundColor: "#fff" }}
            labelStyle={{ color: theme.colors.primary, fontWeight: 'bold' }}
          />
        </View>
        {/* Usamos colores claros explícitos para el fondo verde */}
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
            onPress={() => Alert.alert("Editar Perfil", "Próximamente: Podrás cambiar tu nombre y foto.")}
          />
          <Divider />
          <List.Item
            title="Cambiar Contraseña"
            titleStyle={{ color: theme.colors.text }}
            left={props => <List.Icon {...props} icon="lock-outline" color={theme.colors.primary} />}
            onPress={() => setIsModalVisible(true)}
          />
        </List.Section>

        {/* SECCIÓN PREFERENCIAS */}
        <List.Section>
          <List.Subheader style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Preferencias</List.Subheader>
          <List.Item
            title="Modo Oscuro"
            titleStyle={{ color: theme.colors.text }}
            left={props => <List.Icon {...props} icon="theme-light-dark" color={theme.colors.primary} />}
            right={() => (
              <Switch value={theme.isDarkMode} onValueChange={toggleTheme} color={theme.colors.primary} />
            )}
          />
          <Divider />
          <List.Item
            title="Notificaciones de Citas"
            titleStyle={{ color: theme.colors.text }}
            description="Avisar 30 min antes de mi cita"
            descriptionStyle={{ color: theme.colors.subtitle }}
            left={props => <List.Icon {...props} icon="bell-outline" color={theme.colors.primary} />}
            right={() => (
              <Switch value={isNotifEnabled} onValueChange={setIsNotifEnabled} color={theme.colors.primary} />
            )}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Item
            title="Ayuda y Soporte"
            titleStyle={{ color: theme.colors.text }}
            left={props => <List.Icon {...props} icon="help-circle-outline" color={theme.colors.primary} />}
            onPress={() => {}}
          />
        </List.Section>

        <Text style={styles.versionText}>v 1.0.2 - Clínica Veterinaria D’CAN</Text>
      </View>

      {/* MODAL DE CAMBIO DE CONTRASEÑA */}
      <Portal>
        <Modal 
          visible={isModalVisible} 
          onDismiss={() => setIsModalVisible(false)} 
          contentContainerStyle={[styles.modalStyle, {backgroundColor: theme.colors.card}]}
        >
          <Title style={{color: theme.colors.text, marginBottom: 15}}>Cambiar Contraseña</Title>
          <TextInput label="Contraseña Actual" secureTextEntry mode="outlined" style={styles.modalInput} theme={{colors:{primary: theme.colors.primary}}} />
          <TextInput label="Nueva Contraseña" secureTextEntry mode="outlined" style={styles.modalInput} theme={{colors:{primary: theme.colors.primary}}} />
          <Button 
            mode="contained" 
            onPress={handleChangePassword} 
            style={{marginTop: 10, backgroundColor: theme.colors.primary}}
          >
            Guardar Cambios
          </Button>
          <Button onPress={() => setIsModalVisible(false)} textColor={theme.colors.primary}>Cancelar</Button>
        </Modal>
      </Portal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingVertical: 45,
    alignItems: "center",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    elevation: 5,
  },
  avatarContainer: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 3,
    elevation: 10,
  },
  userName: { fontSize: 26, fontWeight: "bold", marginTop: 15 },
  userEmail: { fontSize: 16, opacity: 0.9 },
  badge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 15,
  },
  badgeText: { color: "#ffffff", fontSize: 12, fontWeight: "bold", letterSpacing: 1 },
  content: { padding: 10 },
  versionText: { textAlign: "center", color: "#888", fontSize: 12, marginTop: 30, marginBottom: 20 },
  modalStyle: { padding: 25, margin: 20, borderRadius: 20 },
  modalInput: { marginBottom: 12 }
});