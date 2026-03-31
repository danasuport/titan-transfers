import { defineField, defineType } from 'sanity'

export const servicePage = defineType({
  name: 'servicePage',
  title: 'Service Page',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({
      name: 'serviceType',
      title: 'Service Type',
      type: 'string',
      options: { list: ['airport', 'port', 'trainStation', 'cityToCity'] },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'description', title: 'Description', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'seoTitle', title: 'SEO Title', type: 'string' }),
    defineField({ name: 'seoDescription', title: 'SEO Description', type: 'text', rows: 3 }),
    defineField({ name: 'featuredImage', title: 'Featured Image', type: 'image', options: { hotspot: true } }),
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
})
