import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { strategyService, Strategy } from '../services/strategyService';

const Strategies: React.FC = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      const data = await strategyService.getStrategies();
      setStrategies(data);
    } catch (error) {
      console.error('Error fetching strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this strategy?')) {
      try {
        await strategyService.deleteStrategy(id);
        setStrategies(strategies.filter((s) => s.id !== id));
      } catch (error) {
        console.error('Error deleting strategy:', error);
        alert('Failed to delete strategy');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900">Trading Strategies</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your trading strategies and run backtests
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/strategies/create"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            Create Strategy
          </Link>
        </div>
      </div>

      {strategies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No strategies</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new trading strategy.
          </p>
          <div className="mt-6">
            <Link
              to="/strategies/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Create your first strategy
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {strategies.map((strategy) => (
            <div
              key={strategy.id}
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {strategy.name}
                </h3>
                <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                  {strategy.symbol}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                {strategy.description || 'No description'}
              </p>
              <div className="text-sm text-gray-500 space-y-1 mb-4">
                <p>Type: {strategy.strategy_type}</p>
                <p>Capital: ${strategy.initial_capital.toLocaleString()}</p>
                <p>Position Size: {strategy.position_size}%</p>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <button
                  onClick={() => navigate(`/backtests?strategy_id=${strategy.id}`)}
                  className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  Run Backtest
                </button>
                <div className="flex gap-2">
                  <Link
                    to={`/strategies/edit/${strategy.id}`}
                    className="text-gray-600 hover:text-gray-900 text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(strategy.id)}
                    className="text-red-600 hover:text-red-900 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Strategies;
