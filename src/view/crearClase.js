import { StyleSheet, View, Text, Alert, TextInput, TouchableOpacity, Dimensions, Image } from "react-native";
import { useFonts } from 'expo-font';
import { getFirestore, collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import appFirebase from "../model/Firebase";
import React, { useState } from "react";

const imagenesClase = [
    require('../assets/bannerClase/Rectangle 18.png'),
    require('../assets/bannerClase/Rectangle 19.png'),
    require('../assets/bannerClase/Rectangle 20.png'),
    require('../assets/bannerClase/Rectangle 21.png'),
    require('../assets/bannerClase/Rectangle 22.png'),
];

const db = getFirestore(appFirebase);

export default function crearClase({ navigation }) {

    const [nombreClase, setNombreClase] = useState("");
    const [aula, setAula] = useState("");
    const bannerNombres = [
        'Rectangle 18.png',
        'Rectangle 19.png',
        'Rectangle 20.png',
        'Rectangle 21.png',
        'Rectangle 22.png',
    ];

    const crearClaseEnFirestore = async () => {
        if (!nombreClase || !aula) {
            Alert.alert("Por favor completa todos los campos");
            return;
        }

        const bannerSeleccionado = bannerNombres[Math.floor(Math.random() * bannerNombres.length)];
        //metodo para crear una clase y asuves que pueda crear id de manera incrementable
        try {
            const contadorRef = doc(db, "metadata", "contadorClases");
            const contadorSnap = await getDoc(contadorRef);

            let nuevoId = 1;
            if (contadorSnap.exists()) {
                const data = contadorSnap.data();
                nuevoId = data.ultimoId + 1;
            }

            await addDoc(collection(db, "clases"), {
                idClase: nuevoId,
                nombreClase,
                aula,
                banner: bannerSeleccionado,
            });

            await updateDoc(contadorRef, {
                ultimoId: nuevoId
            });

            Alert.alert("Clase creada con éxito");
            navigation.goBack();
        } catch (error) {
            console.error("Error al crear la clase:", error);
            Alert.alert("Hubo un error al crear la clase");
        }
    };

    const [fontsLoaded] = useFonts({
        CenturyGothic: require('../assets/fonts/3394-font.ttf'),
        CenturyGothicBold: require('../assets/fonts/Century-Gothic-Bold.ttf'),
        CenturyGothicBold1a: require('../assets/fonts/4410-font.ttf'),
    });

    if (!fontsLoaded) return null;

    return (
        <View style={styles.container}>
            <Text style={{ fontFamily: 'CenturyGothic', fontSize: 20, bottom: 230, right: 50 }}>Nombre de la clase</Text>
            <TextInput
                style={styles.inputNombreClase}
                value={nombreClase}
                onChangeText={setNombreClase}
            />
            <Text style={{ fontFamily: 'CenturyGothic', fontSize: 20, bottom: 230, right: 120 }}>Aula</Text>
            <TextInput
                style={styles.inputNombreAula}
                value={aula}
                onChangeText={setAula}
            />
            <TouchableOpacity style={styles.btCrear} onPress={crearClaseEnFirestore}>
                <Text style={{ fontFamily: 'CenturyGothicBold1a', fontSize: 20, color: '#ffffff' }}>Crear</Text>
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
        marginTop: -5,
    },
    inputNombreClase: {
        backgroundColor: '#34B0A6',
        width: 300,
        height: 60,
        borderRadius: 10,
        bottom: 230,
        marginBottom: 20,
        color: '#ffffff',
        textAlign: 'center',
        fontFamily: 'CenturyGothicBold1a',
    },
    inputNombreAula: {
        backgroundColor: '#34B0A6',
        width: 300,
        height: 60,
        borderRadius: 10,
        bottom: 230,
        marginBottom: 20,
        color: '#ffffff',
        textAlign: 'center',
        fontFamily: 'CenturyGothicBold1a',
    },
    btCrear: {
        backgroundColor: '#34B0A6',
        width: 200,
        height: 60,
        borderRadius: 10,
        bottom: 200,
        justifyContent: 'center',
        alignItems: 'center'
    }
})