export const dynamic = 'force-static'
export const revalidate = 86400

export async function GET() {
  const baseUrl = 'https://cryptonomadhub.io'
  
  const posts = [
    { slug: 'portugal-crypto-tax-2025', title: 'Portugal Crypto Tax 2025', date: '2025-01-20' },
    { slug: 'uae-vs-singapore-comparison', title: 'UAE vs Singapore Comparison', date: '2025-01-18' },
    { slug: 'tax-loss-harvesting-guide', title: 'Tax Loss Harvesting Guide', date: '2025-01-15' },
    { slug: 'solana-defi-taxes-explained', title: 'Solana DeFi Taxes', date: '2025-01-12' },
    { slug: '183-day-rule-tax-residency', title: '183-Day Rule', date: '2025-01-10' },
    { slug: 'best-crypto-countries-2025', title: 'Best Crypto Countries 2025', date: '2025-01-03' },
    { slug: 'wash-sale-rule-crypto', title: 'Wash Sale Rule Crypto', date: '2024-12-28' },
    { slug: 'nft-taxes-guide', title: 'NFT Taxes Guide', date: '2024-12-22' }
  ]

  const items = posts.map(p => 
    `    <item>
      <title>${'<![CDATA['}${p.title}${']]>'}</title>
      <link>${baseUrl}/blog/${p.slug}</link>
      <guid>${baseUrl}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
    </item>`
  ).join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>CryptoNomadHub Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Crypto tax guides and strategies</description>
    <language>en</language>
${items}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400'
    }
  })
}
