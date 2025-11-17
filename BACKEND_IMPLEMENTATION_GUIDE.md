# Backend Implementation Guide - Token Management APIs

Complete guide for implementing token and plan management endpoints on your backend server.

---

## Overview

You need to implement 4 main endpoints for the token/plan management system:

```
GET    /api/tokens/usage           - Get current token usage
POST   /api/tokens/set-plan        - Change plan (with/without payment)
POST   /api/payments/create-order  - Create Razorpay order
POST   /api/payments/verify        - Verify payment and upgrade plan
```

This guide focuses on the **Token Management** endpoints. Payment endpoints are covered separately.

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255),
  business_name VARCHAR(255),
  is_whatsapp_verified BOOLEAN DEFAULT FALSE,
  industry_type VARCHAR(100),
  sub_industry VARCHAR(100),
  core_processes JSON,
  monthly_revenue DECIMAL(15, 2),
  employees INT,
  goal_amount DECIMAL(15, 2),
  goal_years INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);
```

### User Plans Table (NEW)
```sql
CREATE TABLE user_plans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  plan VARCHAR(20) DEFAULT 'basic',  -- basic, standard, premium
  token_quota INT NOT NULL,
  token_used INT DEFAULT 0,
  plan_end_at TIMESTAMP NULL,  -- NULL for basic, ~30 days from now for paid
  last_reset_month INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_plan (user_id),
  INDEX idx_plan_end (plan_end_at)
);
```

### Payments Table (Optional but recommended)
```sql
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  razorpay_order_id VARCHAR(100),
  razorpay_payment_id VARCHAR(100),
  razorpay_signature VARCHAR(255),
  plan VARCHAR(20) NOT NULL,
  amount INT,  -- in paise
  status VARCHAR(50),  -- pending, success, failed, verified
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_payment (user_id),
  INDEX idx_razorpay_order (razorpay_order_id),
  UNIQUE KEY unique_order (razorpay_order_id)
);
```

---

## Plan Configuration

Define these constants in your backend:

```typescript
// Backend Plan Configuration
const PLAN_CONFIGS = {
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 0,           // No charge
    tokens: 1000,
    durationDays: null  // No expiration
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    price: 2900,        // ₹29 in paise
    tokens: 10000,
    durationDays: 30
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 9900,        // ₹99 in paise
    tokens: 50000,
    durationDays: 30
  }
};
```

---

## Endpoint 1: GET /api/tokens/usage

**Purpose:** Get the user's current token quota, usage, and plan information.

### Request

```http
GET /api/tokens/usage HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

### Response (200 OK)

```json
{
  "plan": "standard",
  "token_quota": 10000,
  "token_used": 3500,
  "remaining": 6500,
  "plan_end_at": "2024-12-15T10:30:00Z"
}
```

### Error Responses

```json
// 401 Unauthorized
{
  "error": "unauthorized"
}

// 500 Server Error
{
  "error": "db error"
}
```

### Implementation Logic

```pseudocode
Function GET /api/tokens/usage (JWT token):
  1. Extract user_id from JWT token
  2. Query user_plans table for user_id

  3. Check if monthly reset is needed:
     - Get current month (1-12)
     - Get last_reset_month from database
     - If current month != last_reset_month:
         - Set token_used = 0
         - Set last_reset_month = current month
         - Save to database (LAZY RESET)

  4. Calculate remaining = token_quota - token_used

  5. Return response:
     {
       plan: user_plans.plan,
       token_quota: user_plans.token_quota,
       token_used: user_plans.token_used,
       remaining: calculated remaining,
       plan_end_at: user_plans.plan_end_at (can be null)
     }
```

### Key Points

1. **Lazy Monthly Reset**: Only reset when user calls this endpoint AND it's a new month
2. **Remaining Calculation**: `remaining = token_quota - token_used`
3. **plan_end_at**: Only set for paid plans (standard/premium), null for basic
4. **No Fetch Required**: Don't make external API calls, just return from database

