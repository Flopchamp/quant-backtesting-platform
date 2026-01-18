import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { backtestService, Backtest } from '../services/backtestService';
import { strategyService, Strategy } from '../services/strategyService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const BacktestResults: React.FC = () => {
  const { id } = useParams();
  const [backtest, setBacktest] = useState<Backtest | null>(null);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBacktest();
  }, [id]);

  const fetchBacktest = async () => {
    try {
      const backtestData = await backtestService.getBacktest(parseInt(id!));
      setBacktest(backtestData);

      const strategyData = await strategyService.getStrategy(backtestData.strategy_id);
      setStrategy(strategyData);
    } catch (error) {
      console.error('Error fetching backtest:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!backtest) {
    return <div className="text-center py-12">Backtest not found</div>;
  }

  const isCompleted = backtest.status === 'completed';
  const equityData = backtest.equity_curve?.map((point: any) => ({
    date: new Date(point.timestamp).toLocaleDateString(),
    value: point.value,
  }));

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link to="/backtests" className="text-indigo-600 hover:text-indigo-900 text-sm">
          ← Back to Backtests
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Backtest Results</h1>
        <p className="mt-2 text-sm text-gray-700">
          Strategy: {strategy?.name} ({strategy?.symbol})
        </p>
      </div>

      {/* Status */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Status</h2>
            <span
              className={`mt-2 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                backtest.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : backtest.status === 'running'
                  ? 'bg-yellow-100 text-yellow-800'
                  : backtest.status === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {backtest.status.toUpperCase()}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            <p>Period: {new Date(backtest.start_date).toLocaleDateString()} - {new Date(backtest.end_date).toLocaleDateString()}</p>
            <p>Created: {new Date(backtest.created_at).toLocaleString()}</p>
            {backtest.completed_at && (
              <p>Completed: {new Date(backtest.completed_at).toLocaleString()}</p>
            )}
          </div>
        </div>
        {backtest.error_message && (
          <div className="mt-4 p-4 bg-red-50 rounded-md">
            <p className="text-sm text-red-800">{backtest.error_message}</p>
          </div>
        )}
      </div>

      {isCompleted && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Return</dt>
                <dd
                  className={`mt-1 text-3xl font-semibold ${
                    (backtest.total_return_pct || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {backtest.total_return_pct?.toFixed(2)}%
                </dd>
                <dd className="mt-1 text-sm text-gray-500">
                  ${backtest.total_return?.toFixed(2)}
                </dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <dt className="text-sm font-medium text-gray-500 truncate">Sharpe Ratio</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {backtest.sharpe_ratio?.toFixed(2)}
                </dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <dt className="text-sm font-medium text-gray-500 truncate">Max Drawdown</dt>
                <dd className="mt-1 text-3xl font-semibold text-red-600">
                  {backtest.max_drawdown?.toFixed(2)}%
                </dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <dt className="text-sm font-medium text-gray-500 truncate">Win Rate</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {backtest.win_rate?.toFixed(2)}%
                </dd>
                <dd className="mt-1 text-sm text-gray-500">
                  {backtest.winning_trades}W / {backtest.losing_trades}L
                </dd>
              </div>
            </div>
          </div>

          {/* Equity Curve */}
          {equityData && equityData.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Equity Curve</h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={equityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#4F46E5"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Additional Metrics */}
          {backtest.metrics && (
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Metrics</h2>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Total Trades</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {backtest.metrics.total_trades}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Average Win</dt>
                  <dd className="mt-1 text-lg font-semibold text-green-600">
                    ${backtest.metrics.avg_win?.toFixed(2)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Average Loss</dt>
                  <dd className="mt-1 text-lg font-semibold text-red-600">
                    ${backtest.metrics.avg_loss?.toFixed(2)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Profit Factor</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {backtest.metrics.profit_factor?.toFixed(2)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Final Portfolio Value</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    ${backtest.metrics.final_value?.toFixed(2)}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Trades Table */}
          {backtest.trades && backtest.trades.length > 0 && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Trade History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Shares
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Profit/Loss
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {backtest.trades.map((trade: any, index: number) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(trade.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              trade.action === 'BUY'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {trade.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${trade.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {trade.shares}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${(trade.cost || trade.proceeds)?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {trade.profit !== undefined ? (
                            <span className={trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                              ${trade.profit.toFixed(2)} ({trade.profit_pct?.toFixed(2)}%)
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BacktestResults;
