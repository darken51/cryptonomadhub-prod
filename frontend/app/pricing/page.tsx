import Link from 'next/link'
import { Check, X } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export default function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for exploring crypto tax optimization',
      features: [
        { text: '5 tax simulations/month', included: true },
        { text: '20 AI chat messages/month', included: true },
        { text: 'Access to 98 countries data', included: true },
        { text: 'DeFi audits', included: false },
        { text: 'PDF exports', included: false },
      ],
      cta: 'Get Started',
      ctaVariant: 'secondary' as const,
      href: '/auth/register',
    },
    {
      name: 'Starter',
      price: '$20',
      period: '/month',
      badge: 'popular',
      description: 'Best for individual investors',
      features: [
        { text: '50 tax simulations/month', included: true },
        { text: '200 AI chat messages/month', included: true },
        { text: '5 DeFi audits/month', included: true },
        { text: 'PDF report exports', included: true },
        { text: 'Priority email support', included: true },
      ],
      cta: 'Start Free Trial',
      ctaVariant: 'primary' as const,
      href: '/auth/register',
      highlight: true,
    },
    {
      name: 'Pro',
      price: '$50',
      period: '/month',
      badge: 'best-value',
      description: 'For professional traders',
      features: [
        { text: '500 tax simulations/month', included: true },
        { text: '2000 AI chat messages/month', included: true },
        { text: '50 DeFi audits/month', included: true },
        { text: 'Unlimited PDF exports', included: true },
        { text: 'Priority support', included: true },
      ],
      cta: 'Start Free Trial',
      ctaVariant: 'primary' as const,
      href: '/auth/register',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For teams and businesses',
      features: [
        { text: 'Unlimited everything', included: true },
        { text: 'Custom integrations', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'SLA guarantees', included: true },
        { text: 'API access', included: true },
      ],
      cta: 'Contact Sales',
      ctaVariant: 'secondary' as const,
      href: 'mailto:sales@cryptonomadhub.com',
      dark: true,
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12 space-y-3">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold">
              Simple, Transparent Pricing
            </h1>
            <p className="text-base md:text-lg text-fg-muted max-w-2xl mx-auto">
              Choose the plan that fits your needs. No hidden fees. Cancel anytime.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-24">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                variant={plan.highlight ? 'glow' : plan.dark ? 'gradient' : 'default'}
                className={`flex flex-col bento-card ${plan.highlight ? 'scale-105 md:scale-110' : ''}`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-4">
                    <CardTitle className={plan.dark ? 'text-white' : ''}>{plan.name}</CardTitle>
                    {plan.badge === 'popular' && <Badge variant="popular" size="sm">POPULAR</Badge>}
                    {plan.badge === 'best-value' && <Badge variant="savings" size="sm">BEST VALUE</Badge>}
                  </div>

                  <div className="mb-4">
                    <span className={`text-5xl font-extrabold ${plan.dark ? 'text-white' : 'text-fg'}`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className={plan.dark ? 'text-gray-300' : 'text-fg-muted'}>
                        {plan.period}
                      </span>
                    )}
                  </div>

                  <CardDescription className={plan.dark ? 'text-gray-300' : ''}>
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className={`w-5 h-5 flex-shrink-0 ${plan.dark ? 'text-emerald-400' : 'text-green-600'} mt-0.5`} />
                        ) : (
                          <X className="w-5 h-5 flex-shrink-0 text-gray-400 mt-0.5" />
                        )}
                        <span className={`text-sm ${plan.dark ? 'text-gray-200' : feature.included ? 'text-fg' : 'text-fg-muted/60'}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    asChild
                    variant={plan.ctaVariant}
                    size="lg"
                    fullWidth
                    className={plan.dark ? 'bg-white hover:bg-gray-100 text-gray-900' : ''}
                  >
                    {plan.href.startsWith('mailto:') ? (
                      <a href={plan.href}>{plan.cta}</a>
                    ) : (
                      <Link href={plan.href}>{plan.cta}</Link>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              <Card variant="default">
                <CardHeader>
                  <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-fg-muted">
                    Yes, you can cancel your subscription at any time from your account settings. No questions asked.
                  </p>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardHeader>
                  <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-fg-muted">
                    We don't offer refunds for partial months, but you can cancel at any time to prevent future charges.
                  </p>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardHeader>
                  <CardTitle className="text-lg">How does billing work?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-fg-muted">
                    Billing is monthly and automatic. All payments are processed securely through Paddle, our Merchant of Record.
                  </p>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardHeader>
                  <CardTitle className="text-lg">What happens if I exceed my limits?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-fg-muted">
                    You'll be notified when you reach 80% of your monthly quota. If you exceed limits, you'll need to upgrade to continue using the service.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <Card variant="highlight" className="max-w-4xl mx-auto border-l-4 border-l-yellow-500">
            <CardContent className="pt-6">
              <p className="text-sm">
                <strong className="font-bold">⚠️ Disclaimer:</strong> NomadCrypto Hub is NOT financial, tax, or legal advice.
                All information provided is for educational purposes only. Consult with licensed tax professionals
                before making any financial decisions. See our{' '}
                <Link href="/terms" className="text-brand-primary hover:text-brand-secondary font-medium underline">
                  Terms of Service
                </Link>{' '}
                for more details.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
