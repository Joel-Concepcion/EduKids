import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image, Modal
} from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { useFonts, Kavoon_400Regular } from 'expo-font';
import { auth, db } from '../../../model/db';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const palabrasNivel1 = ['sol', 'casa', 'gato', 'luna', 'mesa', 'papa'];

const imagenes = {
  a: require('../../../assets/game/literatura/letra de la A a la Z/letra A azul.png'),
  b: require('../../../assets/game/literatura/letra de la A a la Z/letra B rojo.png'),
  c: require('../../../assets/game/literatura/letra de la A a la Z/letra C amrillo.png'),
  d: require('../../../assets/game/literatura/letra de la A a la Z/letra D verde.png'),
  e: require('../../../assets/game/literatura/letra de la A a la Z/letra E azul.png'),
  f: require('../../../assets/game/literatura/letra de la A a la Z/letra F naranja.png'),
  g: require('../../../assets/game/literatura/letra de la A a la Z/letra G rojo.png'),
  h: require('../../../assets/game/literatura/letra de la A a la Z/letra H verde.png'),
  i: require('../../../assets/game/literatura/letra de la A a la Z/letra I amarrillo.png'),
  j: require('../../../assets/game/literatura/letra de la A a la Z/letra J azul.png'),
  l: require('../../../assets/game/literatura/letra de la A a la Z/letra L verde.png'),
  m: require('../../../assets/game/literatura/letra de la A a la Z/letra M amrillo.png'),
  n: require('../../../assets/game/literatura/letra de la A a la Z/letra N azul.png'),
  o: require('../../../assets/game/literatura/letra de la A a la Z/letra O verde.png'),
  p: require('../../../assets/game/literatura/letra de la A a la Z/letra P azul.png'),
  q: require('../../../assets/game/literatura/letra de la A a la Z/letra Q amarrillo.png'),
  r: require('../../../assets/game/literatura/letra de la A a la Z/letra R rojo.png'),
  s: require('../../../assets/game/literatura/letra de la A a la Z/letra S verde.png'),
  t: require('../../../assets/game/literatura/letra de la A a la Z/letra T azul.png'),
  u: require('../../../assets/game/literatura/letra de la A a la Z/letra U azul.png'),
  v: require('../../../assets/game/literatura/letra de la A a la Z/letra V amarillo.png'),
  w: require('../../../assets/game/literatura/letra de la A a la Z/letra W naranja.png'),
  x: require('../../../assets/game/literatura/letra de la A a la Z/letra X verde.png'),
  y: require('../../../assets/game/literatura/letra de la A a la Z/letra Y naranja.png'),
  z: require('../../../assets/game/literatura/letra de la A a la Z/letra Z rojo.png'),
};

// mapping activity id -> category (extend as needed)
const CATEGORY_MAP = {
  'juego-palabras': 'Literatura',
  'vocabulario-memoria': 'Literatura',
  'suma-basica': 'Matemática',
  'juego1-suma': 'Matemática',
};