---

## Endpoint 2: POST /api/tokens/set-plan

**Purpose:** Change user's plan directly (for downgrades, same-tier changes, or free upgrades).

### Request

```http
POST /api/tokens/set-plan HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "plan": "standard",
  "reset_used": false
}
```

### Response (200 OK)

```json
{
  "status": "ok",
  "message": "upgraded to standard with carry-over",
  "plan": "standard",
  "token_quota": 150000,
  "token_used": 0,
  "remaining": 150000
}
```

### Error Responses

```json
// 400 Bad Request - Invalid body
{
  "error": "invalid body"
}

// 400 Bad Request - Invalid plan
{
  "error": "invalid plan"
}

// 401 Unauthorized
{
  "error": "unauthorized"
}

// 500 Server Error
{
  "error": "db error"
}
```

### Implementation Logic

```pseudocode
Function POST /api/tokens/set-plan (JWT token, body):
  1. Validate request:
     - Check plan is in [basic, standard, premium]
     - Check body format is valid

  2. Extract user_id from JWT

  3. Get current user plan from database

  4. Determine action:

     if targetPlan > currentPlan (UPGRADE):
       - Calculate carry-over:
         remaining = current.token_quota - current.token_used
         new_quota = PLAN_CONFIGS[targetPlan].tokens + remaining
       - Set new quota and reset usage:
         token_quota = new_quota
         token_used = 0
       - Set expiration:
         plan_end_at = NOW() + 30 days
       - Message = "upgraded to {plan} with carry-over"

     else if targetPlan == currentPlan (SAME TIER):
       - Keep existing token_quota
       - If reset_used:
         token_used = 0
       - Message = "plan confirmed" (or similar)

     else if targetPlan < currentPlan (DOWNGRADE):
       - Switch to new quota:
         token_quota = PLAN_CONFIGS[targetPlan].tokens
       - If reset_used:
         token_used = 0
       - Clear expiration for basic:
         plan_end_at = NULL (only if targetPlan == basic)
       - Message = "downgraded to {plan}"

  5. Save to user_plans table:
     - plan = targetPlan
     - token_quota = calculated
     - token_used = calculated
     - plan_end_at = calculated
     - updated_at = NOW()

  6. Reset monthly counter:
     - last_reset_month = current month

  7. Return success response:
     {
       status: "ok",
       message: message (from step 4),
       plan: targetPlan,
       token_quota: new_quota,
       token_used: token_used,
       remaining: token_quota - token_used
     }
```

### Key Points

1. **Upgrade with Carry-Over**: Unused tokens from previous plan add to new quota
2. **Same Tier**: No quota change, just optional reset_used
3. **Downgrade**: Quota changes to new plan's base amount, no carry-over
4. **Expiration**: 30 days from now for paid plans, NULL for basic
5. **Monthly Reset**: Reset counter when changing plans

### Example Scenarios

**Scenario 1: Upgrade from Basic to Standard**
```
Current: plan=basic, quota=1000, used=200, remaining=800
Target: standard
Result: quota=10000+800=10800, used=0, remaining=10800
plan_end_at = NOW() + 30 days
```

**Scenario 2: Same tier (Standard to Standard)**
```
Current: plan=standard, quota=10000, used=3000, remaining=7000
Target: standard, reset_used=false
Result: quota=10000, used=3000, remaining=7000 (no change)
```

**Scenario 3: Downgrade from Premium to Basic**
```
Current: plan=premium, quota=50000, used=10000, remaining=40000
Target: basic
Result: quota=1000, used=10000, remaining=-9000 (or 0 if negative)
plan_end_at = NULL
```

---

## Implementation Example (Node.js/Express)

### Dependencies

```bash
npm install express jsonwebtoken mysql2 dotenv
```

### Configuration

