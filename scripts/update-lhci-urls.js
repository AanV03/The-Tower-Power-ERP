import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
      numberOfRuns: 1,
      puppeteerScript: './scripts/lhci-login.js',
      puppeteerLaunchOptions: {
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
      },
      disableStorageReset: true
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
