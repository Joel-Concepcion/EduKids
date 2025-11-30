import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, Modal } from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';
import { useFonts, Kavoon_400Regular } from 'expo-font';
import { auth, db } from '../../../model/db';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const imagenes = {
  1: require('../../../assets/game/img mate/numero 1.jpeg'),
  2: require('../../../assets/game/img mate/numero 2 .jpeg'),
  3: require('../../../assets/game/img mate/numero 3.jpeg'),
  4: require('../../../assets/game/img mate/numero 4.jpeg'),
  5: require('../../../assets/game/img mate/numero 5 .jpeg'),
  6: require('../../../assets/game/img mate/numero 6.jpeg'),
  7: require('../../../assets/game/img mate/numero 7.jpeg'),
  8: require('../../../assets/game/img mate/numero 8.jpeg'),
  9: require('../../../assets/game/img mate/numero 9.jpeg'),
  10: require('../../../assets/game/img mate/numero 10.jpeg'),
  11: require('../../../assets/game/img mate/signo mas.jpeg'),
  12: require('../../../assets/game/img mate/checklist.gif'),
};

const mensajesMotivadores = [
  '¡Vamos, tú puedes!',
  '¡Inténtalo otra vez!',
  '¡No te rindas!',
  '¡Ánimo, campeón!',
  '¡Tú lo lograrás!',
];

const CATEGORY_MAP = {
  'juego1-suma': 'Matemática',
  'suma-basica': 'Matemática',
  'resta-basica': 'Matemática',
  'juego-palabras': 'Literatura',
  'vocabulario-memoria': 'Literatura',
};

