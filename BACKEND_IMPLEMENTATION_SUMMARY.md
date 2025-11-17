# Backend Implementation Summary - Token Management APIs

Complete implementation guide for the token management system backend.

---

## Overview

You now have comprehensive documentation for implementing the following endpoints:

```
GET    /api/tokens/usage           ✅ Complete documentation
POST   /api/tokens/set-plan        ✅ Complete documentation
POST   /api/payments/create-order  ✅ Complete documentation (Razorpay)
POST   /api/payments/verify        ✅ Complete documentation (Razorpay)
```

---

## Documentation Files Provided

### 1. **BACKEND_IMPLEMENTATION_GUIDE.md**
   - **Framework**: Generic (Node.js/Express shown as example)
   - **Content**:
     - Database schema (SQL DDL)
     - Plan configurations
     - Complete endpoint specifications
     - Implementation logic in pseudocode
     - Node.js/Express example code
     - Testing with curl commands
   - **Best For**: Understanding the concepts and logic

### 2. **BACKEND_PYTHON_FASTAPI.md**
   - **Framework**: Python FastAPI
   - **Content**:
     - Complete directory structure
     - Configuration setup (.env)
     - SQLAlchemy models
     - Pydantic schemas
     - JWT authentication middleware
     - Database connection setup
     - Complete route implementations
     - Database setup (MySQL DDL)
     - Docker deployment
     - Testing examples
   - **Best For**: Python developers

---

## Quick Start by Framework

### If using Node.js/Express:
1. Read: `BACKEND_IMPLEMENTATION_GUIDE.md`
2. Install: `npm install express jsonwebtoken mysql2 dotenv`
3. Copy code examples from the guide
4. Implement database schema (SQL section)
5. Test with curl commands

### If using Python/FastAPI:
1. Read: `BACKEND_PYTHON_FASTAPI.md`
2. Install: `pip install -r requirements.txt`
3. Copy the complete app structure
4. Set up MySQL database
5. Run: `python app/main.py`

### If using Django:
1. Read: `BACKEND_IMPLEMENTATION_GUIDE.md` (for logic)
2. Adapt to Django patterns:
   - Use Django ORM instead of SQLAlchemy
   - Use Django REST Framework for API
   - Use Django authentication
3. Database schema is the same (Django migrations)

### If using Go/Gin:
1. Read: `BACKEND_IMPLEMENTATION_GUIDE.md` (for logic)
2. Adapt implementation to Go patterns
3. Use your preferred database library (sqlc, gorm, etc.)

---

## Database Schema

The same schema works for any framework. Here's the core tables:

### users
```sql
id, name, email, phone, password_hash, business_name,
is_whatsapp_verified, industry_type, sub_industry,
core_processes, monthly_revenue, employees,
goal_amount, goal_years, created_at, updated_at
```

### user_plans (CRITICAL)
```sql
id, user_id (FK), plan, token_quota, token_used,
plan_end_at, last_reset_month, created_at, updated_at
```

### payments (Optional but recommended)
```sql
id, user_id (FK), razorpay_order_id, razorpay_payment_id,
razorpay_signature, plan, amount, status, created_at, updated_at
```

---

## Endpoint Summary

### GET /api/tokens/usage
```
Purpose: Get current token usage and plan info
Auth: JWT Bearer token required
Response: { plan, token_quota, token_used, remaining, plan_end_at? }
Key Feature: Lazy monthly reset (only when called)
```

### POST /api/tokens/set-plan
```
Purpose: Change plan directly (upgrade/downgrade)
Auth: JWT Bearer token required
Body: { plan: "basic"|"standard"|"premium", reset_used?: boolean }
Response: { status, message, plan, token_quota, token_used, remaining }
Key Feature: Token carry-over on upgrades
```

### POST /api/payments/create-order
```
Purpose: Create Razorpay order for payment
Auth: JWT Bearer token required
Body: { plan: "standard"|"premium" }
Response: { order_id, amount, currency, plan, key_id }
```

### POST /api/payments/verify
```
Purpose: Verify Razorpay payment and upgrade plan
Auth: JWT Bearer token required
Body: { plan, razorpay_order_id, razorpay_payment_id, razorpay_signature, reset_used? }
Response: { status, message, plan, token_quota, token_used, remaining }
```

---

## Implementation Flow

