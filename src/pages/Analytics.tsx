import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, MousePointer, DollarSign } from 'lucide-react';
import { getAnalytics, getTrends, getOffers, supabase } from '../lib/supabase';
import { formatCurrency, formatNumber } from '../lib/utils';

export default function Analytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [trendPerformance, setTrendPerformance] = useState<any[]>([]);
  const [offerPerformance, setOfferPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      const data = await getAnalytics();
      setAnalytics(data);

      const [trends, offers, assets, posts] = await Promise.all([
        getTrends(),
        getOffers(),
        supabase.from('assets').select('*'),
        supabase.from('posts').select('*')
      ]);

      const trendStats = trends.map(trend => {
        const trendAssets = assets.data?.filter(a => a.trend_id === trend.id) || [];
        const trendPosts = posts.data?.filter(p => {
          const assetIds = trendAssets.map(a => a.id);
          return assetIds.includes(p.asset_id || '');
        }) || [];

        const totalImpressions = trendPosts.reduce((sum, p) => sum + (p.impressions || 0), 0);
        const totalClicks = trendPosts.reduce((sum, p) => sum + (p.clicks || 0), 0);

        return {
          topic: trend.topic,
          impressions: totalImpressions,
          clicks: totalClicks,
          posts: trendPosts.length
        };
      }).sort((a, b) => b.clicks - a.clicks).slice(0, 5);

      const offerStats = offers.map(offer => {
        const offerAssets = assets.data?.filter(a => a.offer_id === offer.id) || [];
        const offerPosts = posts.data?.filter(p => {
          const assetIds = offerAssets.map(a => a.id);
          return assetIds.includes(p.asset_id || '');
        }) || [];

        const totalImpressions = offerPosts.reduce((sum, p) => sum + (p.impressions || 0), 0);
        const totalClicks = offerPosts.reduce((sum, p) => sum + (p.clicks || 0), 0);

        return {
          merchant: offer.merchant,
          product: offer.product,
          rate: offer.rate,
          impressions: totalImpressions,
          clicks: totalClicks,
          posts: offerPosts.length
        };
      }).sort((a, b) => b.clicks - a.clicks).slice(0, 5);

      setTrendPerformance(trendStats);
      setOfferPerformance(offerStats);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Track performance metrics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Impressions"
          value={formatNumber(analytics?.totalImpressions || 0)}
          icon={<BarChart3 className="w-6 h-6 text-blue-600" />}
          bgColor="bg-blue-50"
        />
        <MetricCard
          title="Total Clicks"
          value={formatNumber(analytics?.totalClicks || 0)}
          icon={<MousePointer className="w-6 h-6 text-green-600" />}
          bgColor="bg-green-50"
        />
        <MetricCard
          title="Total Conversions"
          value={formatNumber(analytics?.totalConversions || 0)}
          icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
          bgColor="bg-orange-50"
        />
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(analytics?.totalRevenue || 0)}
          icon={<DollarSign className="w-6 h-6 text-red-600" />}
          bgColor="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Metrics</h2>
          <div className="space-y-4">
            <MetricRow label="Click-Through Rate (CTR)" value={`${analytics?.ctr || '0.00'}%`} />
            <MetricRow label="Conversion Rate" value={`${analytics?.conversionRate || '0.00'}%`} />
            <MetricRow label="Earnings Per Click (EPC)" value={`$${analytics?.epc || '0.00'}`} />
            <MetricRow
              label="Avg. Commission"
              value={analytics?.totalConversions > 0
                ? formatCurrency((analytics?.totalRevenue || 0) / analytics?.totalConversions)
                : '$0.00'
              }
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Breakdown</h2>
          <div className="space-y-3">
            {['tiktok', 'youtube', 'instagram', 'twitter'].map(platform => (
              <div key={platform} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900 capitalize">{platform}</span>
                <span className="text-sm text-gray-600">Coming soon</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Performing Trends</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Topic</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Posts</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Impressions</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Clicks</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">CTR</th>
              </tr>
            </thead>
            <tbody>
              {trendPerformance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No trend data available yet
                  </td>
                </tr>
              ) : (
                trendPerformance.map((trend, idx) => (
                  <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{trend.topic}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{trend.posts}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">{formatNumber(trend.impressions)}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">{formatNumber(trend.clicks)}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {trend.impressions > 0
                        ? ((trend.clicks / trend.impressions) * 100).toFixed(2)
                        : '0.00'}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Performing Offers</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Merchant</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Product</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Commission</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Posts</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Impressions</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {offerPerformance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No offer data available yet
                  </td>
                </tr>
              ) : (
                offerPerformance.map((offer, idx) => (
                  <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{offer.merchant}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">{offer.product}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">{offer.rate}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{offer.posts}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">{formatNumber(offer.impressions)}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">{formatNumber(offer.clicks)}</td>
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

function MetricCard({ title, value, icon, bgColor }: {
  title: string;
  value: string;
  icon: React.ReactNode;
  bgColor: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${bgColor} rounded-lg p-3`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}
