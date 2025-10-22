/**
 * ✅ BONUS 1: Breadcrumbs component tests
 */

import { render, screen } from '@testing-library/react'
import Breadcrumbs from '../Breadcrumbs'

describe('Breadcrumbs', () => {
  it('renders home link', () => {
    render(<Breadcrumbs items={[]} />)

    const homeLink = screen.getByLabelText('Home')
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('renders single breadcrumb item', () => {
    render(
      <Breadcrumbs
        items={[{ label: 'Dashboard' }]}
      />
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders multiple breadcrumb items', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings', href: '/settings' },
          { label: 'Profile' }
        ]}
      />
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
  })

  it('renders links for items with href', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings' }
        ]}
      />
    )

    const dashboardLink = screen.getByText('Dashboard')
    expect(dashboardLink).toHaveAttribute('href', '/dashboard')
  })

  it('marks last item as current page', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Profile' }
        ]}
      />
    )

    const lastItem = screen.getByText('Profile')
    expect(lastItem).toHaveAttribute('aria-current', 'page')
  })

  it('does not render link for last item even if href provided', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Profile', href: '/profile' }
        ]}
      />
    )

    const lastItem = screen.getByText('Profile')
    // Last item should be span, not link
    expect(lastItem.tagName).toBe('SPAN')
  })

  it('has proper accessibility attributes', () => {
    const { container } = render(
      <Breadcrumbs
        items={[{ label: 'Dashboard' }]}
      />
    )

    const nav = container.querySelector('nav')
    expect(nav).toHaveAttribute('aria-label', 'Breadcrumb')
  })
})
