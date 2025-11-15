jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    ScrollView: View,
    PanGestureHandler: View,
    State: {},
    TouchableOpacity: View,
    // Agregá más mocks si usás otros componentes
  };
});

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-modules-core', () => ({
  EventEmitter: jest.fn(),
}));

jest.mock('@expo-google-fonts/kavoon', () => ({
  useFonts: () => [true],
  Kavoon_400Regular: {},
}));
