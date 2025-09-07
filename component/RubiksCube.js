import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, PanResponder, Animated, Dimensions, TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');
const CUBE_SIZE = width * 0.5;
const FACE_SIZE = CUBE_SIZE / 3;
const COLORS = {
  front: '#C41E3A', // Rojo
  back: '#FF5800',  // Naranja
  top: '#FFFFFF',   // Blanco
  bottom: '#FFD500',// Amarillo
  left: '#0051BA',  // Azul
  right: '#009E60'  // Verde
};

const RubiksCube = () => {
  // Estado para almacenar las caras del cubo
  const [cube, setCube] = useState({
    front: Array(9).fill('front'),
    back: Array(9).fill('back'),
    top: Array(9).fill('top'),
    bottom: Array(9).fill('bottom'),
    left: Array(9).fill('left'),
    right: Array(9).fill('right')
  });

  // Ángulos de rotación para la vista 3D
  const rotation = useRef({
    x: new Animated.Value(0),
    y: new Animated.Value(0)
  }).current;

  // Rotación acumulada
  const accumulatedRotation = useRef({ x: 0, y: 0 });

  // PanResponder para los gestos de rotación
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        rotation.x.setValue(accumulatedRotation.current.x + gestureState.dy);
        rotation.y.setValue(accumulatedRotation.current.y + gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        accumulatedRotation.current.x += gestureState.dy;
        accumulatedRotation.current.y += gestureState.dx;
      }
    })
  ).current;

  // Función para rotar una cara del cubo
  const rotateFace = (face, clockwise = true) => {
    setCube(prev => {
      const newCube = {...prev};
      
      // Patrones de rotación para las caras adyacentes
      const rotationPatterns = {
        front: {
          top: [6, 7, 8],
          right: [0, 3, 6],
          bottom: [2, 1, 0],
          left: [8, 5, 2]
        },
        back: {
          top: [2, 1, 0],
          left: [0, 3, 6],
          bottom: [6, 7, 8],
          right: [8, 5, 2]
        },
        top: {
          back: [2, 1, 0],
          right: [2, 1, 0],
          front: [2, 1, 0],
          left: [2, 1, 0]
        },
        bottom: {
          front: [6, 7, 8],
          right: [6, 7, 8],
          back: [6, 7, 8],
          left: [6, 7, 8]
        },
        left: {
          top: [0, 3, 6],
          front: [0, 3, 6],
          bottom: [0, 3, 6],
          back: [8, 5, 2]
        },
        right: {
          top: [8, 5, 2],
          back: [0, 3, 6],
          bottom: [8, 5, 2],
          front: [8, 5, 2]
        }
      };

      // Rotar la cara principal
      newCube[face] = clockwise
        ? [
            prev[face][6], prev[face][3], prev[face][0],
            prev[face][7], prev[face][4], prev[face][1],
            prev[face][8], prev[face][5], prev[face][2]
          ]
        : [
            prev[face][2], prev[face][5], prev[face][8],
            prev[face][1], prev[face][4], prev[face][7],
            prev[face][0], prev[face][3], prev[face][6]
          ];

      // Rotar las caras adyacentes
      const pattern = rotationPatterns[face];
      const temp = [...prev[Object.keys(pattern)[0]]];
      
      for (let i = 0; i < 4; i++) {
        const currentFace = Object.keys(pattern)[i];
        const nextFace = Object.keys(pattern)[(i + (clockwise ? 1 : 3)) % 4];
        const indices = pattern[currentFace];
        
        if (clockwise) {
          for (let j = 0; j < 3; j++) {
            newCube[currentFace][indices[j]] = prev[nextFace][pattern[nextFace][j]];
          }
        } else {
          for (let j = 0; j < 3; j++) {
            newCube[nextFace][pattern[nextFace][j]] = prev[currentFace][indices[j]];
          }
        }
      }

      return newCube;
    });
  };

  // Renderizar una cara del cubo
  const renderFace = (face, position) => {
    return (
      <Animated.View
        style={[
          styles.face,
          styles[position],
          { 
            backgroundColor: COLORS[face[4]],
            transform: [
              ...styles[position].transform,
              { rotateX: rotation.x },
              { rotateY: rotation.y }
            ]
          }
        ]}
      >
        {face.map((color, index) => (
          <View 
            key={index} 
            style={[
              styles.sticker, 
              { 
                backgroundColor: COLORS[color],
                top: Math.floor(index / 3) * FACE_SIZE,
                left: (index % 3) * FACE_SIZE
              }
            ]}
          />
        ))}
      </Animated.View>
    );
  };

  // Botones de control
  const renderControls = () => {
    return (
      <View style={styles.controlsContainer}>
        <View style={styles.controlRow}>
          <TouchableOpacity style={styles.button} onPress={() => rotateFace('top', true)}>
            <Text style={styles.buttonText}>U</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.controlRow}>
          <TouchableOpacity style={styles.button} onPress={() => rotateFace('left', true)}>
            <Text style={styles.buttonText}>L</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => rotateFace('front', true)}>
            <Text style={styles.buttonText}>F</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => rotateFace('right', true)}>
            <Text style={styles.buttonText}>R</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.controlRow}>
          <TouchableOpacity style={styles.button} onPress={() => rotateFace('bottom', true)}>
            <Text style={styles.buttonText}>D</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.controlRow}>
          <TouchableOpacity style={styles.button} onPress={() => rotateFace('back', true)}>
            <Text style={styles.buttonText}>B</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CUBO DE RUBIK 3x3</Text>
      
      <View style={styles.cubeContainer} {...panResponder.panHandlers}>
        {renderFace(cube.front, 'front')}
        {renderFace(cube.back, 'back')}
        {renderFace(cube.top, 'top')}
        {renderFace(cube.bottom, 'bottom')}
        {renderFace(cube.left, 'left')}
        {renderFace(cube.right, 'right')}
      </View>
      
      <Text style={styles.instructions}>
        Gira el cubo con el dedo - Toca los botones para rotar las caras
      </Text>
      
      {renderControls()}
      
      <TouchableOpacity 
        style={styles.resetButton} 
        onPress={() => {
          accumulatedRotation.current = { x: 0, y: 0 };
          rotation.x.setValue(0);
          rotation.y.setValue(0);
        }}
      >
        <Text style={styles.resetButtonText}>Reiniciar Vista</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  instructions: {
    color: '#aaa',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  cubeContainer: {
    width: CUBE_SIZE * 2,
    height: CUBE_SIZE * 2,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ perspective: 1000 }],
  },
  face: {
    position: 'absolute',
    width: CUBE_SIZE,
    height: CUBE_SIZE,
    borderWidth: 2,
    borderColor: '#000',
    flexWrap: 'wrap',
  },
  sticker: {
    position: 'absolute',
    width: FACE_SIZE - 4,
    height: FACE_SIZE - 4,
    margin: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.3)',
  },
  front: {
    transform: [
      { translateZ: CUBE_SIZE / 2 },
    ]
  },
  back: {
    transform: [
      { rotateY: Math.PI },
      { translateZ: CUBE_SIZE / 2 },
    ]
  },
  top: {
    transform: [
      { rotateX: Math.PI / 2 },
      { translateZ: CUBE_SIZE / 2 },
    ]
  },
  bottom: {
    transform: [
      { rotateX: -Math.PI / 2 },
      { translateZ: CUBE_SIZE / 2 },
    ]
  },
  left: {
    transform: [
      { rotateY: -Math.PI / 2 },
      { translateZ: CUBE_SIZE / 2 },
    ]
  },
  right: {
    transform: [
      { rotateY: Math.PI / 2 },
      { translateZ: CUBE_SIZE / 2 },
    ]
  },
  controlsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#333',
    padding: 15,
    margin: 5,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#444',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#666',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RubiksCube;