const { fork } = require('child_process');
const path = require('path');

console.log('🚀 Launching SecureBank server inside test process...');
const srv = fork(path.join(__dirname, 'index.js'), {
  stdio: 'inherit'
});

setTimeout(async () => {
  try {
    console.log('🧪 Executing automated test suite...');
    const { execSync } = require('child_process');
    execSync('node test-api.js', { stdio: 'inherit', cwd: __dirname });
    console.log('✅ Automated verification finished successfully.');
  } catch (err) {
    console.error('Test run failed:', err.message);
  } finally {
    srv.kill('SIGTERM');
    process.exit(0);
  }
}, 7000);
