import { StyleSheet, View, Text, Button, Image, TextInput, TouchableOpacity, Dimensions } from "react-native";
import React, { useState, useEffect } from 'react';
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import * as Font from 'expo-font';

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

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image />
                <Text style={[styles.tex, styles.font]}>Profe: { }</Text>
                <Text style={[styles.tex, styles.font]}>IdClase: { }</Text>

            </View>

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
                <TouchableOpacity style={styles.imaj}>
                    <Image style={styles.ima} source={require("../../assets/bannerActi/Rectangle 27.png")}>
                    </Image>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imaj}>
                    <Image style={styles.ima} source={require("../../assets/bannerActi/Rectangle 28.png")}>
                    </Image>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imaj}>
                    <Image style={styles.ima} source={require("../../assets/bannerActi/Rectangle 27.png")}>
                    </Image>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imaj}>
                    <Image style={styles.ima} source={require("../../assets/bannerActi/Rectangle 26.png")}>
                    </Image>
                </TouchableOpacity>

            </ScrollView>

            <View style={styles.footer}>
                <Image />
                <Text style={[styles.tex, styles.font]}>Profe: { }</Text>
                <Text style={[styles.tex, styles.font]}>IdClase: { }</Text>

            </View>

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
        backgroundColor: "#99E7D9",
        width: Dimensions.get('window').width,
        right: 20,
        alignItems: 'center',
        height: 100,
        bottom: 20,
    },
    font: {
        fontFamily: 'CenturyGothic',
    },
    tex: {
        fontSize: 20,
        top: 20,
        marginBottom: 5,

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
    }
});