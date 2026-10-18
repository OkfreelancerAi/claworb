#!/usr/bin/env node
// scripts/check-launch.js
// Lightweight CLI smoke-test for launch readiness

const required = [
  'X402_PAY_TO',
  'X402_FACILITATOR_URL',
  'BASE_RPC_URL',
  'DATABASE_URL',
];

function missingEnvs() {
  return required.filter(k => !process.env[k] || String(process.env[k]).trim() === '');
}

async function checkDatabase(url) {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: url, ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false } });
    await pool.query('SELECT 1');
    await pool.end();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err.message || err) };
  }
}

async function checkBaseRpc(url) {
  try {
    const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] }) });
    const data = await resp.json();
    return { ok: !!data.result, chainId: data.result };
  } catch (err) {
    return { ok: false, error: String(err.message || err) };
  }
}

async function checkFacilitator(url) {
  try {
    const resp = await fetch(url, { method: 'GET' });
    return { ok: resp.ok, status: resp.status };
  } catch (err) {
    return { ok: false, error: String(err.message || err) };
  }
}

(async function main(){
  console.log('\nClawOrb launch readiness check');
  const missing = missingEnvs();
  if (missing.length) {
    console.error('Missing required env vars:\n', missing.join('\n'));
    process.exitCode = 2;
    return;
  }

  console.log('✔ All required env vars are present');

  console.log('\nChecking DATABASE_URL...');
  const db = await checkDatabase(process.env.DATABASE_URL);
  console.log('DATABASE:', db);

  console.log('\nChecking BASE_RPC_URL...');
  const rpc = await checkBaseRpc(process.env.BASE_RPC_URL);
  console.log('BASE RPC:', rpc);

  console.log('\nChecking X402_FACILITATOR_URL...');
  const fac = await checkFacilitator(process.env.X402_FACILITATOR_URL);
  console.log('FACILITATOR:', fac);

  const allOk = db.ok && rpc.ok && fac.ok;
  if (!allOk) {
    console.error('\nOne or more checks failed — see above.');
    process.exitCode = 1;
    return;
  }

  console.log('\nAll checks passed — ready to launch!');
  process.exitCode = 0;
})();
