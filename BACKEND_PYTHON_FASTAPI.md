# Backend Implementation - Python FastAPI

Complete FastAPI implementation for token management endpoints.

---

## Setup

### Install Dependencies

```bash
pip install fastapi uvicorn sqlalchemy pymysql python-jose python-dotenv pydantic
```

### Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # Main FastAPI app
│   ├── config.py                # Configuration
│   ├── models.py                # Database models
│   ├── schemas.py               # Pydantic schemas
│   ├── database.py              # Database connection
│   ├── middleware/
│   │   └── auth.py              # JWT authentication
│   └── routes/
│       └── tokens.py            # Token endpoints
├── .env                         # Environment variables
└── requirements.txt
```

---

## Configuration

### .env File

```env
DATABASE_URL=mysql+pymysql://user:password@localhost/database_name
JWT_SECRET=your-secret-key-change-this
JWT_ALGORITHM=HS256
API_BASE_URL=http://localhost:8000/api
```

### config.py

```python
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

PLAN_CONFIGS = {
    "basic": {
        "id": "basic",
        "name": "Basic",
        "price": 0,
        "tokens": 1000,
        "duration_days": None
    },
    "standard": {
        "id": "standard",
        "name": "Standard",
        "price": 2900,
        "tokens": 10000,
        "duration_days": 30
    },
    "premium": {
        "id": "premium",
        "name": "Premium",
        "price": 9900,
        "tokens": 50000,
        "duration_days": 30
    }
}
```

---

## Database Models

### models.py

```python
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20))
    password_hash = Column(String(255))
    business_name = Column(String(255))
    is_whatsapp_verified = Column(Boolean, default=False)
    industry_type = Column(String(100))
    sub_industry = Column(String(100))
    core_processes = Column(String(1000))  # JSON as string
    monthly_revenue = Column(Float)
    employees = Column(Integer)
    goal_amount = Column(Float)
    goal_years = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user_plans = relationship("UserPlan", back_populates="user", uselist=False)


class UserPlan(Base):
    __tablename__ = "user_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    plan = Column(String(20), default="basic", index=True)
    token_quota = Column(Integer, nullable=False)
    token_used = Column(Integer, default=0)
    plan_end_at = Column(DateTime, nullable=True, index=True)
    last_reset_month = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="user_plans")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    razorpay_order_id = Column(String(100), unique=True, index=True)
    razorpay_payment_id = Column(String(100))
    razorpay_signature = Column(String(255))
    plan = Column(String(20), nullable=False)
    amount = Column(Integer)  # in paise
    status = Column(String(50))  # pending, success, failed, verified
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

---

## Schemas

### schemas.py

```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TokenUsageResponse(BaseModel):
    plan: str
    token_quota: int
    token_used: int
    remaining: int
    plan_end_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SetPlanRequest(BaseModel):
    plan: str
    reset_used: Optional[bool] = False


class SetPlanResponse(BaseModel):
    status: str
    message: str
    plan: str
    token_quota: int
    token_used: int
    remaining: int

    class Config:
        from_attributes = True


class ErrorResponse(BaseModel):
    error: str
```

---

## Authentication Middleware

### middleware/auth.py

```python
from fastapi import HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredential
from jose import JWTError, jwt
from config import JWT_SECRET, JWT_ALGORITHM
from datetime import datetime

security = HTTPBearer()

def verify_token(credentials: HTTPAuthCredential) -> int:
    """
    Verify JWT token and return user_id
    """
    token = credentials.credentials

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: int = payload.get("user_id") or payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="unauthorized"
            )

        return int(user_id)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="unauthorized"
        )
```

---

## Database Connection

### database.py

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from config import DATABASE_URL
from models import Base

# Create engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    echo=False
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create all tables
Base.metadata.create_all(bind=engine)

def get_db():
    """
    Dependency to get database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## Token Routes

### routes/tokens.py

```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from models import UserPlan, User
from schemas import TokenUsageResponse, SetPlanRequest, SetPlanResponse
from middleware.auth import verify_token
from database import get_db
from config import PLAN_CONFIGS
import calendar

router = APIRouter(prefix="/api/tokens", tags=["tokens"])
security = HTTPBearer()

# GET /api/tokens/usage
@router.get("/usage", response_model=TokenUsageResponse)
async def get_usage(
    credentials: HTTPBearer = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Get current token usage and plan information
    """
    user_id = verify_token(credentials)

    # Get or create user plan
    user_plan = db.query(UserPlan).filter(UserPlan.user_id == user_id).first()

    if not user_plan:
        # Create default plan for new user
        user_plan = UserPlan(
            user_id=user_id,
            plan="basic",
            token_quota=PLAN_CONFIGS["basic"]["tokens"],
            token_used=0,
            plan_end_at=None,
            last_reset_month=datetime.utcnow().month
        )
        db.add(user_plan)
        db.commit()
        db.refresh(user_plan)

        return TokenUsageResponse(
            plan="basic",
            token_quota=PLAN_CONFIGS["basic"]["tokens"],
            token_used=0,
            remaining=PLAN_CONFIGS["basic"]["tokens"],
            plan_end_at=None
        )

    # Check if monthly reset is needed
    current_month = datetime.utcnow().month
    if user_plan.last_reset_month != current_month:
        user_plan.token_used = 0
        user_plan.last_reset_month = current_month
        db.commit()

    remaining = user_plan.token_quota - user_plan.token_used

    return TokenUsageResponse(
        plan=user_plan.plan,
        token_quota=user_plan.token_quota,
        token_used=user_plan.token_used,
        remaining=remaining,
        plan_end_at=user_plan.plan_end_at
    )


