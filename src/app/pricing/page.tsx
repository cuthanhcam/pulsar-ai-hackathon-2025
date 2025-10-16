'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  CreditCard,
  Wallet,
  DollarSign,
  Star,
  Brain,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

// Lazy load heavy components
const HeaderNew = dynamic(() => import('@/components/HeaderNew'), {
  ssr: true,
  loading: () => <div className="h-20 bg-zinc-950" />
})
const Footer = dynamic(() => import('@/components/Footer'), {
  ssr: false,
  loading: () => null
})
const CheckoutModal = dynamic(() => import('@/components/CheckoutModal'), {
  ssr: false,
  loading: () => null
})
const TechCanvas = dynamic(() => import('@/components/TechCanvas'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-zinc-950" />
})

type PricingTier = {
  id: string
  name: string
  credits: number
  priceUSD: number
  priceVND: number
  popular?: boolean
  features: string[]
  color: string
  icon: any
  badge?: string
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'onetime' | 'monthly'>('onetime')
  const [currency, setCurrency] = useState<'USD' | 'VND'>('USD')
  const [showCheckout, setShowCheckout] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PricingTier | null>(null)
  const [showCanvas, setShowCanvas] = useState(false)

  // Defer canvas loading to improve initial render time
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCanvas(true)
    }, 100) // Load canvas after 100ms to prioritize content

    return () => clearTimeout(timer)
  }, [])

  const handleBuyNow = (plan: PricingTier) => {
    setSelectedPlan(plan)
    setShowCheckout(true)
  }

  const pricingTiers: PricingTier[] = [
    {
      id: 'free',
      name: 'Free Trial',
      credits: 500,
      priceUSD: 0,
      priceVND: 0,
      features: [
        '500 AI Credits',
        'Generate 2-3 courses',
        'Basic AI Assistant',
        'Progress Tracking',
        'Community Support'
      ],
      color: 'zinc',
      icon: Sparkles,
      badge: 'Get Started'
    },
    {
      id: 'starter',
      name: 'Starter',
      credits: 1500,
      priceUSD: 5,
      priceVND: 120000,
      features: [
        '1500 AI Credits/month',
        'Generate 10-12 courses',
        'Advanced AI Assistant',
        'Priority Processing',
        'Email Support',
        'Course Export'
      ],
      color: 'blue',
      icon: TrendingUp
    },
    {
      id: 'pro',
      name: 'Professional',
      credits: 4000,
      priceUSD: 12,
      priceVND: 280000,
      popular: true,
      features: [
        '4,000 AI Credits/month',
        'Generate 30+ courses',
        'Premium AI Models',
        'Fastest Processing',
        'Priority Support',
        'Advanced Analytics',
        'Custom Course Templates',
        'Team Collaboration'
      ],
      color: 'orange',
      icon: Brain,
      badge: 'Most Popular'
    },
    {
      id: 'ultimate',
      name: 'Ultimate',
      credits: 35000,
      priceUSD: 35,
      priceVND: 840000,
      features: [
        '35,000 AI Credits/month',
        'Unlimited courses',
        'GPT-5 Access',
        'Custom AI Model Development',
        'Instant Processing',
        'Dedicated Support',
        'White-label Options',
        'API Access',
        'Custom Integrations',
        'Enterprise Features'
      ],
      color: 'purple',
      icon: Star,
      badge: 'Best Value'
    }
  ]

  const paymentMethods = [
    { name: 'Credit Card', icon: CreditCard, available: true },
    { name: 'Momo', icon: Wallet, available: true },
    { name: 'VNPay', icon: DollarSign, available: true },
    { name: 'PayPal', icon: CreditCard, available: false }
  ]

  return (
    <main className="min-h-screen bg-zinc-950 relative">
      {/* Canvas Background - Deferred loading for performance */}
      {showCanvas && (
        <>
          <div className="fixed inset-0 z-0">
            <TechCanvas />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950/85 to-zinc-950 pointer-events-none"></div>
        </>
      )}

      {/* Content */}
      <div className="relative z-10">
        <HeaderNew />
      
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          {/* Background Effects - Subtle glow on top of canvas */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
          </div>

        <div className="relative container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full mb-6">
              <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span className="text-sm font-bold text-orange-500 uppercase tracking-wider">Flexible Pricing</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-6 tracking-tight">
              Simple, Transparent
              <br />
              <span className="text-orange-500">Pricing</span>
            </h1>
            
            <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
              Choose the perfect plan for your learning journey. All plans include access to our AI-powered course generation.
            </p>

            {/* Unified Toggle Control */}
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 mb-4">
              {/* Currency Toggle */}
              <div className="flex items-center gap-2 px-2 py-1.5 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-xl shadow-lg">
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-5 py-2 font-bold rounded-lg transition-all text-sm ${
                    currency === 'USD'
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  $ USD
                </button>
                <button
                  onClick={() => setCurrency('VND')}
                  className={`px-5 py-2 font-bold rounded-lg transition-all text-sm ${
                    currency === 'VND'
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  ₫ VND
                </button>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-8 bg-zinc-700"></div>

              {/* Billing Toggle with Badge */}
              <div className="relative">
                {/* SAVE 20% Badge - Positioned above */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow-lg z-10">
                  Save 20%
                </div>
                
                <div className="flex items-center gap-2 px-2 py-1.5 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-xl shadow-lg">
                  <button
                    onClick={() => setBillingCycle('onetime')}
                    className={`px-5 py-2 font-bold rounded-lg transition-all text-sm ${
                      billingCycle === 'onetime'
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    One-Time
                  </button>
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-5 py-2 font-bold rounded-lg transition-all text-sm ${
                      billingCycle === 'monthly'
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {pricingTiers.map((tier) => {
              const Icon = tier.icon
              const isPopular = tier.popular
              const isFree = tier.id === 'free'
              
              return (
                <div
                  key={tier.id}
                  className={`relative group transition-transform duration-300 hover:scale-105 ${
                    isPopular ? 'md:scale-105 lg:scale-110' : ''
                  }`}
                >
                  {/* Popular Badge */}
                  {tier.badge && (
                    <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 ${
                      isPopular ? 'bg-orange-500' : 'bg-zinc-700'
                    } text-white text-xs font-black rounded-full uppercase tracking-wider z-10`}>
                      {tier.badge}
                    </div>
                  )}

                  {/* Card */}
                  <div
                    className={`relative h-full bg-zinc-900/10 backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300 group-hover:shadow-2xl ${
                      isPopular
                        ? 'border-2 border-orange-500 shadow-xl shadow-orange-500/20 group-hover:shadow-orange-500/40'
                        : 'border-2 border-zinc-800 hover:border-orange-500/50 group-hover:shadow-orange-500/20'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="p-6 border-b border-zinc-800">
                      <div className={`w-14 h-14 ${
                        isPopular ? 'bg-orange-500' : 'bg-zinc-800'
                      } rounded-xl flex items-center justify-center mb-4`}>
                        <Icon className={`w-7 h-7 ${
                          isPopular ? 'text-white' : 'text-zinc-400'
                        }`} />
                      </div>
                      
                      <h3 className="text-2xl font-black text-white mb-3">
                        {tier.name}
                      </h3>
                      
                      <div className="mb-3">
                        {/* Show old price (strikethrough) for monthly */}
                        {!isFree && billingCycle === 'monthly' && (
                          <div className="text-sm font-semibold text-zinc-500 line-through mb-1">
                            {currency === 'USD' 
                              ? `$${tier.priceUSD}` 
                              : `${tier.priceVND.toLocaleString('en-US')} ₫`
                            }
                          </div>
                        )}
                        
                        {/* Current price */}
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black text-white">
                            {isFree 
                              ? 'Free' 
                            : currency === 'USD' 
                              ? billingCycle === 'monthly'
                                ? `$${Math.round(tier.priceUSD * 0.8)}`
                                : `$${tier.priceUSD}`
                              : billingCycle === 'monthly'
                                ? `${Math.round(tier.priceVND * 0.8).toLocaleString('en-US')} ₫`
                                : `${tier.priceVND.toLocaleString('en-US')} ₫`
                            }
                          </span>
                          {!isFree && billingCycle === 'monthly' && (
                            <span className="text-sm text-zinc-400 font-semibold">/month</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
                        <span className="font-bold text-orange-500">
                          {tier.credits.toLocaleString('en-US')} Credits
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="p-6">
                      <ul className="space-y-3 mb-6">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                              isPopular ? 'text-orange-500' : 'text-zinc-400'
                            }`} />
                            <span className="text-sm text-zinc-300 font-medium">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      {isFree ? (
                        <Link href="/ai-tutor">
                          <button
                            className="w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white border-2 border-zinc-700 hover:border-orange-500/50"
                          >
                            <span>Get Started</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleBuyNow(tier)}
                          className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                            isPopular
                              ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-white border-2 border-zinc-700 hover:border-orange-500/50'
                          }`}
                        >
                          <span>Buy Now</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Payment Methods */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-zinc-900/90 backdrop-blur-xl border-2 border-zinc-800 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-black text-white mb-6 text-center">
                Accepted Payment Methods
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  return (
                    <div
                      key={method.name}
                      className={`relative flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all ${
                        method.available
                          ? 'bg-zinc-800 border-zinc-700 hover:border-orange-500/50 cursor-pointer'
                          : 'bg-zinc-900 border-zinc-800 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {!method.available && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-zinc-700 text-zinc-400 text-[10px] font-black rounded-full">
                          SOON
                        </span>
                      )}
                      <Icon className={`w-8 h-8 ${
                        method.available ? 'text-orange-500' : 'text-zinc-600'
                      }`} />
                      <span className={`text-sm font-bold ${
                        method.available ? 'text-white' : 'text-zinc-600'
                      }`}>
                        {method.name}
                      </span>
                    </div>
                  )
                })}
              </div>

              <p className="text-center text-sm text-zinc-500 mt-6">
                All payments are secured with 256-bit SSL encryption
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-8 text-center">
              Frequently Asked <span className="text-orange-500">Questions</span>
            </h2>
            
            <div className="space-y-4">
              {[
                {
                  q: 'How do credits work?',
                  a: 'Each AI action (generating courses, asking questions, analyzing content) uses credits. The more complex the task, the more credits it uses. On average, generating a full course uses 30-50 credits.'
                },
                {
                  q: 'Can I upgrade or downgrade my plan?',
                  a: 'Yes! You can buy more credits anytime. Credits never expire and accumulate across purchases.'
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept Credit Cards, Momo, and VNPay. PayPal support is coming soon.'
                },
                {
                  q: 'Do credits expire?',
                  a: 'No! Your credits never expire. Use them whenever you want at your own pace.'
                },
                {
                  q: 'Can I get a refund?',
                  a: 'We offer a 7-day money-back guarantee if you\'re not satisfied with your purchase.'
                }
              ].map((faq, index) => (
                <div
                  key={index}
                  className="bg-zinc-900/80 backdrop-blur-md border-2 border-zinc-800 hover:border-orange-500/50 rounded-xl p-6 transition-all shadow-lg"
                >
                  <h4 className="text-lg font-bold text-white mb-2">
                    {faq.q}
                  </h4>
                  <p className="text-zinc-400 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <div className="inline-block bg-gradient-to-br from-orange-500/10 via-zinc-900/90 to-zinc-900/90 backdrop-blur-xl border-2 border-orange-500/20 rounded-3xl p-12 shadow-2xl shadow-orange-500/10">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Still not sure?
              </h2>
              <p className="text-lg text-zinc-400 mb-6 max-w-xl mx-auto">
                Start with our free trial and experience the power of AI-powered learning.
              </p>
              <Link href="/ai-tutor">
                <button className="group px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 inline-flex items-center gap-3">
                  <span className="text-lg">Try Free Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

        <Footer />
      </div>

      {/* Checkout Modal */}
      {selectedPlan && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          plan={selectedPlan}
          currency={currency}
        />
      )}
    </main>
  )
}

