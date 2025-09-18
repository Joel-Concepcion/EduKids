import { StyleSheet, View, Text, Button, Image, TextInput, TouchableOpacity, Dimensions } from "react-native";
import React, { useState, useEffect } from 'react';
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import * as Font from 'expo-font';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

const fetchFonts = () => {
    return Font.loadAsync({
        'CenturyGothic': require('../../assets/font/3394-font.ttf'),
        'CenturyGothic-Bold': require('../../assets/font/4410-font.ttf'),
    });
};

export default function Clase() {
    const navigation = useNavigation();
    const [fontsLoaded, setFontsLoaded] = useState(false);

     useEffect(() => {
        fetchFonts().then(() => setFontsLoaded(true));
    }, []);

    if (!fontsLoaded) return null;
    
    return (

        <View style={styles.container}>
            <View style={styles.header}>
                <Image style={styles.imM} source={require("../../assets/maestra.jpg")} />
                <Text style={[styles.tex, styles.font]}>Profe: { }</Text>
            </View>
            <Text style={[styles.tex1, styles.font]}>Id Clase: { }</Text>

            <ScrollView
                style={{
                    width: Dimensions.get('window').width - 15,
                    right: 12,

                }}
            >
                <TouchableOpacity style={styles.imaj}>
                    <Image style={styles.ima} source={require("../../assets/bannerActi/Rectangle 26.png")}>
                    </Image>
                </TouchableOpacity>
            </ScrollView>

    

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#ffffff",
    },
    header: {
        marginTop: 30,
        backgroundColor: "#99E7D9",
        width: Dimensions.get('window').width,
        right: 20,
        alignItems: 'center',
        height: 130,
        bottom: 20,
        zIndex: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    font: {
        fontFamily: 'CenturyGothic',
    },
    tex: {
        left: 50,
        fontSize: 20,
        top: 10,
        marginBottom: 5,

    },
    tex1: {
        backgroundColor: '#34B0A6',
        width: 170,
        height: 25,
        fontSize: 20,
        top: -60,
        marginBottom: 5,
        left: 200,
        zIndex: 10,
        borderRadius: 10,
        textAlign: 'left',

    },
    imaj: {
        marginTop: 10,
        whidth: Dimensions.get('window').width,
        height: 185,
        borderRadius: 40,
    },
    ima: {
        width: '100%',
        height: '100%',
    },
    imM: {
        left: 30,
        width: 80,
        height: 80,
        borderRadius: 50,
        marginTop: 40,
    },
    footer: {
        backgroundColor: '#99E7D9',
        flexDirection: 'row',
        width: Dimensions.get('window').width,
        right: 20,
        top:20,
        height: 120,

    },
});