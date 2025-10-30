import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation - Globe with blockchain nodes
export default function Icon() {
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
          borderRadius: '6px',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Globe outline */}
          <circle cx="12" cy="12" r="9" stroke="white" stroke-width="1.5" fill="none" opacity="0.9"/>

          {/* Latitude lines */}
          <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="white" stroke-width="1" fill="none" opacity="0.6"/>

          {/* Longitude lines */}
          <path d="M 12 3 Q 16 12 12 21" stroke="white" stroke-width="1" fill="none" opacity="0.6"/>
          <path d="M 12 3 Q 8 12 12 21" stroke="white" stroke-width="1" fill="none" opacity="0.6"/>

          {/* Blockchain nodes */}
          <circle cx="12" cy="3" r="1.5" fill="white"/>
          <circle cx="21" cy="12" r="1.5" fill="white"/>
          <circle cx="12" cy="21" r="1.5" fill="white"/>
          <circle cx="3" cy="12" r="1.5" fill="white"/>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
