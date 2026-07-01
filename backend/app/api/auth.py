from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt

from app.core.config import settings

# Initialize Firebase Admin conditionally when mock mode is off
firebase_app = None
if not settings.MOCK_GCP:
    try:
        import firebase_admin
        from firebase_admin import auth as firebase_auth
        firebase_app = firebase_admin.initialize_app()
    except Exception as e:
        print(f"Firebase Admin SDK initialization skipped or deferred: {e}")

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str = "Citizen" # Default role

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    email: str

class UserProfile(BaseModel):
    email: str
    role: str
    name: str
    permissions: list[str]

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    
    # Real Google Firebase Auth Token Verification if mock mode is off
    if not settings.MOCK_GCP:
        try:
            from firebase_admin import auth as firebase_auth
            decoded_token = firebase_auth.verify_id_token(token)
            email = decoded_token.get("email", "")
            role = "Citizen"
            if "admin" in email:
                role = "Admin"
            elif "gov" in email or "municipal" in email:
                role = "Government"
            return {"sub": email, "role": role}
        except Exception as fe:
            # Fall back to JWT decoding if token is a local signature
            pass

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        # Check if Firebase Token Verification is simulated
        # If it starts with "fb-mock-", accept it
        if token.startswith("fb-mock-"):
            parts = token.split("-")
            role = parts[2] if len(parts) > 2 else "Citizen"
            email = parts[3] if len(parts) > 3 else "citizen@civicmind.gov"
            return {"sub": email, "role": role}
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest):
    """
    Local login endpoint for hackathon demo. In a real environment,
    the client signs in with Firebase SDK and passes the token.
    """
    # Simple validation for demo
    if not credentials.email or len(credentials.password) < 4:
        raise HTTPException(status_code=400, detail="Invalid email or password")
        
    # Standard roles mapping
    email = credentials.email.lower()
    role = credentials.role
    if "admin" in email:
        role = "Admin"
    elif "gov" in email or "muncipal" in email:
        role = "Government"
        
    access_token = create_access_token(data={"sub": email, "role": role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": role,
        "email": email
    }

@router.get("/profile", response_model=UserProfile)
async def get_profile(current_user: dict = Depends(get_current_user)):
    email = current_user.get("sub", "unknown")
    role = current_user.get("role", "Citizen")
    
    # Generate list of permissions based on role
    permissions = ["read:dashboard", "submit:feedback"]
    if role in ["Admin", "Government"]:
        permissions.extend([
            "read:analytics", "generate:reports", "manage:alerts", 
            "assign:tasks", "write:settings"
        ])
    if role == "Admin":
        permissions.append("manage:users")
        
    name = email.split("@")[0].capitalize()
    return {
        "email": email,
        "role": role,
        "name": name,
        "permissions": permissions
    }
