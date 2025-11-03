import { useEffect, useState } from 'react';
import { Calendar, Send } from 'lucide-react';
import { getPosts, getAssets, addPost } from '../lib/supabase';

export default function Publisher() {
  const [posts, setPosts] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    asset_id: '',
    platform: 'tiktok',
    scheduled_at: '',
    url: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [postsData, assetsData] = await Promise.all([
        getPosts(),
        getAssets()
      ]);
      setPosts(postsData);
      setAssets(assetsData.filter(a => a.status === 'approved' || a.status === 'draft'));
    } catch (error) {
      console.error('Error loading publisher data:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addPost(formData);
      setShowModal(false);
      setFormData({ asset_id: '', platform: 'tiktok', scheduled_at: '', url: '' });
      loadData();
    } catch (error) {
      console.error('Error scheduling post:', error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Publisher</h1>
          <p className="text-gray-600 mt-1">Schedule and track your content across platforms</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Send className="w-5 h-5" />
          Schedule Post
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['scheduled', 'published', 'failed', 'archived'].map(status => {
          const count = posts.filter(p => p.status === status).length;
          return (
            <div key={status} className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 mb-1 capitalize">{status}</div>
              <div className="text-2xl font-bold text-gray-900">{count}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Platform</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Scheduled</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Published</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Metrics</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">URL</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No posts yet. Schedule your first post to get started!</p>
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-gray-900 capitalize">{post.platform}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-xs rounded ${
                        post.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                        post.status === 'published' ? 'bg-green-100 text-green-800' :
                        post.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {post.scheduled_at ? new Date(post.scheduled_at).toLocaleString() : '-'}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {post.published_at ? new Date(post.published_at).toLocaleString() : '-'}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {post.impressions || 0} views, {post.clicks || 0} clicks
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {post.url ? (
                        <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Schedule Post</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset</label>
                <select
                  value={formData.asset_id}
                  onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select an asset...</option>
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.type} - {asset.path?.substring(0, 40)}...
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                  <option value="twitter">Twitter</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule Time (optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
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
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
