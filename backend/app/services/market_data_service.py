import yfinance as yf
import pandas as pd
from datetime import datetime
from typing import List, Dict
from app.schemas.schemas import OHLCVData

class MarketDataService:
    """Service to fetch historical market data from various sources"""
    
    def __init__(self):
        self.source = "yfinance"  # Default to Yahoo Finance
    
    def fetch_data(
        self, 
        symbol: str, 
        start_date: datetime, 
        end_date: datetime, 
        interval: str = "1d"
    ) -> List[Dict]:
        """
        Fetch historical OHLCV data for a given symbol
        
        Args:
            symbol: Trading symbol (e.g., AAPL, BTC-USD)
            start_date: Start date for historical data
            end_date: End date for historical data
            interval: Data interval (1d, 1h, 5m, etc.)
        
        Returns:
            List of OHLCV data points
        """
        try:
            # Fetch data using yfinance
            ticker = yf.Ticker(symbol)
            df = ticker.history(
                start=start_date,
                end=end_date,
                interval=interval
            )
            
            if df.empty:
                raise ValueError(f"No data found for symbol {symbol}")
            
            # Convert to list of dictionaries
            data = []
            for index, row in df.iterrows():
                data.append({
                    "timestamp": index.to_pydatetime(),
                    "open": float(row['Open']),
                    "high": float(row['High']),
                    "low": float(row['Low']),
                    "close": float(row['Close']),
                    "volume": float(row['Volume'])
                })
            
            return data
        
        except Exception as e:
            raise Exception(f"Error fetching market data: {str(e)}")
    
    def fetch_latest_price(self, symbol: str) -> float:
        """Fetch the latest price for a symbol"""
        try:
            ticker = yf.Ticker(symbol)
            data = ticker.history(period="1d")
            if data.empty:
                raise ValueError(f"No data found for symbol {symbol}")
            return float(data['Close'].iloc[-1])
        except Exception as e:
            raise Exception(f"Error fetching latest price: {str(e)}")
    
    def validate_symbol(self, symbol: str) -> bool:
        """Validate if a symbol exists"""
        try:
            ticker = yf.Ticker(symbol)
            data = ticker.history(period="1d")
            return not data.empty
        except:
            return False
