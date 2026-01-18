import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.models import Backtest, Strategy
from app.services.market_data_service import MarketDataService

class BacktestingEngine:
    """Core backtesting engine to simulate trading strategies"""
    
    def __init__(self, strategy: Strategy, start_date: datetime, end_date: datetime):
        self.strategy = strategy
        self.start_date = start_date
        self.end_date = end_date
        self.market_data_service = MarketDataService()
        
        # Portfolio state
        self.initial_capital = strategy.initial_capital
        self.cash = strategy.initial_capital
        self.position = 0  # Number of shares held
        self.portfolio_value = strategy.initial_capital
        
        # Results tracking
        self.trades = []
        self.equity_curve = []
        self.daily_returns = []
    
    def fetch_market_data(self) -> pd.DataFrame:
        """Fetch historical market data for the strategy symbol"""
        data = self.market_data_service.fetch_data(
            symbol=self.strategy.symbol,
            start_date=self.start_date,
            end_date=self.end_date,
            interval="1d"
        )
        
        df = pd.DataFrame(data)
        df.set_index('timestamp', inplace=True)
        return df
    
    def calculate_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate technical indicators based on strategy parameters"""
        params = self.strategy.parameters or {}
        
        # Simple Moving Averages
        if 'sma_short' in params:
            df['SMA_SHORT'] = df['close'].rolling(window=params['sma_short']).mean()
        if 'sma_long' in params:
            df['SMA_LONG'] = df['close'].rolling(window=params['sma_long']).mean()
        
        # Exponential Moving Averages
        if 'ema_short' in params:
            df['EMA_SHORT'] = df['close'].ewm(span=params['ema_short']).mean()
        if 'ema_long' in params:
            df['EMA_LONG'] = df['close'].ewm(span=params['ema_long']).mean()
        
        # RSI (Relative Strength Index)
        if 'rsi_period' in params:
            period = params['rsi_period']
            delta = df['close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
            rs = gain / loss
            df['RSI'] = 100 - (100 / (1 + rs))
        
        # MACD
        if 'macd_fast' in params and 'macd_slow' in params:
            fast = params['macd_fast']
            slow = params['macd_slow']
            signal = params.get('macd_signal', 9)
            
            df['MACD'] = df['close'].ewm(span=fast).mean() - df['close'].ewm(span=slow).mean()
            df['MACD_SIGNAL'] = df['MACD'].ewm(span=signal).mean()
            df['MACD_HIST'] = df['MACD'] - df['MACD_SIGNAL']
        
        # Bollinger Bands
        if 'bb_period' in params:
            period = params['bb_period']
            std_dev = params.get('bb_std', 2)
            df['BB_MIDDLE'] = df['close'].rolling(window=period).mean()
            df['BB_STD'] = df['close'].rolling(window=period).std()
            df['BB_UPPER'] = df['BB_MIDDLE'] + (df['BB_STD'] * std_dev)
            df['BB_LOWER'] = df['BB_MIDDLE'] - (df['BB_STD'] * std_dev)
        
        return df
    
    def check_buy_conditions(self, row: pd.Series, df: pd.DataFrame, idx: int) -> bool:
        """Check if buy conditions are met"""
        if not self.strategy.buy_conditions:
            return False
        
        for condition in self.strategy.buy_conditions:
            indicator = condition.get('indicator')
            operator = condition.get('operator')
            value = condition.get('value')
            compare_to = condition.get('compare_to')
            
            if indicator not in row.index:
                continue
            
            indicator_value = row[indicator]
            
            # Handle comparison
            if compare_to:
                # Compare to another indicator
                if compare_to not in row.index:
                    continue
                compare_value = row[compare_to]
            else:
                # Compare to fixed value
                compare_value = value
            
            # Evaluate condition
            if operator == '>':
                if not (indicator_value > compare_value):
                    return False
            elif operator == '<':
                if not (indicator_value < compare_value):
                    return False
            elif operator == '>=':
                if not (indicator_value >= compare_value):
                    return False
            elif operator == '<=':
                if not (indicator_value <= compare_value):
                    return False
            elif operator == '==':
                if not (indicator_value == compare_value):
                    return False
            elif operator == 'crosses_above':
                if idx > 0:
                    prev_row = df.iloc[idx - 1]
                    if not (prev_row[indicator] <= prev_row[compare_to] and 
                           indicator_value > compare_value):
                        return False
                else:
                    return False
            elif operator == 'crosses_below':
                if idx > 0:
                    prev_row = df.iloc[idx - 1]
                    if not (prev_row[indicator] >= prev_row[compare_to] and 
                           indicator_value < compare_value):
                        return False
                else:
                    return False
        
        return True
    
    def check_sell_conditions(self, row: pd.Series, df: pd.DataFrame, idx: int, entry_price: float) -> bool:
        """Check if sell conditions are met"""
        if not self.strategy.sell_conditions:
            return False
        
        # Check stop loss
        if self.strategy.stop_loss:
            if row['close'] <= entry_price * (1 - self.strategy.stop_loss / 100):
                return True
        
        # Check take profit
        if self.strategy.take_profit:
            if row['close'] >= entry_price * (1 + self.strategy.take_profit / 100):
                return True
        
        # Check custom sell conditions
        for condition in self.strategy.sell_conditions:
            indicator = condition.get('indicator')
            operator = condition.get('operator')
            value = condition.get('value')
            compare_to = condition.get('compare_to')
            
            if indicator not in row.index:
                continue
            
            indicator_value = row[indicator]
            
            if compare_to:
                if compare_to not in row.index:
                    continue
                compare_value = row[compare_to]
            else:
                compare_value = value
            
            if operator == '>':
                if indicator_value > compare_value:
                    return True
            elif operator == '<':
                if indicator_value < compare_value:
                    return True
            elif operator == 'crosses_above':
                if idx > 0:
                    prev_row = df.iloc[idx - 1]
                    if (prev_row[indicator] <= prev_row[compare_to] and 
                        indicator_value > compare_value):
                        return True
            elif operator == 'crosses_below':
                if idx > 0:
                    prev_row = df.iloc[idx - 1]
                    if (prev_row[indicator] >= prev_row[compare_to] and 
                        indicator_value < compare_value):
                        return True
        
        return False
    
    def execute_trade(self, timestamp: datetime, price: float, action: str, reason: str = ""):
        """Execute a buy or sell trade"""
        if action == "BUY" and self.position == 0:
            # Calculate position size
            position_value = self.cash * (self.strategy.position_size / 100)
            shares = int(position_value / price)
            
            if shares > 0:
                cost = shares * price
                self.cash -= cost
                self.position = shares
                
                self.trades.append({
                    "timestamp": timestamp.isoformat(),
                    "action": "BUY",
                    "price": price,
                    "shares": shares,
                    "cost": cost,
                    "reason": reason
                })
        
        elif action == "SELL" and self.position > 0:
            proceeds = self.position * price
            self.cash += proceeds
            
            # Calculate profit/loss
            entry_trade = [t for t in self.trades if t['action'] == 'BUY'][-1]
            profit = proceeds - entry_trade['cost']
            profit_pct = (profit / entry_trade['cost']) * 100
            
            self.trades.append({
                "timestamp": timestamp.isoformat(),
                "action": "SELL",
                "price": price,
                "shares": self.position,
                "proceeds": proceeds,
                "profit": profit,
                "profit_pct": profit_pct,
                "reason": reason
            })
            
            self.position = 0
    
    def run(self) -> Dict[str, Any]:
        """Run the backtest simulation"""
        try:
            # Fetch and prepare data
            df = self.fetch_market_data()
            df = self.calculate_indicators(df)
            
            # Track entry price for current position
            entry_price = None
            
            # Iterate through each day
            for idx, (timestamp, row) in enumerate(df.iterrows()):
                # Calculate current portfolio value
                if self.position > 0:
                    self.portfolio_value = self.cash + (self.position * row['close'])
                else:
                    self.portfolio_value = self.cash
                
                # Record equity curve
                self.equity_curve.append({
                    "timestamp": timestamp.isoformat(),
                    "value": self.portfolio_value,
                    "cash": self.cash,
                    "position_value": self.position * row['close'] if self.position > 0 else 0
                })
                
                # Check for sell signal (if we have a position)
                if self.position > 0 and entry_price:
                    if self.check_sell_conditions(row, df, idx, entry_price):
                        self.execute_trade(timestamp, row['close'], "SELL", "Sell conditions met")
                        entry_price = None
                
                # Check for buy signal (if we don't have a position)
                elif self.position == 0:
                    if self.check_buy_conditions(row, df, idx):
                        self.execute_trade(timestamp, row['close'], "BUY", "Buy conditions met")
                        entry_price = row['close']
            
            # Close any open positions at the end
            if self.position > 0:
                last_price = df.iloc[-1]['close']
                self.execute_trade(df.index[-1], last_price, "SELL", "End of backtest period")
            
            # Calculate performance metrics
            metrics = self.calculate_metrics()
            
            return {
                "trades": self.trades,
                "equity_curve": self.equity_curve,
                "metrics": metrics
            }
        
        except Exception as e:
            raise Exception(f"Backtest execution failed: {str(e)}")
    
    def calculate_metrics(self) -> Dict[str, Any]:
        """Calculate performance metrics"""
        # Basic metrics
        final_value = self.portfolio_value
        total_return = final_value - self.initial_capital
        total_return_pct = (total_return / self.initial_capital) * 100
        
        # Trade statistics
        buy_trades = [t for t in self.trades if t['action'] == 'BUY']
        sell_trades = [t for t in self.trades if t['action'] == 'SELL']
        total_trades = len(sell_trades)
        
        if total_trades > 0:
            winning_trades = len([t for t in sell_trades if t.get('profit', 0) > 0])
            losing_trades = len([t for t in sell_trades if t.get('profit', 0) <= 0])
            win_rate = (winning_trades / total_trades) * 100
            
            avg_win = np.mean([t['profit'] for t in sell_trades if t.get('profit', 0) > 0]) if winning_trades > 0 else 0
            avg_loss = np.mean([t['profit'] for t in sell_trades if t.get('profit', 0) <= 0]) if losing_trades > 0 else 0
        else:
            winning_trades = 0
            losing_trades = 0
            win_rate = 0
            avg_win = 0
            avg_loss = 0
        
        # Calculate returns for Sharpe ratio
        equity_values = [e['value'] for e in self.equity_curve]
        returns = pd.Series(equity_values).pct_change().dropna()
        
        if len(returns) > 0:
            sharpe_ratio = (returns.mean() / returns.std()) * np.sqrt(252) if returns.std() > 0 else 0
        else:
            sharpe_ratio = 0
        
        # Maximum drawdown
        equity_series = pd.Series(equity_values)
        cummax = equity_series.cummax()
        drawdown = (equity_series - cummax) / cummax
        max_drawdown = drawdown.min() * 100
        
        return {
            "final_value": final_value,
            "total_return": total_return,
            "total_return_pct": total_return_pct,
            "sharpe_ratio": sharpe_ratio,
            "max_drawdown": max_drawdown,
            "total_trades": total_trades,
            "winning_trades": winning_trades,
            "losing_trades": losing_trades,
            "win_rate": win_rate,
            "avg_win": avg_win,
            "avg_loss": avg_loss,
            "profit_factor": abs(avg_win / avg_loss) if avg_loss != 0 else 0
        }


def run_backtest(backtest_id: int):
    """Background task to run a backtest"""
    db = SessionLocal()
    try:
        # Get backtest and strategy
        backtest = db.query(Backtest).filter(Backtest.id == backtest_id).first()
        if not backtest:
            return
        
        strategy = db.query(Strategy).filter(Strategy.id == backtest.strategy_id).first()
        if not strategy:
            backtest.status = "failed"
            backtest.error_message = "Strategy not found"
            db.commit()
            return
        
        # Update status to running
        backtest.status = "running"
        db.commit()
        
        # Run backtest
        engine = BacktestingEngine(strategy, backtest.start_date, backtest.end_date)
        results = engine.run()
        
        # Update backtest with results
        backtest.status = "completed"
        backtest.trades = results['trades']
        backtest.equity_curve = results['equity_curve']
        backtest.metrics = results['metrics']
        
        # Extract key metrics
        metrics = results['metrics']
        backtest.total_return = metrics['total_return']
        backtest.total_return_pct = metrics['total_return_pct']
        backtest.sharpe_ratio = metrics['sharpe_ratio']
        backtest.max_drawdown = metrics['max_drawdown']
        backtest.win_rate = metrics['win_rate']
        backtest.total_trades = metrics['total_trades']
        backtest.winning_trades = metrics['winning_trades']
        backtest.losing_trades = metrics['losing_trades']
        backtest.completed_at = datetime.utcnow()
        
        db.commit()
    
    except Exception as e:
        backtest.status = "failed"
        backtest.error_message = str(e)
        db.commit()
    
    finally:
        db.close()
