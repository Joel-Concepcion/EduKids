import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';
import appFirebase from '../../../model/db';

const db = getFirestore(appFirebase);
const auth = getAuth();

export default function ListaActividades() {
  const navigation = useNavigation();
  const [mostrarBotones, setMostrarBotones] = useState(false);
  const [mostrarClases, setMostrarClases] = useState(false);
  const [actividadSeleccionada, setActividadSeleccionada] = useState('Juego de Sumas');
  const [clases, setClases] = useState([]);

  useEffect(() => {
    const cargarClases = async () => {
      try {
        const usuario = auth.currentUser;
        if (!usuario) {
          console.warn('Usuario no autenticado');
          return;
        }

        const clasesRef = collection(db, 'clases');
        const consulta = query(clasesRef, where('docenteId', '==', usuario.uid));
        const resultado = await getDocs(consulta);

        const clasesBD = resultado.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          actividades: doc.data().actividades || [],
        }));

        setClases(clasesBD);
      } catch (error) {
        console.error('Error al cargar clases:', error);
      }
    };

    cargarClases();
  }, []);

  const handleImagenPress = () => {
    setMostrarBotones(!mostrarBotones);
    setMostrarClases(false);
  };

  const handleAgregarActividad = () => {
    setMostrarClases(true);
  };

  const handleSeleccionClase = async (claseId) => {
    try {
      const clase = clases.find(c => c.id === claseId);
      if (!clase) return;

      const nuevasActividades = [...clase.actividades, actividadSeleccionada];

      await updateDoc(doc(db, 'clases', claseId), {
        actividades: nuevasActividades,
      });

      setClases(prev =>
        prev.map(c =>
          c.id === claseId ? { ...c, actividades: nuevasActividades } : c
        )
      );

      Alert.alert('Actividad asignada', `Se agregó a la clase ${clase.nombreClase || clase.nombre}`);
      setMostrarClases(false);

      navigation.navigate('Clase', { clase: { ...clase, actividades: nuevasActividades } });
    } catch (error) {
      console.error('Error al asignar actividad:', error);
      Alert.alert('Error', 'No se pudo asignar la actividad.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.tou} onPress={handleImagenPress}>
        <Image source={require('../../../assets/bannerActi/Rectangle 26.png')} />
      </TouchableOpacity>

      {mostrarBotones && (
        <View style={styles.botones}>
          <TouchableOpacity style={styles.boton} onPress={handleAgregarActividad}>
            <Text style={styles.textto}>Agregar actividad</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.boton}
            onPress={() => navigation.navigate(actividadSeleccionada)}
          >
            <Text style={styles.textto}>Probar actividad</Text>
          </TouchableOpacity>
        </View>
      )}

      {mostrarClases && (
        <FlatList
          data={clases}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.claseItem}
              onPress={() => handleSeleccionClase(item.id)}
            >
              <Text>{item.nombreClase || item.nombre}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  tou: {
    alignItems: 'center',
    marginBottom: 20,
  },
  botones: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  boton: {
    padding: 10,
    backgroundColor: '#34B0A6',
    borderRadius: 5,
  },
  claseItem: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    marginVertical: 5,
    borderRadius: 5,
  },
  textto: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
