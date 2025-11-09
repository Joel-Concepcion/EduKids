import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert
} from 'react-native';
import { auth, db } from '../../model/db';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc
} from 'firebase/firestore';

//Mapa estático de avatares
const avatarMap = {
  'Ellipse 3.png': require('../../assets/avatar/Ellipse 3.png'),
  'Ellipse 4.png': require('../../assets/avatar/Ellipse 4.png'),
  'Ellipse 5.png': require('../../assets/avatar/Ellipse 5.png'),
  'Ellipse 6.png': require('../../assets/avatar/Ellipse 6.png'),
  'Ellipse 7.png': require('../../assets/avatar/Ellipse 7.png'),
  'Ellipse 8.png': require('../../assets/avatar/Ellipse 8.png'),
};

const avatarList = Object.keys(avatarMap);

export default function PerfilAlumno() {
  const [nombreAlumno, setNombreAlumno] = useState('');
  const [avatarSeleccionado, setAvatarSeleccionado] = useState('Ellipse 3.png');
  const [docRefAlumno, setDocRefAlumno] = useState(null);

  useEffect(() => {
    const cargarDatosAlumno = async () => {
      const usuario = auth?.currentUser;
      if (!usuario || !usuario.uid) return;

      try {
        const consulta = query(
          collection(db, 'alumnos'),
          where('uid', '==', usuario.uid)
        );
        const resultado = await getDocs(consulta);

        if (!resultado.empty) {
          const docAlumno = resultado.docs[0];
          const datos = docAlumno.data();
          setNombreAlumno(datos.nombres_apellidos || '');
          setAvatarSeleccionado(datos.avatar || 'Ellipse 3.png');
          setDocRefAlumno(docAlumno.ref);
        }
      } catch (error) {
        console.error('Error al cargar datos del alumno:', error);
      }
    };

    cargarDatosAlumno();
  }, []);

  const actualizarAvatar = async (nuevoAvatar) => {
    try {
      if (!docRefAlumno) return;
      await updateDoc(docRefAlumno, { avatar: nuevoAvatar });
      setAvatarSeleccionado(nuevoAvatar);
      Alert.alert('Perfil actualizado', 'Tu avatar ha sido cambiado.');
    } catch (error) {
      console.error('Error al actualizar avatar:', error);
      Alert.alert('Error', 'No se pudo actualizar tu avatar.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.nombre, styles.font]}>{nombreAlumno}</Text>

      <Image
        source={avatarMap[avatarSeleccionado]}
        style={styles.avatarPrincipal}
      />

      <Text style={[styles.subtitulo, styles.font]}>Seleccioná tu avatar</Text>

      <ScrollView horizontal style={styles.avatarScroll}>
        {avatarList.map((avatar, index) => (
          <TouchableOpacity key={index} onPress={() => actualizarAvatar(avatar)}>
            <Image
              source={avatarMap[avatar]}
              style={[
                styles.avatarOpcional,
                avatar === avatarSeleccionado && styles.avatarSeleccionado
              ]}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingTop: 50,
  },
  font: {
    fontFamily: 'Kavoon_400Regular',
  },
  nombre: {
    fontSize: 22,
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: 18,
    marginTop: 20,
  },
  avatarPrincipal: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginTop: 10,
  },
  avatarScroll: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  avatarOpcional: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarSeleccionado: {
    borderColor: '#34B0A6',
  },
});
