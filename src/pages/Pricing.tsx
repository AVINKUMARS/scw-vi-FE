import React from 'react'
import { Check, Loader2 } from 'lucide-react'
import Button from '../components/Button'
import TokenUsageDisplay from '../components/TokenUsageDisplay'
import { getPlans, canUpgrade, PLAN_CONFIGS, type Plan, type UsageResponse } from '../services/payment'
import { api } from '../lib/api'

export default function Pricing() {
  const [currentUsage, setCurrentUsage] = React.useState<UsageResponse | null>(null)
  const [isLoadingUsage, setIsLoadingUsage] = React.useState(true)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [processingPlan, setProcessingPlan] = React.useState<Plan | null>(null)
  const [successMessage, setSuccessMessage] = React.useState('')
  const [errorMessage, setErrorMessage] = React.useState('')

  // Load current usage on mount
  React.useEffect(() => {
    loadCurrentUsage()
  }, [])

  const loadCurrentUsage = async () => {
    try {
      setIsLoadingUsage(true)
      const response = await api.get('/tokens/usage')
      setCurrentUsage(response.data)
      setErrorMessage('')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to load usage'
      setErrorMessage(msg)
    } finally {
      setIsLoadingUsage(false)
    }
  }

  const handleChangePlan = async (plan: Plan) => {
    if (!currentUsage) {
      setErrorMessage('Unable to load current plan. Please try again.')
      return
    }

    // Check if plan is same as current
    if (plan === currentUsage.plan) {
      setErrorMessage('You are already on this plan!')
      return
    }

    try {
      setIsProcessing(true)
      setProcessingPlan(plan)
      setErrorMessage('')

      // Call set-plan API
      const response = await api.post('/tokens/set-plan', {
        plan: plan,
        reset_used: false
      })

      setSuccessMessage(`Successfully changed to ${PLAN_CONFIGS[plan].name} plan! You now have ${response.data.token_quota} tokens.`)
      setProcessingPlan(null)

      // Reload usage
      await loadCurrentUsage()

      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to change plan'
      setErrorMessage(msg)
      setProcessingPlan(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const plans = getPlans()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
            Flexible Pricing Plans
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Choose the perfect plan for your needs. Change anytime.
          </p>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-6 max-w-2xl mx-auto bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm font-semibold text-green-700 dark:text-green-300">✓ {successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 max-w-2xl mx-auto bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">✗ {errorMessage}</p>
          </div>
        )}

        {/* Current Usage */}
        {currentUsage && (
          <div className="mb-12 max-w-2xl mx-auto">
            <TokenUsageDisplay usage={currentUsage} isLoading={isLoadingUsage} />
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const isCurrent = currentUsage?.plan === plan.id
            const canUpgradeToThis = currentUsage ? canUpgrade(currentUsage.plan, plan.id) : false
            const isLoading = isProcessing && processingPlan === plan.id

            return (
              <div
                key={plan.id}
                className={`rounded-lg border transition-all ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 ring-2 ring-blue-500 ring-opacity-30'
                    : 'border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800'
                }`}
              >
                {/* Badge */}
                <div className="px-6 pt-6 pb-0">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{plan.name}</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{plan.description}</p>
                    </div>
                    {isCurrent && (
                      <span className="px-3 py-1 bg-blue-600 dark:bg-blue-500 text-white text-xs font-semibold rounded-lg">
                        Current
                      </span>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-700">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-neutral-900 dark:text-white">₹{plan.price}</span>
                    {plan.price > 0 && <span className="text-neutral-600 dark:text-neutral-400">/month</span>}
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                    {plan.tokens.toLocaleString()} tokens monthly
                  </p>
                </div>

                {/* Features */}
                <div className="px-6 py-6 space-y-4 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700 dark:text-neutral-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <div className="px-6 pb-6">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2 px-4 bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-neutral-300 rounded-lg font-semibold cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <Button
                      variant={canUpgradeToThis ? 'primary' : 'outline'}
                      onClick={() => handleChangePlan(plan.id)}
                      disabled={isProcessing}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Processing...
                        </>
                      ) : canUpgradeToThis ? (
                        'Upgrade'
                      ) : plan.id === 'basic' ? (
                        'Downgrade'
                      ) : (
                        'Change Plan'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-8 text-center">Common Questions</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-gray-200 dark:border-neutral-700">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">Can I change plans anytime?</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Yes! You can upgrade or downgrade your plan at any time. Your unused tokens will carry over to the new plan on upgrades.
              </p>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-gray-200 dark:border-neutral-700">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">What happens to unused tokens?</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                When you upgrade, your unused tokens from the current plan are carried over to your new plan, so you never lose credits.
              </p>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-gray-200 dark:border-neutral-700">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">How are tokens tracked?</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Your token usage is tracked in real-time. The system displays your current quota, usage, and remaining tokens.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
