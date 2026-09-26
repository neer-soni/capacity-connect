const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) results = results.concat(walk(full));
    else if (f.endsWith('.tsx')) results.push(full);
  });
  return results;
}

const files = walk(path.join(__dirname, 'src', 'app'));
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  
  // Remove explicit role props from DashboardLayout
  content = content.replace(/<DashboardLayout role="trainee">/g, '<DashboardLayout>');
  content = content.replace(/<DashboardLayout role="trainer">/g, '<DashboardLayout>');
  content = content.replace(/<DashboardLayout role="admin">/g, '<DashboardLayout>');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    count++;
    console.log('Fixed:', path.relative(__dirname, file));
  }
});

console.log(`\nDone: ${count} files updated`);
