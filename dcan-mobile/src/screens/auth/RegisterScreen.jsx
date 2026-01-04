import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import {
  TextInput,
  Button,
  Title,
  Paragraph,
  Card,
  HelperText,
} from "react-native-paper";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";

export default function RegisterScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const selectedClinic = route.params?.selectedClinic || null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const API_URL = "http://192.168.100.55:8000/api";

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name.trim())) {
      newErrors.name = "El nombre solo puede contener letras y espacios";
    }

    if (!email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      newErrors.email = "Email inválido";
    }

    if (!password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (password.length < 8) {
      newErrors.password = "Mínimo 8 caracteres";
    } else if (!/(?=.*[A-Z])/.test(password)) {
      newErrors.password = "Debe tener al menos 1 mayúscula";
    } else if (!/(?=.*\d)/.test(password)) {
      newErrors.password = "Debe tener al menos 1 número";
    } else if (!/(?=.*[!@#$%^&*])/.test(password)) {
      newErrors.password = "Debe tener al menos 1 símbolo (!@#$%^&*)";
    }

    if (password !== passwordConfirmation) {
      newErrors.passwordConfirmation = "Las contraseñas no coinciden";
    }

    if (!selectedClinic) {
      newErrors.clinic = "Debes seleccionar una clínica";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post(`${API_URL}/register`, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        password_confirmation: passwordConfirmation,
        clinic_id: selectedClinic.id,
        role: "client",
      });

      alert("¡Registro exitoso! Bienvenido a D’CAN 🐾");
      // No navegamos manualmente → App.js lo hace automático
    } catch (err) {
      if (err.response?.status === 422) {
        const backendErrors = err.response.data.errors || {};
        setErrors({
          email: backendErrors.email?.[0] || "",
        });
      } else {
        setErrors({ general: "Error de conexión. Intenta de nuevo." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        {/* Logo más pequeño y más abajo */}
        <Image source={require("../../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
        <Title style={styles.title}>Crear Cuenta</Title>
        <Paragraph style={styles.subtitle}>
          Clínica seleccionada: {selectedClinic ? selectedClinic.name : "Ninguna"}
        </Paragraph>

        {errors.clinic && <HelperText type="error" visible={true}>{errors.clinic}</HelperText>}

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Nombre completo"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              error={!!errors.name}
              left={<TextInput.Icon icon="account" />}
            />
            <HelperText type="error" visible={!!errors.name}>{errors.name}</HelperText>

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              error={!!errors.email}
              left={<TextInput.Icon icon="email-outline" />}
            />
            <HelperText type="error" visible={!!errors.email}>{errors.email}</HelperText>

            <TextInput
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              mode="outlined"
              style={styles.input}
              error={!!errors.password}
              left={<TextInput.Icon icon="lock-outline" />}
            />
            <HelperText type="error" visible={!!errors.password}>{errors.password}</HelperText>

            <TextInput
              label="Confirmar contraseña"
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
              secureTextEntry
              mode="outlined"
              style={styles.input}
              error={!!errors.passwordConfirmation}
              left={<TextInput.Icon icon="lock-check-outline" />}
            />
            <HelperText type="error" visible={!!errors.passwordConfirmation}>
              {errors.passwordConfirmation}
            </HelperText>

            {errors.general && <HelperText type="error" visible={true}>{errors.general}</HelperText>}

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
              buttonColor="#2E8B57"
            >
              Registrarse
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.goBack()}
              style={styles.link}
            >
              ¿Ya tienes cuenta? Iniciar sesión
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E8F5E8" },
  inner: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 20 },  // Menos padding arriba/abajo
  logo: { width: 100, height: 100, alignSelf: "center", marginBottom: 10 },  // Logo más pequeño y más abajo
  title: { fontSize: 32, fontWeight: "bold", textAlign: "center", color: "#2E8B57" },
  subtitle: { fontSize: 15, textAlign: "center", color: "#666", marginBottom: 15 },
  card: { borderRadius: 20, elevation: 8, paddingBottom: 10 },
  input: { marginBottom: 5 },
  button: { marginTop: 15 },
  buttonContent: { height: 50 },
  link: { marginTop: 10 },
});