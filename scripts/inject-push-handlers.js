#!/usr/bin/env node
/**
 * Post-build script to inject push notification handlers into the service worker
 * This is necessary because @ducanh2912/next-pwa doesn't properly merge custom workers
 */

const fs = require('fs')
const path = require('path')

const SW_PATH = path.join(__dirname, '..', 'public', 'sw.js')
const PUSH_SW_PATH = path.join(__dirname, '..', 'public', 'push-sw.js')

// Read the existing files
const existingSwContent = fs.readFileSync(SW_PATH, 'utf-8')
const pushHandlers = fs.readFileSync(PUSH_SW_PATH, 'utf-8')

// Check if push handlers are already injected
if (existingSwContent.includes('// Push notification handlers injected')) {
  console.log('Push handlers already injected into sw.js')
  process.exit(0)
}

// Prepend the push handlers to the service worker
// The push handlers need to be at the top so they're registered first
const newContent = `// Push notification handlers injected by inject-push-handlers.js
${pushHandlers}
// End of push notification handlers

${existingSwContent}`

fs.writeFileSync(SW_PATH, newContent)
console.log('Successfully injected push handlers into sw.js')
