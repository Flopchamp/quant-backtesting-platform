import api from './api';

export interface Backtest {
  id: number;
  strategy_id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  status: string;
  total_return?: number;
  total_return_pct?: number;
  sharpe_ratio?: number;
  max_drawdown?: number;
  win_rate?: number;
  total_trades?: number;
  winning_trades?: number;
  losing_trades?: number;
  trades?: any[];
  equity_curve?: any[];
  metrics?: any;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface BacktestCreate {
  strategy_id: number;
  start_date: string;
  end_date: string;
}

export const backtestService = {
  async getBacktests(): Promise<Backtest[]> {
    const response = await api.get('/backtests');
    return response.data;
  },

  async getBacktest(id: number): Promise<Backtest> {
    const response = await api.get(`/backtests/${id}`);
    return response.data;
  },

  async createBacktest(data: BacktestCreate): Promise<Backtest> {
    const response = await api.post('/backtests', data);
    return response.data;
  },

  async deleteBacktest(id: number): Promise<void> {
    await api.delete(`/backtests/${id}`);
  },
};
