const fs = require('fs');
const path = require('path');

// 1. Get all routes in android_app/src/navigation/types.ts
const typesFilePath = path.join(__dirname, '..', 'android_app', 'src', 'navigation', 'types.ts');
const typesContent = fs.readFileSync(typesFilePath, 'utf8');

const routeMatches = [...typesContent.matchAll(/^\s*([A-Za-z0-9_]+)\s*:\s*[^;]+;/gm)];
const registeredRoutes = new Set(routeMatches.map(m => m[1]));

console.log(`[Flow Crawler] Found ${registeredRoutes.size} declared routes in RootStackParamList.`);

// 2. Scan all .tsx files in android_app/src/screens
const screensDir = path.join(__dirname, '..', 'android_app', 'src', 'screens');

function getAllFiles(dir, exts = ['.tsx', '.ts']) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, exts));
    } else if (exts.includes(path.extname(file))) {
      results.push(filePath);
    }
  });
  return results;
}

const screenFiles = getAllFiles(screensDir);
console.log(`[Flow Crawler] Scanning ${screenFiles.length} screen files in android_app/src/screens...`);

const report = {
  deadNavigations: [],
  emptyOnPress: [],
  roboticAiPlaceholders: [],
  consoleOnlyButtons: []
};

const AI_KEYWORDS = [
  /lorem\s+ipsum/i,
  /fake\s+doctor/i,
  /dummy\s+user/i,
  /john\s+doe/i,
  /jane\s+doe/i,
  /sample\s+address/i,
  /test\s+street/i,
  /ai\s+generated\s+health\s+plan/i,
  /synthetic\s+data/i,
  /placeholder/i,
];

screenFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(path.join(__dirname, '..'), file);
  const lines = content.split('\n');

  // Check navigation calls: navigation.navigate("ScreenName") or navigation.navigate('ScreenName')
  const navRegex = /navigation\.(navigate|replace|push)\(\s*["']([A-Za-z0-9_]+)["']/g;
  let match;
  while ((match = navRegex.exec(content)) !== null) {
    const targetRoute = match[2];
    if (!registeredRoutes.has(targetRoute)) {
      // Find line number
      const lineNo = content.slice(0, match.index).split('\n').length;
      report.deadNavigations.push({
        file: relPath,
        line: lineNo,
        targetRoute,
        codeSnippet: match[0]
      });
    }
  }

  // Check empty onPress: onPress={() => {}} or onPress={() => { }}
  lines.forEach((line, idx) => {
    if (/onPress\s*=\s*\{\s*\(\s*\)\s*=>\s*\{\s*\}\s*\}/.test(line)) {
      report.emptyOnPress.push({
        file: relPath,
        line: idx + 1,
        snippet: line.trim()
      });
    }

    if (/onPress\s*=\s*\{\s*\(\s*\)\s*=>\s*console\.(log|warn|info)/.test(line)) {
      report.consoleOnlyButtons.push({
        file: relPath,
        line: idx + 1,
        snippet: line.trim()
      });
    }

    AI_KEYWORDS.forEach(regex => {
      if (regex.test(line)) {
        report.roboticAiPlaceholders.push({
          file: relPath,
          line: idx + 1,
          matched: regex.toString(),
          snippet: line.trim().slice(0, 100)
        });
      }
    });
  });
});

console.log('\n========================================');
console.log('--- URBAN HELPERS FLOW AUDIT RESULTS ---');
console.log('========================================');
console.log(`1. Dead Navigation Calls (Would crash app): ${report.deadNavigations.length}`);
report.deadNavigations.forEach(d => {
  console.log(`   🚨 [${d.file}:${d.line}] Navigating to unknown route "${d.targetRoute}"`);
});

console.log(`\n2. Empty / Dead Buttons (onPress={() => {}}): ${report.emptyOnPress.length}`);
report.emptyOnPress.slice(0, 10).forEach(e => {
  console.log(`   ⚠️ [${e.file}:${e.line}] Empty onPress: ${e.snippet}`);
});
if (report.emptyOnPress.length > 10) console.log(`   ...and ${report.emptyOnPress.length - 10} more`);

console.log(`\n3. Console-only Buttons (No real action): ${report.consoleOnlyButtons.length}`);
report.consoleOnlyButtons.slice(0, 10).forEach(c => {
  console.log(`   ℹ️ [${c.file}:${c.line}] Console button: ${c.snippet}`);
});

console.log(`\n4. Unrealistic / "AI-like" Robotic Placeholders: ${report.roboticAiPlaceholders.length}`);
report.roboticAiPlaceholders.slice(0, 15).forEach(r => {
  console.log(`   🤖 [${r.file}:${r.line}] Matched ${r.matched}: ${r.snippet}`);
});
if (report.roboticAiPlaceholders.length > 15) console.log(`   ...and ${report.roboticAiPlaceholders.length - 15} more`);

// Write full report JSON
fs.writeFileSync(path.join(__dirname, 'audit_report.json'), JSON.stringify(report, null, 2));
console.log('\nFull detailed report saved to scripts/audit_report.json');
