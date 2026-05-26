const cp = require('child_process');
const fs = require('fs');

console.log('Reverting files to HEAD...');
const appSrc = cp.execSync('git show HEAD:src/App.tsx', {encoding:'utf8'});
const sidebarSrc = cp.execSync('git show HEAD:src/components/Sidebar.tsx', {encoding:'utf8'});
const topAppBarSrc = cp.execSync('git show HEAD:src/components/TopAppBar.tsx', {encoding:'utf8'});
const mainSrc = cp.execSync('git show HEAD:src/main.tsx', {encoding:'utf8'});

// 1. App.tsx: Change layout from ml-64 to top-stack
let newApp = appSrc.replace(
  /className={`flex-1 flex flex-col \${!hideShell \? 'md:ml-64 w-full md:w-auto overflow-hidden' : 'w-full'}`}/,
  'className="flex-1 flex flex-col w-full md:w-auto overflow-x-hidden"'
);
newApp = newApp.replace(
  /{ \/\* Sidebar \*\/ }[\s\S]*?{!hideShell && \([\s\S]*?<Sidebar currentView={currentView} setView=\{\(v\) => \{ setCurrentView\(v\); setIsSidebarOpen\(false\); \}\} isOpen=\{isSidebarOpen\} onClose=\{\(\) => setIsSidebarOpen\(false\)\} \/>[\s\S]*?\)}/,
  ''
);
newApp = newApp.replace(
  /onClearNotifications=\{\(\) => setNotificationsCount\(0\)\}\n\s*\/>\n\s*\)}\n/,
  'onClearNotifications={() => setNotificationsCount(0)}\n          />\n        )}\n\n        {!hideShell && <Sidebar currentView={currentView} setView={setCurrentView} />}\n'
);

// 2. Sidebar.tsx: Change vertical to horizontal
let newSidebar = sidebarSrc.replace(
  /<aside className=\{`w-64 bg-\[#111827\] text-white flex flex-col h-screen fixed left-0 top-0 overflow-y-auto z-50 transition-transform duration-300 ease-in-out \${isOpen \? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`\}>[\s\S]*?<\/aside>/,
  `<nav className="w-full bg-[#111827] text-white flex items-center overflow-x-auto no-scrollbar shadow-md z-40 sticky top-20">
      <div className="flex px-2 py-2 space-x-1 min-w-max">
        {navItems.map((item, index) => {
          const isActive = getIsActive(item.id);
          const Icon = item.icon;
          return (
            <button
              key={\`\${item.id}-\${index}\`}
              onClick={() => setView(item.id)}
              className={\`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors shrink-0 \${
                isActive 
                  ? 'bg-[#4b41e1] text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }\`}
            >
              <Icon className="w-4 h-4" />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>`
);
// Remove mobile overlay from Sidebar
newSidebar = newSidebar.replace(/\{\/\* Mobile Overlay \*\/\}[\s\S]*?\}\)/, '');

// 3. TopAppBar: Hide hamburger
let newTopAppBar = topAppBarSrc.replace(
  /<button \n\s*onClick=\{onMenuToggle\}\n\s*className="md:hidden[\s\S]*?<\/button>/,
  `<div className="hidden sm:block">
            <h1 className="text-sm font-bold leading-tight">WorkTrack Pro</h1>
          </div>`
);

// 4. main.tsx: Unregister sw
let newMain = mainSrc.replace(
  /if \('serviceWorker' in navigator\) \{[\s\S]*?\}\n/,
  `if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}\n`
);

fs.writeFileSync('src/App.tsx', newApp);
fs.writeFileSync('src/components/Sidebar.tsx', newSidebar);
fs.writeFileSync('src/components/TopAppBar.tsx', newTopAppBar);
fs.writeFileSync('src/main.tsx', newMain);

console.log('Restored and patched files successfully!');
