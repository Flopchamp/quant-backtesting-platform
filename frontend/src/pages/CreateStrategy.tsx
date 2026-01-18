import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { strategyService, StrategyCreate } from '../services/strategyService';

const CreateStrategy: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<StrategyCreate>({
    name: '',
    description: '',
    symbol: '',
    strategy_type: 'SMA_CROSSOVER',
    parameters: {
      sma_short: 50,
      sma_long: 200,
    },
    buy_conditions: [
      {
        indicator: 'SMA_SHORT',
        operator: 'crosses_above',
        compare_to: 'SMA_LONG',
      },
    ],
    sell_conditions: [
      {
        indicator: 'SMA_SHORT',
        operator: 'crosses_below',
        compare_to: 'SMA_LONG',
      },
    ],
    initial_capital: 10000,
    position_size: 100,
    stop_loss: undefined,
    take_profit: undefined,
  });

  useEffect(() => {
    if (id) {
      loadStrategy();
    }
  }, [id]);

  const loadStrategy = async () => {
    try {
      const strategy = await strategyService.getStrategy(parseInt(id!));
      setFormData({
        name: strategy.name,
        description: strategy.description,
        symbol: strategy.symbol,
        strategy_type: strategy.strategy_type,
        parameters: strategy.parameters,
        buy_conditions: strategy.buy_conditions,
        sell_conditions: strategy.sell_conditions,
        initial_capital: strategy.initial_capital,
        position_size: strategy.position_size,
        stop_loss: strategy.stop_loss,
        take_profit: strategy.take_profit,
      });
    } catch (error) {
      console.error('Error loading strategy:', error);
      alert('Failed to load strategy');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        await strategyService.updateStrategy(parseInt(id), formData);
      } else {
        await strategyService.createStrategy(formData);
      }
      navigate('/strategies');
    } catch (error: any) {
      console.error('Error saving strategy:', error);
      alert(error.response?.data?.detail || 'Failed to save strategy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {id ? 'Edit Strategy' : 'Create New Strategy'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white shadow rounded-lg p-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Strategy Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="symbol" className="block text-sm font-medium text-gray-700">
                Trading Symbol *
              </label>
              <input
                type="text"
                id="symbol"
                required
                placeholder="e.g., AAPL, BTC-USD"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Strategy Type */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Strategy Type</h2>
          <div>
            <label htmlFor="strategy_type" className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              id="strategy_type"
              value={formData.strategy_type}
              onChange={(e) => setFormData({ ...formData, strategy_type: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="SMA_CROSSOVER">SMA Crossover</option>
              <option value="EMA_CROSSOVER">EMA Crossover</option>
              <option value="RSI">RSI</option>
              <option value="MACD">MACD</option>
              <option value="BOLLINGER_BANDS">Bollinger Bands</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>
        </div>

        {/* Parameters */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Parameters</h2>
          {formData.strategy_type === 'SMA_CROSSOVER' && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Short SMA Period</label>
                <input
                  type="number"
                  value={formData.parameters?.sma_short || 50}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parameters: { ...formData.parameters, sma_short: parseInt(e.target.value) },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Long SMA Period</label>
                <input
                  type="number"
                  value={formData.parameters?.sma_long || 200}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parameters: { ...formData.parameters, sma_long: parseInt(e.target.value) },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          )}
          {formData.strategy_type === 'RSI' && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">RSI Period</label>
                <input
                  type="number"
                  value={formData.parameters?.rsi_period || 14}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parameters: { ...formData.parameters, rsi_period: parseInt(e.target.value) },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Oversold Level</label>
                <input
                  type="number"
                  value={formData.parameters?.rsi_oversold || 30}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parameters: { ...formData.parameters, rsi_oversold: parseInt(e.target.value) },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Overbought Level</label>
                <input
                  type="number"
                  value={formData.parameters?.rsi_overbought || 70}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parameters: { ...formData.parameters, rsi_overbought: parseInt(e.target.value) },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Risk Management */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Risk Management</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Initial Capital ($)
              </label>
              <input
                type="number"
                value={formData.initial_capital}
                onChange={(e) =>
                  setFormData({ ...formData, initial_capital: parseFloat(e.target.value) })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Position Size (%)
              </label>
              <input
                type="number"
                value={formData.position_size}
                onChange={(e) =>
                  setFormData({ ...formData, position_size: parseFloat(e.target.value) })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Stop Loss (%) - Optional
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.stop_loss || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stop_loss: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Take Profit (%) - Optional
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.take_profit || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    take_profit: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/strategies')}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : id ? 'Update Strategy' : 'Create Strategy'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateStrategy;
