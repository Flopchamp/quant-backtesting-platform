import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { backtestService, Backtest } from '../services/backtestService';
import { strategyService, Strategy } from '../services/strategyService';

const Backtests: React.FC = () => {
  const [backtests, setBacktests] = useState<Backtest[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchData();
    const strategyIdParam = searchParams.get('strategy_id');
    if (strategyIdParam) {
      setSelectedStrategyId(parseInt(strategyIdParam));
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const [backtestsData, strategiesData] = await Promise.all([
        backtestService.getBacktests(),
        strategyService.getStrategies(),
      ]);
      setBacktests(backtestsData);
      setStrategies(strategiesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStrategyId) {
      alert('Please select a strategy');
      return;
    }

    setSubmitting(true);
    try {
      await backtestService.createBacktest({
        strategy_id: selectedStrategyId,
        start_date: startDate,
        end_date: endDate,
      });
      await fetchData();
      setSelectedStrategyId(null);
    } catch (error: any) {
      console.error('Error creating backtest:', error);
      alert(error.response?.data?.detail || 'Failed to create backtest');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this backtest?')) {
      try {
        await backtestService.deleteBacktest(id);
        setBacktests(backtests.filter((b) => b.id !== id));
      } catch (error) {
        console.error('Error deleting backtest:', error);
        alert('Failed to delete backtest');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Backtests</h1>
        <p className="mt-2 text-sm text-gray-700">
          Run and manage your strategy backtests
        </p>
      </div>

      {/* Create Backtest Form */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Run New Backtest</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <div>
            <label htmlFor="strategy" className="block text-sm font-medium text-gray-700">
              Strategy
            </label>
            <select
              id="strategy"
              value={selectedStrategyId || ''}
              onChange={(e) => setSelectedStrategyId(parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="">Select a strategy</option>
              {strategies.map((strategy) => (
                <option key={strategy.id} value={strategy.id}>
                  {strategy.name} ({strategy.symbol})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {submitting ? 'Running...' : 'Run Backtest'}
            </button>
          </div>
        </form>
      </div>

      {/* Backtests List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Backtest Results</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Strategy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sharpe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trades
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {backtests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No backtests yet. Run your first backtest above!
                  </td>
                </tr>
              ) : (
                backtests.map((backtest) => {
                  const strategy = strategies.find((s) => s.id === backtest.strategy_id);
                  return (
                    <tr key={backtest.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {strategy?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(backtest.start_date).toLocaleDateString()} -{' '}
                        {new Date(backtest.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            backtest.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : backtest.status === 'running'
                              ? 'bg-yellow-100 text-yellow-800'
                              : backtest.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {backtest.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {backtest.total_return_pct !== null && backtest.total_return_pct !== undefined ? (
                          <span
                            className={
                              backtest.total_return_pct >= 0 ? 'text-green-600' : 'text-red-600'
                            }
                          >
                            {backtest.total_return_pct.toFixed(2)}%
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {backtest.sharpe_ratio !== null && backtest.sharpe_ratio !== undefined
                          ? backtest.sharpe_ratio.toFixed(2)
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {backtest.total_trades || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link
                          to={`/backtests/${backtest.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(backtest.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Backtests;
