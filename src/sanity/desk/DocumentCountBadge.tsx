'use client'

import { useEffect, useState } from 'react'
import { useClient } from 'sanity'

const types = [
  { type: 'airport', label: 'Airports', icon: '✈️' },
  { type: 'route', label: 'Routes', icon: '🛣️' },
  { type: 'city', label: 'Cities', icon: '🏙️' },
  { type: 'country', label: 'Countries', icon: '🌍' },
  { type: 'region', label: 'Regions', icon: '🗺️' },
  { type: 'port', label: 'Ports', icon: '⚓' },
  { type: 'trainStation', label: 'Train Stations', icon: '🚂' },
  { type: 'servicePage', label: 'Service Pages', icon: '📋' },
  { type: 'blogPost', label: 'Blog Posts', icon: '📝' },
  { type: 'page', label: 'Pages', icon: '📄' },
]

export function DocumentCountDashboard() {
  const client = useClient({ apiVersion: '2024-01-01' })
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const query = types.map((t) => `"${t.type}": count(*[_type == "${t.type}"])`).join(', ')
    client.fetch(`{ ${query} }`).then((result: Record<string, number>) => {
      setCounts(result)
      setLoading(false)
    })
  }, [client])

  const total = Object.values(counts).reduce((sum, n) => sum + n, 0)

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px 0' }}>
          Content Overview
        </h2>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          {loading ? 'Loading...' : `${total} total documents`}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '12px',
      }}>
        {types.map((t) => (
          <div
            key={t.type}
            style={{
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              background: '#fff',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{t.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#272729', lineHeight: 1.2 }}>
              {loading ? '—' : (counts[t.type] ?? 0)}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
              {t.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
