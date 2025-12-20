import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Avatar, Title, Paragraph, List, Divider } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";

export default function ProfileScreen() {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text size={100} label={user?.name?.charAt(0) || "U"} style={styles.avatar} />
        <Title style={styles.name}>{user?.name || "Usuario"}</Title>
        <Paragraph style={styles.email}>{user?.email || "email@ejemplo.com"}</Paragraph>
        <Paragraph style={styles.role}>Rol: {user?.roles?.[0]?.name || "Cliente"}</Paragraph>
      </View>

      <List.Section>
        <List.Item title="Editar perfil" left={() => <List.Icon icon="account-edit" color="#2E8B57" />} />
        <Divider />
        <List.Item title="Cambiar contraseña" left={() => <List.Icon icon="lock-reset" color="#2E8B57" />} />
        <Divider />
        <List.Item title="Notificaciones" left={() => <List.Icon icon="bell" color="#2E8B57" />} />
        <Divider />
        <List.Item title="Ayuda y soporte" left={() => <List.Icon icon="help-circle" color="#2E8B57" />} />
      </List.Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E8F5E8" },
  header: { alignItems: "center", padding: 30, backgroundColor: "#2E8B57", borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  avatar: { backgroundColor: "#fff" },
  name: { fontSize: 28, fontWeight: "bold", color: "#fff", marginTop: 20 },
  email: { fontSize: 18, color: "#E8F5E8" },
  role: { fontSize: 16, color: "#fff", marginTop: 8 },
});