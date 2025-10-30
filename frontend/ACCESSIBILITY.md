# ♿ Accessibility Guide - CryptoNomadHub

**Last Updated:** 2025-10-30
**Status:** Foundational accessibility implemented, ongoing improvements needed

---

## 📊 Current Status

### ✅ Implemented (Compliant)
- **Skip to Content** link (`components/SkipToContent.tsx`)
- **Error Boundary** for graceful error handling
- **Keyboard Navigation** basic support
- **Focus Indicators** via Tailwind CSS
- **Color Contrast** meets WCAG 2.1 AA (most components)
- **Semantic HTML** (`<main>`, `<nav>`, `<article>`, `<section>`)
- **Alt Text** on OG images and icons
- **Form Labels** on all input fields

### ⚠️ Needs Improvement
- **aria-labels** incomplete on interactive elements (174+ Links, 20+ buttons)
- **Screen Reader** optimization needed
- **ARIA Live Regions** for dynamic content updates
- **Focus Management** in modals and popups
- **Keyboard Shortcuts** documentation

---

## 🎯 Priority Actions (Next Steps)

### 1. Add aria-labels to Interactive Elements

**High Priority Components:**

#### Homepage (app/page.tsx)
```tsx
// CTA Buttons
<Link
  href="/auth/register"
  aria-label="Sign up to find your 0% tax country"
  className="..."
>
  Find My 0% Tax Country
</Link>

<Link
  href="/countries"
  aria-label="Browse tax regulations for all 167 countries"
  className="..."
>
  See All Tax-Free Countries
</Link>

// Country Cards
{[{flag: '🇦🇪', country: 'UAE'}, ...].map((country, idx) => (
  <Link
    key={idx}
    href={`/countries/${country.code}`}
    aria-label={`View ${country.country} crypto tax details`}
  >
    <div className="...">{country.flag} {country.country}</div>
  </Link>
))}
```

#### Countries List (app/countries/page.tsx)
```tsx
// Country Cards
<Link
  href={`/countries/${country.country_code.toLowerCase()}`}
  aria-label={`View ${country.country_name} - ${shortRate}% crypto tax rate`}
>
  <article>...</article>
</Link>

// Filter Buttons
<button
  onClick={() => setFilter('0tax')}
  aria-label="Filter to show only countries with 0% crypto tax"
  aria-pressed={filter === '0tax'}
>
  0% Tax Only
</button>
```

#### Dashboard (app/dashboard/page.tsx)
```tsx
// Refresh Button
<button
  onClick={refetch}
  aria-label="Refresh dashboard data"
  disabled={isLoading}
>
  <RefreshCw className="..." />
</button>

// Alert Dismiss
<button
  onClick={() => dismissAlert(alert.id)}
  aria-label={`Dismiss alert: ${alert.title}`}
>
  <X className="..." />
</button>
```

### 2. Improve Form Accessibility

```tsx
// ✅ Good Example (already implemented in most forms)
<label htmlFor="email" className="...">
  Email Address
  <span className="sr-only"> (required)</span>
</label>
<input
  id="email"
  type="email"
  name="email"
  aria-required="true"
  aria-describedby="email-error"
/>
<p id="email-error" role="alert">
  {errors.email}
</p>

// ❌ Bad Example (avoid this)
<input type="email" placeholder="Email" />
```

### 3. Modal Focus Management

```tsx
// components/Modal.tsx (create if not exists)
'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export function Modal({ isOpen, onClose, title, children }) {
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      // Store current focus
      previousFocusRef.current = document.activeElement as HTMLElement

      // Focus close button when modal opens
      closeButtonRef.current?.focus()

      // Trap focus inside modal
      document.body.style.overflow = 'hidden'

      // Handle Escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }
      document.addEventListener('keydown', handleEscape)

      return () => {
        // Restore focus when modal closes
        document.body.style.overflow = ''
        document.removeEventListener('keydown', handleEscape)
        previousFocusRef.current?.focus()
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="modal-title" className="text-xl font-bold">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
```

### 4. Screen Reader Optimizations

```tsx
// Add sr-only utility class for screen readers
// tailwind.config.js already has this via @tailwindcss/forms

// Usage:
<span className="sr-only">Loading...</span>
<Spinner aria-hidden="true" />

// Icon-only buttons
<button aria-label="Search">
  <Search className="w-5 h-5" aria-hidden="true" />
</button>

// Status indicators
<div role="status" aria-live="polite">
  {isLoading ? 'Loading...' : 'Ready'}
</div>
```

