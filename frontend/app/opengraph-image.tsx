import { ImageResponse } from 'next/og'

// Open Graph image metadata
export const alt = 'CryptoNomadHub - Crypto Tax Optimization for Digital Nomads'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

// Image generation
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
          padding: '40px',
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 'bold',
            marginBottom: '20px',
          }}
        >
          CryptoNomadHub
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 'normal',
            textAlign: 'center',
            opacity: 0.9,
          }}
        >
          Crypto Tax Optimization for Digital Nomads
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
