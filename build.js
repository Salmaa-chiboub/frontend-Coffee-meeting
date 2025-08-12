#!/usr/bin/env node

// Désactiver ESLint pour le build
process.env.DISABLE_ESLINT_PLUGIN = 'true';

// Lancer le build
const { spawn } = require('child_process');

const build = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  env: { ...process.env, DISABLE_ESLINT_PLUGIN: 'true' }
});

build.on('close', (code) => {
  process.exit(code);
});