### Step 1: Setup (15 min)
- [ ] Create MySQL database
- [ ] Create tables (copy SQL)
- [ ] Setup environment variables (.env)
- [ ] Initialize project with dependencies

### Step 2: Core Features (30 min)
- [ ] Implement JWT verification middleware
- [ ] Create database connection layer
- [ ] Implement GET /api/tokens/usage
- [ ] Implement POST /api/tokens/set-plan

### Step 3: Testing (15 min)
- [ ] Test GET /api/tokens/usage
- [ ] Test POST /api/tokens/set-plan (upgrade)
- [ ] Test POST /api/tokens/set-plan (downgrade)
- [ ] Test POST /api/tokens/set-plan (same tier)
- [ ] Test error responses

### Step 4: Payment Integration (30 min)
- [ ] Get Razorpay credentials
- [ ] Implement POST /api/payments/create-order
- [ ] Implement POST /api/payments/verify
- [ ] Test with Razorpay test credentials

### Step 5: Deploy (20 min)
- [ ] Update environment variables for production
- [ ] Deploy to server
- [ ] Test against frontend
- [ ] Monitor and adjust

---

## Plan Configuration Constants

Every framework needs these constants:

```
Basic:
  - Price: ₹0 (free)
  - Tokens: 1000/month
  - Duration: No expiration

Standard:
  - Price: ₹29/month
  - Tokens: 10,000/month
  - Duration: 30 days

Premium:
  - Price: ₹99/month
  - Tokens: 50,000/month
  - Duration: 30 days
```

---

## Critical Implementation Details

### 1. Token Carry-Over on Upgrade
```
Previous: quota=10K, used=3K → remaining=7K
Upgrade to Premium (base 50K):
New quota = 50K + 7K = 57K
New used = 0
```

### 2. Lazy Monthly Reset
```
Only reset when:
1. User calls GET /api/tokens/usage
2. Current month != last_reset_month in database
3. Then: set token_used=0, update last_reset_month

NOT on every request, NOT on every API call!
```

### 3. Plan Expiration (plan_end_at)
```
For paid plans (standard, premium):
  plan_end_at = NOW() + 30 days

For basic plan:
  plan_end_at = NULL

Use this for subscription renewal reminders.
```

### 4. JWT Token Format
```
Payload must contain either:
  - "user_id": <number>
  OR
  - "sub": <number>

Extract whichever is present.
```

---

## Testing Checklist

### Manual Testing (curl)

```bash
# Test 1: GET /api/tokens/usage
curl -X GET http://localhost:8000/api/tokens/usage \
  -H "Authorization: Bearer JWT_TOKEN"
# Expected: 200 with usage data

# Test 2: POST /api/tokens/set-plan (upgrade)
curl -X POST http://localhost:8000/api/tokens/set-plan \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan":"premium"}'
# Expected: 200 with carry-over applied

# Test 3: POST /api/tokens/set-plan (downgrade)
curl -X POST http://localhost:8000/api/tokens/set-plan \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan":"basic"}'
# Expected: 200 with new quota

# Test 4: Verify reset_used works
curl -X POST http://localhost:8000/api/tokens/set-plan \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan":"standard","reset_used":true}'
# Expected: 200 with token_used=0

# Test 5: Invalid plan
curl -X POST http://localhost:8000/api/tokens/set-plan \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan":"invalid"}'
# Expected: 400 with error: "invalid plan"

# Test 6: Unauthorized
curl -X GET http://localhost:8000/api/tokens/usage
# Expected: 401 with error: "unauthorized"
```

### Automated Testing (Unit Tests)

Write tests for:
- ✅ Authorization (401 without token)
- ✅ Validation (400 for invalid input)
- ✅ Upgrade logic (carry-over calculation)
- ✅ Downgrade logic (quota reset)
- ✅ Monthly reset (token_used reset)
- ✅ Plan expiration (plan_end_at set correctly)
- ✅ Error responses (proper error messages)

---

## Error Handling

Proper error responses your frontend expects:

### 400 Bad Request
```json
{"error":"invalid plan"}
{"error":"invalid body"}
```

### 401 Unauthorized
```json
{"error":"unauthorized"}
```

### 500 Server Error
```json
{"error":"db error"}
```

**Always return proper HTTP status codes!**

---

## Security Considerations

