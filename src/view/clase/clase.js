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
                <Text style={[styles.tex, styles.font]}>Profe: {}</Text>
                 <Text style={[styles.tex, styles.font]}>IdClase: {}</Text>

            </View>

            <ScrollView style={styles.scroll}>
                <TouchableOpacity style={styles.imaj}>
                    <Image style={styles.ima}>

                    </Image>
                </TouchableOpacity>
                 <TouchableOpacity style={styles.imaj}>
                    <Image style={styles.ima}>

                    </Image>
                </TouchableOpacity>
                 <TouchableOpacity style={styles.imaj}>
                    <Image style={styles.ima}>

                    </Image>
                </TouchableOpacity>
                 <TouchableOpacity style={styles.imaj}>
                    <Image style={styles.ima}>

                    </Image>
                </TouchableOpacity>
                 <TouchableOpacity style={styles.imaj}>
                    <Image style={styles.ima}>

                    </Image>
                </TouchableOpacity>

            </ScrollView>

            <View style={styles.footer}>
                <Image />
                <Text style={[styles.tex, styles.font]}>Profe: {}</Text>
                 <Text style={[styles.tex, styles.font]}>IdClase: {}</Text>

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
    font:{
        fontFamily: 'CenturyGothic',
    },
    tex:{
        fontSize: 20,
        top: 20,
        marginBottom: 5,

    },
    scroll:{
       backgroundColor: '#000', 
    },
    imaj:{
        marginTop: 10,
        backgroundColor: '#99E7D9',
        width: '100%',
        height: 150,
    },
    ima:{
       width: '100%',
        height: 150, 
    }
});