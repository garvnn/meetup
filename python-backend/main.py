from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="PennApps Meetup API", version="1.0.0")

# CORS middleware for React Native app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class MeetupCreate(BaseModel):
    title: str
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class MeetupResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    token: str
    created_at: str

class MessageCreate(BaseModel):
    meetup_id: str
    content: str

class MessageResponse(BaseModel):
    id: str
    meetup_id: str
    user_id: str
    content: str
    created_at: str

@app.get("/")
async def root():
    return {"message": "PennApps Meetup API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/meetups", response_model=MeetupResponse)
async def create_meetup(meetup: MeetupCreate):
    # TODO: Implement meetup creation with Supabase
    raise HTTPException(status_code=501, detail="Not implemented yet")

@app.get("/meetups/{meetup_id}", response_model=MeetupResponse)
async def get_meetup(meetup_id: str):
    # TODO: Implement meetup retrieval
    raise HTTPException(status_code=501, detail="Not implemented yet")

@app.get("/meetups/token/{token}", response_model=MeetupResponse)
async def get_meetup_by_token(token: str):
    # TODO: Implement meetup retrieval by token
    raise HTTPException(status_code=501, detail="Not implemented yet")

@app.post("/meetups/{meetup_id}/messages", response_model=MessageResponse)
async def create_message(meetup_id: str, message: MessageCreate):
    # TODO: Implement message creation
    raise HTTPException(status_code=501, detail="Not implemented yet")

@app.get("/meetups/{meetup_id}/messages", response_model=List[MessageResponse])
async def get_messages(meetup_id: str):
    # TODO: Implement message retrieval
    raise HTTPException(status_code=501, detail="Not implemented yet")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)