# POST /api/tokens/set-plan
@router.post("/set-plan", response_model=SetPlanResponse)
async def set_plan(
    request: SetPlanRequest,
    credentials: HTTPBearer = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Change user's plan
    """
    user_id = verify_token(credentials)

    # Validate plan
    if request.plan not in PLAN_CONFIGS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="invalid plan"
        )

    # Get current plan
    user_plan = db.query(UserPlan).filter(UserPlan.user_id == user_id).first()

    if not user_plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="invalid body"
        )

    # Define plan order for comparison
    plan_order = {"basic": 0, "standard": 1, "premium": 2}
    target_order = plan_order[request.plan]
    current_order = plan_order[user_plan.plan]

    # Calculate new values based on action
    current_month = datetime.utcnow().month

    if target_order > current_order:
        # UPGRADE: carry-over remaining tokens
        remaining = user_plan.token_quota - user_plan.token_used
        new_quota = PLAN_CONFIGS[request.plan]["tokens"] + remaining
        new_used = 0
        plan_end_at = datetime.utcnow() + timedelta(days=30)
        message = f"upgraded to {request.plan} with carry-over"

    elif target_order == current_order:
        # SAME TIER
        new_quota = user_plan.token_quota
        new_used = 0 if request.reset_used else user_plan.token_used
        plan_end_at = user_plan.plan_end_at
        message = "plan confirmed"

    else:
        # DOWNGRADE
        new_quota = PLAN_CONFIGS[request.plan]["tokens"]
        new_used = 0 if request.reset_used else user_plan.token_used
        plan_end_at = None if request.plan == "basic" else user_plan.plan_end_at
        message = f"downgraded to {request.plan}"

    # Update database
    user_plan.plan = request.plan
    user_plan.token_quota = new_quota
    user_plan.token_used = new_used
    user_plan.plan_end_at = plan_end_at
    user_plan.last_reset_month = current_month
    user_plan.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(user_plan)

    remaining = new_quota - new_used

    return SetPlanResponse(
        status="ok",
        message=message,
        plan=request.plan,
        token_quota=new_quota,
        token_used=new_used,
        remaining=remaining
    )
```

---

## Main Application

### main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.tokens import router as tokens_router
from config import API_BASE_URL
import uvicorn

app = FastAPI(title="Token Management API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tokens_router)

# Health check
@app.get("/api/health")
async def health():
    return {"status": "ok"}

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Token Management API", "base_url": API_BASE_URL}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
```

---

## requirements.txt

```
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
pymysql==1.1.0
python-jose==3.3.0
python-dotenv==1.0.0
pydantic==2.5.0
cryptography==41.0.7
```

---

## Running the Server

### 1. Create .env file

```bash
cp .env.example .env
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Run server

```bash
python -m uvicorn app.main:app --reload --port 8000
```

Or use the main.py directly:

```bash
python app/main.py
```

### 4. Test endpoints

```bash
# Test GET /tokens/usage
curl -X GET http://localhost:8000/api/tokens/usage \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test POST /tokens/set-plan
curl -X POST http://localhost:8000/api/tokens/set-plan \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan":"premium","reset_used":false}'
```

---

## Key Features

✅ **Async/Await Support**: Full async implementation for performance
✅ **Automatic Validation**: Pydantic models validate requests
✅ **JWT Authentication**: Secure token verification
✅ **Database ORM**: SQLAlchemy for database operations
✅ **CORS Enabled**: Cross-origin requests handled
✅ **Auto API Docs**: Swagger UI at `/docs`
✅ **Error Handling**: Proper HTTP status codes and error messages

---

## Database Setup (MySQL)

```sql
-- Create database
CREATE DATABASE token_management;
USE token_management;

-- Create users table
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
  core_processes VARCHAR(1000),
  monthly_revenue DECIMAL(15, 2),
  employees INT,
  goal_amount DECIMAL(15, 2),
  goal_years INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- Create user_plans table
CREATE TABLE user_plans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  plan VARCHAR(20) DEFAULT 'basic',
  token_quota INT NOT NULL,
  token_used INT DEFAULT 0,
  plan_end_at TIMESTAMP NULL,
  last_reset_month INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_plan (user_id),
  INDEX idx_plan_end (plan_end_at)
);

-- Create payments table
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  razorpay_order_id VARCHAR(100),
  razorpay_payment_id VARCHAR(100),
  razorpay_signature VARCHAR(255),
  plan VARCHAR(20) NOT NULL,
  amount INT,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_order (razorpay_order_id),
  INDEX idx_user_payment (user_id)
);
```

---

## Deployment

### Using Gunicorn (Production)

```bash
pip install gunicorn

gunicorn app.main:app -w 4 -b 0.0.0.0:8000 --reload
```

### Using Docker

```dockerfile
FROM python:3.11

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker build -t token-api .
docker run -p 8000:8000 token-api
```

---

## Testing

### Unit Tests

```python
# tests/test_tokens.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_usage_unauthorized():
    response = client.get("/api/tokens/usage")
    assert response.status_code == 403

def test_set_plan_invalid_plan():
    response = client.post(
        "/api/tokens/set-plan",
        json={"plan": "invalid"},
        headers={"Authorization": "Bearer fake_token"}
    )
    assert response.status_code in [400, 401]
```

---

## Summary

This FastAPI implementation provides:
- ✅ Clean async code
- ✅ Automatic validation
- ✅ Proper error handling
- ✅ JWT authentication
- ✅ Database ORM integration
- ✅ CORS support
- ✅ Auto-generated API documentation

Ready to integrate with your React frontend!
