import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // Private routes that should be blocked from all crawlers (including AI)
  const privateRoutes = [
    '/api/',
    '/admin/',
    '/dashboard/',
    '/settings/',
    '/auth/',
    '/simulations/',
    '/cost-basis/',
    '/defi-audit/',
    '/portfolio/',
    '/wallets/',
    '/chat/',
    '/tax-optimizer/',
    '/yield/',
    '/nft/',
  ]

  return {
    rules: [
      // Allow all standard crawlers (Google, Bing, etc.) to public pages only
      {
        userAgent: '*',
        allow: '/',
        disallow: privateRoutes,
      },
      // ✅ Allow OpenAI GPTBot (ChatGPT Search & training)
      {
        userAgent: 'GPTBot',
        allow: [
          '/',
          '/countries/',
          '/blog/',
          '/features/',
          '/docs/',
          '/pricing',
          '/solutions/',
          '/tools',
          '/help',
          '/data',
        ],
        disallow: privateRoutes,
      },
      // ✅ Allow ChatGPT-User (ChatGPT Browse)
      {
        userAgent: 'ChatGPT-User',
        allow: [
          '/',
          '/countries/',
          '/blog/',
          '/features/',
          '/docs/',
          '/pricing',
          '/solutions/',
          '/tools',
          '/help',
          '/data',
        ],
        disallow: privateRoutes,
      },
      // ✅ Allow CCBot (Common Crawl - used by Claude, Anthropic)
      {
        userAgent: 'CCBot',
        allow: [
          '/',
          '/countries/',
          '/blog/',
          '/features/',
          '/docs/',
          '/pricing',
          '/solutions/',
          '/tools',
          '/help',
          '/data',
        ],
        disallow: privateRoutes,
      },
      // ✅ Allow ClaudeBot (Anthropic's official crawler)
      {
        userAgent: 'ClaudeBot',
        allow: [
          '/',
          '/countries/',
          '/blog/',
          '/features/',
          '/docs/',
          '/pricing',
          '/solutions/',
          '/tools',
          '/help',
          '/data',
        ],
        disallow: privateRoutes,
      },
      // ✅ Allow anthropic-ai
      {
        userAgent: 'anthropic-ai',
        allow: [
          '/',
          '/countries/',
          '/blog/',
          '/features/',
          '/docs/',
          '/pricing',
          '/solutions/',
          '/tools',
          '/help',
          '/data',
        ],
        disallow: privateRoutes,
      },
      // ✅ Allow Google-Extended (Gemini AI)
      {
        userAgent: 'Google-Extended',
        allow: [
          '/',
          '/countries/',
          '/blog/',
          '/features/',
          '/docs/',
          '/pricing',
          '/solutions/',
          '/tools',
          '/help',
          '/data',
        ],
        disallow: privateRoutes,
      },
      // ✅ Allow PerplexityBot
      {
        userAgent: 'PerplexityBot',
        allow: [
          '/',
          '/countries/',
          '/blog/',
          '/features/',
          '/docs/',
          '/pricing',
          '/solutions/',
          '/tools',
          '/help',
          '/data',
        ],
        disallow: privateRoutes,
      },
    ],
    sitemap: 'https://cryptonomadhub.io/sitemap.xml',
  }
}
