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

// Mapa de metadatos para actividades
const ACTIVIDAD_META = {
  'Formas': { 
    id: 'figuras-formas', 
    nombre: 'Formas', 
    categoria: 'Figuras', 
    bannerKey: 'figuras-formas',
    imagen: require('../../../assets/game/figurasFormas/forma.png'),
    screen: 'Formas'
  },
  'Juego de abecedario': { 
    id: 'vocabulario-memoria', 
    nombre: 'Vocabulario Memoria', 
    categoria: 'Literatura', 
    bannerKey: 'vocabulario-memoria',
    imagen: require('../../../assets/game/literatura/bannerABC.png'),
    screen: 'Juego de abecedario'
  },
};

export default function ListaActividades() {
  const navigation = useNavigation();
  const [actividadSeleccionadaId, setActividadSeleccionadaId] = useState(null);
  const [mostrarClases, setMostrarClases] = useState(false);
  const [clases, setClases] = useState([]);

  // Lista de actividades disponibles
  const actividades = [
    ACTIVIDAD_META['Formas'],
    ACTIVIDAD_META['Juego de abecedario']
  ];

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

  const handleImagenPress = (actividadId) => {
    // Si la actividad ya está seleccionada, la deseleccionamos
    if (actividadSeleccionadaId === actividadId) {
      setActividadSeleccionadaId(null);
    } else {
      // Si no, seleccionamos la nueva actividad
      setActividadSeleccionadaId(actividadId);
    }
    setMostrarClases(false);
  };

  const handleAgregarActividad = () => {
    if (!actividadSeleccionadaId) {
      Alert.alert('Error', 'Por favor selecciona una actividad primero');
      return;
    }
    setMostrarClases(true);
  };

  const handleProbarActividad = () => {
    if (!actividadSeleccionadaId) {
      Alert.alert('Error', 'Por favor selecciona una actividad primero');
      return;
    }
    
    const actividad = actividades.find(a => a.id === actividadSeleccionadaId);
    if (actividad && actividad.screen) {
      navigation.navigate(actividad.screen);
    } else {
      Alert.alert('Error', 'No se puede probar esta actividad');
    }
  };

  const handleSeleccionClase = async (claseId) => {
    try {
      if (!actividadSeleccionadaId) {
        Alert.alert('Error', 'No hay actividad seleccionada');
        return;
      }

      const actividad = actividades.find(a => a.id === actividadSeleccionadaId);
      const clase = clases.find(c => c.id === claseId);
      
      if (!actividad || !clase) return;

      // Verificar si la actividad ya está asignada
      const yaEsta = (clase.actividades || []).some(act => {
        if (typeof act === 'string') {
          return act === actividad.nombre;
        }
        return act.id === actividad.id;
      });

      if (yaEsta) {
        Alert.alert('Ya existe', 'La actividad ya está asignada a esta clase.');
        return;
      }

      // Agregar la actividad a la clase
      const nuevasActividades = [...(clase.actividades || []), actividad];

      await updateDoc(doc(db, 'clases', claseId), {
        actividades: nuevasActividades,
      });

      // Actualizar el estado local
      setClases(prev =>
        prev.map(c =>
          c.id === claseId ? { ...c, actividades: nuevasActividades } : c
        )
      );

      Alert.alert(
        'Actividad asignada', 
        `Se agregó "${actividad.nombre}" a la clase ${clase.nombreClase || clase.nombre}`
      );
      
      setMostrarClases(false);
      setActividadSeleccionadaId(null);

    } catch (error) {
      console.error('Error al asignar actividad:', error);
      Alert.alert('Error', 'No se pudo asignar la actividad.');
    }
  };

  // Obtener la actividad seleccionada completa
  const getActividadSeleccionada = () => {
    return actividades.find(a => a.id === actividadSeleccionadaId);
  };

  // Componente individual para cada actividad
  const ActividadItem = ({ actividad }) => {
    const isSelected = actividadSeleccionadaId === actividad.id;
    
    return (
      <View style={styles.actividadContainer}>
        <TouchableOpacity 
          style={[
            styles.tou,
            isSelected && styles.actividadSeleccionada
          ]} 
          onPress={() => handleImagenPress(actividad.id)}
        >
          <Image style={styles.Image} source={actividad.imagen} />
        </TouchableOpacity>
        
        {/* Botones que solo se muestran para la actividad seleccionada */}
        {isSelected && (
          <View style={styles.botones}>
            <TouchableOpacity style={styles.boton} onPress={handleAgregarActividad}>
              <Text style={styles.textto}>Agregar actividad</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.boton} onPress={handleProbarActividad}>
              <Text style={styles.textto}>Probar actividad</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Lista actividades figuras y formas</Text>
      
      {/* Lista de actividades */}
      <FlatList
        data={actividades}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ActividadItem actividad={item} />
        )}
        contentContainerStyle={styles.listaContainer}
        extraData={actividadSeleccionadaId}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal para seleccionar clase */}
      <Modal visible={mostrarClases} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setMostrarClases(false)}
            >
              <Text style={styles.closeButtonText}>❌</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>
              Agregar "{getActividadSeleccionada()?.nombre}" a:
            </Text>
            
            {clases.length === 0 ? (
              <Text style={styles.sinClases}>No tienes clases creadas</Text>
            ) : (
              <FlatList
                data={clases}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.claseItem}
                    onPress={() => handleSeleccionClase(item.id)}
                  >
                    <Text style={styles.claseText}>
                      {item.nombreClase || item.nombre}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
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
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    //color: '#333',
  },
  listaContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  actividadContainer: {
    marginBottom: 10,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 10,
    //shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
  },
  tou: {
    alignItems: 'center',
    borderRadius: 15,
    overflow: 'hidden',
  },
  actividadSeleccionada: {
    borderWidth: 3,
    borderColor: '#34B0A6',
  },
  botones: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingHorizontal: 10,
  },
  boton: {
    padding: 12,
    backgroundColor: '#34B0A6',
    borderRadius: 8,
    minWidth: 140,
    alignItems: 'center',
  },
  textto: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  Image: {
    width: '100%',
    height: 150,
    borderRadius: 15,
    resizeMode: 'cover',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000aa',
  },
  modalContent: {
    backgroundColor: '#99E7D9',
    padding: 20,
    borderRadius: 15,
    width: '90%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  claseItem: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    marginVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claseText: {
    fontSize: 16,
    fontWeight: '500',
  },
  sinClases: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginVertical: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  closeButtonText: {
    fontSize: 20,
  },
});