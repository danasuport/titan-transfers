import imageUrlBuilder from '@sanity/image-url'
import { sanityClient } from './client'

const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: { asset?: { _ref?: string }; _type?: string } | undefined | null) {
  if (!source?.asset?._ref) return null
  return builder.image(source)
}
