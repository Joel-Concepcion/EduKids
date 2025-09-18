import { StyleSheet, View, Text, Button, Image, TextInput, TouchableOpacity, Dimensions } from "react-native";
import React, { useState, useEffect } from 'react';
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import * as Font from 'expo-font';
import { useFonts, Kavoon_400Regular } from '@expo-google-fonts/kavoon';

const fetchFonts = () => {
    return Font.loadAsync({
        'CenturyGothic': require('../../assets/font/3394-font.ttf'),
        'CenturyGothic-Bold': require('../../assets/font/4410-font.ttf'),
    });
};

export default function inicioAlumno() {
    const navigation = useNavigation();

    const [fontsLoaded] = useFonts({
        Kavoon_400Regular,
    });

    if (!fontsLoaded) {
        return null;
    }

    return (

        <View style={styles.container}>

            <View style={styles.footer}>
                <Image style={{ top: 40, }} source={require('../../assets/avatar/Ellipse 3.png')} />
                <Text style={[styles.font, styles.tex1]}>nombre{ }</Text>
            </View>

            <TouchableOpacity style={{ left: 300, top: 700, zIndex: 10, position: 'absolute', }}>
                <Image source={require('../../assets/avatar/RE (1).png')} />
            </TouchableOpacity>

            <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 15 }}>
                <TouchableOpacity>
                    <Image style={styles.imScroll} source={require('../../assets/bannerClase/Rectangle 18.png')} />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Image style={styles.imScroll} source={require('../../assets/bannerClase/Rectangle 18.png')} />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Image style={styles.imScroll} source={require('../../assets/bannerClase/Rectangle 18.png')} />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Image style={styles.imScroll} source={require('../../assets/bannerClase/Rectangle 18.png')} />
                </TouchableOpacity>
            </ScrollView>

            <Image style={{ position: 'absolute', }} source={require('../../assets/Proyecto nuevo (2) 1.png')} />



            <View style={styles.header}>
                <Image style={{ right: -12, }} source={require('../../assets/log/hierba.png')} />
                <Image style={{ left: 290, }} source={require('../../assets/log/hierba.png')} />
            </View>

        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    footer: {
        backgroundColor: '#99E7D9',
        width: Dimensions.get('window').width,
        height: 150,
        flexDirection: 'row',
    },
    font: {
        fontFamily: 'Kavoon_400Regular',
    },
    tex1: {
        top: 70,
        left: 10,
    },
    header: {
        width: Dimensions.get('window').width,
        flexDirection: 'row',
        backgroundColor: '#99E7D9',
    },
    scroll: {
        height: 10,
        marginTop: 10,
        width: Dimensions.get('window').width,
    },
    imScroll: {
        marginTop: 12,
        width: '95%',
        height: 210,
        left: 10,
        borderRadius: 30,
    }

})