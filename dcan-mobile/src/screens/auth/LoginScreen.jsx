import React, { useState } from "react";
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform } from "react-native";
import { TextInput, Button, Title, Card, Paragraph } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Por favor ingresa email y contraseña");
      return;
    }
    setLoading(true);
    const result = await login(email.trim().toLowerCase(), password);
    setLoading(false);
    if (!result.success) {
      alert(result.message);
    }
    // QUITA ESTA LÍNEA:
    // navigation.replace("Dashboard");
    // El App.js lo hace automáticamente con conditional rendering
};

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.inner}>
        <Image source={require("../../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
        <Title style={styles.title}>D’CAN</Title>
        <Paragraph style={styles.subtitle}>Veterinaria de confianza</Paragraph>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              theme={{ roundness: 15 }}
              left={<TextInput.Icon icon="email-outline" />}
            />
            <TextInput
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              mode="outlined"
              style={styles.input}
              theme={{ roundness: 15 }}
              left={<TextInput.Icon icon="lock-outline" />}
            />
            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
              theme={{ roundness: 15 }}
            >
              Iniciar Sesión
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
  logo: { width: 150, height: 150, marginBottom: 20 },
  title: { fontSize: 42, fontWeight: "bold", color: "#2E8B57", marginBottom: 8 },
  subtitle: { fontSize: 18, color: "#666", marginBottom: 40, textAlign: "center" },
  card: { width: "100%", borderRadius: 20, elevation: 10, backgroundColor: "#fff" },
  input: { marginBottom: 16, backgroundColor: "#fff" },
  button: { marginTop: 20, backgroundColor: "#2E8B57" },
  buttonContent: { height: 55 },
});