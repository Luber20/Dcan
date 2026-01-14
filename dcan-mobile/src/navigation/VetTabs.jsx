import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import VeterinarianHomeScreen from '../screens/Veterinario/VeterinarioHomeScreen';
import AgendaScreen from '../screens/Veterinario/AgendaScreen'; 
import GestionMedicaScreen from '../screens/Veterinario/GestionMedicaScreen';
import DisponibilidadScreen from '../screens/Veterinario/DisponibilidadScreen';
import PerfilScreen from '../screens/Veterinario/PerfilScreen'; // 1. Importamos Perfil

const Tab = createBottomTabNavigator();

export default function VeterinarianTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Inicio') iconName = 'home';
          else if (route.name === 'Agenda') iconName = 'calendar';
          else if (route.name === 'Pacientes') iconName = 'paw';
          else if (route.name === 'Horarios') iconName = 'time';
          else if (route.name === 'Perfil') iconName = 'person'; // Icono de persona
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2E8B57',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Inicio" component={VeterinarianHomeScreen} />
      <Tab.Screen name="Agenda" component={AgendaScreen} />
      <Tab.Screen name="Pacientes" component={GestionMedicaScreen} />
      <Tab.Screen name="Horarios" component={DisponibilidadScreen} />
      
      {/* 2. Registramos la pestaña de Perfil */}
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}