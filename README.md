# College Attendance Tracker

A React-based web application to help students track their college attendance and maintain the required 75% attendance rate.

## ⚠️ COPYRIGHT NOTICE ⚠️

**© 2023 Hemanth - All Rights Reserved**

This project is protected by copyright law. The source code is publicly available for viewing and educational purposes only.

**UNAUTHORIZED USE, MODIFICATION, OR DISTRIBUTION IS STRICTLY PROHIBITED.**

Any use of this code without explicit written permission is a violation of copyright law and may result in legal action.

## Features

- User registration and login system
- Add, edit, and delete subjects
- Track daily attendance with present/absent marking
- Visual statistics and analytics
- Progress tracking for planned classes
- Warning system for subjects with low attendance
- Local storage for data persistence
- Responsive design for all devices

## How to Run

This is a React application that requires Node.js to run:

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

4. The application will load and you can:
   - Create a new account
   - Log in with your credentials
   - Start tracking your attendance

## Data Storage

All data is stored locally in your browser's localStorage. This means:
- Your data stays on your device
- No internet connection is required after initial load
- Clearing browser data will erase your attendance records

## Technologies Used

- React 18
- React Bootstrap
- React Icons
- CSS3
- Local Storage API
- JavaScript ES6+

## Project Structure

- `src/components/` - React components
- `src/contexts/` - React context for state management
- `src/style.css` - Custom styling
- `public/` - Static assets and HTML template 