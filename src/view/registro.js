import { StyleSheet, View, Text, Button, Image, TextInput, TouchableOpacity, Dimensions } from "react-native";
import React, { useState, useEffect } from 'react';
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import * as Font from 'expo-font';

import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDocs
} from 'firebase/firestore';
import appFirebase from '../model/db';
const db = getFirestore(appFirebase);

const fetchFonts = () => {
    return Font.loadAsync({
        'CenturyGothic': require('../assets/font/3394-font.ttf'),
        'CenturyGothic-Bold': require('../assets/font/4410-font.ttf'),
    });
};

export default function Registro() {
    const navigation = useNavigation();
    const [fontsLoaded, setFontsLoaded] = useState(false);


    const [clasesRegistradas, setClasesRegistradas] = useState([]);

    useEffect(() => {
        const obtenerClases = async () => {
            const snapshot = await getDocs(collection(db, 'clases'));
            const años = snapshot.docs
                .map(doc => doc.data())
                .filter(clase => clase.año) 
                .map(clase => clase.año);
            setClasesRegistradas(años);
        };

        obtenerClases();
    }, []);




    useEffect(() => {
        fetchFonts().then(() => setFontsLoaded(true));
    }, []);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.container}>

            <View style={styles.containerCuerpo}>

                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Registro alumno")}>
                    <Text style={styles.buttonText}>Registrar grupo de clase</Text>
                </TouchableOpacity>

                <ScrollView style={styles.scrollView}>
                    {clasesRegistradas.map((año, index) => (
                        <TouchableOpacity key={index} style={styles.button1}>
                            <Text style={styles.texto1}>Clase: {año}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>


            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 16,
        backgroundColor: "#ffffff",
    },
    containerCuerpo: {
        top: 30,
        bottom: 260,
    },
    button: {
        width: '100%',
        height: 70,
        justifyContent: "center",
        backgroundColor: "#34B0A6",
        padding: 12,
        borderRadius: 20,
    },
    buttonText: {
        color: "#fff",
        fontSize: 25,
        textAlign: "center",
        fontFamily: "CenturyGothic-Bold",
    },
    scrollView: {
        marginTop: 10,
        height: 650,
        borderRadius: 10,
        padding: 10,

    },
    button1: {
        backgroundColor: '#34B0A6',
        padding: 15,
        borderRadius: 40,
        height: 150,
        justifyContent: 'center',
        marginBottom: 12,
        bottom: 5,
    },
    texto1: {
        left: 90,
        fontSize: 25,
        color: '#ffffff',
        fontFamily: 'CenturyGothic-Bold',
    },
});
