import { StyleSheet, View, Text, Button, Image, TextInput, TouchableOpacity } from "react-native";
import { useFonts, Kavoon_400Regular } from '@expo-google-fonts/kavoon';


import React from "react";

import { useNavigation } from "@react-navigation/native";

export default function inicio() {
    const navigation = useNavigation();
    const [fontsLoaded] = useFonts({ Kavoon_400Regular });

    if (!fontsLoaded) return null; // Evita renderizar antes de que la fuente esté lista

    return (
        <View style={styles.container}>
            <Image source={require('../assets/Image/ima1.png')} style={styles.imagen1} />
            <Image source={require('../assets/logo/logo.png')} style={styles.lg1} />
            <Text style={styles.tex}>EduKid's</Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Home")}>
                <Text style={styles.buttonText}>Acceder</Text>
            </TouchableOpacity>
            <Image source={require('../assets/Image/ima2.png')} style={styles.imagen2} />

        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        alignItems: 'center',
        position: 'relative',


    },
    imagen2: {
        marginTop: 10,
    },
    imagen1: {
        marginTop: 10,
    },
    lg1: {
        marginTop: 10,
        marginLeft: 5,
        borderWidth: 4,
        borderRadius: 150,
        borderColor: '#34B0A6',
    },
    tex: {
        fontSize: 30,
        marginTop: 25,
        marginBottom: 5,
        fontFamily: 'Kavoon_400Regular',
        color: '#000000',
    },
    button: {
        color: '#ffffff',
        backgroundColor: '#34B0A6',
        borderRadius: 50,
        width: 250,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#99E7D9',
        shadowOffset: { width: 10, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 20,
        marginTop: 25,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 25,
        fontFamily: 'Kavoon_400Regular',
    },


})