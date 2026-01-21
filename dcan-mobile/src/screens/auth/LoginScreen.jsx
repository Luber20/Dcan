import React, { useState } from "react";
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { TextInput, Button, Title, Card, Paragraph } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { useRoute } from "@react-navigation/native";

export default function LoginScreen({ navigation }) {
  const route = useRoute();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login, logout } = useAuth(); 

  // Obtenemos la clínica si venimos desde "Agendar"
  const selectedClinic = route.params?.selectedClinic || null;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Atención", "Por favor ingresa email y contraseña");
      return;
    }

    setLoading(true);
    const result = await login(email.trim().toLowerCase(), password);
    setLoading(false);

    if (result.success) {
      const user = result.user;
      const roles = user.roles || [];
      
      // --- 1. DETECCIÓN DE ROLES ---
      const isSuperAdmin = roles.some(r => r.name === 'superadmin' || r.name === 'super_admin');
      const isClinicAdmin = roles.some(r => r.name === 'admin' || r.name === 'clinic_admin');
      const isVet = roles.some(r => r.name === 'veterinario' || r.name === 'veterinarian');
      
      // --- 2. VALIDACIÓN DE SEGURIDAD ---
      // Si hay clínica seleccionada Y NO es SuperAdmin, verificamos pertenencia
      if (selectedClinic && !isSuperAdmin) {
          const userClinicId = Number(user.clinic_id); 
          const targetClinicId = Number(selectedClinic.id);

          if (userClinicId !== targetClinicId) {
              await logout(); 
              Alert.alert(
                  "Acceso Restringido 🚫", 
                  `Tus credenciales pertenecen a otra veterinaria.\nNo puedes entrar a "${selectedClinic.name}" con esta cuenta.`
              );
              return; 
          }
      }
      
      // --- 3. REDIRECCIÓN AUTOMÁTICA (LO QUE FALTABA) ---
      // Esto es lo que hace que entres de una vez a la pantalla correcta
      if (selectedClinic) {
          setTimeout(() => {
              try {
                  let targetRoute = 'ClientDashboard'; // Por defecto
                  let targetParams = { screen: "Citas", params: { screen: "Agendar" } };

                  if (isSuperAdmin) {
                      targetRoute = 'SuperAdminDashboard';
                      targetParams = undefined;
                  } else if (isClinicAdmin) {
                      targetRoute = 'AdminDashboard';
                      targetParams = undefined;
                  } else if (isVet) {
                      targetRoute = 'VetDashboard';
                      targetParams = undefined;
                  }

                  // ¡Navegación forzada para no quedarse en la pantalla anterior!
                  navigation.reset({
                      index: 0,
                      routes: [{ 
                          name: targetRoute,
                          params: targetParams
                      }],
                  });
              } catch (e) {
                  console.log("Error navegando:", e);
                  // Si falla, intentamos navegación simple
                  navigation.navigate("ClientDashboard");
              }
          }, 100);
      }

    } else {
      Alert.alert("Error", result.message || "Credenciales incorrectas.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Image source={require("../../../assets/logo.png")} style={styles.logo} resizeMode="contain" />

        <Title style={styles.title}>D’CAN</Title>
        <Paragraph style={styles.subtitle}>Veterinaria de confianza</Paragraph>

        {selectedClinic ? (
            <View style={styles.clinicBadge}>
                <Paragraph style={{color: '#155724', textAlign: 'center'}}>
                    Ingresando a: <Paragraph style={{fontWeight: 'bold', color: '#155724'}}>{selectedClinic.name}</Paragraph>
                </Paragraph>
            </View>
        ) : (
            <Paragraph style={{color: '#666', marginBottom: 10, fontStyle:'italic'}}>Acceso General</Paragraph>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              theme={{ roundness: 12 }}
              left={<TextInput.Icon icon="email-outline" />}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword} 
              mode="outlined"
              style={styles.input}
              theme={{ roundness: 12 }}
              left={<TextInput.Icon icon="lock-outline" />}
              right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
              theme={{ roundness: 12 }}
              buttonColor="#2E8B57"
            >
              Iniciar Sesión
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate("Register", { selectedClinic: selectedClinic })}
              style={styles.link}
              textColor="#2E8B57"
            >
              ¿No tienes cuenta? Registrarse
            </Button>
          </Card.Content>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E8F5E8" },
  inner: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  logo: { width: 120, height: 120, marginBottom: 10 },
  title: { fontSize: 36, fontWeight: "bold", color: "#2E8B57", marginBottom: 5 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 10, textAlign: "center" },
  clinicBadge: {
      backgroundColor: '#d4edda',
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: '#c3e6cb'
  },
  card: { width: "100%", borderRadius: 20, elevation: 5, backgroundColor: "#fff" },
  input: { marginBottom: 16, backgroundColor: "#fff" },
  button: { marginTop: 10 },
  buttonContent: { height: 50 },
  link: { marginTop: 15 }
});