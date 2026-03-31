import imageUrlBuilder from '@sanity/image-url'

const builder = imageUrlBuilder({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
})

export function urlFor(source: { asset?: { _ref?: string }; _type?: string } | undefined | null) {
  if (!source?.asset?._ref) return null
  return builder.image(source)
}
