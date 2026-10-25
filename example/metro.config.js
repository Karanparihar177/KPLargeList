const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const root = path.resolve(__dirname, '..');

/**
 * Monorepo setup: the example imports the library straight from ../src so
 * edits hot-reload, while react / react-native / flash-list resolve to a single copy.
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [root],
  resolver: {
    nodeModulesPaths: [path.join(__dirname, 'node_modules'), path.join(root, 'node_modules')],
    extraNodeModules: {'kp-large-list': path.join(root, 'src')},
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
