/**
 * Build + deploy to Cloudflare Workers (static assets)
 * Usage: node scripts/deploy.js   OR   npm run deploy
 */
const { spawnSync } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function runNode(scriptRel, label) {
  const result = spawnSync(process.execPath, [path.join(ROOT, scriptRel)], {
    cwd: ROOT,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    console.error(`\nDeploy failed at: ${label}`);
    process.exit(result.status || 1);
  }
}

function runWrangler(args, opts = {}) {
  const wranglerCmd =
    process.platform === 'win32'
      ? path.join(ROOT, 'node_modules', '.bin', 'wrangler.cmd')
      : path.join(ROOT, 'node_modules', '.bin', 'wrangler');

  return spawnSync(wranglerCmd, args, {
    cwd: ROOT,
    stdio: opts.stdio || 'inherit',
    encoding: opts.encoding,
  });
}

console.log('Step 1/3 — Building dist/ …');
runNode('scripts/build.js', 'build');

console.log('\nStep 2/3 — Checking Cloudflare login …');
const whoami = runWrangler(['whoami'], { stdio: 'pipe', encoding: 'utf8' });
const whoamiOut = `${whoami.stdout || ''}${whoami.stderr || ''}`;

if (/not authenticated/i.test(whoamiOut)) {
  console.error(`
Cloudflare login required.

Run once:
  cd mosanada-website
  npx wrangler login

Then deploy:
  npm run deploy
`);
  process.exit(1);
}

console.log(whoamiOut.trim());

console.log('\nStep 3/3 — Deploying to Cloudflare …');
const deploy = runWrangler(['deploy']);

if (deploy.status !== 0) {
  console.error('\nDeploy failed at: wrangler deploy');
  if (/CLOUDFLARE_API_TOKEN/i.test(`${deploy.stdout || ''}${deploy.stderr || ''}`)) {
    console.error('Set CLOUDFLARE_API_TOKEN or run: npx wrangler login');
  }
  process.exit(deploy.status || 1);
}

console.log('\nDeploy finished successfully.');
