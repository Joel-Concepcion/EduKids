import { StyleSheet, View, Text, Button, Image, TextInput, TouchableOpacity, Dimensions } from "react-native";
import React, { useState, useEffect } from 'react';
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import * as Font from 'expo-font';
import { Alert } from 'react-native';
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDocs,
} from 'firebase/firestore';
import appFirebase from '../../model/db';

const db = getFirestore(appFirebase);
const screenWidth = Dimensions.get('window').width;

const fetchFonts = () => {
    return Font.loadAsync({
        'CenturyGothic': require('../../assets/font/3394-font.ttf'),
        'CenturyGothic-Bold': require('../../assets/font/4410-font.ttf'),
    });
};

export default function listaAlumno() {
    const navigation = useNavigation();
    const [fontsLoaded, setFontsLoaded] = useState(false);

    const [listaAlumnos, setListaAlumnos] = useState([]);

    const obtenerAñoActual = () => new Date().getFullYear();

    const obtenerAlumnosDelAño = async () => {
        try {
            const añoActual = obtenerAñoActual();
            const alumnosRef = collection(db, 'alumnos');
            const snapshot = await getDocs(alumnosRef);

            const alumnosDelAño = snapshot.docs
                .map(doc => doc.data())
                .filter(alumno => alumno.año_registro === añoActual);

            setListaAlumnos(alumnosDelAño);
        } catch (error) {
            console.error('Error al obtener alumnos:', error);
            Alert.alert('Error', 'No se pudieron cargar los alumnos del año.');
        }
    };

    useEffect(() => {
        fetchFonts().then(() => setFontsLoaded(true));
        obtenerAlumnosDelAño();
    }, []);

    if (!fontsLoaded) return null;

    return (
        <View style={styles.container}>
            <View style={styles.contS}>
                <View style={styles.contScroll}>
                    <Text style={[styles.tex3, styles.font]}>Nombres apellido</Text>
                    <Text style={[styles.tex2, styles.font]}>Código</Text>
                </View>

                <ScrollView style={styles.scroll}>
                    {listaAlumnos.map((alumno, index) => (
                        <View key={index}>
                            <View
                                style={styles.card}
                            >
                                <Text style={[styles.texCon, styles.font, styles.code1]}>
                                    {alumno.nombres_apellidos}
                                </Text>
                                <Text style={[styles.texCon, styles.font, styles.code]}>
                                    {alumno.codigo_alumno}
                                </Text>
                            </View>

                        </View>
                    ))}
                </ScrollView>

                <TouchableOpacity
                    style={styles.btt}
                    onPress={async () => {
                        navigation.navigate('Registro alumno');
                    }}
                >
                    <Text style={[styles.tex11, styles.font]}>Añadir Alumno</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    font: {
        fontFamily: 'CenturyGothic-Bold',
        fontSize: 17,
    },
    tex11: {
        top: 10,
    },
    contScroll: {
        width: Dimensions.get('window').width,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 5,

    },
    tex2: {
        top: 8,
        left: -90,
    },
    tex3: {
        top: 8,
        left: 20,
    },
    scroll: {
        height: 10,
    },

    card: {
        width: 330,
        flexDirection: 'row',
        marginRight: 15,
        padding: 10,
        borderRadius: 10,
        justifyContent: 'space-between',
    },
    contS: {
        backgroundColor: '#99E7D9',
        height: 600,
        borderRadius: 30,
        width: 350,
        bottom: 70,
    },
    code: {
        left: 5,
        backgroundColor: '#34B0A6',
        borderRadius: 20,
        width: 100,
        height: 50,
        textAlign: 'center',
        textAlignVertical: 'center',
        fontSize: 14,
    },
    code1: {
        backgroundColor: '#34B0A6',
        borderRadius: 20,
        width: 200,
        height: 50,
        textAlign: 'center',
        textAlignVertical: 'center',
        fontSize: 14,
    },
    btt: {
        alignItems: 'center',
        width: 150,
        height: 50,
        borderRadius: 20,
        backgroundColor: '#34B0A6',
        left: 110,
        top: 70,
    },


})