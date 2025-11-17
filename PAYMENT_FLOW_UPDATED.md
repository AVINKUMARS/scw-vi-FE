# Updated Payment Flow - Direct API Integration

## Overview

The Pricing page has been **updated to directly integrate with your Razorpay APIs** without using the separate PaymentCheckoutModal component.

---

## Payment Flow

### 1. User Selects Plan on Pricing Page

When a user clicks "Upgrade Now", "Downgrade", or "Change Plan":

```
User clicks button
  ↓
handleSelectPlan(plan) called
  ↓
Check if plan is same as current (prevent duplicate)
  ↓
Route to appropriate handler
```

---

### 2. For Basic Plan (Free) - Direct API Call

```
User selects Basic plan
  ↓
handleBasicPlanChange() called
  ↓
POST /api/tokens/set-plan
  Body: {
    "plan": "basic",
    "reset_used": false
  }
  ↓
Success → Show success message
Reload usage data
Close dialog
  ↓
Error → Show error message
```

**No payment processing needed for basic plan!**

---

### 3. For Paid Plans (Standard/Premium) - Razorpay Flow

```
User selects Standard or Premium
  ↓
handlePaidPlanPayment() called
  ↓
Step 1: POST /api/payments/create-order
  Body: { "plan": "standard" }
  Response: {
    "order_id": "order_xxx",
    "amount": 2900,
    "currency": "INR",
    "plan": "standard",
    "key_id": "rzp_live_xxx"
  }
  ↓
Step 2: Load Razorpay Script
  Script URL: https://checkout.razorpay.com/v1/checkout.js
  ↓
Step 3: Open Razorpay Checkout Modal
  - Show payment form
  - User enters payment details
  - User completes payment
  ↓
Step 4: Razorpay Handler Called
  Response: {
    "razorpay_order_id": "order_xxx",
    "razorpay_payment_id": "pay_yyy",
    "razorpay_signature": "sig_zzz"
  }
  ↓
Step 5: POST /api/payments/verify
  Body: {
    "plan": "standard",
    "razorpay_order_id": "order_xxx",
    "razorpay_payment_id": "pay_yyy",
    "razorpay_signature": "sig_zzz",
    "reset_used": false
  }
  Response: {
    "status": "ok",
    "message": "upgraded to standard",
    "plan": "standard",
    "token_quota": 10000,
    "token_used": 0,
    "remaining": 10000
  }
  ↓
Success → Show success message
Reload usage data
  ↓
Error → Show error message
```

---

## Code Implementation

### Key Functions in Pricing.tsx

#### 1. handleSelectPlan(plan)
```typescript
// Entry point when user clicks a plan button
// Validates plan, checks if duplicate
// Routes to basic or paid handler
```

#### 2. handleBasicPlanChange(plan)
```typescript
// For downgrading to Basic or same-tier changes
// Calls POST /api/tokens/set-plan directly
// No Razorpay involved
```

#### 3. handlePaidPlanPayment(plan)
```typescript
// For upgrading to Standard or Premium
// Step 1: Creates order via POST /api/payments/create-order
// Step 2: Loads Razorpay script
// Step 3: Opens Razorpay checkout modal
// Step 4: Verifies payment via POST /api/payments/verify
// Step 5: Reloads user data
```

#### 4. loadRazorpayScript()
```typescript
// Dynamically loads Razorpay checkout.js script
// Only loads once, cached in window.Razorpay
```

---

## API Endpoints Called

### GET /api/tokens/usage
- **When**: On page load
- **Purpose**: Get current plan and token usage
- **Response**: Current plan, quota, used, remaining

### POST /api/tokens/set-plan
- **When**: User downgrades or changes to same tier
- **Body**: { "plan": "basic", "reset_used": false }
- **Response**: Updated plan info

### POST /api/payments/create-order
- **When**: User upgrades to paid plan
- **Body**: { "plan": "standard" | "premium" }
- **Response**: Razorpay order details (order_id, amount, key_id)

### POST /api/payments/verify
- **When**: Payment successful in Razorpay
- **Body**: Razorpay payment response + plan info
- **Response**: Updated user plan and tokens

---

## User Experience

### Success Flow
```
1. User on Pricing page
2. User clicks "Upgrade to Premium"
3. For paid plans:
   - Order created
   - Razorpay modal opens
   - User completes payment
   - Success message shown
   - Usage updated immediately
4. User sees new token quota
```

### Error Flow
```
1. User clicks upgrade button
2. Error occurs (network, API, etc.)
3. Red error message displayed
4. User can retry
5. Previous data remains unchanged
```

