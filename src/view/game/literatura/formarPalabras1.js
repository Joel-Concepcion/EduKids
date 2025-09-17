<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Speech from 'expo-speech';

const palabrasNivel1 = ['sol', 'casa', 'gato', 'luna', 'mesa', 'papa'];

export default function JuegoPalabras() {
  const [indice, setIndice] = useState(0);
  const [palabraActual, setPalabraActual] = useState(palabrasNivel1[indice]);
  const [letrasSeleccionadas, setLetrasSeleccionadas] = useState([]);
  const [letrasDisponibles, setLetrasDisponibles] = useState([]);

  useEffect(() => {
    const letras = palabraActual.split('');
    const mezcladas = [...letras].sort(() => Math.random() - 0.5);
    setLetrasDisponibles(mezcladas);
    setLetrasSeleccionadas([]);
  }, [palabraActual]);

  useEffect(() => {
    if (letrasSeleccionadas.length === palabraActual.length) {
      const formada = letrasSeleccionadas.join('');
      if (formada === palabraActual) {
        Speech.speak(formada, { language: 'es' });
        Alert.alert('¡Correcto!', `Formaste la palabra "${formada}"`);
        setTimeout(() => {
          if (indice + 1 < palabrasNivel1.length) {
            setIndice(indice + 1);
            setPalabraActual(palabrasNivel1[indice + 1]);
          } else {
            Alert.alert('¡Juego completado!', 'Has formado todas las palabras 🎉');
            setIndice(0);
            setPalabraActual(palabrasNivel1[0]);
          }
        }, 1000);
      } else {
        Alert.alert('Ups...', 'La palabra no es correcta');
        setTimeout(() => {
          const letras = palabraActual.split('').sort(() => Math.random() - 0.5);
          setLetrasDisponibles(letras);
          setLetrasSeleccionadas([]);
        }, 1000);
      }
    }
  }, [letrasSeleccionadas]);

  const seleccionarLetra = (letra, index) => {
    setLetrasSeleccionadas([...letrasSeleccionadas, letra]);
    const nuevasDisponibles = [...letrasDisponibles];
    nuevasDisponibles.splice(index, 1);
    setLetrasDisponibles(nuevasDisponibles);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forma la palabra</Text>
      <Text style={styles.wordPlaceholder}>
        {palabraActual.split('').map((_, i) => letrasSeleccionadas[i] || '_').join(' ')}
      </Text>
      <View style={styles.lettersContainer}>
        {letrasDisponibles.map((letra, index) => (
          <TouchableOpacity key={index} style={styles.letterCard} onPress={() => seleccionarLetra(letra, index)}>
            <Text style={styles.letterText}>{letra}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fffde7' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  wordPlaceholder: { fontSize: 32, letterSpacing: 10, marginBottom: 30 },
  lettersContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  letterCard: {
    backgroundColor: '#ffe0b2',
    padding: 15,
    margin: 8,
    borderRadius: 10,
    elevation: 2,
  },
  letterText: { fontSize: 24, fontWeight: 'bold' },
});
=======
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Speech from 'expo-speech';

const palabrasNivel1 = ['sol', 'casa', 'gato', 'luna', 'mesa', 'papa'];

export default function JuegoPalabras() {
  const [indice, setIndice] = useState(0);
  const [palabraActual, setPalabraActual] = useState(palabrasNivel1[indice]);
  const [letrasSeleccionadas, setLetrasSeleccionadas] = useState([]);
  const [letrasDisponibles, setLetrasDisponibles] = useState([]);

  useEffect(() => {
    const letras = palabraActual.split('');
    const mezcladas = [...letras].sort(() => Math.random() - 0.5);
    setLetrasDisponibles(mezcladas);
    setLetrasSeleccionadas([]);
  }, [palabraActual]);

  useEffect(() => {
    if (letrasSeleccionadas.length === palabraActual.length) {
      const formada = letrasSeleccionadas.join('');
      if (formada === palabraActual) {
        Speech.speak(formada, { language: 'es' });
        Alert.alert('¡Correcto!', `Formaste la palabra "${formada}"`);
        setTimeout(() => {
          if (indice + 1 < palabrasNivel1.length) {
            setIndice(indice + 1);
            setPalabraActual(palabrasNivel1[indice + 1]);
          } else {
            Alert.alert('¡Juego completado!', 'Has formado todas las palabras 🎉');
            setIndice(0);
            setPalabraActual(palabrasNivel1[0]);
          }
        }, 1000);
      } else {
        Alert.alert('Ups...', 'La palabra no es correcta');
        setTimeout(() => {
          const letras = palabraActual.split('').sort(() => Math.random() - 0.5);
          setLetrasDisponibles(letras);
          setLetrasSeleccionadas([]);
        }, 1000);
      }
    }
  }, [letrasSeleccionadas]);

  const seleccionarLetra = (letra, index) => {
    setLetrasSeleccionadas([...letrasSeleccionadas, letra]);
    const nuevasDisponibles = [...letrasDisponibles];
    nuevasDisponibles.splice(index, 1);
    setLetrasDisponibles(nuevasDisponibles);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forma la palabra</Text>
      <Text style={styles.wordPlaceholder}>
        {palabraActual.split('').map((_, i) => letrasSeleccionadas[i] || '_').join(' ')}
      </Text>
      <View style={styles.lettersContainer}>
        {letrasDisponibles.map((letra, index) => (
          <TouchableOpacity key={index} style={styles.letterCard} onPress={() => seleccionarLetra(letra, index)}>
            <Text style={styles.letterText}>{letra}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fffde7' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  wordPlaceholder: { fontSize: 32, letterSpacing: 10, marginBottom: 30 },
  lettersContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  letterCard: {
    backgroundColor: '#ffe0b2',
    padding: 15,
    margin: 8,
    borderRadius: 10,
    elevation: 2,
  },
  letterText: { fontSize: 24, fontWeight: 'bold' },
});
>>>>>>> aa7fdea9ccdd11c1ecf50ed782443ac1a0751b03
