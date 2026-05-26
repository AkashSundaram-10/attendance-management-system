const cp = require('child_process');
const fs = require('fs');

let app = cp.execSync('git show HEAD:src/App.tsx', {encoding:'utf8'});

// Remove Sidebar from left side
app = app.replace(
  /{ \/\* Sidebar \*\/ }[\s\S]*?{!hideShell && \([\s\S]*?<Sidebar currentView={currentView} setView={setCurrentView} \/>[\s\S]*?\)}/,
  ''
);

// Fix layout classes
app = app.replace(
  /className={`flex-1 flex flex-col \${!hideShell \? 'ml-64' : ''}`}/,
  'className="flex-1 flex flex-col w-full overflow-hidden"'
);

// Add Sidebar under TopAppBar
app = app.replace(
  /onClearNotifications=\{\(\) => setNotificationsCount\(0\)\}\n\s*\/>\n\s*\)}\n/,
  'onClearNotifications={() => setNotificationsCount(0)}\n          />\n        )}\n\n        {!hideShell && <Sidebar currentView={currentView} setView={setCurrentView} />}\n'
);

fs.writeFileSync('src/App.tsx', app);
console.log('App.tsx repaired!');
