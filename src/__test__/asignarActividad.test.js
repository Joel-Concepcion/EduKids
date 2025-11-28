// src/__test__/asignarActividad.test.js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ListaActividades from '../view/game/formas/listaActividades';
import { Alert } from 'react-native';

// Aumentar timeout para pruebas asíncronas
jest.setTimeout(30000);

// Mocks de Firebase
jest.mock('firebase/auth', () => ({
  getAuth: () => ({ currentUser: { uid: 'user-123' } }),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
}));

const { getDocs, updateDoc, collection, query, where, doc } = require('firebase/firestore');

// Mock para las imágenes
jest.mock('../../src/assets/game/literatura/formarP.png', () => 'test-image-1');
jest.mock('../../src/assets/game/literatura/bannerABC.png', () => 'test-image-2');

describe('ListaActividades', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar mocks de Firestore
    collection.mockReturnValue('clases-collection');
    query.mockReturnValue('clases-query');
    where.mockReturnValue('clases-where');
    doc.mockImplementation((db, collection, id) => `${collection}/${id}`);
  });

  test('debe renderizar el título correctamente', async () => {
    // Mock vacío para las clases
    getDocs.mockResolvedValueOnce({ docs: [] });

    const { getByText } = render(
      <NavigationContainer>
        <ListaActividades />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText('Lista actividades figuras y formas')).toBeTruthy();
    }, { timeout: 5000 });
  });

  test('debe mostrar actividades y permitir seleccionar una', async () => {
    // Mock vacío para las clases
    getDocs.mockResolvedValueOnce({ docs: [] });

    const { getByText, getAllByTestId, queryAllByTestId } = render(
      <NavigationContainer>
        <ListaActividades />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText('Lista actividades figuras y formas')).toBeTruthy();
    }, { timeout: 5000 });

    // Buscar por testID o por tipo de elemento
    const actividades = getAllByTestId(/actividad-/);
    expect(actividades.length).toBeGreaterThan(0);

    // Alternativa: buscar todos los TouchableOpacity por su accesibilidad
    const touchables = queryAllByTestId((testId) => 
      testId && testId.startsWith('actividad-')
    );
    expect(touchables.length).toBeGreaterThan(0);
  });

  test('debe abrir modal al hacer clic en "Agregar actividad"', async () => {
    // Mock con una clase
    const fakeDocs = {
      docs: [
        { 
          id: 'clase-1', 
          data: () => ({ 
            nombreClase: 'Clase A', 
            actividades: [],
            docenteId: 'user-123'
          }) 
        },
      ],
    };
    getDocs.mockResolvedValueOnce(fakeDocs);

    const { getByText, getAllByTestId, queryByText } = render(
      <NavigationContainer>
        <ListaActividades />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText('Lista actividades figuras y formas')).toBeTruthy();
    }, { timeout: 5000 });

    // Encontrar y presionar la primera actividad por testID
    const actividades = getAllByTestId(/actividad-/);
    const primeraActividad = actividades[0];
    fireEvent.press(primeraActividad);

    // Esperar a que aparezca el botón "Agregar actividad" y hacer clic
    await waitFor(() => {
      const agregarBtn = getByText('Agregar actividad');
      fireEvent.press(agregarBtn);
    }, { timeout: 5000 });

    // Verificar que el modal se abre mostrando la clase
    await waitFor(() => {
      expect(getByText('Clase A')).toBeTruthy();
      expect(getByText(/Agregar.*a:/)).toBeTruthy();
    }, { timeout: 5000 });
  });

  test('debe asignar actividad a clase correctamente', async () => {
    // Mock con una clase vacía
    const fakeDocs = {
      docs: [
        { 
          id: 'clase-1', 
          data: () => ({ 
            nombreClase: 'Clase A', 
            actividades: [],
            docenteId: 'user-123'
          }) 
        },
      ],
    };
    getDocs.mockResolvedValueOnce(fakeDocs);
    updateDoc.mockResolvedValueOnce();

    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    const { getByText, getAllByTestId } = render(
      <NavigationContainer>
        <ListaActividades />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText('Lista actividades figuras y formas')).toBeTruthy();
    }, { timeout: 5000 });

    // Seleccionar actividad por testID
    const actividades = getAllByTestId(/actividad-/);
    const primeraActividad = actividades[0];
    fireEvent.press(primeraActividad);

    // Hacer clic en "Agregar actividad"
    await waitFor(() => {
      const agregarBtn = getByText('Agregar actividad');
      fireEvent.press(agregarBtn);
    }, { timeout: 5000 });

    // Seleccionar clase en el modal
    await waitFor(() => {
      const claseItem = getByText('Clase A');
      fireEvent.press(claseItem);
    }, { timeout: 5000 });

    // Verificar que se llamó a updateDoc
    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalled();
    }, { timeout: 5000 });

    expect(alertSpy).toHaveBeenCalledWith(
      'Actividad asignada',
      expect.stringContaining('Se agregó')
    );

    alertSpy.mockRestore();
  });

  test('debe mostrar error si actividad ya está asignada', async () => {
    // Mock con clase que ya tiene la actividad
    const fakeDocs = {
      docs: [
        { 
          id: 'clase-1', 
          data: () => ({ 
            nombreClase: 'Clase A', 
            actividades: [{ 
              id: 'juego-palabras', 
              nombre: 'Juego de Palabras' 
            }],
            docenteId: 'user-123'
          }) 
        },
      ],
    };
    getDocs.mockResolvedValueOnce(fakeDocs);

    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    const { getByText, getAllByTestId } = render(
      <NavigationContainer>
        <ListaActividades />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText('Lista actividades figuras y formas')).toBeTruthy();
    }, { timeout: 5000 });

    // Seleccionar actividad por testID
    const actividades = getAllByTestId(/actividad-/);
    const primeraActividad = actividades[0];
    fireEvent.press(primeraActividad);

    // Hacer clic en "Agregar actividad"
    await waitFor(() => {
      const agregarBtn = getByText('Agregar actividad');
      fireEvent.press(agregarBtn);
    }, { timeout: 5000 });

    // Seleccionar clase en el modal
    await waitFor(() => {
      const claseItem = getByText('Clase A');
      fireEvent.press(claseItem);
    }, { timeout: 5000 });

    // Verificar que se muestra el error
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Ya existe', 
        'La actividad ya está asignada a esta clase.'
      );
    }, { timeout: 5000 });

    alertSpy.mockRestore();
  });
});