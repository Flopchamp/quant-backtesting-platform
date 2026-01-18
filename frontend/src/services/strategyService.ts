import api from './api';

export interface Strategy {
  id: number;
  name: string;
  description?: string;
  symbol: string;
  strategy_type: string;
  parameters: any;
  buy_conditions: any[];
  sell_conditions: any[];
  initial_capital: number;
  position_size: number;
  stop_loss?: number;
  take_profit?: number;
  user_id: number;
  created_at: string;
  updated_at?: string;
}

export interface StrategyCreate {
  name: string;
  description?: string;
  symbol: string;
  strategy_type: string;
  parameters?: any;
  buy_conditions?: any[];
  sell_conditions?: any[];
  initial_capital: number;
  position_size: number;
  stop_loss?: number;
  take_profit?: number;
}

export const strategyService = {
  async getStrategies(): Promise<Strategy[]> {
    const response = await api.get('/strategies');
    return response.data;
  },

  async getStrategy(id: number): Promise<Strategy> {
    const response = await api.get(`/strategies/${id}`);
    return response.data;
  },

  async createStrategy(data: StrategyCreate): Promise<Strategy> {
    const response = await api.post('/strategies', data);
    return response.data;
  },

  async updateStrategy(id: number, data: Partial<StrategyCreate>): Promise<Strategy> {
    const response = await api.put(`/strategies/${id}`, data);
    return response.data;
  },

  async deleteStrategy(id: number): Promise<void> {
    await api.delete(`/strategies/${id}`);
  },
};
