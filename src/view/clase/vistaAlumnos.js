import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Font from 'expo-font';
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

const DEFAULT_MAX_POINTS_PER_ACTIVITY = 10;

export default function VistaAlumnos() {
  const navigation = useNavigation();
  const route = useRoute();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [alumnosInscritos, setAlumnosInscritos] = useState([]);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const [datosActividades, setDatosActividades] = useState(null);
  const [cargando, setCargando] = useState(false);

  const { idClase, clase } = route.params || {};

  useEffect(() => {
    fetchFonts().then(() => setFontsLoaded(true));
  }, []);

  useEffect(() => {
    const cargarAlumnos = async () => {
      try {
        const claseIdReal = idClase || clase?.id;
        if (!claseIdReal) return;

        const consulta = query(
          collection(db, 'alumnos'),
          where('clases', 'array-contains', claseIdReal)
        );
        const resultado = await getDocs(consulta);

        const lista = resultado.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));

        setAlumnosInscritos(lista);
      } catch (error) {
        console.error('Error al cargar alumnos:', error);
      }
    };

    cargarAlumnos();
  }, [idClase, clase]);

  const construirListaActividades = (alumnoData) => {
    const claseIdActual = idClase || clase?.id || 'sin-clase';
    const progresoPorClase = alumnoData.progresoPorClase || {};
    const progresoClase = progresoPorClase[claseIdActual];

    if (progresoClase && progresoClase.actividades && typeof progresoClase.actividades === 'object') {
      return Object.entries(progresoClase.actividades).map(([actividadId, actividadData]) => {
        const puntos = (() => {
          if (Array.isArray(actividadData.intentos) && actividadData.intentos.length > 0) {
            const ultimo = actividadData.intentos[actividadData.intentos.length - 1];
            return Number(ultimo.puntos || actividadData.puntos || 0);
          }
          return Number(actividadData.puntos || 0);
        })();
        const errores = (() => {
          if (Array.isArray(actividadData.intentos) && actividadData.intentos.length > 0) {
            const ultimo = actividadData.intentos[actividadData.intentos.length - 1];
            return Number(ultimo.errores || actividadData.errores || 0);
          }
          return Number(actividadData.errores || 0);
        })();
        return {
          id: actividadId,
          nombre: actividadData.nombre || actividadId,
          categoria: actividadData.categoria || 'General',
          puntos,
          errores,
          ultimaActualizacion: actividadData.ultimaActualizacion || (actividadData.intentos && actividadData.intentos.slice(-1)[0]?.fecha) || null,
          maxPoints: actividadData.maxPoints || DEFAULT_MAX_POINTS_PER_ACTIVITY,
        };
      });
    }

    const progresoLegacy = alumnoData.progreso || {};
    const actividades = [];
    if (progresoLegacy && typeof progresoLegacy === 'object') {
      Object.keys(progresoLegacy).forEach((categoria) => {
        const juegos = progresoLegacy[categoria];
        if (juegos && typeof juegos === 'object') {
          Object.keys(juegos).forEach((nombreJuego) => {
            const juego = juegos[nombreJuego];
            if (juego) {
              const puntos = Number(juego.puntos) || 0;
              const errores = Number(juego.errores) || 0;
              actividades.push({
                id: `${categoria}-${nombreJuego}`,
                nombre: nombreJuego,
                categoria,
                puntos,
                errores,
                ultimaActualizacion: juego.fecha || null,
                maxPoints: DEFAULT_MAX_POINTS_PER_ACTIVITY,
              });
            }
          });
        }
      });
    }
    return actividades;
  };

  // Agrupa las actividades por categoría y suma puntos y maxPoints
  const aggregateByCategory = (activitiesList) => {
    const map = {};
    activitiesList.forEach(act => {
      const cat = act.categoria || 'General';
      if (!map[cat]) {
        map[cat] = {
          categoria: cat,
          puntosTotales: 0,
          maxPointsTotales: 0,
          ultimaActualizacion: act.ultimaActualizacion || null,
        };
      }
      map[cat].puntosTotales += Number(act.puntos || 0);
      map[cat].maxPointsTotales += Number(act.maxPoints || DEFAULT_MAX_POINTS_PER_ACTIVITY);
      // mantener la fecha más reciente
      if (act.ultimaActualizacion) {
        const prev = map[cat].ultimaActualizacion;
        if (!prev || new Date(act.ultimaActualizacion) > new Date(prev)) {
          map[cat].ultimaActualizacion = act.ultimaActualizacion;
        }
      }
    });
    // convertir a arreglo
    return Object.values(map).map(c => {
      const ratio = c.maxPointsTotales > 0 ? Math.max(0, Math.min(1, c.puntosTotales / c.maxPointsTotales)) : 0;
      const percent = Math.round(ratio * 100);
      return {
        categoria: c.categoria,
        puntosTotales: c.puntosTotales,
        maxPointsTotales: c.maxPointsTotales,
        percent,
        ultimaActualizacion: c.ultimaActualizacion,
      };
    });
  };

  const cargarProgresoAlumno = async (alumno) => {
    if (!alumno || (!alumno.uid && !alumno.id)) {
      console.log('Alumno o ID/UID no válido:', alumno);
      return;
    }

    try {
      setCargando(true);
      const idParaBuscar = alumno.uid || String(alumno.id);
      if (!idParaBuscar || idParaBuscar === 'undefined' || idParaBuscar === 'null') {
        setDatosActividades(null);
        return;
      }

      const alumnoRef = doc(db, 'alumnos', idParaBuscar);
      const alumnoSnap = await getDoc(alumnoRef);
      if (!alumnoSnap.exists()) {
        setDatosActividades(null);
        return;
      }

      const alumnoData = alumnoSnap.data();
      const listaActividades = construirListaActividades(alumnoData);

      listaActividades.sort((a, b) => {
        if (a.categoria === b.categoria) return a.nombre.localeCompare(b.nombre);
        return a.categoria.localeCompare(b.categoria);
      });

      const categoriasAgrupadas = aggregateByCategory(listaActividades);

      setDatosActividades({ lista: listaActividades, categoriasAgrupadas });
    } catch (error) {
      console.error('Error al cargar progreso del alumno:', error);
      setDatosActividades(null);
    } finally {
      setCargando(false);
    }
  };

  const handleSeleccionAlumno = (alumno) => {
    setAlumnoSeleccionado(alumno);
    setShowChart(true);
    cargarProgresoAlumno(alumno);
  };

  const navegarAlJuego = (alumno, actividadId) => {
    const alumnoIdPara = alumno.uid || alumno.id;
    navigation.navigate('Juego1Suma', {
      alumnoId: alumnoIdPara,
      claseId: idClase || clase?.id,
      actividadId: actividadId || 'suma-basica'
    });
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image style={styles.imM} source={{ uri: clase?.profileImage }} />
        <Text style={[styles.tex, styles.font]}>
          {clase?.docenteNombre || 'Sin nombre'}
        </Text>
      </View>

      <Text style={[styles.font, styles.titulo]}>Alumnos</Text>

      <ScrollView style={styles.scrollView}>
        {alumnosInscritos.length === 0 ? (
          <Text style={[styles.font, styles.sinAlumnos]}>No hay alumnos registrados en esta clase.</Text>
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
            <Text style={[styles.font, styles.chartTitle]}>Progreso por Actividad</Text>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowChart(false);
                setAlumnoSeleccionado(null);
                setDatosActividades(null);
              }}
            >
              <Text style={styles.closeButtonText}>❌</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.font, styles.alumnoNombre]}>{alumnoSeleccionado.nombres_apellidos}</Text>

          {cargando ? (
            <View style={styles.cargandoContainer}>
              <Text style={[styles.font, styles.cargandoText]}>Cargando progreso...</Text>
            </View>
          ) : datosActividades && datosActividades.categoriasAgrupadas && datosActividades.categoriasAgrupadas.length > 0 ? (
            <ScrollView style={{ maxHeight: 320 }}>
              {datosActividades.categoriasAgrupadas.map((cat) => {
                const percent = cat.percent;
                return (
                  <View key={cat.categoria} style={styles.activityRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.font1}>{cat.categoria}</Text>
                      <Text style={[styles.font, { fontSize: 12, color: '#666' }]}>{cat.ultimaActualizacion || '—'}</Text>

                      <View style={styles.progressBarBackground}>
                        <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
                      </View>

                      <View style={styles.progressMeta}>
                        <Text style={[styles.font, { fontSize: 12, color: '#333' }]}>{cat.puntosTotales} / {cat.maxPointsTotales} pts</Text>
                        <Text style={[styles.font, { fontSize: 12, color: '#34B0A6' }]}>{percent}%</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.sinDatosContainer}>
              <Text style={[styles.font, styles.sinDatosText]}>No hay progreso registrado para este alumno en esta clase.</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#ffffff" },
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
    fontFamily: 'CenturyGothic'
  },
  tex: {
    left: 50,
    fontSize: 17,
    top: 20,
    marginBottom: 5
  },
  titulo: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center'
  },
  alumnoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  imaj: {
    backgroundColor: '#34B0A6',
    marginTop: 5,
    height: 70,
    borderRadius: 40,
    flex: 1,
    marginRight: 10
  },
  alumnoSeleccionado: {
    backgroundColor: '#2a8e86',
    borderWidth: 2,
    borderColor: '#1a5c57'
  },
  ima: {
    width: 60,
    height: 60,
    left: 10,
    top: 5
  },
  imM: {
    left: 30,
    width: 80,
    height: 80,
    borderRadius: 50,
    marginTop: 20
  },
  contenI: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    borderRadius: 30,
    alignItems: 'center'
  },
  txS: {
    top: "40%",
    left: 90,
    color: 'white',
    fontSize: 16,
    position: 'absolute'
  },
  idText: {
    top: 35,
    left: 70,
    color: 'white',
    fontSize: 12,
    position: 'absolute'
  },
  font1: {
    fontFamily: 'CenturyGothic-Bold'
  },
  scrollView: {
    width: screenWidth - 20, right: 12
  },
  sinAlumnos: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#666'
  },
  botonJuego: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  botonJuegoTexto: {
    color: 'white',
    fontFamily: 'CenturyGothic-Bold',
    fontSize: 14
  },

  chartContainer: {
    position: 'absolute',
    bottom: '25%',
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
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  chartTitle: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center', flex: 1
  },
  closeButton: {
    position: 'absolute',
    right: 8, top: -6
  },
  closeButtonText: {
    fontSize: 20
  },

  alumnoNombre: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10
  },
  cargandoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    height: 120
  },
  cargandoText: {
    color: '#34B0A6',
    fontSize: 16
  },

  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12, paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#e6f2ef',
    borderRadius: 8,
    marginTop: 8,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#34B0A6'
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6
  },

  botonPequeno: {
    backgroundColor: '#34B0A6',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8
  },

  sinDatosContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20, borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120
  },
  sinDatosText: {
    color: '#6c757d',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10
  },
});
