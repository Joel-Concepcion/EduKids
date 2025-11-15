import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Font from 'expo-font';
import { BarChart } from 'react-native-chart-kit';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
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

export default function VistaAlumnos() {
  const navigation = useNavigation();
  const route = useRoute();
  //const { idClase } = route.params || {};

  //const { idClase, VistaAlumnos } = route.params || {};
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [alumnosInscritos, setAlumnosInscritos] = useState([]);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const [datosGrafico, setDatosGrafico] = useState(null);
  const [cargando, setCargando] = useState(false);
  const { idClase, clase } = route.params || {};


  /////////

  const handleSeleccionAlumno = (alumno) => {
    console.log('👤 Alumno seleccionado:', alumno.nombres_apellidos);

    // Establecer el alumno seleccionado
    setAlumnoSeleccionado(alumno);

    // Cargar el progreso del alumno
    cargarProgresoAlumno(alumno);

    // Mostrar el gráfico
    setShowChart(true);
  };

  useEffect(() => {
    fetchFonts().then(() => setFontsLoaded(true));
  }, []);

  useEffect(() => {
    const cargarAlumnos = async () => {
      try {
        if (!idClase) return;

        const consulta = query(
          collection(db, 'alumnos'),
          where('clases', 'array-contains', idClase)
        );
        const resultado = await getDocs(consulta);

        const lista = resultado.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setAlumnosInscritos(lista);
      } catch (error) {
        console.error('Error al cargar alumnos:', error);
      }
    };

    cargarAlumnos();
  }, [idClase]);

  const cargarProgresoAlumno = async (alumno) => {
    if (!alumno || (!alumno.uid && !alumno.id)) {
      console.log('Alumno o ID/UID no válido:', alumno);
      return;
    }

    try {
      setCargando(true);

      //USAR uid PRIMERO, si no existe usar id
      const idParaBuscar = alumno.uid || String(alumno.id);
      console.log('Cargando progreso para:', idParaBuscar);
      console.log('Nombre del alumno:', alumno.nombres_apellidos);
      console.log('UID disponible:', alumno.uid);
      console.log('ID disponible:', alumno.id);

      if (!idParaBuscar || idParaBuscar === 'undefined' || idParaBuscar === 'null') {
        console.log('ID/UID de alumno no válido');
        setDatosGrafico(null);
        return;
      }

      const docRef = doc(db, 'alumnos', idParaBuscar);
      console.log('Buscando documento en alumnos/', idParaBuscar);

      const alumnoDoc = await getDoc(docRef);
      console.log('Documento existe?:', alumnoDoc.exists());

      if (alumnoDoc.exists()) {
        const datosCompletos = alumnoDoc.data();
        const progreso = datosCompletos.progreso || {};
        console.log('Progreso encontrado:', progreso);

        // NUEVO: Sumar puntos por categoría
        const categoriasConPuntos = [];
        let totalPuntosGeneral = 0;

        if (progreso && typeof progreso === 'object') {
          const nombresCategorias = Object.keys(progreso);
          console.log('Categorías encontradas:', nombresCategorias);

          nombresCategorias.forEach(categoria => {
            const actividades = progreso[categoria];
            console.log(`Procesando categoría "${categoria}":`, actividades);

            if (actividades && typeof actividades === 'object') {
              let totalPuntosCategoria = 0;
              let juegosEnCategoria = 0;

              const nombresJuegos = Object.keys(actividades);
              console.log(`Juegos en ${categoria}:`, nombresJuegos);

              nombresJuegos.forEach(nombreJuego => {
                const juego = actividades[nombreJuego];
                console.log(`Procesando juego "${nombreJuego}":`, juego);

                if (juego && typeof juego === 'object' && juego.puntos !== undefined) {
                  let puntos = 0;

                  // Manejar diferentes formatos de puntos
                  if (typeof juego.puntos === 'number') {
                    puntos = juego.puntos;
                  } else if (typeof juego.puntos === 'string') {
                    puntos = parseInt(juego.puntos) || 0;
                  } else {
                    puntos = Number(juego.puntos) || 0;
                  }

                  if (puntos > 0) {
                    totalPuntosCategoria += puntos;
                    juegosEnCategoria++;
                    console.log(`${categoria} - ${nombreJuego}: ${puntos} puntos`);
                  }
                }
              });

              // Solo agregar categorías que tengan puntos
              if (totalPuntosCategoria > 0) {
                categoriasConPuntos.push({
                  nombre: categoria,
                  puntos: totalPuntosCategoria,
                  juegos: juegosEnCategoria
                });
                totalPuntosGeneral += totalPuntosCategoria;

                console.log(`${categoria}: ${totalPuntosCategoria} puntos totales (${juegosEnCategoria} juegos)`);
              }
            }
          });
        }

        console.log('Categorías con puntos:', categoriasConPuntos.length);
        console.log('Total general de puntos:', totalPuntosGeneral);
        console.log('Datos por categoría:', categoriasConPuntos);

        if (categoriasConPuntos.length > 0) {
          setDatosGrafico({
            labels: categoriasConPuntos.map(c => c.nombre),
            datasets: [{
              data: categoriasConPuntos.map(c => c.puntos),
            }],
            categorias: categoriasConPuntos,
            totalGeneral: totalPuntosGeneral
          });
          console.log('Gráfico configurado con totales por categoría');
        } else {
          console.log('No hay categorías con puntos');
          setDatosGrafico(null);
        }
      } else {
        console.log('No existe documento de alumno con este ID/UID');
        console.log('Se buscó en: alumnos/' + idParaBuscar);
        setDatosGrafico(null);
      }
    } catch (error) {
      console.error('Error al cargar progreso:', error);
      setDatosGrafico(null);
    } finally {
      setCargando(false);
    }
  };

  const chartConfig = {
    backgroundColor: '#eafaf1',
    backgroundGradientFrom: '#99E7D9',
    backgroundGradientTo: '#34B0A6',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    barPercentage: 0.6,
    propsForLabels: {
      fontSize: 12,
      fontFamily: 'CenturyGothic-Bold',
      textAlign: 'center',
    },
    fillShadowGradient: '#34B0A6',
    fillShadowGradientOpacity: 1,
  };

  const navegarAlJuego = (alumno) => {
    console.log('🎮 Navegando al juego con alumno:', alumno.id);
    navigation.navigate('Juego1Suma', {
      alumnoId: alumno.id
    });
  };

  if (!fontsLoaded || !VistaAlumnos);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image style={styles.imM} source={{ uri: clase.profileImage }} />
        <Text style={[styles.tex, styles.font]}>
          {clase.docenteNombre || 'Sin nombre'}
        </Text>
      </View>

      <Text style={[styles.font, styles.titulo]}>Alumnos</Text>

      <ScrollView style={styles.scrollView}>
        {alumnosInscritos.length === 0 ? (
          <Text style={[styles.font, styles.sinAlumnos]}>
            No hay alumnos registrados en esta clase.
          </Text>
        ) : (
          alumnosInscritos.map((alumno) => (
            <View key={alumno.id} style={styles.alumnoContainer}>
              <TouchableOpacity
                style={[
                  styles.imaj,
                  alumnoSeleccionado?.id === alumno.id && styles.alumnoSeleccionado
                ]}
                onPress={() => handleSeleccionAlumno(alumno)}
              >
                <View style={styles.contenI}>
                  <Image
                    style={styles.ima}
                    source={avatarMap[alumno.avatar] || avatarMap['Ellipse 3.png']}
                  />
                  <Text style={[styles.font1, styles.txS]}>{alumno.nombres_apellidos}</Text>
                </View>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {showChart && alumnoSeleccionado && (
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={[styles.font, styles.chartTitle]}>
              Progreso Total por Categoría
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowChart(false);
                setAlumnoSeleccionado(null);
                setDatosGrafico(null);
              }}
            >
              <Text style={styles.closeButtonText}>❌</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.font, styles.alumnoNombre]}>
            {alumnoSeleccionado.nombres_apellidos}
          </Text>

          {cargando ? (
            <View style={styles.cargandoContainer}>
              <Text style={[styles.font, styles.cargandoText]}>Cargando progreso...</Text>
            </View>
          ) : datosGrafico ? (
            <View>
              {/* Mostrar total general */}
              <View style={styles.totalContainer}>
                <Text style={[styles.font, styles.totalText]}>
                  Puntos Totales: <Text style={styles.totalNumero}>{datosGrafico.totalGeneral}</Text>
                </Text>
              </View>

              {/* Gráfico de barras */}
              <BarChart
                data={datosGrafico}
                width={screenWidth - 60}
                height={220}
                chartConfig={chartConfig}
                verticalLabelRotation={0}
                fromZero={true}
                showValuesOnTopOfBars={true}
                style={styles.chart}
                yAxisLabel=""
                yAxisSuffix=" pts"
              />

              {/* Detalles por categoría */}
              <View style={styles.detallesContainer}>
                <Text style={[styles.font, styles.detallesTitulo]}>Desglose por Categoría:</Text>
                {datosGrafico.categorias.map((categoria, index) => (
                  <View key={index} style={styles.categoriaItem}>
                    <Text style={[styles.font, styles.categoriaNombre]}>
                      {categoria.nombre}
                    </Text>
                    <View style={styles.categoriaDetalles}>
                      <Text style={[styles.font, styles.categoriaPuntos]}>
                        {categoria.puntos} pts
                      </Text>
                      <Text style={[styles.font, styles.categoriaJuegos]}>
                        ({categoria.juegos} juego{categoria.juegos !== 1 ? 's' : ''})
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.sinDatosContainer}>
              <Text style={[styles.font, styles.sinDatosText]}>
                No hay progreso registrado
              </Text>
              <Text style={[styles.font, styles.sinDatosSubText]}>
                El alumno aún no ha completado actividades
              </Text>
            </View>
          )}
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
    fontSize: 17,
    top: 20,
    marginBottom: 5,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  alumnoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  imaj: {
    backgroundColor: '#34B0A6',
    marginTop: 5,
    height: 70,
    borderRadius: 40,
    flex: 1,
    marginRight: 10,
  },
  alumnoSeleccionado: {
    backgroundColor: '#2a8e86',
    borderWidth: 2,
    borderColor: '#1a5c57',
  },
  ima: {
    width: 60,
    height: 60,
    left: 10,
    top: 5,
  },
  imM: {
    left: 30,
    width: 80,
    height: 80,
    borderRadius: 50,
    marginTop: 20,
  },
  contenI: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    borderRadius: 30,
    alignItems: 'center',
  },
  txS: {
    top: "40%",
    left: 90,
    color: 'white',
    fontSize: 16,
    position: 'absolute',
  },
  idText: {
    top: 35,
    left: 70,
    color: 'white',
    fontSize: 12,
    position: 'absolute',
  },
  font1: {
    fontFamily: 'CenturyGothic-Bold',
  },
  scrollView: {
    width: screenWidth - 20,
    right: 12,
  },
  sinAlumnos: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  botonJuego: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonJuegoTexto: {
    color: 'white',
    fontFamily: 'CenturyGothic-Bold',
    fontSize: 14,
  },
  chartContainer: {
    position: 'absolute',
    bottom: 80,
    left: 15,
    right: 15,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
    marginTop: 10,
  },
  cargandoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  cargandoText: {
    color: '#34B0A6',
    fontSize: 16,
  },
  sinDatosContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  sinDatosText: {
    color: '#6c757d',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  sinDatosSubText: {
    color: '#6c757d',
    fontSize: 12,
    textAlign: 'center',
  },
  alumnoNombre: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  totalContainer: {
    backgroundColor: '#eafaf1',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 16,
    color: '#333',
  },
  totalNumero: {
    fontWeight: 'bold',
    color: '#34B0A6',
    fontSize: 18,
  },
  detallesContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  detallesTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  categoriaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoriaNombre: {
    fontSize: 12,
    color: '#555',
    flex: 1,
  },
  categoriaDetalles: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoriaPuntos: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#34B0A6',
    marginRight: 5,
  },
  categoriaJuegos: {
    fontSize: 10,
    color: '#888',
  },
  closeButton: {
    left: '95%',
    bottom: '50%',
  },
});