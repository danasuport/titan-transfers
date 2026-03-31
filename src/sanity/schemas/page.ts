import { defineField, defineType } from 'sanity'

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({ name: 'content', title: 'Content', type: 'array', of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }] }),
    defineField({ name: 'seoTitle', title: 'SEO Title', type: 'string' }),
    defineField({ name: 'seoDescription', title: 'SEO Description', type: 'text', rows: 3 }),
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
            defineField({ name: 'content', type: 'array', title: 'Content', of: [{ type: 'block' }] }),
            defineField({ name: 'seoTitle', type: 'string', title: 'SEO Title' }),
            defineField({ name: 'seoDescription', type: 'text', title: 'SEO Description' }),
          ],
        }),
      ],
    }),
  ],
})
