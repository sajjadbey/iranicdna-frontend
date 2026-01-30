import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Activity, Globe, TrendingUp, Users, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { API_ENDPOINTS } from '../config/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface VisitInsights {
  total_visits: number;
  unique_ips: number;
  ipv4_count: number;
  ipv6_count: number;
  top_isps: Array<{ isp: string; count: number; percentage: number }>;
  top_paths: Array<{ path: string; count: number; percentage: number }>;
  top_countries: Array<{ country: string; count: number; percentage: number }>;
  visits_by_date: Array<{ date: string; count: number }>;
}

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
}> = ({ icon, label, value, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-6"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-slate-400 text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
        {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
      </div>
      <div className="text-[var(--color-accent)]">{icon}</div>
    </div>
  </motion.div>
);

const ChartCard: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-6"
  >
    <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
    <div className="h-80">{children}</div>
  </motion.div>
);

export const VisitInsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<VisitInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchInsights();
  }, [days]);

  const fetchInsights = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_ENDPOINTS.profile.replace('/auth/profile/', '/security/visit-insights/')}?days=${days}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }

      const data = await response.json();
      setInsights(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-400">Loading insights...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-400 text-lg">{error}</p>
            <button
              onClick={fetchInsights}
              className="mt-4 px-6 py-2 bg-[var(--color-accent)] text-[var(--color-bg)] rounded-lg hover:opacity-90 transition-opacity"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!insights) {
    return null;
  }

  // Chart data configurations
  const ipTypeData = {
    labels: ['IPv4', 'IPv6'],
    datasets: [
      {
        data: [insights.ipv4_count, insights.ipv6_count],
        backgroundColor: ['#3b82f6', '#8b5cf6'],
        borderColor: ['#2563eb', '#7c3aed'],
        borderWidth: 2,
      },
    ],
  };

  const ispData = {
    labels: insights.top_isps.slice(0, 10).map((isp) => isp.isp),
    datasets: [
      {
        label: 'Visits',
        data: insights.top_isps.slice(0, 10).map((isp) => isp.count),
        backgroundColor: 'rgba(212, 175, 55, 0.8)',
        borderColor: 'rgba(212, 175, 55, 1)',
        borderWidth: 1,
      },
    ],
  };

  const pathData = {
    labels: insights.top_paths.slice(0, 10).map((path) => path.path.substring(0, 30)),
    datasets: [
      {
        label: 'Visits',
        data: insights.top_paths.slice(0, 10).map((path) => path.count),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  };

  const countryData = {
    labels: insights.top_countries.slice(0, 10).map((country) => country.country),
    datasets: [
      {
        label: 'Visits',
        data: insights.top_countries.slice(0, 10).map((country) => country.count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const timelineData = {
    labels: insights.visits_by_date.map((item) => {
      const date = new Date(item.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        label: 'Daily Visits',
        data: insights.visits_by_date.map((item) => item.count),
        borderColor: 'rgba(212, 175, 55, 1)',
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#cbd5e1',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: '#1e3355',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          color: 'rgba(30, 51, 85, 0.3)',
        },
      },
      y: {
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          color: 'rgba(30, 51, 85, 0.3)',
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#cbd5e1',
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: '#1e3355',
        borderWidth: 1,
      },
    },
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Visit Insights</h1>
          <p className="text-slate-400">
            Analytics and insights for website visits over the past {days} days
          </p>
          
          {/* Time range selector */}
          <div className="mt-4 flex gap-2">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  days === d
                    ? 'bg-[var(--color-accent)] text-[var(--color-bg)]'
                    : 'bg-[var(--color-card)] text-slate-400 hover:text-white'
                }`}
              >
                {d} days
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Activity style={{ width: 32, height: 32 }} />}
            label="Total Visits"
            value={insights.total_visits.toLocaleString()}
            subtitle="All page visits"
          />
          <StatCard
            icon={<Users style={{ width: 32, height: 32 }} />}
            label="Unique IPs"
            value={insights.unique_ips.toLocaleString()}
            subtitle="Distinct visitors"
          />
          <StatCard
            icon={<Globe style={{ width: 32, height: 32 }} />}
            label="Countries"
            value={insights.top_countries.length}
            subtitle="Unique countries"
          />
          <StatCard
            icon={<TrendingUp style={{ width: 32, height: 32 }} />}
            label="Avg Daily"
            value={Math.round(insights.total_visits / days).toLocaleString()}
            subtitle="Average visits per day"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* IP Type Distribution */}
          <ChartCard title="IP Type Distribution">
            <Pie data={ipTypeData} options={pieOptions} />
          </ChartCard>

          {/* Top Countries */}
          <ChartCard title="Top Countries">
            <Bar data={countryData} options={chartOptions} />
          </ChartCard>
        </div>

        {/* Full Width Charts */}
        <div className="space-y-6 mb-8">
          {/* Top ISPs */}
          <ChartCard title="Top Internet Service Providers">
            <Bar data={ispData} options={chartOptions} />
          </ChartCard>

          {/* Most Visited Paths */}
          <ChartCard title="Most Visited Pages">
            <Bar data={pathData} options={chartOptions} />
          </ChartCard>

          {/* Visits Over Time */}
          <ChartCard title="Visits Over Time">
            <Line data={timelineData} options={chartOptions} />
          </ChartCard>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top ISPs Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Globe style={{ width: 20, height: 20 }} />
              ISP Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="text-left text-slate-400 py-2">ISP</th>
                    <th className="text-right text-slate-400 py-2">Visits</th>
                    <th className="text-right text-slate-400 py-2">%</th>
                  </tr>
                </thead>
                <tbody>
                  {insights.top_isps.slice(0, 10).map((isp, index) => (
                    <tr key={index} className="border-b border-[var(--color-border)]/30">
                      <td className="py-3 text-slate-300">{isp.isp}</td>
                      <td className="text-right text-white">{isp.count}</td>
                      <td className="text-right text-[var(--color-accent)]">
                        {isp.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Top Paths Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin style={{ width: 20, height: 20 }} />
              Path Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="text-left text-slate-400 py-2">Path</th>
                    <th className="text-right text-slate-400 py-2">Visits</th>
                    <th className="text-right text-slate-400 py-2">%</th>
                  </tr>
                </thead>
                <tbody>
                  {insights.top_paths.slice(0, 10).map((path, index) => (
                    <tr key={index} className="border-b border-[var(--color-border)]/30">
                      <td className="py-3 text-slate-300 truncate max-w-xs" title={path.path}>
                        {path.path}
                      </td>
                      <td className="text-right text-white">{path.count}</td>
                      <td className="text-right text-[var(--color-accent)]">
                        {path.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};
