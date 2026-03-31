export const metadata = {
  title: 'Titan Transfers — Studio',
  description: 'Content management for Titan Transfers',
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="sanity-studio" style={{ height: '100vh' }} suppressHydrationWarning>
      {children}
    </div>
  )
}
