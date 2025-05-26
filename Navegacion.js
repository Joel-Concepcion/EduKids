import React from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";

import "react-native-gesture-handler";

// Iconos
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
//import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

// Archivos
import inicio from "./Screens/inicio";
import home from "./Screens/home";
import actividades from "./Screens/actividades";
import progreso from "./Screens/progreso";
import ajustes from "./Screens/ajustes";


// TabNavigator que incluye StackMenu
const Tab = createBottomTabNavigator();

function MyTabs() {
    return (
        <Tab.Navigator initialRouteName="Home" screenOptions={{ tabBarActiveTintColor: "#3E8FCC" }}>
            <Tab.Screen 
                name="Home" 
                component={home} 
                options={{
                    tabBarLabel: "Home",
                    tabBarIcon: ({ color }) => (
                    <Ionicons name="home" size={24} color={color} />
                    ),
                    headerShown: false,
                }}  
            />
            <Tab.Screen 
                name="Actividades " 
                component={actividades} 
                options={{
                    tabBarIcon: ({ color }) => <FontAwesome6 name="cubes-stacked" size={24} color={color} />,
                }} 
            />
            <Tab.Screen 
                name="Progreso" 
                component={progreso} 
                options={{
                    tabBarIcon: ({ color }) => <Ionicons name="bar-chart-outline" size={24} color={color} />,
                }} 
            />
            <Tab.Screen 
                name="Ajustes" 
                component={ajustes} 
                options={{
                    tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={24} color={color} />,
                }} 
            />
        </Tab.Navigator>
    );
}

// StackNavigator para gestionar pantallas dentro de "Home"
const Stack = createStackNavigator();

function StackMenu() {
    return (
        <Stack.Navigator initialRouteName="Inicio">
            <Stack.Screen name="Inicio" component={inicio} options={{ headerShown: false }} />
            <Stack.Screen name="Home" component={MyTabs} options={{ headerShown: false }} />
            <Stack.Screen name="Actividades" component={actividades} />
            <Stack.Screen name="Progreso" component={progreso} />
            <Stack.Screen name="Ajustes" component={ajustes} />
        </Stack.Navigator>
    );
}
export default function Navegacion() {
    return (
        <NavigationContainer>
            <StackMenu/>
        </NavigationContainer>
    );
}
