// Cross-platform postinstall dispatcher.
// Skips download if all three ephemeris files are already present.
import { execFileSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const epheDir   = resolve(__dirname, '..', 'ephe');
const required  = ['seas_18.se1', 'semo_18.se1', 'sepl_18.se1'];

if (required.every(f => existsSync(resolve(epheDir, f)))) {
  console.log('bongcal: ephemeris files already present, skipping download.');
  process.exit(0);
}

if (process.platform === 'win32') {
  execFileSync(
    'powershell',
    ['-ExecutionPolicy', 'Bypass', '-File', resolve(__dirname, 'download-ephe.ps1')],
    { stdio: 'inherit' }
  );
} else {
  execFileSync('bash', [resolve(__dirname, 'download-ephe.sh')], { stdio: 'inherit' });
}
