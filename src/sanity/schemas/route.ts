import { defineField, defineType } from 'sanity'

/**
 * Attribution for images taken from Wikipedia/Wikimedia Commons. Those are
 * CC BY / CC BY-SA, which require the author and licence to be shown *visibly*
 * next to the image — an alt attribute is not enough. Populated automatically by
 * scripts/add-route-images-wikipedia.mjs; leave empty for imagery we own.
 */
const creditFields = [
  defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
  defineField({ name: 'creditAuthor', title: 'Autor (crédito visible)', type: 'string' }),
  defineField({ name: 'creditLicense', title: 'Licencia (ej. CC BY-SA 4.0)', type: 'string' }),
  defineField({ name: 'creditUrl', title: 'URL de la imagen original', type: 'url' }),
]

export const route = defineType({
  name: 'route',
  title: 'Route',
  type: 'document',
  fields: [
    defineField({
      name: 'hidden',
      title: 'Oculta (no publicar en la web)',
      type: 'boolean',
      initialValue: false,
      description:
        'Si está marcada, la ruta existe pero NO aparece en el sitemap, ni en los listados de aeropuerto/ciudad/región, y su página lleva noindex. Sirve para crear rutas sin exponerlas a Google todavía e irlas revelando por tandas. La URL sigue siendo accesible para previsualizarla.',
    }),
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
    defineField({ name: 'featuredImage', title: 'Featured Image', type: 'image', options: { hotspot: true }, fields: creditFields }),
    defineField({
      name: 'contentSections',
      title: 'Content Sections',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'title', title: 'Title', type: 'string' }),
          defineField({ name: 'body', title: 'Body', type: 'array', of: [{ type: 'block' }] }),
          defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true }, fields: creditFields }),
          defineField({ name: 'imagePosition', title: 'Image position', type: 'string', options: { list: ['left', 'right'], layout: 'radio' }, initialValue: 'left' }),
          defineField({ name: 'imageAlt', title: 'Image alt text', type: 'string' }),
        ],
        preview: { select: { title: 'title', media: 'image' } },
      }],
    }),
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
            defineField({
              name: 'contentSections',
              title: 'Content Sections',
              type: 'array',
              of: [{
                type: 'object',
                fields: [
                  defineField({ name: 'title', title: 'Title', type: 'string' }),
                  defineField({ name: 'body', title: 'Body', type: 'array', of: [{ type: 'block' }] }),
                  defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
                  defineField({ name: 'imagePosition', title: 'Image position', type: 'string', options: { list: ['left', 'right'], layout: 'radio' }, initialValue: 'left' }),
                  defineField({ name: 'imageAlt', title: 'Image alt text', type: 'string' }),
                ],
                preview: { select: { title: 'title', media: 'image' } },
              }],
            }),
          ],
        }),
        defineField({
          name: 'ar',
          title: 'Arabic',
          type: 'object',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Title' }),
            defineField({ name: 'slug', type: 'slug', title: 'Slug' }),
            defineField({ name: 'description', type: 'array', title: 'Description', of: [{ type: 'block' }] }),
            defineField({ name: 'seoTitle', type: 'string', title: 'SEO Title' }),
            defineField({ name: 'seoDescription', type: 'text', title: 'SEO Description' }),
            defineField({
              name: 'contentSections',
              title: 'Content Sections',
              type: 'array',
              of: [{
                type: 'object',
                fields: [
                  defineField({ name: 'title', title: 'Title', type: 'string' }),
                  defineField({ name: 'body', title: 'Body', type: 'array', of: [{ type: 'block' }] }),
                  defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
                  defineField({ name: 'imagePosition', title: 'Image position', type: 'string', options: { list: ['left', 'right'], layout: 'radio' }, initialValue: 'left' }),
                  defineField({ name: 'imageAlt', title: 'Image alt text', type: 'string' }),
                ],
                preview: { select: { title: 'title', media: 'image' } },
              }],
            }),
          ],
        }),
        defineField({
          name: 'it',
          title: 'Italian',
          type: 'object',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Title' }),
            defineField({ name: 'slug', type: 'slug', title: 'Slug' }),
            defineField({ name: 'description', type: 'array', title: 'Description', of: [{ type: 'block' }] }),
            defineField({ name: 'seoTitle', type: 'string', title: 'SEO Title' }),
            defineField({ name: 'seoDescription', type: 'text', title: 'SEO Description' }),
            defineField({
              name: 'contentSections',
              title: 'Content Sections',
              type: 'array',
              of: [{
                type: 'object',
                fields: [
                  defineField({ name: 'title', title: 'Title', type: 'string' }),
                  defineField({ name: 'body', title: 'Body', type: 'array', of: [{ type: 'block' }] }),
                  defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
                  defineField({ name: 'imagePosition', title: 'Image position', type: 'string', options: { list: ['left', 'right'], layout: 'radio' }, initialValue: 'left' }),
                  defineField({ name: 'imageAlt', title: 'Image alt text', type: 'string' }),
                ],
                preview: { select: { title: 'title', media: 'image' } },
              }],
            }),
          ],
        }),
        defineField({
          name: 'de',
          title: 'German',
          type: 'object',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Title' }),
            defineField({ name: 'slug', type: 'slug', title: 'Slug' }),
            defineField({ name: 'description', type: 'array', title: 'Description', of: [{ type: 'block' }] }),
            defineField({ name: 'seoTitle', type: 'string', title: 'SEO Title' }),
            defineField({ name: 'seoDescription', type: 'text', title: 'SEO Description' }),
            defineField({
              name: 'contentSections',
              title: 'Content Sections',
              type: 'array',
              of: [{
                type: 'object',
                fields: [
                  defineField({ name: 'title', title: 'Title', type: 'string' }),
                  defineField({ name: 'body', title: 'Body', type: 'array', of: [{ type: 'block' }] }),
                  defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
                  defineField({ name: 'imagePosition', title: 'Image position', type: 'string', options: { list: ['left', 'right'], layout: 'radio' }, initialValue: 'left' }),
                  defineField({ name: 'imageAlt', title: 'Image alt text', type: 'string' }),
                ],
                preview: { select: { title: 'title', media: 'image' } },
              }],
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', hidden: 'hidden' },
    prepare: ({ title, hidden }) => ({ title: hidden ? `🚫 ${title}` : title, subtitle: hidden ? 'Oculta' : undefined }),
  },
})
