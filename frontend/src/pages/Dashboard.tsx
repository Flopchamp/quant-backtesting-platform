import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { strategyService, Strategy } from '../services/strategyService';
import { backtestService, Backtest } from '../services/backtestService';

const Dashboard: React.FC = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [backtests, setBacktests] = useState<Backtest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [strategiesData, backtestsData] = await Promise.all([
          strategyService.getStrategies(),
          backtestService.getBacktests(),
        ]);
        setStrategies(strategiesData);
        setBacktests(backtestsData.slice(0, 5)); // Show only 5 recent
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const completedBacktests = backtests.filter((b) => b.status === 'completed');
  const avgReturn =
    completedBacktests.length > 0
      ? completedBacktests.reduce((sum, b) => sum + (b.total_return_pct || 0), 0) /
        completedBacktests.length
      : 0;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Welcome to your backtesting dashboard
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Strategies
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {strategies.length}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Backtests
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {backtests.length}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Avg Return
                </dt>
                <dd
                  className={`mt-1 text-3xl font-semibold ${
                    avgReturn >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {avgReturn.toFixed(2)}%
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Link
            to="/strategies/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Create New Strategy
          </Link>
          <Link
            to="/strategies"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            View All Strategies
          </Link>
        </div>
      </div>

      {/* Recent Backtests */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Backtests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Strategy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Win Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {backtests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No backtests yet. Create a strategy and run your first backtest!
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
                        {backtest.win_rate !== null && backtest.win_rate !== undefined
                          ? `${backtest.win_rate.toFixed(2)}%`
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/backtests/${backtest.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View
                        </Link>
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

export default Dashboard;
