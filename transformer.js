const sassTransformer = require("react-native-sass-transformer");
const expoTransformer = require("expo/node_modules/@expo/metro-config/build/babel-transformer");
const fs = require("fs");

module.exports.transform = function (args) {
    const { filename } = args;

    if (filename.endsWith(".scss") || filename.endsWith(".sass")) {
        // Read the raw content to ensure we don't get pre-transformed JS
        const rawContent = fs.readFileSync(filename, "utf8");
        return sassTransformer.transform({
            ...args,
            src: rawContent
        });
    } else {
        return expoTransformer.transform(args);
    }
};
