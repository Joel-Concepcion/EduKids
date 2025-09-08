import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Font from 'expo-font';

const fetchFonts = () => {
    return Font.loadAsync({
        'CenturyGothic': require('../assets/font/3394-font.ttf'), // Regular (delgada)
        'CenturyGothic-Bold': require('../assets/font/4410-font.ttf'), // Bold (gordita)
    });
};

export default function Ajustes() {
    const navigation = useNavigation();
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        fetchFonts().then(() => setFontsLoaded(true));
    }, []);

    if (!fontsLoaded) {
        return null;
    }

    return (

        <View style={styles.contenedor}>
            <Text style={styles.titulo}>Perfil del Docente</Text>
            <View style={styles.tarjeta}>
                <View style={styles.fila}>
                    <Image
                        source={{ uri: "https://randomuser.me/api/portraits/women/44.jpg" }}
                        style={styles.avatar}
                    />
                    <View style={styles.info}>
                        <Text style={[styles.nombre, styles.fuenteNegrita]}>Martha Garcia Davila</Text>
                        <Text style={[styles.texto, styles.fuenteRegular]}>Id: 20601215</Text>
                        <Text style={[styles.texto, styles.fuenteRegular]}>Correo: eduMartha@gmail.com</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.boton}>
                    <Text style={[styles.textoBoton, styles.fuenteRegular]}>Editar información</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.tarjeta}>
                <Text style={[styles.tituloTarjeta, styles.fuenteRegular]}>Configuración personal</Text>
                <Text style={[styles.texto, styles.fuenteRegular]}>Nivel educativo: Preescolar</Text>
                <Text style={[styles.texto, styles.fuenteRegular]}>Enfoque pedagógico: Montessori</Text>
                <Text style={[styles.texto, styles.fuenteRegular]}>Horas disponible: Lun-Vie{"\n"}08:00-12:00</Text>
                <TouchableOpacity style={styles.boton}>
                    <Text style={[styles.textoBoton, styles.fuenteRegular]}>Editar información</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.tarjetaInfo}>
                <Text style={styles.tituloTarjeta}>Información de la App</Text>
            </TouchableOpacity>
        </View>
    );
}
const styles = StyleSheet.create({
    contenedor: {
        flexGrow: 1,
        padding: 16,
        backgroundColor: "#fff",
        alignItems: "center",
    },
    titulo: {
        marginTop: 90,
        fontSize: 22,
        fontWeight: "400",
        marginBottom: 12,
        textAlign: "center",
    },
    tarjeta: {
        backgroundColor: "#99E7D9",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        width: "100%",
        maxWidth: 350,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tarjetaInfo: {
        backgroundColor: "#99E7D9",
        borderRadius: 16,
        padding: 12,
        width: "100%",
        maxWidth: 350,
        marginBottom: 16,
        alignItems: "center",
    },
    fila: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    nombre: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 2,
    },
    texto: {
        fontSize: 14,
        marginBottom: 2,
    },
    tituloTarjeta: {
        fontSize: 18,
        fontWeight: "400",
        marginBottom: 8,
        textAlign: "left",
        fontFamily: 'CenturyGothic-Bold',
    },
    boton: {
        backgroundColor: "#34B0A6",
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: "center",
        marginTop: 8,
        width: 200,
        left: 120,
        top: 10,
    },
    textoBoton: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "400",
    },
    fuenteNegrita: {
        fontFamily: "CenturyGothic-Bold",
    },
    fuenteRegular: {
        fontFamily: "CenturyGothic",
    },
});