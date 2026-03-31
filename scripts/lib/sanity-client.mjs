import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'

function readToken() {
  try {
    const env = readFileSync('.env.local', 'utf-8')
    const match = env.match(/SANITY_API_TOKEN=(.+)/)
    return match ? match[1].trim() : ''
  } catch { return '' }
}

export const client = createClient({
  projectId: '6iu2za90',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN || readToken(),
  useCdn: false,
})
