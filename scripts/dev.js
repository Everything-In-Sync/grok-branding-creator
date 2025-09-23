#!/usr/bin/env node
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// Start the server
const server = spawn('node', ['--import', 'tsx', 'server/index.ts'], {
  cwd: rootDir,
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
})

// Start the client
const client = spawn('vite', ['--host'], {
  cwd: rootDir,
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
})

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...')
  server.kill('SIGINT')
  client.kill('SIGINT')
  process.exit(0)
})

process.on('SIGTERM', () => {
  server.kill('SIGTERM')
  client.kill('SIGTERM')
  process.exit(0)
})
