const fs = require('fs');
const data = JSON.parse(fs.readFileSync('index.json', 'utf8'));

data.forEach(item => {
  item.folder = item.name + '-mp3';
});

fs.writeFileSync('index.json', JSON.stringify(data, null, 4));
console.log('Added folder field to all items');
