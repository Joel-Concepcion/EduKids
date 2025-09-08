import { StyleSheet, View, Text, Button, Image, TextInput, TouchableOpacity, Dimensions } from "react-native";
import React, { useState, useEffect } from 'react';
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import * as Font from 'expo-font';

const fetchFonts = () => {
    return Font.loadAsync({
        'CenturyGothic': require('../../assets/font/3394-font.ttf'),
        'CenturyGothic-Bold': require('../../assets/font/4410-font.ttf'),
    });
};

export default function crearClase() {
    const navigation = useNavigation();
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        fetchFonts().then(() => setFontsLoaded(true));
    }, []);

    if (!fontsLoaded) {
        return null;
    }

    return (

        <View style={styles.container}>
            <Text style={styles.title}>Nombre de la clase</Text>

            <TextInput style={styles.input}/>

                  <Text style={styles.title}>Aula</Text>

            <TextInput style={styles.input}/>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Clase")}>
                <Text style={styles.buttonText}>Crear Clase</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#ffffff",
    },
    title: {
        fontSize: 24,
        fontFamily: 'CenturyGothic-Bold',
        marginTop: 20,
    },
    input: {
        height: 60,
        backgroundColor: '#34B0A6',
        borderColor: '#34B0A6',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 20,
        marginTop: 10,
        fontSize: 16,
        fontFamily: 'CenturyGothic',
        color: '#ffffff',
    },
    button: {
        backgroundColor: '#34B0A6',
        padding: 15,
        width: 200,
        height: 70,
        alignItems: 'center',
        color: '#ffffff',
        borderRadius: 20,
        alignItems: 'center',
        left: 90,
        marginTop: 20,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontFamily: 'CenturyGothic-Bold',
        textAlign: 'center',
        top: 8,
    },
});