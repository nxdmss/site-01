# E-Commerce Platform

Modern e-commerce application built with React, FastAPI, and PostgreSQL.

## Tech Stack

**Frontend**: React 18, React Router, Axios, Vite  
**Backend**: FastAPI, SQLAlchemy, PostgreSQL, JWT Authentication  
**Deployment**: Docker, Nginx

## Project Structure

```
├── backend/          # FastAPI server
│   ├── main.py      # API endpoints
│   ├── auth.py      # JWT authentication
│   ├── models.py    # Database models
│   ├── schemas.py   # Request/response schemas
│   ├── database.py  # Database connection
│   └── config.py    # Configuration
│
└── frontend/        # React SPA
    └── src/
        ├── components/  # Reusable UI components
        ├── pages/       # Route pages
        ├── hooks/       # Custom React hooks
        ├── utils/       # Helper functions
        └── config/      # App configuration
```

## Local Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Docker Deployment

```bash
# Frontend
cd frontend
docker build -t shop-frontend .
docker run -p 80:80 shop-frontend

# Backend (requires PostgreSQL)
cd backend
docker build -t shop-backend .
docker run -p 8000:8000 -e DATABASE_URL=<url> shop-backend
```

## Environment Variables

**Backend** (`.env`):
```
DATABASE_URL=postgresql://user:pass@localhost:5432/shop_db
SECRET_KEY=your-secret-key
```

**Frontend** (`.env`):
```
VITE_API_URL=http://localhost:8000
```

## Features

- User authentication with JWT
- Product catalog with search
- Shopping cart (guest & authenticated)
- Order management
- Responsive design

## API Endpoints

- `POST /register` - User registration
- `POST /login` - User login
- `GET /users/me` - Get current user
- `GET /api/items` - Get all products
- `GET /api/cart` - Get user cart
- `POST /api/cart/{id}` - Add to cart
- `POST /api/checkout` - Place order
