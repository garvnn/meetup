# PennApps Meetups App

A private, link-only meetups application with iOS-native design, real-time chat, and file sharing capabilities.

## 🏗️ Tech Stack

### Frontend
- **Framework**: React Native with Expo (managed workflow)
- **Navigation**: Expo Router (file-based routing)
- **Maps**: react-native-maps (Apple Maps on iOS)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **UI Components**: Custom iOS-style components with blur effects
- **Icons**: @expo/vector-icons (SF Symbols)
- **Animations**: expo-haptics for feedback
- **Blur Effects**: expo-blur for glass morphism
- **Safe Areas**: react-native-safe-area-context
- **SVG**: react-native-svg for custom pins and bubbles

### Backend
- **API**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL + Realtime + Storage)
- **Authentication**: Clerk (email + phone OTP)
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime subscriptions

### Development Tools
- **Language**: TypeScript (frontend), Python (backend)
- **Package Manager**: npm (frontend), pip (backend)
- **Environment**: Python virtual environment
- **Testing**: Custom API test scripts

## 📁 Project Structure

```
pennapps/
├── 📱 Frontend (React Native + Expo)
│   ├── app/                          # Expo Router pages
│   │   ├── _layout.tsx              # Root layout with providers
│   │   └── map/
│   │       └── index.tsx            # Map page with Apple Maps
│   ├── components/                   # Reusable UI components
│   │   ├── BottomSheetCard.tsx      # iOS-style bottom sheet
│   │   ├── MeetupPin.tsx            # Custom map pin with bubbles
│   │   ├── ModeSwitcher.tsx         # Camera-style page switcher
│   │   ├── SearchBar.tsx            # Pill-style search input
│   │   ├── TabIcons.tsx             # SF Symbol icon wrappers
│   │   └── EmptyState.tsx           # Reusable empty states
│   ├── lib/                         # Core business logic
│   │   ├── auth.ts                  # Clerk authentication
│   │   ├── config.ts                # App configuration & constants
│   │   ├── data.ts                  # Mock data & API helpers
│   │   ├── supabase.ts              # Supabase client & types
│   │   └── tokenCache.ts            # Secure token storage
│   ├── utils/                       # Utility functions
│   │   ├── theme.ts                 # Design system tokens
│   │   ├── bubbles.ts               # Bubble calculations
│   │   ├── formatters.ts            # Date/time formatters
│   │   ├── guards.ts                # Client-side guards
│   │   └── pager.ts                 # Pager utilities
│   ├── App.js                       # Main app component
│   ├── index.js                     # Expo entry point
│   └── app.json                     # Expo configuration
│
├── 🐍 Backend (Python + FastAPI)
│   └── python-backend/
│       ├── main.py                  # FastAPI application
│       ├── requirements.txt         # Python dependencies
│       └── venv/                    # Virtual environment
│
├── 🗄️ Database
│   └── sql/
│       ├── schema.sql               # Database schema
│       └── seed.sql                 # Sample data
│
├── 🧪 Testing
│   ├── test_api.py                  # API endpoint tests
│   └── TESTING_GUIDE.md             # Testing instructions
│
└── 📚 Documentation
    ├── README.md                    # This file
    └── .env.example                 # Environment variables template
```

## 🎯 Core Features

### 1. **Private Meetups**
- Hosts create private meetups with textable deep links
- Invite-only system with secure token-based access
- Auto-join functionality for verified users

### 2. **iOS-Native Map Interface**
- Apple Maps integration with custom pins
- White-to-green bubble system showing attendee count
- Camera-style page switcher (Map • Messages • List)
- Blur effects and haptic feedback

### 3. **Real-time Chat**
- In-app messaging for each meetup
- Real-time message updates via Supabase
- Message history and notifications

### 4. **File Sharing**
- Shared files tab for images, PDFs, and text notes
- 25 files OR 100 MB quota per meetup
- 10 MB max file size limit

### 5. **Moderation System**
- Soft-ban functionality (3 reports in 10 minutes)
- Per-meetup moderation with temporary restrictions
- Reporting system for users, messages, and files

## 📱 Key Components

### **Map Page** (`app/map/index.tsx`)
- **Function**: Main map interface with Apple Maps
- **Features**: Custom pins, search, bottom sheet details
- **Props**: No compass, traffic, or native callouts

### **MeetupPin** (`components/MeetupPin.tsx`)
- **Function**: Custom map pin with attendee bubble
- **Features**: White-to-green gradient, attendee count display
- **Bubble Sizes**: 20px (0-3), 28px (4-10), 36px (11-50), 44px (50+)

### **BottomSheetCard** (`components/BottomSheetCard.tsx`)
- **Function**: iOS-style modal for meetup details
- **Features**: Blur background, rounded corners, action buttons
- **Actions**: Join/Leave, Share, Open Chat

