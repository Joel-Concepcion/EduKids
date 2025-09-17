import { StyleSheet, View, Text, Button, Image, TextInput, TouchableOpacity, Dimensions } from "react-native";
import React, { useState, useEffect } from 'react';
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import * as Font from 'expo-font';

const fetchFonts = () => {
    return Font.loadAsync({
        'CenturyGothic': require('../assets/font/3394-font.ttf'),
        'CenturyGothic-Bold': require('../assets/font/4410-font.ttf'),
    });
};

export default function home() {
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
            <View style={styles.containerS}>
                <View style={{ marginBottom: 10, backgroundColor: '#99E7D9', width: Dimensions.get('window').width, height: 200, justifyContent: 'center', alignItems: 'center', bottom: 300 }}>
                    <Image source={require('../assets/img profesor.png')} style={{ width: 90, height: 90, alignSelf: 'center', position: 'absolute', right: 8, bottom: 1 }} />
                    <Text style={{ color: '#000', fontSize: 25, right: 80, fontFamily: 'CenturyGothic-Bold' }}>Hola, Profesor/a</Text>
                    <TouchableOpacity style={styles.bt1} onPress={() => navigation.navigate("Crear Clase")}>
                        <Text style={{ color: '#ffffff', fontSize: 18, fontFamily: 'CenturyGothic-Bold' }}>Crear clase</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ bottom: 300 }}>
                    <Text style={{ fontSize: 18, marginBottom: 10, fontFamily: 'CenturyGothic-Bold', left: 10 }}>Actividades disponibles:</Text>
                    <View style={styles.contenIcons} >
                        <TouchableOpacity style={styles.bt2} onPress={() => navigation.navigate("Juego de Sumas")}>
                            <Image source={require('../../src/assets/icon/mate.png')} style={styles.iconImage} />
                            <Text style={styles.iconText}>Matemáticas</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.bt3}>
                            <Image source={require('../../src/assets/icon/lite.png')} style={styles.iconImage} />
                            <Text style={styles.iconText}>Literatura</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.bt4}>
                            <Image source={require('../../src/assets/icon/figu.png')} style={styles.iconImage} />
                            <Text style={styles.iconText}>Figuras</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.bt5}>
                            <Image source={require('../../src/assets/icon/sonido.png')} style={styles.iconImage} />
                            <Text style={styles.iconText}>Sonidos</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={[styles.bt6, { position: 'absolute', top: 100, left: 0 }]}>
                        <Image source={require('../../src/assets/icon/quizz.png')} style={styles.iconImage} />
                        <Text style={styles.iconText}>Mini-quizzes</Text>
                    </TouchableOpacity>
                </View>
                <Text style={{ color: '#000', fontSize: 18, fontFamily: 'CenturyGothic-Bold', right: 160, bottom: 240 }}>Clases:</Text>
                <ScrollView style={{
                    width: Dimensions.get('window').width - 10,
                    height: 150,
                    bottom: 240
                }}>
                    <TouchableOpacity style={styles.banContainer}>
                        <Image style={styles.iBan} source={require('../../src/assets/bannerClase/Rectangle 18.png')} />
                        <Text style={styles.textCla}>Clase: 1A</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.banContainer}>
                        <Image style={styles.iBan} source={require('../../src/assets/bannerClase/Rectangle 18.png')} />
                        <Text style={styles.textCla}>Clase: 1A</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.banContainer}>
                        <Image style={styles.iBan} source={require('../../src/assets/bannerClase/Rectangle 18.png')} />
                        <Text style={styles.textCla}>Clase: 1A</Text>
                    </TouchableOpacity>
                </ScrollView>
                <TouchableOpacity style={styles.botonIA} onPress={() => navigation.navigate("IA")}>
                    <Image source={require('../../src/assets/IA (2).png')} style={styles.IA} />
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
        top: 10,
    },
    containerS: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        top: 240,
    },
    bt1: {
        backgroundColor: '#34B0A6',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        top: 140,
        height: 50,
        right: 130,
        borderRadius: 50,
        width: 180,
        position: 'absolute',
    },
    iconText: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 5,
        fontFamily: 'CenturyGothic',
    },
    contenIcons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 180,
    },
    bt2: {
        width: 80,
        alignItems: 'center',
        marginHorizontal: 10,
        marginVertical: 10,
    },
    bt3: {
        width: 80,
        alignItems: 'center',
        marginHorizontal: 8,
        marginVertical: 10,
    },
    bt4: {
        width: 80,
        alignItems: 'center',
        marginHorizontal: 8,
        marginVertical: 10,
    },
    bt5: {
        width: 80,
        alignItems: 'center',
        marginHorizontal: 8,
        marginVertical: 10,
    },
    bt6: {
        width: 80,
        alignItems: 'center',
        marginHorizontal: 8,
        marginVertical: 50,
    },
    banContainer: {
        whidth: Dimensions.get('window').width - 20,
        height: 150,
        marginTop: 10,
        marginBottom: 10,
        alignItems: 'center',
    },
    iBan: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
        opacity: 0.6,
        borderColor: '#000000ff',
        borderWidth: 4,
    },
    textCla: {
        position: 'absolute',
        color: '#000',
        fontFamily: 'CenturyGothic-Bold',
        top: 30,
        fontSize: 25,
    },
    botonIA: {
        width: 80,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        right: 18,
        borderRadius: 20,
        bottom: 255,
        backgroundColor: '#99E7D9',
    },
    IA: {
        width: 60,
        height: 60,

    }

});
