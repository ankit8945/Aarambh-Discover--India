const fs = require('fs');
if (fs.existsSync('data/aarambh_db.json')) {
  const db = JSON.parse(fs.readFileSync('data/aarambh_db.json', 'utf-8'));
  db.cache = {}; // Clear all caches
  fs.writeFileSync('data/aarambh_db.json', JSON.stringify(db, null, 2), 'utf-8');
  console.log('Cache cleared.');
}
