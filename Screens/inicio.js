import { StyleSheet, View, Text, Button, Image, TextInput, TouchableOpacity } from "react-native";

import React from "react";

import { useNavigation } from "@react-navigation/native";

export default function inicio() {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <Image source={require('../assets/Image/ima1.png')} style={styles.imagen1} />
            <Image source={require('../assets/Image/ima2.png')} style={styles.imagen2} />
            <Image source={require('../assets/Image/logoPrueba.png')} style={styles.lg1} />
            <Text style={styles.tex}>EduKid's</Text>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Home")}>
                <Text style={styles.buttonText}>Acceder</Text>
            </TouchableOpacity>

            <View style={styles.ImLog}>
                <TouchableOpacity>
                    <Image source={require('../assets/Image/devicon_google.png')} style={styles.item} />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Image source={require('../assets/Image/logos_facebook.png')} style={styles.item} />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Image source={require('../assets/Image/Group 3.png')} style={styles.item} />
                </TouchableOpacity>
            </View>
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        alignItems: 'center',


    },
    imagen2: {
        marginTop: "110%",
    },
    imagen1: {
        marginBottom: 10,
        marginTop: -320,
    },
    lg1: {
        marginTop: -650,
        marginLeft: 5,
        borderWidth: 4,
        borderRadius: 100,
        borderColor: '#3E8FCC',
    },
    tex: {
        fontSize: 30,
        marginTop: 5,
        marginBottom: 5,
        fontWeight: 'bold'
    },
    button: {
        color: '#ffffff',
        backgroundColor: '#3E8FCC',
        borderRadius: 20,
        width: 200,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#634AFF',
        shadowOffset: { width: 10, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 20,
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 25,
    },
    ImLog: {
        marginTop: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    item: {
        resizeMode: 'contain',

    }



})