const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const repoRoot = path.resolve(__dirname, '..');
const templateSwPath = path.join(repoRoot, 'public', 'firebase-messaging-sw.js');
const distSwPath = path.join(repoRoot, 'dist', 'firebase-messaging-sw.js');
const devSwPath = path.join(repoRoot, '.generated', 'firebase-messaging-sw.js');

function loadEnvForMode(mode) {
  const base = path.join(repoRoot, '.env');
  const local = path.join(repoRoot, '.env.local');
  const modeFile = path.join(repoRoot, `.env.${mode}`);
  const modeLocal = path.join(repoRoot, `.env.${mode}.local`);

  const result = {};

  const loadFile = (p) => {
    if (!fs.existsSync(p)) return {};
    try {
      return dotenv.parse(fs.readFileSync(p));
    } catch {
      return {};
    }
  };

  // Vite's order: .env, .env.local, .env.[mode], .env.[mode].local
  Object.assign(result, loadFile(base));
  Object.assign(result, loadFile(local));
  Object.assign(result, loadFile(modeFile));
  Object.assign(result, loadFile(modeLocal));

  // Also overlay process.env values (CI or shell)
  Object.assign(result, process.env);

  return result;
}

function detectMode() {
  const life = process.env.npm_lifecycle_event || '';
  if (life.includes('dev')) return 'development';
  if (life.includes('build')) return 'production';
  return process.env.NODE_ENV || 'production';
}

function resolveTarget(mode) {
  const arg = process.argv.find((entry) => entry.startsWith('--target='));
  if (arg) {
    const value = arg.slice('--target='.length).trim();
    if (value === 'dist') return distSwPath;
    if (value === 'dev') return devSwPath;
    console.error('[generate-sw] Unknown --target value. Use dist or dev.');
    process.exit(1);
  }

  return mode === 'development' ? devSwPath : distSwPath;
}

function injectConfig() {
  if (!fs.existsSync(templateSwPath)) {
    console.error('[generate-sw] missing template: public/firebase-messaging-sw.js');
    process.exit(1);
  }

  const mode = detectMode();
  const env = loadEnvForMode(mode);
  const outputPath = resolveTarget(mode);

  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];

  const missing = required.filter((k) => !env[k]);
  if (missing.length > 0) {
    console.error(
      '[generate-sw] Missing required environment variables for Firebase Web config:',
      missing.join(', ')
    );
    process.exit(1);
  }

  const mappings = {
    '__FIREBASE_API_KEY__': env.VITE_FIREBASE_API_KEY,
    '__FIREBASE_AUTH_DOMAIN__': env.VITE_FIREBASE_AUTH_DOMAIN,
    '__FIREBASE_PROJECT_ID__': env.VITE_FIREBASE_PROJECT_ID,
    '__FIREBASE_STORAGE_BUCKET__': env.VITE_FIREBASE_STORAGE_BUCKET,
    '__FIREBASE_MESSAGING_SENDER_ID__': env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    '__FIREBASE_APP_ID__': env.VITE_FIREBASE_APP_ID,
    '__FIREBASE_MEASUREMENT_ID__': env.VITE_FIREBASE_MEASUREMENT_ID || '',
  };

  let content = fs.readFileSync(templateSwPath, 'utf8');

  if (!content.includes('__FIREBASE_API_KEY__')) {
    console.error(
      '[generate-sw] Template public/firebase-messaging-sw.js is missing __FIREBASE_*__ placeholders. Restore the committed template before building.'
    );
    process.exit(1);
  }

  for (const [placeholder, value] of Object.entries(mappings)) {
    content = content.split(placeholder).join(String(value));
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(
    `[generate-sw] wrote injected service worker to ${path.relative(repoRoot, outputPath)} (mode ${mode})`
  );
}

injectConfig();
