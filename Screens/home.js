import { StyleSheet, View, Text, Button, Image, TextInput, TouchableOpacity, Dimensions } from "react-native";
import React, { useRef, useEffect } from 'react';
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";


const { width } = Dimensions.get('window');

const carouselImages= [
    require('../assets/carrusel/imagen1.jpg'),
    require('../assets/carrusel/imagen2.jpg'),
    require('../assets/carrusel/imagen3.jpg'),
];

// { source: require('../assets/carrusel/imagen1.jpg'), id: 1 },

export default function home() {
    const navigation = useNavigation();

    //Esto es del carrusel de imagenes 
    const scrollRef = useRef(null);
    let currentIndex = 0;

    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollRef.current) {
                currentIndex = (currentIndex + 1) % carouselImages.length;
                scrollRef.current.scrollTo({ x: currentIndex * width, animated: true });
            }
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (

        <View style={StyleSheet.container}>


            <Image source={require('../assets/Image/rosaF1.png')} style={styles.r1} />
            <Image source={require('../assets/Image/rosaf2.png')} style={styles.r2} />

           
         

            <View style={styles.carru}>
                   <Text style={styles.texl}>Lomas jugado</Text>
            
                <ScrollView
                    style={styles.carScro}
                    ref={scrollRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                >
                    {carouselImages.map((image, index) => (
                        <Image key={index} source={image} style={styles.image} />
                    ))}
                </ScrollView>
                    
                <Image source={require('../assets/Image/carrusel.png')} style={styles.car} />
            </View>

            <View style={styles.ImLog}>

                <TouchableOpacity>
                    <Image source={require('../assets/Image/Overlay.png')} style={styles.item} />
                    <Text style={styles.tx1}>Arrastar</Text>
                    <Text style={styles.txt1}>y</Text>
                    <Text style={styles.txtt1}>soltar</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Image source={require('../assets/Image/Overlay (1).png')} style={styles.item} />
                    <Text style={styles.tx1}>Audio</Text>
                    <Text></Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Image source={require('../assets/Image/Overlay (2).png')} style={styles.item} />
                    <Text style={styles.tx1}>Bloques</Text>
                    <Text style={styles.tx1}>Montessori</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Image source={require('../assets/Image/Overlay (3).png')} style={styles.item} />
                    <Text style={styles.tx1}>Objetos</Text>
                    <Text></Text>
                </TouchableOpacity>
            </View>

            <View style={styles.View}>
                <Text style={styles.texto1}>Seccion de juego</Text>

                <View style={styles.View1}>
                    <View style={styles.View3}>
                        <TouchableOpacity style={styles.TouchableOpacity}>
                            <Image source={require('../assets/Image/image11.png')} style={styles.im} />
                            <Text style={styles.tx1}>Arrastrar y soltar</Text>
                            <Text style={styles.tx2}>Juega moviendo</Text>
                            <Text style={styles.tx2}>los objetos con precisión.</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.TouchableOpacity}>
                            <Image source={require('../assets/Image/image 1.png')} style={styles.im} />
                            <Text style={styles.tx1}>Audio</Text>
                            <Text style={styles.tx2}>Reproduce los efectos y </Text>
                            <Text style={styles.tx2}>sumérgete en la experiencia.</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.View4}>
                        <TouchableOpacity style={styles.TouchableOpacity}>
                            <Image source={require('../assets/Image/image 2.png')} style={styles.im} />
                            <Text style={styles.tx1}>Bloques Montessori</Text>
                            <Text style={styles.tx2}>Usa los bloques Montessori</Text>
                            <Text style={styles.tx2}>para aprender sobre tamaño</Text>
                            <Text style={styles.tx2}>y equilibrio.</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.TouchableOpacity}>
                            <Image source={require('../assets/Image/image 3.png')} style={styles.im} />
                            <Text style={styles.tx1}>Objetos sensoriales</Text>
                            <Text style={styles.tx2}>Descubre nuevas </Text>
                            <Text style={styles.tx2}>sensaciones a través del</Text>
                            <Text style={styles.tx2}>juego sensorial.</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

        </View>
    )
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '30',
    },
    texl:{
        fontSize: 25,
        marginTop: 10,
    },
    r1: {
        position: 'absolute',
        marginTop: 10,
        opacity: 0.4,
    },
    r2: {
        marginLeft: 260,
        marginTop: 90,
        position: "absolute",
        opacity: 0.4,
    },
    carru: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        marginBottom: 5,
        
    },
    car: {
        width: 384,
        height: 98,
        marginLeft: 3,

    },
    ImLog: {
        marginTop: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        marginTop: 5,
    },
    item: {
        resizeMode: 'contain',
        width: 55,
        height: 55,
        marginBottom: 5,
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
    txt1: {
        fontSize: 11,
        fontWeight: "bold",
        marginLeft: 25,
    },
    txtt1: {
        fontSize: 11,
        fontWeight: "bold",
        marginLeft: 11,
    },
    texto1: {
        marginTop: 10,
        fontSize: 20,
        fontWeight: "bold",
        marginLeft: 26,
    },
    View: {
        marginTop: 5,
    },
    View1: {
        flexGrow: 1,
        marginTop: 10,
        marginRight: 5,
    },
    View3: {
        marginTop: 10,
        marginLeft: 5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    View4: {
        marginTop: 10,
        marginLeft: 5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    im1: {
        width: 140,
        height: 114,
        borderRadius: 20,
    },
    im: {
        width: 171,
        height: 114,
        borderRadius: 20,
    },
    TouchableOpacity: {
        fontWeight: "bold",
    },
    image: {
        widthÑ: width * 0.7,
        height: 100,
        resizeMode: 'repeat',
    },
    carScro: {
        position: 'absolute',
        top: 51,
        left: 100,
        borderRadius: 30,
        right: 0,
        zIndex: 1,
        width: width * 0.7,
        height: 80,
    }


})

