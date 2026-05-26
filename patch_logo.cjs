const fs = require('fs');
const cp = require('child_process');

let src = cp.execSync('git show HEAD:src/components/TopAppBar.tsx', {encoding:'utf8'});

// 1. Remove hamburger
src = src.replace(
  /<button \n\s*onClick=\{onMenuToggle\}\n\s*className="md:hidden[\s\S]*?<\/button>/,
  `<div className="hidden sm:block">
            <h1 className="text-sm font-bold leading-tight">WorkTrack Pro</h1>
          </div>`
);

// 2. Replace the original logo element with image
src = src.replace(
  /<div className="w-8 h-8 bg-\[#4b41e1\] rounded-lg flex items-center justify-center">\s*<div className="w-4 h-4 border-2 border-white rounded-sm rotate-45"><\/div>\s*<\/div>/,
  '<img src="/logo.png" alt="WorkTrack Pro Logo" className="w-10 h-10 object-contain rounded-lg shadow-sm" />'
);

// 3. Add shrink-0 to header
src = src.replace(
  /<header className="sticky top-0 z-50 flex justify-between items-center px-4 md:px-8 h-20 bg-white border-b border-slate-200 transition-colors">/,
  '<header className="sticky top-0 z-50 flex justify-between items-center px-4 md:px-8 h-20 bg-white border-b border-slate-200 transition-colors shrink-0">'
);

fs.writeFileSync('src/components/TopAppBar.tsx', src);
console.log('TopAppBar restored and patched with new logo!');
