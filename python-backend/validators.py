"""
Request validation models for the PennApps Meetup API
"""

from datetime import datetime
from typing import Optional, Literal, List
from pydantic import BaseModel, Field, validator
import re


class CreateMeetupRequest(BaseModel):
    """Request model for creating a meetup"""
    title: str = Field(..., min_length=1, max_length=200, description="Meetup title")
    desc: Optional[str] = Field(None, max_length=1000, description="Meetup description")
    start_ts: datetime = Field(..., description="Start timestamp")
    end_ts: datetime = Field(..., description="End timestamp")
    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lng: float = Field(..., ge=-180, le=180, description="Longitude")
    visibility: Literal["private", "public"] = Field("private", description="Meetup visibility")
    token_ttl_hours: Optional[int] = Field(None, ge=1, le=168, description="Token TTL in hours")

    @validator('title')
    def validate_title(cls, v):
        if not v or not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()

    @validator('end_ts')
    def validate_end_after_start(cls, v, values):
        if 'start_ts' in values and v <= values['start_ts']:
            raise ValueError('End time must be after start time')
        return v

    @validator('start_ts')
    def validate_start_not_past(cls, v):
        # Make both datetimes timezone-aware for comparison
        now = datetime.now()
        if v.tzinfo is not None and now.tzinfo is None:
            # If v is timezone-aware but now is naive, make now timezone-aware
            from datetime import timezone
            now = now.replace(tzinfo=timezone.utc)
        elif v.tzinfo is None and now.tzinfo is not None:
            # If v is naive but now is timezone-aware, make v timezone-aware
            from datetime import timezone
            v = v.replace(tzinfo=timezone.utc)
        
        if v < now:
            raise ValueError('Start time cannot be in the past')
        return v


class AcceptInviteRequest(BaseModel):
    """Request model for accepting an invite"""
    token: str = Field(..., min_length=1, description="Invite token")
    user_id: str = Field(..., min_length=1, description="User ID")

    @validator('token')
    def validate_token_format(cls, v):
        # Allow demo tokens and mock tokens for testing
        if v in ['demo123abc'] or v.startswith('mock'):
            return v
        # For production tokens, expect 32 hex chars
        if not re.match(r'^[a-f0-9]{32}$', v):
            raise ValueError('Invalid token format')
        return v


class SoftBanRequest(BaseModel):
    """Request model for soft-banning a user"""
    meetup_id: str = Field(..., min_length=1, description="Meetup ID")
    target_user_id: str = Field(..., min_length=1, description="Target user ID")
    enacted_by: str = Field(..., min_length=1, description="User enacting the ban")
    reason: Optional[str] = Field(None, max_length=500, description="Reason for ban")


class CreateMeetupResponse(BaseModel):
    """Response model for creating a meetup"""
    meetup_id: str
    token: str
    deep_link: str
    success: bool = True


class AcceptInviteResponse(BaseModel):
    """Response model for accepting an invite"""
    success: bool
    message: str
    meetup_id: Optional[str] = None


class SoftBanResponse(BaseModel):
    """Response model for soft-banning"""
    success: bool
    message: str


class SendMessageRequest(BaseModel):
    """Request model for sending a message"""
    meetup_id: str = Field(..., min_length=1, description="Meetup ID")
    user_id: str = Field(..., min_length=1, description="User ID")
    message: str = Field(..., min_length=1, max_length=1000, description="Message content")
    message_type: Literal["text", "announcement"] = Field("text", description="Message type")

    @validator('message')
    def validate_message(cls, v):
        if not v or not v.strip():
            raise ValueError('Message cannot be empty')
        return v.strip()


class GetMessagesRequest(BaseModel):
    """Request model for getting messages"""
    meetup_id: str = Field(..., min_length=1, description="Meetup ID")
    user_id: str = Field(..., min_length=1, description="User ID")
    limit: Optional[int] = Field(50, ge=1, le=100, description="Number of messages to retrieve")
    offset: Optional[int] = Field(0, ge=0, description="Number of messages to skip")


class MessageResponse(BaseModel):
    """Response model for a message"""
    id: str
    meetup_id: str
    user_id: str
    user_name: str
    message: str
    message_type: str
    timestamp: datetime
    is_own_message: bool = False


class GetMessagesResponse(BaseModel):
    """Response model for getting messages"""
    messages: List[MessageResponse]
    total_count: int
    has_more: bool


class SendMessageResponse(BaseModel):
    """Response model for sending a message"""
    success: bool
    message_id: Optional[str] = None
    message: str


class ErrorResponse(BaseModel):
    """Error response model"""
    success: bool = False
    error: str
    details: Optional[str] = None