export default function JuegoPalabras({ navigation, route }) {
  // route.params expected: { alumnoId?, claseId?, actividadId?, actividadCategoria? }
  const { alumnoId: alumnoParam, claseId: claseParam, actividadId: actividadParam, actividadCategoria: actividadCategoriaParam } = route?.params || {};

  const [indice, setIndice] = useState(0);
  const [palabraActual, setPalabraActual] = useState(palabrasNivel1[indice]);
  const [letrasSeleccionadas, setLetrasSeleccionadas] = useState([]);
  const [letrasDisponibles, setLetrasDisponibles] = useState([]);
  const [puntos, setPuntos] = useState(10);
  const [errores, setErrores] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  const bgMusicRef = useRef(new Audio.Sound());
  const selectSoundRef = useRef(new Audio.Sound());

  const [fontsLoaded] = useFonts({
    CenturyGothic: require('../../../assets/font/3394-font.ttf'),
    CenturyGothicBold: require('../../../assets/font/4410-font.ttf'),
    Kavoon_400Regular,
  });

  useEffect(() => {
    const letras = palabraActual.split('');
    const mezcladas = [...letras].sort(() => Math.random() - 0.5);
    setLetrasDisponibles(mezcladas);
    setLetrasSeleccionadas([]);

    Speech.speak(`Muy bien, ahora vamos a formar la palabra ${palabraActual}`, { language: 'es' });
  }, [palabraActual]);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        bgMusicRef.current = new Audio.Sound();
        await bgMusicRef.current.loadAsync(require('../../../assets/sound/musicaA.mp3'));
        await bgMusicRef.current.setIsLoopingAsync(true);
        await bgMusicRef.current.setVolumeAsync(0.3);
        await bgMusicRef.current.playAsync();

        selectSoundRef.current = new Audio.Sound();
        await selectSoundRef.current.loadAsync(require('../../../assets/sound/tapp.mp3'));
      } catch (e) {
        console.log('Error cargando audio:', e);
      }
    };
    setupAudio();

    return () => {
      const cleanup = async () => {
        try {
          Speech.stop();
          const statusBg = await bgMusicRef.current.getStatusAsync();
          if (statusBg.isLoaded) {
            await bgMusicRef.current.stopAsync();
            await bgMusicRef.current.unloadAsync();
          }
          const statusTap = await selectSoundRef.current.getStatusAsync();
          if (statusTap.isLoaded) {
            await selectSoundRef.current.unloadAsync();
          }
        } catch (e) {
          console.log('Error al detener música:', e);
        }
      };
      cleanup();
    };
  }, []);

  const playSound = async (ref) => {
    try {
      if (!ref?.current) return;
      const st = await ref.current.getStatusAsync();
      if (!st.isLoaded) return;
      if (st.positionMillis > 0) {
        await ref.current.stopAsync();
        await ref.current.setPositionAsync(0);
      }
      await ref.current.playAsync();
    } catch {}
  };

  useEffect(() => {
    if (letrasSeleccionadas.length === palabraActual.length) {
      const formada = letrasSeleccionadas.join('');
      if (formada === palabraActual) {
        Speech.speak(`¡Excelente! Formaste la palabra ${formada}`, { language: 'es' });
        if (indice + 1 < palabrasNivel1.length) {
          setTimeout(() => {
            setIndice(indice + 1);
            setPalabraActual(palabrasNivel1[indice + 1]);
          }, 1000);
        } else {
          setModalVisible(true);
          guardarProgreso(); // save when finished
        }
      } else {
        Speech.speak('Intenta nuevamente, tú puedes!', { language: 'es' });
        setErrores((prev) => prev + 1);
        setPuntos((prev) => Math.max(prev - 1, 0));
        setTimeout(() => {
          const letras = palabraActual.split('').sort(() => Math.random() - 0.5);
          setLetrasDisponibles(letras);
          setLetrasSeleccionadas([]);
        }, 1000);
      }
    }
  }, [letrasSeleccionadas]);

  const seleccionarLetra = (letra, index) => {
    playSound(selectSoundRef);
    setLetrasSeleccionadas((prev) => [...prev, letra]);
    const nuevasDisponibles = [...letrasDisponibles];
    nuevasDisponibles.splice(index, 1);
    setLetrasDisponibles(nuevasDisponibles);
  };

  const determineCategory = (actividadId) => {
    if (actividadCategoriaParam) return actividadCategoriaParam;
    if (actividadId && CATEGORY_MAP[actividadId]) return CATEGORY_MAP[actividadId];
    // fallback heuristics
    if (actividadId && /suma|resta|mate|numero|math/i.test(actividadId)) return 'Matemática';
    if (actividadId && /palabra|vocab|liter|letra/i.test(actividadId)) return 'Literatura';
    return 'Literatura';
  };

  // Save under progresoPorClase and also update legacy progreso[categoria] for compatibility
  const guardarProgreso = async () => {
    try {
      const idParaGuardar = alumnoParam || auth?.currentUser?.uid;
      if (!idParaGuardar) return;

      const claseId = claseParam || 'sin-clase';
      const actividadId = actividadParam || 'juego-palabras';
      const categoria = determineCategory(actividadId);

      const alumnoRef = doc(db, 'alumnos', idParaGuardar);
      const alumnoSnap = await getDoc(alumnoRef);
      const alumnoData = alumnoSnap.exists() ? alumnoSnap.data() : {};

      const progresoPorClase = alumnoData.progresoPorClase || {};
      const progresoClasePrev = progresoPorClase[claseId] || { actividades: {}, resumen: {} };
      const actividadPrev = progresoClasePrev.actividades?.[actividadId];

      const fechaHoy = new Date().toISOString().split('T')[0];
      const nuevoIntento = { puntos, errores, fecha: fechaHoy };

      const intentosPrev = actividadPrev?.intentos || [];
      const actividadNueva = {
        ...(actividadPrev || {}),
        puntos,
        errores,
        categoria, // explicit category stored
        nombre: actividadPrev?.nombre || actividadId,
        ultimaActualizacion: fechaHoy,
        intentos: [...intentosPrev, nuevoIntento],
      };

      const actividadesActualizadas = {
        ...(progresoClasePrev.actividades || {}),
        [actividadId]: actividadNueva,
      };

      const resumen = Object.values(actividadesActualizadas).reduce(
        (acc, act) => {
          const last = act.intentos?.[act.intentos.length - 1] || {};
          return {
            puntosTotales: acc.puntosTotales + (last.puntos || 0),
            erroresTotales: acc.erroresTotales + (last.errores || 0),
          };
        },
        { puntosTotales: 0, erroresTotales: 0 }
      );
      resumen.ultimaActualizacion = new Date().toISOString();

      const progresoClaseNuevo = { actividades: actividadesActualizadas, resumen };
      const progresoPorClaseNuevo = { ...progresoPorClase, [claseId]: progresoClaseNuevo };

      await setDoc(alumnoRef, { progresoPorClase: progresoPorClaseNuevo }, { merge: true });

      // Also update legacy progreso[categoria][actividadId] to keep older views working
      try {
        const progresoGlobalPrev = alumnoData.progreso || {};
        const catPrev = progresoGlobalPrev[categoria] || {};
        const actividadLegacy = {
          puntos,
          errores,
          fecha: fechaHoy,
          palabrasCompletadas: palabrasNivel1.length,
        };
        const progresoGlobalNuevo = {
          ...progresoGlobalPrev,
          [categoria]: {
            ...catPrev,
            [actividadId]: actividadLegacy,
          }
        };
        await setDoc(alumnoRef, { progreso: progresoGlobalNuevo }, { merge: true });
      } catch (eLegacy) {
        console.log('No se pudo actualizar esquema legacy (progreso):', eLegacy);
      }

      console.log('Progreso guardado exitosamente en alumno:', idParaGuardar, 'clase:', claseId, 'actividad:', actividadId, 'categoria:', categoria);
    } catch (error) {
      console.error('Error al guardar el progreso:', error);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forma la palabra {palabraActual}</Text>
      <Text style={styles.score}>Puntos: {puntos} | Errores: {errores}</Text>

      <View style={styles.wordPlaceholder}>
        {palabraActual.split('').map((_, i) => {
          const letra = letrasSeleccionadas[i];
          return (
            <View key={i} style={styles.casilla}>
              {letra ? (
                imagenes[letra] ? (
                  <Image source={imagenes[letra]} style={styles.letraImagen} />
                ) : (
                  <Text style={styles.casillaTexto}>{letra}</Text>
                )
              ) : (
                <Text style={styles.casillaTexto}>_</Text>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.lettersContainer}>
        {letrasDisponibles.map((letra, index) => (
          <TouchableOpacity key={index} style={styles.letterCard} onPress={() => seleccionarLetra(letra, index)}>
            {imagenes[letra] ? (
              <Image source={imagenes[letra]} style={styles.letraImagen} />
            ) : (
              <Text style={styles.letterText}>{letra}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¡Juego terminado!</Text>
            <Text style={styles.modalText}>Puntos obtenidos: {puntos}</Text>
            <Text style={styles.modalText}>Errores cometidos: {errores}</Text>
            <Text style={styles.modalText}>
              {errores > 3
                ? 'Puedes mejorar practicando más la concentración y el orden de las letras.'
                : '¡Muy bien! Sigue practicando para perfeccionar tu velocidad y precisión.'}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.bt12}
                onPress={async () => {
                  setIndice(0);
                  setPalabraActual(palabrasNivel1[0]);
                  setPuntos(10);
                  setErrores(0);
                  setModalVisible(false);
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontFamily: 'CenturyGothicBold' }}>
                  Continuar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bt12}
                onPress={async () => {
                  setModalVisible(false);
                  try {
                    const status = await bgMusicRef.current.getStatusAsync();
                    if (status.isLoaded) {
                      await bgMusicRef.current.stopAsync();
                      await bgMusicRef.current.unloadAsync();
                    }
                  } catch (e) {
                    console.log('Error al detener música:', e);
                  }
                  navigation.navigate('Clase');
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontFamily: 'CenturyGothicBold' }}>
                  Clase
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#99E7D9',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#34B0A6',
    textAlign: 'center',
    fontFamily: 'Kavoon_400Regular',
  },
  score: {
    fontSize: 18,
    marginBottom: 10,
    fontFamily: 'Kavoon_400Regular',
    color: '#34B0A6',
  },
  wordPlaceholder: {
    flexDirection: 'row',
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  casilla: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#34B0A6',
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  casillaTexto: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#34B0A6',
  },
  lettersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  letterCard: {
    backgroundColor: '#34B0A6',
    width: 60,
    height: 60,
    margin: 8,
    borderRadius: 10,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
  letterText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  letraImagen: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    alignItems: 'center',
    elevation: 6,
  },
  modalTitle: {
    fontSize: 22,
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Kavoon_400Regular',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
    textAlign: 'center',
    fontFamily: 'CenturyGothicBold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    width: '100%',
  },
  bt12: {
    backgroundColor: '#34B0A6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 10,
    alignItems: 'center',
  },
});
