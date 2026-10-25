const fs = require('fs');
let content = fs.readFileSync('OpenGM24-detailed.json', 'utf8');
// Remove comma before closing bracket/brace with any whitespace between
content = content.replace(/,(\s*[\}\]])/g, '$1');
fs.writeFileSync('OpenGM24-detailed.json', content);
try {
  JSON.parse(content);
  console.log('Valid JSON');
} catch(e) {
  console.log('Error:', e.message);
}
