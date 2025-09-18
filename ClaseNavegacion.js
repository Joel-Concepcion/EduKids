// src/navigation/ClaseNavegacion.js
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image } from "react-native";
import React, { useState, useEffect } from 'react';
import * as Font from 'expo-font';

import Clase from "./src/view/clase/clase";
import Alumnos from "./src/view/clase/vistaAlumnos";

const fetchFonts = () => {
    return Font.loadAsync({
        'CenturyGothic': require('./src/assets/font/3394-font.ttf'),
        'CenturyGothic-Bold': require('./src/assets/font/4410-font.ttf'),
    });
};

const Tab = createBottomTabNavigator();

export default function ClaseNavegacion() {
   const [fontsLoaded, setFontsLoaded] = useState(false);

     useEffect(() => {
          fetchFonts().then(() => setFontsLoaded(true));
      }, []);
  
      if (!fontsLoaded) {
          return null;
      }

  return (
    <Tab.Navigator initialRouteName="Clase" 
    screenOptions={{
      tabBarActiveTintColor: "#3E8FCC", 
      tabBarStyle: {
      backgroundColor: '#99E7D9', 
      borderTopWidth: 2,
      borderTopColor: '#34B0A6',
      height: 70,
      paddingBottom: 10,
      paddingTop: 5,
      height: 120,
    },
    tabBarActiveTintColor: '#34B0A6',
    tabBarInactiveTintColor: '#ffffff',
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: 'bold',
      fontFamily: 'CenturyGothic',
    },}}>
      <Tab.Screen
        name="Clase"
        component={Clase}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('./src/assets/navN/solar_documents-bold.png')}
              style={{
                width: 40,
                height: 40,
                tintColor: focused ? '#34B0A6' : '#ffffff'
              }}
            />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Alumnos"
        component={Alumnos}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('./src/assets/navN/mdi_people-group.png')}
              style={{
                width: 40,
                height: 40,
                tintColor: focused ? '#34B0A6' : '#ffffff'
              }}
            />
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}
