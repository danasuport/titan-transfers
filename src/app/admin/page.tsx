import { redirect } from 'next/navigation'
import { isAuthed } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Acceso — Panel Titan', robots: { index: false, follow: false } }

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  if (await isAuthed()) redirect('/admin/searches/')
  const { error } = await searchParams
  const configured = !!process.env.ADMIN_PASSWORD

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#F8FAF0', fontFamily: 'system-ui, sans-serif', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '380px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '2rem' }}>
        <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.3rem', color: '#242426' }}>Panel de búsquedas</h1>
        <p style={{ margin: '0 0 1.5rem', fontSize: '0.85rem', color: '#64748b' }}>Titan Transfers · uso interno</p>

        {!configured ? (
          <p style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', margin: 0 }}>
            Falta configurar <code>ADMIN_PASSWORD</code> en las variables de entorno.
          </p>
        ) : (
          <form action="/api/admin/login/" method="POST">
            <label htmlFor="password" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#242426', marginBottom: '0.4rem' }}>
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoFocus
              required
              style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', boxSizing: 'border-box' }}
            />
            {error && (
              <p style={{ color: '#b91c1c', fontSize: '0.8rem', margin: '0.6rem 0 0' }}>Contraseña incorrecta.</p>
            )}
            <button
              type="submit"
              style={{ marginTop: '1.1rem', width: '100%', padding: '0.7rem', background: '#8BAA1D', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}
            >
              Entrar
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
