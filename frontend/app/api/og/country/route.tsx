import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

interface Country {
  country_code: string
  country_name: string
  flag_emoji?: string
  crypto_short_rate?: number
  cgt_short_rate: number
  crypto_long_rate?: number
  cgt_long_rate: number
  holding_period_months?: number
  is_territorial?: boolean
}

async function getCountryData(code: string): Promise<Country | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
    const response = await fetch(`${apiUrl}/regulations/${code}`)
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const countryCode = searchParams.get('code')

  if (!countryCode) {
    return new Response('Missing country code', { status: 400 })
  }

  const country = await getCountryData(countryCode.toUpperCase())

  if (!country) {
    return new Response('Country not found', { status: 404 })
  }

  const shortRate = country.crypto_short_rate ?? country.cgt_short_rate
  const longRate = country.crypto_long_rate ?? country.cgt_long_rate

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.3) 10px, rgba(255,255,255,.3) 20px)',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ fontSize: '120px', marginBottom: '20px' }}>
            {country.flag_emoji || '🌍'}
          </div>
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '30px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            {country.country_name}
          </h1>
          <div style={{ display: 'flex', gap: '40px', marginBottom: '30px' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.2)',
                padding: '20px 40px',
                borderRadius: '16px',
              }}
            >
              <div style={{ fontSize: '24px', color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>
                Short-term
              </div>
              <div
                style={{
                  fontSize: '64px',
                  fontWeight: 'bold',
                  color: shortRate === 0 ? '#10b981' : 'white',
                }}
              >
                {shortRate}%
              </div>
            </div>
            {shortRate !== longRate && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.2)',
                  padding: '20px 40px',
                  borderRadius: '16px',
                }}
              >
                <div style={{ fontSize: '24px', color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>
                  Long-term
                </div>
                <div
                  style={{
                    fontSize: '64px',
                    fontWeight: 'bold',
                    color: longRate === 0 ? '#10b981' : 'white',
                  }}
                >
                  {longRate}%
                </div>
              </div>
            )}
          </div>
          {country.holding_period_months && (
            <div
              style={{
                fontSize: '20px',
                color: 'white',
                background: 'rgba(255,255,255,0.2)',
                padding: '12px 24px',
                borderRadius: '999px',
                marginBottom: '20px',
              }}
            >
              {country.holding_period_months} month holding period
            </div>
          )}
          {country.is_territorial && (
            <div
              style={{
                fontSize: '20px',
                color: 'white',
                background: 'rgba(16, 185, 129, 0.3)',
                padding: '12px 24px',
                borderRadius: '999px',
                marginBottom: '20px',
              }}
            >
              Territorial Tax System
            </div>
          )}
          <div style={{ fontSize: '28px', color: 'rgba(255,255,255,0.9)', marginTop: '40px' }}>
            CryptoNomadHub.io • 167 Countries
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
