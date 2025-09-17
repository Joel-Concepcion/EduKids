import React from "react";
import { Image } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";

import "react-native-gesture-handler";

// Archivos
import inicio from "./src/view/inicio";
import Registro from "./src/view/registro";
import progreso from "./Screens/progreso";
import ajustes from "./src/view/ajustes";
import IA from "./src/view/IA/IA";
import crearClase from "./src/view/clase/crearClase";
import clase from "./src/view/clase/clase"
import login from "./src/view/log/login";
import registroAlumno from "./src/view/registroAlumno/registroAlumno"

import Juego1Suma from "./src/view/game/matematica/juego1Suma";
import JuegoPalabras from "./src/view/game/literatura/formarPalabras1";
import JuegoFormas from "./src/view/game/formas/juegoFormas1";

import home from "./src/view/home";


// TabNavigator que incluye StackMenu
const Tab = createBottomTabNavigator();

function MyTabs() {
    return (
        <Tab.Navigator initialRouteName="Home" screenOptions={{ tabBarActiveTintColor: "#3E8FCC" }}>
            <Tab.Screen
                name="Home"
                component={home}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <Image
                            source={require('./src/assets/iconosDNV/Home.png')}
                            style={{
                                width: 24,
                                height: 24,
                                tintColor: focused ? '#34B0A6' : '#99E7D9'
                            }}
                        />
                    ),
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name="Registro "
                component={Registro}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <Image
                            source={require('./src/assets/iconosDNV/Registro (1).png')}
                            style={{
                                width: 24,
                                height: 24,
                                tintColor: focused ? '#34B0A6' : '#99E7D9'
                            }}
                        />
                    ),
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name="Ajustes"
                component={ajustes}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <Image
                            source={require('./src/assets/iconosDNV/ajustes.png')}
                            style={{
                                width: 24,
                                height: 24,
                                tintColor: focused ? '#34B0A6' : '#99E7D9'
                            }}
                        />
                    ),
                    headerShown: false,
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
            <Stack.Screen name="Registro" component={Registro} />
            <Stack.Screen name="Progreso" component={progreso} />
            <Stack.Screen name="Ajustes" component={ajustes} />
            <Stack.Screen name="IA" component={IA} />
            <Stack.Screen name="Crear Clase" component={crearClase} />
            <Stack.Screen name="Clase" component={clase} />
            <Stack.Screen name="login" component={login} options={{ headerShown: false }} />
            <Stack.Screen name="Registro alumno" component={registroAlumno} />

            <Stack.Screen name="Juego de Sumas" component={Juego1Suma} options={{ title: 'Juego Montessori de Sumas' }} />
            <Stack.Screen name="Juego de Palabras" component={JuegoPalabras} options={{ title: 'Juego Montessori de Palabras' }} />
            <Stack.Screen name="Formas" component={JuegoFormas} options={{ title: 'Juego Montessori de formas' }} />
        </Stack.Navigator>
    );
}
export default function Navegacion() {
    return (
        <NavigationContainer>
            <StackMenu />
        </NavigationContainer>
    );
}
