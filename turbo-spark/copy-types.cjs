const fs = require("fs");
const path = require("path");

const currentDir = path.dirname(require.main.filename);

const typesDir = path.resolve(currentDir, "types");
const distDir = path.resolve(currentDir, "dist");

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

const distTypesDir = path.join(distDir, "types");

if (!fs.existsSync(distTypesDir)) {
    fs.mkdirSync(distTypesDir);
}

fs.readdirSync(typesDir).forEach((file) => {
    const srcFile = path.join(typesDir, file);
    const distFile = path.join(distTypesDir, file);

    fs.copyFileSync(srcFile, distFile);
});

console.log("Types copied successfully.");
