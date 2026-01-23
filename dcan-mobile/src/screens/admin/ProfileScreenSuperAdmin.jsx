import React, { useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, Alert, SafeAreaView, Platform, StatusBar } from "react-native";
import { Card, Title, Paragraph, TextInput, Button, Switch, Divider, Avatar, Text } from "react-native-paper";
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

  // ✅ 1. GUARDAR PERFIL
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
      await loadToken(); 
    } catch (e) {
      console.log(e.response?.data);
      Alert.alert("Error", e.response?.data?.message || "No se pudo actualizar.");
    } finally {
      setSavingProfile(false);
    }
  };

  // ✅ 2. CAMBIAR CONTRASEÑA
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* HEADER CON AVATAR */}
        <View style={styles.headerContainer}>
            <View style={{flexDirection:'row', alignItems:'center', marginBottom: 10}}>
                <Avatar.Icon size={60} icon="account-circle" style={{backgroundColor: theme.colors.primary}} />
                <View style={{marginLeft: 15}}>
                    <Title style={[styles.title, { color: theme.colors.primary }]}>Mi Perfil</Title>
                    <Paragraph style={{opacity:0.7}}>Administrador Global</Paragraph>
                </View>
            </View>
        </View>

        {/* Tarjeta Info General */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.rowBetween}>
                <View>
                    <Title style={{fontSize:18}}>{user?.name}</Title>
                    <Paragraph style={{ opacity: 0.7, fontSize:13 }}>{user?.email}</Paragraph>
                </View>
                <Switch value={isDark} onValueChange={toggleTheme} color={theme.colors.primary} />
            </View>
            <View style={{flexDirection:'row', alignItems:'center', justifyContent:'flex-end', marginTop:5}}>
                <Text style={{fontSize:10, color:'#888', marginRight:5}}>{isDark ? "Modo Oscuro" : "Modo Claro"}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Editar Datos */}
        <View style={styles.sectionContainer}>
            <Paragraph style={styles.sectionTitle}>INFORMACIÓN PERSONAL</Paragraph>
            <Card style={styles.card}>
            <Card.Content>
                <TextInput label="Nombre" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
                <TextInput label="Correo" value={email} onChangeText={setEmail} mode="outlined" style={styles.input} autoCapitalize="none" />
                <TextInput label="Teléfono" value={phone} onChangeText={setPhone} mode="outlined" style={styles.input} keyboardType="phone-pad" />
                
                <Button 
                    mode="contained" 
                    onPress={saveProfile} 
                    loading={savingProfile} 
                    disabled={savingProfile}
                    style={styles.button}
                    contentStyle={{height: 50}}
                >
                Guardar Cambios
                </Button>
            </Card.Content>
            </Card>
        </View>

        {/* Cambiar Contraseña */}
        <View style={styles.sectionContainer}>
            <Paragraph style={styles.sectionTitle}>SEGURIDAD</Paragraph>
            <Card style={styles.card}>
            <Card.Content>
                <TextInput label="Contraseña Actual" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry mode="outlined" style={styles.input} />
                <TextInput label="Nueva Contraseña" value={newPassword} onChangeText={setNewPassword} secureTextEntry mode="outlined" style={styles.input} />
                <TextInput label="Confirmar Nueva" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry mode="outlined" style={styles.input} />

                <Button 
                    mode="contained" 
                    onPress={changePassword} 
                    loading={savingPass} 
                    disabled={savingPass} 
                    buttonColor="#555"
                    style={styles.button}
                    contentStyle={{height: 50}}
                >
                Cambiar Contraseña
                </Button>
            </Card.Content>
            </Card>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
            <Button 
                mode="outlined" 
                onPress={logout} 
                textColor="#D32F2F" 
                icon="logout" 
                style={{borderColor: '#D32F2F', borderRadius: 12, borderWidth: 1}}
                contentStyle={{height: 48}}
            >
                Cerrar Sesión
            </Button>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
      flex: 1, 
      // Ajuste para bajar el contenido de la barra de estado
      paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 0 
  },
  headerContainer: {
      paddingHorizontal: 20,
      marginTop: 10,
      marginBottom: 5
  },
  title: { fontSize: 28, fontWeight: "bold" },
  
  sectionContainer: { marginTop: 20 },
  sectionTitle: { marginLeft: 20, marginBottom: 5, fontSize: 12, fontWeight: 'bold', color: '#666' },

  card: { marginHorizontal: 16, borderRadius: 16, elevation: 3, backgroundColor: 'white', marginBottom: 5 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  
  input: { marginBottom: 12, backgroundColor: 'white' },
  button: { marginTop: 5, borderRadius: 12 }
});