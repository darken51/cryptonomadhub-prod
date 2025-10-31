/**
 * Server Component wrapper that adds semantic <main id="main-content"> tag
 * This ensures the main tag appears in static HTML for SEO/accessibility
 */
export function MainContentWrapper({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" className="flex-1">
      {children}
    </main>
  )
}
