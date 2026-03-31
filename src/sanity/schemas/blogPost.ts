import { defineField, defineType } from 'sanity'

export const blogPost = defineType({
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: { list: ['event', 'guide', 'news', 'tips'] },
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
        { type: 'bookingCTA' },
      ],
    }),
    defineField({ name: 'excerpt', title: 'Excerpt', type: 'text', rows: 3 }),
    defineField({ name: 'featuredImage', title: 'Featured Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'publishDate', title: 'Publish Date', type: 'date' }),
    defineField({ name: 'seoTitle', title: 'SEO Title', type: 'string' }),
    defineField({ name: 'seoDescription', title: 'SEO Description', type: 'text', rows: 3 }),
    defineField({ name: 'relatedCities', title: 'Related Cities', type: 'array', of: [{ type: 'reference', to: [{ type: 'city' }] }] }),
    defineField({ name: 'relatedAirports', title: 'Related Airports', type: 'array', of: [{ type: 'reference', to: [{ type: 'airport' }] }] }),
    defineField({ name: 'relatedCountries', title: 'Related Countries', type: 'array', of: [{ type: 'reference', to: [{ type: 'country' }] }] }),
    defineField({ name: 'relatedRegions', title: 'Related Regions', type: 'array', of: [{ type: 'reference', to: [{ type: 'region' }] }] }),
    defineField({ name: 'relatedRoutes', title: 'Related Routes', type: 'array', of: [{ type: 'reference', to: [{ type: 'route' }] }] }),
    defineField({
      name: 'relatedServiceType',
      title: 'Related Service Type',
      type: 'string',
      options: { list: ['airport', 'port', 'trainStation', 'cityToCity'] },
    }),
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
            defineField({ name: 'content', type: 'array', title: 'Content', of: [{ type: 'block' }, { type: 'image' }, { type: 'bookingCTA' }] }),
            defineField({ name: 'excerpt', type: 'text', title: 'Excerpt' }),
            defineField({ name: 'seoTitle', type: 'string', title: 'SEO Title' }),
            defineField({ name: 'seoDescription', type: 'text', title: 'SEO Description' }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'category', media: 'featuredImage' },
  },
  orderings: [
    { title: 'Publish Date', name: 'publishDateDesc', by: [{ field: 'publishDate', direction: 'desc' }] },
  ],
})
