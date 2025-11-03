import { useEffect, useState } from 'react';
import { Plus, TrendingUp } from 'lucide-react';
import { getTrends, addTrend } from '../lib/supabase';

export default function Trends() {
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    source: 'manual',
    score: 0,
    region: 'US',
    status: 'new'
  });

  useEffect(() => {
    loadTrends();
  }, []);

  async function loadTrends() {
    try {
      const data = await getTrends();
      setTrends(data);
    } catch (error) {
      console.error('Error loading trends:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addTrend(formData);
      setShowModal(false);
      setFormData({ topic: '', source: 'manual', score: 0, region: 'US', status: 'new' });
      loadTrends();
    } catch (error) {
      console.error('Error adding trend:', error);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading trends...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trends</h1>
          <p className="text-gray-600 mt-1">Monitor trending topics from various sources</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add Trend
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Topic</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Source</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Score</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Region</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Created</th>
              </tr>
            </thead>
            <tbody>
              {trends.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No trends yet. Add your first trend to get started!</p>
                  </td>
                </tr>
              ) : (
                trends.map((trend) => (
                  <tr key={trend.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{trend.topic}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{trend.source}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">{trend.score}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{trend.region}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-xs rounded ${
                        trend.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        trend.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        trend.status === 'matched' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {trend.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(trend.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Trend</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="manual">Manual</option>
                  <option value="google_trends">Google Trends</option>
                  <option value="twitter">Twitter</option>
                  <option value="reddit">Reddit</option>
                  <option value="zapier">Zapier</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                <input
                  type="number"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Add Trend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
