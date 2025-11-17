# Razorpay Payment Integration Documentation

## Overview

This document describes the Razorpay payment integration for the ScalingWolf AI platform. The system supports:
- Plan upgrades/downgrades (Basic, Standard, Premium)
- Token quota management with carry-over on upgrades
- Monthly subscription handling
- Full payment verification with Razorpay signatures

## Architecture

### Services

#### `src/services/payment.ts`
Main payment service module containing:

**Types:**
- `Plan`: 'basic' | 'standard' | 'premium'
- `CreateOrderResponse`: Order details from backend
- `VerifyPaymentRequest`: Payment verification data
- `VerifyPaymentResponse`: Plan and token info after payment
- `UsageResponse`: Current user's token usage and plan
- `SetPlanRequest`: Direct plan change request
- `SetPlanResponse`: Plan change response

**Plan Configurations:**
```typescript
PLAN_CONFIGS: {
  basic: { id: 'basic', name: 'Basic', price: 0, tokens: 1000, ... }
  standard: { id: 'standard', name: 'Standard', price: 29, tokens: 10000, ... }
  premium: { id: 'premium', name: 'Premium', price: 99, tokens: 50000, ... }
}
```

**API Methods:**
- `createOrder(plan)` - POST /api/payments/create-order
- `verifyPayment(data)` - POST /api/payments/verify
- `getTokenUsage()` - GET /api/tokens/usage
- `setPlan(plan, resetUsed)` - POST /api/tokens/set-plan

**Checkout Methods:**
- `initiateCheckout(plan, onSuccess, onError)` - Handles full checkout flow
- `loadRazorpayScript()` - Dynamically loads Razorpay SDK

**Utility Functions:**
- `calculateCarryOver()` - Token carry-over on upgrade
- `formatTokens()` - Format token counts (1K, 10K, etc.)
- `canUpgrade()` - Check if upgrade is allowed
- `canDowngrade()` - Check if downgrade is allowed
- `getPlans()` - Get all plan configurations

### Components

#### `src/components/PaymentCheckoutModal.tsx`
Modal dialog for payment checkout.

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

**States:**
- `idle`: Ready for payment
- `loading`: Initializing checkout
- `processing`: Payment in progress
- `success`: Payment successful
- `error`: Payment failed

**Features:**
- Plan details display
- Feature list
- Error/success messages
- Razorpay checkout integration
- Loading states with spinners

#### `src/components/TokenUsageDisplay.tsx`
Displays current token usage and plan information.

**Props:**
```typescript
interface TokenUsageDisplayProps {
  usage: UsageResponse | null
  isLoading?: boolean
  compact?: boolean
  onUpgrade?: () => void
}
```

**Features:**
- Current plan name
- Token used/remaining/total display
- Usage progress bar
- Low token warning (>80% used)
- Plan renewal date
- Upgrade link
- Compact mode for sidebars

### Pages

#### `src/pages/Pricing.tsx`
Complete pricing and plan management page.

**Features:**
- Display all available plans
- Show current plan with badge
- Load current token usage
- Handle plan selection
- Payment modal integration
- Success/error message display
- Plan comparison FAQ section
- Upgrade/downgrade buttons with proper state management

**Flow:**
1. Load current usage on component mount
2. User selects a plan
3. Open payment modal
4. Handle payment and verification
5. Refresh usage data on success

## Environment Configuration

### Required Environment Variables

Add to `.env`:
```env
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here
VITE_API_BASE=http://localhost:8080/api
```

**Note:** The actual Razorpay key ID will be provided by your backend integration. Get it from Razorpay Dashboard > Settings > API Keys.

## Backend API Endpoints

### Create Order
```
POST /api/payments/create-order
Auth: JWT required
Body: { "plan": "standard" | "premium" }
Response: {
  "order_id": "order_xxx",
  "amount": 2900,
  "currency": "INR",
  "plan": "standard",
  "key_id": "rzp_live_xxxx"
}
```

### Verify Payment
```
POST /api/payments/verify
Auth: JWT required
Body: {
  "plan": "standard",
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "sig_xxx",
  "reset_used": false
}
Response: {
  "status": "success",
  "message": "Plan upgraded successfully",
  "plan": "standard",
  "token_quota": 10000,
  "token_used": 0,
  "remaining": 10000
}
```

### Get Token Usage
```
GET /api/tokens/usage
Auth: JWT required
Response: {
  "plan": "standard",
  "token_quota": 10000,
  "token_used": 3500,
  "remaining": 6500,
  "plan_end_at": "2024-12-15T10:30:00Z"
}
```

### Set Plan (Direct Change)
```
POST /api/tokens/set-plan
Auth: JWT required
Body: {
  "plan": "basic",
  "reset_used": false
}
Response: {
  "status": "success",
  "message": "Plan changed to basic",
  "plan": "basic",
  "token_quota": 1000,
  "token_used": 0,
  "remaining": 1000
}
```

## Payment Flow

### Standard Payment Flow (Upgrade to Paid Plan)

