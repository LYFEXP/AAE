import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, FileText, BarChart3 } from 'lucide-react';
import { getTrends, getOffers, getAnalytics, getPosts } from '../lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState({
    trends: 0,
    offers: 0,
    assets: 0,
    revenue: 0,
    clicks: 0,
    conversions: 0,
    ctr: '0.00',
    epc: '0.00'
  });
  const [recentTrends, setRecentTrends] = useState<any[]>([]);
  const [topOffers, setTopOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [trends, offers, posts, analytics] = await Promise.all([
          getTrends(),
          getOffers(),
          getPosts(),
          getAnalytics()
        ]);

        setStats({
          trends: trends.length,
          offers: offers.filter(o => o.approved).length,
          assets: posts.length,
          revenue: analytics.totalRevenue,
          clicks: analytics.totalClicks,
          conversions: analytics.totalConversions,
          ctr: analytics.ctr,
          epc: analytics.epc
        });

        setRecentTrends(trends.slice(0, 5));
        setTopOffers(offers.filter(o => o.approved).slice(0, 5));
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <div className="text-lg text-gray-400">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Overview of your affiliate content automation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Trends"
          value={stats.trends}
          icon={<TrendingUp className="w-6 h-6" />}
          gradient="from-blue-600 to-blue-900"
        />
        <StatCard
          title="Active Offers"
          value={stats.offers}
          icon={<DollarSign className="w-6 h-6" />}
          gradient="from-emerald-600 to-emerald-900"
        />
        <StatCard
          title="Content Pieces"
          value={stats.assets}
          icon={<FileText className="w-6 h-6" />}
          gradient="from-orange-600 to-orange-900"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.revenue.toFixed(2)}`}
          icon={<BarChart3 className="w-6 h-6" />}
          gradient="from-purple-600 to-purple-900"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 hover-glow">
          <h2 className="text-xl font-semibold text-white mb-6">Performance Metrics</h2>
          <div className="space-y-4">
            <MetricRow label="Total Clicks" value={stats.clicks} />
            <MetricRow label="Conversions" value={stats.conversions} />
            <MetricRow label="CTR" value={`${stats.ctr}%`} />
            <MetricRow label="EPC" value={`$${stats.epc}`} />
          </div>
        </div>

        <div className="glass-card p-6 hover-glow">
          <h2 className="text-xl font-semibold text-white mb-6">Recent Trends</h2>
          <div className="space-y-3">
            {recentTrends.length === 0 ? (
              <p className="text-gray-500 text-sm">No trends yet. Add your first trend!</p>
            ) : (
              recentTrends.map((trend) => (
                <div key={trend.id} className="flex items-center justify-between py-3 px-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-all">
                  <div>
                    <p className="font-medium text-white">{trend.topic}</p>
                    <p className="text-sm text-gray-400">{trend.source}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-lg ${
                    trend.status === 'new' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' :
                    trend.status === 'matched' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' :
                    'bg-gray-600/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {trend.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="glass-card p-6 hover-glow">
        <h2 className="text-xl font-semibold text-white mb-6">Top Offers</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Merchant</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Product</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Commission</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Network</th>
              </tr>
            </thead>
            <tbody>
              {topOffers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500 text-sm">
                    No offers yet. Add your first offer!
                  </td>
                </tr>
              ) : (
                topOffers.map((offer) => (
                  <tr key={offer.id} className="border-b border-gray-800/30 last:border-0 hover:bg-gray-800/30 transition-colors">
                    <td className="py-4 px-4 text-sm text-white font-medium">{offer.merchant}</td>
                    <td className="py-4 px-4 text-sm text-gray-300">{offer.product}</td>
                    <td className="py-4 px-4 text-sm text-emerald-400 font-semibold">{offer.rate}</td>
                    <td className="py-4 px-4 text-sm text-gray-400">{offer.network}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, gradient }: { title: string; value: string | number; icon: React.ReactNode; gradient: string }) {
  return (
    <div className="glass-card p-6 hover-glow group cursor-pointer">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-2">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`bg-gradient-to-br ${gradient} rounded-xl p-4 shadow-lg group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-lg font-bold text-white">{value}</span>
    </div>
  );
}
