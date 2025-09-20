#!/usr/bin/env python3
"""
Test script for the PennApps Meetup API
Run this to test the backend functionality
"""

import requests
import json

API_BASE = "http://localhost:8000"

def test_health():
    """Test the health endpoint"""
    print("🔍 Testing health endpoint...")
    response = requests.get(f"{API_BASE}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_accept_invite():
    """Test accepting an invite"""
    print("🔍 Testing accept invite endpoint...")
    
    # Test with demo token
    data = {
        "token": "demo123abc",
        "user_id": "test-user-123"
    }
    
    response = requests.post(f"{API_BASE}/accept_invite", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_soft_ban():
    """Test soft-ban functionality"""
    print("🔍 Testing soft-ban endpoint...")
    
    data = {
        "meetup_id": "demo-meetup-123",
        "target_user_id": "bad-user-456",
        "enacted_by": "moderator-789",
        "reason": "Test soft-ban"
    }
    
    response = requests.post(f"{API_BASE}/soft_ban", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_debug_data():
    """Test debug endpoint to see mock data"""
    print("🔍 Testing debug endpoint...")
    response = requests.get(f"{API_BASE}/debug/mock-data")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Mock meetups: {len(data.get('meetups', {}))}")
        print(f"Mock invite tokens: {len(data.get('invite_tokens', {}))}")
        print(f"Mock memberships: {len(data.get('memberships', {}))}")
    else:
        print(f"Response: {response.json()}")
    print()

if __name__ == "__main__":
    print("🚀 Testing PennApps Meetup API")
    print("=" * 50)
    
    try:
        test_health()
        test_accept_invite()
        test_soft_ban()
        test_debug_data()
        
        print("✅ All tests completed!")
        print("\n📱 Next steps:")
        print("1. Open Expo Go on your phone")
        print("2. Scan the QR code from 'npx expo start'")
        print("3. Test the deep link: pennapps://join/demo123abc")
        print("4. Try creating a meetup and sharing the link")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API. Make sure the backend is running:")
        print("   cd python-backend && source venv/bin/activate && uvicorn main:app --reload")
    except Exception as e:
        print(f"❌ Error: {e}")
