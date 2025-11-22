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
  Modal,
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

// Mapa de metadatos para actividades (usa este mapping para convertir nombres legacy a objetos)
const ACTIVIDAD_META = {
  'Juego de Palabras': { id: 'juego-palabras', nombre: 'Juego de Palabras', categoria: 'Literatura', bannerKey: 'juego-palabras' },
  'Vocabulario Memoria': { id: 'vocabulario-memoria', nombre: 'Vocabulario Memoria', categoria: 'Literatura', bannerKey: 'vocabulario-memoria' },
  'Suma Básica': { id: 'suma-basica', nombre: 'Suma Básica', categoria: 'Matemática', bannerKey: 'suma-basica' },
  'Resta Básica': { id: 'resta-basica', nombre: 'Resta Básica', categoria: 'Matemática', bannerKey: 'resta-basica' },
  // Añade aquí más mappings según tus actividades reales
};

export default function ListaActividades() {
  const navigation = useNavigation();
  const [mostrarBotones, setMostrarBotones] = useState(false);
  const [mostrarClases, setMostrarClases] = useState(false);

  // Mantengo actividadSeleccionada como string para no romper tu UI existente
  const [actividadSeleccionada, setActividadSeleccionada] = useState('Juego de Palabras');
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

        const clasesBD = resultado.docs.map(docu => ({
          id: docu.id,
          ...docu.data(),
          actividades: docu.data().actividades || [],
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

  // Reemplaza la lógica anterior: convierte el string seleccionado en un objeto antes de guardar
  const handleSeleccionClase = async (claseId) => {
    try {
      const clase = clases.find(c => c.id === claseId);
      if (!clase) return;

      // Convertir actividadSeleccionada (string) a objeto con metadatos si existe mapping
      const actividadObj = ACTIVIDAD_META[actividadSeleccionada] || {
        id: actividadSeleccionada.toLowerCase().replace(/\s+/g, '-'),
        nombre: actividadSeleccionada,
        categoria: 'General',
        bannerKey: null,
      };

      // Evitar duplicados: comparar por id (si actividad en clase ya es objeto) o por string legacy
      const yaEsta = (clase.actividades || []).some(act => {
        if (typeof act === 'string') return act === actividadSeleccionada;
        return act.id === actividadObj.id;
      });

      if (yaEsta) {
        Alert.alert('Ya existe', 'La actividad ya está asignada a esta clase.');
        return;
      }

      const nuevasActividades = [...(clase.actividades || []), actividadObj];

      await updateDoc(doc(db, 'clases', claseId), {
        actividades: nuevasActividades,
      });

      setClases(prev =>
        prev.map(c =>
          c.id === claseId ? { ...c, actividades: nuevasActividades } : c
        )
      );

      Alert.alert('Actividad asignada', `Se agregó "${actividadObj.nombre}" a la clase ${clase.nombreClase || clase.nombre}`);
      setMostrarClases(false);

      // Navegar a la pantalla Clase con datos actualizados
      navigation.navigate('Clase', { clase: { ...clase, actividades: nuevasActividades } });
    } catch (error) {
      console.error('Error al asignar actividad:', error);
      Alert.alert('Error', 'No se pudo asignar la actividad.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.tou} onPress={handleImagenPress}>
        <Image style={styles.Image} source={require('../../../assets/game/literatura/formarP.png')} />
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

      <Modal visible={mostrarClases} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000aa' }}>
          <View style={{ backgroundColor: '#99E7D9', padding: 20, borderRadius: 10, width: '90%', minHeight: '50%', }}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setMostrarClases(false);
              }}
            >
              <Text style={styles.closeButtonText}>❌</Text>
            </TouchableOpacity>
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
          </View>
        </View>
      </Modal>
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
    marginBottom: 10,
    bottom: '25%',
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
    width: Dimensions.get('window').width * 0.8,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
  },
  textto: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  closeButton:{
    left: '90%',
    marginBottom: 15,
  },
  closeButtonText:{
    fontSize: 25,
  },
  Image:{
    width: '100%',
    height:'50%',
    borderRadius: 30,
  }
});
