import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Avatar, Button, Card, List, Switch, TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext'; 

export default function PerfilScreen() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme(); 
  const { isDarkMode, colors } = theme;

  const [editMode, setEditMode] = useState(false);
  const [nombre, setNombre] = useState(user?.name || 'Veterinario');
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.5,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={pickImage}>
          <Avatar.Image size={100} source={{ uri: image || 'https://via.placeholder.com/100' }} />
          <View style={[styles.camIcon, {backgroundColor: colors.primary}]}><List.Icon icon="camera" color="white" /></View>
        </TouchableOpacity>
        
        {editMode ? (
          <TextInput value={nombre} onChangeText={setNombre} style={styles.input} mode="outlined" />
        ) : (
          <Text style={[styles.name, { color: colors.text }]}>{nombre}</Text>
        )}
        <Text style={{ color: colors.subtitle }}>{user?.email}</Text>
      </View>

      <Card style={[styles.card, { backgroundColor: colors.card }]}>
        <List.Item
          title="Modo Oscuro"
          titleStyle={{ color: colors.text }}
          left={p => <List.Icon {...p} icon="theme-light-dark" color={colors.primary} />}
          right={() => <Switch value={isDarkMode} onValueChange={toggleTheme} color={colors.primary} />}
        />
        <List.Item
          title="Editar Perfil"
          titleStyle={{ color: colors.text }}
          left={p => <List.Icon {...p} icon="account-edit" color={colors.primary} />}
          onPress={() => setEditMode(!editMode)}
        />
      </Card>

      <View style={{ padding: 20 }}>
        {editMode && (
          <Button mode="contained" onPress={() => setEditMode(false)} buttonColor={colors.primary} style={{marginBottom: 10}}>
            Guardar Cambios
          </Button>
        )}
        <Button mode="outlined" onPress={logout} textColor="#d32f2f" style={{borderColor: '#d32f2f'}}>
          Cerrar Sesión
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingVertical: 40, borderBottomRightRadius: 30, borderBottomLeftRadius: 30 },
  camIcon: { position: 'absolute', bottom: 0, right: 0, borderRadius: 20, width: 35, height: 35, justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 22, fontWeight: 'bold', marginTop: 10 },
  input: { width: '80%', height: 40, marginTop: 10 },
  card: { margin: 20, borderRadius: 15 }
});