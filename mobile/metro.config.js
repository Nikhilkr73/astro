// Learn more: https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro configuration
 * https://docs.expo.dev/guides/customizing-metro/
 */
const config = getDefaultConfig(__dirname);

// Customize the config as needed
config.resolver.alias = {
  'react-native-vector-icons': 'react-native-vector-icons/dist',
};

config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
