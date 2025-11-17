import React from 'react'
import { X, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { initiateCheckout, verifyPayment, PLAN_CONFIGS, type Plan, type VerifyPaymentRequest } from '../services/payment'
import Button from './Button'

interface PaymentCheckoutModalProps {
  isOpen: boolean
  plan: Plan
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (error: string) => void
}

type CheckoutState = 'idle' | 'loading' | 'processing' | 'success' | 'error'

export default function PaymentCheckoutModal({
  isOpen,
  plan,
  onClose,
  onSuccess,
  onError
}: PaymentCheckoutModalProps) {
  const [state, setState] = React.useState<CheckoutState>('idle')
  const [errorMessage, setErrorMessage] = React.useState('')
  const planConfig = PLAN_CONFIGS[plan]

  const handlePayment = async () => {
    setState('loading')
    setErrorMessage('')

    try {
      await initiateCheckout(
        plan,
        async (paymentData: VerifyPaymentRequest) => {
          setState('processing')
          try {
            const response = await verifyPayment(paymentData)
            setState('success')
            onSuccess(`Successfully upgraded to ${planConfig.name} plan! You now have ${response.token_quota} tokens.`)
            setTimeout(() => {
              onClose()
              setState('idle')
            }, 2000)
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Payment verification failed'
            setState('error')
            setErrorMessage(message)
            onError(message)
          }
        },
        (error: Error) => {
          setState('error')
          setErrorMessage(error.message)
          onError(error.message)
        }
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Checkout initialization failed'
      setState('error')
      setErrorMessage(message)
      onError(message)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-md w-full border border-gray-200 dark:border-neutral-700">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-neutral-700">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Upgrade to {planConfig.name}</h2>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {state === 'idle' || state === 'loading' || state === 'processing' ? (
              <>
                {/* Plan Details */}
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Monthly Plan</p>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-3xl font-bold text-neutral-900 dark:text-white">₹{planConfig.price}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{planConfig.tokens.toLocaleString()} tokens/month</p>
                    </div>
                    {planConfig.price === 0 && (
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">FREE</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">Includes:</p>
                  <ul className="space-y-2">
                    {planConfig.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                        <CheckCircle size={16} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Error Message */}
                {state === 'idle' && errorMessage && (
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 flex gap-2">
                    <AlertCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
                  </div>
                )}

                {/* Loading Message */}
                {(state === 'processing' || state === 'loading') && (
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex gap-2">
                    <Loader2 size={16} className="text-blue-600 dark:text-blue-400 animate-spin flex-shrink-0" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {state === 'loading' ? 'Initializing payment...' : 'Verifying payment...'}
                    </p>
                  </div>
                )}
              </>
            ) : state === 'success' ? (
              <div className="text-center py-4">
                <div className="flex justify-center mb-4">
                  <CheckCircle size={48} className="text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Payment Successful!</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Your plan has been upgraded. Redirecting...
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="flex justify-center mb-4">
                  <AlertCircle size={48} className="text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Payment Failed</h3>
                <p className="text-sm text-red-600 dark:text-red-400 mb-4">{errorMessage}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-neutral-700">
            {state !== 'success' && state !== 'error' && (
              <>
                <Button variant="outline" onClick={onClose} disabled={state === 'loading' || state === 'processing'}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handlePayment}
                  disabled={state === 'loading' || state === 'processing'}
                  className="flex-1"
                >
                  {state === 'loading' || state === 'processing' ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing...
                    </>
                  ) : planConfig.price === 0 ? (
                    'Activate Free Plan'
                  ) : (
                    `Pay ₹${planConfig.price}`
                  )}
                </Button>
              </>
            )}
            {(state === 'success' || state === 'error') && (
              <Button variant="primary" onClick={onClose} className="w-full">
                {state === 'success' ? 'Continue' : 'Try Again'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
