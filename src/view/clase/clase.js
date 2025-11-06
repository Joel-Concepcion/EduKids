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

  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    fetchFonts().then(() => setFontsLoaded(true));
  }, []);

  if (!fontsLoaded || !clase) return null;

  return (
    <View style={styles.container}>
      {/* Encabezado con imagen y nombre del docente */}
      <View style={styles.header}>
        <Image style={styles.imM} source={require('../../assets/maestra.jpg')} />
        <Text style={[styles.tex, styles.font]}>
          Profe: {clase.docenteNombre || clase.docenteId || 'Sin nombre'}
        </Text>
      </View>

      {/* Código único de la clase */}
      <Text style={[styles.tex1, styles.font]}>
        Código: {clase.codigoClase || clase.id}
      </Text>

      {/* Actividades asignadas */}
      <Text style={[styles.font, { marginTop: 20, fontSize: 18 }]}>Actividades asignadas:</Text>
      <ScrollView
        style={{
          width: Dimensions.get('window').width - 15,
          right: 12,
        }}
      >
        {clase.actividades && clase.actividades.length > 0 ? (
          clase.actividades.map((actividad, index) => (
            <TouchableOpacity
              key={index}
              style={styles.imaj}
              onPress={() => navigation.navigate(actividad)}
            >
              <Image
                style={styles.ima}
                source={require('../../assets/bannerActi/Rectangle 26.png')}
              />
              <Text style={styles.actividadTexto}>{actividad}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={[styles.font, { marginTop: 10 }]}>
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
    fontSize: 20,
    top: 10,
    marginBottom: 5,
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
