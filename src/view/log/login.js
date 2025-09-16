import { StyleSheet, Modal, View, Text, Button, Image, FlatList, showModal, TextInput, TouchableOpacity, Dimensions } from "react-native";
import React, { useState, useEffect } from 'react';
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import * as Font from 'expo-font'
import { useFonts, Kavoon_400Regular } from '@expo-google-fonts/kavoon';
import { Picker } from '@react-native-picker/picker';

const fetchFonts = () => {
    return Font.loadAsync({
        'CenturyGothic': require('../../assets/font/3394-font.ttf'),
        'CenturyGothic-Bold': require('../../assets/font/4410-font.ttf'),
    });
};

export default function login() {
    const navigation = useNavigation();
    const [rol, setRol] = useState(null);
    const [mostrarRegistro, setMostrarRegistro] = useState(true);
    const logHeight = rol === 'Docente' ? 700 : 400;
    const [mostrarLogin, setMostrarLogin] = useState(false);
    const [verPassword, setVerPassword] = useState(false);
    const [verPassword1, setVerPassword1] = useState(false);
    const [fontsLoaded] = useFonts({
        Kavoon_400Regular,
    });

    if (!fontsLoaded) {
        return null;
    }

    const continuar = () => {
        if (rol === 'Docente') {
            navigation.navigate('PantallaDocente');
        } else if (rol === 'Alumno') {
            navigation.navigate('PantallaAlumno');
        } else {
            alert('Por favor seleccioná un rol');
        }
    };
    return (

        <View style={styles.container}>
            <Image style={styles.ima1} source={require('../../assets/fondo/ari.png')} />

            <Image style={styles.ima2} source={require('../../assets/fondo/aba.png')} />

            {mostrarRegistro && !mostrarLogin && (
                <View style={[styles.log, { height: logHeight }]}>
                    <Text style={[styles.tex1, styles.fon1]}>Registro</Text>
                    <View style={styles.pickerStyle}>
                        <Picker
                            selectedValue={rol}
                            onValueChange={(itemValue) => setRol(itemValue)}
                            style={[styles.picker, styles.fon2]}
                        >
                            <Picker.Item label="Escoje tu rol" value={null} />
                            <Picker.Item label="Docente" value="Docente" />
                            <Picker.Item label="Alumno" value="Alumno" />
                        </Picker>
                    </View>
                    {rol === 'Alumno' && (
                        <View style={styles.logEstu}>
                            <Text style={[styles.tex5, styles.fon1]}>Nombre del colegio </Text>
                            <TextInput style={[styles.texImpul, styles.fon3]}></TextInput>

                            <Text style={[styles.tex5, styles.fon1]}>Codigo del alumno</Text>
                            <TextInput style={[styles.texImpul, styles.fon3]}></TextInput>

                            <TouchableOpacity style={styles.booton} onPress={() => navigation.navigate("Home")}>
                                <Text style={[styles.tex2, styles.fon1]}>Aceder</Text>
                            </TouchableOpacity>

                        </View>
                    )}


                    {rol === 'Docente' && (
                        <View style={styles.logDocen}>
                            <Text style={[styles.tex5, styles.fon1]}>Nombre del colegio </Text>
                            <TextInput style={[styles.texImpul, styles.fon3]}></TextInput>

                            <Text style={[styles.tex5, styles.fon1]}>Nombres</Text>
                            <TextInput style={[styles.texImpul, styles.fon3]}></TextInput>

                            <Text style={[styles.tex5, styles.fon1]}>Apellidos </Text>
                            <TextInput style={[styles.texImpul, styles.fon3]}></TextInput>

                            <Text style={[styles.tex5, styles.fon1]}>Correo electrónico</Text>
                            <TextInput style={[styles.texImpul, styles.fon3]}></TextInput>


                            <Text style={[styles.tex5, styles.fon1]}>Contraseña</Text>
                            <TextInput style={[styles.texImpul, styles.fon3]} secureTextEntry={!verPassword1} />
                            <TouchableOpacity onPress={() => setVerPassword1(!verPassword1)}>
                                <Image
                                    source={
                                        verPassword1
                                            ? require('../../assets/eyes/on.png')
                                            : require('../../assets/eyes/off.png')
                                    }
                                    style={styles.iconoOjo}
                                />
                            </TouchableOpacity>

                            <Text style={[styles.tex5, styles.fon1]}>Confirmar contraseña</Text>
                            <TextInput style={[styles.texImpul, styles.fon3]} secureTextEntry={!verPassword} />
                            <TouchableOpacity onPress={() => setVerPassword(!verPassword)}>
                                <Image
                                    source={
                                        verPassword
                                            ? require('../../assets/eyes/on.png')
                                            : require('../../assets/eyes/off.png')
                                    }
                                    style={styles.iconoOjo}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.booton} onPress={() => navigation.navigate("Home")}>
                                <Text style={[styles.tex2, styles.fon1]}>Registrar</Text>
                            </TouchableOpacity>
                        </View>

                    )}
                    {rol === null && (
                        <Image style={styles.ima10} source={require('../../assets/log/nino.png')} />
                    )}
                    {rol === 'Alumno' && (
                        <Image style={styles.ima3} source={require('../../assets/log/nino.png')} />
                    )}

                    {rol === 'Docente' && (
                        <Image style={styles.ima3} source={require('../../assets/log/docente.png')} />
                    )}

                    <Text style={[styles.tex3, styles.fon2]}>
                        Iniciar sesión:
                        <TouchableOpacity
                            style={styles.bootonLog}
                            onPress={() => { setMostrarLogin(true); setMostrarRegistro(false); }}

                        >
                            <Text style={[styles.tex4, styles.fon2]}>Login</Text>
                        </TouchableOpacity>
                    </Text>



                    <Image style={styles.ima4} source={require('../../assets/log/hierba.png')} />
                    <Image style={styles.ima5} source={require('../../assets/log/hierba.png')} />
                </View>
            )}


            {mostrarLogin && !mostrarRegistro && (
                <View style={styles.login}>
                    <Text style={[styles.tex1, styles.fon1]}>Login</Text>

                    <Text style={[styles.tex5, styles.fon1]}>Correo electronico</Text>
                    <TextInput style={[styles.texImpul, styles.fon3]}></TextInput>

                    <Text style={[styles.tex5, styles.fon1]}>Contraseña</Text>
                    <TextInput style={[styles.texImpul, styles.fon3]}></TextInput>

                    <TouchableOpacity style={styles.booton} onPress={() => navigation.navigate("Home")}>
                        <Text style={[styles.tex2, styles.fon1]}>Iniciar</Text>
                    </TouchableOpacity>

                    <Text style={[styles.tex3, styles.fon2]}>
                        Registrarse:
                        <TouchableOpacity
                            style={styles.bootonLog}
                            onPress={() => { setMostrarLogin(false); setMostrarRegistro(true); }}
                        >
                            <Text style={[styles.tex4, styles.fon2]}>Registro</Text>
                        </TouchableOpacity>
                    </Text>

                    <Image style={styles.ima3} source={require('../../assets/log/docente.png')} />
                    <Image style={styles.ima4} source={require('../../assets/log/hierba.png')} />
                    <Image style={styles.ima5} source={require('../../assets/log/hierba.png')} />
                </View>
            )}



        </View>
    )

}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        top: 10,
    },
    log: {
        backgroundColor: '#99E7D9',
        width: 350,
        height: 400,
        borderRadius: 50,
        top: -60,
        position: 'relative',
    },
    fon1: {
        fontFamily: 'Kavoon_400Regular',
    },
    fon2: {
        fontFamily: 'CenturyGothic',
    },
    ima1: {
        top: -10,
        position: 'absolute',
    },
    ima2: {
        bottom: 10,
        position: 'absolute',
    },
    tex1: {
        width: 150,
        height: 50,
        left: 100,
        fontSize: 30,
        textAlign: 'center',
        textAlignVertical: 'center',
        color: '#34B0A6',
    },
    picker: {
        width: '100%',
        height: 50,
        color: '#ffffff',
    },
    pickerStyle: {
        backgroundColor: '#34B0A6',
        width: 200,
        left: 70,
        marginTop: 10,
        marginBottom: 10,
        borderRadius: 30,
    },
    booton: {
        backgroundColor: '#34B0A6',
        width: 150,
        height: 50,
        justifyContent: 'center',
        left: 100,
        borderRadius: 30,
        top: 20,
    },
    tex2: {
        textAlign: 'center',
        color: '#ffffff',
    },
    tex3: {
        top: 40,
        left: 90,
    },
    tex4: {
        color: '#0400FF',
        top: '5',
        left: 5,
    },
    bootonLog: {
        left: 10,
    },
    ima3: {
        position: 'absolute',
        width: 126,
        height: 126,
        alignSelf: 'flex-end',
        bottom: -3,
    },
    ima10: {
        position: 'absolute',
        width: 160,
        height: 160,
        alignSelf: 'flex-end',
        bottom: -3,
    },
    ima4: {
        position: 'absolute',
        width: 40,
        height: 40,
        left: 275,
        bottom: -5,
    },
    ima5: {
        position: 'absolute',
        width: 40,
        height: 40,
        bottom: -5,
        left: 25,
    },
    logDocen: {
        width: 350,
    },
    logEstu: {
        width: 350,
    },
    tex5: {
        marginTop: 5,
        left: 70,
        color: '#34B0A6',
    },
    texImpul: {
        backgroundColor: '#34B0A6',
        color: '#fff',
        width: 250,
        height: 50,
        borderRadius: 30,
        alignSelf: 'center',
        textAlign: 'center',
    },
    fon3: {
        fontFamily: 'CenturyGothic-Bold',
    },
    login: {
        backgroundColor: '#99E7D9',
        width: 350,
        height: 400,
        borderRadius: 50,
        top: 190,
        position: 'absolute',
    },
    iconoOjo: {
        position: 'absolute',
        width: 40,
        height: 40,
        left: 245,
        top: -45,
        zIndex: 10,
        tintColor: '#99E7D9',
        zIndex: 10,
    },


})