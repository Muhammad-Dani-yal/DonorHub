# DonorHub

DonorHub is a responsive web application for managing **blood donors and urgent blood requests**.

It is built with **React, Redux Toolkit, Firebase Authentication, Firebase Realtime Database, Tailwind CSS**, and includes a **JSON Server fallback** for local development.

## Features

- User registration and login with Firebase Authentication
- Persistent authenticated sessions
- Donor management
- Urgent blood request management
- Create, read, update, and delete operations
- Protected routes for authenticated users
- Admin-only route protection
- Global state management with Redux Toolkit
- Firebase Realtime Database integration
- JSON Server fallback for local development
- Responsive frontend interface

## Tech Stack

- React
- JavaScript
- Redux Toolkit
- Firebase Authentication
- Firebase Realtime Database
- Tailwind CSS
- JSON Server
- Vite

## Architecture

- **Firebase Authentication** manages email/password authentication and persistent user sessions.
- **Redux Toolkit** manages global authentication state and donor/request state.
- **Firebase Realtime Database** is used as the primary data store.
- `src/services/firebaseService.js` handles Firebase CRUD operations.
- `src/services/jsonService.js` provides fallback data access through JSON Server.
- `db.json` contains demonstration donor and request data for local development.
- Route guards protect authenticated and admin-only pages.

## Project Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

Copy `.env.example` and create a new `.env` file.

Add your Firebase web application configuration values to the `.env` file.

Do not commit real credentials, private environment variables, or service-account files.

### 3. Start the local fallback API

```bash
npm run server
```

JSON Server will run at:

```text
http://localhost:3001
```

### 4. Start the development server

```bash
npm run dev
```

The application will run on the local Vite development URL.

## Firebase Configuration

Enable:

- Email/Password Authentication
- Firebase Realtime Database

Database rules can be deployed with:

```bash
firebase deploy --only database
```

Admin roles should only be assigned from a trusted Firebase environment.

Public registration creates standard user accounts.

## Validation and Production Build

Run linting:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

The production files will be generated inside the `dist` directory.

## Deployment

The project can be deployed using:

- Firebase Hosting
- Vercel
- Netlify

## What I Practiced

This project helped me work with:

- React application structure
- Authentication
- CRUD operations
- Global state management
- Firebase integration
- Protected routing
- Role-based access
- Environment variables
- API fallback handling
- Frontend deployment

## Future Improvements

Possible future improvements include:

- Advanced donor search and filtering
- Blood-group filtering
- Request status tracking
- Improved admin dashboard
- Better form validation
- User profile management
- Notification functionality
- UI and accessibility improvements
