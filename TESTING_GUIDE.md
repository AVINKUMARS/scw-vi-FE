# Frontend Testing Guide - Token Management System

## Overview

This guide helps you test the complete token management flow between the React frontend and Go backend.

---

## Prerequisites

- Backend running at `http://localhost:8000` (or configured API_BASE)
- Frontend running at `http://localhost:5173`
- Valid JWT token from authentication
- User account with an existing plan in the database

---

## Setup

### 1. Get JWT Token

```bash
# Login to get token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Extract token from response
# Response: {"token":"eyJhbGc..."}
export JWT_TOKEN="eyJhbGc..."
```

### 2. Verify User Has a Plan

```bash
curl -X GET http://localhost:8000/api/tokens/usage \
  -H "Authorization: Bearer $JWT_TOKEN"

# Should return something like:
# {"plan":"basic","token_quota":1000,"token_used":0,"remaining":1000}
```

---

## Test Scenarios

### Scenario 1: Load Pricing Page

**Expected Behavior:**
1. Page loads with "Flexible Pricing Plans" header
2. Current plan and token usage display
3. Three plan cards visible (Basic, Standard, Premium)
4. Buttons show correct states:
   - Current plan: "Current Plan" (disabled)
   - Upgradeable plans: "Upgrade" (primary button)
   - Downgradeable plans: "Downgrade" (outline button)

**Test Steps:**
```bash
1. Navigate to http://localhost:5173/pricing
2. Observe:
   - TokenUsageDisplay shows current plan
   - Plan cards render correctly
   - Button states match current plan
3. Check browser console for any errors
4. Verify network tab shows GET /api/tokens/usage succeeds (200)
```

**Success Criteria:**
- ✅ Page loads without errors
- ✅ Current plan highlighted with blue border
- ✅ Token display shows correct numbers
- ✅ Buttons have appropriate labels

---

### Scenario 2: Upgrade Plan (Basic → Standard)

**Expected Behavior:**
1. Click "Upgrade" button on Standard card
2. Button shows "Processing..." with spinner
3. API call succeeds
4. Success message appears
5. Plan usage refreshes
6. Standard card now shows "Current Plan"

**Test Steps:**
```bash
# 1. Check current plan is "basic"
curl -X GET http://localhost:8000/api/tokens/usage \
  -H "Authorization: Bearer $JWT_TOKEN"

# 2. In UI, click "Upgrade" button on Standard card
# 3. Observe button state and loading spinner
# 4. Wait for success message
# 5. Verify API was called correctly
```

**Check Network Tab:**
- Request: `POST /api/tokens/set-plan`
- Headers:
  ```
  Authorization: Bearer eyJhbGc...
  Content-Type: application/json
  ```
- Body: `{"plan":"standard","reset_used":false}`
- Response (200):
  ```json
  {
    "status": "ok",
    "message": "upgraded to standard with carry-over",
    "plan": "standard",
    "token_quota": 10000,
    "token_used": 0,
    "remaining": 10000
  }
  ```

**Success Criteria:**
- ✅ Success message shows for 5 seconds
- ✅ New plan quota displayed (10,000)
- ✅ Button state changes to "Current Plan"
- ✅ No errors in console

---

### Scenario 3: Upgrade Plan (Standard → Premium)

**Test Steps:**
```bash
# 1. From Standard plan, click "Upgrade" on Premium
# 2. Expected carry-over calculation:
#    - Previous quota: 10,000
#    - Previous used: some amount (e.g., 2,000)
#    - Previous remaining: 8,000
#    - New base: 50,000
#    - New quota = 50,000 + 8,000 = 58,000
#    - New used: 0
#    - New remaining: 58,000
```

**Check Response:**
```bash
curl -X POST http://localhost:8000/api/tokens/set-plan \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan":"premium","reset_used":false}'

# Response should show carry-over applied
# {
#   "status": "ok",
#   "message": "upgraded to premium with carry-over",
#   "plan": "premium",
#   "token_quota": 58000,
#   "token_used": 0,
#   "remaining": 58000
# }
```

**Success Criteria:**
- ✅ Carry-over tokens added to new quota
- ✅ token_used reset to 0
- ✅ UI updates with new quota

---

### Scenario 4: Downgrade Plan (Premium → Basic)

**Test Steps:**
```bash
# 1. From Premium plan, click "Downgrade" on Basic
# 2. Confirm downgrade action
# 3. Observe API call
```

**Check Response:**
```bash
curl -X POST http://localhost:8000/api/tokens/set-plan \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan":"basic","reset_used":false}'

# Response
# {
#   "status": "ok",
#   "message": "downgraded to basic",
#   "plan": "basic",
#   "token_quota": 1000,
#   "token_used": 0,
#   "remaining": 1000
# }
```

**Success Criteria:**
- ✅ Quota resets to Basic (1,000)
- ✅ No error message
- ✅ Button labels update correctly

---

### Scenario 5: Same Plan Selection (No Change)

**Test Steps:**
```bash
# 1. User is on Standard plan
# 2. Click "Change Plan" button on another Standard option (if available)
# 3. Should show error: "You are already on this plan!"
```

**Expected Message:**
- Red error banner: "You are already on this plan!"
- Button remains enabled for retry

**Success Criteria:**
- ✅ Error message displays
- ✅ No API call made
- ✅ Plan doesn't change

---

### Scenario 6: Error Handling - Network Failure

**Test Steps:**
```bash
# 1. In DevTools, go to Network tab
# 2. Check "Offline" to simulate network failure
# 3. Try to upgrade plan
# 4. Observe error handling
```

