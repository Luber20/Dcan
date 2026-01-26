import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert, Image, KeyboardAvoidingView, Platform, StatusBar, SafeAreaView } from "react-native";
import { TextInput, Button, Title, Paragraph, Card } from "react-native-paper";
import axios from "axios";
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from "../../config/api";

export default function ClinicRequestScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  
  // Formulario
  const [clinicName, setClinicName] = useState("");
  const [province, setProvince] = useState("");
  const [canton, setCanton] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ruc, setRuc] = useState("");
  const [notes, setNotes] = useState("");
  
  // Imagen
  const [image, setImage] = useState(null);

  // 📸 FUNCIÓN SEGURA PARA ABRIR GALERÍA
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a la galería para subir el comprobante.');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Mantenemos false para evitar problemas de memoria
        quality: 0.5, 
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Error al abrir galería:", error);
    }
  };

  // ✅ VALIDACIÓN DE EMAIL
  const isValidEmail = (text) => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    return reg.test(text);
  };

  // 📤 FUNCIÓN DE ENVÍO
  const submit = async () => {
    // 1. Validaciones
    if (!clinicName.trim()) return Alert.alert("Falta información", "El nombre de la clínica es obligatorio.");
    if (!ownerName.trim()) return Alert.alert("Falta información", "El nombre del responsable es obligatorio.");
    
    if (phone.length < 9) return Alert.alert("Teléfono inválido", "Ingresa un número de teléfono válido.");
    
    if (email.length > 0 && !isValidEmail(email)) {
        return Alert.alert("Email inválido", "Por favor verifica el correo electrónico.");
    }

    if (ruc.trim().length < 10) {
        return Alert.alert("RUC inválido", "El RUC/CI debe tener al menos 10 dígitos.");
    }
    
    // 2. Validación de imagen
    if (!image) return Alert.alert("Falta comprobante", "Por favor sube la captura de la transferencia.");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('clinic_name', clinicName.trim());
      formData.append('province', province.trim());
      formData.append('canton', canton.trim());
      formData.append('address', address.trim());
      formData.append('phone', phone.trim());
      formData.append('email', email.trim());
      formData.append('owner_name', ownerName.trim());
      formData.append('ruc', ruc.trim());
      formData.append('notes', notes.trim());

      if (image) {
        const uriParts = image.split('.');
        const fileType = uriParts[uriParts.length - 1];
        const fileName = `photo.${fileType}`;

        formData.append('payment_proof', {
            uri: Platform.OS === 'ios' ? image.replace('file://', '') : image,
            name: fileName,
            type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
        });
      }

      await axios.post(`${API_URL}/clinic-requests`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      Alert.alert(
        "¡Solicitud Enviada!", 
        "Hemos recibido tu registro y comprobante. Un administrador revisará la información.",
        [
            { 
                text: "Ir al Inicio", 
                onPress: () => {
                    navigation.navigate('Login'); 
                } 
            }
        ]
      );

    } catch (e) {
      console.log("Error:", e);
      Alert.alert("Error", "No se pudo enviar la solicitud. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
        {/* ✅ Ajuste de comportamiento del teclado para evitar saltos locos */}
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : undefined} 
            style={{flex:1}}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                
                <Title style={styles.title}>Registrar Clínica</Title>
                <Paragraph style={styles.subtitle}>Completa los datos y adjunta tu comprobante.</Paragraph>
                
                {/* TARJETA DE PAGO */}
                <Card style={[styles.card, {backgroundColor: '#E8F5E9', borderColor: '#2E8B57', borderWidth: 1}]}>
                    <Card.Content>
                        <Title style={{fontSize:16, color:'#2E8B57', marginBottom:5}}>Datos Bancarios</Title>               
                        <Paragraph style={{fontSize:13}}>🏦 Banco Pichincha - Cta. Ahorros</Paragraph>
                        <Paragraph style={{fontSize:13, fontWeight:'bold'}}>🔢 2206089632</Paragraph>
                        <Paragraph style={{fontSize:13}}>👤 D'Can Inc - RUC: 1723697856322</Paragraph>  
                        <Paragraph style={{marginTop:5, fontWeight:'bold', color:'#2E8B57'}}>💵 Valor a transferir: $60.00 USD</Paragraph>
                    </Card.Content>
                </Card>
                
                <Card style={styles.card}>
                    <Card.Content>
                        <TextInput label="Nombre Clínica *" value={clinicName} onChangeText={setClinicName} mode="outlined" style={styles.input} />
                        <TextInput label="Nombre Responsable *" value={ownerName} onChangeText={setOwnerName} mode="outlined" style={styles.input} />
                        <TextInput label="RUC / CI *" value={ruc} onChangeText={setRuc} mode="outlined" keyboardType="numeric" maxLength={13} style={styles.input} />
                        
                        <View style={{flexDirection: 'row', gap: 10}}>
                            <TextInput label="Provincia" value={province} onChangeText={setProvince} mode="outlined" style={[styles.input, {flex:1}]} />
                            <TextInput label="Cantón" value={canton} onChangeText={setCanton} mode="outlined" style={[styles.input, {flex:1}]} />
                        </View>
                        
                        <TextInput label="Dirección" value={address} onChangeText={setAddress} mode="outlined" style={styles.input} />
                        <TextInput label="Teléfono" value={phone} onChangeText={setPhone} mode="outlined" keyboardType="phone-pad" maxLength={10} style={styles.input} />
                        <TextInput label="Email Contacto" value={email} onChangeText={setEmail} mode="outlined" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
                        
                        <Paragraph style={{marginTop:15, marginBottom:5, fontWeight:'bold'}}>Comprobante de Pago *</Paragraph>
                        
                        {image ? (
                            <View style={{alignItems:'center', marginVertical:10}}>
                                <Image source={{ uri: image }} style={{ width: '100%', height: 250, borderRadius: 10, resizeMode:'contain', backgroundColor:'#f0f0f0' }} />
                                <Button mode="text" onPress={() => setImage(null)} textColor="red" icon="delete" style={{marginTop: 5}}>Quitar Imagen</Button>
                            </View>
                        ) : (
                            <Button mode="outlined" icon="camera" onPress={pickImage} style={{marginBottom:10, borderColor:'#2E8B57', paddingVertical: 5}} textColor="#2E8B57">
                                Subir Foto / Captura
                            </Button>
                        )}

                        <Button 
                            mode="contained" 
                            onPress={submit} 
                            loading={loading} 
                            disabled={loading} 
                            buttonColor="#2E8B57" 
                            style={{ marginTop: 15, paddingVertical: 5 }}
                        >
                            Enviar Solicitud
                        </Button>

                        <Button mode="text" onPress={() => navigation.goBack()} style={{ marginTop: 10 }} textColor="#666">
                            Cancelar
                        </Button>
                    </Card.Content>
                </Card>
                
                {/* Espacio extra al final para que el teclado no tape nada */}
                <View style={{height: 60}} /> 
            </ScrollView>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ✅ Arreglo para que se vea bien arriba (paddingTop dinámico)
  scrollContainer: { 
    padding: 20, 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 20 
  },
  title: { 
    fontSize: 26, 
    fontWeight: "bold", 
    color: "#2E8B57", 
    textAlign:'center', 
    marginBottom: 5 
  },
  subtitle: {
    marginBottom: 20, 
    color:'#666', 
    textAlign:'center'
  },
  card: { 
    borderRadius: 16, 
    backgroundColor: "white", 
    marginBottom: 20, 
    elevation: 3 
  },
  input: { 
    marginBottom: 10, 
    backgroundColor: "white", 
    height: 45 
  },
});