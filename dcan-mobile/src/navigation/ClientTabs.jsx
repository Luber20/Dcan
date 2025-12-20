import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import HeaderRightLogout from "../components/HeaderRightLogout";

import HomeScreen from "../screens/client/HomeScreen";
import PetsScreen from "../screens/client/PetsScreen";
import ScheduleScreen from "../screens/client/ScheduleScreen";
import AppointmentsScreen from "../screens/client/AppointmentsScreen";
import ProfileScreen from "../screens/client/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function ClientTabs({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerRight: () => <HeaderRightLogout navigation={navigation} />,
        headerStyle: { backgroundColor: "#2E8B57", height: 100 },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold", fontSize: 22 },
        tabBarActiveTintColor: "#2E8B57",
        tabBarInactiveTintColor: "#888",
        tabBarStyle: { 
          height: 100,  // Aumentamos un poco la altura
          paddingBottom: 20,  // ← Esto sube los icons y labels un poco más arriba
          paddingTop: 10, 
          borderTopWidth: 0, 
          elevation: 10,
          backgroundColor: "#fff"
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} />,
        }}
      />
      <Tab.Screen
        name="Mascotas"
        component={PetsScreen}
        options={{
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="paw" size={34} color={color} />,
        }}
      />
      <Tab.Screen
        name="Agendar"
        component={ScheduleScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={28} color={color} />,
        }}
      />
      <Tab.Screen
        name="Mis Citas"
        component={AppointmentsScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="time" size={28} color={color} />,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="person" size={28} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}