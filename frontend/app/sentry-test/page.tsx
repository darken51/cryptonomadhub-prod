'use client'

import { AppHeader } from '@/components/AppHeader'
import { Footer } from '@/components/Footer'

export default function SentryTestPage() {
  const throwError = () => {
    throw new Error('🧪 Sentry Test Error - This is intentional!')
  }

  const throwAsyncError = async () => {
    await new Promise(resolve => setTimeout(resolve, 100))
    throw new Error('🧪 Sentry Async Test Error - This is intentional!')
  }

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 dark:from-slate-950 dark:to-violet-950 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              🔍 Sentry Error Tracking Test
            </h1>

            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Cliquez sur les boutons ci-dessous pour tester l'intégration Sentry:
            </p>

            <div className="space-y-4">
              {/* Test 1: Sync Error */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Test 1: Synchronous Error
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Lance une erreur JavaScript synchrone
                </p>
                <button
                  onClick={throwError}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                >
                  🚨 Throw Sync Error
                </button>
              </div>

              {/* Test 2: Async Error */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Test 2: Asynchronous Error
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Lance une erreur dans une fonction asynchrone
                </p>
                <button
                  onClick={throwAsyncError}
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors"
                >
                  ⏱️ Throw Async Error
                </button>
              </div>

              {/* Test 3: Console Error */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Test 3: Console Error
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Log une erreur dans la console
                </p>
                <button
                  onClick={() => console.error('🧪 Sentry Console Error Test')}
                  className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors"
                >
                  📝 Log Console Error
                </button>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                📊 Vérification
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Après avoir cliqué sur un bouton, vérifie ton dashboard Sentry:<br/>
                <a
                  href="https://crypto-nomad-hub.sentry.io/issues/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-semibold hover:text-blue-600"
                >
                  https://crypto-nomad-hub.sentry.io/issues/
                </a>
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
                Tu devrais voir l'erreur apparaître avec:
              </p>
              <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1">
                <li>Stack trace complet</li>
                <li>Informations du navigateur</li>
                <li>URL de la page</li>
                <li>Session replay (si activé)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
