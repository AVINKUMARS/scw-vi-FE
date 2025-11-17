import { api } from '../lib/api'

export type Plan = 'basic' | 'standard' | 'premium'

export interface PlanConfig {
  id: Plan
  name: string
  price: number
  tokens: number
  features: string[]
  description: string
}

export interface CreateOrderResponse {
  order_id: string
  amount: number
  currency: string
  plan: Plan
  key_id: string
}

export interface VerifyPaymentRequest {
  plan: Plan
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
  reset_used?: boolean
}

export interface VerifyPaymentResponse {
  status: string
  message: string
  plan: Plan
  token_quota: number
  token_used: number
  remaining: number
}

export interface UsageResponse {
  plan: Plan
  token_quota: number
  token_used: number
  remaining: number
  plan_end_at?: string
}

export interface SetPlanRequest {
  plan: Plan
  reset_used?: boolean
}

export interface SetPlanResponse {
  status: string
  message: string
  plan: Plan
  token_quota: number
  token_used: number
  remaining: number
}

// Plan configurations
export const PLAN_CONFIGS: Record<Plan, PlanConfig> = {
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 0,
    tokens: 1000,
    features: ['1,000 tokens/month', 'Basic analytics', 'Community support'],
    description: 'Perfect for getting started'
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    price: 29,
    tokens: 10000,
    features: ['10,000 tokens/month', 'Advanced analytics', 'Email support', 'Priority processing'],
    description: 'For growing teams'
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 99,
    tokens: 50000,
    features: ['50,000 tokens/month', 'Custom analytics', '24/7 priority support', 'API access', 'Dedicated account manager'],
    description: 'For enterprise use'
  }
}

// API Methods

/**
 * Create a Razorpay order for payment
 */
export async function createOrder(plan: Plan): Promise<CreateOrderResponse> {
  const response = await api.post('/payments/create-order', { plan })
  return response.data
}

/**
 * Verify Razorpay payment and apply plan upgrade
 */
export async function verifyPayment(data: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
  const response = await api.post('/payments/verify', data)
  return response.data
}

/**
 * Get current token usage and plan info
 */
export async function getTokenUsage(): Promise<UsageResponse> {
  const response = await api.get('/tokens/usage')
  return response.data
}

/**
 * Change plan directly (no payment, for downgrades or basic plan)
 */
export async function setPlan(plan: Plan, resetUsed: boolean = false): Promise<SetPlanResponse> {
  const response = await api.post('/tokens/set-plan', { plan, reset_used: resetUsed })
  return response.data
}

/**
 * Initiate Razorpay checkout
 * This is a wrapper that handles the Razorpay SDK integration
 */
export async function initiateCheckout(
  plan: Plan,
  onSuccess: (paymentData: VerifyPaymentRequest) => Promise<void>,
  onError: (error: Error) => void
): Promise<void> {
  try {
    // Load Razorpay script if not already loaded
    await loadRazorpayScript()

    // Create order on backend
    const orderData = await createOrder(plan)

    // Initialize Razorpay checkout
    const options = {
      key: orderData.key_id,
      amount: orderData.amount,
      currency: orderData.currency,
      order_id: orderData.order_id,
      handler: async (response: any) => {
        try {
          // Verify payment with backend
          await onSuccess({
            plan,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            reset_used: false
          })
        } catch (error) {
          onError(error instanceof Error ? error : new Error('Payment verification failed'))
        }
      },
      prefill: {
        email: '', // Should be populated from user context
        contact: ''
      },
      theme: {
        color: '#2563eb' // Blue color from your theme
      },
      modal: {
        ondismiss: () => {
          onError(new Error('Payment cancelled'))
        }
      }
    }

    // Open Razorpay checkout
    const razorpay = new (window as any).Razorpay(options)
    razorpay.open()
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Checkout initialization failed'))
  }
}

/**
 * Load Razorpay script dynamically
 */
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if ((window as any).Razorpay) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay script'))
    document.body.appendChild(script)
  })
}

/**
 * Calculate remaining tokens after upgrade
 */
export function calculateCarryOver(
  currentQuota: number,
  currentUsed: number,
  newPlanTokens: number
): { newQuota: number; newUsed: number; remaining: number } {
  const carryOver = Math.max(0, currentQuota - currentUsed)
  const newQuota = newPlanTokens + carryOver
  const newUsed = 0
  const remaining = newQuota

  return { newQuota, newUsed, remaining }
}

/**
 * Format token count for display
 */
export function formatTokens(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

/**
 * Check if user can upgrade to a plan
 */
export function canUpgrade(currentPlan: Plan, targetPlan: Plan): boolean {
  const planOrder = { basic: 0, standard: 1, premium: 2 }
  return planOrder[targetPlan] > planOrder[currentPlan]
}

/**
 * Check if user can downgrade to a plan
 */
export function canDowngrade(currentPlan: Plan, targetPlan: Plan): boolean {
  const planOrder = { basic: 0, standard: 1, premium: 2 }
  return planOrder[targetPlan] < planOrder[currentPlan]
}

/**
 * Get plan comparison data
 */
export function getPlans(): PlanConfig[] {
  return [PLAN_CONFIGS.basic, PLAN_CONFIGS.standard, PLAN_CONFIGS.premium]
}
