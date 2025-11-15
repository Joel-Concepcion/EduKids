import {
    StyleSheet,
    View,
    Text,
    Button,
    Image,
    TextInput,
    TouchableOpacity,
    Dimensions,
    Modal,
    Alert,
} from "react-native";
import React, { useState, useEffect } from 'react';
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import * as Font from 'expo-font';
import { useFonts, Kavoon_400Regular } from '@expo-google-fonts/kavoon';
import { auth, db } from '../../model/db';
import {
    doc,
    getDoc,
    setDoc,
    query,
    where,
    getDocs,
    collection
} from 'firebase/firestore';

const fetchFonts = () => {
    return Font.loadAsync({
        'CenturyGothic': require('../../assets/font/3394-font.ttf'),
        'CenturyGothic-Bold': require('../../assets/font/4410-font.ttf'),
    });
};

const avatarMap = {
    'Ellipse 3.png': require('../../assets/avatar/Ellipse 3.png'),
    'Ellipse 4.png': require('../../assets/avatar/Ellipse 4.png'),
    'Ellipse 5.png': require('../../assets/avatar/Ellipse 5.png'),
    'Ellipse 6.png': require('../../assets/avatar/Ellipse 6.png'),
    'Ellipse 7.png': require('../../assets/avatar/Ellipse 7.png'),
    'Ellipse 8.png': require('../../assets/avatar/Ellipse 8.png'),
};


