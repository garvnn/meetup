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