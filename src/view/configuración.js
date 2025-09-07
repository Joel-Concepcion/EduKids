import { StyleSheet, View, Text, Alert, TextInput, TouchableOpacity, Dimensions, Image } from "react-native";
import { useFonts } from 'expo-font';

export default function configuración({ navigation }) {

    const [fontsLoaded] = useFonts({
        CenturyGothic: require('../assets/fonts/3394-font.ttf'),
        CenturyGothicBold: require('../assets/fonts/Century-Gothic-Bold.ttf'),
        CenturyGothicBold1a: require('../assets/fonts/4410-font.ttf'),
    });

    if (!fontsLoaded) return null;

    return (
        <View style={styles.container}>
            <Text style={{ fontFamily: 'CenturyGothicBold1a', fontSize: 20, bottom: 230 }}>Perfil del Docente</Text>

            <View style={styles.pefDocente}>

                <Image source={require('../assets/perfilDD.jpg')} style={styles.imaP} />

                <View style={styles.psison}>
                    <Text style={styles.texD3}>Martha García Davila</Text>

                    <View style={styles.fila}>
                        <Text style={styles.texD1}>Id:</Text>
                        <Text style={styles.texD}>20601215</Text>
                    </View>

                    <View style={styles.fila}>
                        <Text style={styles.texD2}>Correo:</Text>
                        <Text style={styles.texD}>eduMartha@gmail.com</Text>
                    </View>

                    <TouchableOpacity style={styles.but}>
                        <Text style={{ fontFamily: 'CenturyGothicBold1a' }}> Editar información </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.configP}>

                <View style={styles.psison}>
                    <Text style={styles.texD4}>Configuración personal</Text>

                    <View style={styles.fila1}>
                        <Text style={styles.texD1}>Nivel educativo:</Text>
                        <Text style={styles.texD5}>Preescolar</Text>
                    </View>

                    <View style={styles.fila1}>
                        <Text style={styles.texD1}>Enfoque pedagógico:</Text>
                        <Text style={styles.texD6}>Montessori</Text>
                    </View>

                    <View style={styles.fila1}>
                        <Text style={styles.texD2}>Horas disponible:</Text>
                        <Text style={styles.texD7}>Lun-Vie 08:00-12:00</Text>
                    </View>

                    <TouchableOpacity style={styles.but1}>
                        <Text style={{ fontFamily: 'CenturyGothicBold1a' }}> Editar información </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity style={styles.but3}>
                <Text style={{ fontFamily: 'CenturyGothicBold1a', fontSize: 20}}> Información de la App </Text>
            </TouchableOpacity>

        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        alignItems: 'center',
        width: Dimensions.get('window').width,
        marginTop: 330,
    },
    pefDocente: {
        backgroundColor: '#99E7D9',
        width: 374,
        height: 200,
        borderRadius: 40,
        bottom: 190,
    },
    texD3: {
        marginBottom: 15,
        fontFamily: 'CenturyGothic',
        left: 140,
        top: 20,
    },
    texD4: {
        marginBottom: 15,
        fontFamily: 'CenturyGothicBold1a',
        left: 110,
        top: 100,
    },
    texD5: {
        marginBottom: 15,
        fontFamily: 'CenturyGothic',
        left: 5,
        top: 10,
    },
    texD6: {
        marginBottom: 15,
        fontFamily: 'CenturyGothic',
        left: 5,
        top: 10,
    },
    texD7: {
        marginBottom: 15,
        fontFamily: 'CenturyGothic',
        left: 5,
        top: 10,
    },
    texD: {
        left: 5,
        fontFamily: 'CenturyGothic',
    },
    texD1: {
        fontFamily: 'CenturyGothicBold',
    },
    texD2: {
        fontFamily: 'CenturyGothicBold',
    },
    fila: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        left: 140,
        top: 20,
    },
    but: {
        width: 150,
        height: 30,
        borderRadius: 10,
        backgroundColor: '#34B0A6',
        alignItems: 'center',
        justifyContent: 'center',
        left: 200,
        top: 40,
    },
    imaP: {
        width: 90,
        height: 90,
        borderRadius: 50,
        left: 20,
        top: 20,
    },
    psison: {
        bottom: 80,
        right: 10,
    },
    configP: {
        backgroundColor: '#99E7D9',
        width: 374,
        height: 230,
        borderRadius: 40,
        bottom: 160,
    },
    fila1: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        left: 50,
        top: 100,
    },
    but1: {
        width: 150,
        height: 30,
        borderRadius: 10,
        backgroundColor: '#34B0A6',
        alignItems: 'center',
        justifyContent: 'center',
        left: 200,
        top: 110,
    },
      but3: {
        width: 374,
        height: 80,
        borderRadius: 20,
        backgroundColor: '#99E7D9',
        alignItems: 'center',
        justifyContent: 'center',
        left: 1,
        bottom: 130,  
    },

})