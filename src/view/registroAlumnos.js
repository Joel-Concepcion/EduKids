import { StyleSheet, View, Text, Alert, TextInput, TouchableOpacity, Dimensions } from "react-native";
import { useFonts } from 'expo-font';
import { ScrollView } from "react-native-gesture-handler";

export default function registroAlumnos({ navigation }) {

    const [fontsLoaded] = useFonts({
        CenturyGothic: require('../assets/fonts/3394-font.ttf'),
        CenturyGothicBold: require('../assets/fonts/Century-Gothic-Bold.ttf'),
        CenturyGothicBold1a: require('../assets/fonts/4410-font.ttf'),
    });

    if (!fontsLoaded) return null;

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.but}>
                <Text style={{ fontFamily: 'CenturyGothicBold1a', color: '#FFFFFF', fontSize: 17 }}>Registrar grupo declase</Text>
            </TouchableOpacity>

            <ScrollView style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.ViewConten}>
                    <TouchableOpacity style={styles.input}>
                        <Text style={styles.textA}>Clase 2025</Text>
                    </TouchableOpacity>
                </View>
                 <View style={styles.ViewConten}>
                    <TouchableOpacity style={styles.input}>
                        <Text style={styles.textA}>Clase 2025</Text>
                    </TouchableOpacity>
                </View>
                 <View style={styles.ViewConten}>
                    <TouchableOpacity style={styles.input}>
                        <Text style={styles.textA}>Clase 2025</Text>
                    </TouchableOpacity>
                </View>
                 <View style={styles.ViewConten}>
                    <TouchableOpacity style={styles.input}>
                        <Text style={styles.textA}>Clase 2025</Text>
                    </TouchableOpacity>
                </View>
                 <View style={styles.ViewConten}>
                    <TouchableOpacity style={styles.input}>
                        <Text style={styles.textA}>Clase 2025</Text>
                    </TouchableOpacity>
                </View>
                 <View style={styles.ViewConten}>
                    <TouchableOpacity style={styles.input}>
                        <Text style={styles.textA}>Clase 2025</Text>
                    </TouchableOpacity>
                </View>
                 <View style={styles.ViewConten}>
                    <TouchableOpacity style={styles.input}>
                        <Text style={styles.textA}>Clase 2025</Text>
                    </TouchableOpacity>
                </View>
                 <View style={styles.ViewConten}>
                    <TouchableOpacity style={styles.input}>
                        <Text style={styles.textA}>Clase 2025</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

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
        marginTop: 10,
    },
    but: {
        borderRadius: 10,
        backgroundColor: '#34B0A6',
        width: 250,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        bottom: 250,
    },
    scrollView: {
        width: '100%',
        height: 600,
        position: 'absolute',
        bottom: 230,
        top: 200,
    },
    scrollContent: {
        paddingBottom: 25,
        alignItems: 'center',
    },
    ViewConten: {
        backgroundColor: '#99E7D9',
        width: 374,
        height: 175,
        borderRadius: 20,
        left: 1,
        padding: 20,
        marginTop: 18,
        alignItems: 'center',
    },
    input: {
        width: 374,
        height: 175,
        alignItems: 'center',
        backgroundColor: '#34B0A6',
        borderRadius: 20,
        marginTop: -20,
    },
    textA: {
        color: '#FFFFFF',
        fontSize: 20,
        fontFamily: 'CenturyGothicBold1a',
        top: 80,
    },
})