#!/usr/bin/env node

/**
 * Generate Environment Setup Script
 * Automatically generates secure environment variables for PulsarTeam AI platform
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function generateSecrets() {
  const secrets = {
    NEXTAUTH_SECRET: crypto.randomBytes(32).toString('base64'),
    ENCRYPTION_KEY: crypto.randomBytes(32).toString('hex'),
    JWT_SECRET: crypto.randomBytes(32).toString('base64'),
  };

  console.log('🔑 Generated Security Secrets:');
  console.log('================================');
  
  Object.entries(secrets).forEach(([key, value]) => {
    console.log(`${key}="${value}"`);
  });

  console.log('\n📋 Copy these values to your .env file');
  console.log('⚠️  NEVER commit these secrets to version control!');
  
  return secrets;
}

function createEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const examplePath = path.join(process.cwd(), '.env.example');
  
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists. Please update manually or delete first.');
    return;
  }

  if (!fs.existsSync(examplePath)) {
    console.log('❌ .env.example not found. Cannot create .env file.');
    return;
  }

  const secrets = generateSecrets();
  let envTemplate = fs.readFileSync(examplePath, 'utf8');
  
  // Replace placeholder values with generated secrets
  Object.entries(secrets).forEach(([key, value]) => {
    const regex = new RegExp(`${key}="[^"]*"`, 'g');
    envTemplate = envTemplate.replace(regex, `${key}="${value}"`);
  });

  fs.writeFileSync(envPath, envTemplate);
  console.log('\n✅ Created .env file with generated secrets');
  console.log('📝 Please update the remaining values in .env file:');
  console.log('   - DATABASE_URL');
  console.log('   - SMTP credentials');
  console.log('   - OAuth client IDs and secrets');
  console.log('   - QDRANT_URL and API key');
}

function validateEnv() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'NEXTAUTH_SECRET',
    'DATABASE_URL',
    'ENCRYPTION_KEY'
  ];

  const missingVars = requiredVars.filter(varName => {
    const regex = new RegExp(`^${varName}=.+`, 'm');
    return !regex.test(envContent);
  });

  if (missingVars.length > 0) {
    console.log('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.log(`   - ${varName}`));
    return false;
  }

  console.log('✅ All required environment variables are set');
  return true;
}

function main() {
  const command = process.argv[2];

  switch (command) {
    case 'secrets':
      generateSecrets();
      break;
    case 'create':
      createEnvFile();
      break;
    case 'validate':
      validateEnv();
      break;
    default:
      console.log('🔧 Environment Setup Tool');
      console.log('========================');
      console.log('Usage:');
      console.log('  node scripts/generate-env.js secrets   - Generate secure secrets');
      console.log('  node scripts/generate-env.js create    - Create .env from template');
      console.log('  node scripts/generate-env.js validate  - Validate .env file');
      console.log('');
      console.log('Quick setup:');
      console.log('  1. npm run env:create');
      console.log('  2. Edit .env with your actual values');
      console.log('  3. npm run env:validate');
  }
}

main();