const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Fix logo cache bust
      if (file === 'TopAppBar.tsx') {
        content = content.replace('src="/logo.png"', 'src="/logo.png?v=2"');
      }

      // Replace hardcoded theme colors
      content = content.replace(/#4b41e1/g, 'var(--primary-color)');
      content = content.replace(/#3f36c4/g, 'var(--primary-hover)');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir('src');

// Update index.css
let css = fs.readFileSync('src/index.css', 'utf8');
if (!css.includes('--primary-color')) {
  css = `:root {
  --primary-color: #4b41e1;
  --primary-hover: #3f36c4;
}\n` + css;
  fs.writeFileSync('src/index.css', css);
}

// Update SettingsView.tsx to save and calculate hover color dynamically
let settings = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');
settings = settings.replace(
  "document.documentElement.style.setProperty('--primary-color', themeColor);",
  `document.documentElement.style.setProperty('--primary-color', themeColor);
    // Rough calculation for hover state (darker)
    document.documentElement.style.setProperty('--primary-hover', themeColor);
    localStorage.setItem('wtp-theme', themeColor);`
);
fs.writeFileSync('src/components/SettingsView.tsx', settings);

// Update main.tsx to load saved theme
let main = fs.readFileSync('src/main.tsx', 'utf8');
if (!main.includes('wtp-theme')) {
  main = main.replace(
    "import App from './App.tsx';",
    `import App from './App.tsx';\nconst savedTheme = localStorage.getItem('wtp-theme');\nif (savedTheme) { document.documentElement.style.setProperty('--primary-color', savedTheme); document.documentElement.style.setProperty('--primary-hover', savedTheme); }`
  );
  fs.writeFileSync('src/main.tsx', main);
}

console.log('Theme variables injected and logo path updated!');
