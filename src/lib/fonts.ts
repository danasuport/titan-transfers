import { Russo_One, Archivo, Cairo } from 'next/font/google'

export const russoOne = Russo_One({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-russo',
})

export const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-archivo',
})

// Arabic body font used when locale === 'ar'. Cairo is a modern, highly legible
// Arabic typeface widely used across Gulf / MENA web. Loaded as a CSS variable
// so the root layout can swap it in based on locale without duplicating the tree.
export const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-cairo',
})
