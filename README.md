# PennApps Project

A React Native mobile application built with Expo.

## Project Structure

```
pennapps/
├── App.js                 # Main React Native app component (legacy)
├── app/                   # Expo Router pages
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Map home screen with pins/bubbles
│   ├── create.tsx         # Create private meetup
│   ├── meetup/[id].tsx    # Meetup detail: chat + files
│   ├── share/[token].tsx  # Link to share invite
│   └── join/[token].tsx   # Auto-join via deep link
├── components/            # Reusable React components
│   ├── MapBubble.tsx      # Map bubble component
│   ├── Chat.tsx           # Chat interface
│   └── FilesTab.tsx       # File sharing interface
├── lib/                   # Core libraries and utilities
│   ├── supabase.ts        # Supabase client configuration
│   ├── auth.ts            # Authentication service
│   └── tokenCache.ts      # Token caching utilities
├── utils/                 # Helper functions
│   ├── bubbles.ts         # Map bubble utilities
│   └── formatters.ts      # Data formatting utilities
├── python-backend/        # Python FastAPI backend
│   ├── main.py            # FastAPI entrypoint
│   └── requirements.txt   # Python dependencies
├── app.json              # Expo configuration
├── package.json          # Node.js dependencies and scripts
├── assets/               # App icons and images
└── README.md            # This file
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Expo CLI (installed automatically with npx)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd pennapps
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npm start
   # or
   npx expo start
   ```

### Running the App

- **Web**: `npm run web`
- **iOS**: `npm run ios` (requires Xcode on macOS)
- **Android**: `npm run android` (requires Android Studio)

### Running the Python Backend

1. Navigate to the python-backend directory:
   ```bash
   cd python-backend
   ```

2. Create a virtual environment:
   ```bash
   python3 -m venv venv
   ```

3. Activate the virtual environment:
   ```bash
   # On macOS/Linux:
   source venv/bin/activate
   # On Windows:
   venv\Scripts\activate
   ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

The API will be available at `http://localhost:8000`

### Development

- **Frontend**: React Native with Expo Router
  - App pages are in the `app/` directory
  - Reusable components are in `components/`
  - Core utilities are in `lib/` and `utils/`
- **Backend**: Python FastAPI
  - Main API code is in `python-backend/main.py`
  - Dependencies are listed in `python-backend/requirements.txt`
- **Configuration**: 
  - Expo config is in `app.json`
  - Assets (icons, images) are in the `assets/` folder

### Collaboration

This project supports both React Native (Expo) frontend and Python backend development. Make sure to:
- Install Node.js dependencies with `npm install`
- Set up Python virtual environment for backend development
- Follow the existing project structure
- Update this README when adding new features or changing setup requirements

### Migration Notes

- The original `App.js` is preserved for backward compatibility
- New development should use the `app/` directory structure with Expo Router
- Gradually migrate existing functionality to the new structure

## Quickstart

### Frontend Setup
```bash
# Install dependencies
npm install

# Start the Expo development server
npx expo start
```

### Backend Setup
```bash
# Navigate to backend directory
cd python-backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload
```

### Database Setup
1. Create a Supabase project at https://supabase.com
2. Go to the SQL Editor
3. Run the schema: Copy and paste `sql/schema.sql` into the editor and execute
4. Run the seed data: Copy and paste `sql/seed.sql` into the editor and execute

### Environment Configuration
1. Copy `.env.example` to `.env`
2. Fill in your Supabase and Clerk credentials
3. The app will work in mock mode if credentials are not provided

### Testing the App
1. Launch the app in Expo Go
2. You should see the Map Home with seeded meetup pins
3. Test the deep link: `pennapps://join/test123abc`
4. Try creating a meetup and sharing the invite link
5. Test reporting functionality and soft-ban behavior

### Key Features to Test
- ✅ Map with bubbles showing attendee counts
- ✅ Deep link auto-join functionality
- ✅ Real-time chat and file sharing
- ✅ Reporting system with soft-ban enforcement
- ✅ Meetup archiving when ended
- ✅ File quota enforcement
- ✅ Authentication with Clerk (email + phone OTP)