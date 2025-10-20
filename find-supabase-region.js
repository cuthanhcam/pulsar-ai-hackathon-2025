#!/usr/bin/env node
/**
 * Find the correct Supabase pooler region
 * This script tests all common AWS regions to find which one works
 */

const { Client } = require('pg')

const PROJECT_ID = 'lgobhaezmxluvqtwyfpq'
const PASSWORD = 'truongminh0949'

const regions = [
  { name: 'US East (N. Virginia)', code: 'us-east-1' },
  { name: 'US East (Ohio)', code: 'us-east-2' },
  { name: 'US West (Oregon)', code: 'us-west-1' },
  { name: 'US West (N. California)', code: 'us-west-2' },
  { name: 'Asia Pacific (Singapore)', code: 'ap-southeast-1' },
  { name: 'Asia Pacific (Sydney)', code: 'ap-southeast-2' },
  { name: 'Europe (Ireland)', code: 'eu-west-1' },
  { name: 'Europe (London)', code: 'eu-west-2' },
]

async function testRegion(region) {
  const connectionString = `postgresql://postgres.${PROJECT_ID}:${PASSWORD}@aws-0-${region.code}.pooler.supabase.com:6543/postgres`
  
  const client = new Client({ connectionString, connectionTimeoutMillis: 5000 })
  
  try {
    await client.connect()
    await client.query('SELECT NOW()')
    await client.end()
    return true
  } catch (error) {
    return false
  }
}

async function findCorrectRegion() {
  console.log('\n🔍 Finding correct Supabase region...\n')
  console.log('Testing regions:')
  console.log('=' .repeat(60))
  
  for (const region of regions) {
    process.stdout.write(`\n${region.name.padEnd(35)} ... `)
    
    const works = await testRegion(region)
    
    if (works) {
      console.log('✅ WORKS!')
      console.log('\n' + '='.repeat(60))
      console.log('\n🎉 Found working region!\n')
      console.log('📋 Use these connection strings:\n')
      console.log('DATABASE_URL:')
      console.log(`postgresql://postgres.${PROJECT_ID}:${PASSWORD}@aws-0-${region.code}.pooler.supabase.com:6543/postgres\n`)
      console.log('DIRECT_URL:')
      console.log(`postgresql://postgres.${PROJECT_ID}:${PASSWORD}@aws-0-${region.code}.pooler.supabase.com:5432/postgres\n`)
      console.log('=' .repeat(60))
      console.log('\n📝 Next steps:')
      console.log('1. Update these in your .env file')
      console.log('2. Update in Vercel Environment Variables')
      console.log('3. Redeploy Vercel\n')
      return
    } else {
      console.log('❌')
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('\n❌ No working region found!')
  console.log('\n💡 Possible solutions:')
  console.log('1. Check password is correct')
  console.log('2. Verify project ID is correct')
  console.log('3. Check Supabase project is not paused')
  console.log('4. Try direct connection in Vercel (cloud-to-cloud works better)\n')
}

findCorrectRegion().catch(console.error)

