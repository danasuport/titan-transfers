import { defineField, defineType } from 'sanity'

export const route = defineType({
  name: 'route',
  title: 'Route',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({
      name: 'origin',
      title: 'Origin',
      type: 'reference',
      to: [{ type: 'airport' }, { type: 'city' }, { type: 'port' }, { type: 'trainStation' }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'originType',
      title: 'Origin Type',
      type: 'string',
      options: { list: ['airport', 'city', 'port', 'trainStation'] },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'destination', title: 'Destination', type: 'reference', to: [{ type: 'city' }], validation: (r) => r.required() }),
    defineField({ name: 'country', title: 'Country', type: 'reference', to: [{ type: 'country' }] }),
    defineField({ name: 'region', title: 'Region', type: 'reference', to: [{ type: 'region' }] }),
    defineField({ name: 'distance', title: 'Distance (km)', type: 'number' }),
    defineField({ name: 'estimatedDuration', title: 'Estimated Duration (min)', type: 'number' }),
    defineField({ name: 'description', title: 'Description', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'seoTitle', title: 'SEO Title', type: 'string' }),
    defineField({ name: 'seoDescription', title: 'SEO Description', type: 'text', rows: 3 }),
    defineField({ name: 'featuredImage', title: 'Featured Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'etoFromLocation', title: 'ETO From Location', type: 'string' }),
    defineField({ name: 'etoToLocation', title: 'ETO To Location', type: 'string' }),
    defineField({ name: 'etoFromCategory', title: 'ETO From Category', type: 'string' }),
    defineField({ name: 'etoToCategory', title: 'ETO To Category', type: 'string' }),
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
    select: { title: 'title' },
  },
})
