# Quick Start Guide

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (optional, SQLite works by default)
- Docker & Docker Compose (optional)

## Setup Instructions

### Option 1: Docker (Recommended)

1. **Clone and navigate to the project:**
```bash
cd c:\Users\alooh\Desktop\SAAS
```

2. **Create environment file:**
```bash
# Copy the example env file in backend directory
cp backend\.env.example backend\.env
```

3. **Edit backend\.env and add your API keys:**
```
DATABASE_URL=postgresql://backtest_user:backtest_pass@postgres:5432/backtesting
SECRET_KEY=your-secret-key-here-change-in-production
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key
```

4. **Start all services:**
```bash
docker-compose up --build
```

The services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create virtual environment:**
```bash
python -m venv venv
.\venv\Scripts\activate  # Windows
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Create .env file:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Run the server:**
```bash
uvicorn app.main:app --reload
```

Backend will be available at: http://localhost:8000

#### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create .env file:**
```bash
# Create .env file with:
REACT_APP_API_URL=http://localhost:8000/api/v1
```

4. **Start development server:**
```bash
npm start
```

Frontend will be available at: http://localhost:3000

## First Steps

1. **Register an account** at http://localhost:3000/register
2. **Login** with your credentials
3. **Create your first strategy:**
   - Click "Create Strategy"
   - Enter strategy details (e.g., AAPL with SMA Crossover)
   - Set parameters and risk management
4. **Run a backtest:**
   - Go to Backtests
   - Select your strategy
   - Choose date range (e.g., 2023-01-01 to 2024-01-01)
   - Click "Run Backtest"
5. **View results:**
   - Click "View" on completed backtest
   - Analyze metrics, equity curve, and trade history

## Example Strategy: SMA Crossover

- **Name:** Apple SMA Strategy
- **Symbol:** AAPL
- **Type:** SMA_CROSSOVER
- **Short SMA:** 50 days
- **Long SMA:** 200 days
- **Initial Capital:** $10,000
- **Position Size:** 100%
- **Backtest Period:** 2023-01-01 to 2024-01-01

This classic "Golden Cross" strategy buys when the 50-day SMA crosses above the 200-day SMA and sells when it crosses below.

## API Documentation

Interactive API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Key Features

### Backend (FastAPI)
✅ User authentication with JWT tokens
✅ RESTful API for strategies and backtests
✅ Advanced backtesting engine with multiple indicators
✅ Market data integration (Yahoo Finance)
✅ Background task processing
✅ Comprehensive performance metrics

### Frontend (React + TypeScript)
✅ Modern, responsive UI with Tailwind CSS
✅ Interactive dashboard with statistics
✅ Strategy creation and management
✅ Backtest execution and monitoring
✅ Visual analytics with charts (Recharts)
✅ Trade history and detailed metrics

### Supported Indicators
- Simple Moving Average (SMA)
- Exponential Moving Average (EMA)
- Relative Strength Index (RSI)
- MACD
- Bollinger Bands

### Performance Metrics
- Total Return & Return %
- Sharpe Ratio
- Maximum Drawdown
- Win Rate
- Profit Factor
- Average Win/Loss
- Trade Statistics

## Troubleshooting

### Backend Issues

**Database connection errors:**
```bash
# If using SQLite (default), no action needed
# If using PostgreSQL, ensure it's running:
docker-compose up postgres
```

**Module not found errors:**
```bash
pip install -r requirements.txt
```

### Frontend Issues

**Module not found errors:**
```bash
npm install
```

**API connection errors:**
- Ensure backend is running
- Check REACT_APP_API_URL in .env

### Market Data Issues

**"No data found" errors:**
- Verify the symbol is correct (e.g., AAPL not Apple)
- Check date range (not too far in the past)
- For crypto, use format like BTC-USD

## Production Deployment

### Security Checklist
- [ ] Change SECRET_KEY in .env
- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable HTTPS
- [ ] Set DEBUG=False
- [ ] Configure CORS_ORIGINS properly
- [ ] Use environment variables for sensitive data
- [ ] Set up proper logging
- [ ] Configure rate limiting

### Recommended Hosting
- **Backend:** Heroku, AWS EC2, DigitalOcean, Railway
- **Frontend:** Vercel, Netlify, AWS S3 + CloudFront
- **Database:** AWS RDS, DigitalOcean Managed Databases
- **Docker:** AWS ECS, Google Cloud Run, Azure Container Instances

## Support & Documentation

- Backend API Docs: http://localhost:8000/docs
- Frontend Components: See `/frontend/src/components`
- Services: See `/backend/app/services`

## Next Steps

1. **Enhance Strategies:**
   - Add more technical indicators
   - Implement custom buy/sell conditions
   - Create strategy templates

2. **Improve Backtesting:**
   - Add commission/slippage modeling
   - Implement multiple timeframes
   - Add portfolio-level backtesting

3. **Add Features:**
   - Strategy optimization
   - Walk-forward analysis
   - Paper trading integration
   - Real-time alerts
   - Social features (share strategies)

4. **Optimize Performance:**
   - Add caching (Redis)
   - Implement pagination
   - Optimize database queries
   - Add API rate limiting

Enjoy building and testing your trading strategies! 🚀
