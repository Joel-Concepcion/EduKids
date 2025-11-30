import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { auth, db } from '../../../model/db';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFonts, Kavoon_400Regular } from 'expo-font';

// Imágenes asociadas a la letra A (verifica rutas y nombres)
const imagenes = {
  Ave: require('../../../assets/game/literatura/Ave.png'),
  Avión: require('../../../assets/game/literatura/Avion.png'),
  Abeja: require('../../../assets/game/literatura/abeja.png'),
  Ardilla: require('../../../assets/game/literatura/ardilla.png'),
};

const CATEGORY_MAP = { 'juego-letra-a': 'Literatura' };

export default function JuegoLetraA({ route, navigation }) {
  const [fontsLoaded] = useFonts({
    CenturyGothic: require('../../../assets/font/3394-font.ttf'),
    CenturyGothicBold: require('../../../assets/font/4410-font.ttf'),
    Kavoon_400Regular,
  });
  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  // route.params expected: { alumnoId?, claseId?, actividadId?, actividadCategoria? }
  const {
    alumnoId: alumnoParam,
    claseId: claseParam,
    actividadId: actividadParam,
    actividadCategoria: actividadCategoriaParam,
  } = route?.params || {};

  const [backgroundMusic, setBackgroundMusic] = useState(null);
  const [clickSound, setClickSound] = useState(null);

  // Puntaje de actividad (máximo 10)
  const [puntos, setPuntos] = useState(10);
  const [errores, setErrores] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  const claves = Object.keys(imagenes); // ['Ave','Avión','Abeja','Ardilla']
  const [presionadas, setPresionadas] = useState(() =>
    claves.reduce((acc, k) => ({ ...acc, [k]: false }), {})
  );

  // Música de fondo y mensaje de bienvenida
  useEffect(() => {
    let music;
    const loadMusic = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('../../../assets/sound/musicaA.mp3'),
        { shouldPlay: true, isLooping: true }
      );
      setBackgroundMusic(sound);
      music = sound;
    };
    loadMusic();

    Speech.speak(
      'Bienvenido, vamos a conocer la letra A. Presiona cualquier imagen para saber su pronunciación.',
      { language: 'es' }
    );

    return () => {
      try {
        Speech.stop();
        if (music) {
          music.stopAsync();
          music.unloadAsync();
        }
        if (clickSound) {
          clickSound.unloadAsync();
        }
      } catch (e) {
        console.log('Error al detener música:', e);
      }
    };
  }, []);

  // Sonido de clic
  const playClickSound = async () => {
    if (!clickSound) {
      const { sound } = await Audio.Sound.createAsync(
        require('../../../assets/sound/tapp.mp3')
      );
      setClickSound(sound);
      await sound.replayAsync();
    } else {
      await clickSound.replayAsync();
    }
  };

  // Guardado de progreso (intentos y resumen) con puntaje final
  const guardarProgreso = async () => {
    try {
      const idParaGuardar = alumnoParam || auth?.currentUser?.uid;
      if (!idParaGuardar || !claseParam) {
        console.log('alumnoId o claseId no definidos; no se guarda progreso.');
        return;
      }

      const claseId = claseParam || 'sin-clase';
      const actividadId = actividadParam || 'juego-letra-a';
      const categoria = actividadCategoriaParam || CATEGORY_MAP[actividadId] || 'Literatura';

      const alumnoRef = doc(db, 'alumnos', idParaGuardar);
      const alumnoSnap = await getDoc(alumnoRef);
      const alumnoData = alumnoSnap.exists() ? alumnoSnap.data() : {};

      const progresoPorClase = alumnoData.progresoPorClase || {};
      const progresoClasePrev = progresoPorClase[claseId] || { actividades: {}, resumen: {} };
      const actividadPrev = progresoClasePrev.actividades?.[actividadId];

      // intento con puntaje final (10 - errores) si quieres penalizar; aquí usamos puntos actuales
      const fechaHoy = new Date().toISOString().split('T')[0];
      const nuevoIntento = {
        puntos: Math.max(0, Math.min(10, puntos)) || 0,
        errores: errores || 0,
        fecha: fechaHoy,
      };

      const intentosPrev = Array.isArray(actividadPrev?.intentos) ? actividadPrev.intentos : [];
      const actividadNueva = {
        ...(actividadPrev || {}),
        puntos: nuevoIntento.puntos,
        errores: nuevoIntento.errores,
        categoria,
        nombre: actividadPrev?.nombre || 'Juego Letra A',
        ultimaActualizacion: fechaHoy,
        intentos: [...intentosPrev, nuevoIntento],
      };

      const actividadesActualizadas = {
        ...(progresoClasePrev.actividades || {}),
        [actividadId]: actividadNueva,
      };

      const resumen = Object.values(actividadesActualizadas).reduce(
        (acc, act) => {
          const last = Array.isArray(act.intentos) ? act.intentos[act.intentos.length - 1] : {};
          return {
            puntosTotales: acc.puntosTotales + (last?.puntos || 0),
            erroresTotales: acc.erroresTotales + (last?.errores || 0),
          };
        },
        { puntosTotales: 0, erroresTotales: 0 }
      );
      resumen.ultimaActualizacion = new Date().toISOString();

      const progresoClaseNuevo = { actividades: actividadesActualizadas, resumen };
      const progresoPorClaseNuevo = { ...progresoPorClase, [claseId]: progresoClaseNuevo };

      await setDoc(alumnoRef, { progresoPorClase: progresoPorClaseNuevo }, { merge: true });

      console.log('Progreso guardado:', {
        alumnoId: idParaGuardar, claseId, actividadId, puntos: nuevoIntento.puntos, errores,
      });
    } catch (error) {
      console.error('Error guardando progreso:', error);
    }
  };

  // Manejo de clic: pronuncia, marca presionada y detecta finalización
  const handlePress = async (palabraKey) => {
    try {
      await playClickSound();
      Speech.speak(`A, ${palabraKey}`, { language: 'es' });

      setPresionadas((prev) => {
        // evitar restar puntos si vuelve a presionar la misma imagen
        if (prev[palabraKey]) return prev;

        const next = { ...prev, [palabraKey]: true };
        const todasCompletas = Object.values(next).every(Boolean);

        if (todasCompletas) {
          setTimeout(() => {
            Speech.speak('¡Excelente! Completaste toda la actividad de la letra A.', { language: 'es' });
            setModalVisible(true);
            guardarProgreso();
          }, 400);
        }
        return next;
      });
    } catch (e) {
      console.log('Error al manejar clic:', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Bienvenido, vamos a conocer la letra: A</Text>
      <Text style={styles.subtitulo}>Presiona cualquier imagen para saber su pronunciación</Text>

      <View style={styles.grid}>
        {claves.map((key) => (
          <TouchableOpacity key={key} onPress={() => handlePress(key)} style={styles.image1}>
            <Image source={imagenes[key]} style={styles.imagen} />
            <Text style={styles.texto}>{key.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¡Actividad completada!</Text>
            <Text style={styles.modalText}>Puntos obtenidos: {Math.max(0, Math.min(10, puntos))} / 10</Text>
            <Text style={styles.modalText}>Errores: {errores}</Text>
            <Text style={styles.modalText}>
              ¡Muy bien! Sigue practicando para perfeccionar tu pronunciación y atención.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.bt12}
                onPress={() => {
                  // Reiniciar actividad completa con 10 puntos
                  setPresionadas(claves.reduce((acc, k) => ({ ...acc, [k]: false }), {}));
                  setPuntos(10);
                  setErrores(0);
                  setModalVisible(false);
                  Speech.speak('Volvamos a practicar la letra A.', { language: 'es' });
                }}
              >
                <Text style={styles.btText}>Repetir</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bt12}
                onPress={async () => {
                  setModalVisible(false);
                  try {
                    if (backgroundMusic) {
                      await backgroundMusic.stopAsync();
                      await backgroundMusic.unloadAsync();
                    }
                  } catch (e) {
                    console.log('Error al detener música:', e);
                  }
                  navigation?.goBack?.();
                }}
              >
                <Text style={styles.btText}>Salir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#99E7D9', alignItems: 'center', padding: 20 },
  titulo: { fontSize: 18, marginBottom: 10, fontFamily: 'Kavoon_400Regular', color: '#000000ff' },
  subtitulo: { fontSize: 16, marginBottom: 20, fontFamily: 'CenturyGothicBold', color: '#000000ff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  imagen: { width: 130, height: 130, margin: 10 },
  texto: { textAlign: 'center', marginTop: 5, fontSize: 14, color: '#333' },
  image1: { height: 200 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '85%', alignItems: 'center', elevation: 6 },
  modalTitle: { fontSize: 22, marginBottom: 15, color: '#333', textAlign: 'center', fontFamily: 'Kavoon_400Regular' },
  modalText: { fontSize: 16, marginBottom: 10, color: '#555', textAlign: 'center', fontFamily: 'CenturyGothicBold' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20, width: '100%' },
  bt12: { backgroundColor: '#34B0A6', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginHorizontal: 10, alignItems: 'center' },
  btText: { color: '#fff', fontWeight: 'bold', fontFamily: 'CenturyGothicBold' },
});
