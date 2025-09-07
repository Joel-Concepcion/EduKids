import { StyleSheet, View, Text, Button, Image, TextInput, TouchableOpacity, Dimensions } from "react-native";
import React, { useRef, useEffect, useState } from 'react';
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import { useFonts } from 'expo-font';
import * as Speech from 'expo-speech';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import appFirebase from "../model/Firebase";

const db = getFirestore(appFirebase);

const bannerMap = {
    'Rectangle 18.png': require('../assets/bannerClase/Rectangle 18.png'),
    'Rectangle 19.png': require('../assets/bannerClase/Rectangle 19.png'),
    'Rectangle 20.png': require('../assets/bannerClase/Rectangle 20.png'),
    'Rectangle 21.png': require('../assets/bannerClase/Rectangle 21.png'),
    'Rectangle 22.png': require('../assets/bannerClase/Rectangle 22.png'),
};
export default function Home() {
    const navigation = useNavigation();
    const [clases, setClases] = useState([]);

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

            <View style={styles.header}>
                <Text style={{
                    fontSize: 30,
                    left: 45,
                    fontSize: 32,
                    bottom: 25,
                    fontFamily: 'CenturyGothicBold1a',
                    color: '#000000'
                }}>
                    Hola, Profesor/a
                </Text>
                <Image
                    source={require('../assets/pantallaPrf/img profesor.png')}
                    style={{
                        left: 80,
                        top: 25,
                    }} />

                <TouchableOpacity
                    style={styles.botonCrear}
                    onPress={() => navigation.navigate('Crear clase')}
                >
                    <Text style={{
                        fontFamily: 'CenturyGothicBold1a',
                        color: '#ffffff',
                    }}>Crear Clase</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.texl}>Actividades disponibles:</Text>

            {/*Iconos de las actividades*/}
            <View style={styles.actividades}>

                <TouchableOpacity
                    onPress={() => navigation.navigate('Actividades de matemática')}
                >
                    <Image source={require('../assets/actividades/Mate.png')} style={styles.icono} />
                    <Text style={{ fontFamily: 'CenturyGothicBold1a', fontSize: 12, top: 5 }}>Matemática</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Image source={require('../assets/actividades/lite.png')} style={styles.icono} />
                    <Text style={{ fontFamily: 'CenturyGothicBold1a', fontSize: 12, top: 5, left: 7 }}>Literatura</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Image source={require('../assets/actividades/figu.png')} style={styles.icono} />
                    <Text style={{ fontFamily: 'CenturyGothicBold1a', fontSize: 12, top: 5, left: 15 }}>Formas</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Image source={require('../assets/actividades/sonido.png')} style={styles.icono} />
                    <Text style={{ fontFamily: 'CenturyGothicBold1a', fontSize: 12, top: 5, left: 15 }}>Sonido</Text>
                </TouchableOpacity>
            </View>


            <TouchableOpacity style={styles.ultima}>
                <Image source={require('../assets/actividades/cues.png')} style={styles.icono} />
                <Text style={{ fontFamily: 'CenturyGothicBold1a', fontSize: 12, top: 5 }}>Mini-quizzes</Text>
            </TouchableOpacity>

            {/*Esta es la cion donde se mostraran las clases registradas*/}
            <Text style={{ fontFamily: 'CenturyGothic', fontSize: 25, color: '#000000', bottom: 215, right: 150, }}>Clases:</Text>
            <ScrollView style={styles.scrollClass}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {clases.map((clase) => (

                    <View key={clase.id} style={styles.ViewConten}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Clase')}
                        >
                            <Image source={bannerMap[clase.banner]} style={styles.imaClas} />
                            <Text style={styles.textClas}>Clase: {clase.nombreClase} </Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
            <TouchableOpacity style={styles.IA} onPress={() => navigation.navigate('IA')}>
                <Image source={require('../assets/IA.png')} />
            </TouchableOpacity>
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
        marginTop: 170,
    },
    header: {
        width: Dimensions.get('window').width,
        height: 150,
        backgroundColor: '#99E7D9',
        color: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        bottom: 250,
    },
    texl: {
        fontSize: 25,
        fontFamily: 'CenturyGothic',
        bottom: 250,
        right: 40,

    },
    botonCrear: {
        alignItems: 'center',
        textAlign: 'center',
        justifyContent: 'center',
        width: 120,
        height: 40,
        borderRadius: 50,
        backgroundColor: '#34B0A6',
        padding: 10,
        height: 40,
        borderRadius: 50,
        fontSize: 16,
        flexDirection: 'row',
        right: 180,
        top: 45,
    },

    actividades: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
        width: '90%',
        bottom: 230,
    },
    icono: {
        width: 60,
        height: 60,
        marginHorizontal: 5,
        boottom: 150,
    },
    ultima: {
        marginTop: 10,
        alignSelf: 'flex-start',
        left: 22,
        bottom: 220,

    },
    scrollClass: {
        width: '100%',
        height: 370,
        position: 'absolute',
        bottom: 230,
        top: 260,

    },
    scrollContent: {
        paddingBottom: 25,
        alignItems: 'center',
    },
    ViewConten: {
        padding: 20,
        marginTop: 50,
        bottom: 60,
        alignItems: 'center',
        marginBottom: 15,
    },
    imaClas: {
        width: 374,
        height: 170,
        borderColor: '#000',
        borderWidth: 3,
        borderRadius: 20,
        opacity: 0.5,
    },
    textClas: {
        fontFamily: 'CenturyGothicBold1a',
        fontSize: 15,
        marginTop: -120,
        color: '#000',
        left: 130,
        bottom: 30,
    },
    IA:{
        top:  60,
        left: 150,
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#99E7D9',
        borderRadius: 20,
        borderWidth: 4,
        borderColor: '#34B0A6',
    },
})

