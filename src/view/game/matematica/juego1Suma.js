import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
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

export default function Juego1Suma({ navigation, route }) {
  const { alumnoId } = route.params || {};
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

  useEffect(() => {
    setMaxNumber(level === 1 ? 5 : level === 2 ? 10 : 10);
  }, [level]);

  useFocusEffect(
    useCallback(() => {
      let soundInstance;

      const reproducirMusicaFondo = async () => {
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
      };

      reproducirMusicaFondo();

      return () => {
        if (soundInstance) {
          soundInstance.stopAsync();
          soundInstance.unloadAsync();
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
      const { sound } = await Audio.Sound.createAsync(
        require('../../../assets/sound/tapp.mp3'),
        { shouldPlay: true }
      );
      await sound.playAsync();
    };

    await reproducirSonidoSeleccion();

    if (value === problem.result) {
      const mensaje = `¡Excelente! ${value} es la respuesta correcta`;
      Speech.speak(mensaje, { language: 'es' });
      setMostrarGif(true);
      setTimeout(() => {
        setMostrarGif(false);
        setCompleted((prev) => prev + 1);
      }, 2000);
    } else {
      setErrores((prev) => prev + 1);
      const motivador = mensajesMotivadores[Math.floor(Math.random() * mensajesMotivadores.length)];
      Speech.speak(motivador, { language: 'es' });
    }
  };

  // Función para guardar progreso
  const guardarProgreso = async (puntos) => {
  try {
    // Determinar el ID a usar
    const idParaGuardar = alumnoId || auth?.currentUser?.uid;
    
    console.log('Guardando progreso para ID:', idParaGuardar);

    if (!idParaGuardar) {
      console.log('No hay ID válido para guardar progreso');
      return;
    }

    // Referencia al documento del alumno
    const alumnoRef = doc(db, 'alumnos', idParaGuardar);
    const alumnoDoc = await getDoc(alumnoRef);
    
    if (!alumnoDoc.exists()) {
      console.log('No se encontró el alumno con ID:', idParaGuardar);
      return;
    }

    const alumnoData = alumnoDoc.data();
    const progresoActual = alumnoData.progreso || {};

    // Actualizar progreso manteniendo la estructura existente
    const nuevoProgreso = {
      ...progresoActual,
      Matemática: {
        ...(progresoActual.Matemática || {}),
        juego1Suma: {
          puntos: puntos,
          fecha: new Date().toISOString().split('T')[0],
          nivelCompletado: level,
          ejerciciosCompletados: completed,
          errores: errores
        }
      }
    };

    // Actualizar solo el campo progreso
    await setDoc(alumnoRef, {
      progreso: nuevoProgreso
    }, { merge: true }); // ¡IMPORTANTE: merge: true para no sobreescribir otros campos

    console.log('Progreso guardado exitosamente en alumno:', idParaGuardar);
    console.log('Progreso actualizado:', nuevoProgreso);

  } catch (error) {
    console.error('Error al guardar el progreso:', error);
  }
};

  if (finished) {
    const puntos = Math.max(10 - errores, 0);
    
    // Guardar progreso cuando el juego termina
    guardarProgreso(puntos);

    Speech.speak(`¡Felicidades! Has completado todos los ejercicios con ${puntos} puntos`, { language: 'es' });

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
          }}
        >
          <Text style={styles.cardText}>Jugar de nuevo</Text>
        </TouchableOpacity>
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

      {mostrarGif && (
        <Image source={imagenes[12]} style={styles.gif} resizeMode="contain" />
      )}

      <View style={styles.options}>
        {options.map((opt, idx) => (
          <TouchableOpacity key={idx} style={styles.imageCard} onPress={() => handleAnswer(opt)}>
            <Image source={imagenes[opt]} style={styles.image} resizeMode="contain" />
          </TouchableOpacity>
        ))}
      </View>
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
});