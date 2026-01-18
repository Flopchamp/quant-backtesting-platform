from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None


# Strategy Schemas
class StrategyBase(BaseModel):
    name: str
    description: Optional[str] = None
    symbol: str
    strategy_type: str
    parameters: Optional[Dict[str, Any]] = {}
    buy_conditions: Optional[List[Dict[str, Any]]] = []
    sell_conditions: Optional[List[Dict[str, Any]]] = []
    initial_capital: float = 10000.0
    position_size: float = 1.0
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None

class StrategyCreate(StrategyBase):
    pass

class StrategyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    buy_conditions: Optional[List[Dict[str, Any]]] = None
    sell_conditions: Optional[List[Dict[str, Any]]] = None
    initial_capital: Optional[float] = None
    position_size: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None

class Strategy(StrategyBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Backtest Schemas
class BacktestBase(BaseModel):
    strategy_id: int
    start_date: datetime
    end_date: datetime

class BacktestCreate(BacktestBase):
    pass

class BacktestResult(BaseModel):
    id: int
    strategy_id: int
    user_id: int
    start_date: datetime
    end_date: datetime
    status: str
    total_return: Optional[float] = None
    total_return_pct: Optional[float] = None
    sharpe_ratio: Optional[float] = None
    max_drawdown: Optional[float] = None
    win_rate: Optional[float] = None
    total_trades: Optional[int] = None
    winning_trades: Optional[int] = None
    losing_trades: Optional[int] = None
    trades: Optional[List[Dict[str, Any]]] = None
    equity_curve: Optional[List[Dict[str, Any]]] = None
    metrics: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Market Data Schemas
class MarketDataRequest(BaseModel):
    symbol: str
    start_date: datetime
    end_date: datetime
    interval: str = "1d"  # 1d, 1h, 5m, etc.

class OHLCVData(BaseModel):
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float
