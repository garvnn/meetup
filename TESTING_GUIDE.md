# 🧪 PennApps Meetup App Testing Guide

## ✅ **Current Status**
- ✅ Backend API running on `http://localhost:8000` (mock mode)
- ✅ Frontend Expo server starting
- ✅ All core functionality implemented

## 🚀 **How to Test the App**

### **Step 1: Start the Servers**

**Backend (Terminal 1):**
```bash
cd python-backend
source venv/bin/activate
uvicorn main:app --reload
```
*Should show: "Starting PennApps Meetup API..." and "Mock mode: True"*

**Frontend (Terminal 2):**
```bash
npx expo start --tunnel
```
*Should show QR code and Metro bundler starting*

### **Step 2: Test the Backend API**

Run the test script:
```bash
python3 test_api.py
```

**Expected Output:**
```
🚀 Testing PennApps Meetup API
==================================================
🔍 Testing health endpoint...
Status: 200
Response: {'status': 'healthy', 'timestamp': '...', 'mock_mode': True}

🔍 Testing accept invite endpoint...
Status: 200
Response: {'meetup_id': '...', 'success': True, 'message': 'Successfully joined the meetup!'}

✅ All tests completed!
```

### **Step 3: Test the Mobile App**

1. **Install Expo Go** on your phone from App Store/Google Play
2. **Scan the QR code** from the Expo terminal
3. **Wait for the app to load** (may take 1-2 minutes first time)

### **Step 4: Test Core Features**

#### **🏠 Home Screen Test**
- Should show "My Meetups" with empty state
- Tap "Create Your First Meetup" button
- Should show alert (placeholder for create screen)

#### **🔗 Deep Link Test**
- Open a web browser on your phone
- Navigate to: `pennapps://join/demo123abc`
- Should open the app and show join screen
- Tap "Join Meetup" button
- Should show success message

#### **📱 App Navigation Test**
- Test all navigation between screens
- Check that buttons respond to taps
- Verify loading states and error handling

### **Step 5: Test Backend Endpoints Manually**

**Health Check:**
```bash
curl http://localhost:8000/health
```

**Accept Invite:**
```bash
curl -X POST http://localhost:8000/accept_invite \
  -H "Content-Type: application/json" \
  -d '{"token": "demo123abc", "user_id": "test-user"}'
```

**Soft Ban:**
```bash
curl -X POST http://localhost:8000/soft_ban \
  -H "Content-Type: application/json" \
  -d '{"meetup_id": "demo-meetup", "target_user_id": "bad-user", "enacted_by": "moderator"}'
```

## 🎯 **Key Features to Verify**

### **✅ Working Features**
- [x] Backend API with mock data
- [x] Deep link handling (`pennapps://join/token`)
- [x] Invite acceptance flow
- [x] Soft-ban functionality
- [x] Error handling and validation
- [x] Responsive UI components
- [x] Navigation between screens

### **🔄 Demo Mode Features**
- [x] Mock meetup data
- [x] Mock invite tokens
- [x] Mock user authentication
- [x] Simulated API responses

### **📋 Test Scenarios**

1. **Happy Path:**
   - Open app → See empty state
   - Use deep link → Join meetup → Success

2. **Error Handling:**
   - Invalid token → Error message
   - Network issues → Retry option
   - Missing auth → Sign-in prompt

3. **UI/UX:**
   - Loading states
   - Error messages
   - Button interactions
   - Navigation flow

## 🐛 **Troubleshooting**

### **Backend Issues:**
```bash
# Check if backend is running
curl http://localhost:8000/health

# Restart backend
cd python-backend
source venv/bin/activate
uvicorn main:app --reload
```

### **Frontend Issues:**
```bash
# Clear Expo cache
npx expo start --clear

# Check Metro bundler
npx expo start --tunnel
```

### **Common Issues:**
- **"Cannot connect to API"** → Backend not running
- **"App won't load"** → Clear Expo cache
- **"Deep link not working"** → Use tunnel mode
- **"Mock data not showing"** → Check backend logs

## 📊 **Expected Results**

### **Backend API:**
- Health endpoint returns 200
- Accept invite works with demo token
- Soft-ban returns appropriate errors
- Mock data is available

### **Mobile App:**
- App loads without crashes
- Navigation works smoothly
- Deep links open the app
- Error states are handled gracefully
- UI is responsive and intuitive

## 🎉 **Success Criteria**

The app is working correctly if:
1. ✅ Backend API responds to all endpoints
2. ✅ Mobile app loads and navigates properly
3. ✅ Deep links open the app and show join screen
4. ✅ Error handling works for invalid tokens
5. ✅ UI components render and respond to interactions
6. ✅ Mock data flows through the system

## 🚀 **Next Steps for Production**

To make this production-ready:
1. Set up Supabase database
2. Configure Clerk authentication
3. Add real file upload functionality
4. Implement push notifications
5. Add comprehensive error logging
6. Set up CI/CD pipeline

---

**Happy Testing! 🎉**
