'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { X, CreditCard, Wallet, DollarSign, Lock, CheckCircle2, Zap } from 'lucide-react'
import Image from 'next/image'

type PaymentMethod = 'card' | 'momo' | 'vnpay'

type CheckoutModalProps = {
  isOpen: boolean
  onClose: () => void
  plan: {
    name: string
    credits: number
    priceUSD: number
    priceVND: number
  }
  currency: 'USD' | 'VND'
}

export default function CheckoutModal({ isOpen, onClose, plan, currency }: CheckoutModalProps) {
  const { data: session } = useSession()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [isLoadingUserData, setIsLoadingUserData] = useState(true)

  // Load user data when modal opens
  useEffect(() => {
    const loadUserData = async () => {
      if (!session?.user?.id) {
        setIsLoadingUserData(false)
        return
      }

      try {
        // Fetch user details from API
        const response = await fetch('/api/user/profile')
        const data = await response.json()
        
        if (response.ok && data.user) {
          setFormData(prev => ({
            ...prev,
            fullName: data.user.name || session.user.name || '',
            email: data.user.email || session.user.email || '',
            phone: data.user.phone || ''
          }))
        } else {
          // Fallback to session data if API fails
          setFormData(prev => ({
            ...prev,
            fullName: session.user.name || '',
            email: session.user.email || ''
          }))
        }
      } catch (error) {
        console.error('Failed to load user data:', error)
        // Fallback to session data
        setFormData(prev => ({
          ...prev,
          fullName: session.user.name || '',
          email: session.user.email || ''
        }))
      } finally {
        setIsLoadingUserData(false)
      }
    }

    if (isOpen) {
      loadUserData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, session?.user?.id])

  if (!isOpen) return null

  const price = currency === 'USD' ? `$${plan.priceUSD}` : `${plan.priceVND.toLocaleString('vi-VN')} ₫`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setPaymentSuccess(true)
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setPaymentSuccess(false)
        onClose()
      }, 2000)
    }, 2000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (paymentSuccess) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-zinc-900 border-2 border-green-500 rounded-2xl p-12 max-w-md mx-4 text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white mb-3">Payment Successful!</h2>
          <p className="text-zinc-400 mb-2">Your credits have been added to your account.</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <Zap className="w-5 h-5 text-orange-500 fill-orange-500" />
            <span className="text-xl font-black text-orange-500">+{plan.credits} Credits</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-950 border-2 border-zinc-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-950 border-b border-zinc-800 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-black text-white">Complete Your Purchase</h2>
            <p className="text-sm text-zinc-400">Secure payment powered by SSL encryption</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-zinc-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Payment Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-black text-white">Personal Information</h3>
                    {isLoadingUserData && session && (
                      <span className="text-xs text-orange-500 flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
                        Loading your info...
                      </span>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-zinc-400 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        disabled={isLoadingUserData}
                        className="w-full px-4 py-3 bg-zinc-900 border-2 border-zinc-800 focus:border-orange-500 rounded-xl text-white placeholder-zinc-500 transition-colors outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-zinc-400 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={isLoadingUserData}
                        className="w-full px-4 py-3 bg-zinc-900 border-2 border-zinc-800 focus:border-orange-500 rounded-xl text-white placeholder-zinc-500 transition-colors outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="john@example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-zinc-400 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        disabled={isLoadingUserData}
                        className="w-full px-4 py-3 bg-zinc-900 border-2 border-zinc-800 focus:border-orange-500 rounded-xl text-white placeholder-zinc-500 transition-colors outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="+84 123 456 789"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="text-lg font-black text-white mb-4">Payment Method</h3>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === 'card'
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                      }`}
                    >
                      <CreditCard className={`w-6 h-6 mx-auto mb-2 ${
                        paymentMethod === 'card' ? 'text-orange-500' : 'text-zinc-400'
                      }`} />
                      <span className={`text-xs font-bold ${
                        paymentMethod === 'card' ? 'text-orange-500' : 'text-zinc-400'
                      }`}>
                        Card
                      </span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('momo')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === 'momo'
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                      }`}
                    >
                      <Wallet className={`w-6 h-6 mx-auto mb-2 ${
                        paymentMethod === 'momo' ? 'text-orange-500' : 'text-zinc-400'
                      }`} />
                      <span className={`text-xs font-bold ${
                        paymentMethod === 'momo' ? 'text-orange-500' : 'text-zinc-400'
                      }`}>
                        Momo
                      </span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('vnpay')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === 'vnpay'
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                      }`}
                    >
                      <DollarSign className={`w-6 h-6 mx-auto mb-2 ${
                        paymentMethod === 'vnpay' ? 'text-orange-500' : 'text-zinc-400'
                      }`} />
                      <span className={`text-xs font-bold ${
                        paymentMethod === 'vnpay' ? 'text-orange-500' : 'text-zinc-400'
                      }`}>
                        VNPay
                      </span>
                    </button>
                  </div>

                  {/* Card Details (only show if card is selected) */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-zinc-400 mb-2">
                          Card Number *
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          required
                          maxLength={19}
                          className="w-full px-4 py-3 bg-zinc-900 border-2 border-zinc-800 focus:border-orange-500 rounded-xl text-white placeholder-zinc-500 transition-colors outline-none"
                          placeholder="1234 5678 9012 3456"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-zinc-400 mb-2">
                            Expiry Date *
                          </label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            required
                            maxLength={5}
                            className="w-full px-4 py-3 bg-zinc-900 border-2 border-zinc-800 focus:border-orange-500 rounded-xl text-white placeholder-zinc-500 transition-colors outline-none"
                            placeholder="MM/YY"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-bold text-zinc-400 mb-2">
                            CVV *
                          </label>
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            required
                            maxLength={3}
                            className="w-full px-4 py-3 bg-zinc-900 border-2 border-zinc-800 focus:border-orange-500 rounded-xl text-white placeholder-zinc-500 transition-colors outline-none"
                            placeholder="123"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-zinc-400 mb-2">
                          Billing Address
                        </label>
                        <input
                          type="text"
                          name="billingAddress"
                          value={formData.billingAddress}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-zinc-900 border-2 border-zinc-800 focus:border-orange-500 rounded-xl text-white placeholder-zinc-500 transition-colors outline-none"
                          placeholder="123 Main St, City, Country"
                        />
                      </div>
                    </div>
                  )}

                  {/* Momo Instructions */}
                  {paymentMethod === 'momo' && (
                    <div className="p-4 bg-pink-500/10 border-2 border-pink-500/20 rounded-xl">
                      <p className="text-sm text-zinc-300 mb-2">
                        You will be redirected to Momo app to complete the payment.
                      </p>
                      <p className="text-xs text-zinc-400">
                        Make sure you have Momo app installed on your device.
                      </p>
                    </div>
                  )}

                  {/* VNPay Instructions */}
                  {paymentMethod === 'vnpay' && (
                    <div className="p-4 bg-blue-500/10 border-2 border-blue-500/20 rounded-xl">
                      <p className="text-sm text-zinc-300 mb-2">
                        You will be redirected to VNPay gateway to complete the payment.
                      </p>
                      <p className="text-xs text-zinc-400">
                        Supports all major Vietnamese banks.
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-black rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Pay {price}
                    </>
                  )}
                </button>

                {/* Security Notice */}
                <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                  <Lock className="w-4 h-4" />
                  <span>Secured by 256-bit SSL encryption</span>
                </div>
              </form>
            </div>

            {/* Right Column - Order Summary */}
            <div>
              <div className="bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-6 sticky top-6">
                <h3 className="text-lg font-black text-white mb-4">Order Summary</h3>
                
                {/* Plan Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Plan</span>
                    <span className="font-bold text-white">{plan.name}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Credits</span>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
                      <span className="font-bold text-orange-500">{plan.credits.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="h-px bg-zinc-800"></div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Subtotal</span>
                    <span className="font-bold text-white">{price}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Tax</span>
                    <span className="font-bold text-white">$0.00</span>
                  </div>
                  
                  <div className="h-px bg-zinc-800"></div>
                  
                  <div className="flex items-center justify-between text-lg">
                    <span className="font-black text-white">Total</span>
                    <span className="font-black text-orange-500">{price}</span>
                  </div>
                </div>

                {/* Benefits */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-black text-white mb-3">What's Included:</h4>
                  {[
                    'Instant credit delivery',
                    'No expiration date',
                    'Full refund within 7 days',
                    'Premium support',
                    'Secure payment'
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <span className="text-sm text-zinc-300">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Money Back Guarantee */}
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <p className="text-xs text-center text-green-400 font-bold">
                    🛡️ 7-Day Money Back Guarantee
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

