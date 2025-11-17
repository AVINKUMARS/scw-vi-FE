# Payment System Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

The Razorpay SDK (`razorpay-checkout-js`) has already been added to `package.json`.

### 2. Configure Environment Variables

Update `.env` with your Razorpay key:

```env
VITE_RAZORPAY_KEY_ID=rzp_live_your_key_here
```

Get your key from: Razorpay Dashboard → Settings → API Keys → Live Keys

### 3. Backend Requirements

Your backend needs to implement these endpoints:

#### POST /api/payments/create-order
```typescript
Request Body:
{
  "plan": "standard" | "premium"
}

Response:
{
  "order_id": string,
  "amount": number,        // in paise (e.g., 2900 for ₹29)
  "currency": "INR",
  "plan": string,
  "key_id": string
}
```

**Implementation Notes:**
- Generate order via Razorpay API
- Return the public key_id from your account
- Store order_id temporarily for verification

#### POST /api/payments/verify
```typescript
Request Body:
{
  "plan": "standard" | "premium",
  "razorpay_order_id": string,
  "razorpay_payment_id": string,
  "razorpay_signature": string,
  "reset_used": false
}

Response:
{
  "status": "success",
  "message": string,
  "plan": string,
  "token_quota": number,
  "token_used": number,
  "remaining": number
}
```

**Implementation Notes:**
- Verify HMAC signature using your Razorpay secret key
- Signature = HMAC-SHA256(order_id + "|" + payment_id, secret_key)
- Update user plan in database
- Apply carry-over logic for unused tokens
- Set plan_end_at to 30 days from now (for paid plans)

#### GET /api/tokens/usage (Already Expected)
```typescript
Response:
{
  "plan": "basic" | "standard" | "premium",
  "token_quota": number,
  "token_used": number,
  "remaining": number,
  "plan_end_at": string | null  // ISO timestamp for paid plans
}
```

#### POST /api/tokens/set-plan (Already Expected)
```typescript
Request Body:
{
  "plan": "basic" | "standard" | "premium",
  "reset_used": false
}

Response:
{
  "status": "success",
  "message": string,
  "plan": string,
  "token_quota": number,
  "token_used": number,
  "remaining": number
}
```

### 4. Test the Integration

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Navigate to Pricing page:**
   - Visit `http://localhost:5173/pricing`

3. **Test upgrade flow:**
   - See current plan and token usage
   - Click "Upgrade Now" on any plan
   - Modal opens with plan details
   - Click payment button
   - Razorpay checkout opens (if all APIs working)

4. **Use Razorpay Test Credentials:**
   - In test mode, use test card: `4111 1111 1111 1111`
   - Any future date and any 3-digit CVV
   - See Razorpay test docs for more test cards

### 5. Production Deployment

1. **Get Production Keys:**
   - Go to Razorpay Dashboard
   - Switch to "Live" mode
   - Copy live key_id

2. **Update Environment:**
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_live_your_key_here
   ```

3. **Verify Backend:**
   - Ensure payment endpoints use production credentials
   - Backend secret key is secure and not exposed

4. **Test Live Payments:**
   - Use real test payment methods provided by Razorpay
   - Verify payment flow end-to-end

## Component Usage

### Display Current Usage
```tsx
import TokenUsageDisplay from '@/components/TokenUsageDisplay'
import { getTokenUsage } from '@/services/payment'
import { useEffect, useState } from 'react'

export function Dashboard() {
  const [usage, setUsage] = useState(null)

  useEffect(() => {
    getTokenUsage().then(setUsage)
  }, [])

  return <TokenUsageDisplay usage={usage} />
}
```

### Show Payment Modal
```tsx
import PaymentCheckoutModal from '@/components/PaymentCheckoutModal'
import { useState } from 'react'

export function UpgradeButton() {
  const [showPayment, setShowPayment] = useState(false)

  return (
    <>
      <button onClick={() => setShowPayment(true)}>
        Upgrade to Premium
      </button>

      <PaymentCheckoutModal
        isOpen={showPayment}
        plan="premium"
        onClose={() => setShowPayment(false)}
        onSuccess={(msg) => {
          alert(msg)
          // Reload user data, navigate, etc.
        }}
        onError={(error) => {
          alert(`Error: ${error}`)
        }}
      />
    </>
  )
}
```

### Pricing Page
- Full pricing page already implemented at `/pricing`
- Shows all plans, current usage, and handles upgrades/downgrades
- No additional setup needed

## File Structure

```
src/
├── services/
│   └── payment.ts                 # Core payment service
├── components/
│   ├── PaymentCheckoutModal.tsx    # Payment modal
│   └── TokenUsageDisplay.tsx       # Usage widget
├── pages/
│   └── Pricing.tsx                 # Complete pricing page
└── lib/
    └── api.ts                      # Existing API client (handles auth)

.env                                # Environment variables
RAZORPAY_INTEGRATION.md             # Full documentation
PAYMENT_SETUP_GUIDE.md              # This file
```

## Key Concepts

### Plans
- **Basic**: Free, 1000 tokens/month
- **Standard**: ₹29/month, 10,000 tokens/month
- **Premium**: ₹99/month, 50,000 tokens/month

### Token Carry-Over
When upgrading, unused tokens carry to the new plan:
```
Carry-Over = Previous Quota - Previous Used
New Quota = Base Quota + Carry-Over
New Used = 0
```

Example: Upgrade from Standard (7K remaining) to Premium (50K base)
- New quota: 50K + 7K = 57K
- New used: 0

### Monthly Reset
- Paid plans: Token usage resets on renewal date
- Basic plan: No reset (free tier, for demo)
- plan_end_at: Set to ~30 days from now for paid plans

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Modal doesn't open | Check browser console for JS errors, ensure Razorpay script loads |
| "Payment verification failed" | Verify backend is using correct Razorpay secret key |
| Token usage shows "Failed to load" | Ensure JWT token is valid, backend /tokens/usage endpoint works |
| No plan selection in modal | Ensure `selectedPlan` state is set before opening modal |
| "Razorpay is not defined" | Wait for script to load before calling initiateCheckout |

## Security Checklist

- [ ] Never expose Razorpay secret key in frontend
- [ ] Only public key_id sent to frontend
- [ ] All API calls authenticated with JWT
- [ ] Backend verifies Razorpay signatures
- [ ] HTTPS only in production
- [ ] No payment details logged
- [ ] Rate limit payment endpoints

## Next Steps

1. **Backend Implementation**: Implement the 4 payment endpoints
2. **Testing**: Use Razorpay test credentials
3. **Production Keys**: Get live keys from Razorpay
4. **Deploy**: Push to production with live keys
5. **Monitor**: Watch payment logs and user feedback
6. **Enhancement**: Add invoices, payment history, etc.

## Support Resources

- **Razorpay Docs**: https://razorpay.com/docs/
- **Razorpay Test Cards**: https://razorpay.com/docs/development/testing/
- **API Documentation**: See `RAZORPAY_INTEGRATION.md`
- **Code**: See comments in `src/services/payment.ts`

## Additional Features to Implement

Consider these for future iterations:

- [ ] Invoice generation
- [ ] Payment history page
- [ ] Annual billing (with discount)
- [ ] Coupon/promo codes
- [ ] Refund handling
- [ ] Free trial period
- [ ] Custom tier selection
- [ ] Team billing
- [ ] Usage alerts/notifications
- [ ] Admin panel for plan management
