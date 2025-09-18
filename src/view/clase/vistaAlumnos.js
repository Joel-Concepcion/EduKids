import { StyleSheet, View, Text, Button, Image, TextInput, TouchableOpacity, Dimensions } from "react-native";
import React, { useState, useEffect } from 'react';
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import * as Font from 'expo-font';

import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const fetchFonts = () => {
    return Font.loadAsync({
        'CenturyGothic': require('../../assets/font/3394-font.ttf'),
        'CenturyGothic-Bold': require('../../assets/font/4410-font.ttf'),
    });
};

export default function vistaAlumnos() {
    const navigation = useNavigation();
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [showChart, setShowChart] = useState(false);

    const toggleChart = () => {
        setShowChart(prev => !prev);
    };


    useEffect(() => {
        fetchFonts().then(() => setFontsLoaded(true));
    }, []);

    if (!fontsLoaded) return null;

    const data = {
        labels: ['Matemática', 'Literatura', 'Formas', 'Sonidos'],
        datasets: [
            {
                data: [80, 65, 90, 50],
            },
        ],
    };

    const chartConfig = {
        backgroundColor: '#eafaf1',
        backgroundGradientFrom: '#eafaf1',
        backgroundGradientTo: '#eafaf1',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(52, 176, 166, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
            borderRadius: 16,
        },
    };

    return (

        <View style={styles.container}>
            <View style={styles.header}>
                <Image style={styles.imM} source={require("../../assets/maestra.jpg")} />
                <Text style={[styles.tex, styles.font]}>Profe: { }</Text>
            </View>

             <Text style={[styles.font]}>Alumnos</Text>
            <ScrollView
                style={{
                    width: Dimensions.get('window').width -20,
                    right: 12,

                }}
            >
                <TouchableOpacity style={styles.imaj} onPress={toggleChart}>
                    <View style={styles.contenI}>
                        <Image style={styles.ima} source={require("../../assets/avatar/Ellipse 3.png")} />
                        <Text style={[styles.font1, styles.txS]}>Juan Pérez</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.imaj} onPress={toggleChart}>
                    <View style={styles.contenI}>
                        <Image style={styles.ima} source={require("../../assets/avatar/Ellipse 3.png")} />
                        <Text style={[styles.font1, styles.txS]}>Juan Pérez</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.imaj} onPress={toggleChart}>
                    <View style={styles.contenI}>
                        <Image style={styles.ima} source={require("../../assets/avatar/Ellipse 3.png")} />
                        <Text style={[styles.font1, styles.txS]}>Juan Pérez</Text>
                    </View>
                </TouchableOpacity>

                 <TouchableOpacity style={styles.imaj} onPress={toggleChart}>
                    <View style={styles.contenI}>
                        <Image style={styles.ima} source={require("../../assets/avatar/Ellipse 3.png")} />
                        <Text style={[styles.font1, styles.txS]}>Juan Pérez</Text>
                    </View>
                </TouchableOpacity>

                 <TouchableOpacity style={styles.imaj} onPress={toggleChart}>
                    <View style={styles.contenI}>
                        <Image style={styles.ima} source={require("../../assets/avatar/Ellipse 3.png")} />
                        <Text style={[styles.font1, styles.txS]}>Juan Pérez</Text>
                    </View>
                </TouchableOpacity>

                 <TouchableOpacity style={styles.imaj} onPress={toggleChart}>
                    <View style={styles.contenI}>
                        <Image style={styles.ima} source={require("../../assets/avatar/Ellipse 3.png")} />
                        <Text style={[styles.font1, styles.txS]}>Juan Pérez</Text>
                    </View>
                </TouchableOpacity>

                 <TouchableOpacity style={styles.imaj} onPress={toggleChart}>
                    <View style={styles.contenI}>
                        <Image style={styles.ima} source={require("../../assets/avatar/Ellipse 3.png")} />
                        <Text style={[styles.font1, styles.txS]}>Juan Pérez</Text>
                    </View>
                </TouchableOpacity>

                 <TouchableOpacity style={styles.imaj} onPress={toggleChart}>
                    <View style={styles.contenI}>
                        <Image style={styles.ima} source={require("../../assets/avatar/Ellipse 3.png")} />
                        <Text style={[styles.font1, styles.txS]}>Juan Pérez</Text>
                    </View>
                </TouchableOpacity>

                 <TouchableOpacity style={styles.imaj} onPress={toggleChart}>
                    <View style={styles.contenI}>
                        <Image style={styles.ima} source={require("../../assets/avatar/Ellipse 3.png")} />
                        <Text style={[styles.font1, styles.txS]}>Juan Pérez</Text>
                    </View>
                </TouchableOpacity>

                 <TouchableOpacity style={styles.imaj} onPress={toggleChart}>
                    <View style={styles.contenI}>
                        <Image style={styles.ima} source={require("../../assets/avatar/Ellipse 3.png")} />
                        <Text style={[styles.font1, styles.txS]}>Juan Pérez</Text>
                    </View>
                </TouchableOpacity>

            </ScrollView>
            
                {showChart && (
                <View style={{ bottom: 180, alignItems: 'center', position: 'absolute', left: 15,}}>
                    {/*<Text style={[styles.font1, { fontSize: 16, marginBottom: 10 }]}>
                        Avance por categoría
                    </Text>*/}
                    <BarChart
                        data={data}
                        width={screenWidth - 30}
                        height={330}
                        chartConfig={chartConfig}
                        verticalLabelRotation={30}
                        style={{ borderRadius: 16 }}
                    />
                </View>
                )}



        </View >
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
        height: 100,
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
        top: 20,
        marginBottom: 5,

    },
    tex1: {
        backgroundColor: '#34B0A6',
        width: 170,
        height: 25,
        fontSize: 20,
        top: -50,
        marginBottom: 5,
        left: 200,
        zIndex: 10,
        borderRadius: 10,
        textAlign: 'left',


    },
    imaj: {
        backgroundColor: '#34B0A6',
        marginTop: 5,
        whidth: Dimensions.get('window').width,
        height: 57,
        borderRadius: 40,
        marginBottom: 10,

    },
    ima: {
        width: 60,
        height: 60,
        left: 10,
    },
    imM: {
        left: 30,
        width: 80,
        height: 80,
        borderRadius: 50,
        marginTop: 20,
    },
    footer: {
        backgroundColor: '#99E7D9',
        flexDirection: 'row',
        width: Dimensions.get('window').width,
        right: 20,
        top: 20,
        height: 120,
    },
    contenI: {
        backgroundColor: '#34B0A6',
        flexDirection: 'row',
        borderRadius: 30,
    },
    txS: {
        top: 20,
        left: 70,
    },
    font1: {

        fontFamily: 'CenturyGothic-Bold',
    },
}); 