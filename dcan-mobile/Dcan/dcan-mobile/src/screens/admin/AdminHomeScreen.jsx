import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Divider,
  ActivityIndicator,
} from "react-native-paper";
import axios from "axios";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { API_URL } from "../../config/api";

export default function AdminHomeScreen({ navigation }) {
  const { token, user } = useAuth();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState({
    clinics_total: 0,
    clinics_active: 0,
    clinics_pending: 0,
    users_total: 0,
    admins_total: 0,
    vets_total: 0,
    clients_total: 0,
  });

  const [error, setError] = useState("");

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    }),
    [token]
  );

  const fetchStats = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/dashboard`, { headers });
      setStats((prev) => ({ ...prev, ...(res.data || {}) }));
    } catch (e) {
      setError("No se pudo cargar el resumen del sistema.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const KpiCard = ({ title, value, subtitle }) => (
    <Card style={styles.kpiCard}>
      <Card.Content>
        <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>{title}</Paragraph>
        <Title style={{ fontSize: 26, marginTop: 4 }}>{String(value ?? "—")}</Title>
        {!!subtitle && <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>{subtitle}</Paragraph>}
      </Card.Content>
    </Card>
  );

  const displayName = user?.name || user?.email || "Administrador";

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Title style={[styles.title, { color: theme.colors.primary }]}>
          Hola, {displayName}
        </Title>
        <Paragraph style={styles.subtitle}>
          Panel de control · Gestión de clínicas y usuarios
        </Paragraph>

        {!!error && (
          <Card style={[styles.alertCard, { borderColor: theme.colors.error }]}>
            <Card.Content>
              <Paragraph style={{ color: theme.colors.error }}>{error}</Paragraph>
            </Card.Content>
          </Card>
        )}

        {loading ? (
          <View style={{ paddingVertical: 14 }}>
            <ActivityIndicator />
          </View>
        ) : (
          <>
            <View style={styles.kpiGrid}>
              <KpiCard
                title="Clínicas"
                value={stats.clinics_total}
                subtitle={`Activas: ${stats.clinics_active}`}
              />
              <KpiCard
                title="Solicitudes"
                value={stats.clinics_pending}
                subtitle="Pendientes de revisión"
              />
              <KpiCard
                title="Usuarios"
                value={stats.users_total}
                subtitle={`Clientes: ${stats.clients_total}`}
              />
            </View>

            <Card style={styles.card}>
              <Card.Content>
                <Title style={{ marginBottom: 8 }}>Accesos rápidos</Title>

                <View style={styles.quickRow}>
                  <Button
                    mode="contained"
                    icon="domain"
                    style={styles.quickBtn}
                    onPress={() => navigation.navigate("Clinics")}
                  >
                    Clínicas
                  </Button>

                  <Button
                    mode="contained"
                    icon="account-multiple"
                    style={styles.quickBtn}
                    onPress={() => navigation.navigate("Users")}
                  >
                    Usuarios
                  </Button>
                </View>

                <Divider style={{ marginVertical: 14 }} />

                <Title style={{ marginBottom: 8 }}>Centro de control</Title>
                <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
                  Aquí puedes revisar solicitudes de clínicas, aprobar o suspender accesos y administrar usuarios del sistema.
                </Paragraph>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
                  <Chip icon="bell">Revisar solicitudes</Chip>
                  <Chip icon="shield-account">Gestionar roles</Chip>
                  <Chip icon="domain">Control de clínicas</Chip>
                </View>

                <Paragraph style={{ marginTop: 12, color: theme.colors.onSurfaceVariant }}>
                  Nota: Por privacidad, no se muestra información clínica (mascotas, citas, diagnósticos o historial).
                </Paragraph>
              </Card.Content>
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginTop: 16 },
  subtitle: { textAlign: "center", marginBottom: 12, opacity: 0.75, paddingHorizontal: 16 },
  alertCard: { marginHorizontal: 16, marginTop: 8, borderWidth: 1, borderRadius: 14 },
  kpiGrid: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginTop: 10 },
  kpiCard: { flex: 1, borderRadius: 16, elevation: 3 },
  card: { marginHorizontal: 16, marginTop: 14, borderRadius: 16, elevation: 3 },
  quickRow: { flexDirection: "row", gap: 10 },
  quickBtn: { flex: 1, borderRadius: 12 },
});
