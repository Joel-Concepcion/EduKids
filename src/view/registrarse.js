import { StyleSheet, View, Text, Button, Image, TextInput, TouchableOpacity } from "react-native";
import { useFonts, Kavoon_400Regular } from '@expo-google-fonts/kavoon';

import React from "react";

import { useNavigation } from "@react-navigation/native";

export default function registrarse () {
    const navigation = useNavigation();
    const [fontsLoaded] = useFonts({ Kavoon_400Regular });  
}