### **ModeSwitcher** (`components/ModeSwitcher.tsx`)
- **Function**: Camera-style page navigation
- **Pages**: Map, Messages, List
- **Features**: Blur background, haptic feedback

## 🔧 Configuration

### **App Config** (`lib/config.ts`)
```typescript
CONFIG = {
  AUTH: { email: true, phone: true },
  MAP: { defaultLatitude: 39.9526, defaultLongitude: -75.1952 },
  MEETUP: { maxDuration: 24, defaultDuration: 2 },
  FILE: { maxFiles: 25, maxSize: 100, maxFileSize: 10 },
  REPORT: { threshold: 3, window: 10 }
}
```

### **Bubble Thresholds**
- **0-3 attendees**: White bubble (20px)
- **4-10 attendees**: Light green (28px)
- **11-50 attendees**: Medium green (36px)
- **50+ attendees**: Dark green (44px)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.8+
- Expo CLI
- iOS Simulator or physical device

### Frontend Setup
```bash
npm install
npx expo start
```

### Backend Setup
```bash
cd python-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Environment Variables
Copy `.env.example` to `.env` and configure:
- Supabase URL and keys
- Clerk publishable key
- API endpoints

## 👥 Team Setup

### For Physical iOS Devices (HTTPS Required)

1. **Start the backend server:**
   ```bash
   cd python-backend
   source venv/bin/activate
   uvicorn main:app --reload --port 8000
   ```

2. **Expose backend over HTTPS using ngrok:**
   ```bash
   npx ngrok http 8000
   ```
   Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

3. **Start Expo with tunnel:**
   ```bash
   npx expo start --tunnel
   ```

4. **Update API URL in the app:**
   - Tap the app title 5 times to open Developer Panel
   - Or tap the API status pill (top-right)
   - Enter your ngrok HTTPS URL
   - Run connectivity test to verify

### For iOS Simulator (HTTP OK)

1. **Start backend:**
   ```bash
   cd python-backend && uvicorn main:app --reload
   ```

2. **Start Expo:**
   ```bash
   npx expo start
   ```

3. **Use default API URL:** `http://localhost:8000`

### For Android Emulator

1. **Start backend:**
   ```bash
   cd python-backend && uvicorn main:app --reload
   ```

2. **Start Expo:**
   ```bash
   npx expo start
   ```

3. **Update API URL to:** `http://10.0.2.2:8000`

### Developer Panel Features

- **API Health Check**: Real-time status monitoring
- **URL Management**: Change API URL without restarting
- **Platform Validation**: Automatic HTTPS checks for iOS
- **Connectivity Test**: Verify API reachability

### Alternative HTTPS Solutions

- **Cloudflare Tunnel**: `cloudflared tunnel --url http://localhost:8000`
- **Railway/Render**: Deploy backend to cloud service
- **Local HTTPS**: Use mkcert for local SSL certificates

## 🧪 Testing

### API Testing
```bash
python test_api.py
```

### Frontend Testing
- Scan QR code with Expo Go
- Test deep links: `pennapps://join/demo123abc`
- Verify map interactions and bottom sheet

## 📊 Database Schema

### Core Tables
- **users**: User profiles and Clerk integration
- **meetups**: Meetup details and metadata
- **memberships**: User-meetup relationships
- **messages**: Real-time chat messages
- **files**: Shared file metadata
- **invite_tokens**: Secure invitation system
- **reports**: Moderation and soft-ban tracking

## 🎨 Design System

### Colors
- **Primary**: #007AFF (iOS Blue)
- **Background**: #F2F2F7 (Light Gray)
- **Surface**: #FFFFFF (White)
- **Bubble Gradient**: White → Light Green → Dark Green

### Typography
- **Large Title**: 34px, Bold
- **Title**: 28px, Bold
- **Body**: 17px, Regular
- **Caption**: 12px, Regular

### Spacing
- **xs**: 4px, **sm**: 8px, **md**: 16px
- **lg**: 24px, **xl**: 32px, **xxl**: 48px

## 🔒 Security Features

- **Row Level Security** (RLS) on all Supabase tables
- **Secure token storage** with Expo SecureStore
- **Invite token expiration** tied to meetup end time
- **Soft-ban system** with per-meetup restrictions
- **File upload validation** with size and type limits

## 📈 Performance

- **Optimized map rendering** with custom pins
- **Efficient real-time updates** via Supabase subscriptions
- **Lazy loading** for meetup lists and messages
- **Image optimization** for file uploads
- **Haptic feedback** for smooth interactions

## 🛠️ Development Notes

- **TypeScript** for type safety
- **Expo managed workflow** for easy deployment
- **Mock data system** for development without backend
- **Hot reloading** for rapid iteration
- **iOS-first design** with Apple Human Interface Guidelines

## 📝 License

This project is part of the PennApps hackathon and is for educational purposes.

---

**Built with ❤️ for PennApps 2024**