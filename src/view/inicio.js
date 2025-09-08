import { StyleSheet, View, Text, Button, Image, TextInput, TouchableOpacity } from "react-native";
import { useFonts, Kavoon_400Regular } from '@expo-google-fonts/kavoon';

import React from "react";

import { useNavigation } from "@react-navigation/native";

export default function inicio() {
    const navigation = useNavigation();

    const [fontsLoaded] = useFonts({
        Kavoon_400Regular,
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Image source={require('../assets/fondo/ari.png')} style={styles.imagen1} />

            <View style={{ alignContent: 'center', alignItems: 'center' }}>
                <Image source={require('../assets/Logo.png')} style={styles.lg1} />
                <Text style={styles.tex}>EduKid's</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Home")}>
                <Text style={styles.buttonText}>Acceder</Text>
            </TouchableOpacity>
            <Image source={require('../assets/fondo/aba.png')} style={styles.imagen2} />

        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        alignItems: 'center',
        top: 150,


    },
    imagen2: {
        top: 5,
    },
    imagen1: {
        marginBottom: 10,
        marginTop: -320,
    },
    lg1: {
        width: 300,
        height: 300,
        borderWidth: 4,
        borderRadius: 150,
        borderColor: '#34B0A6',
        bottom: 50,
    },
    tex: {
        bottom: 40,
        fontSize: 40,
        fontFamily: 'Kavoon_400Regular',
    },
    button: {
        color: '#ffffff',
        backgroundColor: '#34B0A6',
        borderRadius: 50,
        width: 300,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        bottom: 20,
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 25,
    },
    ImLog: {
        marginTop: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    item: {
        resizeMode: 'contain',

    }



})