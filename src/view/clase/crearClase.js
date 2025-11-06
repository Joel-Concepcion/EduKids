import React, { useState } from "react";
import { StyleSheet, View, Text, Alert, TextInput, TouchableOpacity, Dimensions, Image } from "react-native";
import { useFonts } from 'expo-font';
import { getFirestore, collection, addDoc, doc, getDoc, updateDoc, query, where, getDocs } from "firebase/firestore";
import appFirebase from "../../model/db";
import { getAuth } from "firebase/auth";

const db = getFirestore(appFirebase);
const auth = getAuth();

const imagenesClase = [
    require('../../assets/bannerClase/Rectangle 18.png'),
    require('../../assets/bannerClase/Rectangle 19.png'),
    require('../../assets/bannerClase/Rectangle 20.png'),
    require('../../assets/bannerClase/Rectangle 21.png'),
    require('../../assets/bannerClase/Rectangle 22.png'),
];

const bannerNombres = [
    'Rectangle18.png',
    'Rectangle19.png',
    'Rectangle20.png',
    'Rectangle21.png',
    'Rectangle22.png',
];



export default function crearClase({ navigation }) {
    const [nombreClase, setNombreClase] = useState("");
    const [aula, setAula] = useState("");

    // Generador de código tipo Classroom
    const generarCodigoClase = () => {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let codigo = '';
        for (let i = 0; i < 6; i++) {
            const indice = Math.floor(Math.random() * caracteres.length);
            codigo += caracteres[indice];
        }
        return codigo;
    };

    // Verifica si el código ya existe
    const existeCodigoClase = async (codigo) => {
        const clasesRef = collection(db, "clases");
        const consulta = query(clasesRef, where("codigoClase", "==", codigo));
        const resultado = await getDocs(consulta);
        return !resultado.empty;
    };

    const crearClaseEnFirestore = async () => {
        if (!nombreClase || !aula) {
            Alert.alert("Por favor completa todos los campos");
            return;
        }

        const usuarioActual = auth.currentUser;
        if (!usuarioActual) {
            Alert.alert("No hay usuario autenticado");
             navigation.navigate("login");
            return;
        }

        const bannerSeleccionado = bannerNombres[Math.floor(Math.random() * bannerNombres.length)];

        try {
            // Obtener contador
            const contadorRef = doc(db, "metadata", "contadorClases");
            const contadorSnap = await getDoc(contadorRef);

            let nuevoId = 1;
            if (contadorSnap.exists()) {
                const data = contadorSnap.data();
                nuevoId = data.ultimoId + 1;
            }

            // Generar código único
            let codigoClase;
            do {
                codigoClase = generarCodigoClase();
            } while (await existeCodigoClase(codigoClase));

            // Registrar clase
            await addDoc(collection(db, "clases"), {
                idClase: nuevoId,
                codigoClase,
                nombreClase,
                aula,
                banner: bannerSeleccionado,
                creadoEn: new Date(),
                docenteId: usuarioActual.uid, // clave para filtrar luego
                docenteNombre: usuarioActual.displayName || "Sin nombre"
            });

            // Actualizar contador
            await updateDoc(contadorRef, {
                ultimoId: nuevoId
            });

            Alert.alert("Clase creada con éxito", `Código de clase: ${codigoClase}`);
            navigation.goBack();
        } catch (error) {
            console.error("Error al crear la clase:", error);
            Alert.alert("Hubo un error al crear la clase");
        }
    };

    const [fontsLoaded] = useFonts({
        CenturyGothic: require('../../assets/font/3394-font.ttf'),
        CenturyGothicBold1a: require('../../assets/font/4410-font.ttf'),
    });

    if (!fontsLoaded) return null;

    return (
        <View style={styles.container}>
            <Text style={{ fontFamily: 'CenturyGothic', fontSize: 20, bottom: 230, right: 50 }}>
                Nombre de la clase
            </Text>
            <TextInput
                style={styles.inputNombreClase}
                value={nombreClase}
                onChangeText={setNombreClase}
            />
            <Text style={{ fontFamily: 'CenturyGothic', fontSize: 20, bottom: 230, right: 120 }}>
                Aula
            </Text>
            <TextInput
                style={styles.inputNombreAula}
                value={aula}
                onChangeText={setAula}
            />
            <TouchableOpacity style={styles.btCrear} onPress={crearClaseEnFirestore}>
                <Text style={{ fontFamily: 'CenturyGothicBold1a', fontSize: 20, color: '#ffffff' }}>
                    Crear
                </Text>
            </TouchableOpacity>
        </View>
    );
}

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