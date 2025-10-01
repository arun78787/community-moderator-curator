import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Filter,
  Calendar,
  Download
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { analyticsService } from '../services/api';

interface ModerationMetrics {
  totalFlags: number;
  pendingFlags: number;
  approvedFlags: number;
  removedFlags: number;
  averageResponseTime: number;
  accuracy: number;
  falsePositiveRate: number;
}

const AnalyticsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<ModerationMetrics>({
    totalFlags: 0,
    pendingFlags: 0,
    approvedFlags: 0,
    removedFlags: 0,
    averageResponseTime: 0,
    accuracy: 0,
    falsePositiveRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  // Mock data for charts
  const flagTrendsData = [
    { name: 'Mon', flags: 12, approved: 8, removed: 4 },
    { name: 'Tue', flags: 8, approved: 5, removed: 3 },
    { name: 'Wed', flags: 15, approved: 9, removed: 6 },
    { name: 'Thu', flags: 6, approved: 4, removed: 2 },
    { name: 'Fri', flags: 10, approved: 6, removed: 4 },
    { name: 'Sat', flags: 5, approved: 3, removed: 2 },
    { name: 'Sun', flags: 7, approved: 5, removed: 2 },
  ];

  const categoryData = [
    { name: 'Spam', value: 35, color: '#F59E0B' },
    { name: 'Harassment', value: 25, color: '#EF4444' },
    { name: 'Hate Speech', value: 20, color: '#DC2626' },
    { name: 'Misinformation', value: 12, color: '#F97316' },
    { name: 'Other', value: 8, color: '#6B7280' },
  ];

  const responseTimeData = [
    { name: 'Mon', time: 2.5 },
    { name: 'Tue', time: 1.8 },
    { name: 'Wed', time: 3.2 },
    { name: 'Thu', time: 1.5 },
    { name: 'Fri', time: 2.1 },
    { name: 'Sat', time: 1.9 },
    { name: 'Sun', time: 2.3 },
  ];

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Mock data - in a real app this would come from the API
      setMetrics({
        totalFlags: 123,
        pendingFlags: 8,
        approvedFlags: 87,
        removedFlags: 28,
        averageResponseTime: 2.3,
        accuracy: 92.5,
        falsePositiveRate: 7.5,
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}min`;
    }
    return `${hours.toFixed(1)}h`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Moderation Analytics
          </h1>
          <p className="text-gray-600">
            Track community health and moderation performance
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <Calendar className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <Download className="w-5 h-5 text-gray-500" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Flags</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalFlags}</p>
            </div>
            <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-warning-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              {metrics.pendingFlags} pending review
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Time</p>
              <p className="text-2xl font-bold text-gray-900">{formatTime(metrics.averageResponseTime)}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-primary-600 text-sm font-medium">
              <TrendingUp className="inline w-4 h-4 mr-1" />
              15% faster
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.accuracy}%</p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-success-600 text-sm font-medium">
              High accuracy
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">False Positives</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.falsePositiveRate}%</p>
            </div>
            <div className="w-12 h-12 bg-error-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-error-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-error-600 text-sm font-medium">
              Room for improvement
            </span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Flag Trends */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Flag Trends</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary-500 rounded"></div>
                <span>Approved</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-error-500 rounded"></div>
                <span>Removed</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={flagTrendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="approved" fill="#22C55E" />
              <Bar dataKey="removed" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Flag Categories */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Flag Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Response Time Trend */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Average Response Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={responseTimeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value: any) => [formatTime(value), 'Response Time']} />
            <Line type="monotone" dataKey="time" stroke="#3B82F6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Actions Summary */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Moderation Actions</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-success-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-success-600" />
                <span className="font-medium text-success-900">Approved</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-success-900">{metrics.approvedFlags}</span>
                <p className="text-sm text-success-600">
                  {((metrics.approvedFlags / metrics.totalFlags) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-error-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <XCircle className="w-5 h-5 text-error-600" />
                <span className="font-medium text-error-900">Removed</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-error-900">{metrics.removedFlags}</span>
                <p className="text-sm text-error-600">
                  {((metrics.removedFlags / metrics.totalFlags) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-warning-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-warning-600" />
                <span className="font-medium text-warning-900">Pending</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-warning-900">{metrics.pendingFlags}</span>
                <p className="text-sm text-warning-600">
                  {((metrics.pendingFlags / metrics.totalFlags) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Insights</h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">AI Accuracy</span>
                <span className="text-sm font-bold text-primary-600">87%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: '87%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Human Review Required</span>
                <span className="text-sm font-bold text-warning-600">23%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-warning-600 h-2 rounded-full" style={{ width: '23%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Auto-approved</span>
                <span className="text-sm font-bold text-success-600">65%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-success-600 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Consider adjusting AI thresholds to reduce false positives</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Response time is within target range</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Most flags are spam-related, consider improving detection</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;