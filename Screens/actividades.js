import { StyleSheet, View, Text, Button, Image, TextInput, TouchableOpacity } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";

export default function actividades() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>

            <View style={styles.View2}>
                <TouchableOpacity style={styles.TouchableOpacity}>
                    <Image source={require('../assets/Image/image.png')} style={styles.im} />
                    <Text style={styles.tx1}>Colores a juego</Text>
                    <Text style={styles.tx2}>Arrastre los colores</Text>
                    <Text style={styles.tx2}>para que coincidan.</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.TouchableOpacity}>
                    <Image source={require('../assets/Image/image (1).png')} style={styles.im} />
                    <Text style={styles.tx1}>Clasificación de formas</Text>
                    <Text style={styles.tx2}>Coloque las formas en</Text>
                    <Text style={styles.tx2}>las ranuras correctas.</Text>
                </TouchableOpacity>
            </View>

        </View>


    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tx1: {
        fontSize: 11,
        fontWeight: "bold",
        marginLeft: 1,
        color: "#1C1B1F",
        marginRight: -10,
    },
    tx2: {
        fontSize: 11,
        color: "#A09CAB",
    },
    TouchableOpacity: {
        fontWeight: "bold",
    },
    im: {
        width: 171,
        height: 114,
        borderRadius: 20,
    },
      View2: {
        marginTop: 10,
        marginLeft: 5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },

});