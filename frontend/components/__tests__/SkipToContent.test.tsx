/**
 * ✅ BONUS 1: SkipToContent component tests
 */

import { render, screen } from '@testing-library/react'
import SkipToContent from '../SkipToContent'

describe('SkipToContent', () => {
  it('renders skip link', () => {
    render(<SkipToContent />)

    const link = screen.getByText('Skip to main content')
    expect(link).toBeInTheDocument()
  })

  it('has correct href', () => {
    render(<SkipToContent />)

    const link = screen.getByText('Skip to main content')
    expect(link).toHaveAttribute('href', '#main-content')
  })

  it('is hidden by default (sr-only)', () => {
    render(<SkipToContent />)

    const link = screen.getByText('Skip to main content')
    expect(link).toHaveClass('sr-only')
  })

  it('becomes visible on focus', () => {
    render(<SkipToContent />)

    const link = screen.getByText('Skip to main content')
    // Has focus classes
    expect(link.className).toContain('focus:not-sr-only')
    expect(link.className).toContain('focus:absolute')
  })
})
