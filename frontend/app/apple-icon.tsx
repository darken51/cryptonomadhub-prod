import { ImageResponse } from 'next/og'

// Apple touch icon metadata
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

// Image generation - Globe with blockchain nodes
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '36px',
        }}
      >
        <svg
          width="140"
          height="140"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Globe outline */}
          <circle cx="24" cy="24" r="18" stroke="white" stroke-width="2.5" fill="none" opacity="0.9"/>

          {/* Latitude lines */}
          <ellipse cx="24" cy="24" rx="18" ry="6" stroke="white" stroke-width="2" fill="none" opacity="0.6"/>
          <ellipse cx="24" cy="24" rx="18" ry="12" stroke="white" stroke-width="1.5" fill="none" opacity="0.4"/>

          {/* Longitude lines */}
          <path d="M 24 6 Q 32 24 24 42" stroke="white" stroke-width="2" fill="none" opacity="0.6"/>
          <path d="M 24 6 Q 16 24 24 42" stroke="white" stroke-width="2" fill="none" opacity="0.6"/>

          {/* Blockchain nodes */}
          <circle cx="24" cy="6" r="3" fill="white"/>
          <circle cx="36" cy="14" r="2.5" fill="white" opacity="0.8"/>
          <circle cx="42" cy="24" r="3" fill="white"/>
          <circle cx="36" cy="34" r="2.5" fill="white" opacity="0.8"/>
          <circle cx="24" cy="42" r="3" fill="white"/>
          <circle cx="12" cy="34" r="2.5" fill="white" opacity="0.8"/>
          <circle cx="6" cy="24" r="3" fill="white"/>
          <circle cx="12" cy="14" r="2.5" fill="white" opacity="0.8"/>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
