import { defineField, defineType } from 'sanity'

export const city = defineType({
  name: 'city',
  title: 'City',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({ name: 'country', title: 'Country', type: 'reference', to: [{ type: 'country' }], validation: (r) => r.required() }),
    defineField({ name: 'region', title: 'Region', type: 'reference', to: [{ type: 'region' }] }),
    defineField({ name: 'coordinates', title: 'Coordinates', type: 'geopoint' }),
    defineField({ name: 'description', title: 'Description', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'seoTitle', title: 'SEO Title', type: 'string' }),
    defineField({ name: 'seoDescription', title: 'SEO Description', type: 'text', rows: 3 }),
    defineField({ name: 'featuredImage', title: 'Featured Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'nearbyAirports', title: 'Nearby Airports', type: 'array', of: [{ type: 'reference', to: [{ type: 'airport' }] }] }),
    defineField({ name: 'nearbyPorts', title: 'Nearby Ports', type: 'array', of: [{ type: 'reference', to: [{ type: 'port' }] }] }),
    defineField({ name: 'nearbyTrainStations', title: 'Nearby Train Stations', type: 'array', of: [{ type: 'reference', to: [{ type: 'trainStation' }] }] }),
    defineField({ name: 'relatedCities', title: 'Related Cities', type: 'array', of: [{ type: 'reference', to: [{ type: 'city' }] }] }),
    defineField({
      name: 'translations',
      title: 'Translations',
      type: 'object',
      fields: [
        defineField({
          name: 'es',
          title: 'Spanish',
          type: 'object',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Title' }),
            defineField({ name: 'slug', type: 'slug', title: 'Slug' }),
            defineField({ name: 'description', type: 'array', title: 'Description', of: [{ type: 'block' }] }),
            defineField({ name: 'seoTitle', type: 'string', title: 'SEO Title' }),
            defineField({ name: 'seoDescription', type: 'text', title: 'SEO Description' }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'country.title' },
  },
})