export default function Juego1Suma({ navigation, route }) {
  const { alumnoId: alumnoParam, claseId: claseParam, actividadId: actividadParam, actividadCategoria: actividadCategoriaParam } = route?.params || {};
  const TOTAL_EJERCICIOS = 6;

  const [fontsLoaded] = useFonts({
    CenturyGothic: require('../../../assets/font/3394-font.ttf'),
    CenturyGothicBold: require('../../../assets/font/4410-font.ttf'),
    Kavoon_400Regular,
  });

  const getRandomSum = (max) => {
    const num1 = Math.floor(Math.random() * max) + 1;
    const num2 = Math.floor(Math.random() * max) + 1;
    return { num1, num2, result: num1 + num2 };
  };

  const generateOptions = (correct, count, max) => {
    const options = new Set();
    options.add(correct);
    while (options.size < count) {
      const candidate = Math.floor(Math.random() * (max * 2)) + 1;
      if (candidate <= 10) options.add(candidate);
    }
    return Array.from(options).sort(() => Math.random() - 0.5);
  };

  const [level, setLevel] = useState(1);
  const [maxNumber, setMaxNumber] = useState(5);
  const [problem, setProblem] = useState(getRandomSum(5));
  const [options, setOptions] = useState([]);
  const [completed, setCompleted] = useState(0);
  const [finished, setFinished] = useState(false);
  const [confeti, setConfeti] = useState('');
  const [errores, setErrores] = useState(0);
  const [mostrarGif, setMostrarGif] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [resultRecommendation, setResultRecommendation] = useState('');

  useEffect(() => {
    setMaxNumber(level === 1 ? 5 : level === 2 ? 10 : 10);
  }, [level]);

  useFocusEffect(
    useCallback(() => {
      let soundInstance;

      const reproducirMusicaFondo = async () => {
        try {
          const { sound } = await Audio.Sound.createAsync(
            require('../../../assets/sound/mario-walking-through-dream-sequence-224596.mp3'),
            {
              shouldPlay: true,
              isLooping: true,
              volume: 0.2,
            }
          );
          soundInstance = sound;
          await sound.playAsync();
        } catch (e) {
          console.log('Error reproducir musica fondo:', e);
        }
      };

      reproducirMusicaFondo();

      return () => {
        if (soundInstance) {
          soundInstance.stopAsync().catch(() => { });
          soundInstance.unloadAsync().catch(() => { });
        }
      };
    }, [])
  );

  useEffect(() => {
    if (completed < TOTAL_EJERCICIOS) {
      const newProblem = getRandomSum(maxNumber);
      setProblem(newProblem);
      setOptions(generateOptions(newProblem.result, 4, maxNumber));
      setConfeti('');
    } else {
      setFinished(true);
    }
  }, [completed, maxNumber]);

  const handleAnswer = async (value) => {
    const reproducirSonidoSeleccion = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(require('../../../assets/sound/tapp.mp3'), { shouldPlay: true });
        await sound.playAsync();
        setTimeout(() => {
          sound.stopAsync().catch(() => { });
          sound.unloadAsync().catch(() => { });
        }, 800);
      } catch (e) {
        console.log('Error reproducir tap:', e);
      }
    };

    await reproducirSonidoSeleccion();

    if (value === problem.result) {
      const mensaje = `¡Excelente! ${value} es la respuesta correcta`;
      Speech.speak(mensaje, { language: 'es' });
      setMostrarGif(true);
      setTimeout(() => {
        setMostrarGif(false);
        setCompleted((prev) => prev + 1);
      }, 1200);
    } else {
      setErrores((prev) => prev + 1);
      const motivador = mensajesMotivadores[Math.floor(Math.random() * mensajesMotivadores.length)];
      Speech.speak(motivador, { language: 'es' });
    }
  };

  const determineCategory = (actividadId) => {
    if (actividadCategoriaParam) return actividadCategoriaParam;
    if (actividadId && CATEGORY_MAP[actividadId]) return CATEGORY_MAP[actividadId];
    if (actividadId && /suma|resta|mate|numero|math/i.test(actividadId)) return 'Matemática';
    if (actividadId && /palabra|vocab|liter|letra/i.test(actividadId)) return 'Literatura';
    return 'Matemática';
  };

  const guardarProgresoPorClase = async (puntos) => {
    try {
      const idParaGuardar = alumnoParam || auth?.currentUser?.uid;
      if (!idParaGuardar) {
        console.log('No hay alumnoId disponible para guardar progreso');
        return;
      }

      const claseId = claseParam || 'sin-clase';
      const actividadId = actividadParam || 'juego1-suma';
      const categoria = determineCategory(actividadId);

      const alumnoRef = doc(db, 'alumnos', idParaGuardar);
      const alumnoSnap = await getDoc(alumnoRef);
      const alumnoData = alumnoSnap.exists() ? alumnoSnap.data() : {};

      const progresoPorClase = alumnoData.progresoPorClase || {};
      const progresoClasePrev = progresoPorClase[claseId] || { actividades: {}, resumen: {} };
      const actividadPrev = progresoClasePrev.actividades?.[actividadId];

      const fechaHoy = new Date().toISOString().split('T')[0];
      const nuevoIntento = { puntos, errores, fecha: fechaHoy, nivel: level, ejerciciosCompletados: completed };

      const intentosPrev = actividadPrev?.intentos || [];
      const actividadNueva = {
        ...(actividadPrev || {}),
        puntos,
        errores,
        categoria,
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

      try {
        const progresoGlobalPrev = alumnoData.progresoPorClase || {};
        const catPrev = progresoGlobalPrev[categoria] || {};
        const actividadLegacy = {
          puntos,
          errores,
          fecha: fechaHoy,
          nivel,
          ejerciciosCompletados: completed,
        };
        const progresoGlobalNuevo = {
          ...progresoGlobalPrev,
          [categoria]: {
            ...catPrev,
            [actividadId]: actividadLegacy,
          }
        };
        await setDoc(alumnoRef, { progresoPorClase: progresoGlobalNuevo }, { merge: true });
      } catch (eLegacy) {
        console.log('No se pudo actualizar esquema legacy (progreso):', eLegacy);
      }

      console.log('Progreso guardado:', { alumno: idParaGuardar, claseId, actividadId, categoria, puntos, errores });
    } catch (e) {
      console.error('Error al guardar progreso por clase:', e);
    }
  };

  const evaluateResults = () => {
    const puntos = Math.max(10 - errores, 0);

    // Mensajes personalizados según número de errores
    if (errores === 0) {
      const msg = `¡Excelente! Completaste la actividad con ${puntos} puntos y sin errores. Muy buen trabajo.`;
      setResultMessage(msg);
      setResultRecommendation('');
      Speech.speak(msg, { language: 'es' });
    } else if (errores === 1) {
      const msg = `Buen trabajo. Tuviste 1 error pero vas por muy buen camino.`;
      const rec = `Sugerencia: repasa unas sumas rápidas de 5 preguntas para consolidar lo aprendido. Sigue así y lo lograrás.`;
      setResultMessage(`${msg} Obtuviste ${puntos} puntos.`);
      setResultRecommendation(rec);
      Speech.speak(`${msg} ${rec}`, { language: 'es' });
    } else {
      // errores >= 2
      const msg = `Cometiste ${errores} errores en esta actividad, pero estás en el camino correcto.`;
      // Mensaje más empático y específico: si quieres, podríamos indicar qué tipo de error (aquí general)
      const rec = `Recomendación: practica sumas con números hasta ${maxNumber}. Haz sesiones cortas de 5 ejercicios y revisa paso a paso cada resultado. Verás progreso pronto.`;
      setResultMessage(`${msg} Obtuviste ${puntos} puntos.`);
      setResultRecommendation(rec);
      Speech.speak(`${msg} ${rec}`, { language: 'es' });
    }

    // Mostrar modal y guardar progreso final
    setResultModalVisible(true);
    guardarProgresoPorClase(puntos).catch(() => { });
  };

  useEffect(() => {
    if (finished) {
      evaluateResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  // Detener lectura y limpiar al desmontar
  useEffect(() => {
    return () => {
      try { Speech.stop(); } catch (e) { }
      (async () => {
        try {
          if (tapSoundRef.current) {
            await tapSoundRef.current.unloadAsync();
            tapSoundRef.current = null;
          }
        } catch (e) { }
      })();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (finished) {
    const puntos = Math.max(10 - errores, 0);

    return (
      <View style={styles.container}>
        <Text style={styles.title}>¡Juego completado!</Text>
        <Text style={styles.problem}>Obtuviste {puntos} puntos 🎉</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => {
            setCompleted(0);
            setErrores(0);
            setFinished(false);
            setConfeti('');
            setResultModalVisible(false);
            setResultMessage('');
            setResultRecommendation('');
          }}
        >
          <Text style={styles.cardText}>Jugar de nuevo</Text>
        </TouchableOpacity>

        <Modal visible={resultModalVisible} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setResultModalVisible(false)}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>{resultMessage}</Text>
              {resultRecommendation ? <Text style={styles.modalRec}>{resultRecommendation}</Text> : null}
              <Text style={styles.modalHint}>Toca cualquier parte de la pantalla para cerrar</Text>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ejercicio {completed + 1} de {TOTAL_EJERCICIOS}</Text>

      <View style={styles.problemImages}>
        <Image source={imagenes[problem.num1]} style={styles.problemImage} resizeMode="contain" />
        <Image source={imagenes[11]} style={styles.signImage} resizeMode="contain" />
        <Image source={imagenes[problem.num2]} style={styles.problemImage} resizeMode="contain" />
      </View>

      {/*{mostrarGif && (
        <Image source={imagenes[12]} style={styles.gif} resizeMode="contain" />
      )}*/}

      <View style={styles.options}>
        {options.map((opt, idx) => (
          <TouchableOpacity key={idx} style={styles.imageCard} onPress={() => handleAnswer(opt)}>
            <Image source={imagenes[opt]} style={styles.image} resizeMode="contain" />
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={resultModalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setResultModalVisible(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{resultMessage}</Text>
            {resultRecommendation ? <Text style={styles.modalRec}>{resultRecommendation}</Text> : null}
            <Text style={styles.modalHint}>Toca cualquier parte de la pantalla para cerrar</Text>
          </View>
        </TouchableOpacity>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'CenturyGothicBold',
  },
  problemImages: {
    height: 125,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderColor: '#34B0A6',
    borderWidth: 7,
    borderRadius: 10,
  },
  problemImage: {
    width: 100,
    height: 100,
    marginHorizontal: 10,
  },
  signImage: {
    width: 50,
    height: 50,
    marginHorizontal: 5,
  },
  confeti: {
    fontSize: 28,
    marginBottom: 10,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    top: 50,
  },
  imageCard: {
    width: 100,
    height: 100,
    margin: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderColor: '#34B0A6',
    borderWidth: 7,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
  },
  cardText: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'CenturyGothicBold',
  },
  card: {
    backgroundColor: '#34B0A6',
    padding: 15,
    borderRadius: 40,
    borderColor: '#ffffff',
    borderWidth: 7,
    marginTop: 20,
  },
  problem: {
    fontFamily: 'CenturyGothicBold',
    fontSize: 18,
    marginBottom: 20,
  },
  gif: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'CenturyGothicBold',
  },
  modalRec: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'CenturyGothic',
  },
  modalHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    fontFamily: 'CenturyGothic',
  },
});
