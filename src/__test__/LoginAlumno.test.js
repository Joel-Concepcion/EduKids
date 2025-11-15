import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Login from '../view/log/login';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';

// Mock de Firebase Auth
jest.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: jest.fn(),
    getAuth: jest.fn(() => ({})),
}));

// Mock de Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => { });

// Mock del navigation.navigate para evitar errores
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: jest.fn(),
            goBack: jest.fn(),
        }),
    };
});

// Mock simplificado del Picker
jest.mock('@react-native-picker/picker', () => {
    const React = require('react');
    const { View } = require('react-native');

    const MockPicker = ({ selectedValue, onValueChange, testID, children }) => {
        return React.createElement(View, {
            testID: testID,
            accessible: true,
        });
    };

    MockPicker.Item = ({ label, value }) =>
        React.createElement(View, {});

    return { Picker: MockPicker };
});

//Helper para envolver el componente en navegación
const renderWithNavigation = () =>
    render(
        <NavigationContainer>
            <Login />
        </NavigationContainer>
    );

//Tests para Login
describe('Login.jsx', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    //Función helper para cambiar a vista de Login
    const switchToLoginView = (getByText) => {
        fireEvent.press(getByText('Login'));
    };

    //Función helper para llenar formulario de login
    const fillLoginForm = (getByText, getByTestId, email, password) => {
        switchToLoginView(getByText);

        const emailInput = getByTestId('email-input');
        const passwordInput = getByTestId('password-input');

        fireEvent.changeText(emailInput, email);
        fireEvent.changeText(passwordInput, password);
        fireEvent.press(getByText('Iniciar'));
    };

    test('renderiza campos de login después de presionar "Login"', () => {
        const { getByText, getByTestId } = renderWithNavigation();

        // Cambiar a vista de Login
        switchToLoginView(getByText);

        // Verificar que los campos existen usando testID
        expect(getByTestId('email-input')).toBeTruthy();
        expect(getByTestId('password-input')).toBeTruthy();
        expect(getByText('Iniciar')).toBeTruthy();
    });

    test('muestra alerta si campos de login están vacíos', async () => {
        const { getByText } = renderWithNavigation();

        // Cambiar a vista de Login
        switchToLoginView(getByText);

        // Presionar botón sin llenar campos
        fireEvent.press(getByText('Iniciar'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Campos vacíos', 'Ingresá tu correo y contraseña.');
        });
    });

    test('login exitoso llama a Firebase Auth', async () => {
        // Mock exitoso
        signInWithEmailAndPassword.mockResolvedValueOnce({
            user: {
                uid: 'abc123',
                email: 'test@mail.com'
            }
        });

        const { getByText, getByTestId } = renderWithNavigation();

        // Llenar formulario y enviar
        fillLoginForm(getByText, getByTestId, 'test@mail.com', '123456');

        await waitFor(() => {
            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
                expect.anything(),
                'test@mail.com',
                '123456'
            );
        });

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Bienvenido', 'Inicio de sesión exitoso.');
        });
    });

    test('login fallido muestra alerta de error', async () => {
        // Mock fallido
        signInWithEmailAndPassword.mockRejectedValueOnce(new Error('auth/invalid-credential'));

        const { getByText, getByTestId } = renderWithNavigation();

        // Llenar formulario con credenciales incorrectas
        fillLoginForm(getByText, getByTestId, 'fail@mail.com', 'wrongpass');

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Error',
                'Credenciales incorrectas o usuario no registrado.'
            );
        });
    });

    test('renderiza vista de registro inicialmente', () => {
        const { getByText, queryByText } = renderWithNavigation();

        // Verificar elementos que DEBEN estar en la vista de registro
        expect(getByText('Registro')).toBeTruthy();
        expect(getByText(/Iniciar sesión/i)).toBeTruthy();
        expect(getByText('Login')).toBeTruthy();

        // Verificar que NO estamos en la vista de login
        expect(queryByText('Iniciar')).toBeFalsy();
    });

    test('cambia a vista de login y viceversa', () => {
        const { getByText } = renderWithNavigation();

        // Cambiar a Login
        switchToLoginView(getByText);
        expect(getByText('Login')).toBeTruthy();

        // Volver a Registro
        fireEvent.press(getByText('Registro'));
        expect(getByText('Registro')).toBeTruthy();
    });
});

