import React, { useMemo, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  TextInput,
  Button,
  Switch,
  Divider,
  HelperText,
} from "react-native-paper";
import axios from "axios";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { API_URL } from "../../config/api";

export default function ProfileScreenSuperAdmin() {
  const { user, token, logout, loadToken } = useAuth();
  const { theme, toggleTheme } = useTheme(); // ✅ tu ThemeContext expone theme + toggleTheme

  const isDark = !!theme?.isDarkMode; // ✅ tu dark mode vive aquí

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    }),
    [token]
  );

  const [name, setName] = useState(user?.name || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPass, setSavingPass] = useState(false);
  const [passMsg, setPassMsg] = useState("");
  const [passErr, setPassErr] = useState("");

  const role =
    user?.role ||
    (Array.isArray(user?.roles) && user.roles[0]?.name) ||
    "—";

  const saveProfile = async () => {
    setProfileErr("");
    setProfileMsg("");

    if (!name.trim()) {
      setProfileErr("El nombre no puede estar vacío.");
      return;
    }

    setSavingProfile(true);
    try {
      // TODO: ajusta si tu backend usa otra ruta
      await axios.patch(`${API_URL}/me`, { name: name.trim() }, { headers });

      setProfileMsg("Perfil actualizado.");
      await loadToken(); // refresca el user en AuthContext
    } catch (e) {
      setProfileErr("No se pudo actualizar el perfil.");
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    setPassErr("");
    setPassMsg("");

    if (!currentPassword.trim() || !newPassword.trim()) {
      setPassErr("Completa la contraseña actual y la nueva.");
      return;
    }
    if (newPassword.trim().length < 8) {
      setPassErr("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setSavingPass(true);
    try {
      // TODO: ajusta si tu backend usa otra ruta
      await axios.patch(
        `${API_URL}/me/password`,
        {
          current_password: currentPassword.trim(),
          new_password: newPassword.trim(),
        },
        { headers }
      );

      setPassMsg("Contraseña actualizada.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (e) {
      setPassErr("No se pudo cambiar la contraseña. Verifica la contraseña actual.");
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Title style={[styles.title, { color: theme.colors.primary }]}>Mi perfil</Title>

        {/* Info */}
        <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Card.Content>
            <Title style={{ marginBottom: 6, color: theme.colors.text }}>
              {user?.name || "Usuario"}
            </Title>

            <Paragraph style={[styles.muted, { color: theme.colors.subtitle }]}>
              {user?.email || "—"}
            </Paragraph>
            <Paragraph style={[styles.muted, { color: theme.colors.subtitle }]}>
              Rol: {role}
            </Paragraph>

            <Divider style={{ marginVertical: 12 }} />

            <View style={styles.rowBetween}>
              <Paragraph style={{ fontWeight: "600", color: theme.colors.text }}>
                Modo oscuro
              </Paragraph>

              <Switch value={isDark} onValueChange={toggleTheme} />
            </View>
          </Card.Content>
        </Card>

        {/* Editar nombre */}
        <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Card.Content>
            <Title style={{ marginBottom: 10, color: theme.colors.text }}>
              Editar información
            </Title>

            <TextInput
              label="Nombre de usuario"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={{ marginBottom: 10 }}
            />

            {!!profileErr && (
              <HelperText type="error" visible={true}>
                {profileErr}
              </HelperText>
            )}
            {!!profileMsg && (
              <HelperText type="info" visible={true}>
                {profileMsg}
              </HelperText>
            )}

            <Button
              mode="contained"
              icon="content-save"
              onPress={saveProfile}
              loading={savingProfile}
              disabled={savingProfile}
            >
              Guardar cambios
            </Button>
          </Card.Content>
        </Card>

        {/* Cambiar contraseña */}
        <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Card.Content>
            <Title style={{ marginBottom: 10, color: theme.colors.text }}>
              Seguridad
            </Title>

            <TextInput
              label="Contraseña actual"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              mode="outlined"
              style={{ marginBottom: 10 }}
            />

            <TextInput
              label="Nueva contraseña"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              mode="outlined"
              style={{ marginBottom: 10 }}
            />

            {!!passErr && (
              <HelperText type="error" visible={true}>
                {passErr}
              </HelperText>
            )}
            {!!passMsg && (
              <HelperText type="info" visible={true}>
                {passMsg}
              </HelperText>
            )}

            <Button
              mode="contained"
              icon="lock-reset"
              onPress={changePassword}
              loading={savingPass}
              disabled={savingPass}
            >
              Cambiar contraseña
            </Button>
          </Card.Content>
        </Card>

        {/* Cerrar sesión */}
        <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Card.Content>
            <Button
              mode="contained"
              buttonColor="#D32F2F"
              icon="logout"
              onPress={logout}
            >
              Cerrar sesión
            </Button>
          </Card.Content>
        </Card>

        <Paragraph style={[styles.footer, { color: theme.colors.subtitle }]}>
          DCAN · Panel SuperAdmin
        </Paragraph>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 10,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    elevation: 3,
  },
  muted: { opacity: 0.9 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  footer: { textAlign: "center", marginTop: 10, opacity: 0.7 },
});
