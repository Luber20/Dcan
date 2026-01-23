import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Button, Title, Paragraph, Card, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

export default function ClinicManagement() {
  const navigation = useNavigation();
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.headerContainer}>
          <Avatar.Icon size={80} icon="hospital-building" style={{ backgroundColor: theme.colors.primary, marginBottom: 15 }} />
          <Title style={[styles.title, { color: theme.colors.primary }]}>Gestión de Clínicas</Title>
          <Paragraph style={styles.subtitle}>Administra tus sucursales veterinarias.</Paragraph>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.actionItem}>
              <Button icon="plus-circle" mode="contained" onPress={() => navigation.navigate('CreateClinic')} style={styles.button} contentStyle={{ height: 50 }}>
                Registrar Nueva Clínica
              </Button>
            </View>

            <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 15 }} />

            <View style={styles.actionItem}>
              <Button icon="format-list-bulleted" mode="outlined" onPress={() => navigation.navigate('ClinicsList')} style={[styles.button, { borderColor: theme.colors.primary }]} contentStyle={{ height: 50 }}>
                Ver Mis Clínicas
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 0 },
  scrollContent: { paddingBottom: 40 },
  headerContainer: { alignItems: 'center', marginBottom: 30, paddingHorizontal: 20 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { textAlign: 'center', color: '#666' },
  card: { marginHorizontal: 20, borderRadius: 20, elevation: 4, backgroundColor: 'white', paddingVertical: 10 },
  actionItem: { marginBottom: 5 },
  button: { borderRadius: 12 },
});