```
User selects plan
    ↓
Modal opens with plan details
    ↓
User clicks "Pay ₹29" (or amount)
    ↓
initiateCheckout() called
    ↓
Razorpay script loaded (if not already)
    ↓
createOrder() API call to backend
    ↓
Razorpay.open() displays checkout modal
    ↓
User completes payment
    ↓
Handler receives payment response
    ↓
verifyPayment() API call to backend
    ↓
Backend verifies signature
    ↓
Backend upgrades plan and applies carry-over
    ↓
Success message displayed
    ↓
Modal closes after 2 seconds
    ↓
Page refreshes usage data
```

### Token Carry-Over Logic

When upgrading from one plan to another:

```
previousRemaining = previousQuota - previousUsed
newQuota = baseQuota[targetPlan] + previousRemaining
newUsed = 0
```

Example:
- Current: Standard (10K quota, 3K used, 7K remaining)
- Upgrade to Premium (50K base quota)
- New quota: 50K + 7K = 57K
- New used: 0
- New remaining: 57K

## Usage Examples

### Using in a Component

```typescript
import { useState } from 'react'
import PaymentCheckoutModal from '../components/PaymentCheckoutModal'
import TokenUsageDisplay from '../components/TokenUsageDisplay'
import { getTokenUsage, type Plan } from '../services/payment'

export function MyComponent() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [usage, setUsage] = useState(null)

  // Load usage
  useEffect(() => {
    getTokenUsage().then(setUsage)
  }, [])

  // Handle upgrade
  const handleUpgrade = (plan: Plan) => {
    setSelectedPlan(plan)
  }

  return (
    <div>
      <TokenUsageDisplay usage={usage} />
      <button onClick={() => handleUpgrade('premium')}>
        Upgrade to Premium
      </button>
      {selectedPlan && (
        <PaymentCheckoutModal
          isOpen={true}
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={(msg) => console.log(msg)}
          onError={(err) => console.error(err)}
        />
      )}
    </div>
  )
}
```

## Security Considerations

1. **JWT Authentication**: All API calls are authenticated via JWT in request headers
2. **HMAC Verification**: Backend verifies Razorpay signature using secret key
3. **No Token Exposure**: Razorpay key_id is public, secret stays on backend
4. **Signature Validation**: Payment verification fails if signature is invalid
5. **HTTPS Only**: Payment script should only load over HTTPS in production

## Error Handling

The payment system handles:

- **Network errors**: Shows error message and allows retry
- **Payment cancellation**: User dismisses checkout modal
- **Verification failures**: Signature mismatch, invalid order
- **API errors**: Backend API unavailable or returns error
- **Razorpay SDK load failures**: Script CDN unavailable

All errors are passed to the `onError` callback for UI handling.

## Styling

Payment components use TailwindCSS with:
- Full dark mode support
- Responsive design (mobile-friendly)
- Accessible color contrasts
- Smooth transitions and animations

## Testing

### Test Payment Flows

1. **Upgrade from Basic to Standard**
   - Go to /pricing
   - Current plan shows "Basic"
   - Click "Upgrade Now" on Standard
   - Modal opens with plan details
   - Click "Pay ₹29"
   - Use Razorpay test credentials

2. **Downgrade from Premium to Standard**
   - Similar flow but shows "Downgrade" button
   - Token quota decreases
   - Carry-over applies

3. **Check Token Usage**
   - TokenUsageDisplay shows current usage
   - Progress bar updates
   - Warning appears when >80% used

### Test Razorpay Credentials (Provided by Razorpay)

For development, Razorpay provides test credentials:
- Key ID: `rzp_test_xxxxx`
- Secret: (only needed on backend)

Test card: `4111 1111 1111 1111` (from Razorpay docs)

## Troubleshooting

### "Failed to load Razorpay script"
- Check internet connection
- Ensure `https://checkout.razorpay.com/v1/checkout.js` is accessible
- May be blocked by adblocker or corporate firewall

### "Payment verification failed"
- Backend secret key may be incorrect
- Order ID mismatch
- Payment ID not from same order
- Check backend logs

### "Token not loading"
- Ensure JWT token is in localStorage
- Check authentication status
- Verify backend /tokens/usage endpoint is working

### Modal doesn't open
- Check browser console for errors
- Ensure Razorpay script loaded successfully
- Verify `showModal` state is true

## API Integration Checklist

Before going to production:

- [ ] Razorpay account created and verified
- [ ] Production API keys obtained
- [ ] Backend payment endpoints implemented
- [ ] HMAC signature verification implemented
- [ ] Database schema for plan/token tracking
- [ ] Token usage reset logic (daily/monthly)
- [ ] Payment webhook handler (optional, for reconciliation)
- [ ] Email notifications for plan changes
- [ ] Invoice generation (optional)
- [ ] Refund handling logic (optional)
- [ ] Rate limiting on payment endpoints
- [ ] Fraud detection/prevention

## Future Enhancements

- [ ] Invoice generation and download
- [ ] Payment history view
- [ ] Bulk token purchases (independent of plans)
- [ ] Payment method updates/management
- [ ] Plan cancellation and pause
- [ ] Free trial period handling
- [ ] Coupon/promo code support
- [ ] Annual billing option (discount)
- [ ] Custom corporate plans
- [ ] Payment webhook reconciliation
- [ ] Dunning management (retried failed payments)

## Support

For issues with:
- **Razorpay Integration**: Check Razorpay docs at https://razorpay.com/docs/
- **Backend API**: Contact backend team
- **Frontend Components**: Review code comments in payment.ts and components
