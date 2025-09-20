# 🎯 PennApps Meetup App

A **React Native mobile application** that helps people discover and join local meetups through an interactive map interface. Built with **Expo** for cross-platform development and **Python FastAPI** for the backend.

## 🏗️ What This App Does

This is a **meetup discovery app** where users can:
- 📍 **View meetups on a map** with interactive bubbles showing attendee counts
- 🔗 **Join meetups via deep links** (like `pennapps://join/abc123`)
- 💬 **Chat and share files** within meetups
- 🚫 **Report inappropriate behavior** with soft-ban functionality
- 📱 **Works on both iOS and Android** through React Native

## 🧩 Project Architecture

Let me explain how this app is structured - it's like building a house with different rooms for different purposes:

### **Frontend (Mobile App) - The "House"**
```
app/                    # 📱 The main living spaces (screens)
├── _layout.tsx        # 🏠 The foundation - defines how all screens look
├── index.tsx          # 🗺️ The map room - shows meetups as bubbles
├── create.tsx         # ➕ The creation room - make new meetups
├── meetup/[id].tsx    # 🏠 Individual meetup rooms - chat & files
├── share/[token].tsx  # 📤 The sharing room - invite others
└── join/[token].tsx   # 🚪 The entrance - join via deep link
```

### **Components (Furniture) - Reusable Pieces**
```
components/            # 🪑 Reusable furniture for different rooms
├── MapBubble.tsx      # 🫧 The meetup bubbles on the map
├── Chat.tsx           # 💬 The chat interface
└── FilesTab.tsx       # 📁 The file sharing interface
```

### **Backend (Kitchen) - Where the Magic Happens**
```
python-backend/        # 🔥 The kitchen - processes all the data
├── main.py           # 👨‍🍳 The chef - handles all API requests
└── requirements.txt  # 🛒 The shopping list - Python packages needed
```

### **Supporting Files (Utilities)**
```
lib/                   # 🛠️ The toolbox - core services
├── supabase.ts       # 🗄️ Database connection
├── auth.ts           # 🔐 User authentication
└── tokenCache.ts     # 💾 Temporary storage

utils/                 # 🔧 Helper tools
├── bubbles.ts        # 🫧 Map bubble calculations
└── formatters.ts     # 📝 Data formatting
```

## 🚀 Getting Started - Step by Step

### **What You Need First (Prerequisites)**

Before we start, you need these tools installed on your computer:

- **Node.js** (version 18 or newer) - This is like the "engine" that runs JavaScript
- **Python 3** - This runs our backend server
- **Git** - This helps us download and manage code
- **A phone** with Expo Go app (for testing the mobile app)

> **💡 Learning Note**: Node.js is a JavaScript runtime that lets you run JavaScript outside of web browsers. Python is a programming language great for building web servers. Git is a version control system that tracks changes in your code.

### **Step 1: Download the Project**

First, let's get the code onto your computer:

```bash
# Download the project (replace with your actual repository URL)
git clone <your-repository-url>
cd pennapps-3
```

> **💡 Learning Note**: `git clone` downloads a copy of the project from a remote repository (like GitHub) to your local computer. `cd` means "change directory" - it's like opening a folder.

### **Step 2: Set Up the Mobile App (Frontend)**

The mobile app is built with React Native and Expo. Here's how to get it running:

```bash
# Install all the JavaScript packages the app needs
npm install

# Start the development server
npm start
```

> **💡 Learning Note**: `npm install` reads the `package.json` file and downloads all the libraries your app needs (like React, Expo, etc.). `npm start` starts a development server that lets you test your app on your phone.

**What happens next:**
- A QR code will appear in your terminal
- Install "Expo Go" app on your phone
- Scan the QR code with your phone's camera
- The app will load on your phone!

### **Step 3: Set Up the Backend Server (Python)**

The backend is like the "brain" of your app - it handles data and API requests:

```bash
# Go into the backend folder
cd python-backend

# Create a virtual environment (like a separate workspace)
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python packages
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload
```

> **💡 Learning Note**: A virtual environment is like a separate room for your Python project - it keeps your project's dependencies separate from other projects. `uvicorn` is a web server that runs our FastAPI application.

