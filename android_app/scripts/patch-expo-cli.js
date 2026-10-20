const fs = require('node:fs');
const path = require('node:path');

const targetFile = path.join(__dirname, '..', 'node_modules', '@expo', 'cli', 'build', 'src', 'start', 'server', 'metro', 'externals.js');
if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  if (!content.includes('!x.includes(":")')) {
    content = content.replace(
      '!["sys"].includes(x)',
      '!["sys"].includes(x) && !x.includes(":")'
    );
    content = content.replace(
      '![\n            "sys"\n        ].includes(x)',
      '![\n            "sys"\n        ].includes(x) && !x.includes(":")'
    );
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('[patch-expo-cli] Patched @expo/cli externals.js for Windows Node compatibility.');
  }
}
