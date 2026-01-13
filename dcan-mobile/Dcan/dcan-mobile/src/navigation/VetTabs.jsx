import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Importa tus pantallas (asegúrate de que existan en tu carpeta de screens)
import VeterinarianHomeScreen from '../screens/veterinario/VeterinarianHomeScreen';
import AgendaScreen from '../screens/veterinario/AgendaScreen';
import GestionMedicaScreen from '../screens/veterinario/GestionMedicaScreen';
import DisponibilidadScreen from '../screens/veterinario/DisponibilidadScreen';

const Tab = createBottomTabNavigator();

export default function VeterinarianTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Inicio') iconName = 'home';
          else if (route.name === 'Agenda') iconName = 'calendar-clock';
          else if (route.name === 'Pacientes') iconName = 'stethoscope';
          else if (route.name === 'Horarios') iconName = 'clock-outline';

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2E8B57', // El verde de tu interfaz
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Inicio" component={VeterinarianHomeScreen} />
      <Tab.Screen name="Agenda" component={AgendaScreen} />
      <Tab.Screen name="Pacientes" component={GestionMedicaScreen} />
      <Tab.Screen name="Horarios" component={DisponibilidadScreen} />
    </Tab.Navigator>
  );
}