1. **JWT Verification**: Always verify JWT signature
2. **Input Validation**: Validate plan is in [basic, standard, premium]
3. **User Isolation**: Always filter by authenticated user_id
4. **Rate Limiting**: Consider rate limiting payment endpoints
5. **HTTPS Only**: Enforce HTTPS in production
6. **CORS**: Configure CORS for your frontend domain
7. **Logging**: Log all payment operations

---

## Performance Tips

1. **Database Indexes**:
   ```sql
   CREATE INDEX idx_user_id ON user_plans(user_id);
   CREATE INDEX idx_plan_end ON user_plans(plan_end_at);
   ```

2. **Caching**: Cache plan configurations (they don't change)

3. **Connection Pooling**: Use database connection pooling

4. **Async**: Use async/await for I/O operations (FastAPI handles this)

5. **Query Optimization**: Only select needed fields

---

## Frontend Integration

Your React frontend is already configured to call these endpoints!

The frontend:
- ✅ Sends JWT token in `Authorization: Bearer <token>` header
- ✅ Calls `/api/tokens/usage` on page load
- ✅ Calls `/api/tokens/set-plan` when user changes plan
- ✅ Handles success/error responses
- ✅ Shows loading states
- ✅ Has retry logic built-in

No changes needed on frontend side!

---

## Deployment Checklist

- [ ] Database created and tables set up
- [ ] Environment variables configured (.env)
- [ ] JWT_SECRET configured (strong random value)
- [ ] All 4 endpoints implemented and tested
- [ ] Error handling implemented
- [ ] CORS configured for frontend domain
- [ ] HTTPS enabled (production)
- [ ] Rate limiting configured
- [ ] Logging configured
- [ ] Database backups scheduled
- [ ] Monitoring set up
- [ ] Update frontend API_BASE in .env to production URL

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid/missing JWT | Check token generation, verify JWT_SECRET |
| CORS error | Frontend origin not allowed | Configure CORS middleware |
| DB error | Connection failed | Check DATABASE_URL, verify MySQL is running |
| Carry-over not working | Calculation error | Verify: `new_quota = base + (prev_quota - prev_used)` |
| Monthly reset not working | last_reset_month not updated | Always update last_reset_month when resetting |
| plan_end_at not set | Missing expiration logic | Set to NOW() + 30 days for paid plans |

---

## Next Steps

1. **Choose your framework** (Node.js, Python, Go, Java, etc.)
2. **Read relevant documentation file**:
   - Node.js/Express: `BACKEND_IMPLEMENTATION_GUIDE.md`
   - Python/FastAPI: `BACKEND_PYTHON_FASTAPI.md`
   - Others: Adapt logic from guides
3. **Set up database** (copy SQL schema)
4. **Implement endpoints** (copy from examples)
5. **Test thoroughly** (use curl commands)
6. **Deploy** (follow deployment checklist)
7. **Monitor** (track errors and performance)

---

## Support Resources

- **Generic Logic**: `BACKEND_IMPLEMENTATION_GUIDE.md`
- **Python/FastAPI**: `BACKEND_PYTHON_FASTAPI.md`
- **Payment Integration**: `RAZORPAY_INTEGRATION.md`
- **Frontend Integration**: `PAYMENT_API_REFERENCE.md`
- **Overall Plan**: `IMPLEMENTATION_CHECKLIST.md`

---

## FAQ

**Q: Do I need all 4 endpoints?**
A: GET /tokens/usage and POST /tokens/set-plan are essential. Payment endpoints only if using Razorpay.

**Q: Can I use a different database?**
A: Yes, just adapt the SQL schema to your database (PostgreSQL, MongoDB, etc.).

**Q: How do I generate JWT tokens?**
A: This is beyond this guide, but use a JWT library for your framework and set JWT_SECRET to a strong random value.

**Q: What if user has 0 remaining tokens?**
A: They can still change plans. The remaining tokens might be negative after downgrade (which is fine).

**Q: Do I need webhooks?**
A: No, but it's recommended for Razorpay payment reconciliation.

**Q: Can tokens be purchased separately?**
A: This guide only covers plan-based tokens. Separate purchases would need additional endpoints.

---

**Implementation Status:**
- ✅ Frontend: Complete
- ✅ Documentation: Complete
- ⏳ Backend: Ready for implementation

Start implementing! 🚀
