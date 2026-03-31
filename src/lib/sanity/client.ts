const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
const isMock = !projectId || projectId === 'placeholder'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: any = null

async function getClient() {
  if (isMock) return null
  if (_client) return _client
  const { createClient } = await import('@sanity/client')
  _client = createClient({
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    useCdn: process.env.NODE_ENV === 'production',
  })
  return _client
}

export const sanityClient = {
  fetch: async (query: string, params?: Record<string, unknown>) => {
    const client = await getClient()
    if (!client) return []
    try {
      return await client.fetch(query, params)
    } catch {
      return []
    }
  },
}
