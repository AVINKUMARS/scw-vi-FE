# Quick Start - Token Management System

## 🚀 For Developers

### Start the Application

```bash
# Frontend (already built)
npm run dev
# Opens at http://localhost:5173

# Backend (if not running)
go run main.go
# Runs at http://localhost:8000
```

### Access Pricing Page
```
http://localhost:5173/pricing
```

### Test an API Call
```bash
# Get current token usage
curl -X GET http://localhost:8000/api/tokens/usage \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Change plan
curl -X POST http://localhost:8000/api/tokens/set-plan \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan":"standard","reset_used":false}'
```

---

## 📋 What Was Built

### Frontend
- ✅ Pricing page with 3 tiers (Basic, Standard, Premium)
- ✅ Token usage display with progress bar
- ✅ Plan change functionality
- ✅ Loading states and error handling
- ✅ Success/error messages
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Full TypeScript type safety

### Backend (Implemented)
- ✅ GET /api/tokens/usage - Get current plan and tokens
- ✅ POST /api/tokens/set-plan - Change plan with upgrade rules

### Features
- ✅ Token carry-over on upgrade
- ✅ Plan downgrade support
- ✅ Optional token reset on plan change
- ✅ Plan expiration tracking (30 days)
- ✅ JWT authentication
- ✅ Comprehensive error handling

---

## 🧪 Quick Testing

### Test Upgrade Flow
```
1. Go to /pricing
2. Click "Upgrade" on Standard plan
3. Observe:
   - Button shows "Processing..."
   - Success message appears
   - Token quota updates
   - Current plan highlights Standard
```

### Test Downgrade Flow
```
1. From upgraded plan, click "Downgrade" on Basic
2. Observe:
   - Token quota resets to 1,000
   - Success message appears
```

### Test Error Handling
```
1. In DevTools, toggle Offline mode
2. Try to upgrade
3. See error message and retry option
4. Toggle Online, retry
5. Upgrade should succeed
```

---

## 📊 API Summary

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | /api/tokens/usage | Get current usage | JWT |
| POST | /api/tokens/set-plan | Change plan | JWT |

### Request/Response Examples

**GET /api/tokens/usage**
```json
// Response (200)
{
  "plan": "standard",
  "token_quota": 10000,
  "token_used": 2500,
  "remaining": 7500
}
```

**POST /api/tokens/set-plan**
```json
// Request
{
  "plan": "standard",
  "reset_used": false
}

// Response (200)
{
  "status": "ok",
  "message": "upgraded to standard with carry-over",
  "plan": "standard",
  "token_quota": 10000,
  "token_used": 0,
  "remaining": 10000
}
```

---

## 🎯 Plan Tiers

| Plan | Price | Tokens | Best For |
|------|-------|--------|----------|
| Basic | Free | 1,000/month | Getting started |
| Standard | ₹29/month | 10,000/month | Growing teams |
| Premium | ₹99/month | 50,000/month | Enterprise |

---

## 🔧 Configuration

### Frontend (.env)
```
VITE_API_BASE=http://localhost:8000
```

### Backend (environment)
```
DATABASE_URL=... (configured)
JWT_SECRET=... (configured)
PORT=8000
```

---

## 📁 Key Files

```
Frontend:
├── src/pages/Pricing.tsx              (Main pricing page)
├── src/services/payment.ts            (API & configs)
├── src/components/TokenUsageDisplay   (Usage display)
└── src/lib/api.ts                     (Axios setup)

Backend:
├── routes/routes.go                   (Endpoints)
├── controllers/tokens_controller.go   (Handlers)
└── models/...                         (Database)
```

---

## ✅ Status

| Component | Status |
|-----------|--------|
| Frontend Build | ✅ Passing |
| TypeScript | ✅ No errors |
| Pricing UI | ✅ Complete |
| API Integration | ✅ Working |
| Backend Endpoints | ✅ Implemented |
| Testing | 🔄 Ready |
| Deployment | 📋 Checklist |

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| "401 Unauthorized" | Check JWT token in localStorage |
| "Failed to load usage" | Verify backend running on :8000 |
| Button stuck on "Processing" | Check network/backend logs |
| Plan doesn't change | Verify reset_used flag working |

---

## 📚 Full Documentation

- **INTEGRATION_STATUS.md** - Complete integration overview
- **TESTING_GUIDE.md** - Detailed test scenarios
- **PAYMENT_FLOW_UPDATED.md** - API flow documentation

---

## 🎬 Next Steps

1. ✅ Start backend: `go run main.go`
2. ✅ Start frontend: `npm run dev`
3. ✅ Navigate to `/pricing`
4. ✅ Test upgrade/downgrade flows
5. ✅ Verify API calls in DevTools
6. 📋 Follow TESTING_GUIDE.md for comprehensive tests

---

**Status:** Ready for testing
**Last Updated:** 2025-11-15
**Build:** ✅ Passing
