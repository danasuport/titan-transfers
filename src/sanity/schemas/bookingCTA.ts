import { defineField, defineType } from 'sanity'

export const bookingCTA = defineType({
  name: 'bookingCTA',
  title: 'Booking CTA',
  type: 'object',
  fields: [
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: { list: ['auto', 'manual'] },
      initialValue: 'auto',
    }),
    defineField({ name: 'linkedAirport', title: 'Linked Airport', type: 'reference', to: [{ type: 'airport' }], hidden: ({ parent }) => parent?.type !== 'manual' }),
    defineField({ name: 'linkedCity', title: 'Linked City', type: 'reference', to: [{ type: 'city' }], hidden: ({ parent }) => parent?.type !== 'manual' }),
    defineField({ name: 'linkedRoute', title: 'Linked Route', type: 'reference', to: [{ type: 'route' }], hidden: ({ parent }) => parent?.type !== 'manual' }),
    defineField({ name: 'ctaText', title: 'CTA Text', type: 'string' }),
  ],
  preview: {
    select: { title: 'ctaText', type: 'type' },
    prepare({ title, type }) {
      return { title: title || 'Booking CTA', subtitle: `Type: ${type || 'auto'}` }
    },
  },
})
