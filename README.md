# SaaS Backtesting Platform

A comprehensive backtesting platform that allows traders to input their strategies, run simulations on historical market data, and visualize performance analytics.

## Features

- **Strategy Input**: Define custom trading strategies with buy/sell conditions
- **Historical Data Integration**: Automatically fetch market data from multiple APIs
- **Backtesting Engine**: Run simulations on historical data with realistic execution
- **Analytics Dashboard**: Visualize performance metrics, charts, and statistics
- **Portfolio Management**: Track multiple strategies and compare performance
- **User Authentication**: Secure user accounts with JWT authentication

## Tech Stack

### Backend
- FastAPI (Python)
- PostgreSQL / SQLite
- SQLAlchemy ORM
- JWT Authentication
- Pandas for data processing
- Alpha Vantage / Yahoo Finance API

### Frontend
- React 18
- TypeScript
- Recharts for visualizations
- Tailwind CSS
- Axios for API calls

## Project Structure

```
SAAS/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── services/
│   │   ├── schemas/
│   │   └── core/
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
└── docker-compose.yml
```

## Getting Started

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

### Docker Setup

```bash
docker-compose up --build
```

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/strategies` - Create trading strategy
- `GET /api/strategies` - List user strategies
- `POST /api/backtest` - Run backtest simulation
- `GET /api/backtest/{id}` - Get backtest results
- `GET /api/market-data` - Fetch historical market data

## Environment Variables

Create `.env` file in backend directory:

```
DATABASE_URL=postgresql://user:password@localhost/backtesting
SECRET_KEY=your-secret-key
ALPHA_VANTAGE_API_KEY=your-api-key
```

## License

MIT
