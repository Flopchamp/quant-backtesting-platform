from fastapi import APIRouter
from app.api.v1.endpoints import auth, strategies, backtests, market_data

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(strategies.router, prefix="/strategies", tags=["strategies"])
api_router.include_router(backtests.router, prefix="/backtests", tags=["backtests"])
api_router.include_router(market_data.router, prefix="/market-data", tags=["market-data"])
