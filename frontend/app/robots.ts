import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
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
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: ['/'],
      },
      {
        userAgent: 'CCBot',
        disallow: ['/'],
      },
      {
        userAgent: 'anthropic-ai',
        disallow: ['/'],
      },
    ],
    sitemap: 'https://cryptonomadhub.io/sitemap.xml',
  }
}
