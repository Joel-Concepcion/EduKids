import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Font from 'expo-font';
import { BarChart } from 'react-native-chart-kit';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../model/db';

const screenWidth = Dimensions.get('window').width;

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

export default function vistaAlumnos() {
  const navigation = useNavigation();
  const route = useRoute();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [alumnosInscritos, setAlumnosInscritos] = useState([]);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [showChart, setShowChart] = useState(false);

  // ✅ Usamos el código de clase como identificador
  const codigoClase = route.params?.codigoClase || 'SF78X8';

  useEffect(() => {
    fetchFonts().then(() => setFontsLoaded(true));
  }, []);

  useEffect(() => {
    const cargarAlumnos = async () => {
      try {
        const consulta = query(
          collection(db, 'alumnos'),
          where('clases', 'array-contains', codigoClase)
        );
        const resultado = await getDocs(consulta);

        const lista = resultado.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setAlumnosInscritos(lista);
        console.log('Alumnos encontrados:', lista.length);
      } catch (error) {
        console.error('Error al cargar alumnos:', error);
      }
    };

    cargarAlumnos();
  }, [codigoClase]);

  const chartConfig = {
    backgroundColor: '#eafaf1',
    backgroundGradientFrom: '#eafaf1',
    backgroundGradientTo: '#eafaf1',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(52, 176, 166, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  const obtenerDatosGrafico = (alumno) => {
    const progreso = alumno.progreso || {};
    const categorias = ['Matemática', 'Literatura', 'Formas', 'Sonidos'];
    const data = categorias.map(cat => progreso[cat]?.juego1Suma?.puntos || 0);

    return {
      labels: categorias,
      datasets: [{ data }],
    };
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image style={styles.imM} source={require("../../assets/maestra.jpg")} />
        <Text style={[styles.tex, styles.font]}>Profe: {"Joel Concepción"}</Text>
      </View>

      <Text style={[styles.font]}>Alumnos</Text>

      <ScrollView style={{ width: screenWidth - 20, right: 12 }}>
        {alumnosInscritos.length === 0 ? (
          <Text style={[styles.font, { marginTop: 20 }]}>No hay alumnos registrados en esta clase.</Text>
        ) : (
          alumnosInscritos.map((alumno, index) => (
            <TouchableOpacity
              key={index}
              style={styles.imaj}
              onPress={() => {
                setAlumnoSeleccionado(alumno);
                setShowChart(true);
              }}
            >
              <View style={styles.contenI}>
                <Image
                  style={styles.ima}
                  source={avatarMap[alumno.avatar] || avatarMap['Ellipse 3.png']}
                />
                <Text style={[styles.font1, styles.txS]}>{alumno.nombres_apellidos}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {showChart && alumnoSeleccionado && (
        <View style={{ bottom: 180, alignItems: 'center', position: 'absolute', left: 15 }}>
          <BarChart
            data={obtenerDatosGrafico(alumnoSeleccionado)}
            width={screenWidth - 30}
            height={330}
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            style={{ borderRadius: 16 }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  header: {
    marginTop: 30,
    backgroundColor: "#99E7D9",
    width: Dimensions.get('window').width,
    right: 20,
    alignItems: 'center',
    height: 100,
    bottom: 20,
    zIndex: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  font: {
    fontFamily: 'CenturyGothic',
  },
  tex: {
    left: 50,
    fontSize: 20,
    top: 20,
    marginBottom: 5,
  },
  imaj: {
    backgroundColor: '#34B0A6',
    marginTop: 5,
    height: 57,
    borderRadius: 40,
    marginBottom: 10,
  },
  ima: {
    width: 60,
    height: 60,
    left: 10,
  },
  imM: {
    left: 30,
    width: 80,
    height: 80,
    borderRadius: 50,
    marginTop: 20,
  },
  contenI: {
    backgroundColor: '#34B0A6',
    flexDirection: 'row',
    borderRadius: 30,
  },
  txS: {
    top: 20,
    left: 70,
  },
  font1: {
    fontFamily: 'CenturyGothic-Bold',
  },
});
