// Prints the byte size and character count Skapi should report for a file
// after upload (readHostFile's byte_size and total_chars). Run from the repo root:
//   node .claude/skills/add-star/scripts/expected_size.js js/projects.js
var fs = require('fs');
var file = process.argv[2] || 'js/projects.js';
var buf = fs.readFileSync(file);
console.log(file + ': byte_size ' + buf.length + ', total_chars ' + buf.toString('utf8').length);
