const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    alias: {
      'react-native-vector-icons': 'react-native-vector-icons/dist',
    },
    platforms: ['ios', 'android', 'native', 'web'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
