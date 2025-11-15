# FloStat Design Flow - Full Stack Application

This is a full-stack application with a React frontend and Node.js/Express backend for managing water flow systems with pumps, valves, tanks, and sumps.

## Project Structure

```
flostat-design-flow/
├── flostat-design-flow-dashbaord/  # Frontend (React/Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── lib/
│   │   ├── contexts/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   └── package.json
└── server/                         # Backend (Node.js/Express)
    ├── controllers/
    ├── routes/
    ├── models/
    ├── utils/
    ├── index.js
    └── package.json
```

## Frontend

The frontend is built with:
- React 18
- TypeScript
- Vite
- TailwindCSS
- shadcn/ui components
- React Router for navigation
- TanStack Query for data fetching

### Key Features
- Authentication (Sign In/Sign Up)
- Organization management
- Device management
- User management
- Scheduling
- Reporting
- SCADA interface
- OCR functionality

### Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:5132

## Backend

The backend is built with:
- Node.js
- Express.js
- AWS DynamoDB (local and cloud)
- Firebase Admin
- JWT for authentication
- Role-based access control

### Key Features
- RESTful API with versioning (/api/v1/)
- User authentication with OTP and Google OAuth
- Organization management
- Device management with parent-child relationships
- Block management
- Scheduling system
- Reporting capabilities
- Customer support system

### API Endpoints

```
/api/v1/
├── /auth       - Authentication endpoints
├── /org        - Organization management
├── /user       - User management
├── /device     - Device management
└── /report     - Reporting endpoints
```

### Getting Started

1. Install dependencies:
```bash
cd server
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Start the development server:
```bash
npm start
```

The backend will be available at http://localhost:4000

## Integration Points

The frontend communicates with the backend through the API service (`src/lib/api.ts`) which handles all HTTP requests. Authentication is managed through the AuthContext (`src/contexts/AuthContext.tsx`).

### Environment Variables

Frontend:
- `VITE_API_BASE_URL` - Base URL for backend API (default: http://localhost:4000)

Backend:
- `MONGODB` - MongoDB connection string
- `DYNAMODB_LOCAL_ENDPOINT` - Local DynamoDB endpoint
- `JWT_SECRET_KEY` - Secret key for JWT tokens
- Various AWS and table configuration variables

## Deployment

Both frontend and backend can be deployed independently:
- Frontend: Can be deployed to any static hosting service (Vercel, Netlify, etc.)
- Backend: Can be deployed to Node.js hosting services or as AWS Lambda functions

For production deployment, make sure to:
1. Update environment variables
2. Configure proper CORS settings
3. Set up database connections
4. Configure authentication secrets