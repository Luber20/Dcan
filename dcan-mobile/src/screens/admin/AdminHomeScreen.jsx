import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, SafeAreaView, Platform, StatusBar } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Divider,
  ActivityIndicator,
  Avatar
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
    clinics_pending: 0, // <- aquí mostramos solicitudes reales
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

  // ✅ NUEVO: contar solicitudes pendientes reales
  const fetchPendingRequestsCount = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/clinic-requests?status=pending`, { headers });
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setStats((prev) => ({ ...prev, clinics_pending: list.length }));
    } catch (e) {
      // si falla, no bloquea el dashboard
      setStats((prev) => ({ ...prev, clinics_pending: prev.clinics_pending ?? 0 }));
    }
  };

  const fetchStats = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/dashboard`, { headers });
      setStats((prev) => ({ ...prev, ...(res.data || {}) }));

      // ✅ suma el conteo real de solicitudes pendientes
      await fetchPendingRequestsCount();
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

  const KpiCard = ({ title, value, subtitle, icon, color }) => (
    <Card style={styles.kpiCard}>
      <Card.Content style={{alignItems:'center'}}>
        <Avatar.Icon size={40} icon={icon} style={{backgroundColor: color || theme.colors.primary}} />
        <Title style={{ fontSize: 22, marginTop: 8, fontWeight:'bold' }}>{String(value ?? "0")}</Title>
        <Paragraph style={{ color: theme.colors.onSurfaceVariant, fontSize: 12, textAlign:'center' }}>{title}</Paragraph>
        {!!subtitle && <Paragraph style={{ fontSize: 10, color: '#666', marginTop:2 }}>{subtitle}</Paragraph>}
      </Card.Content>
    </Card>
  );

  const displayName = user?.name || user?.email || "Administrador";

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.headerContainer}>
            <Title style={[styles.title, { color: theme.colors.primary }]}>
            Hola, {displayName} 👋
            </Title>
            <Paragraph style={styles.subtitle}>
            Panel de control · Gestión Global
            </Paragraph>
        </View>

        {!!error && (
          <Card style={[styles.alertCard, { borderColor: theme.colors.error }]}>
            <Card.Content>
              <Paragraph style={{ color: theme.colors.error }}>{error}</Paragraph>
            </Card.Content>
          </Card>
        )}

        {loading ? (
          <View style={{ paddingVertical: 50 }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <>
            <View style={styles.sectionContainer}>
                <Paragraph style={styles.sectionTitle}>Resumen General</Paragraph>
                <View style={styles.kpiGrid}>
                <KpiCard
                    title="Clínicas"
                    value={stats.clinics_total}
                    subtitle={`Activas: ${stats.clinics_active}`}
                    icon="domain"
                />
                <KpiCard
                    title="Solicitudes"
                    value={stats.clinics_pending}
                    subtitle="Pendientes"
                    icon="file-document-edit"
                    color="#F39C12"
                />
                <KpiCard
                    title="Usuarios"
                    value={stats.users_total}
                    subtitle="Total Global"
                    icon="account-group"
                    color="#3498DB"
                />
                </View>
            </View>

            <Card style={styles.card}>
              <Card.Content>
                <Title style={{ marginBottom: 15, fontSize: 18 }}>Accesos rápidos</Title>

                <View style={styles.quickRow}>
                  <Button
                    mode="contained"
                    icon="domain"
                    style={styles.quickBtn}
                    contentStyle={{height: 50}}
                    buttonColor={theme.colors.primary}
                    onPress={() => navigation.navigate("Clinics")}
                  >
                    Clínicas
                  </Button>

                  <Button
                    mode="contained"
                    icon="account-multiple"
                    style={styles.quickBtn}
                    contentStyle={{height: 50}}
                    buttonColor="#555"
                    onPress={() => navigation.navigate("Users")}
                  >
                    Usuarios
                  </Button>
                </View>

                <Divider style={{ marginVertical: 20 }} />

                <Title style={{ marginBottom: 8, fontSize: 16 }}>Centro de control</Title>
                <Paragraph style={{ color: theme.colors.onSurfaceVariant, fontSize: 13, lineHeight: 20 }}>
                  Bienvenido al panel de Super Administrador. Desde aquí tienes control total sobre las veterinarias registradas y los usuarios del sistema.
                </Paragraph>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 15 }}>
                  <Chip icon="bell-check" style={{backgroundColor: '#e8f5e9'}}>Solicitudes</Chip>
                  <Chip icon="shield-account" style={{backgroundColor: '#e3f2fd'}}>Seguridad</Chip>
                  <Chip icon="database" style={{backgroundColor: '#fff3e0'}}>Base de Datos</Chip>
                </View>

              </Card.Content>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
      flex: 1,
      paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 0
  },
  headerContainer: {
      paddingHorizontal: 20,
      marginTop: 10,
      marginBottom: 10
  },
  title: { fontSize: 28, fontWeight: "bold" },
  subtitle: { fontSize: 14, opacity: 0.7, marginTop: 5 },

  sectionContainer: { paddingHorizontal: 16, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#555' },

  alertCard: { marginHorizontal: 16, marginTop: 8, borderWidth: 1, borderRadius: 14, backgroundColor: '#ffebee' },

  kpiGrid: { flexDirection: "row", justifyContent: 'space-between', gap: 10 },
  kpiCard: { flex: 1, borderRadius: 16, elevation: 2, backgroundColor: '#fff' },

  card: { marginHorizontal: 16, marginTop: 20, borderRadius: 20, elevation: 4, backgroundColor: '#fff', paddingBottom: 10 },
  quickRow: { flexDirection: "row", gap: 15 },
  quickBtn: { flex: 1, borderRadius: 12 },
});
