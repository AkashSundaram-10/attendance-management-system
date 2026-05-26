const fs = require('fs');

let src = fs.readFileSync('src/components/TopAppBar.tsx', 'utf8');

// Hide hamburger
src = src.replace(
  /<button[\s\S]*?className="md:hidden[\s\S]*?<\/button>/,
  ''
);

// Replace logo
src = src.replace(
  /<div className="w-8 h-8 bg-\[#4b41e1\] rounded-lg flex items-center justify-center">\s*<div className="w-4 h-4 border-2 border-white rounded-sm rotate-45"><\/div>\s*<\/div>/,
  '<img src="/logo.png" alt="WorkTrack Pro Logo" className="w-10 h-10 object-contain rounded-lg shadow-sm" />'
);

fs.writeFileSync('src/components/TopAppBar.tsx', src);
console.log('TopAppBar patched');
