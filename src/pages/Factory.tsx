import { useEffect, useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { getTrends, getOffers, getAssets } from '../lib/supabase';
import { generateContent } from '../lib/api';

export default function Factory() {
  const [trends, setTrends] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [selectedTrend, setSelectedTrend] = useState('');
  const [selectedOffer, setSelectedOffer] = useState('');
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [trendsData, offersData, assetsData] = await Promise.all([
        getTrends(),
        getOffers(),
        getAssets()
      ]);
      setTrends(trendsData);
      setOffers(offersData.filter(o => o.approved));
      setAssets(assetsData);
    } catch (error) {
      console.error('Error loading factory data:', error);
    }
  }

  async function handleGenerate() {
    if (!selectedTrend || !selectedOffer) return;

    setGenerating(true);
    try {
      const trend = trends.find(t => t.id === selectedTrend);
      const offer = offers.find(o => o.id === selectedOffer);

      const result = await generateContent({
        trend_id: selectedTrend,
        offer_id: selectedOffer,
        trend: trend?.topic,
        offer: offer?.product
      });

      setGeneratedContent(result);
      await loadData();
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Content Factory</h1>
        <p className="text-gray-600 mt-1">Generate AI-powered content from trends and offers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Generator</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Trend</label>
              <select
                value={selectedTrend}
                onChange={(e) => setSelectedTrend(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a trending topic...</option>
                {trends.map(trend => (
                  <option key={trend.id} value={trend.id}>
                    {trend.topic} ({trend.source})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Offer</label>
              <select
                value={selectedOffer}
                onChange={(e) => setSelectedOffer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose an affiliate offer...</option>
                {offers.map(offer => (
                  <option key={offer.id} value={offer.id}>
                    {offer.merchant} - {offer.product} ({offer.rate})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!selectedTrend || !selectedOffer || generating}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Content
                </>
              )}
            </button>
          </div>

          {generatedContent && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">Content generated successfully!</p>
              <p className="text-xs text-green-600 mt-1">View the generated script below</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Generated Preview</h2>

          {generatedContent ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Script</label>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{generatedContent.script}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-900">{generatedContent.caption}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-3" />
                <p>Select a trend and offer to generate content</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Assets</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Preview</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Created</th>
              </tr>
            </thead>
            <tbody>
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    No assets yet. Generate your first content piece!
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{asset.type}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 max-w-md truncate">
                      {asset.path?.substring(0, 80)}...
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-xs rounded ${
                        asset.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        asset.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(asset.created_at).toLocaleDateString()}
                    </td>
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
