import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

interface PublicPageSSRProps {
  children: React.ReactNode
  /** Optional: hide footer */
  hideFooter?: boolean
  /** Optional: custom className for the content wrapper */
  contentClassName?: string
}

/**
 * Server Component version of PublicPageLayout
 * Always renders public header/footer (no auth check)
 * Use this for pages that need SSR
 */
export function PublicPageSSR({
  children,
  hideFooter = false,
  contentClassName = ''
}: PublicPageSSRProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <Header />

      <div className={`flex-1 ${contentClassName}`}>
        {children}
      </div>

      {!hideFooter && <Footer />}
    </div>
  )
}
