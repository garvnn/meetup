#!/usr/bin/env python3
"""
Simple FastAPI backend for testing - minimal implementation
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from datetime import datetime
import uuid

# Create FastAPI app
app = FastAPI(
    title="PennApps Meetup API - Simple",
    version="1.0.0",
    description="Simple backend for testing"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Simple models
class HealthResponse(BaseModel):
    status: str
    timestamp: str
    mock_mode: bool = True

class CreateMeetupRequest(BaseModel):
    title: str
    desc: Optional[str] = None
    start_ts: str
    end_ts: str
    lat: float
    lng: float
    visibility: str = "private"
    token_ttl_hours: Optional[int] = None

class CreateMeetupResponse(BaseModel):
    meetup_id: str
    token: str
    deep_link: str
    success: bool

@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint"""
    return HealthResponse(
        status="ok",
        timestamp=datetime.now().isoformat(),
        mock_mode=True
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        mock_mode=True
    )

@app.post("/create_meetup", response_model=CreateMeetupResponse)
async def create_meetup(request: CreateMeetupRequest):
    """Create a new meetup - simple mock implementation"""
    try:
        # Generate mock data
        meetup_id = str(uuid.uuid4())
        token = "mock" + "".join([str(i % 10) for i in range(32)])
        deep_link = f"pennapps://join/{token}"
        
        print(f"Created meetup: {meetup_id}")
        print(f"Title: {request.title}")
        print(f"Location: {request.lat}, {request.lng}")
        
        return CreateMeetupResponse(
            meetup_id=meetup_id,
            token=token,
            deep_link=deep_link,
            success=True
        )
        
    except Exception as e:
        print(f"Error creating meetup: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/accept_invite")
async def accept_invite():
    """Accept invite - simple mock"""
    return {"success": True, "message": "Mock invite accepted"}

@app.post("/soft_ban")
async def soft_ban():
    """Soft ban - simple mock"""
    return {"success": True, "message": "Mock soft ban applied"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
