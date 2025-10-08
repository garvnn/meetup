"""
PennApps Private Meetups FastAPI Backend

This is a mini-service that coordinates invite acceptance and soft-ban functionality
for the private meetups app. It can work with or without Supabase credentials.

Quickstart:
1. Install dependencies: pip install -r requirements.txt
2. Set environment variables (see .env.example)
3. Run: uvicorn main:app --reload
4. API will be available at http://localhost:8000

Endpoints:
- GET /health - Health check
- POST /accept_invite - Accept an invite token and join meetup
- POST /soft_ban - Enact soft-ban on a user in a meetup

The service will fall back to mock responses if Supabase credentials are not provided.
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import uuid
from datetime import datetime, timedelta
from dotenv import load_dotenv
import httpx
import asyncio
from validators import CreateMeetupRequest, CreateMeetupResponse, AcceptInviteRequest, AcceptInviteResponse, SoftBanRequest, SoftBanResponse, ErrorResponse, SendMessageRequest, SendMessageResponse, GetMessagesRequest, GetMessagesResponse
from services import SupabaseService

load_dotenv()

app = FastAPI(
    title="PennApps Meetup API",
    version="1.0.0",
    description="Mini-service for invite acceptance and soft-ban coordination"
)

# CORS middleware for React Native app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For hackathon - allows all origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
MOCK_MODE = not (SUPABASE_URL and SUPABASE_SERVICE_KEY)

# Pydantic models
class HealthResponse(BaseModel):
    status: str
    timestamp: str
    mock_mode: bool

# Mock data storage (in-memory, will be lost on restart)
mock_invite_tokens: Dict[str, Dict[str, Any]] = {}
mock_meetups: Dict[str, Dict[str, Any]] = {}
mock_memberships: Dict[str, List[Dict[str, Any]]] = {}
mock_soft_bans: Dict[str, List[Dict[str, Any]]] = {}

# Initialize mock data
def init_mock_data():
    """Initialize mock data for demo purposes"""
    if not MOCK_MODE:
        return
    
    # Mock meetup
    meetup_id = str(uuid.uuid4())
    mock_meetups[meetup_id] = {
        "id": meetup_id,
        "title": "Demo PennApps Meetup",
        "description": "A demo meetup for testing",
        "start_ts": (datetime.now() + timedelta(minutes=30)).isoformat(),
        "end_ts": (datetime.now() + timedelta(hours=2)).isoformat(),
        "lat": 39.9526,
        "lng": -75.1652,
        "ended_at": None,
        "created_at": datetime.now().isoformat()
    }
    
    # Mock invite token
    token = "demo123abc"
    mock_invite_tokens[token] = {
        "id": str(uuid.uuid4()),
        "meetup_id": meetup_id,
        "token": token,
        "expires_at": (datetime.now() + timedelta(hours=2)).isoformat(),
        "revoked_at": None,
        "created_by": "demo-host",
        "created_at": datetime.now().isoformat()
    }
    
    # Mock memberships
    mock_memberships[meetup_id] = [
        {
            "meetup_id": meetup_id,
            "user_id": "demo-host",
            "role": "host",
            "soft_banned": False,
            "joined_at": datetime.now().isoformat()
        }
    ]

# Supabase client
class SupabaseClient:
    def __init__(self):
        self.url = SUPABASE_URL
        self.key = SUPABASE_SERVICE_KEY
        self.headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json"
        }
    
    async def get_invite_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Get invite token from Supabase"""
        if MOCK_MODE:
            return mock_invite_tokens.get(token)
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.url}/rest/v1/invite_tokens",
                    headers=self.headers,
                    params={"token": f"eq.{token}", "revoked_at": "is.null"}
                )
                response.raise_for_status()
                data = response.json()
                return data[0] if data else None
        except Exception as e:
            print(f"Error fetching invite token: {e}")
            return None
    
    async def get_meetup(self, meetup_id: str) -> Optional[Dict[str, Any]]:
        """Get meetup from Supabase"""
        if MOCK_MODE:
            return mock_meetups.get(meetup_id)
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.url}/rest/v1/meetups",
                    headers=self.headers,
                    params={"id": f"eq.{meetup_id}"}
                )
                response.raise_for_status()
                data = response.json()
                return data[0] if data else None
        except Exception as e:
            print(f"Error fetching meetup: {e}")
            return None
    
    async def join_meetup(self, meetup_id: str, user_id: str) -> bool:
        """Join a meetup"""
        if MOCK_MODE:
            if meetup_id not in mock_memberships:
                mock_memberships[meetup_id] = []
            
            # Check if already a member
            for membership in mock_memberships[meetup_id]:
                if membership["user_id"] == user_id:
                    return True
            
            # Add membership
            mock_memberships[meetup_id].append({
                "meetup_id": meetup_id,
                "user_id": user_id,
                "role": "member",
                "soft_banned": False,
                "joined_at": datetime.now().isoformat()
            })
            return True
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.url}/rest/v1/memberships",
                    headers=self.headers,
                    json={
                        "meetup_id": meetup_id,
                        "user_id": user_id,
                        "role": "member",
                        "joined_at": datetime.now().isoformat()
                    }
                )
                response.raise_for_status()
                return True
        except Exception as e:
            print(f"Error joining meetup: {e}")
            return False
    
    async def soft_ban_user(self, meetup_id: str, target_user_id: str, enacted_by: str, reason: str = None) -> bool:
        """Soft-ban a user in a meetup"""
        if MOCK_MODE:
            # Update membership
            if meetup_id in mock_memberships:
                for membership in mock_memberships[meetup_id]:
                    if membership["user_id"] == target_user_id:
                        membership["soft_banned"] = True
                        membership["soft_ban_reason"] = reason
                        break
            
            # Add soft-ban event
            if meetup_id not in mock_soft_bans:
                mock_soft_bans[meetup_id] = []
            
            mock_soft_bans[meetup_id].append({
                "id": str(uuid.uuid4()),
                "meetup_id": meetup_id,
                "target_user_id": target_user_id,
                "enacted_by": enacted_by,
                "reason": reason,
                "created_at": datetime.now().isoformat()
            })
            return True
        
        try:
            async with httpx.AsyncClient() as client:
                # Update membership
                response = await client.patch(
                    f"{self.url}/rest/v1/memberships",
                    headers=self.headers,
                    params={"meetup_id": f"eq.{meetup_id}", "user_id": f"eq.{target_user_id}"},
                    json={
                        "soft_banned": True,
                        "soft_ban_reason": reason
                    }
                )
                response.raise_for_status()
                
                # Add soft-ban event
                response = await client.post(
                    f"{self.url}/rest/v1/soft_ban_events",
                    headers=self.headers,
                    json={
                        "meetup_id": meetup_id,
                        "target_user_id": target_user_id,
                        "enacted_by": enacted_by,
                        "reason": reason,
                        "created_at": datetime.now().isoformat()
                    }
                )
                response.raise_for_status()
                return True
        except Exception as e:
            print(f"Error soft-banning user: {e}")
            return False

