from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    strategies = relationship("Strategy", back_populates="owner")
    backtests = relationship("Backtest", back_populates="owner")


class Strategy(Base):
    __tablename__ = "strategies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Strategy parameters
    symbol = Column(String, nullable=False)  # Trading symbol (e.g., AAPL, BTC-USD)
    strategy_type = Column(String, nullable=False)  # e.g., "SMA_CROSSOVER", "RSI", "MACD", "CUSTOM"
    parameters = Column(JSON)  # Strategy-specific parameters
    
    # Buy/Sell conditions
    buy_conditions = Column(JSON)  # List of conditions for buying
    sell_conditions = Column(JSON)  # List of conditions for selling
    
    # Risk management
    initial_capital = Column(Float, default=10000.0)
    position_size = Column(Float, default=1.0)  # Percentage of capital per trade
    stop_loss = Column(Float, nullable=True)  # Stop loss percentage
    take_profit = Column(Float, nullable=True)  # Take profit percentage
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    owner = relationship("User", back_populates="strategies")
    backtests = relationship("Backtest", back_populates="strategy")


class Backtest(Base):
    __tablename__ = "backtests"

    id = Column(Integer, primary_key=True, index=True)
    strategy_id = Column(Integer, ForeignKey("strategies.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Backtest parameters
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(String, default="pending")  # pending, running, completed, failed
    
    # Results
    total_return = Column(Float, nullable=True)
    total_return_pct = Column(Float, nullable=True)
    sharpe_ratio = Column(Float, nullable=True)
    max_drawdown = Column(Float, nullable=True)
    win_rate = Column(Float, nullable=True)
    total_trades = Column(Integer, nullable=True)
    winning_trades = Column(Integer, nullable=True)
    losing_trades = Column(Integer, nullable=True)
    
    # Detailed results stored as JSON
    trades = Column(JSON)  # List of all trades executed
    equity_curve = Column(JSON)  # Portfolio value over time
    metrics = Column(JSON)  # Additional metrics
    
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    owner = relationship("User", back_populates="backtests")
    strategy = relationship("Strategy", back_populates="backtests")
