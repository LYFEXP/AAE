import { useEffect, useState } from 'react';
import { Plus, DollarSign } from 'lucide-react';
import { getOffers, addOffer } from '../lib/supabase';

export default function Offers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    merchant: '',
    product: '',
    commission_type: 'percentage',
    rate: '',
    deeplink_template: '',
    network: '',
    approved: true
  });

  useEffect(() => {
    loadOffers();
  }, []);

  async function loadOffers() {
    try {
      const data = await getOffers();
      setOffers(data);
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addOffer(formData);
      setShowModal(false);
      setFormData({
        merchant: '',
        product: '',
        commission_type: 'percentage',
        rate: '',
        deeplink_template: '',
        network: '',
        approved: true
      });
      loadOffers();
    } catch (error) {
      console.error('Error adding offer:', error);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading offers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Affiliate Offers</h1>
          <p className="text-gray-600 mt-1">Manage your affiliate products and commissions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add Offer
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Merchant</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Product</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Commission</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Network</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Created</th>
              </tr>
            </thead>
            <tbody>
              {offers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No offers yet. Add your first affiliate offer to get started!</p>
                  </td>
                </tr>
              ) : (
                offers.map((offer) => (
                  <tr key={offer.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{offer.merchant}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">{offer.product}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">
                      <span className="font-semibold">{offer.rate}</span>
                      <span className="text-gray-500 text-xs ml-1">({offer.commission_type})</span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{offer.network}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-xs rounded ${
                        offer.approved ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {offer.approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(offer.created_at).toLocaleDateString()}
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Offer</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Merchant</label>
                <input
                  type="text"
                  value={formData.merchant}
                  onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <input
                  type="text"
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commission Type</label>
                  <select
                    value={formData.commission_type}
                    onChange={(e) => setFormData({ ...formData, commission_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
                  <input
                    type="text"
                    placeholder="10% or $25"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deeplink Template</label>
                <input
                  type="text"
                  placeholder="https://example.com/ref=123"
                  value={formData.deeplink_template}
                  onChange={(e) => setFormData({ ...formData, deeplink_template: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Network</label>
                <input
                  type="text"
                  placeholder="ShareASale, CJ, Impact, etc."
                  value={formData.network}
                  onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="approved"
                  checked={formData.approved}
                  onChange={(e) => setFormData({ ...formData, approved: e.target.checked })}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <label htmlFor="approved" className="text-sm text-gray-700">Approved for use</label>
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
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Add Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
