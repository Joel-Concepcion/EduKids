import { StyleSheet, Alert, View, Text, Button, Image, FlatList, TextInput, TouchableOpacity, Dimensions } from "react-native";
import React, { useState, useEffect } from 'react';
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import * as Font from 'expo-font';
import { useFonts, Kavoon_400Regular } from '@expo-google-fonts/kavoon';
import { Picker } from '@react-native-picker/picker';
import { getFirestore, addDoc, serverTimestamp, collection, doc, setDoc, getDocs, query, where, getDoc, updateDoc } from 'firebase/firestore';
import appFirebase from '../../model/db';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";

const db = getFirestore(appFirebase);
const auth = getAuth(appFirebase);

export default function login() {
    const navigation = useNavigation();
    const [rol, setRol] = useState(null);
    const [mostrarRegistro, setMostrarRegistro] = useState(true);
    const logHeight = rol === 'Docente' ? 700 : 400;
    const [mostrarLogin, setMostrarLogin] = useState(false);
    const [verPassword, setVerPassword] = useState(false);
    const [verPassword1, setVerPassword1] = useState(false);
    const [verPassword3, setVerPassword3] = useState(false);

    //datos a registrar 
    const [nombreColegio, setNombreColegio] = useState('');
    const [nombres, setNombres] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [correoElectronico, setCorreoElectronico] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [confirmarContraseña, setConfirmarContraseña] = useState('');
    const [registrando, setRegistrando] = useState(false);

    //login
    const [loginCorreo, setLoginCorreo] = useState('');
    const [loginContraseña, setLoginContraseña] = useState('');

    //login alumno
    const [loginNombreColegio, setLoginNombreColegio] = useState('');
    const [loginCodigoEstu, setLoginCodigoEstu] = useState('');


    const [fontsLoaded] = useFonts({
        Kavoon_400Regular,
        CenturyGothic: require('../../assets/font/3394-font.ttf'),
        CenturyGothicBold: require('../../assets/font/4410-font.ttf'),
    });

    const obtenerNuevoIdDocente = async () => {
        const contadorRef = doc(db, "contadores", "docente");
        const snapshot = await getDoc(contadorRef);

        let nuevoId = 1;

        if (snapshot.exists()) {
            const data = snapshot.data();
            nuevoId = data.ultimoId + 1;
            await updateDoc(contadorRef, { ultimoId: nuevoId });
        } else {
            await setDoc(contadorRef, { ultimoId: nuevoId });
        }

        return nuevoId;
    };
    //verificacion del coreo electronico si ya existe o no 
    const existeDocente = async (correo) => {
        const docentesRef = collection(db, "docente");
        const consulta = query(docentesRef, where("correoElectronico", "==", correo));
        const resultado = await getDocs(consulta);
        return !resultado.empty;
    };
    //Registro y validacion de datos del docente 
    /*const registroDocente = async () => {
        if (registrando) return;
        setRegistrando(true);

        if (!nombreColegio || !nombres || !apellidos || !correoElectronico || !contraseña || !confirmarContraseña) {
            Alert.alert("Campos incompletos", "Por favor, completá todos los campos.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correoElectronico)) {
            Alert.alert("Correo inválido", "Ingresá un correo electrónico válido.");
            return;
        }

        if (contraseña.length < 6) {
            Alert.alert("Contraseña débil", "La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        if (contraseña !== confirmarContraseña) {
            Alert.alert("Contraseñas no coinciden", "Verificá que ambas contraseñas sean iguales.");
            return;
        }

        try {
            const yaExiste = await existeDocente(correoElectronico);
            if (yaExiste) {
                Alert.alert("Correo duplicado", "Ya existe un docente registrado con este correo.");
                setRegistrando(false);
                return;
            }
            const id = await obtenerNuevoIdDocente();

            //Registro del formulario del docente
            const docRef = await addDoc(collection(db, "docente"), {
                docenteId: 'DOC-' + id,
                rolId: '2',
                nombreColegio,
                nombres,
                apellidos,
                correoElectronico,
                contraseña,
                creadoEn: serverTimestamp()
            });

            console.log("Docente registrado con ID:", docRef.id);
            Alert.alert("Registro exitoso", "Docente registrado correctamente.");

            //limpiar campos
            setNombreColegio('');
            setNombres('');
            setApellidos('');
            setCorreoElectronico('');
            setContraseña('');
            setConfirmarContraseña('');

            navigation.navigate("Home");
        } catch (error) {
            console.error("Error al registrar:", error);
            Alert.alert("Error", "No se pudo registrar. Intentalo de nuevo.");
        }
    };*/
    const registroDocente = async () => {
        if (registrando) return;
        setRegistrando(true);

        if (!nombreColegio || !nombres || !apellidos || !correoElectronico || !contraseña || !confirmarContraseña) {
            Alert.alert("Campos incompletos", "Por favor, completá todos los campos.");
            return;
        }

        if (contraseña.length < 6) {
            Alert.alert("Contraseña débil", "Debe tener al menos 6 caracteres.");
            return;
        }

        if (contraseña !== confirmarContraseña) {
            Alert.alert("Contraseñas no coinciden");
            return;
        }

        try {
            //Registrar en Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, correoElectronico, contraseña);
            const usuario = userCredential.user;

            // Actualizar nombre en Firebase Auth
            await updateProfile(usuario, {
                displayName: nombres + " " + apellidos
            });

            //Enviar verificación de correo
            await sendEmailVerification(usuario);

            const id = await obtenerNuevoIdDocente();

            // Guardar datos adicionales en Firestore
            await setDoc(doc(db, "docente", usuario.uid), {
                docenteId: 'DOC-' + id,
                rolId: '2',
                nombreColegio,
                nombres,
                apellidos,
                correoElectronico,
                contraseña,
                creadoEn: serverTimestamp()
            });

            Alert.alert("Registro exitoso", "Docente registrado correctamente.");
            navigation.navigate("Home");
        } catch (error) {
            console.error("Error al registrar:", error);
            Alert.alert("Error", "No se pudo registrar. Intentalo de nuevo.");
        }
    };


    //Login 
    /*const validarLogin = async () => {
        if (!loginCorreo || !loginContraseña) {
            Alert.alert("Campos vacíos", "Ingresá tu correo y contraseña.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(loginCorreo)) {
            Alert.alert("Correo inválido", "Ingresá un correo electrónico válido.");
            return;
        }

        try {
            const consulta = query(
                collection(db, "docente"),
                where("correoElectronico", "==", loginCorreo),
                where("contraseña", "==", loginContraseña)
            );

            const resultado = await getDocs(consulta);

            if (resultado.empty) {
                Alert.alert("Credenciales incorrectas", "Verificá tu correo y contraseña.");
            } else {
                Alert.alert("Bienvenido", "Inicio de sesión exitoso.");
                navigation.navigate("Home");
            }
        } catch (error) {
            console.error("Error en login:", error);
            Alert.alert("Error", "No se pudo iniciar sesión.");
        }
    };*/
    const validarLogin = async () => {
        if (!loginCorreo || !loginContraseña) {
            Alert.alert("Campos vacíos", "Ingresá tu correo y contraseña.");
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, loginCorreo, loginContraseña);
            const usuario = userCredential.user;

            console.log("Login exitoso:", usuario.uid);
            Alert.alert("Bienvenido", "Inicio de sesión exitoso.");
            navigation.navigate("Home");
        } catch (error) {
            console.error("Error en login:", error);
            Alert.alert("Error", "Credenciales incorrectas o usuario no registrado.");
        }
    };


    //login alumno
    const validarAlumno = async () => {
        if (!loginNombreColegio || !loginCodigoEstu) {
            Alert.alert("Campos vacíos", "Ingresá el nombre del colegio y código del estudiante.");
            return;
        }

        try {
            // 🔐 Autenticación con Firebase Auth
            const correo = `${loginCodigoEstu}@edukid.com`;
            const contraseña = loginCodigoEstu;

            const credenciales = await signInWithEmailAndPassword(auth, correo, contraseña);
            const alumno = credenciales.user;

            // 🔍 Validación adicional en Firestore (opcional pero recomendable)
            const consulta = query(
                collection(db, "alumnos"),
                where("nombre_colegio", "==", loginNombreColegio),
                where("codigo_alumno", "==", loginCodigoEstu)
            );

            const resultado = await getDocs(consulta);

            if (resultado.empty) {
                Alert.alert("Datos no coinciden", "El colegio no coincide con el código del alumno.");
                return;
            }

            Alert.alert("Bienvenido", "Inicia a interactuar de manera educativa");
            navigation.navigate("inicioAlumno");

        } catch (error) {
            console.error("Error en login:", error);
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                Alert.alert("Credenciales incorrectas", "Verificá el código del alumno.");
            } else {
                Alert.alert("Error", "No se pudo acceder al perfil del estudiante.");
            }
        }
    };
    
    if (!fontsLoaded) {
        return null;
    }


    /*
    const continuar = () => {
        if (rol === 'Docente') {
            navigation.navigate('PantallaDocente');
        } else if (rol === 'Alumno') {
            navigation.navigate('PantallaAlumno');
        } else {
            alert('Por favor seleccioná un rol');
        }
    };*/
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
                            <TextInput style={[styles.texImpul, styles.fon3]} value={loginNombreColegio} onChangeText={setLoginNombreColegio}></TextInput>

                            <Text style={[styles.tex5, styles.fon1]}>Codigo del alumno</Text>
                            <TextInput style={[styles.texImpul, styles.fon3]} value={loginCodigoEstu} onChangeText={setLoginCodigoEstu}></TextInput>

                            <TouchableOpacity style={styles.booton} onPress={validarAlumno}>
                                <Text style={[styles.tex2, styles.fon1]}>Aceder</Text>
                            </TouchableOpacity>

                        </View>
                    )}


                    {rol === 'Docente' && (
                        <View style={styles.logDocen}>
                            <Text style={[styles.tex5, styles.fon1]}>Nombre del colegio </Text>
                            <TextInput style={[styles.texImpul, styles.fon3]} value={nombreColegio} onChangeText={setNombreColegio}></TextInput>

                            <Text style={[styles.tex5, styles.fon1]}>Nombres</Text>
                            <TextInput style={[styles.texImpul, styles.fon3]} value={nombres} onChangeText={setNombres}></TextInput>

                            <Text style={[styles.tex5, styles.fon1]}>Apellidos </Text>
                            <TextInput style={[styles.texImpul, styles.fon3]} value={apellidos} onChangeText={setApellidos}></TextInput>

                            <Text style={[styles.tex5, styles.fon1]}>Correo electrónico</Text>
                            <TextInput style={[styles.texImpul, styles.fon3]} value={correoElectronico} onChangeText={setCorreoElectronico}></TextInput>


                            <Text style={[styles.tex5, styles.fon1]}>Contraseña</Text>
                            <TextInput style={[styles.texImpul, styles.fon3]} secureTextEntry={!verPassword1} value={contraseña} onChangeText={setContraseña} />
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
                            <TextInput style={[styles.texImpul, styles.fon3]} secureTextEntry={!verPassword} value={confirmarContraseña} onChangeText={setConfirmarContraseña} />
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

                            <TouchableOpacity style={styles.booton} onPress={registroDocente}>
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
                    <TextInput style={[styles.texImpul, styles.fon3]} value={loginCorreo}
                        onChangeText={setLoginCorreo}></TextInput>

                    <Text style={[styles.tex5, styles.fon1]}>Contraseña</Text>
                    <TextInput style={[styles.texImpul, styles.fon3]} secureTextEntry={!verPassword3} value={loginContraseña} onChangeText={setLoginContraseña}></TextInput>
                    <TouchableOpacity onPress={() => setVerPassword3(!verPassword3)}>
                        <Image
                            source={
                                verPassword3
                                    ? require('../../assets/eyes/on.png')
                                    : require('../../assets/eyes/off.png')
                            }
                            style={styles.iconoOjo}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.booton} onPress={validarLogin}>
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