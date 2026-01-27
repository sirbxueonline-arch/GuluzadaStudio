const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const assetsDir = path.join(__dirname, 'assets');
const publicDir = path.join(__dirname, 'public');

// 1. Clean/Create dist folder
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir);

// 2. Helper to Copy Files/Folders
function copyRecursive(src, dest) {
    if (!fs.existsSync(src)) return;
    
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest);
        fs.readdirSync(src).forEach(childItemName => {
            copyRecursive(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

// 3. Copy Static Assets
console.log('Copying assets...');
copyRecursive(assetsDir, path.join(distDir, 'assets'));
copyRecursive(publicDir, path.join(distDir, 'public'));

// 4. Copy HTML Files
console.log('Copying HTML files...');
fs.readdirSync(__dirname).forEach(file => {
    if (file.endsWith('.html')) {
        fs.copyFileSync(path.join(__dirname, file), path.join(distDir, file));
    }
});

// 5. Generate config.js from Environment Variables (Vercel) OR Copy Local (Dev)
console.log('Generating config.js...');
const configPath = path.join(distDir, 'assets/js/config.js');
const localConfigPath = path.join(__dirname, 'assets/js/config.js');

// Ensure directory exists
if (!fs.existsSync(path.dirname(configPath))) {
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
}

if (process.env.EMAILJS_PUBLIC_KEY) {
    // We are on Vercel (or env vars are set)
    console.log('Detected Environment Variables. Writing to config.js...');
    const configContent = `const CONFIG = {
    EMAILJS_PUBLIC_KEY: "${process.env.EMAILJS_PUBLIC_KEY}",
    EMAILJS_SERVICE_ID: "${process.env.EMAILJS_SERVICE_ID}",
    EMAILJS_TEMPLATE_ID: "${process.env.EMAILJS_TEMPLATE_ID}"
};`;
    fs.writeFileSync(configPath, configContent);
} else {
    // We are local, try to copy local config.js
    if (fs.existsSync(localConfigPath)) {
        console.log('Copying local config.js...');
        fs.copyFileSync(localConfigPath, configPath);
    } else {
        console.warn('WARNING: No Environment Variables found AND no local config.js found.');
         // Write empty config to prevent 404, valid code handles undefined CONFIG
        fs.writeFileSync(configPath, 'const CONFIG = undefined;');
    }
}

console.log('Build complete! Output directory: dist');
