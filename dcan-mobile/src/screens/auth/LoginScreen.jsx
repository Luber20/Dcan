import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { TextInput, Button, Title, Card, Paragraph, HelperText } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { useRoute } from "@react-navigation/native";

export default function LoginScreen({ navigation }) {
  const route = useRoute();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Estado para errores visuales (texto rojo debajo del input)
  const [emailError, setEmailError] = useState("");

  const { login, logout } = useAuth();

  // ✅ Si vienes desde "Agendar" (solo si trae id)
  const selectedClinic = route.params?.selectedClinic?.id ? route.params.selectedClinic : null;

  // Validación de formato de email
  const validateEmail = (text) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (text.length > 0 && !emailRegex.test(text)) {
        setEmailError("Correo electrónico inválido");
    } else {
        setEmailError("");
    }
  };

  const handleLogin = async () => {
    // 1. Validaciones previas
    if (!email.trim() || !password.trim()) {
      Alert.alert("Campos Vacíos", "Por favor ingresa tu email y contraseña.");
      return;
    }

    if (emailError) {
        Alert.alert("Email Incorrecto", "Por favor corrige el formato del correo.");
        return;
    }

    setLoading(true);
    
    // 2. Intento de Login
    try {
        const result = await login(email.trim().toLowerCase(), password);
        setLoading(false);

        if (!result.success) {
          Alert.alert("Error de Acceso", result.message || "Credenciales incorrectas. Verifica tu contraseña.");
          return;
        }

        const user = result.user;
        const roles = Array.isArray(user?.roles) ? user.roles : [];
        const roleNames = roles
          .map((r) => (typeof r === "string" ? r : r?.name))
          .filter(Boolean)
          .map((r) => String(r).toLowerCase().trim());

        const isSuperAdmin = roleNames.includes("superadmin") || roleNames.includes("super_admin");
        const isClinicAdmin = roleNames.includes("clinic_admin") || roleNames.includes("admin");
        const isVet = roleNames.includes("veterinario") || roleNames.includes("veterinarian");

        // ✅ Solo restringimos si es cuenta interna (admin/vet). Client queda libre.
        if (selectedClinic && !isSuperAdmin && (isClinicAdmin || isVet)) {
          const userClinicId = Number(user?.clinic_id);
          const targetClinicId = Number(selectedClinic?.id);

          // ✅ Si por error un admin/vet no tiene clinic_id, también bloquea
          if (!userClinicId || userClinicId !== targetClinicId) {
            await logout();
            Alert.alert(
              "Acceso Restringido 🚫",
              `Tus credenciales pertenecen a otra veterinaria.\nNo puedes entrar a "${selectedClinic.name}" con esta cuenta.`
            );
            return;
          }
        }
        
        // App.js manejará la navegación al detectar el usuario

    } catch (error) {
        setLoading(false);
        Alert.alert("Error de Conexión", "No se pudo conectar al servidor. Revisa tu internet.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Image
          source={require("../../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Title style={styles.title}>D’CAN</Title>
        <Paragraph style={styles.subtitle}>Veterinaria de confianza</Paragraph>

        {selectedClinic ? (
          <View style={styles.clinicBadge}>
            <Paragraph style={{ color: "#155724", textAlign: "center" }}>
              Ingresando a:{" "}
              <Paragraph style={{ fontWeight: "bold", color: "#155724" }}>
                {selectedClinic.name}
              </Paragraph>
            </Paragraph>
          </View>
        ) : (
          <Paragraph style={{ color: "#666", marginBottom: 10, fontStyle: "italic" }}>
            Acceso General
          </Paragraph>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Email"
              value={email}
              onChangeText={validateEmail}
              mode="outlined"
              style={styles.input}
              theme={{ roundness: 12 }}
              left={<TextInput.Icon icon="email-outline" />}
              autoCapitalize="none"
              keyboardType="email-address"
              error={!!emailError}
            />
            {emailError ? <HelperText type="error">{emailError}</HelperText> : null}

            <TextInput
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              mode="outlined"
              style={styles.input}
              theme={{ roundness: 12 }}
              left={<TextInput.Icon icon="lock-outline" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading} // Bloquea doble clic
              style={styles.button}
              contentStyle={styles.buttonContent}
              theme={{ roundness: 12 }}
              buttonColor="#2E8B57"
            >
              Iniciar Sesión
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate("Register", { selectedClinic })}
              style={styles.link}
              textColor="#2E8B57"
            >
              ¿No tienes cuenta? Registrarse
            </Button>

            {/* ✅ NUEVO BOTÓN: Registrar clínica */}
            <Button
              mode="outlined"
              onPress={() => navigation.navigate("ClinicRequest")}
              style={styles.linkOutline}
              textColor="#2E8B57"
            >
              Registrar clínica
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
    backgroundColor: "#d4edda",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#c3e6cb",
  },
  card: { width: "100%", borderRadius: 20, elevation: 5, backgroundColor: "#fff" },
  input: { marginBottom: 5, backgroundColor: "#fff" }, // Reduje margen porque ahora hay HelperText
  button: { marginTop: 15 },
  buttonContent: { height: 50 },
  link: { marginTop: 15 },

  // ✅ estilo opcional para el botón outlined
  linkOutline: { marginTop: 10, borderColor: "#2E8B57" },
});