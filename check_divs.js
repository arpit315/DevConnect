const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/Profile.jsx', 'utf-8');

let depth = 0;
const lines = content.split('\n');
lines.forEach((line, index) => {
    const opens = (line.match(/<div/g) || []).length;
    const closes = (line.match(/<\/div/g) || []).length;
    depth += opens;
    depth -= closes;
    if (opens > 0 || closes > 0) {
        if (depth <= 2 || closes > opens) {
            console.log(`Line ${index + 1}: depth=${depth} opens=${opens} closes=${closes} | ${line.trim()}`);
        }
    }
});