**Expected Behavior:**
- Button shows "Processing..." then returns to normal
- Error message appears in red
- Can retry after network restored

**Success Criteria:**
- ✅ Error message shown
- ✅ Button re-enabled for retry
- ✅ No crash or hanging state

---

### Scenario 7: Error Handling - Invalid JWT

**Test Steps:**
```bash
# 1. In DevTools, go to Application > Local Storage
# 2. Find "auth_token" or similar
# 3. Edit it to invalid value (e.g., "invalid.token.here")
# 4. Try to upgrade plan
```

**Expected Behavior:**
- Error message: "Failed to change plan" or "401 Unauthorized"
- Button re-enabled for retry

**Success Criteria:**
- ✅ Error handled gracefully
- ✅ No sensitive info exposed in error

---

### Scenario 8: Confirm Usage via GET Endpoint

**Test Steps:**
```bash
# 1. Upgrade to a plan via UI
# 2. Note the token_quota displayed
# 3. Call GET /tokens/usage directly
# 4. Verify same quota returned
```

**Verification:**
```bash
# After upgrade, call:
curl -X GET http://localhost:8000/api/tokens/usage \
  -H "Authorization: Bearer $JWT_TOKEN"

# Should match UI display
# {
#   "plan": "standard",
#   "token_quota": 10000,
#   "token_used": 0,
#   "remaining": 10000
# }
```

**Success Criteria:**
- ✅ GET response matches POST response
- ✅ Data persisted in database
- ✅ UI accurately reflects backend state

---

## Test Checklist

### Frontend Tests
- [ ] Pricing page loads without errors
- [ ] Current plan highlighted correctly
- [ ] Token display shows correct numbers
- [ ] Upgrade button appears for lower plans
- [ ] Downgrade button appears for higher plans
- [ ] "Current Plan" button disabled for active plan
- [ ] Loading spinner shows during API call
- [ ] Success message appears and auto-dismisses after 5s
- [ ] Error message appears for failures
- [ ] Error message clears when starting new action

### API Integration Tests
- [ ] POST /api/tokens/set-plan accepts correct body format
- [ ] POST /api/tokens/set-plan validates plan value
- [ ] POST /api/tokens/set-plan validates JWT
- [ ] POST /api/tokens/set-plan returns updated values
- [ ] GET /api/tokens/usage returns consistent data
- [ ] Carry-over calculation works on upgrade
- [ ] Token reset works (reset_used: true)
- [ ] Downgrade clears plan_end_at
- [ ] Multiple quick upgrades handled correctly

### User Experience Tests
- [ ] Button disabled during processing (prevent double-click)
- [ ] Error messages are clear and actionable
- [ ] Success messages confirm the action taken
- [ ] Network errors don't crash the page
- [ ] Can retry after error
- [ ] Sidebar "Pricing" link works correctly
- [ ] Plan name displays correctly in sidebar after change

---

## Debugging Tips

### Check API Response in Console
```javascript
// In browser DevTools console
// After clicking upgrade button, check Network tab

// Or mock the response:
const response = {
  status: "ok",
  message: "upgraded to standard with carry-over",
  plan: "standard",
  token_quota: 10000,
  token_used: 0,
  remaining: 10000
};
console.log(response);
```

### Verify JWT in Local Storage
```javascript
// In DevTools console
localStorage.getItem('auth_token'); // or your key name
```

### Check API Endpoint Configuration
```javascript
// In DevTools, check network requests
// All requests should go to: http://localhost:8000/api/tokens/...
// Check VITE_API_BASE in .env file
```

### View Component State
```javascript
// Add console logs to Pricing.tsx temporarily
console.log('currentUsage:', currentUsage);
console.log('isProcessing:', isProcessing);
console.log('errorMessage:', errorMessage);
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "401 Unauthorized" | Invalid/expired JWT | Login again, check token in LocalStorage |
| "Failed to load usage" | API not responding | Check backend is running on :8000 |
| Plan doesn't change | reset_used not working | Check backend reset logic, try reset_used=true |
| Button stuck on "Processing" | API timeout | Check network, increase timeout, retry |
| "You are already on this plan" | Comparing wrong plan IDs | Check currentUsage.plan matches server value |
| Carry-over not applied | Calculation error | Verify formula: new_quota = base + (prev_quota - prev_used) |

---

## Performance Notes

- Token usage loaded on component mount (GET /tokens/usage)
- Token usage reloaded after successful plan change
- Success message auto-dismisses after 5 seconds
- Button disabled during processing to prevent double-submissions
- No unnecessary re-renders (React.useState, no global state needed)

---

## Next Steps

After all tests pass:

1. ✅ Deploy frontend to production
2. ✅ Deploy backend with working endpoints
3. ✅ Update VITE_API_BASE to production URL
4. ✅ Monitor error logs in production
5. ✅ Set up analytics to track plan changes
6. ✅ Implement optional: Razorpay integration if needed

---

## Reference

- **Frontend Files:**
  - `src/pages/Pricing.tsx` - Main pricing page component
  - `src/services/payment.ts` - Payment service and utilities
  - `src/components/TokenUsageDisplay.tsx` - Token display component

- **API Endpoints:**
  - `GET /api/tokens/usage` - Get current token usage
  - `POST /api/tokens/set-plan` - Change plan

- **Database Schema:**
  - `users` table - User accounts
  - `user_plans` table - Plan and token tracking

---

**Last Updated:** 2025-11-15
**Status:** Ready for testing with backend implementation
