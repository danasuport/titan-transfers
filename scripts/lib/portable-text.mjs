import { randomUUID } from 'crypto'

export function textBlock(text, style = 'normal') {
  return {
    _type: 'block',
    _key: randomUUID().slice(0, 12),
    style,
    markDefs: [],
    children: [{ _type: 'span', _key: randomUUID().slice(0, 8), text, marks: [] }],
  }
}

export function richText(blocks) {
  return blocks.map(b =>
    typeof b === 'string'
      ? textBlock(b)
      : textBlock(b.text, b.style || 'normal')
  )
}
