<<<<<<< HEAD
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';

export default function JuegoFormas() {
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e3f2fd', alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
    formaBase: {
      width: 100,
      height: 100,
      margin: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fff9c4',
      borderWidth: 2,
      borderColor: '#fbc02d',
    },
    formaTexto: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
    circulo: { borderRadius: 50 },
    cuadrado: {},
    rectangulo: { width: 140, height: 80 },
    ovalo: { width: 120, height: 80, borderRadius: 40 },
    triangulo: {
      width: 0,
      height: 0,
      backgroundColor: 'transparent',
      borderLeftWidth: 50,
      borderRightWidth: 50,
      borderBottomWidth: 100,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: '#fff9c4',
      position: 'relative',
    },
    estrella: { borderRadius: 10 }, // puedes reemplazar con SVG si deseas
  });

  const formas = [
    { nombre: 'Círculo', estilo: styles.circulo },
    { nombre: 'Cuadrado', estilo: styles.cuadrado },
    { nombre: 'Rectángulo', estilo: styles.rectangulo },
    { nombre: 'Óvalo', estilo: styles.ovalo },
    { nombre: 'Triángulo', estilo: styles.triangulo },
    { nombre: 'Estrella', estilo: styles.estrella },
  ];

  const decirForma = (nombre) => {
    Speech.speak(nombre, { language: 'es' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Toca una forma</Text>
      <View style={styles.grid}>
        {formas.map((forma, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.formaBase, forma.estilo]}
            onPress={() => decirForma(forma.nombre)}
          >
            <Text style={styles.formaTexto}>{forma.nombre}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
=======
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';

export default function JuegoFormas() {
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e3f2fd', alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
    formaBase: {
      width: 100,
      height: 100,
      margin: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fff9c4',
      borderWidth: 2,
      borderColor: '#fbc02d',
    },
    formaTexto: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
    circulo: { borderRadius: 50 },
    cuadrado: {},
    rectangulo: { width: 140, height: 80 },
    ovalo: { width: 120, height: 80, borderRadius: 40 },
    triangulo: {
      width: 0,
      height: 0,
      backgroundColor: 'transparent',
      borderLeftWidth: 50,
      borderRightWidth: 50,
      borderBottomWidth: 100,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: '#fff9c4',
      position: 'relative',
    },
    estrella: { borderRadius: 10 }, // puedes reemplazar con SVG si deseas
  });

  const formas = [
    { nombre: 'Círculo', estilo: styles.circulo },
    { nombre: 'Cuadrado', estilo: styles.cuadrado },
    { nombre: 'Rectángulo', estilo: styles.rectangulo },
    { nombre: 'Óvalo', estilo: styles.ovalo },
    { nombre: 'Triángulo', estilo: styles.triangulo },
    { nombre: 'Estrella', estilo: styles.estrella },
  ];

  const decirForma = (nombre) => {
    Speech.speak(nombre, { language: 'es' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Toca una forma</Text>
      <View style={styles.grid}>
        {formas.map((forma, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.formaBase, forma.estilo]}
            onPress={() => decirForma(forma.nombre)}
          >
            <Text style={styles.formaTexto}>{forma.nombre}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
>>>>>>> aa7fdea9ccdd11c1ecf50ed782443ac1a0751b03
