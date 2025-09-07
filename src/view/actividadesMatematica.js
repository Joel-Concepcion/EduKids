import { StyleSheet, View, Text, Button, Image, TextInput, TouchableOpacity, Dimensions } from "react-native";
import React, { useRef, useEffect, useState } from 'react';
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import { useFonts } from 'expo-font';
import * as Speech from 'expo-speech';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import appFirebase from "../model/Firebase";

const db = getFirestore(appFirebase);

export default function actividadesMatematica() {
    const navigation = useNavigation();
    const [clases, setClases] = useState([]);
    const [mostrarBotones, setMostrarBotones] = useState(false);
    const [mostrarBotones1, setMostrarBotones1] = useState(false);

    const [fontsLoaded] = useFonts({
        CenturyGothic: require('../assets/fonts/3394-font.ttf'),
        CenturyGothicBold: require('../assets/fonts/Century-Gothic-Bold.ttf'),
        CenturyGothicBold1a: require('../assets/fonts/4410-font.ttf'),
    });

    useEffect(() => {
        const obtenerClases = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "clases"));
                const clasesObtenidas = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setClases(clasesObtenidas);
            } catch (error) {
                console.error("Error al obtener clases:", error);
            }
        };

        const unsubscribe = navigation.addListener('focus', obtenerClases);
        return unsubscribe;
    }, [navigation]);

    if (!fontsLoaded) return null;

    return (

        <View style={styles.container} >

            <ScrollView>
                <View style={styles.vwima}>

                    <TouchableOpacity onPress={() => setMostrarBotones(prev => !prev)}>
                        <Image source={require('../assets/game/img mate/aprendeSumar.jpg')} style={styles.ima1} />
                    </TouchableOpacity>

                    {mostrarBotones && (
                        <View style={styles.btclas}>
                            <TouchableOpacity style={styles.bt1}>
                                <Text style={styles.txt}>Agregar a clase</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.bt1} onPress={() => navigation.navigate('Juego de Sumas')}>
                                <Text style={styles.txt1}>Jugar</Text>
                            </TouchableOpacity>
                        </View>
                    )}


                </View>

                 <View style={styles.vwima}>

                    <TouchableOpacity onPress={() => setMostrarBotones1(prev => !prev)}>
                        <Image source={require('../assets/game/literatura/formarPalabras.jpeg')} style={styles.ima1} />
                    </TouchableOpacity>

                    {mostrarBotones1 && (
                        <View style={styles.btclas}>
                            <TouchableOpacity style={styles.bt1}>
                                <Text style={styles.txt}>Agregar a clase</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.bt1} onPress={() => navigation.navigate('Juego de Palabras')}>
                                <Text style={styles.txt1}>Jugar</Text>
                            </TouchableOpacity>
                        </View>
                    )}


                </View>
            </ScrollView>

            <Text>Hola actividades matematica</Text>

        </View>
    )
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        alignItems: 'center',
        width: Dimensions.get('window').width,
        
    },
    vwima: {
        marginBottom: 15,
        alignItems: 'center',
        textAlign: 'center',
        marginTop: 10,
    },
    ima1: {
        width: 370,
        height: 175,
        borderRadius: 30,
        borderColor: '#34B0A6',
        borderWidth: 6,
    },
    btclas: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
        alignItems: 'center',
        textAlign: 'center',
        width: '90%',
        marginTop: 10,

    },
    bt1: {
        backgroundColor: '#34B0A6',
        width: 130,
        height: 50,
        marginBottom: 10,
        marginHorizontal: 5,
        borderRadius: 10,
    },
    txt: {
        fontFamily: 'CenturyGothicBold1a',
        top: 15,
        left: 10,
    },
    txt1: {
        fontFamily: 'CenturyGothicBold1a',
        top: 15,
        left: 45,
    },
})