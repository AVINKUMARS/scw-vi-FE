# Payment System API Reference

## Overview

Complete API reference for the Razorpay payment integration in the ScalingWolf AI frontend.

---

## Service Module: `src/services/payment.ts`

### Types

#### `Plan`
```typescript
type Plan = 'basic' | 'standard' | 'premium'
```

#### `PlanConfig`
```typescript
interface PlanConfig {
  id: Plan
  name: string
  price: number              // in INR
  tokens: number             // monthly quota
  features: string[]
  description: string
}
```

#### `CreateOrderResponse`
Response from `POST /api/payments/create-order`
```typescript
interface CreateOrderResponse {
  order_id: string           // Razorpay order ID
  amount: number             // in paise
  currency: string           // "INR"
  plan: Plan
  key_id: string             // Razorpay public key
}
```

#### `VerifyPaymentRequest`
Request body for payment verification
```typescript
interface VerifyPaymentRequest {
  plan: Plan
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
  reset_used?: boolean       // optional, defaults to false
}
```

#### `VerifyPaymentResponse`
Response from `POST /api/payments/verify`
```typescript
interface VerifyPaymentResponse {
  status: string             // "success" or error message
  message: string
  plan: Plan
  token_quota: number
  token_used: number
  remaining: number
}
```

#### `UsageResponse`
Response from `GET /api/tokens/usage`
```typescript
interface UsageResponse {
  plan: Plan
  token_quota: number
  token_used: number
  remaining: number
  plan_end_at?: string       // ISO 8601 date string
}
```

#### `SetPlanRequest`
Request body for plan change
```typescript
interface SetPlanRequest {
  plan: Plan
  reset_used?: boolean       // optional, defaults to false
}
```

#### `SetPlanResponse`
Response from `POST /api/tokens/set-plan`
```typescript
interface SetPlanResponse {
  status: string
  message: string
  plan: Plan
  token_quota: number
  token_used: number
  remaining: number
}
```

---

## API Functions

### `createOrder(plan: Plan): Promise<CreateOrderResponse>`

Creates a Razorpay order for the specified plan.

**Parameters:**
- `plan` - Target plan: 'basic', 'standard', or 'premium'

**Returns:** Promise resolving to order details

**Throws:** Error if backend request fails

**Example:**
```typescript
try {
  const order = await createOrder('premium')
  console.log('Order ID:', order.order_id)
  console.log('Amount:', order.amount / 100, 'INR')
} catch (error) {
  console.error('Failed to create order:', error)
}
```

**Backend Endpoint:**
```
POST /api/payments/create-order
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "plan": "premium"
}

Response:
{
  "order_id": "order_abc123",
  "amount": 9900,
  "currency": "INR",
  "plan": "premium",
  "key_id": "rzp_live_xxxxx"
}
```

---

### `verifyPayment(data: VerifyPaymentRequest): Promise<VerifyPaymentResponse>`

Verifies the Razorpay payment and upgrades the user's plan.

**Parameters:**
- `data` - Payment details from Razorpay handler

**Returns:** Promise with updated plan and token info

**Throws:** Error if verification fails

**Example:**
```typescript
const data = {
  plan: 'premium',
  razorpay_order_id: 'order_abc123',
  razorpay_payment_id: 'pay_xyz789',
  razorpay_signature: 'sig_123456',
  reset_used: false
}

try {
  const response = await verifyPayment(data)
  console.log('Plan upgraded to:', response.plan)
  console.log('New quota:', response.token_quota)
} catch (error) {
  console.error('Verification failed:', error)
}
```

**Backend Endpoint:**
```
POST /api/payments/verify
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "plan": "premium",
  "razorpay_order_id": "order_abc123",
  "razorpay_payment_id": "pay_xyz789",
  "razorpay_signature": "sig_123456",
  "reset_used": false
}

Response:
{
  "status": "success",
  "message": "Plan upgraded to premium",
  "plan": "premium",
  "token_quota": 50000,
  "token_used": 0,
  "remaining": 50000
}
```

---

### `getTokenUsage(): Promise<UsageResponse>`

Gets the user's current token usage and plan information.

**Parameters:** None

**Returns:** Promise with usage details

**Throws:** Error if backend request fails

**Example:**
```typescript
const usage = await getTokenUsage()
console.log(`Using ${usage.token_used} of ${usage.token_quota} tokens`)
console.log(`Plan renews on: ${usage.plan_end_at}`)
```

**Backend Endpoint:**
```
GET /api/tokens/usage
Authorization: Bearer {JWT_TOKEN}

Response:
{
  "plan": "standard",
  "token_quota": 10000,
  "token_used": 3500,
  "remaining": 6500,
  "plan_end_at": "2024-12-15T10:30:00Z"
}
```

---

### `setPlan(plan: Plan, resetUsed?: boolean): Promise<SetPlanResponse>`

Changes the user's plan directly (no payment, for Basic or downgrades).

**Parameters:**
- `plan` - Target plan
- `resetUsed` - Optional, reset token usage to 0

**Returns:** Promise with new plan details

**Throws:** Error if plan change fails

**Example:**
```typescript
// Downgrade to basic
const response = await setPlan('basic')
console.log('Downgraded to:', response.plan)

// Downgrade and reset usage
const response2 = await setPlan('basic', true)
```

**Backend Endpoint:**
```
POST /api/tokens/set-plan
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "plan": "basic",
  "reset_used": false
}

Response:
{
  "status": "success",
  "message": "Plan changed to basic",
  "plan": "basic",
  "token_quota": 1000,
  "token_used": 0,
  "remaining": 1000
}
```

---

### `initiateCheckout(plan: Plan, onSuccess: Function, onError: Function): Promise<void>`

