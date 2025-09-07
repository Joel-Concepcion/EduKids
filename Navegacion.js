import React from "react";
import { StyleSheet, View, Text, Alert, Image, TextInput, TouchableOpacity } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";

import "react-native-gesture-handler";

// Iconos
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Foundation from '@expo/vector-icons/Foundation';

//import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

// Archivos
import inicio from "./src/view/inicio";
import Home from "./src/view/home";
import registroAlumnos from "./src/view/registroAlumnos";
import configuración from "./src/view/configuración";
import crearClase from "./src/view/crearClase";
import registrarse from "./src/view/registrarse";
import Juego1Suma from "./src/view/game/matematica/juego1Suma";
import JuegoPalabras from "./src/view/game/literatura/formarPalabras1";
import JuegoFormas from "./src/view/game/formas/juegoFormas1";
import actividadesMatematica from "./src/view/actividadesMatematica";
import claseVista from "./src/view/claseVista";
import IA from "./src/view/IA1/IA";


// TabNavigator que incluye StackMenu
const Tab = createBottomTabNavigator();

function MyTabs() {
    return (
        <Tab.Navigator initialRouteName="Home" screenOptions={{ tabBarActiveTintColor: "#34B0A6" }}>
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    tabBarLabel: "Home",
                    tabBarIcon: ({ color, focused }) => (
                        <Image
                            source={require('./src/assets/iconosNavegacion/home.png')}
                            style={{
                                width: 30,
                                height: 30,
                                tintColor: focused ? color : undefined,
                            }}
                        />
                    ),
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name="Resgistro"
                component={registroAlumnos}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Image
                            source={require('./src/assets/iconosNavegacion/registro.png')}
                            style={{
                                width: 30,
                                height: 30,
                                tintColor: focused ? color : undefined,
                            }}
                        />
                    ),
                    headerShown: false,

                }}
            />
            <Tab.Screen
                name="Configuración"
                component={configuración}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Image
                            source={require('./src/assets/iconosNavegacion/ajustes.png')}
                            style={{
                                width: 30,
                                height: 30,
                                tintColor: focused ? color : undefined,
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
            <Stack.Screen name="Inicio" component={inicio} options={{ headerShown: false }}/>
            <Stack.Screen name="Home" component={MyTabs} options={{ headerShown: false }}/>
            <Stack.Screen name="Configuración" component={configuración}/>
            <Stack.Screen name="Registrar alumno" component={registroAlumnos}/>
            <Stack.Screen name="Resgistro" component={registrarse}/>
            <Stack.Screen name="Crear clase" component={crearClase}/>
            <Stack.Screen name="Juego de Sumas" component={Juego1Suma} options={{ title: 'Juego Montessori de Sumas' }}/>
            <Stack.Screen name="Juego de Palabras" component={JuegoPalabras} options={{ title: 'Juego Montessori de Palabras' }}/>
            <Stack.Screen name="Formas" component={JuegoFormas} options={{title: 'Juego Montessori de formas'}}/>
            <Stack.Screen name="Actividades de matemática" component={actividadesMatematica}/>
            <Stack.Screen name="Clase" component={claseVista} options={{ headerShown: false}}/>
            <Stack.Screen name="IA" component={IA}/>
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
