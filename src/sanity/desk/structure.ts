import type { StructureBuilder } from 'sanity/structure'
import { DocumentCountDashboard } from './DocumentCountBadge'

export const deskStructure = (S: StructureBuilder) =>
  S.list()
    .title('Titan Transfers CMS')
    .items([
      // ── Dashboard with counters ──
      S.listItem()
        .title('📊  Dashboard')
        .child(
          S.component(DocumentCountDashboard)
            .title('Content Overview')
        ),

      S.divider(),

      // ── Transport Hubs ──
      S.listItem()
        .title('✈️  Airports')
        .schemaType('airport')
        .child(
          S.documentTypeList('airport')
            .title('Airports')
            .defaultOrdering([{ field: 'title', direction: 'asc' }])
        ),

      S.listItem()
        .title('🛣️  Routes')
        .schemaType('route')
        .child(
          S.documentTypeList('route')
            .title('Routes')
            .defaultOrdering([{ field: 'title', direction: 'asc' }])
        ),

      S.listItem()
        .title('⚓  Ports')
        .schemaType('port')
        .child(
          S.documentTypeList('port')
            .title('Ports')
            .defaultOrdering([{ field: 'title', direction: 'asc' }])
        ),

      S.listItem()
        .title('🚂  Train Stations')
        .schemaType('trainStation')
        .child(
          S.documentTypeList('trainStation')
            .title('Train Stations')
            .defaultOrdering([{ field: 'title', direction: 'asc' }])
        ),

      S.divider(),

      // ── Geography ──
      S.listItem()
        .title('🏙️  Cities')
        .schemaType('city')
        .child(
          S.documentTypeList('city')
            .title('Cities')
            .defaultOrdering([{ field: 'title', direction: 'asc' }])
        ),

      S.listItem()
        .title('🌍  Countries')
        .schemaType('country')
        .child(
          S.documentTypeList('country')
            .title('Countries')
            .defaultOrdering([{ field: 'title', direction: 'asc' }])
        ),

      S.listItem()
        .title('🗺️  Regions')
        .schemaType('region')
        .child(
          S.documentTypeList('region')
            .title('Regions')
            .defaultOrdering([{ field: 'title', direction: 'asc' }])
        ),

      S.divider(),

      // ── Content ──
      S.listItem()
        .title('📋  Service Pages')
        .schemaType('servicePage')
        .child(
          S.documentTypeList('servicePage')
            .title('Service Pages')
        ),

      S.listItem()
        .title('📝  Blog Posts')
        .schemaType('blogPost')
        .child(
          S.documentTypeList('blogPost')
            .title('Blog Posts')
            .defaultOrdering([{ field: 'publishDate', direction: 'desc' }])
        ),

      S.listItem()
        .title('📄  Pages')
        .schemaType('page')
        .child(
          S.documentTypeList('page')
            .title('Pages')
        ),
    ])
