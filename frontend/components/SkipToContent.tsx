/**
 * ✅ PHASE 2.4: Accessibility - Skip to main content link
 * Permet aux utilisateurs de clavier de sauter la navigation
 */

export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
                 focus:z-50 focus:px-6 focus:py-3 focus:bg-violet-600 focus:text-white
                 focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2
                 focus:ring-violet-400 focus:ring-offset-2"
    >
      Aller au contenu principal
    </a>
  );
}
