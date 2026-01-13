import React, { useState } from "react";
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { TextInput, Button, Title, Paragraph, Card, HelperText } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext"; // Importar el contexto

export default function RegisterScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { registerAction } = useAuth(); // Usar la acción del contexto
  const selectedClinic = route.params?.selectedClinic || null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "El nombre es obligatorio";
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) newErrors.email = "Email inválido";
    if (password.length < 6) newErrors.password = "Mínimo 6 caracteres";
    if (password !== passwordConfirmation) newErrors.passwordConfirmation = "Las contraseñas no coinciden";
    if (!selectedClinic) newErrors.clinic = "Debes seleccionar una clínica";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (loading) return;
    if (!validateForm()) return;

    setLoading(true);
    const regData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      password_confirmation: passwordConfirmation,
      clinic_id: selectedClinic.id,
    };

    const result = await registerAction(regData);

    if (result.success) {
      // No hace falta navegar a Login, el AuthContext cambiará la App a "ClientTabs"
      Alert.alert("¡Bienvenido!", "Registro e inicio de sesión exitoso.");
    } else {
      if (result.errors) {
        setErrors(result.errors);
      } else {
        Alert.alert("Error", result.message || "No se pudo registrar.");
      }
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Image source={require("../../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
        <Title style={styles.title}>Crear Cuenta</Title>
        <Paragraph style={styles.subtitle}>Clínica: {selectedClinic?.name || "Ninguna"}</Paragraph>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput label="Nombre completo" value={name} onChangeText={setName} mode="outlined" style={styles.input} error={!!errors.name} />
            <HelperText type="error" visible={!!errors.name}>{errors.name}</HelperText>

            <TextInput label="Email" value={email} onChangeText={setEmail} mode="outlined" style={styles.input} error={!!errors.email} />
            <HelperText type="error" visible={!!errors.email}>{errors.email}</HelperText>

            <TextInput label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry mode="outlined" style={styles.input} error={!!errors.password} />
            <HelperText type="error" visible={!!errors.password}>{errors.password}</HelperText>

            <TextInput label="Confirmar contraseña" value={passwordConfirmation} onChangeText={setPasswordConfirmation} secureTextEntry mode="outlined" style={styles.input} error={!!errors.passwordConfirmation} />
            <HelperText type="error" visible={!!errors.passwordConfirmation}>{errors.passwordConfirmation}</HelperText>

            <Button mode="contained" onPress={handleRegister} loading={loading} style={styles.button} buttonColor="#2E8B57">
              Registrarse ahora
            </Button>

            <Button mode="text" onPress={() => navigation.navigate("Login")} style={styles.link}>
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
  card: { borderRadius: 20, elevation: 8 },
  input: { marginBottom: 2 },
  button: { marginTop: 15 },
  link: { marginTop: 10 },
});