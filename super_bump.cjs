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
    
    // Order matters to prevent cascading replacement
    // First, convert specific pixel sizes
    content = content.replace(/text-\[10px\]/g, 'text-sm');
    content = content.replace(/text-\[11px\]/g, 'text-sm');
    content = content.replace(/text-\[13px\]/g, 'text-base');
    
    // Bump base to lg
    content = content.replace(/\btext-base\b/g, 'text-lg');
    // Bump sm to base
    content = content.replace(/\btext-sm\b/g, 'text-base');
    // Bump xs to sm
    content = content.replace(/\btext-xs\b/g, 'text-sm');

    fs.writeFileSync(filePath, content);
    console.log(`Super bumped fonts in ${file}`);
  }
});