```javascript
// config.js
require('dotenv').config();

const PLAN_CONFIGS = {
  basic: { tokens: 1000, durationDays: null },
  standard: { tokens: 10000, durationDays: 30 },
  premium: { tokens: 50000, durationDays: 30 }
};

const JWT_SECRET = process.env.JWT_SECRET;
const DB_CONNECTION = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

module.exports = { PLAN_CONFIGS, JWT_SECRET, DB_CONNECTION };
```

### Middleware

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user_id = decoded.user_id; // or decoded.sub
    next();
  } catch (error) {
    return res.status(401).json({ error: 'unauthorized' });
  }
}

module.exports = verifyToken;
```

### GET Usage Endpoint

```javascript
// routes/tokens.js
const express = require('express');
const mysql = require('mysql2/promise');
const verifyToken = require('../middleware/auth');
const { PLAN_CONFIGS, DB_CONNECTION } = require('../config');

const router = express.Router();

// GET /api/tokens/usage
router.get('/usage', verifyToken, async (req, res) => {
  try {
    const connection = await mysql.createConnection(DB_CONNECTION);

    try {
      // Get current user plan
      const [rows] = await connection.execute(
        'SELECT * FROM user_plans WHERE user_id = ?',
        [req.user_id]
      );

      if (rows.length === 0) {
        // Create default plan if not exists
        const defaultDays = PLAN_CONFIGS.basic.durationDays;
        const planEndAt = defaultDays ? new Date(Date.now() + defaultDays * 24 * 60 * 60 * 1000) : null;

        await connection.execute(
          'INSERT INTO user_plans (user_id, plan, token_quota, token_used, plan_end_at, last_reset_month) VALUES (?, ?, ?, ?, ?, ?)',
          [req.user_id, 'basic', PLAN_CONFIGS.basic.tokens, 0, planEndAt, new Date().getMonth() + 1]
        );

        return res.json({
          plan: 'basic',
          token_quota: PLAN_CONFIGS.basic.tokens,
          token_used: 0,
          remaining: PLAN_CONFIGS.basic.tokens,
          plan_end_at: planEndAt
        });
      }

      let plan = rows[0];
      const currentMonth = new Date().getMonth() + 1;

      // Lazy monthly reset
      if (plan.last_reset_month !== currentMonth) {
        await connection.execute(
          'UPDATE user_plans SET token_used = 0, last_reset_month = ? WHERE user_id = ?',
          [currentMonth, req.user_id]
        );
        plan.token_used = 0;
        plan.last_reset_month = currentMonth;
      }

      const remaining = plan.token_quota - plan.token_used;

      res.json({
        plan: plan.plan,
        token_quota: plan.token_quota,
        token_used: plan.token_used,
        remaining: remaining,
        plan_end_at: plan.plan_end_at
      });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error in GET /tokens/usage:', error);
    res.status(500).json({ error: 'db error' });
  }
});

module.exports = router;
```

### POST Set Plan Endpoint

```javascript
// routes/tokens.js (continued)

// POST /api/tokens/set-plan
router.post('/set-plan', verifyToken, async (req, res) => {
  try {
    // Validate request body
    const { plan, reset_used } = req.body;

    if (!plan || !['basic', 'standard', 'premium'].includes(plan)) {
      return res.status(400).json({ error: 'invalid plan' });
    }

    if (typeof reset_used !== 'undefined' && typeof reset_used !== 'boolean') {
      return res.status(400).json({ error: 'invalid body' });
    }

    const connection = await mysql.createConnection(DB_CONNECTION);

    try {
      // Get current plan
      const [rows] = await connection.execute(
        'SELECT * FROM user_plans WHERE user_id = ?',
        [req.user_id]
      );

      if (rows.length === 0) {
        return res.status(400).json({ error: 'invalid body' });
      }

      const current = rows[0];
      const planOrder = { basic: 0, standard: 1, premium: 2 };
      const targetOrder = planOrder[plan];
      const currentOrder = planOrder[current.plan];

      let newQuota, newUsed, planEndAt, message;

      if (targetOrder > currentOrder) {
        // UPGRADE: carry-over remaining tokens
        const remaining = current.token_quota - current.token_used;
        newQuota = PLAN_CONFIGS[plan].tokens + remaining;
        newUsed = 0;
        planEndAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        message = `upgraded to ${plan} with carry-over`;
      } else if (targetOrder === currentOrder) {
        // SAME TIER
        newQuota = current.token_quota;
        newUsed = reset_used ? 0 : current.token_used;
        planEndAt = current.plan_end_at;
        message = `plan confirmed`;
      } else {
        // DOWNGRADE
        newQuota = PLAN_CONFIGS[plan].tokens;
        newUsed = reset_used ? 0 : current.token_used;
        planEndAt = plan === 'basic' ? null : current.plan_end_at;
        message = `downgraded to ${plan}`;
      }

      const currentMonth = new Date().getMonth() + 1;

      // Update database
      await connection.execute(
        'UPDATE user_plans SET plan = ?, token_quota = ?, token_used = ?, plan_end_at = ?, last_reset_month = ?, updated_at = NOW() WHERE user_id = ?',
        [plan, newQuota, newUsed, planEndAt, currentMonth, req.user_id]
      );

      const remaining = newQuota - newUsed;

      res.json({
        status: 'ok',
        message: message,
        plan: plan,
        token_quota: newQuota,
        token_used: newUsed,
        remaining: remaining
      });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error in POST /tokens/set-plan:', error);
    res.status(500).json({ error: 'db error' });
  }
});

module.exports = router;
```

### Register Routes

```javascript
// app.js or server.js
const express = require('express');
const tokensRouter = require('./routes/tokens');

const app = express();
app.use(express.json());
app.use('/api/tokens', tokensRouter);

app.listen(8080, () => {
  console.log('Server running on port 8080');
});
```

---

## Testing the Endpoints

### Test 1: Get Usage for New User

```bash
curl -X GET http://localhost:8080/api/tokens/usage \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected Response:
```json
{
  "plan": "basic",
  "token_quota": 1000,
  "token_used": 0,
  "remaining": 1000,
  "plan_end_at": null
}
```

### Test 2: Upgrade Plan with Carry-Over

```bash
curl -X POST http://localhost:8080/api/tokens/set-plan \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan":"premium","reset_used":false}'
```

Expected Response:
```json
{
  "status": "ok",
  "message": "upgraded to premium with carry-over",
  "plan": "premium",
  "token_quota": 50000,
  "token_used": 0,
  "remaining": 50000
}
```

### Test 3: Downgrade Plan

```bash
curl -X POST http://localhost:8080/api/tokens/set-plan \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan":"basic","reset_used":false}'
```

Expected Response:
```json
{
  "status": "ok",
  "message": "downgraded to basic",
  "plan": "basic",
  "token_quota": 1000,
  "token_used": 0,
  "remaining": 1000
}
```

---

## Important Notes

1. **JWT Extraction**: The exact claim for user ID depends on how you generate tokens. Common: `user_id`, `sub`, `id`
2. **Monthly Reset**: Only happens when user calls GET /usage. Don't reset on every request.
3. **Carry-Over**: Only on upgrades, not on downgrades
4. **plan_end_at**: Must be set to ~30 days from now for paid plans, NULL for basic
5. **Error Handling**: Return 400 for invalid input, 401 for auth issues, 500 for server errors
6. **Database Indexes**: Add indexes on user_id and plan_end_at for performance

---

## Next Steps

1. Create the database tables (copy SQL above)
2. Implement the endpoints with your framework
3. Test with the curl commands above
4. Integrate with your frontend (already done)
5. Add payment verification endpoint (/payments/verify)

The frontend is already prepared to call these endpoints!