**You'll know it's working when you see:**
```
Starting PennApps Meetup API...
Mock mode: True
```

### **Step 4: Test Everything Works**

Open a new terminal and test the backend:

```bash
# Test if the backend is responding
curl http://localhost:8000/health
```

You should see something like:
```json
{"status": "healthy", "timestamp": "2024-01-01T12:00:00", "mock_mode": true}
```

## 🎮 How to Run Different Parts

### **Mobile App Options:**
- **On your phone**: Scan the QR code from `npm start`
- **On web browser**: `npm run web`
- **On iOS simulator**: `npm run ios` (needs Xcode on Mac)
- **On Android emulator**: `npm run android` (needs Android Studio)

### **Backend Server:**
- **API URL**: `http://localhost:8000`
- **Health check**: `http://localhost:8000/health`
- **API documentation**: `http://localhost:8000/docs` (FastAPI auto-generates this!)

## 🧠 Understanding the Technology Stack

### **Frontend (Mobile App) - What You See**
- **React Native**: A framework that lets you build mobile apps using JavaScript
- **Expo**: A platform that makes React Native development easier (like training wheels for bike riding)
- **TypeScript**: JavaScript with extra safety features (like wearing a helmet while coding)
- **Expo Router**: Handles navigation between screens (like a GPS for your app)

> **💡 Learning Note**: React Native is special because you write code once and it works on both iPhone and Android. Expo makes it even easier by handling the complex parts for you.

### **Backend (Server) - The Brain**
- **Python**: A programming language that's great for building web servers
- **FastAPI**: A modern Python framework for building APIs (like a restaurant kitchen that serves data)
- **Uvicorn**: A web server that runs your Python app (like the waiter who delivers your food)

> **💡 Learning Note**: The backend is like a restaurant kitchen - it prepares data and serves it to your mobile app when requested. FastAPI is like having a really good chef who can cook fast and serve many customers.

## 🗄️ Database Setup (Optional for Development)

For now, the app works in "mock mode" with fake data. But if you want to use a real database:

### **Using Supabase (Recommended)**
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to the SQL Editor
4. Copy and paste the contents of `sql/schema.sql` and run it
5. Copy and paste the contents of `sql/seed.sql` and run it

> **💡 Learning Note**: Supabase is like a digital filing cabinet that stores all your app's data. The schema.sql file tells it how to organize the data, and seed.sql puts some sample data in it.

## 🧪 Testing Your App

### **Quick Test Checklist**
1. ✅ **Backend is running**: You see "Starting PennApps Meetup API..." in terminal
2. ✅ **Frontend is running**: You see a QR code in the terminal
3. ✅ **App loads on phone**: You can see the app after scanning QR code
4. ✅ **Deep links work**: Try `pennapps://join/demo123abc` in your phone's browser

### **What to Test**
- **Map view**: Should show meetup bubbles
- **Deep links**: Should open the app and show join screen
- **Navigation**: Buttons should work and take you to different screens
- **Error handling**: App should show helpful messages when something goes wrong

## 🎯 Key Features Explained

### **📍 Map with Bubbles**
- Shows meetups as interactive bubbles on a map
- Bubble size indicates number of attendees
- Tap bubbles to see meetup details

### **🔗 Deep Link Joining**
- Share meetup links like `pennapps://join/abc123`
- Links automatically open the app
- Users can join meetups with one tap

### **💬 Real-time Chat**
- Chat with other meetup attendees
- Messages appear instantly for everyone
- Share files and images

### **🚫 Reporting System**
- Report inappropriate behavior
- Automatic soft-banning of reported users
- Keeps the community safe

## 🚀 Next Steps for Learning

1. **Start with the basics**: Get the app running first
2. **Explore the code**: Look at `app/index.tsx` to see how the map works
3. **Try making changes**: Modify text or colors to see what happens
4. **Read the components**: Check out `components/MapBubble.tsx` to understand how bubbles work
5. **Experiment with the backend**: Look at `python-backend/main.py` to see how APIs work

> **💡 Learning Tip**: Don't try to understand everything at once! Start with one small piece, understand it, then move to the next piece. Programming is like learning to cook - you start with simple recipes and gradually learn more complex techniques.