### Loading States
```
1. Button shows "Processing..." while request pending
2. Button is disabled to prevent double-click
3. Shows spinner icon during processing
4. After completion, button returns to normal
```

---

## Key Features

✅ **Direct API Integration**
- Uses exact endpoints you provided
- No intermediate components
- Clean, straightforward flow

✅ **Error Handling**
- Catches all API errors
- Displays user-friendly messages
- Allows retry

✅ **Loading States**
- Shows "Processing..." while pending
- Disables buttons during processing
- Prevents accidental double-submissions

✅ **Real-time Updates**
- Reloads usage after successful change
- Updates current plan badge
- Refreshes token display

✅ **Mobile Friendly**
- Responsive buttons
- Clear status messages
- Handles all screen sizes

---

## Implementation Details

### Razorpay Configuration

```typescript
const options = {
  key: key_id,                    // From /payments/create-order
  amount: amount,                 // In paise
  currency: currency,             // "INR"
  order_id: order_id,            // From /payments/create-order
  handler: async (response) => {  // Called after payment
    // Verify payment with backend
  },
  modal: {
    ondismiss: () => {            // If user cancels
      setErrorMessage('Payment cancelled')
    }
  }
}

const razorpay = new window.Razorpay(options)
razorpay.open()
```

### JWT Authentication

All API calls automatically include JWT token:
```typescript
// Automatically added by axios interceptor in src/lib/api.ts
Authorization: Bearer <JWT_TOKEN>
```

---

## Testing the Flow

### Test 1: Downgrade to Basic (No Payment)
```
1. Go to /pricing
2. Current plan displays
3. Click "Downgrade" button on Basic card
4. API call: POST /api/tokens/set-plan
5. Success message appears
6. Usage updates
```

### Test 2: Upgrade to Paid Plan
```
1. Go to /pricing
2. Click "Upgrade Now" on Standard/Premium
3. API call 1: POST /api/payments/create-order
4. Razorpay modal opens
5. Complete payment with test card
6. API call 2: POST /api/payments/verify
7. Success message appears
8. Usage updates with new quota
```

### Test 3: Error Handling
```
1. Disable network
2. Click upgrade button
3. Error message appears
4. Enable network
5. Click retry (button returns to normal)
6. Flow completes
```

---

## Status Messages

### Success Messages
- "Successfully changed to Basic plan!"
- "Successfully upgraded to Standard! You now have 10000 tokens."
- "Successfully upgraded to Premium! You now have 50000 tokens."

### Error Messages
- "Failed to load usage"
- "Failed to change plan"
- "Failed to initiate payment"
- "Payment verification failed"
- "Payment cancelled"

---

## Mobile Responsiveness

- ✅ Pricing cards stack on mobile
- ✅ Usage display optimized for small screens
- ✅ Buttons full-width on mobile
- ✅ Messages resize appropriately
- ✅ Touch-friendly button sizes

---

## Dark Mode Support

- ✅ All text readable in dark mode
- ✅ Cards have proper contrast
- ✅ Success/error messages styled correctly
- ✅ Buttons visible in both modes

---

## Integration Checklist

- [x] Frontend: Pricing page updated
- [x] API calls: Direct to your endpoints
- [x] Error handling: Comprehensive
- [x] Loading states: Complete
- [x] Mobile: Responsive
- [x] Dark mode: Supported

**Backend required:**
- [ ] GET /api/tokens/usage endpoint
- [ ] POST /api/tokens/set-plan endpoint
- [ ] POST /api/payments/create-order endpoint
- [ ] POST /api/payments/verify endpoint

---

## Next Steps

1. **Backend Implementation**
   - Implement the 4 endpoints using the guides provided
   - Test each endpoint with curl commands

2. **Test Frontend Integration**
   - Go to /pricing page
   - Test downgrade (Basic)
   - Test upgrade (Standard/Premium)
   - Test error scenarios

3. **Configure Razorpay**
   - Get test key from Razorpay
   - Update VITE_RAZORPAY_KEY_ID in .env
   - Test payment flow

4. **Deployment**
   - Deploy backend with working endpoints
   - Update frontend .env with production API URL
   - Deploy frontend

---

## Files Modified

- `src/pages/Pricing.tsx` - Complete rewrite to use direct API calls
- Removed `PaymentCheckoutModal` from Pricing page (still available for other uses)
- Added `loadRazorpayScript()` function directly in Pricing page

---

## Summary

The Pricing page now:
✅ Directly calls your API endpoints
✅ Handles basic plan changes without payment
✅ Integrates Razorpay for paid plans
✅ Shows loading and error states
✅ Updates usage in real-time
✅ Works on all devices
✅ Supports dark mode

Ready for backend implementation!