export default function inicioAlumno() {
    const navigation = useNavigation();
    const [fontsLoaded] = useFonts({ Kavoon_400Regular });
    const [modalVisible, setModalVisible] = useState(false);
    const [codigoClase, setCodigoClase] = useState('');
    const [clasesAlumno, setClasesAlumno] = useState([]);
    const [nombreAlumno, setNombreAlumno] = useState('');
    const [avatarAlumno, setAvatarAlumno] = useState('Ellipse 3.png');


    // Cargar nombre y avatar del alumno por UID
    useEffect(() => {
        const cargarNombreYAvatar = async () => {
            const usuario = auth?.currentUser;
            if (!usuario || !usuario.uid) return;

            try {
                const consulta = query(
                    collection(db, 'alumnos'),
                    where('uid', '==', usuario.uid)
                );
                const resultado = await getDocs(consulta);

                if (!resultado.empty) {
                    const alumnoDoc = resultado.docs[0];
                    const datos = alumnoDoc.data();
                    setNombreAlumno(datos.nombres_apellidos || '');
                    setAvatarAlumno(datos.avatar || 'Ellipse 3.png');
                } else {
                    console.warn('No se encontró el alumno con ese UID');
                }
            } catch (error) {
                console.error('Error al cargar datos del alumno:', error);
            }
        };

        cargarNombreYAvatar();

        // Ejecutar cada vez que se vuelve a enfocar la pantalla
        const unsubscribe = navigation.addListener('focus', cargarNombreYAvatar);
        return unsubscribe;
    }, []);

    //Cargar clases del alumno
    useEffect(() => {
        const cargarClasesAlumno = async () => {
            try {
                const usuario = auth?.currentUser;
                const unsubscribe = navigation.addListener('focus', cargarClasesAlumno);
                if (!usuario || !usuario.uid) return;

                const consulta = query(
                    collection(db, 'alumnos'),
                    where('uid', '==', usuario.uid)
                );
                const resultado = await getDocs(consulta);

                if (!resultado.empty) {
                    const alumnoDoc = resultado.docs[0];
                    const { clases = [] } = alumnoDoc.data();
                    const clasesCargadas = [];

                    for (const id of clases) {
                        const claseRef = doc(db, 'clases', id);
                        const claseDoc = await getDoc(claseRef);
                        if (claseDoc.exists()) {
                            clasesCargadas.push({ id, ...claseDoc.data() });
                        }
                    }

                    setClasesAlumno(clasesCargadas);
                }
            } catch (error) {
                console.error("Error al cargar clases del alumno:", error);
            }
        };

        const unsubscribe = navigation.addListener('focus', cargarClasesAlumno);
        return unsubscribe;
    }, [navigation]);

    //Unirse a clase por código
    const handleUnirseClase = async () => {
        try {
            if (!codigoClase.trim()) {
                Alert.alert("Código vacío", "Ingresá un código válido.");
                return;
            }

            const clasesRef = collection(db, 'clases');
            const consulta = query(clasesRef, where('codigoClase', '==', codigoClase.trim()));
            const resultado = await getDocs(consulta);

            if (resultado.empty) {
                Alert.alert('Clase no encontrada', 'Verificá el código ingresado.');
                return;
            }

            const claseDoc = resultado.docs[0];
            const datosClase = claseDoc.data();
            const idClase = claseDoc.id;

            const usuario = auth?.currentUser;
            if (!usuario || !usuario.uid) {
                Alert.alert('Error de sesión', 'No se pudo identificar al alumno.');
                return;
            }

            const alumnoConsulta = query(
                collection(db, 'alumnos'),
                where('uid', '==', usuario.uid)
            );
            const alumnoResultado = await getDocs(alumnoConsulta);

            if (alumnoResultado.empty) {
                Alert.alert('Alumno no encontrado', 'No se pudo cargar tu perfil.');
                return;
            }

            const alumnoDocRef = alumnoResultado.docs[0].ref;
            const alumnoData = alumnoResultado.docs[0].data();
            const clasesActuales = alumnoData.clases || [];

            if (clasesActuales.includes(idClase)) {
                Alert.alert('Ya estás inscrito', 'Esta clase ya está en tu lista.');
                setModalVisible(false);
                setCodigoClase('');
                return;
            }

            await setDoc(alumnoDocRef, {
                clases: [...clasesActuales, idClase]
            }, { merge: true });

            setClasesAlumno(prev => [...prev, { id: idClase, ...datosClase }]);
            setModalVisible(false);
            setCodigoClase('');
        } catch (error) {
            console.error('Error al unirse a la clase:', error);
            Alert.alert('Error', 'No se pudo unir a la clase.');
        }
    };

    if (!fontsLoaded) return null;
    return (
        <View style={styles.container}>
            {/* Encabezado */}
            <View style={styles.footer}>
                <TouchableOpacity onPress={() => navigation.navigate("Perfil Alumno")}>
                    <Image style={{ top: 40, width: 100, height: 100, borderRadius: 75, left: "10%" }} source={avatarMap[avatarAlumno] || avatarMap['Ellipse 3.png']} />
                </TouchableOpacity>
                <Text style={[styles.font, styles.tex1, { left: "5%", top: "50%" }]}>{nombreAlumno}</Text>
            </View>

            {/* Botón flotante para unirse */}
            <TouchableOpacity
                style={{ left: 300, top: 700, zIndex: 10, position: 'absolute' }}
                onPress={() => setModalVisible(true)}
            >
                <Image source={require('../../assets/avatar/RE (1).png')} />
            </TouchableOpacity>

            {/* Modal para ingresar código */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000aa' }}>
                    <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '90%', minHeight: '25%', }}>
                        <Text style={[styles.font, { fontSize: 18 }]}>Ingresá el código de la clase</Text>
                        <TextInput
                            value={codigoClase}
                            onChangeText={setCodigoClase}
                            placeholder="Ingresa el código de la clase"
                            style={{ borderRadius: 25, backgroundColor: '#34B0A6', padding: 25, marginTop: 15, minHeight: 50, color: '#ffffff', fontFamily: 'Kavoon_400Regular' }}
                        />
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', marginTop: 25 }}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.boton2}>
                                <Text style={styles.botonTexto}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleUnirseClase} style={styles.boton1}>
                                <Text style={styles.botonTexto}>Unirse</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Clases inscritas */}
            <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 15 }}>
                {clasesAlumno.length > 0 ? (
                    clasesAlumno.map((clase, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => navigation.navigate('Clase', { clase })}
                        >
                            <Image style={styles.imScroll} source={require('../../assets/bannerClase/Rectangle 18.png')} />
                            <Text style={[styles.font, { position: 'absolute', bottom: 20, left: 20, color: '#fff' }]}>
                                {clase.nombre || 'Clase'}
                            </Text>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={{ alignItems: 'center', marginTop: 20 }}>
                        <Image source={require('../../assets/Proyecto nuevo (2) 1.png')} style={{opacity: 0.5}} />
                        <Text style={styles.font}>
                            No estás inscrito en ninguna clase aún.
                        </Text>
                    </View>
                )


                }
            </ScrollView>

            {/* Decoración inferior */}
            <View style={styles.header}>
                <Image style={{ right: -12 }} source={require('../../assets/log/hierba.png')} />
                <Image style={{ left: 290 }} source={require('../../assets/log/hierba.png')} />
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
    },
    footer: {
        backgroundColor: '#99E7D9',
        width: Dimensions.get('window').width,
        height: 150,
        flexDirection: 'row',
    },
    font: {
        fontFamily: 'Kavoon_400Regular',
        bottom: 60,
        left: '1%',
        opacity: 0.5,
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
    },
    boton1: {
        backgroundColor: '#34B0A6',
        padding: 10,
        borderRadius: 25,
        width: 100,
        alignItems: 'center',
    },
    boton2: {
        backgroundColor: '#FF6B6B',
        padding: 10,
        borderRadius: 25,
        width: 100,
        alignItems: 'center',
    },
    botonTexto: {
        fontFamily: 'Kavoon_400Regular',
        color: '#fff',
        fontSize: 16,
    }
});
