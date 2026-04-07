const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'Frontend', 'src');
const logPattern = /console\.error\((['"`].*?['"`]),\s*([a-zA-Z_$][0-9a-zA-Z_$]*)\)/g;

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walkDir(filePath);
        } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
            sanitizeFile(filePath);
        }
    }
}

function sanitizeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (logPattern.test(content)) {
        const sanitized = content.replace(logPattern, (match, prefix, errorVar) => {
            return `console.error(${prefix}, ${errorVar}?.message || ${errorVar})`;
        });
        fs.writeFileSync(filePath, sanitized, 'utf8');
        console.log(`Sanitized: ${filePath}`);
    }
}

console.log('--- Starting Log Sanitization ---');
walkDir(targetDir);
console.log('--- Finished ---');
