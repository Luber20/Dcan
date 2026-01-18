import React, { useState } from "react";
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { TextInput, Button, Title, Paragraph, Card, HelperText } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";

export default function RegisterScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { registerAction } = useAuth();
  
  // Obtenemos la clínica seleccionada
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
    
    // Validación crítica: Debe haber una clínica
    if (!selectedClinic) {
        Alert.alert("Error", "No se ha seleccionado una clínica para el registro.");
        return false;
    }
    
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
      clinic_id: selectedClinic.id, // 👈 FORZAMOS EL ID DE LA CLÍNICA SELECCIONADA
    };

    const result = await registerAction(regData);

    if (result.success) {
      Alert.alert("¡Bienvenido!", `Te has registrado exitosamente en ${selectedClinic.name}.`);
      // AuthContext manejará la redirección automática
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
        
        {/* ✅ AVISO DE CLÍNICA */}
        {selectedClinic ? (
            <View style={styles.clinicBadge}>
                <Paragraph style={{textAlign: 'center', color: '#155724'}}>
                    Registrándose en: <Paragraph style={{fontWeight: 'bold', color: '#155724'}}>{selectedClinic.name}</Paragraph>
                </Paragraph>
            </View>
        ) : (
            <HelperText type="error" visible={true} style={{textAlign:'center'}}>
                Error: No se seleccionó clínica.
            </HelperText>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <TextInput label="Nombre completo" value={name} onChangeText={setName} mode="outlined" style={styles.input} error={!!errors.name} theme={{roundness: 10}} />
            <HelperText type="error" visible={!!errors.name}>{errors.name}</HelperText>

            <TextInput label="Email" value={email} onChangeText={setEmail} mode="outlined" style={styles.input} error={!!errors.email} theme={{roundness: 10}} autoCapitalize="none" keyboardType="email-address"/>
            <HelperText type="error" visible={!!errors.email}>{errors.email}</HelperText>

            <TextInput label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry mode="outlined" style={styles.input} error={!!errors.password} theme={{roundness: 10}} />
            <HelperText type="error" visible={!!errors.password}>{errors.password}</HelperText>

            <TextInput label="Confirmar contraseña" value={passwordConfirmation} onChangeText={setPasswordConfirmation} secureTextEntry mode="outlined" style={styles.input} error={!!errors.passwordConfirmation} theme={{roundness: 10}} />
            <HelperText type="error" visible={!!errors.passwordConfirmation}>{errors.passwordConfirmation}</HelperText>

            <Button mode="contained" onPress={handleRegister} loading={loading} style={styles.button} buttonColor="#2E8B57" disabled={!selectedClinic || loading}>
              Registrarse ahora
            </Button>

            <Button mode="text" onPress={() => navigation.navigate("Login", { selectedClinic })} style={styles.link}>
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
  logo: { width: 90, height: 90, alignSelf: "center", marginBottom: 10 },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", color: "#2E8B57", marginBottom: 10 },
  
  clinicBadge: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 20
  },
  
  card: { borderRadius: 20, elevation: 8, backgroundColor: 'white' },
  input: { marginBottom: 2, backgroundColor: 'white' },
  button: { marginTop: 10, paddingVertical: 5 },
  link: { marginTop: 10, color: '#2E8B57' },
});