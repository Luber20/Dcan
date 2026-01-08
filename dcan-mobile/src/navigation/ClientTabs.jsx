import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Button } from "react-native-paper";
import HeaderRightLogout from "../components/HeaderRightLogout";
import axios from "axios";
import { API_URL } from "../config/api"; 
import { useAuth } from "../context/AuthContext"; 

// --- IMPORTACIÓN DE PANTALLAS ---
import HomeScreen from "../screens/client/HomeScreen";
import PetsScreen from "../screens/client/PetsScreen";
import AddPetScreen from "../screens/client/AddPetScreen";
import EditPetScreen from "../screens/client/EditPetScreen"; 
import ScheduleScreen from "../screens/client/ScheduleScreen";
import AppointmentsScreen from "../screens/client/AppointmentsScreen";
import ProfileScreen from "../screens/client/ProfileScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 1️⃣ Stack de Mascotas
function PetsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PetsList" component={PetsScreen} options={{ headerShown: false }} />
      <Stack.Screen 
        name="AddPet" 
        component={AddPetScreen} 
        options={{ title: "Nueva Mascota", headerStyle: { backgroundColor: "#2E8B57" }, headerTintColor: "#fff" }} 
      />
      <Stack.Screen 
        name="EditPet" 
        component={EditPetScreen} 
        options={{ title: "Editar Mascota", headerStyle: { backgroundColor: "#2E8B57" }, headerTintColor: "#fff" }} 
      />
    </Stack.Navigator>
  );
}

// 2️⃣ DICCIONARIO DE PANTALLAS
const SCREEN_COMPONENTS = {
  "HomeScreen": HomeScreen,
  "PetsStack": PetsStack,
  "ScheduleScreen": ScheduleScreen,
  "AppointmentsScreen": AppointmentsScreen,
  "ProfileScreen": ProfileScreen
};

// 3️⃣ Tab Navigator Dinámico
export default function ClientTabs({ navigation }) {
  const { logout } = useAuth(); 
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyMenu();
  }, []);

  const fetchMyMenu = async () => {
    try {
      const response = await axios.get(`${API_URL}/my-menu`);
      setMenus(response.data);
    } catch (error) {
      // 👇 ESTE LOG ES IMPORTANTE PARA VER EL ERROR REAL
      console.log("❌ ERROR 500 DETALLADO:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName, color, size) => {
    if (iconName === "paw") {
      return <MaterialCommunityIcons name={iconName} size={size + 4} color={color} />;
    }
    return <Ionicons name={iconName} size={size} color={color} />;
  };

  // CASO 1: CARGANDO
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2E8B57" />
        <Text style={{marginTop: 10, color: '#666'}}>Cargando menú...</Text>
      </View>
    );
  }

  // CASO 2: ERROR O SIN MENÚS
  if (!menus || menus.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <MaterialCommunityIcons name="alert-circle-outline" size={60} color="#FFA500" />
        <Text style={{fontSize: 18, fontWeight: 'bold', marginTop: 10, textAlign: 'center'}}>
          No se encontraron menús
        </Text>
        <Text style={{textAlign: 'center', color: '#666', marginTop: 5, marginBottom: 20}}>
          Tu usuario no tiene pestañas asignadas.
        </Text>
        
        <Button 
            mode="contained" 
            onPress={logout} 
            style={{backgroundColor: "#2E8B57"}}
        >
            Cerrar Sesión
        </Button>
      </View>
    );
  }

  // CASO 3: ÉXITO
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
          height: 80,
          paddingBottom: 10,
          paddingTop: 10, 
          borderTopWidth: 0, 
          elevation: 10,
          backgroundColor: "#fff"
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600", marginBottom: 5 },
      }}
    >
      {menus.map((menu) => {
        const Component = SCREEN_COMPONENTS[menu.screen_name];

        if (!Component) return null;

        return (
          <Tab.Screen
            key={menu.id}
            name={menu.name}
            component={Component}
            options={{
              tabBarIcon: ({ color }) => getIcon(menu.icon, color, 28),
            }}
          />
        );
      })}
    </Tab.Navigator>
  );
}