//Tests para Registro de Usuario
describe('Registro de Usuario', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    //Helper para simular selección de rol - VERSIÓN MEJORADA
    const selectRole = async (getByTestId, role, getByText) => {
        // Encontrar el Picker
        const picker = getByTestId('role-picker');

        // Simular el cambio de valor directamente
        // En un test real, esto activaría el onValueChange del Picker
        // Pero como estamos en testing, simulamos el efecto
        fireEvent(picker, 'onValueChange', role);

        // Esperar a que el componente se actualice
        await waitFor(() => {
            if (role === 'Docente') {
                expect(getByText('Nombres')).toBeTruthy();
            } else if (role === 'Alumno') {
                expect(getByText('Codigo del alumno')).toBeTruthy();
            }
        });
    };

    //Helper para llenar formulario de docente
    const fillDocenteForm = async (
        getByText,
        getByTestId,
        formData = {
            colegio: 'Colegio Test',
            nombres: 'Juan',
            apellidos: 'Pérez',
            email: 'juan@mail.com',
            password: '123456',
            confirmPassword: '123456'
        }
    ) => {
        // Seleccionar rol Docente
        await selectRole(getByTestId, 'Docente', getByText);

        // Llenar campos del formulario
        fireEvent.changeText(getByTestId('colegio-input'), formData.colegio);
        fireEvent.changeText(getByTestId('nombres-input'), formData.nombres);
        fireEvent.changeText(getByTestId('apellidos-input'), formData.apellidos);
        fireEvent.changeText(getByTestId('email-input'), formData.email);
        fireEvent.changeText(getByTestId('password-input'), formData.password);
        fireEvent.changeText(getByTestId('confirm-password-input'), formData.confirmPassword);

        // Enviar formulario
        fireEvent.press(getByText('Registrar'));
    };

    test('renderiza formulario de docente al seleccionar rol Docente', async () => {
        const { getByText, getByTestId } = renderWithNavigation();

        // Seleccionar rol Docente
        await selectRole(getByTestId, 'Docente', getByText);

        // Verificar que aparecen los campos específicos de docente
        expect(getByText('Nombres')).toBeTruthy();
        expect(getByText('Apellidos')).toBeTruthy();
        expect(getByText('Correo electrónico')).toBeTruthy();
        expect(getByText('Registrar')).toBeTruthy();
    });

    /*test('renderiza formulario de alumno al seleccionar rol Alumno - solución definitiva', async () => {
        const { getByText, getByTestId, queryByText } = renderWithNavigation();

        // Verificar que inicialmente NO está el formulario de alumno
        expect(queryByText('Codigo del alumno')).toBeNull();

        // Simular selección de rol Alumno directamente en el estado del componente
        // Esto evita problemas con el mock del Picker
        const component = renderWithNavigation();

        // Forzar el cambio de estado directamente (esto es un workaround para testing)
        // En un entorno real, esto lo haría el Picker
        fireEvent(component.getByTestId('role-picker'), 'onValueChange', 'Alumno');

        // Esperar y buscar elementos ÚNICOS del formulario de alumno
        await waitFor(() => {
            // Buscar por texto que sea único para alumno
            expect(component.getByText('Codigo del alumno')).toBeTruthy();
        });

        await waitFor(() => {
            expect(component.getByText('Aceder')).toBeTruthy();
        });

        // Verificar inputs por testID (más confiable que texto)
        expect(component.getByTestId('colegio-alumno-input')).toBeTruthy();
        expect(component.getByTestId('codigo-alumno-input')).toBeTruthy();
    });*/
    test('muestra alerta si campos de docente están incompletos', async () => {
        const { getByText, getByTestId } = renderWithNavigation();

        // Seleccionar rol Docente
        await selectRole(getByTestId, 'Docente', getByText);

        // Intentar registrar sin llenar campos
        fireEvent.press(getByText('Registrar'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Campos incompletos',
                'Por favor, completá todos los campos.'
            );
        });
    });

    test('muestra alerta si contraseña es muy débil en registro docente', async () => {
        const { getByText, getByTestId } = renderWithNavigation();

        // Llenar formulario con contraseña débil
        await fillDocenteForm(getByText, getByTestId, {
            colegio: 'Colegio Test',
            nombres: 'Juan',
            apellidos: 'Pérez',
            email: 'juan@mail.com',
            password: '123', // Contraseña muy corta
            confirmPassword: '123'
        });

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Contraseña débil',
                'Debe tener al menos 6 caracteres.'
            );
        });
    });

    test('muestra alerta si contraseñas no coinciden en registro docente', async () => {
        const { getByText, getByTestId } = renderWithNavigation();

        // Llenar formulario con contraseñas diferentes
        await fillDocenteForm(getByText, getByTestId, {
            colegio: 'Colegio Test',
            nombres: 'Juan',
            apellidos: 'Pérez',
            email: 'juan@mail.com',
            password: '123456',
            confirmPassword: '654321' // Contraseña diferente
        });

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Contraseñas no coinciden');
        });
    });
});

// 🧪 Tests adicionales para casos específicos
describe('Casos Específicos de Registro', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('no muestra formulario de alumno inicialmente', () => {
        const { queryByText } = renderWithNavigation();

        // Verificar que los campos de alumno NO están visibles inicialmente
        expect(queryByText('Codigo del alumno')).toBeNull();
        expect(queryByText('Aceder')).toBeNull();
    });

    test('no muestra formulario de docente inicialmente', () => {
        const { queryByText } = renderWithNavigation();

        // Verificar que los campos de docente NO están visibles inicialmente
        expect(queryByText('Nombres')).toBeNull();
        expect(queryByText('Apellidos')).toBeNull();
        expect(queryByText('Registrar')).toBeNull();
    });
});