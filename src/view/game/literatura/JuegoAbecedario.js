import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import * as Speech from 'expo-speech';
import { useFonts, Kavoon_400Regular } from 'expo-font';
import { Audio } from 'expo-av';
import { auth, db } from '../../../model/db';
import { doc, setDoc, getDoc } from 'firebase/firestore';

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
  k: require('../../../assets/game/literatura/letra de la A a la Z/letra K rojo.png'),
  l: require('../../../assets/game/literatura/letra de la A a la Z/letra L verde.png'),
  m: require('../../../assets/game/literatura/letra de la A a la Z/letra M amrillo.png'),
  n: require('../../../assets/game/literatura/letra de la A a la Z/letra N azul.png'),
  ñ: require('../../../assets/game/literatura/letra de la A a la Z/letra Ñ roja.png'),
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

const LETTERS = [
  'a','b','c','d','e','f','g','h','i','j','k','l','m','n','ñ','o','p','q','r','s','t','u','v','w','x','y','z'
];

const MAX_POINTS = 10;
const PARTIAL_POINTS = 5;

export default function JuegoAbecedario({ navigation, route }) {
  const { alumnoId: alumnoParam, claseId: claseParam, actividadId: actividadParam } = route?.params || {};

  const [pressedLetters, setPressedLetters] = useState({});
  const [puntos, setPuntos] = useState(0); // will reflect current pressed count until final assignment
  const [fontsLoaded] = useFonts({
    CenturyGothic: require('../../../assets/font/3394-font.ttf'),
    CenturyGothicBold: require('../../../assets/font/4410-font.ttf'),
    Kavoon_400Regular,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [finalMessage, setFinalMessage] = useState('');
  const tapSoundRef = useRef(new Audio.Sound());

  useEffect(() => {
    const load = async () => {
      try {
        await tapSoundRef.current.loadAsync(require('../../../assets/sound/tapp.mp3'));
      } catch (e) {
        console.log('Error cargando sonido:', e);
      }
    };
    load();
    return () => {
      const cleanup = async () => {
        try {
          const s = tapSoundRef.current;
          const st = await s.getStatusAsync();
          if (st.isLoaded) await s.unloadAsync();
        } catch {}
      };
      cleanup();
    };
  }, []);

  useEffect(() => {
    try {
      Speech.speak('Ahora vamos a conocer el abecedario. Presiona cada letra para escuchar su nombre.', { language: 'es' });
    } catch (e) {
      console.log('Speech error intro:', e);
    }
  }, []);

  const playTap = async () => {
    try {
      const s = tapSoundRef.current;
      const st = await s.getStatusAsync();
      if (st.isLoaded) {
        if (st.isPlaying) {
          await s.stopAsync();
          await s.setPositionAsync(0);
        }
        await s.replayAsync();
      }
    } catch {}
  };

  const actividadId = actividadParam || 'abecedario';
  const categoria = 'Literatura';

  const guardarProgresoPorClase = async (currentPoints, pressedMap, final = false) => {
    try {
      const idParaGuardar = alumnoParam || auth?.currentUser?.uid;
      if (!idParaGuardar) return;

      const claseId = claseParam || 'sin-clase';
      const alumnoRef = doc(db, 'alumnos', idParaGuardar);
      const alumnoSnap = await getDoc(alumnoRef);
      const alumnoData = alumnoSnap.exists() ? alumnoSnap.data() : {};

      const progresoPorClase = alumnoData.progresoPorClase || {};
      const progresoClasePrev = progresoPorClase[claseId] || { actividades: {}, resumen: {} };
      const actividadPrev = progresoClasePrev.actividades?.[actividadId];

      const fechaHoy = new Date().toISOString().split('T')[0];
      const intentosPrev = actividadPrev?.intentos || [];
      const nuevoIntento = {
        puntos: currentPoints,
        letrasPresionadas: Object.keys(pressedMap).filter(k => pressedMap[k]),
        fecha: fechaHoy,
        final: !!final,
      };

      const actividadNueva = {
        ...(actividadPrev || {}),
        puntos: currentPoints,
        categoria,
        nombre: 'Abecedario',
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
            erroresTotales: acc.erroresTotales + 0,
          };
        },
        { puntosTotales: 0, erroresTotales: 0 }
      );
      resumen.ultimaActualizacion = fechaHoy;

      const progresoClaseNuevo = { actividades: actividadesActualizadas, resumen };
      const progresoPorClaseNuevo = { ...progresoPorClase, [claseId]: progresoClaseNuevo };

      await setDoc(alumnoRef, { progresoPorClase: progresoPorClaseNuevo }, { merge: true });

      // update legacy
      try {
        const progresoGlobalPrev = alumnoData.progresoPorClase || {};
        const catPrev = progresoGlobalPrev[categoria] || {};
        const actividadLegacy = {
          puntos: currentPoints,
          fecha: fechaHoy,
          letrasPresionadas: nuevoIntento.letrasPresionadas,
        };
        const progresoGlobalNuevo = {
          ...progresoGlobalPrev,
          [categoria]: {
            ...catPrev,
            [actividadId]: actividadLegacy,
          },
        };
        await setDoc(alumnoRef, { progresoPorClase: progresoGlobalNuevo }, { merge: true });
      } catch (eLegacy) {
        console.log('No se pudo actualizar progreso legacy:', eLegacy);
      }

      console.log('Progreso guardado:', { alumno: idParaGuardar, claseId, actividadId, puntos: currentPoints, final });
    } catch (e) {
      console.error('Error guardando progreso abecedario:', e);
    }
  };

  // When finishing session assign final points: 10 if all letters were pressed, otherwise 5.
  const finishSession = (pressedMap) => {
    const pressedCount = Object.keys(pressedMap).filter(k => pressedMap[k]).length;
    const allPressed = pressedCount === LETTERS.length;
    const finalPoints = allPressed ? MAX_POINTS : PARTIAL_POINTS;

    // Update visible points to finalPoints
    setPuntos(finalPoints);

    // Prepare message and speech
    if (allPressed) {
      const msg = `¡Felicidades! Has escuchado todas las letras y obtuviste ${finalPoints} puntos.`;
      setFinalMessage(msg);
      try { Speech.speak(msg, { language: 'es' }); } catch {}
    } else {
      const missing = LETTERS.length - pressedCount;
      const msg = `Buen intento. Escuchaste ${pressedCount} letras. Obtuviste ${finalPoints} puntos. Practica las ${missing} letras que faltaron.`;
      setFinalMessage(msg);
      try { Speech.speak(msg, { language: 'es' }); } catch {}
    }

    // Save final progress marking final = true
    guardarProgresoPorClase(finalPoints, pressedMap, true).catch(() => {});
    setModalVisible(true);
  };

  const onPressLetter = (letter) => {
    const speakText = letter.toLowerCase() === 'y' ? 'i griega' : letter.toLowerCase();
    try {
      Speech.speak(speakText, { language: 'es' });
    } catch (e) {
      console.log('Speech error:', e);
    }

    playTap();

    setPressedLetters(prev => {
      if (prev[letter]) return prev;
      const next = { ...prev, [letter]: true };
      // update temporary puntos to reflect number of unique letters touched (capped at MAX_POINTS)
      const pressedCount = Object.keys(next).length;
      const displayPoints = Math.min(pressedCount, MAX_POINTS);
      setPuntos(displayPoints);

      // Auto-save intermediate progress (not final)
      guardarProgresoPorClase(displayPoints, next, false).catch(err => console.log('guardar error', err));

      // If the student has touched all letters, finish session
      if (pressedCount === LETTERS.length) {
        // small delay so the last letter's speech/sound finishes
        setTimeout(() => finishSession(next), 300);
      }

      return next;
    });
  };

  const onCloseModal = () => {
    setModalVisible(false);
    // keep progress displayed; nothing else needed
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ahora vamos a conocer el Abecedario</Text>
      <Text style={styles.subtitle}>Presiona una letra para escuchar su nombre</Text>

      <FlatList
        data={LETTERS}
        keyExtractor={(item) => item}
        numColumns={6}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => {
          const pressed = !!pressedLetters[item];
          return (
            <TouchableOpacity
              style={[styles.letterCard, pressed && styles.letterCardPressed]}
              onPress={() => onPressLetter(item)}
              activeOpacity={0.7}
            >
              {imagenes[item] ? (
                <Image source={imagenes[item]} style={styles.letterImage} />
              ) : (
                <Text style={styles.letterText}>{item.toUpperCase()}</Text>
              )}
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.footer}>
        <Text style={styles.points}>
          Letras escuchadas: {Object.keys(pressedLetters).filter(k => pressedLetters[k]).length} / {LETTERS.length} • Puntos: {puntos} / {MAX_POINTS}
        </Text>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={onCloseModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>{finalMessage}</Text>
              <Text style={styles.modalSmall}>Toca cualquier parte de la pantalla para cerrar</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: '#99E7D9' },
  title: { fontSize: 22, fontFamily: 'Kavoon_400Regular', textAlign: 'center', color: '#034', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', color: '#034', marginBottom: 12 },
  grid: { alignItems: 'center' },
  letterCard: {
    width: 50,
    height: 50,
    margin: 6,
    borderRadius: 10,
    backgroundColor: '#34B0A6',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  letterCardPressed: { backgroundColor: '#2a8e86' },
  letterImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  letterText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  footer: { paddingVertical: 12 },
  points: { textAlign: 'center', marginBottom: 8, fontFamily: 'CenturyGothic', color: '#034' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '85%', backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 18, textAlign: 'center', marginBottom: 8, fontFamily: 'CenturyGothic-Bold' },
  modalSmall: { fontSize: 12, color: '#666', marginTop: 6 },
});
