const fs = require('fs');
const src = 'C:\\Users\\Akash Sundaram\\.gemini\\antigravity\\brain\\7d04a436-347d-485d-a15d-eff75961848a\\media__1779676037598.jpg';
const dest = 'd:\\Projects\\Attendance Management\\AMS\\public\\admin-avatar.jpg';
fs.copyFileSync(src, dest);
console.log('Copied image');
