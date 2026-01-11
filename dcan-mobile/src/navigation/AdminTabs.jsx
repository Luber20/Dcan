import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from 'react-native-animatable';
import HeaderRightLogout from "../components/HeaderRightLogout";

// Import screens
import ClinicManagement from "../screens/admin/ClinicManagement";
import StaffManagement from "../screens/admin/StaffManagement";
import ClientManagement from "../screens/admin/ClientManagement";
import AppointmentManagement from "../screens/admin/AppointmentManagement";
import ClinicsList from "../screens/admin/ClinicsList";
import ClinicEdit from "../screens/admin/ClinicEdit";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack para Clínica
function ClinicStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ClinicHome" component={ClinicManagement} options={{ headerShown: false }} />
      <Stack.Screen name="ClinicsList" component={ClinicsList} options={{ title: "Todas las Clínicas" }} />
      <Stack.Screen name="ClinicEdit" component={ClinicEdit} options={{ title: "Editar Clínica" }} />
    </Stack.Navigator>
  );
}

export default function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerRight: () => <HeaderRightLogout />,
        headerStyle: { backgroundColor: "#2E8B57" },
        headerTintColor: "#fff",
        tabBarActiveTintColor: "#2E8B57",
      }}
    >
      <Tab.Screen
        name="Clinic"
        component={ClinicStack}
        options={{
          title: "Clínica",
          tabBarIcon: ({ color, size, focused }) => (
            <Animatable.View animation={focused ? "bounce" : undefined} duration={500}>
              <Ionicons name="paw" size={size} color={color} />
            </Animatable.View>
          ),
        }}
      />
      <Tab.Screen
        name="Staff"
        component={StaffManagement}
        options={{
          title: "Personal",
          tabBarIcon: ({ color, size, focused }) => (
            <Animatable.View animation={focused ? "bounce" : undefined} duration={500}>
              <Ionicons name="paw" size={size} color={color} />
            </Animatable.View>
          ),
        }}
      />
      <Tab.Screen
        name="Clients"
        component={ClientManagement}
        options={{
          title: "Clientes",
          tabBarIcon: ({ color, size, focused }) => (
            <Animatable.View animation={focused ? "bounce" : undefined} duration={500}>
              <Ionicons name="paw" size={size} color={color} />
            </Animatable.View>
          ),
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentManagement}
        options={{
          title: "Citas",
          tabBarIcon: ({ color, size, focused }) => (
            <Animatable.View animation={focused ? "bounce" : undefined} duration={500}>
              <Ionicons name="paw" size={size} color={color} />
            </Animatable.View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
