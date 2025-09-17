<<<<<<< HEAD
import { StyleSheet, View, Text, Button, Image, TextInput, TouchableOpacity, Dimensions } from "react-native";
import React, { useState, useEffect } from 'react';
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import * as Font from 'expo-font';
import { Alert } from 'react-native';
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDocs
} from 'firebase/firestore';
import appFirebase from '../../model/db';
const db = getFirestore(appFirebase);

const fetchFonts = () => {
    return Font.loadAsync({
        'CenturyGothic': require('../../assets/font/3394-font.ttf'),
        'CenturyGothic-Bold': require('../../assets/font/4410-font.ttf'),
    });
};

export default function registroAlumno() {
    const navigation = useNavigation();
    const [codigoEditando, setCodigoEditando] = useState(null);
    const [codigoOriginal, setCodigoOriginal] = useState(null);



    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
    const [nombreColegio, setNombreColegio] = useState('');
    const [nombreAlumno, setNombreAlumno] = useState('');
    const [codigoAlumno, setCodigoAlumno] = useState('');
    const [listaAlumnos, setListaAlumnos] = useState([]);

    //fecha formato YYYY-MM-DD
    const obtenerFechaActual = () => {
        const hoy = new Date();
        return hoy.toISOString().split('T')[0];

    };

    //para optener solo el año
    const obtenerAñoActual = () => {
        return new Date().getFullYear();
    };

    //seccion para añadir alumnos y que esten listros para guardar
    const añadirAlumno = () => {
        if (!nombreColegio.trim() || !nombreAlumno.trim() || !codigoAlumno.trim()) {
            Alert.alert('Campos incompletos', 'Por favor, completá todos los campos antes de añadir el alumno.');
            return;
        }

        if (codigoOriginal) {
            //editar informacion
            const nuevaLista = listaAlumnos.map(al =>
                al.codigo_alumno === codigoOriginal
                    ? {
                        ...al,
                        nombres_apellidos: nombreAlumno,
                        codigo_alumno: codigoAlumno,
                        nombre_colegio: nombreColegio,
                        fecha_registro: obtenerFechaActual(),
                        rolId: '3',
                    }
                    : al
            );

            setListaAlumnos(nuevaLista);
            setCodigoOriginal(null);
        } else {
            // estás añadiendo uno nuevo
            const existe = listaAlumnos.some(al => al.codigo_alumno === codigoAlumno);
            if (existe) {
                Alert.alert('Código duplicado', 'Ya existe un alumno con ese código.');
                return;
            }

            const nuevoAlumno = {
                nombres_apellidos: nombreAlumno,
                codigo_alumno: codigoAlumno,
                nombre_colegio: nombreColegio,
                fecha_registro: obtenerFechaActual(),
                rol: '3',
            };

            setListaAlumnos([...listaAlumnos, nuevoAlumno]);
        }

        // Limpieza de campos
        setNombreAlumno('');
        setCodigoAlumno('');
    };

    //Unaves listado, seccion para guardar el registro 
    const guardarRegistro = async () => {
        try {
            const alumnosRef = collection(db, 'alumnos');
            const snapshot = await getDocs(alumnosRef);
            const cantidad = snapshot.size;

            let alumnosValidos = listaAlumnos.filter(alumno =>
                alumno.nombres_apellidos?.trim() &&
                alumno.codigo_alumno?.trim() &&
                alumno.nombre_colegio?.trim()
            );

            if (alumnosValidos.length === 0) {
                Alert.alert('Sin datos válidos', 'No hay alumnos con información completa para guardar.');
                return false;
            }

            for (const [index, alumno] of alumnosValidos.entries()) {
                const id = cantidad + index + 1;
                const alumnoDoc = doc(alumnosRef);
                await setDoc(alumnoDoc, {
                    ...alumno,
                    id,
                    año_registro: obtenerAñoActual()
                });
            }

            // Registrar la alumnos por año
            const claseRef = doc(collection(db, 'clases'), obtenerAñoActual().toString());
            await setDoc(claseRef, {
                año: obtenerAñoActual(),
                cantidad_alumnos: alumnosValidos.length,
                colegio: nombreColegio,
                fecha: obtenerFechaActual()
            });

            Alert.alert('Registro exitoso', 'Los datos se guardaron correctamente.');
            setListaAlumnos([]);
            setAlumnoSeleccionado(null);
            setNombreAlumno('');
            setCodigoAlumno('');
            return true;
        } catch (error) {
            console.error('Error al guardar:', error);
            Alert.alert('Error', 'Hubo un problema al guardar los datos.');
            return false;
        }
    };


    return (

        <View style={styles.container}>

            <View style={styles.conFor}>
                <Text style={[styles.tex, styles.font]}>Nombre del colegio</Text>
                <TextInput
                    style={[styles.texImp, styles.font1]}
                    value={nombreColegio}
                    onChangeText={setNombreColegio}
                />

                <Text style={[styles.tex, styles.font]}>Nombre, Apellido del alumno</Text>
                <TextInput
                    style={[styles.texImp, styles.font1]}
                    value={nombreAlumno}
                    onChangeText={setNombreAlumno}
                />

                <Text style={[styles.tex, styles.font]}>Codigo del alumno </Text>
                <TextInput
                    style={[styles.texImp, styles.font1]}
                    value={codigoAlumno}
                    onChangeText={setCodigoAlumno}
                />

                <TouchableOpacity style={styles.bt} onPress={añadirAlumno}>
                    <Text style={[styles.tex11, styles.font]}>
                        {codigoEditando ? 'Añadir' : 'Actualizar'}
                    </Text>

                </TouchableOpacity>
            </View>
            <View style={styles.contS}>

                <View style={styles.contScroll}>
                    <Text style={[styles.tex3, styles.font]}>Nombres apellido</Text>
                    <Text style={[styles.tex2, styles.font]}>Código</Text>
                </View>

                <ScrollView style={styles.scroll}>
                    {listaAlumnos.map((alumno, index) => (
                        <View key={index}>
                            <TouchableOpacity
                                style={styles.card}
                                onPress={() =>
                                    setAlumnoSeleccionado(
                                        alumnoSeleccionado === alumno.codigo_alumno ? null : alumno.codigo_alumno
                                    )
                                }
                            >
                                <Text style={[styles.texCon, styles.font, styles.code1]}>
                                    {alumno.nombres_apellidos}
                                </Text>
                                <Text style={[styles.texCon, styles.font, styles.code]}>
                                    {alumno.codigo_alumno}
                                </Text>
                            </TouchableOpacity>

                            {alumnoSeleccionado === alumno.codigo_alumno && (
                                <View style={styles.botones}>
                                    <TouchableOpacity
                                        style={styles.botonesS}
                                        onPress={() => {
                                            setNombreAlumno(alumno.nombres_apellidos);
                                            setCodigoAlumno(alumno.codigo_alumno);
                                            setCodigoEditando(alumno.codigo_alumno);
                                            setCodigoOriginal(alumno.codigo_alumno);
                                        }}
                                    >
                                        <Text style={[styles.tex51, styles.font]}>Editar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.botonesSS}
                                        onPress={() => {
                                            setListaAlumnos(listaAlumnos.filter(a => a.codigo_alumno !== alumno.codigo_alumno));
                                            setAlumnoSeleccionado(null);
                                            setCodigoEditando(null);
                                            ;
                                        }}
                                    >
                                        <Text style={[styles.tex51, styles.font]}>Eliminar</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>


                <TouchableOpacity style={styles.btt}
                    onPress={async () => {
                        await guardarRegistro();
                        navigation.navigate("Registro");
                    }}
                >
                    <Text style={[styles.tex11, styles.font]}>Guardar Registro</Text>
                </TouchableOpacity>

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
    conFor: {
        bottom: 100,
        marginTop: 30,
    },
    font: {
        fontFamily: 'CenturyGothic-Bold',
        fontSize: 17,
    },
    font1: {
        fontFamily: 'CenturyGothic',
        fontSize: 15,
    },
    tex: {
        left: 10,
        marginTop: 10
        ,
    },
    texImp: {
        backgroundColor: '#99E7D9',
        borderRadius: 30,
        width: 350,
        height: 60,
        textAlign: 'center',
    },
    bt: {
        alignItems: 'center',
        width: 100,
        height: 50,
        borderRadius: 20,
        backgroundColor: '#34B0A6',
        left: 120,
        top: 10,
    },
    tex11: {
        top: 10,
    },
    contScroll: {
        width: Dimensions.get('window').width,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 5,

    },
    tex2: {
        top: 8,
        left: -90,
    },
    tex3: {
        top: 8,
        left: 20,
    },
    scroll: {
        height: 10,
    },

    card: {
        width: 330,
        flexDirection: 'row',
        marginRight: 15,
        padding: 10,
        borderRadius: 10,
        justifyContent: 'space-between',
    },

    botones: {
        marginTop: 5,
        flexDirection: 'row',
        justifyContent: 'space-around',
        right: 20,

    },
    tex51: {
        top: 5,
    },
    botonesS: {
        backgroundColor: '#00a458bf',
        width: 100,
        height: 40,
        alignItems: 'center',
        borderRadius: 10,
        left: 50,
    },
    botonesSS: {
        backgroundColor: '#fc0000bf',
        width: 100,
        height: 40,
        alignItems: 'center',
        borderRadius: 10,
    },
    contS: {
        backgroundColor: '#99E7D9',
        height: 300,
        borderRadius: 30,
        width: 350,
        bottom: 70,
    },
    code: {
        left: 5,
        backgroundColor: '#34B0A6',
        borderRadius: 20,
        width: 100,
        height: 50,
        textAlign: 'center',
        textAlignVertical: 'center',
        fontSize: 14,
    },
    code1: {
        backgroundColor: '#34B0A6',
        borderRadius: 20,
        width: 200,
        height: 50,
        textAlign: 'center',
        textAlignVertical: 'center',
        fontSize: 14,
    },
    btt: {
        alignItems: 'center',
        width: 150,
        height: 50,
        borderRadius: 20,
        backgroundColor: '#34B0A6',
        left: 110,
        top: 70,
    },


=======
import { StyleSheet, View, Text, Button, Image, TextInput, TouchableOpacity, Dimensions } from "react-native";
import React, { useState, useEffect } from 'react';
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import * as Font from 'expo-font';
import { Alert } from 'react-native';
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDocs
} from 'firebase/firestore';
import appFirebase from '../../model/db';
const db = getFirestore(appFirebase);

const fetchFonts = () => {
    return Font.loadAsync({
        'CenturyGothic': require('../../assets/font/3394-font.ttf'),
        'CenturyGothic-Bold': require('../../assets/font/4410-font.ttf'),
    });
};

export default function registroAlumno() {
    const navigation = useNavigation();
    const [codigoEditando, setCodigoEditando] = useState(null);
    const [codigoOriginal, setCodigoOriginal] = useState(null);



    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
    const [nombreColegio, setNombreColegio] = useState('');
    const [nombreAlumno, setNombreAlumno] = useState('');
    const [codigoAlumno, setCodigoAlumno] = useState('');
    const [listaAlumnos, setListaAlumnos] = useState([]);

    //fecha formato YYYY-MM-DD
    const obtenerFechaActual = () => {
        const hoy = new Date();
        return hoy.toISOString().split('T')[0];

    };

    //para optener solo el año
    const obtenerAñoActual = () => {
        return new Date().getFullYear();
    };

    //seccion para añadir alumnos y que esten listros para guardar
    const añadirAlumno = () => {
        if (!nombreColegio.trim() || !nombreAlumno.trim() || !codigoAlumno.trim()) {
            Alert.alert('Campos incompletos', 'Por favor, completá todos los campos antes de añadir el alumno.');
            return;
        }

        if (codigoOriginal) {
            //editar informacion
            const nuevaLista = listaAlumnos.map(al =>
                al.codigo_alumno === codigoOriginal
                    ? {
                        ...al,
                        nombres_apellidos: nombreAlumno,
                        codigo_alumno: codigoAlumno,
                        nombre_colegio: nombreColegio,
                        fecha_registro: obtenerFechaActual(),
                        rolId: '3',
                    }
                    : al
            );

            setListaAlumnos(nuevaLista);
            setCodigoOriginal(null);
        } else {
            // estás añadiendo uno nuevo
            const existe = listaAlumnos.some(al => al.codigo_alumno === codigoAlumno);
            if (existe) {
                Alert.alert('Código duplicado', 'Ya existe un alumno con ese código.');
                return;
            }

            const nuevoAlumno = {
                nombres_apellidos: nombreAlumno,
                codigo_alumno: codigoAlumno,
                nombre_colegio: nombreColegio,
                fecha_registro: obtenerFechaActual(),
                rol: '3',
            };

            setListaAlumnos([...listaAlumnos, nuevoAlumno]);
        }

        // Limpieza de campos
        setNombreAlumno('');
        setCodigoAlumno('');
    };

    //Unaves listado, seccion para guardar el registro 
    const guardarRegistro = async () => {
        try {
            const alumnosRef = collection(db, 'alumnos');
            const snapshot = await getDocs(alumnosRef);
            const cantidad = snapshot.size;

            let alumnosValidos = listaAlumnos.filter(alumno =>
                alumno.nombres_apellidos?.trim() &&
                alumno.codigo_alumno?.trim() &&
                alumno.nombre_colegio?.trim()
            );

            if (alumnosValidos.length === 0) {
                Alert.alert('Sin datos válidos', 'No hay alumnos con información completa para guardar.');
                return false;
            }

            for (const [index, alumno] of alumnosValidos.entries()) {
                const id = cantidad + index + 1;
                const alumnoDoc = doc(alumnosRef);
                await setDoc(alumnoDoc, {
                    ...alumno,
                    id,
                    año_registro: obtenerAñoActual()
                });
            }

            // Registrar la alumnos por año
            const claseRef = doc(collection(db, 'clases'), obtenerAñoActual().toString());
            await setDoc(claseRef, {
                año: obtenerAñoActual(),
                cantidad_alumnos: alumnosValidos.length,
                colegio: nombreColegio,
                fecha: obtenerFechaActual()
            });

            Alert.alert('Registro exitoso', 'Los datos se guardaron correctamente.');
            setListaAlumnos([]);
            setAlumnoSeleccionado(null);
            setNombreAlumno('');
            setCodigoAlumno('');
            return true;
        } catch (error) {
            console.error('Error al guardar:', error);
            Alert.alert('Error', 'Hubo un problema al guardar los datos.');
            return false;
        }
    };


    return (

        <View style={styles.container}>

            <View style={styles.conFor}>
                <Text style={[styles.tex, styles.font]}>Nombre del colegio</Text>
                <TextInput
                    style={[styles.texImp, styles.font1]}
                    value={nombreColegio}
                    onChangeText={setNombreColegio}
                />

                <Text style={[styles.tex, styles.font]}>Nombre, Apellido del alumno</Text>
                <TextInput
                    style={[styles.texImp, styles.font1]}
                    value={nombreAlumno}
                    onChangeText={setNombreAlumno}
                />

                <Text style={[styles.tex, styles.font]}>Codigo del alumno </Text>
                <TextInput
                    style={[styles.texImp, styles.font1]}
                    value={codigoAlumno}
                    onChangeText={setCodigoAlumno}
                />

                <TouchableOpacity style={styles.bt} onPress={añadirAlumno}>
                    <Text style={[styles.tex11, styles.font]}>
                        {codigoEditando ? 'Añadir' : 'Actualizar'}
                    </Text>

                </TouchableOpacity>
            </View>
            <View style={styles.contS}>

                <View style={styles.contScroll}>
                    <Text style={[styles.tex3, styles.font]}>Nombres apellido</Text>
                    <Text style={[styles.tex2, styles.font]}>Código</Text>
                </View>

                <ScrollView style={styles.scroll}>
                    {listaAlumnos.map((alumno, index) => (
                        <View key={index}>
                            <TouchableOpacity
                                style={styles.card}
                                onPress={() =>
                                    setAlumnoSeleccionado(
                                        alumnoSeleccionado === alumno.codigo_alumno ? null : alumno.codigo_alumno
                                    )
                                }
                            >
                                <Text style={[styles.texCon, styles.font, styles.code1]}>
                                    {alumno.nombres_apellidos}
                                </Text>
                                <Text style={[styles.texCon, styles.font, styles.code]}>
                                    {alumno.codigo_alumno}
                                </Text>
                            </TouchableOpacity>

                            {alumnoSeleccionado === alumno.codigo_alumno && (
                                <View style={styles.botones}>
                                    <TouchableOpacity
                                        style={styles.botonesS}
                                        onPress={() => {
                                            setNombreAlumno(alumno.nombres_apellidos);
                                            setCodigoAlumno(alumno.codigo_alumno);
                                            setCodigoEditando(alumno.codigo_alumno);
                                            setCodigoOriginal(alumno.codigo_alumno);
                                        }}
                                    >
                                        <Text style={[styles.tex51, styles.font]}>Editar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.botonesSS}
                                        onPress={() => {
                                            setListaAlumnos(listaAlumnos.filter(a => a.codigo_alumno !== alumno.codigo_alumno));
                                            setAlumnoSeleccionado(null);
                                            setCodigoEditando(null);
                                            ;
                                        }}
                                    >
                                        <Text style={[styles.tex51, styles.font]}>Eliminar</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>


                <TouchableOpacity style={styles.btt}
                    onPress={async () => {
                        await guardarRegistro();
                        navigation.navigate("Registro");
                    }}
                >
                    <Text style={[styles.tex11, styles.font]}>Guardar Registro</Text>
                </TouchableOpacity>

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
    conFor: {
        bottom: 100,
        marginTop: 30,
    },
    font: {
        fontFamily: 'CenturyGothic-Bold',
        fontSize: 17,
    },
    font1: {
        fontFamily: 'CenturyGothic',
        fontSize: 15,
    },
    tex: {
        left: 10,
        marginTop: 10
        ,
    },
    texImp: {
        backgroundColor: '#99E7D9',
        borderRadius: 30,
        width: 350,
        height: 60,
        textAlign: 'center',
    },
    bt: {
        alignItems: 'center',
        width: 100,
        height: 50,
        borderRadius: 20,
        backgroundColor: '#34B0A6',
        left: 120,
        top: 10,
    },
    tex11: {
        top: 10,
    },
    contScroll: {
        width: Dimensions.get('window').width,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 5,

    },
    tex2: {
        top: 8,
        left: -90,
    },
    tex3: {
        top: 8,
        left: 20,
    },
    scroll: {
        height: 10,
    },

    card: {
        width: 330,
        flexDirection: 'row',
        marginRight: 15,
        padding: 10,
        borderRadius: 10,
        justifyContent: 'space-between',
    },

    botones: {
        marginTop: 5,
        flexDirection: 'row',
        justifyContent: 'space-around',
        right: 20,

    },
    tex51: {
        top: 5,
    },
    botonesS: {
        backgroundColor: '#00a458bf',
        width: 100,
        height: 40,
        alignItems: 'center',
        borderRadius: 10,
        left: 50,
    },
    botonesSS: {
        backgroundColor: '#fc0000bf',
        width: 100,
        height: 40,
        alignItems: 'center',
        borderRadius: 10,
    },
    contS: {
        backgroundColor: '#99E7D9',
        height: 300,
        borderRadius: 30,
        width: 350,
        bottom: 70,
    },
    code: {
        left: 5,
        backgroundColor: '#34B0A6',
        borderRadius: 20,
        width: 100,
        height: 50,
        textAlign: 'center',
        textAlignVertical: 'center',
        fontSize: 14,
    },
    code1: {
        backgroundColor: '#34B0A6',
        borderRadius: 20,
        width: 200,
        height: 50,
        textAlign: 'center',
        textAlignVertical: 'center',
        fontSize: 14,
    },
    btt: {
        alignItems: 'center',
        width: 150,
        height: 50,
        borderRadius: 20,
        backgroundColor: '#34B0A6',
        left: 110,
        top: 70,
    },


>>>>>>> aa7fdea9ccdd11c1ecf50ed782443ac1a0751b03
})