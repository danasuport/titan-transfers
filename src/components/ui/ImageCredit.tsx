/**
 * Atribución visible para las fotos de Wikipedia/Wikimedia Commons: son
 * CC BY / CC BY-SA y la licencia exige mostrar autor y licencia junto a la
 * imagen — el texto alternativo no basta. No pinta nada en las fotos propias.
 */
export function ImageCredit({ img, corner = false }: {
  img?: { creditAuthor?: string; creditLicense?: string; creditUrl?: string }
  corner?: boolean
}) {
  if (!img?.creditAuthor) return null
  const text = `© ${img.creditAuthor}${img.creditLicense ? ` · ${img.creditLicense}` : ''}`
  // Abajo a la IZQUIERDA a propósito: el botón flotante de ayuda ocupa la
  // esquina derecha y tapaba el crédito, que debe quedar legible.
  const style: React.CSSProperties = corner
    ? {
        position: 'absolute', bottom: 0, left: 0, zIndex: 2,
        padding: '2px 8px', fontSize: '0.62rem', lineHeight: 1.4,
        color: 'rgba(255,255,255,0.82)', background: 'rgba(0,0,0,0.45)',
        maxWidth: '85%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }
    : { display: 'block', marginTop: '0.35rem', fontSize: '0.68rem', color: '#94a3b8' }
  return (
    <span style={style}>
      {img.creditUrl ? (
        <a href={img.creditUrl} target="_blank" rel="noopener nofollow" style={{ color: 'inherit', textDecoration: 'none' }}>{text}</a>
      ) : text}
    </span>
  )
}
