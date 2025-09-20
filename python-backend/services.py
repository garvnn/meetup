"""
Service layer for database operations
"""

import os
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple, List
import httpx
from validators import CreateMeetupRequest, AcceptInviteRequest, SoftBanRequest, SendMessageRequest, GetMessagesRequest, MessageResponse


class SupabaseService:
    """Service for interacting with Supabase"""
    
    def __init__(self):
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_ANON_KEY')
        self.supabase_service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        # Allow mock mode if Supabase is not configured
        self.mock_mode = not (self.supabase_url and self.supabase_key)
        
        if self.mock_mode:
            print("Running in mock mode - Supabase not configured")
    
    def _get_headers(self, use_service_key: bool = False) -> Dict[str, str]:
        """Get headers for Supabase requests"""
        key = self.supabase_service_key if use_service_key else self.supabase_key
        return {
            'apikey': key,
            'Authorization': f'Bearer {key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }
    
    async def create_meetup(self, request: CreateMeetupRequest, user_id: str) -> Tuple[str, str, str]:
        """
        Create a meetup using the database function
        Returns: (meetup_id, token, deep_link)
        """
        if self.mock_mode:
            # Mock mode
            return self._mock_create_meetup(request, user_id)
        
        async with httpx.AsyncClient() as client:
            # Call the create_meetup function
            response = await client.post(
                f"{self.supabase_url}/rest/v1/rpc/create_meetup",
                headers=self._get_headers(use_service_key=True),
                json={
                    'p_host_id': user_id,
                    'p_title': request.title,
                    'p_desc': request.desc,
                    'p_start_ts': request.start_ts.isoformat(),
                    'p_end_ts': request.end_ts.isoformat(),
                    'p_lat': request.lat,
                    'p_lng': request.lng,
                    'p_visibility': request.visibility,
                    'p_token_ttl_hours': request.token_ttl_hours
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"Database error: {response.text}")
            
            result = response.json()
            if not result:
                raise Exception("No result returned from create_meetup")
            
            return result[0]['meetup_id'], result[0]['token'], result[0]['deep_link']
    
    async def accept_invite(self, request: AcceptInviteRequest) -> Tuple[bool, str, Optional[str]]:
        """
        Accept an invite token
        Returns: (success, message, meetup_id)
        """
        if self.mock_mode:
            # Mock mode
            return self._mock_accept_invite(request)
        
        async with httpx.AsyncClient() as client:
            # First, validate the token
            token_response = await client.get(
                f"{self.supabase_url}/rest/v1/invite_tokens",
                headers=self._get_headers(),
                params={
                    'token': f'eq.{request.token}',
                    'expires_at': f'gt.{datetime.now().isoformat()}',
                    'revoked_at': 'is.null'
                }
            )
            
            if token_response.status_code != 200:
                raise Exception(f"Database error: {token_response.text}")
            
            tokens = token_response.json()
            if not tokens:
                return False, "Invalid or expired token", None
            
            token_data = tokens[0]
            meetup_id = token_data['meetup_id']
            
            # Check if user is already a member
            membership_response = await client.get(
                f"{self.supabase_url}/rest/v1/memberships",
                headers=self._get_headers(),
                params={
                    'meetup_id': f'eq.{meetup_id}',
                    'user_id': f'eq.{request.user_id}'
                }
            )
            
            if membership_response.status_code != 200:
                raise Exception(f"Database error: {membership_response.text}")
            
            memberships = membership_response.json()
            if memberships:
                return True, "Already a member", meetup_id
            
            # Add membership
            membership_response = await client.post(
                f"{self.supabase_url}/rest/v1/memberships",
                headers=self._get_headers(use_service_key=True),
                json={
                    'meetup_id': meetup_id,
                    'user_id': request.user_id,
                    'role': 'member'
                }
            )
            
            if membership_response.status_code not in [200, 201]:
                raise Exception(f"Database error: {membership_response.text}")
            
            return True, "Successfully joined meetup", meetup_id
    
    async def soft_ban_user(self, request: SoftBanRequest) -> Tuple[bool, str]:
        """
        Soft-ban a user in a meetup
        Returns: (success, message)
        """
        if self.mock_mode:
            # Mock mode
            return self._mock_soft_ban(request)
        
        async with httpx.AsyncClient() as client:
            # Check if meetup exists
            meetup_response = await client.get(
                f"{self.supabase_url}/rest/v1/meetups",
                headers=self._get_headers(),
                params={'id': f'eq.{request.meetup_id}'}
            )
            
            if meetup_response.status_code != 200:
                raise Exception(f"Database error: {meetup_response.text}")
            
            meetups = meetup_response.json()
            if not meetups:
                return False, "Meetup not found"
            
            # Update membership to soft-banned
            update_response = await client.patch(
                f"{self.supabase_url}/rest/v1/memberships",
                headers=self._get_headers(use_service_key=True),
                params={
                    'meetup_id': f'eq.{request.meetup_id}',
                    'user_id': f'eq.{request.target_user_id}'
                },
                json={
                    'soft_banned': True,
                    'soft_ban_reason': request.reason
                }
            )
            
            if update_response.status_code not in [200, 204]:
                raise Exception(f"Database error: {update_response.text}")
            
            # Record the soft-ban event
            event_response = await client.post(
                f"{self.supabase_url}/rest/v1/soft_ban_events",
                headers=self._get_headers(use_service_key=True),
                json={
                    'meetup_id': request.meetup_id,
                    'target_user_id': request.target_user_id,
                    'enacted_by': request.enacted_by,
                    'reason': request.reason
                }
            )
            
            if event_response.status_code not in [200, 201]:
                # Non-critical error, log but don't fail
                print(f"Warning: Could not record soft-ban event: {event_response.text}")
            
            return True, "User soft-banned successfully"
    
    async def _mock_create_meetup(self, request: CreateMeetupRequest, user_id: str) -> Tuple[str, str, str]:
        """Mock implementation for create meetup"""
        meetup_id = str(uuid.uuid4())
        token = "mock" + "".join([str(i % 10) for i in range(32)])
        deep_link = f"pennapps://join/{token}"
        
        print(f"Mock: Created meetup {meetup_id} for user {user_id}")
        print(f"Mock: Token {token}, Deep link {deep_link}")
        
        return meetup_id, token, deep_link
    
    async def _mock_accept_invite(self, request: AcceptInviteRequest) -> Tuple[bool, str, Optional[str]]:
        """Mock implementation for accept invite"""
        if request.token.startswith("mock") or request.token == "demo123abc":
            meetup_id = "mock-meetup-123"
            print(f"Mock: User {request.user_id} joined meetup {meetup_id}")
            return True, "Successfully joined meetup", meetup_id
        else:
            return False, "Invalid token", None
    
    async def _mock_soft_ban(self, request: SoftBanRequest) -> Tuple[bool, str]:
        """Mock implementation for soft ban"""
        print(f"Mock: Soft-banned user {request.target_user_id} in meetup {request.meetup_id}")
        return True, "User soft-banned successfully"
    
    async def send_message(self, request: SendMessageRequest) -> Tuple[bool, str, Optional[str]]:
        """
        Send a message to a meetup
        Returns: (success, message, message_id)
        """
        if self.mock_mode:
            return self._mock_send_message(request)
        
        async with httpx.AsyncClient() as client:
            # Check if user is a member of the meetup
            membership_response = await client.get(
                f"{self.supabase_url}/rest/v1/memberships",
                headers=self._get_headers(),
                params={
                    'meetup_id': f'eq.{request.meetup_id}',
                    'user_id': f'eq.{request.user_id}'
                }
            )
            
            if membership_response.status_code != 200:
                raise Exception(f"Database error: {membership_response.text}")
            
            memberships = membership_response.json()
            if not memberships:
                return False, "You are not a member of this meetup", None
            
            # Insert the message
            message_response = await client.post(
                f"{self.supabase_url}/rest/v1/messages",
                headers=self._get_headers(use_service_key=True),
                json={
                    'meetup_id': request.meetup_id,
                    'user_id': request.user_id,
                    'message': request.message,
                    'message_type': request.message_type,
                    'timestamp': datetime.now().isoformat()
                }
            )
            
            if message_response.status_code not in [200, 201]:
                raise Exception(f"Database error: {message_response.text}")
            
            message_data = message_response.json()
            message_id = message_data[0]['id'] if message_data else str(uuid.uuid4())
            
            return True, "Message sent successfully", message_id
    
    async def get_messages(self, request: GetMessagesRequest) -> Tuple[bool, str, Optional[List[MessageResponse]]]:
        """
        Get messages for a meetup
        Returns: (success, message, messages)
        """
        if self.mock_mode:
            return self._mock_get_messages(request)
        
        async with httpx.AsyncClient() as client:
            # Check if user is a member of the meetup
            membership_response = await client.get(
                f"{self.supabase_url}/rest/v1/memberships",
                headers=self._get_headers(),
                params={
                    'meetup_id': f'eq.{request.meetup_id}',
                    'user_id': f'eq.{request.user_id}'
                }
            )
            
            if membership_response.status_code != 200:
                raise Exception(f"Database error: {membership_response.text}")
            
            memberships = membership_response.json()
            if not memberships:
                return False, "You are not a member of this meetup", None
            
            # Get messages with user names
            messages_response = await client.get(
                f"{self.supabase_url}/rest/v1/messages",
                headers=self._get_headers(),
                params={
                    'meetup_id': f'eq.{request.meetup_id}',
                    'order': 'timestamp.desc',
                    'limit': request.limit,
                    'offset': request.offset
                }
            )
            
            if messages_response.status_code != 200:
                raise Exception(f"Database error: {messages_response.text}")
            
            messages_data = messages_response.json()
            messages = []
            
            for msg in messages_data:
                # Get user name (in a real app, this would be a join)
                user_response = await client.get(
                    f"{self.supabase_url}/rest/v1/users",
                    headers=self._get_headers(),
                    params={'id': f'eq.{msg["user_id"]}'}
                )
                
                user_name = "Unknown User"
                if user_response.status_code == 200:
                    users = user_response.json()
                    if users:
                        user_name = users[0].get('name', 'Unknown User')
                
                messages.append(MessageResponse(
                    id=msg['id'],
                    meetup_id=msg['meetup_id'],
                    user_id=msg['user_id'],
                    user_name=user_name,
                    message=msg['message'],
                    message_type=msg['message_type'],
                    timestamp=datetime.fromisoformat(msg['timestamp'].replace('Z', '+00:00')),
                    is_own_message=msg['user_id'] == request.user_id
                ))
            
            return True, "Messages retrieved successfully", messages
    
    async def _mock_send_message(self, request: SendMessageRequest) -> Tuple[bool, str, Optional[str]]:
        """Mock implementation for sending a message"""
        message_id = str(uuid.uuid4())
        print(f"Mock: User {request.user_id} sent message to meetup {request.meetup_id}: {request.message}")
        return True, "Message sent successfully", message_id
    
    async def _mock_get_messages(self, request: GetMessagesRequest) -> Tuple[bool, str, Optional[List[MessageResponse]]]:
        """Mock implementation for getting messages"""
        # Generate some mock messages
        mock_messages = [
            MessageResponse(
                id=str(uuid.uuid4()),
                meetup_id=request.meetup_id,
                user_id="host1",
                user_name="Demo Host",
                message="Welcome to the meetup!",
                message_type="announcement",
                timestamp=datetime.now() - timedelta(hours=1),
                is_own_message=request.user_id == "host1"
            ),
            MessageResponse(
                id=str(uuid.uuid4()),
                meetup_id=request.meetup_id,
                user_id="user1",
                user_name="Test User",
                message="Thanks for organizing this!",
                message_type="text",
                timestamp=datetime.now() - timedelta(minutes=30),
                is_own_message=request.user_id == "user1"
            ),
            MessageResponse(
                id=str(uuid.uuid4()),
                meetup_id=request.meetup_id,
                user_id=request.user_id,
                user_name="You",
                message="Looking forward to it!",
                message_type="text",
                timestamp=datetime.now() - timedelta(minutes=10),
                is_own_message=True
            )
        ]
        
        print(f"Mock: Retrieved {len(mock_messages)} messages for meetup {request.meetup_id}")
        return True, "Messages retrieved successfully", mock_messages
