import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { useFonts, Kavoon_400Regular } from 'expo-font';
import { auth, db } from '../../../model/db';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const imagenes = {
  cuadrado: require('../../../assets/game/figurasFormas/cuadrado.png'),
  Círculo: require('../../../assets/game/figurasFormas/Círculo.png'),
  Estrella: require('../../../assets/game/figurasFormas/Estrella.png'),
  Rectángulo: require('../../../assets/game/figurasFormas/Rectángulo.png'),
  triangulo: require('../../../assets/game/figurasFormas/triangulo.png'),
  Óvalo: require('../../../assets/game/figurasFormas/Óvalo.png'),
};

const SHAPES = [
  { key: 'Círculo', label: 'Círculo', image: imagenes.Círculo },
  { key: 'cuadrado', label: 'Cuadrado', image: imagenes.cuadrado },
  { key: 'Rectángulo', label: 'Rectángulo', image: imagenes.Rectángulo },
  { key: 'Óvalo', label: 'Óvalo', image: imagenes.Óvalo },
  { key: 'triangulo', label: 'Triángulo', image: imagenes.triangulo },
  { key: 'Estrella', label: 'Estrella', image: imagenes.Estrella },
];

const MAX_POINTS = 10;
const PARTIAL_POINTS = 5;

export default function JuegoFormas({ navigation, route }) {
  // route.params may include alumnoId, claseId, actividadId
  const { alumnoId: alumnoParam, claseId: claseParam, actividadId: actividadParam } = route?.params || {};

  const [fontsLoaded] = useFonts({
    CenturyGothic: require('../../../assets/font/3394-font.ttf'),
    CenturyGothicBold: require('../../../assets/font/4410-font.ttf'),
    Kavoon_400Regular,
  });

  const [touched, setTouched] = useState({}); // e.g. { Círculo: true }
  const [errors, setErrors] = useState(0);
  const [pointsVisible, setPointsVisible] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [finalMessage, setFinalMessage] = useState('');
  const tapSoundRef = useRef(new Audio.Sound());
  const bgMusicRef = useRef(new Audio.Sound());
  const actividadId = actividadParam || 'juego-formas';
  const categoria = 'Formas';

  useEffect(() => {
    let mounted = true;
    const setup = async () => {
      try {
        await tapSoundRef.current.loadAsync(require('../../../assets/sound/tapp.mp3'));
      } catch (e) {
        console.log('tap sound load error', e);
      }
      try {
        await bgMusicRef.current.loadAsync(require('../../../assets/sound/mario-walking-through-dream-sequence-224596.mp3'));
        await bgMusicRef.current.setIsLoopingAsync(true);
        await bgMusicRef.current.setVolumeAsync(0.15);
        if (mounted) await bgMusicRef.current.playAsync();
      } catch (e) {
        console.log('bg music load/play error', e);
      }
    };
    setup();

    return () => {
      mounted = false;
      const cleanup = async () => {
        try {
          const s = tapSoundRef.current;
          const st = await s.getStatusAsync();
          if (st.isLoaded) await s.unloadAsync();
        } catch { }
        try {
          const b = bgMusicRef.current;
          const st2 = await b.getStatusAsync();
          if (st2.isLoaded) {
            await b.stopAsync();
            await b.unloadAsync();
          }
        } catch { }
      };
      cleanup();
    };
  }, []);

  useEffect(() => {
    try {
      Speech.speak('Bienvenido, es hora de aprender sobre las figuras y formas', { language: 'es' });
    } catch (e) {
      console.log('speech welcome error', e);
    }
  }, []);

  const playTap = async () => {
    try {
      const s = tapSoundRef.current;
      const st = await s.getStatusAsync();
      if (!st.isLoaded) return;
      if (st.isPlaying) {
        await s.stopAsync();
        await s.setPositionAsync(0);
      }
      // use replayAsync if available, otherwise playAsync
      if (typeof s.replayAsync === 'function') {
        await s.replayAsync();
      } else {
        await s.playAsync();
      }
    } catch { }
  };

  // Guardar SOLO en progresoPorClase (sin actualizar esquema legacy)
  const guardarProgresoPorClase = async (puntos, touchedMap, isFinal = false) => {
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
      const intentosPrev = Array.isArray(actividadPrev?.intentos) ? actividadPrev.intentos : [];
      const nuevoIntento = {
        puntos: typeof puntos === 'number' ? puntos : Number(puntos) || 0,
        figurasTocadas: Object.keys(touchedMap).filter(k => touchedMap[k]),
        fecha: fechaHoy,
        final: !!isFinal,
        errores: typeof errors === 'number' ? errors : 0,
      };

      const actividadNueva = {
        ...(actividadPrev || {}),
        puntos: typeof nuevoIntento.puntos === 'number' ? nuevoIntento.puntos : Number(nuevoIntento.puntos) || 0,
        errores: typeof nuevoIntento.errores === 'number' ? nuevoIntento.errores : 0,
        categoria,
        nombre: actividadPrev?.nombre || 'Juego de Formas',
        ultimaActualizacion: fechaHoy,
        intentos: [...intentosPrev, nuevoIntento],
        maxPoints: actividadPrev?.maxPoints || MAX_POINTS,
      };

      const actividadesActualizadas = {
        ...(progresoClasePrev.actividades || {}),
        [actividadId]: actividadNueva,
      };

      // Recalcular resumen usando puntos acumulados por actividad (actividad.puntos)
      const resumen = Object.values(actividadesActualizadas).reduce(
        (acc, act) => {
          const puntosAct = typeof act.puntos === 'number' ? act.puntos : 0;
          const erroresAct = typeof act.errores === 'number' ? act.errores : 0;
          return {
            puntosTotales: (acc.puntosTotales || 0) + puntosAct,
            erroresTotales: (acc.erroresTotales || 0) + erroresAct,
          };
        },
        { puntosTotales: 0, erroresTotales: 0 }
      );
      resumen.ultimaActualizacion = fechaHoy;

      const progresoClaseNuevo = { actividades: actividadesActualizadas, resumen };
      const progresoPorClaseNuevo = { ...progresoPorClase, [claseId]: progresoClaseNuevo };

      // Guardar SOLO en progresoPorClase (merge para no borrar otros campos)
      await setDoc(alumnoRef, { progresoPorClase: progresoPorClaseNuevo }, { merge: true });

      console.log('Progreso guardado en progresoPorClase:', { alumno: idParaGuardar, claseId, actividadId, puntos: actividadNueva.puntos, final: !!isFinal });
    } catch (e) {
      console.error('Error guardando progreso en progresoPorClase:', e);
    }
  };

  const onPressShape = async (shape) => {
    try {
      Speech.speak(shape.label, { language: 'es' });
    } catch (e) { console.log('speech error', e); }

    await playTap();

    setTouched(prev => {
      if (prev[shape.key]) return prev;
      const next = { ...prev, [shape.key]: true };

      const touchedCount = Object.keys(next).filter(k => next[k]).length;
      const tempPoints = Math.min(Math.round((touchedCount / SHAPES.length) * MAX_POINTS), MAX_POINTS);
      setPointsVisible(tempPoints);

      // autosave intermediate progress (only in progresoPorClase)
      guardarProgresoPorClase(tempPoints, next, false).catch(err => console.log('guardar err', err));

      if (touchedCount === SHAPES.length) {
        const finalPoints = MAX_POINTS;
        setTimeout(() => {
          finishSession(next, finalPoints);
        }, 300);
      }

      return next;
    });
  };

  const finishSession = (touchedMap, finalPointsParam) => {
    const touchedCount = Object.keys(touchedMap).filter(k => touchedMap[k]).length;
    const all = touchedCount === SHAPES.length;
    const finalPoints = typeof finalPointsParam === 'number' ? finalPointsParam : (all ? MAX_POINTS : PARTIAL_POINTS);
    setPointsVisible(finalPoints);

    if (all) {
      const msg = `¡Felicidades! Completaste la actividad y obtuviste ${finalPoints} puntos.`;
      setFinalMessage(msg);
      try { Speech.speak(msg, { language: 'es' }); } catch { }
    } else {
      const missed = SHAPES.length - touchedCount;
      const msg = `Buen intento. Tocaste ${touchedCount} figuras. Obtuviste ${finalPoints} puntos. Practica las ${missed} figuras que faltaron.`;
      setFinalMessage(msg);
      try { Speech.speak(msg, { language: 'es' }); } catch { }
    }

    // final save only in progresoPorClase
    guardarProgresoPorClase(finalPoints, touchedMap, true).catch(() => { });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    const unsub = navigation?.addListener?.('beforeRemove', async () => {
      try {
        const b = bgMusicRef.current;
        const st = await b.getStatusAsync();
        if (st.isLoaded) {
          await b.stopAsync();
          await b.unloadAsync();
        }
      } catch { }
    });
    return () => {
      if (unsub) unsub();
    };
  }, [navigation]);

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
        } catch (e) { } b
      })();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Toca una forma</Text>

      <View style={styles.grid}>
        {SHAPES.map((shape) => {
          const pressed = !!touched[shape.key];
          return (
            <TouchableOpacity
              key={shape.key}
              style={[styles.formaBase, pressed && styles.formaPressed]}
              onPress={() => onPressShape(shape)}
              activeOpacity={0.8}
            >
              <Image source={shape.image} style={styles.image} />
              <Text style={styles.formaTexto}>{shape.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.points}>
          Figuras tocadas: {Object.keys(touched).filter(k => touched[k]).length} / {SHAPES.length} • Puntos: {pointsVisible} / {MAX_POINTS}
        </Text>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalText}>{finalMessage}</Text>
              <Text style={styles.modalHint}>Toca cualquier parte de la pantalla para continuar</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#99E7D9',
    alignItems: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    marginBottom: 18,
    fontFamily: 'CenturyGothicBold'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  formaBase: {
    width: 120,
    height: 120,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffffff',
    borderWidth: 2,
    borderColor: '#34B0A6',
    borderRadius: 12,
    padding: 8,
  },
  formaPressed: {
    backgroundColor: '#e0f2f1',
    borderColor: '#26a69a'
  },
  image: {
    width: 64,
    height: 64,
    marginBottom: 6,
    resizeMode: 'contain'
  },
  formaTexto: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'CenturyGothic'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center'
  },
  points: {
    fontSize: 16,
    fontFamily: 'CenturyGothicBold',
    color: 'rgba(78, 78, 78, 1)'
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center'
  },
  modalText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'CenturyGothic'
  },
  modalHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 6
  },
});
