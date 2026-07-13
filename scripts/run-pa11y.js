import { spawn } from "node:child_process";
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

const reportsDir = path.join(process.cwd(), 'reports');
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

function slugifyUrl(url) {
  return url.replace(/https?:\/\//, '').replace(/[\/\?\:&=#]/g, '_');
}

async function run() {
  for (const url of urls) {
    const safe = slugifyUrl(url);
    const outFile = path.join(reportsDir, `pa11y-${safe}.html`);
    console.log(`Running pa11y for ${url} -> ${outFile}`);

    await new Promise((resolve, reject) => {
      const child = spawn('pnpm', ['exec', 'pa11y', url, '--reporter', 'html'], { shell: true });
      let stdout = '';
      child.stdout.on('data', (d) => (stdout += d.toString()));
      child.stderr.on('data', (d) => process.stderr.write(d.toString()));
      child.on('close', (code) => {
        if (code === 0) {
          try {
            fs.writeFileSync(outFile, stdout, 'utf8');
            console.log(`Saved report ${outFile}`);
            resolve();
          } catch (err) {
            reject(err);
          }
        } else {
          console.error(`pa11y failed for ${url} (exit ${code})`);
          reject(new Error('pa11y failed'));
        }
      });
    }).catch((err) => {
      console.error(err.message);
      process.exitCode = 1;
    });
  }
  console.log('Pa11y run complete');
}

run();
