import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Avatar, Button, Card, List, Switch, TextInput, Divider, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext'; 
import axios from 'axios';
import { API_URL } from "../../config/api";
import * as SecureStore from "expo-secure-store";

export default function PerfilScreen() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme(); 
  const { isDarkMode, colors } = theme;

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados del perfil profesional
  const [perfil, setPerfil] = useState({
    nombre: user?.name || '',
    especialidad: '', // Ej: Cirujano, Dermatología, General
    telefono: '',
    bio: '',
    foto_url: null,
  });

  // Cargar datos al iniciar
  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      const response = await axios.get(`${API_URL}/veterinarian/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setPerfil({
          nombre: response.data.name || user?.name,
          especialidad: response.data.specialty || '',
          telefono: response.data.phone || '',
          bio: response.data.bio || '',
          foto_url: response.data.photo_path || null,
        });
      }
    } catch (e) {
      console.log("Error al cargar perfil", e);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPerfil({ ...perfil, foto_url: result.assets[0].uri });
    }
  };

  const guardarCambios = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync("authToken");
      
      // FormData para enviar la imagen y los textos
      const formData = new FormData();
      formData.append('name', perfil.nombre);
      formData.append('specialty', perfil.especialidad);
      formData.append('phone', perfil.telefono);
      formData.append('bio', perfil.bio);

      if (perfil.foto_url && perfil.foto_url.startsWith('file://')) {
        const filename = perfil.foto_url.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append('photo', { uri: perfil.foto_url, name: filename, type });
      }

      await axios.post(`${API_URL}/veterinarian/profile/update`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });

      Alert.alert("Éxito", "Perfil profesional actualizado correctamente.");
      setEditMode(false);
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar la información.");
      console.log(e.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* HEADER PROFESIONAL */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.avatarContainer}>
          <Avatar.Image 
            size={120} 
            source={{ uri: perfil.foto_url || 'https://via.placeholder.com/150' }} 
            style={styles.avatarShadow}
          />
          {editMode && (
            <TouchableOpacity onPress={pickImage} style={[styles.camBtn, { backgroundColor: colors.accent || '#fff' }]}>
              <IconButton icon="camera" size={20} iconColor={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
        
        {!editMode && (
          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <Text style={styles.proName}>{perfil.nombre}</Text>
            <View style={styles.specialtyBadge}>
              <Text style={styles.specialtyText}>
                {perfil.especialidad || 'Médico Veterinario'}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {editMode ? (
          <Card style={styles.cardEdit}>
            <Card.Content>
              <TextInput label="Nombre Profesional" value={perfil.nombre} onChangeText={(v) => setPerfil({...perfil, nombre: v})} mode="outlined" style={styles.input} />
              <TextInput label="Especialidad (Ej: Cirugía, Felinos)" value={perfil.especialidad} onChangeText={(v) => setPerfil({...perfil, especialidad: v})} mode="outlined" style={styles.input} />
              <TextInput label="Teléfono de contacto" value={perfil.telefono} onChangeText={(v) => setPerfil({...perfil, telefono: v})} keyboardType="phone-pad" mode="outlined" style={styles.input} />
              <TextInput label="Sobre mí (Breve reseña)" value={perfil.bio} onChangeText={(v) => setPerfil({...perfil, bio: v})} multiline numberOfLines={3} mode="outlined" style={styles.input} />
              
              <Button mode="contained" onPress={guardarCambios} loading={loading} style={styles.btnAction}>Guardar Perfil</Button>
              <Button onPress={() => setEditMode(false)} textColor={colors.text}>Cancelar</Button>
            </Card.Content>
          </Card>
        ) : (
          <>
            <Card style={[styles.infoCard, { backgroundColor: colors.card }]}>
              <List.Section>
                <List.Subheader style={{color: colors.primary, fontWeight: 'bold'}}>Información de Contacto</List.Subheader>
                <List.Item title="Correo Electrónico" description={user?.email} left={p => <List.Icon {...p} icon="email-outline" />} />
                <Divider />
                <List.Item title="Teléfono" description={perfil.telefono || 'No registrado'} left={p => <List.Icon {...p} icon="phone-outline" />} />
              </List.Section>
            </Card>

            <Card style={[styles.infoCard, { backgroundColor: colors.card, marginTop: 15 }]}>
              <Card.Content>
                <Text style={[styles.sectionTitle, {color: colors.primary}]}>Biografía Profesional</Text>
                <Text style={[styles.bioText, {color: colors.text}]}>
                  {perfil.bio || "Aún no has agregado una descripción profesional a tu perfil."}
                </Text>
              </Card.Content>
            </Card>
          </>
        )}

        {/* AJUSTES */}
        <View style={{ marginTop: 20 }}>
          <List.Item
            title="Modo Oscuro"
            left={p => <List.Icon {...p} icon="theme-light-dark" />}
            right={() => <Switch value={isDarkMode} onValueChange={toggleTheme} />}
          />
          {!editMode && (
            <List.Item
              title="Editar Información"
              left={p => <List.Icon {...p} icon="account-cog-outline" />}
              onPress={() => setEditMode(true)}
            />
          )}
          <Divider style={{ marginVertical: 10 }} />
          <Button mode="text" onPress={logout} textColor="#d32f2f" icon="logout">
            Cerrar Sesión
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { 
    paddingTop: 50, 
    paddingBottom: 30, 
    alignItems: 'center', 
    borderBottomLeftRadius: 40, 
    borderBottomRightRadius: 40,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  avatarContainer: { position: 'relative' },
  avatarShadow: { elevation: 8, backgroundColor: '#eee' },
  camBtn: { 
    position: 'absolute', 
    bottom: 0, 
    right: 5, 
    borderRadius: 25, 
    elevation: 5, 
    width: 40, 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  proName: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 10 },
  specialtyBadge: { 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    paddingHorizontal: 15, 
    paddingVertical: 5, 
    borderRadius: 20, 
    marginTop: 5 
  },
  specialtyText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  content: { padding: 20 },
  cardEdit: { borderRadius: 15, elevation: 3 },
  infoCard: { borderRadius: 15, elevation: 2 },
  input: { marginBottom: 12, backgroundColor: 'transparent' },
  btnAction: { marginTop: 10, borderRadius: 10, paddingVertical: 5 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  bioText: { fontSize: 14, lineHeight: 20, opacity: 0.8 }
});