Complete checkout flow: creates order, opens Razorpay modal, handles verification.

**Parameters:**
- `plan` - Target plan
- `onSuccess(paymentData)` - Callback when payment succeeds
- `onError(error)` - Callback if payment fails

**Example:**
```typescript
await initiateCheckout(
  'premium',
  async (paymentData) => {
    // Payment successful, apply changes
    console.log('Payment verified!')
  },
  (error) => {
    // Payment failed
    console.error('Payment error:', error.message)
  }
)
```

---

## Constants

### `PLAN_CONFIGS`

Pre-configured plan details:

```typescript
PLAN_CONFIGS = {
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 0,
    tokens: 1000,
    features: [
      '1,000 tokens/month',
      'Basic analytics',
      'Community support'
    ],
    description: 'Perfect for getting started'
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    price: 29,
    tokens: 10000,
    features: [
      '10,000 tokens/month',
      'Advanced analytics',
      'Email support',
      'Priority processing'
    ],
    description: 'For growing teams'
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 99,
    tokens: 50000,
    features: [
      '50,000 tokens/month',
      'Custom analytics',
      '24/7 priority support',
      'API access',
      'Dedicated account manager'
    ],
    description: 'For enterprise use'
  }
}
```

---

## Utility Functions

### `calculateCarryOver(currentQuota, currentUsed, newPlanTokens)`

Calculates token carry-over on plan upgrade.

```typescript
const carryOver = calculateCarryOver(10000, 3000, 50000)
// carryOver = {
//   newQuota: 57000,      // 50000 + (10000 - 3000)
//   newUsed: 0,
//   remaining: 57000
// }
```

### `formatTokens(count: number): string`

Formats token count for display.

```typescript
formatTokens(1000)  // "1.0K"
formatTokens(10000) // "10.0K"
formatTokens(999)   // "999"
```

### `canUpgrade(currentPlan, targetPlan): boolean`

Checks if upgrade is allowed.

```typescript
canUpgrade('basic', 'premium')   // true
canUpgrade('premium', 'basic')   // false
```

### `canDowngrade(currentPlan, targetPlan): boolean`

Checks if downgrade is allowed.

```typescript
canDowngrade('premium', 'basic')  // true
canDowngrade('basic', 'premium')  // false
```

### `getPlans(): PlanConfig[]`

Returns array of all plan configurations.

```typescript
const plans = getPlans()
// [basicPlan, standardPlan, premiumPlan]
```

---

## Components

### `<PaymentCheckoutModal />`

Modal component for payment checkout.

**Props:**
```typescript
interface PaymentCheckoutModalProps {
  isOpen: boolean
  plan: Plan
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (error: string) => void
}
```

**Usage:**
```tsx
<PaymentCheckoutModal
  isOpen={showPayment}
  plan="premium"
  onClose={() => setShowPayment(false)}
  onSuccess={(msg) => {
    console.log(msg)
    reloadUserData()
  }}
  onError={(err) => {
    console.error(err)
  }}
/>
```

---

### `<TokenUsageDisplay />`

Displays current token usage and plan info.

**Props:**
```typescript
interface TokenUsageDisplayProps {
  usage: UsageResponse | null
  isLoading?: boolean
  compact?: boolean
  onUpgrade?: () => void
}
```

**Modes:**
- `compact={false}` (default): Full card display
- `compact={true}`: Inline badge for sidebars

**Usage:**
```tsx
<TokenUsageDisplay
  usage={currentUsage}
  isLoading={isLoading}
  compact={false}
  onUpgrade={() => setShowUpgradeModal(true)}
/>
```

---

## Error Handling

All API functions throw errors that can be caught:

```typescript
try {
  const order = await createOrder('premium')
} catch (error) {
  if (error instanceof Error) {
    console.error('Error message:', error.message)
  }
}
```

Common errors:
- `"Network Error"` - API unavailable
- `"401 Unauthorized"` - Invalid JWT token
- `"Payment verification failed"` - Signature invalid
- `"Checkout initialization failed"` - Razorpay script issue

---

## Environment Variables

```env
VITE_RAZORPAY_KEY_ID=rzp_live_your_key_id
VITE_API_BASE=http://localhost:8080/api
```

---

## Integration Checklist

- [ ] Razorpay SDK installed (`npm install razorpay-checkout-js`)
- [ ] Environment variables configured
- [ ] Backend payment endpoints implemented
- [ ] Backend HMAC signature verification working
- [ ] Database plan/token schema created
- [ ] JWT authentication configured
- [ ] API error handling implemented
- [ ] Frontend components integrated
- [ ] Testing with test credentials complete
- [ ] Production keys configured
- [ ] HTTPS enabled (production)

---

## Troubleshooting

| Symptom | Cause | Solution |
|---------|-------|----------|
| "Razorpay is not defined" | Script not loaded | Ensure script loads before calling checkout |
| "CORS error" | Backend CORS not configured | Configure backend to allow frontend origin |
| "401 Unauthorized" | Invalid JWT | Check token in localStorage, re-login if needed |
| "Payment verification failed" | Wrong secret key | Verify backend uses correct Razorpay secret |
| Modal doesn't open | Missing plan state | Ensure selectedPlan is set before opening |

---

## Rate Limits

Recommended rate limits for backend:
- `/payments/create-order`: 10 req/minute per user
- `/payments/verify`: 5 req/minute per user
- `/tokens/usage`: 30 req/minute per user
- `/tokens/set-plan`: 5 req/minute per user

---

## Testing

Use Razorpay test credentials:
- **Key ID**: `rzp_test_xxxxx`
- **Test Card**: `4111 1111 1111 1111`
- **Expiry**: Any future date
- **CVV**: Any 3 digits

See: https://razorpay.com/docs/development/testing/
