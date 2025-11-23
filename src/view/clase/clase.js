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
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../model/db';

// Mapa de banners por bannerKey o id de actividad (ajusta rutas require(...) si es necesario)
const ACTIVITY_BANNERS = {
  'juego-palabras': require('../../assets/game/literatura/formarP.png'),
  'vocabulario-memoria': require('../../assets/game/literatura/bannerABC.png'),
  'suma-basica': require('../../assets/bannerActi/Rectangle 26.png'),
  'figuras-formas': require('../../assets/game/figurasFormas/forma.png'),
  default: require('../../assets/bannerActi/Rectangle 27.png'),
};

// Mapa que traduce activity.id (slug) al screen name registrado en tu navigator
// Ajusta los valores para que coincidan exactamente con los nombres de tus Stack.Screen
const ACTIVITY_SCREENS = {
  'juego-palabras': 'Juego de Palabras',
  'vocabulario-memoria': 'Juego de abecedario',
  'suma-basica': 'Juego de Sumas',
  'figuras-formas': 'Formas',
  // añade más mapeos según necesites
};

const fetchFonts = () => {
  return Font.loadAsync({
    'CenturyGothic': require('../../assets/font/3394-font.ttf'),
    'CenturyGothic-Bold': require('../../assets/font/4410-font.ttf'),
  });
};

export default function Clase() {
  const navigation = useNavigation();
  const route = useRoute();
  const { clase } = route.params || {};
  const [docente, setDocente] = useState(null);

  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    fetchFonts().then(() => setFontsLoaded(true));
  }, []);

  useEffect(() => {
    const cargarDocente = async () => {
      if (!clase?.docenteId) return;

      try {
        const docenteRef = doc(db, 'users', clase.docenteId);
        const docenteSnap = await getDoc(docenteRef);

        if (docenteSnap.exists()) {
          setDocente(docenteSnap.data());
        }
      } catch (error) {
        console.error('Error al cargar datos del docente:', error);
      }
    };

    cargarDocente();
  }, [clase]);

  // Devuelve la imagen de banner adecuada según la actividad (objeto o string)
  const getBannerForActivity = (actividad) => {
    if (!actividad) return ACTIVITY_BANNERS.default;

    // Legacy: si actividad es string, mapear por nombre conocido
    if (typeof actividad === 'string') {
      const legacyMap = {
        'Juego de Palabras': 'juego-palabras',
        'Juego de abecedario': 'vocabulario-memoria',
        'Suma Básica': 'suma-basica',
        'Formas': 'figuras-formas',
      };
      const key = legacyMap[actividad] || 'default';
      return ACTIVITY_BANNERS[key] || ACTIVITY_BANNERS.default;
    }

    // Si es objeto, prioriza bannerKey, luego id
    const key = actividad.bannerKey || actividad.id || 'default';
    return ACTIVITY_BANNERS[key] || ACTIVITY_BANNERS.default;
  };

  // Determina la pantalla/route para navegar al tocar una actividad
  const getNavigationTarget = (actividad) => {
    if (!actividad) return null;

    // Si es string legacy, intenta mapear por nombre o devolver el mismo string
    if (typeof actividad === 'string') {
      // si en tu navigator tienes "Juego de Palabras" etc., devolvemos esa cadena
      // en caso contrario, intenta mapear por legacy -> screen (usando ACTIVITY_SCREENS keys)
      const legacyMap = {
        'Juego de Palabras': 'Juego de Palabras',
        'Suma Básica': 'Juego de Sumas',
        'Formas': 'Formas',
        'Juego de abecedario': 'Juego de abecedario',
      };
      return legacyMap[actividad] || actividad;
    }

    // Si es objeto, buscar el screen por actividad.id en ACTIVITY_SCREENS
    const key = actividad.id;
    if (key && ACTIVITY_SCREENS[key]) return ACTIVITY_SCREENS[key];

    // fallback: usar actividad.nombre si coincide con un screen registrado
    return actividad.nombre || null;
  };

  if (!fontsLoaded || !clase) return null;

  return (
    <View style={styles.container}>
      {/* Encabezado con imagen y nombre del docente */}
      <View style={styles.header}>
        <Image style={styles.imM} source={{ uri: docente?.profileImage || 'https://randomuser.me/api/portraits/men/1.jpg' }} />
        <Text style={[styles.tex, styles.font]}>
          {clase.docenteNombre || clase.docenteId || 'Sin nombre'}
        </Text>
      </View>

      {/* Código único de la clase */}
      <Text style={[styles.tex1, styles.font]}>
        {clase.codigoClase || clase.id}
      </Text>

      {/* Actividades asignadas */}
      <Text style={[styles.font, { marginTop: 20, fontSize: 18, left: '5%' }]}>Actividades asignadas:</Text>
      <ScrollView
        style={{
          width: Dimensions.get('window').width - 15,
          right: 12,
          marginTop: 10,
        }}
      >
        {clase.actividades && clase.actividades.length > 0 ? (
          clase.actividades.map((actividad, index) => {
            const nombre = typeof actividad === 'string' ? actividad : actividad.nombre;
            const banner = getBannerForActivity(actividad);
            const target = getNavigationTarget(actividad);

            return (
              <TouchableOpacity
                key={index}
                style={styles.imaj}
                onPress={() => {
                  if (!target) {
                    console.warn('Actividad sin target de navegación:', actividad);
                    return;
                  }

                  // navigation: pasamos actividad completa y claves para guardar progresoPorClase
                  // Si actividad proviene de legacy (string) no tendrá id; los juegos deberán manejar fallback
                  navigation.navigate(target, {
                    actividad,
                    actividadId: typeof actividad === 'string' ? null : actividad.id,
                    claseId: clase.id,
                  });
                }}
              >
                <Image
                  style={styles.ima}
                  source={banner}
                />
                <Text style={styles.actividadTexto}>{nombre}</Text>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={[styles.font, { marginTop: 10, left: '5%' }]}>
            No hay actividades asignadas aún.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  header: {
    marginTop: 30,
    backgroundColor: '#99E7D9',
    width: Dimensions.get('window').width,
    right: 20,
    alignItems: 'center',
    height: 130,
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
    bottom: 50,
    marginBottom: 0,
  },
  tex1: {
    backgroundColor: '#34B0A6',
    width: 190,
    height: 30,
    fontSize: 16,
    top: -60,
    marginBottom: 5,
    left: 180,
    zIndex: 10,
    borderRadius: 10,
    textAlign: 'center',
    color: '#fff',
    paddingTop: 3,
  },
  imaj: {
    marginTop: 10,
    width: Dimensions.get('window').width,
    height: 185,
    borderRadius: 40,
    justifyContent: 'flex-end',
  },
  ima: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  actividadTexto: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'CenturyGothic-Bold',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  imM: {
    left: 30,
    width: 80,
    height: 80,
    borderRadius: 50,
    marginTop: 40,
  },
});
