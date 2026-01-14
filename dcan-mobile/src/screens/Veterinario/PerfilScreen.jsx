import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Avatar, Button, Card, List, Divider } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext'; // Importamos el hook de autenticación

export default function PerfilScreen() {
  const { user, logout } = useAuth(); // Obtenemos los datos del usuario y la función logout

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Image 
          size={100} 
          source={{ uri: 'https://via.placeholder.com/100' }} 
          style={styles.avatar}
        />
        <Text style={styles.userName}>{user?.name || 'Veterinario'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <List.Section>
            <List.Subheader>Información Profesional</List.Subheader>
            <List.Item
              title="Especialidad"
              description="Medicina General Veterinaria"
              left={props => <List.Icon {...props} icon="certificate" color="#2E8B57" />}
            />
            <Divider />
            <List.Item
              title="Rol"
              description={user?.roles?.[0]?.name || 'Veterinarian'}
              left={props => <List.Icon {...props} icon="account-tie" color="#2E8B57" />}
            />
          </List.Section>
        </Card.Content>
      </Card>

      <View style={styles.actionContainer}>
        <Button 
          mode="outlined" 
          onPress={() => console.log('Editar Perfil')} 
          style={styles.button}
          textColor="#2E8B57"
        >
          Editar Datos
        </Button>

        <Button 
          mode="contained" 
          onPress={logout} // Llamamos a la función de cerrar sesión
          style={[styles.button, styles.logoutButton]}
          buttonColor="#d32f2f"
        >
          Cerrar Sesión
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#fff' },
  avatar: { marginBottom: 15, backgroundColor: '#2E8B57' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 14, color: '#666' },
  card: { margin: 20, borderRadius: 10, elevation: 2 },
  actionContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  button: { marginBottom: 10, paddingVertical: 5 },
  logoutButton: { marginTop: 10 }
});