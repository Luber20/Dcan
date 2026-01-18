import React from 'react';
import { View, StyleSheet, ScrollView, Linking, Platform, Image, TouchableOpacity, StatusBar } from 'react-native';
import { Title, Text, Button, Card, Paragraph, Avatar, Divider, Chip } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from "../../context/AuthContext";

export default function ClinicDetailsScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { user } = useAuth();
    
    const { clinic } = route.params || {};

    if (!clinic) return null;

    // ✅ LÓGICA DE RETROCESO SEGURA
    const handleGoBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            // Si no hay historial, mandamos al directorio manualmente para que no se salga la app
            navigation.navigate("ClinicsDirectory");
        }
    };

    const openMap = () => {
        const query = encodeURIComponent(`${clinic.address}, ${clinic.canton}, ${clinic.province}`);
        const url = Platform.select({
            ios: `maps:0,0?q=${query}`,
            android: `geo:0,0?q=${query}`,
        });
        Linking.openURL(url);
    };

    const makeCall = () => {
        if (clinic.phone) Linking.openURL(`tel:${clinic.phone}`);
    };

    return (
        <View style={{flex: 1, backgroundColor: '#F5F7FA'}}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.headerContainer}>
                    {/* FOTO */}
                    {clinic.photo_url ? (
                        <Image source={{ uri: clinic.photo_url }} style={styles.headerImage} resizeMode="cover" />
                    ) : (
                        <View style={[styles.headerImage, styles.placeholderHeader]}>
                            <Avatar.Icon size={80} icon="hospital-building" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
                        </View>
                    )}

                    {/* ✅ BOTÓN DE ATRÁS FLOTANTE */}
                    <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={styles.contentContainer}>
                    <View style={styles.titleSection}>
                        <Title style={styles.title}>{clinic.name}</Title>
                        <View style={styles.badges}>
                            <Chip icon="map-marker">{clinic.canton}</Chip>
                            <Chip icon="clock">{clinic.hours || "Consultar horario"}</Chip>
                        </View>
                    </View>

                    <Card style={styles.card}>
                        <Card.Content>
                            <Title style={styles.cardTitle}>Información</Title>
                            <Paragraph>{clinic.description || "Sin descripción detallada."}</Paragraph>
                            <Divider style={{marginVertical: 10}}/>
                            <View style={styles.row}><Ionicons name="location" size={20} color="green"/><Text> {clinic.address}</Text></View>
                            <View style={styles.row}><Ionicons name="call" size={20} color="green"/><Text> {clinic.phone}</Text></View>
                        </Card.Content>
                    </Card>

                    <View style={styles.actionRow}>
                        <Button mode="outlined" onPress={openMap} style={{flex:1}}>Mapa</Button>
                        <Button mode="contained" onPress={makeCall} style={{flex:1, backgroundColor: '#2E8B57'}}>Llamar</Button>
                    </View>

                    <Button 
                        mode="contained" 
                        icon={user ? "calendar-check" : "login"}
                        style={{backgroundColor: '#1E293B', marginTop: 10}}
                        onPress={() => {
                            if (!user) {
                                navigation.navigate("Login", { selectedClinic: clinic });
                            } else {
                                navigation.navigate("ClientDashboard", { screen: "Citas", params: { screen: "Agendar" } });
                            }
                        }}
                    >
                        {user ? "Agendar Cita Ahora" : "Inicia sesión para Agendar"}
                    </Button>
                    
                    <View style={{height: 30}} />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: { position: 'relative' }, // Necesario para posicionar el botón encima
    headerImage: { width: '100%', height: 250, backgroundColor: '#2E8B57' },
    placeholderHeader: { alignItems: 'center', justifyContent: 'center' },
    
    // ESTILOS DEL BOTÓN ATRÁS
    backButton: {
        position: 'absolute',
        top: 45, // Baja un poco para no chocar con la barra de estado
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.5)', // Fondo semitransparente para que se vea
        padding: 8,
        borderRadius: 20,
        zIndex: 10, // Asegura que esté encima de la imagen
    },

    contentContainer: { padding: 20, marginTop: -30 }, // Subimos el contenido un poco
    titleSection: { backgroundColor: 'white', borderRadius: 15, padding: 20, marginBottom: 20, elevation: 4, alignItems: 'center' },
    title: { fontSize: 22, fontWeight: 'bold', textAlign:'center', marginBottom:10 },
    badges: { flexDirection: 'row', gap: 10 },
    card: { marginBottom: 15, backgroundColor: 'white', borderRadius: 15 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    row: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
    actionRow: { flexDirection: 'row', gap: 15, marginVertical: 10 },
});