const { getDefaultConfig } = require("expo/metro-config");

// Ensure Expo Router finds the app directory
process.env.EXPO_ROUTER_APP_DIR = "app";

const config = getDefaultConfig(__dirname);

config.transformer.babelTransformerPath = require.resolve("./transformer.js");
config.resolver.sourceExts.push("scss", "sass");

module.exports = config;
