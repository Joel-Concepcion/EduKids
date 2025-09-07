import { StyleSheet, View, Text, Button, Image, TextInput, TouchableOpacity, Dimensions } from "react-native";
import React, { useRef, useEffect, useState } from 'react';
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import { useFonts } from 'expo-font';
import * as Speech from 'expo-speech';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import appFirebase from "../model/Firebase";

const db = getFirestore(appFirebase);

export default function claseVista() {
    const navigation = useNavigation();
    const [clases, setClases] = useState([]);


    const [fontsLoaded] = useFonts({
        CenturyGothic: require('../assets/fonts/3394-font.ttf'),
        CenturyGothicBold: require('../assets/fonts/Century-Gothic-Bold.ttf'),
        CenturyGothicBold1a: require('../assets/fonts/4410-font.ttf'),
    });

    return (

        <View style={styles.container} >

            <View style={styles.banner}>
                <Image source={require('../assets/perfilDD.jpg')} style={styles.perfilProfe} />
                <Text>Prf:</Text>
                <Text>Martha</Text>

                <View style={styles.idClase}>
                    <Text style={styles.id}>Id_Clase:</Text>
                    <Text style={styles.codigo}>5r3R1</Text>
                </View>
            </View>

            <ScrollView>
                <View style={styles.vwima}>

                    <TouchableOpacity >
                        <Image source={require('../assets/game/img mate/aprendeSumar.jpg')} style={styles.ima1} />
                    </TouchableOpacity>


                    <View style={styles.btclas}>
                        <TouchableOpacity style={styles.bt1}>
                            <Text style={styles.txt}>Agregar a clase</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.bt1} onPress={() => navigation.navigate('Juego de Sumas')}>
                            <Text style={styles.txt1}>Jugar</Text>
                        </TouchableOpacity>
                    </View>



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
    banner: {
        width: Dimensions.get('window').width,
        backgroundColor: '#99E7D9',
    },
    perfilProfe: {
        width: 100,
        height: 100,
        borderRadius: 100,

    },
    idClase: {
        width: 150,
        height: 50,
        borderRadius: 30,
        backgroundColor: '#34B0A6',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        left: 200,
        bottom: 10,
    },
    id: {
        fontSize: 16,
        fontFamily: 'CenturyGothic',
        marginRight: 8,          
    },

    codigo: {
        fontSize: 16,
        fontFamily: 'CenturyGothicBold',
        color: '#000',
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