import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Avatar, Title, Paragraph, List, Divider, Switch } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function ProfileScreen() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Avatar.Text
          size={100}
          label={user?.name?.charAt(0) || "U"}
          style={[
            styles.avatar,
            { backgroundColor: theme.isDarkMode ? theme.colors.card : "#fff" },
          ]}
          labelStyle={{ color: theme.colors.text }}
        />
        <Title style={[styles.name, { color: theme.colors.text }]}>
          {user?.name || "Usuario"}
        </Title>
        <Paragraph style={[styles.email, { color: theme.colors.subtitle }]}>
          {user?.email || "email@ejemplo.com"}
        </Paragraph>
        <Paragraph style={[styles.role, { color: theme.colors.subtitle }]}>
          Rol: {user?.roles?.[0]?.name || "Cliente"}
        </Paragraph>
      </View>

      <List.Section style={{ marginTop: 10 }}>
        <List.Item
          title="Editar perfil"
          titleStyle={{ color: theme.colors.text }}
          left={() => <List.Icon icon="account-edit" color={theme.colors.primary} />}
          onPress={() => {}}
        />
        <Divider />

        <List.Item
          title="Cambiar contraseña"
          titleStyle={{ color: theme.colors.text }}
          left={() => <List.Icon icon="lock-reset" color={theme.colors.primary} />}
          onPress={() => {}}
        />
        <Divider />

        <List.Item
          title="Notificaciones"
          titleStyle={{ color: theme.colors.text }}
          left={() => <List.Icon icon="bell" color={theme.colors.primary} />}
          onPress={() => {}}
        />
        <Divider />

        <List.Item
          title="Modo oscuro"
          titleStyle={{ color: theme.colors.text }}
          left={() => <List.Icon icon="moon-waning-crescent" color={theme.colors.primary} />}
          right={() => (
            <Switch
              value={theme.isDarkMode}
              onValueChange={toggleTheme}
              color={theme.colors.primary}
            />
          )}
        />
        <Divider />

        <List.Item
          title="Ayuda y soporte"
          titleStyle={{ color: theme.colors.text }}
          left={() => <List.Icon icon="help-circle" color={theme.colors.primary} />}
          onPress={() => {}}
        />
      </List.Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: "center",
    padding: 30,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  avatar: { },
  name: { fontSize: 28, fontWeight: "bold", marginTop: 20 },
  email: { fontSize: 18 },
  role: { fontSize: 16, marginTop: 8 },
});
