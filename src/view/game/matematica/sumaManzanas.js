import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { useFonts } from 'expo-font';
import { Kavoon_400Regular } from '@expo-google-fonts/kavoon';
import { auth, db } from '../../../model/db';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const SCREEN = Dimensions.get('window');
const imagenManzana = require('../../../assets/game/matemática/manzana.png');
const sonidoTap = require('../../../assets/sound/tapp.mp3');

const DEFAULT_MAX_POINTS = 10; // toda la actividad vale 10 puntos
const MIN_POINTS = 5; // no bajar de 5 puntos
const INACTIVITY_MS = 5000; // 5 segundos

export default function SumaManzanas({ navigation, route }) {
  const { alumnoId: alumnoParam, claseId: claseParam, actividadId: actividadParam, actividadCategoria: actividadCategoriaParam } = route?.params || {};
  const TOTAL_EJERCICIOS = 6;

  const [fontsLoaded] = useFonts({
    CenturyGothic: require('../../../assets/font/3394-font.ttf'),
    CenturyGothicBold: require('../../../assets/font/4410-font.ttf'),
    Kavoon_400Regular,
  });

  // NIVELES
  const levels = [
    { have: 1, target: 3 },
    { have: 2, target: 5 },
    { have: 3, target: 6 },
    { have: 0, target: 4 },
    { have: 4, target: 7 },
  ];

  const [levelIndex, setLevelIndex] = useState(0);
  const currentLevel = levels[levelIndex] || levels[0];

  // estado
  const [draggables, setDraggables] = useState([]);
  const [targetFruits, setTargetFruits] = useState([]); // { id, value }
  const targetFruitsRef = useRef([]); // ref sincronizado para evitar stale closures
  const [erroresNivel, setErroresNivel] = useState(0);
  const erroresNivelRef = useRef(0);
  const [message, setMessage] = useState('');
  const [finishedAll, setFinishedAll] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0); // ahora refleja el puntaje actual de la actividad (0..10)
  const [attempts, setAttempts] = useState([]);

  // sonidos y timers
  const tapSoundRef = useRef(null);
  const targetRef = useRef(null);
  const targetLayoutRef = useRef(null);
  const inactivityTimerRef = useRef(null);

  // modal
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [resultRecommendation, setResultRecommendation] = useState('');

  // sincronizar refs cuando cambie estado
  useEffect(() => { targetFruitsRef.current = targetFruits; }, [targetFruits]);
  useEffect(() => { erroresNivelRef.current = erroresNivel; }, [erroresNivel]);

  // medir zona objetivo
  const measureTarget = useCallback(() => {
    try {
      if (!targetRef.current || !targetRef.current.measureInWindow) return;
      targetRef.current.measureInWindow((x, y, width, height) => {
        targetLayoutRef.current = { x, y, width, height };
      });
    } catch (e) {
      // ignore
    }
  }, []);

  // Detener lectura y limpiar al desmontar
  useEffect(() => {
    return () => {
      try { Speech.stop(); } catch (e) { }
      clearInactivityTimer();
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

  // inicializar draggables al cambiar nivel
  useEffect(() => {
    const lvl = levels[levelIndex] || levels[0];
    const lvlMissing = Math.max(0, lvl.target - lvl.have);
    const arr = Array.from({ length: Math.max(3, lvlMissing + 4) }).map((_, i) => ({
      id: `d-${levelIndex}-${i}`,
      visible: true,
      value: 1,
    }));
    setDraggables(arr);
    setTargetFruits([]);
    setErroresNivel(0);
    setMessage(`Tengo ${lvl.have} manzanas y necesito ${lvl.target}. ¿Cuántas faltan?`);
    try { Speech.speak(`Tengo ${lvl.have} manzanas y necesito ${lvl.target}. ¿Cuántas faltan?`, { language: 'es' }); } catch (e) { }
    clearInactivityTimer();
    resetInactivityTimer();
    const t = setTimeout(() => measureTarget(), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelIndex]);

  // cargar sonido
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const sound = new Audio.Sound();
        await sound.loadAsync(sonidoTap);
        if (mounted) tapSoundRef.current = sound;
      } catch (e) {
        console.warn('No se pudo cargar sonido tap:', e);
        tapSoundRef.current = null;
      }
    };
    load();
    return () => {
      mounted = false;
      (async () => {
        try {
          if (tapSoundRef.current) {
            await tapSoundRef.current.unloadAsync();
            tapSoundRef.current = null;
          }
        } catch (e) { }
      })();
      clearInactivityTimer();
    };
  }, []);

  const playTapSound = async () => {
    try {
      if (!tapSoundRef.current) return;
      await tapSoundRef.current.stopAsync().catch(() => { });
      await tapSoundRef.current.setPositionAsync(0);
      await tapSoundRef.current.playAsync();
    } catch (e) { }
  };

  // timers
  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    clearInactivityTimer();
    inactivityTimerRef.current = setTimeout(() => {
      onInactivityTimeout();
    }, INACTIVITY_MS);
  }, [clearInactivityTimer]);

  // on inactivity: usa la suma actual desde el ref
  const onInactivityTimeout = useCallback(() => {
    if (finishedAll) return;
    const sumPlaced = currentLevel.have + targetFruitsRef.current.reduce((s, f) => s + (f.value ?? 1), 0);
    if (sumPlaced > currentLevel.target) {
      const exceso = sumPlaced - currentLevel.target;
      const msg = `Veo que pusiste ${exceso} manzana(s) de más. Quita las manzanas de más y cuenta otra vez. Tú puedes lograrlo.`;
      try { Speech.speak(msg, { language: 'es' }); } catch (e) { }
      setMessage(msg);
      return;
    }
    if (sumPlaced === currentLevel.target) {
      // evaluar inmediatamente con los valores actuales
      evaluateAttempt(targetFruitsRef.current.length, erroresNivelRef.current, currentLevel.target - currentLevel.have);
      return;
    }
    const faltan = currentLevel.target - sumPlaced;
    const msg = `Faltan ${faltan} manzana(s). Sigue arrastrando hasta completar.`;
    try { Speech.speak(msg, { language: 'es' }); } catch (e) { }
    setMessage(msg);
  }, [finishedAll, currentLevel, evaluateAttempt]);

  // evaluar intento: ahora calcula puntaje de la actividad en base a errores acumulados
  const evaluateAttempt = useCallback(async (placedCount, erroresActuales, missingParam) => {
    clearInactivityTimer();
    const faltaron = typeof missingParam === 'number' ? missingParam : Math.max(0, currentLevel.target - currentLevel.have);
    const correcto = placedCount === faltaron;
    const intento = { level: levelIndex, correcto, errores: erroresActuales, placed: placedCount, timestamp: Date.now() };
    setAttempts(prev => [...prev, intento]);

    if (correcto) {
      // Al completar un nivel, guardamos progreso recalculando puntos de la actividad
      const puntosGuardados = await guardarProgresoPorClase(erroresActuales);
      // totalPoints ahora refleja el puntaje actual de la actividad (no suma por niveles)
      setTotalPoints(puntosGuardados);

      //Puntos de la actividad: ${puntosGuardados} / ${DEFAULT_MAX_POINTS}.
      const msg = `¡Perfecto! Nivel ${levelIndex + 1} completado.`;
      try { Speech.speak(msg, { language: 'es' }); } catch (e) { }
      setResultMessage(msg);
      setResultRecommendation('');
      setResultModalVisible(true);

      setTimeout(() => {
        setResultModalVisible(false);
        const next = levelIndex + 1;
        if (next >= levels.length) {
          const finalMsg = `¡Felicidades! Completaste todos los niveles. Puntos finales de la actividad: ${puntosGuardados} / ${DEFAULT_MAX_POINTS}.`;
          try { Speech.speak(finalMsg, { language: 'es' }); } catch (e) { }
          setResultMessage(finalMsg);
          if (puntosGuardados === DEFAULT_MAX_POINTS) {
            setResultRecommendation('¡Excelente trabajo! No cometiste errores en la actividad.');
          } else if (puntosGuardados <= MIN_POINTS) {
            setResultRecommendation('Practica con sesiones cortas para mejorar.');
          } else {
            setResultRecommendation('Buen esfuerzo. Revisa las recomendaciones para mejorar.');
          }
          setResultModalVisible(true);
          setFinishedAll(true);
        } else {
          setLevelIndex(next);
        }
      }, 1200);
    } else {
      const maxAttempts = 3;
      const newAttemptsCount = attempts.filter(a => a.level === levelIndex).length + 1;
      const faltaronAhora = Math.abs(faltaron - placedCount);
      const rec = `Casi. Faltaron ${faltaronAhora}. Quita las manzanas de más si las pusiste y vuelve a intentarlo. Tú puedes lograrlo.`;
      try { Speech.speak(rec, { language: 'es' }); } catch (e) { }
      setMessage(rec);

      if (newAttemptsCount >= maxAttempts) {
        // Al finalizar por intentos, guardamos progreso también
        const puntosGuardados = await guardarProgresoPorClase(erroresActuales);
        setTotalPoints(puntosGuardados);

        const finalMsg = `Nivel ${levelIndex + 1} finalizado con ${erroresActuales} errores. Puntos de la actividad: ${puntosGuardados}.`;
        try { Speech.speak(finalMsg, { language: 'es' }); } catch (e) { }
        setResultMessage(finalMsg);
        setResultRecommendation('Practica con objetos reales en sesiones cortas.');
        setResultModalVisible(true);
        setTimeout(() => {
          setResultModalVisible(false);
          const next = levelIndex + 1;
          if (next >= levels.length) {
            setFinishedAll(true);
            const finalAll = `Terminaste todos los niveles. Puntos finales de la actividad: ${puntosGuardados} / ${DEFAULT_MAX_POINTS}.`;
            setResultMessage(finalAll);
            setResultRecommendation('Sigue practicando.');
            setResultModalVisible(true);
          } else {
            setLevelIndex(next);
          }
        }, 1200);
      } else {
        setTimeout(() => {
          setDraggables(prev => prev.map(d => ({ ...d, visible: true })));
          setTargetFruits([]);
          setErroresNivel(0);
          speakPrompt(currentLevel.have, currentLevel.target);
          resetInactivityTimer();
        }, 600);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelIndex, attempts, currentLevel]);

  // guardar progreso: ahora calcula puntos de la actividad como 10 - erroresAcumulados (mínimo MIN_POINTS)
  // recibe erroresActuales (errores del intento actual) para incluirlos en el acumulado
  const determineCategory = (actividadId) => {
    if (actividadCategoriaParam) return actividadCategoriaParam;
    if (actividadId && /suma|resta|mate|numero|math/i.test(actividadId)) return 'Matemática';
    if (actividadId && /palabra|vocab|liter|letra/i.test(actividadId)) return 'Literatura';
    return 'Matemática';
  };

  const guardarProgresoPorClase = async (erroresActualesParam = erroresNivelRef.current) => {
    try {
      const idParaGuardar = alumnoParam || auth?.currentUser?.uid;
      if (!idParaGuardar) return 0;

      const claseId = claseParam || 'sin-clase';
      const actividadId = actividadParam || `juego1-suma`;
      const categoria = determineCategory(actividadId);

      const alumnoRef = doc(db, 'alumnos', idParaGuardar);
      const alumnoSnap = await getDoc(alumnoRef);
      const alumnoData = alumnoSnap.exists() ? alumnoSnap.data() : {};

      // progresoPorClase actual (o vacío)
      const progresoPorClase = alumnoData.progresoPorClase || {};
      const progresoClasePrev = progresoPorClase[claseId] || { actividades: {}, resumen: {} };
      const actividadPrev = progresoClasePrev.actividades?.[actividadId] || {};

      // preparar nuevo intento (errores del intento actual)
      const fechaHoy = new Date().toISOString().split('T')[0];
      const nuevoIntento = {
        puntos: 0, // aquí guardamos puntos por intento si lo deseas; dejamos 0 porque el puntaje final depende del acumulado de errores
        errores: Number(erroresActualesParam || 0),
        fecha: fechaHoy,
        nivel: levelIndex + 1,
        ejerciciosCompletados: TOTAL_EJERCICIOS,
      };

      // conservar intentos previos y añadir el nuevo
      const intentosPrev = Array.isArray(actividadPrev.intentos) ? actividadPrev.intentos : [];
      const intentosActualizados = [...intentosPrev, nuevoIntento];

      // calcular errores acumulados de la actividad (sumar errores de intentos previos + el actual)
      const erroresAcumulados = intentosActualizados.reduce((s, it) => s + (Number(it.errores || 0)), 0);

      // calcular puntos de la actividad: 10 - erroresAcumulados, pero no bajar de MIN_POINTS
      let puntosCalculados = DEFAULT_MAX_POINTS - erroresAcumulados;
      if (puntosCalculados < MIN_POINTS) puntosCalculados = MIN_POINTS;
      if (puntosCalculados > DEFAULT_MAX_POINTS) puntosCalculados = DEFAULT_MAX_POINTS;

      // construir la actividad actualizada: puntos = puntosCalculados (valor acumulado de la actividad)
      const actividadNueva = {
        ...(actividadPrev || {}),
        puntos: puntosCalculados,
        errores: erroresAcumulados,
        categoria,
        nombre: actividadPrev?.nombre || actividadId,
        ultimaActualizacion: fechaHoy,
        intentos: intentosActualizados,
        maxPoints: actividadPrev?.maxPoints || DEFAULT_MAX_POINTS,
      };

      // actualizar actividades del progreso de la clase
      const actividadesActualizadas = {
        ...(progresoClasePrev.actividades || {}),
        [actividadId]: actividadNueva,
      };

      // recalcular resumen de la clase (usar puntos acumulados por actividad)
      const resumen = Object.values(actividadesActualizadas).reduce(
        (acc, act) => {
          return {
            puntosTotales: acc.puntosTotales + (Number(act.puntos || 0)),
            erroresTotales: acc.erroresTotales + (Number(act.errores || 0)),
          };
        },
        { puntosTotales: 0, erroresTotales: 0 }
      );
      resumen.ultimaActualizacion = new Date().toISOString();

      const progresoClaseNuevo = { actividades: actividadesActualizadas, resumen };
      const progresoPorClaseNuevo = { ...progresoPorClase, [claseId]: progresoClaseNuevo };

      // Guardar SOLO en progresoPorClase (merge para no borrar otros campos)
      await setDoc(alumnoRef, { progresoPorClase: progresoPorClaseNuevo }, { merge: true });

      // devolver puntos calculados para que el llamador actualice UI
      return puntosCalculados;
    } catch (e) {
      console.error('Error al guardar progreso por clase:', e);
      return 0;
    }
  };

  // speak prompt
  const speakPrompt = (haveNum, totalNum) => {
    const text = `Tengo ${haveNum} manzanas y necesito ${totalNum}. ¿Cuántas faltan?`;
    try { Speech.speak(text, { language: 'es' }); } catch (e) { }
    setMessage(text);
  };

  // DraggableFruit: añade y evalúa inmediatamente usando refs
  const DraggableFruit = ({ item }) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const lockedRef = useRef(false);
    const lastDropRef = useRef(0);

    const resetPosition = (lock = false) => {
      if (lock) {
        lockedRef.current = true;
        setDraggables(prev => prev.map(d => (d.id === item.id ? { ...d, visible: false } : d)));
      } else {
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      }
    };

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => !lockedRef.current && !finishedAll,
        onPanResponderGrant: () => {
          try {
            const ox = typeof pan.x.__getValue === 'function' ? pan.x.__getValue() : 0;
            const oy = typeof pan.y.__getValue === 'function' ? pan.y.__getValue() : 0;
            pan.setOffset({ x: ox, y: oy });
          } catch (e) {
            pan.setOffset({ x: 0, y: 0 });
          }
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
        onPanResponderRelease: (e, gesture) => {
          pan.flattenOffset();
          playTapSound();

          const now = Date.now();
          if (now - lastDropRef.current < 250) return;
          lastDropRef.current = now;

          const gestureCoords = { moveX: gesture.moveX, moveY: gesture.moveY };
          const layout = targetLayoutRef.current;

          if (layout && gestureCoords.moveX >= layout.x && gestureCoords.moveX <= layout.x + layout.width && gestureCoords.moveY >= layout.y && gestureCoords.moveY <= layout.y + layout.height) {
            // añadir solo si no existe
            setTargetFruits(prev => {
              if (prev.some(f => f.id === item.id)) return prev;
              // bloquear y añadir
              resetPosition(true);
              const newArr = [...prev, { id: item.id, value: item.value ?? 1 }];
              // actualizar ref inmediatamente
              targetFruitsRef.current = newArr;
              // calcular suma actual
              const sumPlaced = currentLevel.have + newArr.reduce((s, f) => s + (f.value ?? 1), 0);
              if (sumPlaced > currentLevel.target) {
                setErroresNivel(prevErr => {
                  const next = prevErr + 1;
                  erroresNivelRef.current = next;
                  return next;
                });
                const exceso = sumPlaced - currentLevel.target;
                const msg = `Has puesto ${exceso} manzana(s) de más. Quita las de más y cuenta otra vez. Tú puedes lograrlo.`;
                try { Speech.speak(msg, { language: 'es' }); } catch (e) { }
                setMessage(msg);
              } else if (sumPlaced === currentLevel.target) {
                // evaluar inmediatamente con missingParam
                evaluateAttempt(newArr.length, erroresNivelRef.current, currentLevel.target - currentLevel.have);
              } else {
                resetInactivityTimer();
              }
              return newArr;
            });
          } else {
            setErroresNivel(prev => {
              const next = prev + 1;
              erroresNivelRef.current = next;
              return next;
            });
            const msg = 'Ups, esa fruta quedó fuera. Intenta de nuevo.';
            try { Speech.speak(msg, { language: 'es' }); } catch (e) { }
            setMessage(msg);
            resetPosition(false);
            resetInactivityTimer();
          }
        },
      })
    ).current;

    if (!item.visible) return null;

    return (
      <Animated.View {...panResponder.panHandlers} style={[styles.fruit, { transform: pan.getTranslateTransform() }]}>
        <Image source={imagenManzana} style={{ width: 48, height: 48 }} resizeMode="contain" />
      </Animated.View>
    );
  };

  // devolver manzana tocándola en target
  const handleRemoveFromTarget = (fruitId) => {
    setTargetFruits(prev => {
      if (!prev.some(f => f.id === fruitId)) return prev;
      const newTarget = prev.filter(f => f.id !== fruitId);
      targetFruitsRef.current = newTarget;
      setDraggables(prevD => prevD.map(d => (d.id === fruitId ? { ...d, visible: true } : d)));
      const msg = 'Has quitado una manzana. Cuenta otra vez y continúa.';
      try { Speech.speak(msg, { language: 'es' }); } catch (e) { }
      setMessage(msg);
      resetInactivityTimer();
      return newTarget;
    });
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nivel {levelIndex + 1} de {levels.length}</Text>
      <Text style={styles.prompt}>{message}</Text>

      <View
        ref={targetRef}
        style={styles.targetBox}
        onLayout={() => {
          setTimeout(() => measureTarget(), 120);
        }}
      >
        <Text style={styles.targetText}>Zona objetivo</Text>

        <View style={styles.targetFruitsRow}>
          {Array.from({ length: currentLevel.have }).map((_, i) => (
            <Image key={`have-${i}`} source={imagenManzana} style={styles.smallApple} />
          ))}
          {targetFruits.map((f) => (
            <TouchableOpacity key={f.id} onPress={() => handleRemoveFromTarget(f.id)}>
              <Image source={imagenManzana} style={styles.smallApple} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.counterText}>
          {currentLevel.have + targetFruits.reduce((s, x) => s + (x.value ?? 1), 0)} / {currentLevel.target}
        </Text>
        <Text style={styles.infoText}>Errores nivel: {erroresNivel}</Text>
        <Text style={[styles.infoText, { marginTop: 6 }]}>Puntos actividad: {totalPoints} / {DEFAULT_MAX_POINTS}</Text>
      </View>

      <View style={styles.bandeja}>
        {draggables.map(d => (
          <DraggableFruit key={d.id} item={d} />
        ))}
      </View>

      <Modal visible={resultModalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setResultModalVisible(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{resultMessage}</Text>
            {resultRecommendation ? <Text style={styles.modalRec}>{resultRecommendation}</Text> : null}
            <Text style={styles.modalHint}>Toca para cerrar</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#99E7D9',
    alignItems: 'center'
  },
  title: {
    fontSize: 22,
    marginBottom: 8,
    fontFamily: 'Kavoon_400Regular'
  },
  prompt: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'CenturyGothicBold',
  },
  targetBox: {
    width: '92%',
    height: 220,
    borderWidth: 3,
    borderColor: '#34B0A6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginBottom: 16,
    paddingVertical: 8,
  },
  targetText: {
    fontFamily: "CenturyGothicBold",
    fontSize: 16,
  },
  targetFruitsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  smallApple: { width: 44, height: 44, margin: 6 },
  counterText: { fontSize: 18, fontWeight: '800', marginTop: 6, color: '#333' },
  infoText: {
    fontFamily: 'CenturyGothicBold',
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  bandeja: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: '100%', minHeight: 140, paddingTop: 8 },
  fruit: {
    width: 64,
    height: 64,
    margin: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#eee',
    elevation: 3,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12, padding: 18,
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8
  },
  modalRec: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    marginBottom: 8
  },
  modalHint: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'CenturyGothic'
  },
});
