const fs = require('fs');
const path = require('path');

const dir = 'src/components';
const views = [
  'DashboardView.tsx',
  'SalaryView.tsx',
  'AttendanceView.tsx',
  'AnalyticsView.tsx',
  'WorkersView.tsx',
  'WorkerProfileView.tsx'
];

views.forEach(file => {
  const filePath = path.join(dir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace text-[10px] with text-xs (12px)
    content = content.replace(/text-\[10px\]/g, 'text-xs');
    
    // Replace text-xs with text-sm (14px)
    // We use a regex that matches text-xs but not text-xs-something
    content = content.replace(/\btext-xs\b/g, 'text-sm');

    fs.writeFileSync(filePath, content);
    console.log(`Updated sizes in ${file}`);
  }
});
