module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/jest.setup.js'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(@jest-)?react-native|@react-native|@react-navigation|@expo|expo|react-native)'
  ],
  moduleNameMapper: {
    '\\.ttf$': '<rootDir>/__mocks__/fileMock.js',
  },
};
