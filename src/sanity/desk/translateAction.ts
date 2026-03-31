/**
 * Custom Sanity document action: "Generate Translation"
 *
 * Sends document content to the /api/translate endpoint
 * and saves the result in the translations field.
 *
 * To register this action, add it to sanity.config.ts:
 * document: { actions: (prev, context) => [...prev, translateAction] }
 */

import { useCallback, useState } from 'react'
import { useClient } from 'sanity'

const TRANSLATE_API = '/api/translate'

const TRANSLATABLE_TYPES = [
  'airport',
  'route',
  'city',
  'country',
  'region',
  'port',
  'trainStation',
  'servicePage',
  'blogPost',
  'page',
]

const TARGET_LANGS = ['es'] // Add more as needed: 'fr', 'de', 'it', 'pt'

function portableTextToPlain(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return ''
  return blocks
    .filter((b: any) => b._type === 'block')
    .map((b: any) =>
      b.children
        ?.filter((c: any) => c._type === 'span')
        .map((c: any) => c.text)
        .join('')
    )
    .join('\n')
}

export function translateAction(props: any) {
  const { id, type, published, draft } = props
  const client = useClient({ apiVersion: '2024-01-01' })
  const [translating, setTranslating] = useState(false)

  if (!TRANSLATABLE_TYPES.includes(type)) return null

  const doc = draft || published
  if (!doc) return null

  const onHandle = useCallback(async () => {
    setTranslating(true)

    try {
      for (const lang of TARGET_LANGS) {
        const fieldsToTranslate: Record<string, string> = {}

        if (doc.title) fieldsToTranslate.title = doc.title
        if (doc.seoTitle) fieldsToTranslate.seoTitle = doc.seoTitle
        if (doc.seoDescription) fieldsToTranslate.seoDescription = doc.seoDescription
        if (doc.excerpt) fieldsToTranslate.excerpt = doc.excerpt
        if (doc.description) {
          fieldsToTranslate.description = portableTextToPlain(doc.description)
        }

        const translatedFields: Record<string, any> = {}

        for (const [field, text] of Object.entries(fieldsToTranslate)) {
          if (!text) continue
          const res = await fetch(TRANSLATE_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text,
              targetLang: lang,
              context: `Type: ${type}, Field: ${field}`,
            }),
          })
          const data = await res.json()
          if (data.translation) {
            if (field === 'description') {
              translatedFields[field] = [
                {
                  _type: 'block',
                  _key: Math.random().toString(36).slice(2),
                  style: 'normal',
                  markDefs: [],
                  children: [
                    {
                      _type: 'span',
                      _key: Math.random().toString(36).slice(2),
                      text: data.translation,
                      marks: [],
                    },
                  ],
                },
              ]
            } else {
              translatedFields[field] = data.translation
            }
          }
        }

        // Generate translated slug from title
        if (translatedFields.title) {
          translatedFields.slug = {
            _type: 'slug',
            current: translatedFields.title
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, ''),
          }
        }

        // Patch the document
        await client
          .patch(id)
          .set({ [`translations.${lang}`]: translatedFields })
          .commit()
      }

      alert('Translations generated successfully!')
    } catch (err) {
      console.error('Translation error:', err)
      alert('Translation failed. Check the console for details.')
    } finally {
      setTranslating(false)
    }
  }, [doc, id, client])

  return {
    label: translating ? 'Translating...' : 'Generate Translation',
    onHandle,
    disabled: translating,
  }
}
