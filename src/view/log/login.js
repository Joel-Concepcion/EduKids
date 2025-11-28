import { StyleSheet, View, Text, Image, TextInput, TouchableOpacity, Dimensions, Animated, Easing } from "react-native";
import React, { useState, useRef, useEffect } from 'react';
import { useNavigation } from "@react-navigation/native";
import * as Font from 'expo-font';
import { useFonts, Kavoon_400Regular } from '@expo-google-fonts/kavoon';
import { Picker } from '@react-native-picker/picker';
import { getFirestore, collection, doc, setDoc, getDocs, query, where, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import appFirebase from '../../model/db';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";

const db = getFirestore(appFirebase);
const auth = getAuth(appFirebase);

export default function Login() {
    const navigation = useNavigation();
    const [rol, setRol] = useState(null);
    const [mostrarRegistro, setMostrarRegistro] = useState(true);
    const logHeight = rol === 'Docente' ? 700 : 400;
    const [mostrarLogin, setMostrarLogin] = useState(false);
    const [verPassword1, setVerPassword1] = useState(false);
    const [verPassword, setVerPassword] = useState(false);
    const [verPassword3, setVerPassword3] = useState(false);

    // datos a registrar 
    const [nombreColegio, setNombreColegio] = useState('');
    const [nombres, setNombres] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [correoElectronico, setCorreoElectronico] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [confirmarContraseña, setConfirmarContraseña] = useState('');
    const [registrando, setRegistrando] = useState(false);

    // login
    const [loginCorreo, setLoginCorreo] = useState('');
    const [loginContraseña, setLoginContraseña] = useState('');

    // login alumno
    const [loginNombreColegio, setLoginNombreColegio] = useState('');
    const [loginCodigoEstu, setLoginCodigoEstu] = useState('');

    const [fontsLoaded] = useFonts({
        Kavoon_400Regular,
        CenturyGothic: require('../../assets/font/3394-font.ttf'),
        CenturyGothicBold: require('../../assets/font/4410-font.ttf'),
    });

    // TOAST state and refs
    const toastAnim = useRef(new Animated.Value(0)).current; // 0 hidden, 1 visible
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('info'); // 'info' | 'error' | 'success'
    const hideTimerRef = useRef(null);

    // showToast replaces previous alerts; stays 10s then hides
    const showToast = (message, type = 'info', durationMs = 10000) => {
        // clear previous timer
        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
        }

        setToastMessage(message);
        setToastType(type);
        setToastVisible(true);

        // animate in
        Animated.timing(toastAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();

        // auto hide after durationMs
        hideTimerRef.current = setTimeout(() => {
            hideToast();
        }, durationMs);
    };

    const hideToast = () => {
        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
        }
        Animated.timing(toastAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
        }).start(() => {
            setToastVisible(false);
            setToastMessage('');
        });
    };

    // Utilidades Firestore
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

    const existeDocente = async (correo) => {
        const docentesRef = collection(db, "docente");
        const consulta = query(docentesRef, where("correoElectronico", "==", correo));
        const resultado = await getDocs(consulta);
        return !resultado.empty;
    };

    const registroDocente = async () => {
        if (registrando) return;
        setRegistrando(true);

        if (!nombreColegio || !nombres || !apellidos || !correoElectronico || !contraseña || !confirmarContraseña) {
            showToast('Por favor completá todos los campos', 'error');
            setRegistrando(false);
            return;
        }

        if (contraseña.length < 6) {
            showToast('La contraseña debe tener al menos 6 caracteres', 'error');
            setRegistrando(false);
            return;
        }

        if (contraseña !== confirmarContraseña) {
            showToast('Las contraseñas no coinciden', 'error');
            setRegistrando(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, correoElectronico.trim(), contraseña);
            const usuario = userCredential.user;

            await updateProfile(usuario, {
                displayName: nombres + " " + apellidos
            });

            await sendEmailVerification(usuario);

            const id = await obtenerNuevoIdDocente();

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

            showToast('Docente registrado correctamente', 'success');
            setTimeout(() => navigation.navigate("Home"), 1200);
        } catch (error) {
            console.error("Error al registrar:", error);
            // Mensaje más específico si existe código
            if (error?.code === 'auth/email-already-in-use') {
                showToast('El correo ya está en uso', 'error');
            } else if (error?.code === 'auth/invalid-email') {
                showToast('Formato de correo inválido', 'error');
            } else {
                showToast('No se pudo registrar. Intentá de nuevo más tarde', 'error');
            }
        } finally {
            setRegistrando(false);
        }
    };

    // --- NUEVA FUNCIÓN: safeSignIn ---
    const safeSignIn = async (emailRaw, passwordRaw) => {
        const email = (emailRaw || '').toString().trim();
        const password = (passwordRaw || '').toString().trim();

        if (!email || !password) {
            showToast('Por favor ingresa correo y contraseña (sin espacios)', 'error');
            return { ok: false };
        }

        // DEBUG: muestra longitud de password, no el password en texto
        console.log('[DEBUG] safeSignIn -> email:', email, 'passwordLength:', password.length);

        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            console.log('SignIn OK', cred.user.uid);
            return { ok: true, user: cred.user };
        } catch (error) {
            console.log('Firebase signIn error:', error.code, error.message);
            // Mapear códigos a mensajes amigables
            switch (error.code) {
                case 'auth/user-not-found':
                    showToast('Usuario no encontrado. Verificá el código.', 'error');
                    break;
                case 'auth/wrong-password':
                    showToast('Contraseña incorrecta. Intentá de nuevo.', 'error');
                    break;
                case 'auth/invalid-email':
                    showToast('Formato de correo inválido. Revisa el código ingresado.', 'error');
                    break;
                case 'auth/invalid-credential':
                    showToast('Credenciales inválidas', 'error');
                    break;
                default:
                    showToast('Error al iniciar sesión. Intentá nuevamente más tarde.', 'error');
            }
            return { ok: false, error };
        }
    };

    // Reemplazo de validarLogin usando safeSignIn
    const validarLogin = async () => {
        const email = (loginCorreo || '').toString().trim();
        const password = (loginContraseña || '').toString().trim();

        if (!email || !password) {
            showToast('Ingresá tu correo y contraseña', 'error');
            return;
        }

        const res = await safeSignIn(email, password);
        if (!res.ok) return;

        showToast('Inicio de sesión exitoso', 'success');
        setTimeout(() => navigation.navigate("Home"), 900);
    };

    // Reemplazo de validarAlumno usando safeSignIn
    //login alumno
    const validarAlumno = async () => {
        if (!loginNombreColegio || !loginCodigoEstu) {
            showToast("Campos vacíos", "Ingresá el nombre del colegio y código del estudiante.");
            return;
        }

        try {
            // Autenticación con Firebase Auth
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
                showToast("Datos no coinciden", "El colegio no coincide con el código del alumno.");
                return;
            }

            showToast("Bienvenido", "Inicia a interactuar de manera educativa");
            navigation.navigate("inicioAlumno");

        } catch (error) {
            //console.error("Error en login:", error);
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                showToast("Credenciales incorrectas", "Verificá el código del alumno.");
            } else {
                showToast("Error", "No se pudo acceder al perfil del estudiante.");
            }
        }
    };

    if (!fontsLoaded) return null;

    // toast animated style: translateY and translateX to appear from top-right
    const toastTranslateY = toastAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-20, 0],
    });
    const toastOpacity = toastAnim;

    return (
        <View style={styles.container}>
            <Image style={styles.ima1} source={require('../../assets/fondo/ari.png')} />
            <Image style={styles.ima2} source={require('../../assets/fondo/aba.png')} />

            {mostrarRegistro && !mostrarLogin && (
                <View style={[styles.log, { height: logHeight }]}>
                    <Text style={[styles.tex1, styles.fon1]}>Registro</Text>
                    <View style={styles.pickerStyle}>
                        <Picker selectedValue={rol} onValueChange={(v) => setRol(v)} style={[styles.picker, styles.fon2]}>
                            <Picker.Item label="Escoje tu rol" value={null} />
                            <Picker.Item label="Docente" value="Docente" />
                            <Picker.Item label="Alumno" value="Alumno" />
                        </Picker>
                    </View>

                    {rol === 'Docente' && (
                        <View style={styles.logDocen}>
                            <Text style={[styles.tex5, styles.fon1]}>Nombre del colegio</Text>
                            <TextInput style={[styles.texImpul, styles.fon3]} value={nombreColegio} onChangeText={setNombreColegio} />
                            <Text style={[styles.tex5, styles.fon1]}>Nombres</Text>
                            <TextInput style={[styles.texImpul, styles.fon3]} value={nombres} onChangeText={setNombres} />
                            <Text style={[styles.tex5, styles.fon1]}>Apellidos</Text>
                            <TextInput style={[styles.texImpul, styles.fon3]} value={apellidos} onChangeText={setApellidos} />
                            <Text style={[styles.tex5, styles.fon1]}>Correo electrónico</Text>
                            <TextInput style={[styles.texImpul, styles.fon3]} value={correoElectronico} onChangeText={setCorreoElectronico} />
                            <Text style={[styles.tex5, styles.fon1]}>Contraseña</Text>
                            <TextInput style={[styles.texImpul, styles.fon3]} secureTextEntry={!verPassword1} value={contraseña} onChangeText={setContraseña} />
                            <TouchableOpacity onPress={() => setVerPassword1(!verPassword1)}>
                                <Image source={verPassword1 ? require('../../assets/eyes/on.png') : require('../../assets/eyes/off.png')} style={styles.iconoOjo} />
                            </TouchableOpacity>
                            <Text style={[styles.tex5, styles.fon1]}>Confirmar contraseña</Text>
                            <TextInput style={[styles.texImpul, styles.fon3]} secureTextEntry={!verPassword} value={confirmarContraseña} onChangeText={setConfirmarContraseña} />
                            <TouchableOpacity onPress={() => setVerPassword(!verPassword)}>
                                <Image source={verPassword ? require('../../assets/eyes/on.png') : require('../../assets/eyes/off.png')} style={styles.iconoOjo} />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.booton} onPress={registroDocente}>
                                <Text style={[styles.tex2, styles.fon1]}>Registrar</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {rol === 'Alumno' && (
                        <View style={styles.logEstu}>
                            <Text style={[styles.tex5, styles.fon1]}>Nombre del colegio</Text>
                            <TextInput style={[styles.texImpul, styles.fon3]} value={loginNombreColegio} onChangeText={setLoginNombreColegio} placeholder="Ingresá tu colegio" placeholderTextColor="rgba(255,255,255,0.7)" />
                            <Text style={[styles.tex5, styles.fon1]}>Codigo del alumno</Text>
                            <TextInput style={[styles.texImpul, styles.fon3]} value={loginCodigoEstu} onChangeText={setLoginCodigoEstu} placeholder="Ingresá tu código" placeholderTextColor="rgba(255,255,255,0.7)" />
                            <TouchableOpacity style={styles.booton} onPress={validarAlumno}>
                                <Text style={[styles.tex2, styles.fon1]}>Aceder</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {rol === null && <Image style={styles.ima10} source={require('../../assets/log/nino.png')} />}
                    {rol === 'Alumno' && <Image style={styles.ima3} source={require('../../assets/log/nino.png')} />}
                    {rol === 'Docente' && <Image style={styles.ima3} source={require('../../assets/log/docente.png')} />}

                    <Text style={[styles.tex3, styles.fon2]}>
                        Iniciar sesión:
                        <TouchableOpacity style={styles.bootonLog} onPress={() => { setMostrarLogin(true); setMostrarRegistro(false); }}>
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
                    <TextInput style={[styles.texImpul, styles.fon3]} value={loginCorreo} onChangeText={setLoginCorreo} placeholder="Ingresá tu correo" placeholderTextColor="rgba(255,255,255,0.7)" />
                    <Text style={[styles.tex5, styles.fon1]}>Contraseña</Text>
                    <TextInput style={[styles.texImpul, styles.fon3]} secureTextEntry={!verPassword3} value={loginContraseña} onChangeText={setLoginContraseña} placeholder="Contraseña" placeholderTextColor="rgba(255,255,255,0.7)" />
                    <TouchableOpacity onPress={() => setVerPassword3(!verPassword3)}>
                        <Image source={verPassword3 ? require('../../assets/eyes/on.png') : require('../../assets/eyes/off.png')} style={styles.iconoOjo} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.booton} onPress={validarLogin}>
                        <Text style={[styles.tex2, styles.fon1]}>Iniciar</Text>
                    </TouchableOpacity>

                    <Text style={[styles.tex3, styles.fon2]}>
                        Registrarse:
                        <TouchableOpacity style={styles.bootonLog} onPress={() => { setMostrarLogin(false); setMostrarRegistro(true); }}>
                            <Text style={[styles.tex4, styles.fon2]}>Registro</Text>
                        </TouchableOpacity>
                    </Text>

                    <Image style={styles.ima3} source={require('../../assets/log/docente.png')} />
                    <Image style={styles.ima4} source={require('../../assets/log/hierba.png')} />
                    <Image style={styles.ima5} source={require('../../assets/log/hierba.png')} />
                </View>
            )}

            {/* Toast emergente superior derecho */}
            {toastVisible && (
                <Animated.View
                    pointerEvents="box-none"
                    style={[
                        styles.toastContainer,
                        {
                            opacity: toastOpacity,
                            transform: [
                                { translateY: toastTranslateY },
                                { translateX: 0 }
                            ]
                        }
                    ]}
                >
                    <View style={[styles.toastBox, toastType === 'error' ? styles.toastError : toastType === 'success' ? styles.toastSuccess : styles.toastInfo]}>
                        <Text numberOfLines={1} style={styles.toastText}>{toastMessage}</Text>
                    </View>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center', backgroundColor: '#ffffff',
        top: 10
    },
    log: {
        backgroundColor: '#99E7D9',
        width: 350,
        height: 400,
        borderRadius: 50,
        top: -60,
        position: 'relative'
    },
    fon1: {
        fontFamily: 'Kavoon_400Regular'
    },
    fon2: {
        fontFamily: 'CenturyGothic'
    },
    ima1: {
        top: -10,
        position: 'absolute'
    },
    ima2: {
        bottom: 10,
        position: 'absolute'
    },
    tex1: {
        width: 150,
        height: 50,
        left: 100,
        fontSize: 30,
        textAlign: 'center',
        textAlignVertical: 'center',
        color: '#34B0A6'
    },
    picker: {
        width: '100%',
        height: 50,
        color: '#ffffff'
    },
    pickerStyle: {
        backgroundColor: '#34B0A6',
        width: 200,
        left: 70,
        marginTop: 10,
        marginBottom: 10,
        borderRadius: 30
    },
    booton: {
        backgroundColor: '#34B0A6',
        width: 150,
        height: 50,
        justifyContent: 'center',
        left: 100,
        borderRadius: 30,
        top: 20
    },
    tex2: {
        textAlign: 'center',
        color: '#ffffff'
    },
    tex3: {
        top: 40,
        left: 90
    },
    tex4: {
        color: '#0400FF',
        top: '5', left: 5
    },
    bootonLog: {
        left: 10
    },
    ima3: {
        position: 'absolute',
        width: 126, height: 126,
        alignSelf: 'flex-end',
        bottom: -3
    },
    ima10: {
        position: 'absolute',
        width: 160, height: 160,
        alignSelf: 'flex-end',
        bottom: -3
    },
    ima4: {
        position: 'absolute',
        width: 40,
        height: 40,
        left: 275,
        bottom: -5
    },
    ima5: {
        position: 'absolute',
        width: 40,
        height: 40,
        bottom: -5,
        left: 25
    },
    logDocen: {
        width: 350
    },
    logEstu: {
        width: 350
    },
    tex5: {
        marginTop: 5,
        left: 55,
        color: '#34B0A6'
    },
    texImpul: {
        backgroundColor: '#34B0A6',
        color: '#fff', width: 250,
        height: 50,
        borderRadius: 10,
        alignSelf: 'center',
        textAlign: 'center'
    },
    fon3: {
        fontFamily: 'CenturyGothic-Bold'
    },
    login: {
        backgroundColor: '#99E7D9',
        width: 350, height: 400,
        borderRadius: 50,
        top: 190,
        position: 'absolute'
    },
    iconoOjo: {
        position: 'absolute',
        width: 40,
        height: 40,
        left: 245,
        top: -45,
        zIndex: 10,
        tintColor: '#99E7D9'
    },

    /* Toast styles top-right */
    toastContainer: {
        position: 'absolute',
        top: 40,
        right: 12,
        zIndex: 9999,
        alignItems: 'flex-end',
    },
    toastBox: {
        minWidth: 160,
        maxWidth: 320,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 6,
    },
    toastText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    toastError: { backgroundColor: '#E74C3C' },
    toastSuccess: { backgroundColor: '#2ECC71' },
    toastInfo: { backgroundColor: '#34B0A6' },
});