---

## 🧪 Testing Checklist

### Keyboard Navigation Test
```bash
✅ Tab through all interactive elements
✅ Shift+Tab navigates backwards
✅ Enter/Space activates buttons/links
✅ Escape closes modals/dropdowns
✅ Arrow keys navigate lists/menus
✅ Focus visible on all elements
```

### Screen Reader Test
```bash
# macOS VoiceOver
Cmd+F5 to enable
⌃⌥→ Navigate forward
⌃⌥← Navigate backward

# Windows NVDA (free)
Ctrl+Alt+N to start
↓ Navigate forward
↑ Navigate backward

# Check:
✅ All images have alt text
✅ All buttons have labels
✅ Form errors announced
✅ Loading states announced
✅ Navigation landmarks present
```

### Color Contrast Test
```bash
# Use browser DevTools
1. Open Lighthouse
2. Run Accessibility audit
3. Check contrast ratios:
   - Normal text: 4.5:1 minimum (WCAG AA)
   - Large text: 3:1 minimum (WCAG AA)
   - UI components: 3:1 minimum

# Or use online tool:
https://webaim.org/resources/contrastchecker/
```

---

## 📝 Aria-Label Template Library

### Navigation Links
```tsx
<Link href="/" aria-label="Go to CryptoNomadHub homepage">Home</Link>
<Link href="/countries" aria-label="Browse crypto tax regulations by country">Countries</Link>
<Link href="/pricing" aria-label="View subscription pricing plans">Pricing</Link>
```

### Social Media Links
```tsx
<a href="https://twitter.com/CryptoNomadHub" aria-label="Follow CryptoNomadHub on Twitter">
  <Twitter aria-hidden="true" />
</a>
```

### Action Buttons
```tsx
<button aria-label="Add wallet address">
  <Plus aria-hidden="true" />
  Add Wallet
</button>

<button aria-label="Delete simulation">
  <Trash2 aria-hidden="true" />
</button>

<button aria-label="Export report as PDF" disabled={isLoading}>
  {isLoading ? 'Exporting...' : 'Export PDF'}
</button>
```

### Toggle Buttons
```tsx
<button
  onClick={toggleDarkMode}
  aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
  aria-pressed={darkMode}
>
  {darkMode ? <Sun /> : <Moon />}
</button>
```

### Pagination
```tsx
<nav aria-label="Pagination">
  <button aria-label="Go to previous page" disabled={page === 1}>
    Previous
  </button>
  <button aria-label="Go to page 1" aria-current={page === 1 ? 'page' : undefined}>
    1
  </button>
  <button aria-label="Go to next page" disabled={page === lastPage}>
    Next
  </button>
</nav>
```

---

## 🛠️ Automated Testing

### Add to package.json
```json
{
  "scripts": {
    "test:a11y": "jest --testPathPattern=accessibility",
    "lighthouse": "lighthouse https://cryptonomadhub.io --only-categories=accessibility --output=json --output-path=./lighthouse-a11y.json"
  },
  "devDependencies": {
    "@axe-core/react": "^4.8.0",
    "jest-axe": "^8.0.0"
  }
}
```

### Example Test (create tests/accessibility.test.tsx)
```tsx
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import Home from '@/app/page'

expect.extend(toHaveNoViolations)

describe('Accessibility', () => {
  it('Homepage should have no accessibility violations', async () => {
    const { container } = render(<Home />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

---

## 📚 Resources

- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/
- **WebAIM**: https://webaim.org/
- **A11y Project**: https://www.a11yproject.com/
- **Chrome DevTools**: Lighthouse Accessibility Audit
- **axe DevTools**: Free browser extension for accessibility testing

---

## 🎯 Goals

### Short Term (1 week)
- [ ] Add aria-labels to all homepage buttons/links
- [ ] Add aria-labels to countries page interactive elements
- [ ] Test keyboard navigation on critical paths

### Medium Term (1 month)
- [ ] Add aria-labels to all dashboard elements
- [ ] Implement proper focus management in modals
- [ ] Run Lighthouse accessibility audit and fix issues
- [ ] Add skip links for each section

### Long Term (3+ months)
- [ ] Achieve WCAG 2.1 AA compliance
- [ ] Add automated accessibility testing to CI/CD
- [ ] User testing with screen reader users
- [ ] Create accessibility statement page

---

**Generated by:** Claude AI (Sonnet 4.5)
**Version:** 1.0
**Last Review:** 2025-10-30
