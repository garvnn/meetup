# PennApps Project

A React Native mobile application built with Expo.

## Project Structure

```
pennapps/
├── App.js                 # Main React Native app component
├── app.json              # Expo configuration
├── package.json          # Node.js dependencies and scripts
├── assets/               # App icons and images
├── python-backend/       # Python backend code
│   └── main.py
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

3. Start the development server:
   ```bash
   npm start
   ```

### Running the App

- **Web**: `npm run web`
- **iOS**: `npm run ios` (requires Xcode on macOS)
- **Android**: `npm run android` (requires Android Studio)

### Development

- The main app code is in `App.js`
- Configuration is in `app.json`
- Assets (icons, images) are in the `assets/` folder
- Python backend code is in `python-backend/`

### Collaboration

This project supports both React Native (Expo) frontend and Python backend development. Make sure to:
- Install Node.js dependencies with `npm install`
- Follow the existing project structure
- Update this README when adding new features or changing setup requirements