# Initialize Supabase client
supabase = SupabaseClient()
supabase_service = SupabaseService()

# Initialize mock data
init_mock_data()

@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint with basic info"""
    return HealthResponse(
        status="ok",
        timestamp=datetime.now().isoformat(),
        mock_mode=MOCK_MODE
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        mock_mode=MOCK_MODE
    )

@app.post("/create_meetup", response_model=CreateMeetupResponse)
async def create_meetup(request: CreateMeetupRequest):
    """
    Create a new meetup
    
    This endpoint:
    1. Validates the request (title, times, location)
    2. Creates the meetup with host membership
    3. Generates an invite token
    4. Returns meetup details and deep link
    """
    try:
        # For now, use a proper UUID - in production this would come from auth
        user_id = "550e8400-e29b-41d4-a716-446655440000"
        
        # Create the meetup using the service
        meetup_id, token, deep_link = await supabase_service.create_meetup(request, user_id)
        
        return CreateMeetupResponse(
            meetup_id=meetup_id,
            token=token,
            deep_link=deep_link,
            success=True
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error in create_meetup: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/accept_invite", response_model=AcceptInviteResponse)
async def accept_invite(request: AcceptInviteRequest):
    """
    Accept an invite token and join the meetup
    
    This endpoint:
    1. Validates the invite token (exists, not revoked, not expired)
    2. Checks if the meetup is still active (not ended)
    3. Adds the user to the meetup as a member
    4. Returns the meetup ID for the frontend to navigate to
    """
    try:
        # Use the service layer
        success, message, meetup_id = await supabase_service.accept_invite(request)
        
        if not success:
            raise HTTPException(status_code=404, detail=message)
        
        return AcceptInviteResponse(
            meetup_id=meetup_id,
            success=True,
            message=message
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in accept_invite: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/soft_ban", response_model=SoftBanResponse)
async def soft_ban(request: SoftBanRequest):
    """
    Enact a soft-ban on a user in a meetup
    
    This endpoint:
    1. Validates the meetup exists and is active
    2. Updates the user's membership to set soft_banned=true
    3. Records the soft-ban event for audit purposes
    4. Returns success confirmation
    """
    try:
        # Use the service layer
        success, message = await supabase_service.soft_ban_user(request)
        
        if not success:
            raise HTTPException(status_code=400, detail=message)
        
        return SoftBanResponse(
            success=True,
            message=message
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in soft_ban: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/send_message", response_model=SendMessageResponse)
async def send_message(request: SendMessageRequest):
    """
    Send a message to a meetup chat
    
    This endpoint allows users to send messages to meetups they are members of.
    The message can be either a regular text message or an announcement.
    
    Process:
    1. Validates that the user is a member of the meetup
    2. Stores the message in the database
    3. Returns success confirmation with message ID
    """
    try:
        # Use the service layer
        success, message, message_id = await supabase_service.send_message(request)
        
        if not success:
            raise HTTPException(status_code=403, detail=message)
        
        return SendMessageResponse(
            success=True,
            message_id=message_id,
            message=message
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in send_message: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/get_messages", response_model=GetMessagesResponse)
async def get_messages(request: GetMessagesRequest):
    """
    Get messages for a meetup chat
    
    This endpoint retrieves messages from a meetup chat that the user is a member of.
    Messages are returned in reverse chronological order (newest first).
    
    Process:
    1. Validates that the user is a member of the meetup
    2. Retrieves messages from the database with pagination
    3. Returns messages with user information
    """
    try:
        # Use the service layer
        success, message, messages = await supabase_service.get_messages(request)
        
        if not success:
            raise HTTPException(status_code=403, detail=message)
        
        if messages is None:
            messages = []
        
        return GetMessagesResponse(
            messages=messages,
            total_count=len(messages),
            has_more=False  # In a real implementation, this would be calculated based on pagination
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_messages: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/debug/mock-data")
async def debug_mock_data():
    """Debug endpoint to view mock data (only available in mock mode)"""
    if not MOCK_MODE:
        raise HTTPException(status_code=404, detail="Not available in production mode")
    
    return {
        "invite_tokens": mock_invite_tokens,
        "meetups": mock_meetups,
        "memberships": mock_memberships,
        "soft_bans": mock_soft_bans
    }

if __name__ == "__main__":
    import uvicorn
    print("Starting PennApps Meetup API...")
    print(f"Mock mode: {MOCK_MODE}")
    print(f"Supabase URL: {SUPABASE_URL or 'Not configured'}")
    print("API Documentation: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)