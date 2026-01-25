import React from 'react';
import { Platform } from 'react-native'; // ✅ Importante para detectar iOS/Android
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // ✅ Necesario para el flujo del Escáner
import { Ionicons } from '@expo/vector-icons';

// Importaciones existentes
import VeterinarianHomeScreen from '../screens/Veterinario/VeterinarioHomeScreen';
import AgendaScreen from '../screens/Veterinario/AgendaScreen'; 
import GestionMedicaScreen from '../screens/Veterinario/GestionMedicaScreen';
import DisponibilidadScreen from '../screens/Veterinario/DisponibilidadScreen';
import PerfilScreen from '../screens/Veterinario/PerfilScreen';

// ✅ IMPORTACIONES NUEVAS (Asegúrate de que estén en esta carpeta)
import VetScannerScreen from '../screens/Veterinario/VetScannerScreen';
import VetPetDetailScreen from '../screens/Veterinario/VetPetDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ✅ 1. Creamos el Stack para el Escáner (Cámara -> Ficha)
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

export default function VeterinarianTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Inicio') iconName = 'home';
          else if (route.name === 'Agenda') iconName = 'calendar';
          else if (route.name === 'Escanear') iconName = 'qr-code'; // ✅ Nuevo Icono
          else if (route.name === 'Pacientes') iconName = 'paw';
          else if (route.name === 'Horarios') iconName = 'time';
          else if (route.name === 'Perfil') iconName = 'person';
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2E8B57',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        // ✅ Ajuste de altura para que se vea igual que el del Dueño y Cliente
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
      
      {/* ✅ 2. Agregamos la pestaña del Escáner al medio */}
      <Tab.Screen name="Escanear" component={ScannerStack} />

      <Tab.Screen name="Pacientes" component={GestionMedicaScreen} />
      <Tab.Screen name="Horarios" component={DisponibilidadScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}