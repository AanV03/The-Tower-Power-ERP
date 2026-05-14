const fs = require('fs');
const path = require('path');

const urlsPath = path.join(__dirname, 'urls.txt');
if (!fs.existsSync(urlsPath)) {
  console.error('urls.txt not found in scripts/');
  process.exit(1);
}

const raw = fs.readFileSync(urlsPath, 'utf8');
const urls = raw
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'));

const configPath = path.join(__dirname, '..', 'lighthouserc.json');
const config = {
  ci: {
    collect: {
      url: urls,
      numberOfRuns: 1
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 1 }]
      }
    },
    upload: { target: 'temporary-public-storage' }
  }
};

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log(`Updated ${path.relative(process.cwd(), configPath)} with ${urls.length} URLs`);
