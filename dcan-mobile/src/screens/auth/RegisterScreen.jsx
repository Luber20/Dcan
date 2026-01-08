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
import { API_URL } from "../../config/api";

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
  const [successMsg, setSuccessMsg] = useState("");


  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setPasswordConfirmation("");
    setErrors({});
  };

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
    if (loading) return; // evita doble click
    setSuccessMsg("");

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
  await axios.post(`${API_URL}/register-client`, {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    password_confirmation: passwordConfirmation,
    clinic_id: selectedClinic.id,
  });

  resetForm();
  setSuccessMsg("¡Registro exitoso! Ahora inicia sesión ✅");

  setTimeout(() => {
    navigation.navigate("Login");
  }, 700);
} catch (err) {
      // ✅ Mostrar error real del backend
      const status = err.response?.status;
      const data = err.response?.data;

      console.log("REGISTER ERROR:", status, data || err.message);

      if (status === 422) {
        // Laravel suele mandar errors: { email: [...], password: [...], ... }
        setErrors({
          ...data?.errors,
          general: "Revisa los campos marcados.",
        });
      } else if (status === 500) {
        setErrors({ general: "Error del servidor (500). Revisa Laravel/DB." });
      } else {
        setErrors({
          general:
            "No se pudo conectar al servidor. Verifica que el backend esté encendido y en la misma red.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.inner}>
        <Image
          source={require("../../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Title style={styles.title}>Crear Cuenta</Title>
        <Paragraph style={styles.subtitle}>
          Clínica seleccionada: {selectedClinic ? selectedClinic.name : "Ninguna"}
        </Paragraph>

        {!!errors.clinic && (
          <HelperText type="error" visible={true}>
            {errors.clinic}
          </HelperText>
        )}

        {!!successMsg && (
          <HelperText type="info" visible={true}>
            {successMsg}
          </HelperText>
        )}

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
            <HelperText type="error" visible={!!errors.name}>
              {Array.isArray(errors.name) ? errors.name[0] : errors.name}
            </HelperText>

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!errors.email}
              left={<TextInput.Icon icon="email-outline" />}
            />
            <HelperText type="error" visible={!!errors.email}>
              {Array.isArray(errors.email) ? errors.email[0] : errors.email}
            </HelperText>

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
            <HelperText type="error" visible={!!errors.password}>
              {Array.isArray(errors.password) ? errors.password[0] : errors.password}
            </HelperText>

            <TextInput
              label="Confirmar contraseña"
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
              secureTextEntry
              mode="outlined"
              style={styles.input}
              error={!!errors.password_confirmation || !!errors.passwordConfirmation}
              left={<TextInput.Icon icon="lock-check-outline" />}
            />
            <HelperText type="error" visible={true}>
              {errors.passwordConfirmation ||
                (Array.isArray(errors.password_confirmation)
                  ? errors.password_confirmation[0]
                  : errors.password_confirmation) ||
                ""}
            </HelperText>

            {!!errors.general && (
              <HelperText type="error" visible={true}>
                {errors.general}
              </HelperText>
            )}

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
              onPress={() => navigation.navigate("Login")}
              style={styles.link}
              disabled={loading}
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
  inner: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 20 },
  logo: { width: 100, height: 100, alignSelf: "center", marginBottom: 10 },
  title: { fontSize: 32, fontWeight: "bold", textAlign: "center", color: "#2E8B57" },
  subtitle: { fontSize: 15, textAlign: "center", color: "#666", marginBottom: 15 },
  card: { borderRadius: 20, elevation: 8, paddingBottom: 10 },
  input: { marginBottom: 5 },
  button: { marginTop: 15 },
  buttonContent: { height: 50 },
  link: { marginTop: 10 },
});
