import React from 'react';
import { Platform } from 'react-native'; 
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 
import { Ionicons } from '@expo/vector-icons';

// Importaciones existentes
import VeterinarianHomeScreen from '../screens/Veterinario/VeterinarioHomeScreen';
import AgendaScreen from '../screens/Veterinario/AgendaScreen'; 
import GestionMedicaScreen from '../screens/Veterinario/GestionMedicaScreen';
import PerfilScreen from '../screens/Veterinario/PerfilScreen';

// --- IMPORTACIONES DE GESTIÓN DE HORARIOS ---
import DisponibilidadScreen from '../screens/Veterinario/DisponibilidadScreen'; // Ahora funciona como MENÚ
import HorariosBaseScreen from '../screens/Veterinario/HorariosBaseScreen';     // La lista Lunes-Domingo
import BloqueoFechasScreen from '../screens/Veterinario/BloqueoFechasScreen';   // El calendario

// Importaciones Scanner
import VetScannerScreen from '../screens/Veterinario/VetScannerScreen';
import VetPetDetailScreen from '../screens/Veterinario/VetPetDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ✅ 1. Stack para el Escáner (Cámara -> Ficha)
function ScannerStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ScannerMain" 
        component={VetScannerScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="VetPetDetail" 
        component={VetPetDetailScreen} 
        options={{ 
          title: "Ficha Médica", 
          headerStyle: { backgroundColor: '#2E8B57' }, 
          headerTintColor: '#fff' 
        }} 
      />
    </Stack.Navigator>
  );
}

// ✅ 2. STACK DE HORARIOS REESTRUCTURADO
function HorariosStack() {
  return (
    <Stack.Navigator>
      {/* 1° Pantalla: El menú con los dos botones grandes */}
      <Stack.Screen 
        name="DisponibilidadMain" 
        component={DisponibilidadScreen} 
        options={{ headerShown: false }} 
      />
      
      {/* 2° Pantalla: Configuración Lunes a Domingo */}
      <Stack.Screen 
        name="HorariosBase" 
        component={HorariosBaseScreen} 
        options={{ 
          title: "Horarios Base",
          headerShown: true,
          headerStyle: { backgroundColor: '#2E8B57' }, 
          headerTintColor: '#fff' 
        }} 
      />

      {/* 3° Pantalla: El Calendario para días libres */}
      <Stack.Screen 
        name="BloqueoFechas" 
        component={BloqueoFechasScreen} 
        options={{ 
          title: "Días Libres y Feriados",
          headerShown: true,
          headerStyle: { backgroundColor: '#2E8B57' }, 
          headerTintColor: '#fff' 
        }} 
      />
    </Stack.Navigator>
  );
}

export default function VeterinarianTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Inicio') iconName = 'home';
          else if (route.name === 'Agenda') iconName = 'calendar';
          else if (route.name === 'Escanear') iconName = 'qr-code';
          else if (route.name === 'Pacientes') iconName = 'paw';
          else if (route.name === 'Horarios') iconName = 'time';
          else if (route.name === 'Perfil') iconName = 'person';
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2E8B57',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#eee",
          borderTopWidth: 1,
          elevation: 10,
          height: Platform.OS === 'ios' ? 90 : 75, 
          paddingBottom: Platform.OS === 'ios' ? 30 : 15,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginBottom: 5
        },
      })}
    >
      <Tab.Screen name="Inicio" component={VeterinarianHomeScreen} />
      <Tab.Screen name="Agenda" component={AgendaScreen} />
      <Tab.Screen name="Escanear" component={ScannerStack} />
      <Tab.Screen name="Pacientes" component={GestionMedicaScreen} />

      {/* ✅ Pestaña de Horarios que contiene todo el Stack nuevo */}
      <Tab.Screen name="Horarios" component={HorariosStack} />

      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}