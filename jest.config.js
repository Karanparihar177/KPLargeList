module.exports = {
  preset: '@react-native/jest-preset',
  roots: ['<rootDir>/tests'],
  setupFiles: ['@shopify/flash-list/jestSetup'],
  testPathIgnorePatterns: ['/node_modules/', '/example/'],
  // @shopify/flash-list ships ESM.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@shopify/flash-list)/)',
  ],
};
