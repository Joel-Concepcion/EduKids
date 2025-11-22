// 🔧 Importaciones
import React, { useState, useEffect } from "react";
import {
    StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, Modal,
    TextInput, Alert, ActivityIndicator
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Font from 'expo-font';
import * as ImagePicker from 'expo-image-picker';
import { getAuth, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import appFirebase from "../model/db";

const auth = getAuth(appFirebase);
const db = getFirestore(appFirebase);

//Carga de fuentes
const fetchFonts = () => Font.loadAsync({
    'CenturyGothic': require('../assets/font/3394-font.ttf'),
    'CenturyGothic-Bold': require('../assets/font/4410-font.ttf'),
});

export default function Ajustes() {
    const navigation = useNavigation();
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [userData, setUserData] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editField, setEditField] = useState('');
    const [editValue, setEditValue] = useState('');
    const [profileImage, setProfileImage] = useState(null);

    // Cargar fuentes y datos del usuario
    useEffect(() => {
        fetchFonts().then(() => setFontsLoaded(true));
        loadUserData();
    }, []);

    const loadUserData = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                const userRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userRef);

                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setUserData(data);
                    setProfileImage(data.profileImage || "https://randomuser.me/api/portraits/women/44.jpg");
                } else {
                    const defaultData = {
                        nombre: user.displayName || "Usuario",
                        email: user.email,
                        id: user.uid.substring(0, 8),
                        nivelEducativo: "Preescolar",
                        enfoquePedagogico: "Montessori",
                        horario: "Lun-Vie\n08:00-12:00",
                        profileImage: "https://randomuser.me/api/portraits/women/44.jpg"
                    };
                    await setDoc(userRef, defaultData);
                    setUserData(defaultData);
                    setProfileImage(defaultData.profileImage);
                }
            } catch (error) {
                console.error("Error cargando datos:", error);
            }
        }
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso necesario', 'Se necesita permiso para acceder a la galería.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled && result.assets?.[0]?.base64) {
                const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
                setProfileImage(base64Image);

                const user = auth.currentUser;
                if (user) {
                    const userRef = doc(db, "users", user.uid);
                    await setDoc(userRef, { profileImage: base64Image }, { merge: true });
                    Alert.alert("Éxito", "Foto de perfil actualizada correctamente.");
                }
            }
        } catch (error) {
            console.error("Error seleccionando imagen:", error);
            Alert.alert("Error", "No se pudo actualizar la foto de perfil.");
        }
    };

    const openEditModal = (field, value) => {
        setEditField(field);
        setEditValue(value);
        setEditModalVisible(true);
    };

    const saveEdit = async () => {
        if (!userData || !editValue.trim()) {
            Alert.alert("Campo vacío", "Por favor, ingresa un valor válido.");
            return;
        }

        try {
            const user = auth.currentUser;
            const userRef = doc(db, "users", user.uid);
            const updates = { [editField]: editValue };

            await setDoc(userRef, updates, { merge: true });
            setUserData({ ...userData, ...updates });
            setEditModalVisible(false);
            Alert.alert("Éxito", "Información actualizada correctamente.");
        } catch (error) {
            console.error("Error actualizando datos:", error);
            Alert.alert("Error", "No se pudo actualizar la información.");
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigation.reset({
                index: 0,
                routes: [{ name: 'login' }],
            });
            console.log("Ejecutando cierre de sesión...");
        } catch (error) {
            console.error("Error cerrando sesión:", error);
            Alert.alert("Error", "No se pudo cerrar sesión.");
        }
    };

    const confirmLogout = () => {
        Alert.alert(
            "Cerrar Sesión",
            "¿Estás seguro de que quieres cerrar sesión?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Cerrar Sesión", onPress: () => handleLogout(), style: "destructive" }
            ]
        );
    };

    if (!fontsLoaded || !userData) {
        return <ActivityIndicator size="large" style={{ marginTop: 100 }} />;
    }
    return (
        <ScrollView style={styles.contenedor}>
            <Text style={styles.titulo}>Perfil del Docente</Text>

            {/* Tarjeta de Perfil */}
            <View style={styles.tarjeta}>
                <View style={styles.fila}>
                    <TouchableOpacity onPress={pickImage}>
                        <Image
                            source={{ uri: profileImage }}
                            style={styles.avatar}
                        />
                        <Text style={styles.cambiarFotoTexto}>Cambiar foto</Text>
                    </TouchableOpacity>
                    <View style={styles.info}>
                        <Text style={[styles.nombre, styles.fuenteNegrita]}>
                            {userData.nombre}
                        </Text>
                        <Text style={[styles.texto, styles.fuenteRegular]}>
                            Id: {userData.id}
                        </Text>
                        <Text style={[styles.texto, styles.fuenteRegular]}>
                            Correo: {userData.email}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.boton}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={[styles.textoBoton, styles.fuenteRegular]}>
                        Editar información
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Tarjeta de Configuración Personal */}
            <View style={styles.tarjeta}>
                <Text style={[styles.tituloTarjeta, styles.fuenteRegular]}>
                    Configuración personal
                </Text>
                <View style={styles.configItem}>
                    <Text style={[styles.texto, styles.fuenteRegular]}>
                        Nivel educativo: {userData.nivelEducativo}
                    </Text>
                    <TouchableOpacity
                        onPress={() => openEditModal('nivelEducativo', userData.nivelEducativo)}
                    >
                        <Text style={styles.editarTexto}>Editar</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.configItem}>
                    <Text style={[styles.texto, styles.fuenteRegular]}>
                        Enfoque pedagógico: {userData.enfoquePedagogico}
                    </Text>
                    <TouchableOpacity
                        onPress={() => openEditModal('enfoquePedagogico', userData.enfoquePedagogico)}
                    >
                        <Text style={styles.editarTexto}>Editar</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.configItem}>
                    <Text style={[styles.texto, styles.fuenteRegular]}>
                        Horario disponible: {userData.horario}
                    </Text>
                    <TouchableOpacity
                        onPress={() => openEditModal('horario', userData.horario)}
                    >
                        <Text style={styles.editarTexto}>Editar</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Información de la App */}
            <TouchableOpacity style={styles.tarjetaInfo}>
                <Text style={styles.tituloTarjeta}>Información de la App</Text>
            </TouchableOpacity>

            {/* Cerrar Sesión */}
            <TouchableOpacity style={styles.cerrarSesionBoton} onPress={confirmLogout}>
                <Text style={styles.cerrarSesionTexto}>Cerrar Sesión</Text>
            </TouchableOpacity>

            {/* Modal para Editar Información Personal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitulo}>Editar Información Personal</Text>

                        <TouchableOpacity
                            style={styles.modalOpcion}
                            onPress={() => {
                                setModalVisible(false);
                                openEditModal('nivelEducativo', userData.nivelEducativo);
                            }}
                        >
                            <Text style={styles.modalTexto}>Nivel Educativo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalOpcion}
                            onPress={() => {
                                setModalVisible(false);
                                openEditModal('enfoquePedagogico', userData.enfoquePedagogico);
                            }}
                        >
                            <Text style={styles.modalTexto}>Enfoque Pedagógico</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalOpcion}
                            onPress={() => {
                                setModalVisible(false);
                                openEditModal('horario', userData.horario);
                            }}
                        >
                            <Text style={styles.modalTexto}>Horario Disponible</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cerrarModalBoton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.cerrarModalTexto}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal para Editar Campo Específico */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={editModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitulo}>
                            Editar {editField === 'nivelEducativo' ? 'Nivel Educativo' :
                                editField === 'enfoquePedagogico' ? 'Enfoque Pedagógico' :
                                    'Horario Disponible'}
                        </Text>

                        <TextInput
                            style={styles.input}
                            value={editValue}
                            onChangeText={setEditValue}
                            multiline={editField === 'horario'}
                            numberOfLines={editField === 'horario' ? 3 : 1}
                            placeholder={`Ingrese ${editField === 'nivelEducativo' ? 'el nivel educativo' :
                                editField === 'enfoquePedagogico' ? 'el enfoque pedagógico' :
                                    'el horario disponible'}`}
                        />

                        <View style={styles.modalBotones}>
                            <TouchableOpacity
                                style={styles.cancelarBoton}
                                onPress={() => setEditModalVisible(false)}
                            >
                                <Text style={styles.cancelarTexto}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.guardarBoton}
                                onPress={saveEdit}
                            >
                                <Text style={styles.guardarTexto}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        padding: 16,
        backgroundColor: "#fff",
    },
    titulo: {
        marginTop: 90,
        fontSize: 22,
        fontWeight: "400",
        marginBottom: 12,
        textAlign: "center",
    },
    tarjeta: {
        backgroundColor: "#99E7D9",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        width: "100%",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tarjetaInfo: {
        backgroundColor: "#99E7D9",
        borderRadius: 16,
        padding: 12,
        width: "100%",
        marginBottom: 16,
        alignItems: "center",
    },
    fila: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 12,
    },
    cambiarFotoTexto: {
        fontSize: 12,
        color: "#34B0A6",
        textAlign: "center",
        marginTop: 4,
        fontFamily: "CenturyGothic",
    },
    info: {
        flex: 1,
    },
    nombre: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 2,
    },
    texto: {
        fontSize: 14,
        marginBottom: 2,
    },
    tituloTarjeta: {
        fontSize: 18,
        fontWeight: "400",
        marginBottom: 8,
        textAlign: "left",
        fontFamily: 'CenturyGothic-Bold',
    },
    boton: {
        backgroundColor: "#34B0A6",
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: "center",
        marginTop: 8,
        alignSelf: "center",
        width: 200,
    },
    textoBoton: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "400",
    },
    configItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
        paddingVertical: 4,
    },
    editarTexto: {
        color: "#34B0A6",
        fontSize: 14,
        fontFamily: "CenturyGothic-Bold",
    },
    cerrarSesionBoton: {
        backgroundColor: "#FF6B6B",
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 20,
        marginBottom: 40,
    },
    cerrarSesionTexto: {
        color: "#fff",
        fontSize: 16,
        fontFamily: "CenturyGothic-Bold",
    },
    // Estilos para modales
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 20,
        width: "80%",
        maxWidth: 400,
    },
    modalTitulo: {
        fontSize: 18,
        fontFamily: "CenturyGothic-Bold",
        marginBottom: 16,
        textAlign: "center",
    },
    modalOpcion: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
    },
    modalTexto: {
        fontSize: 16,
        fontFamily: "CenturyGothic",
        textAlign: "center",
    },
    cerrarModalBoton: {
        marginTop: 16,
        paddingVertical: 12,
        backgroundColor: "#F0F0F0",
        borderRadius: 8,
        alignItems: "center",
    },
    cerrarModalTexto: {
        fontSize: 16,
        fontFamily: "CenturyGothic",
        color: "#666",
    },
    input: {
        borderWidth: 1,
        borderColor: "#DDD",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontFamily: "CenturyGothic",
        fontSize: 16,
    },
    modalBotones: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    cancelarBoton: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: "#F0F0F0",
        borderRadius: 8,
        alignItems: "center",
        marginRight: 8,
    },
    cancelarTexto: {
        fontSize: 16,
        fontFamily: "CenturyGothic",
        color: "#666",
    },
    guardarBoton: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: "#34B0A6",
        borderRadius: 8,
        alignItems: "center",
        marginLeft: 8,
    },
    guardarTexto: {
        fontSize: 16,
        fontFamily: "CenturyGothic",
        color: "#FFF",
    },
    fuenteNegrita: {
        fontFamily: "CenturyGothic-Bold",
    },
    fuenteRegular: {
        fontFamily: "CenturyGothic",
    },
});