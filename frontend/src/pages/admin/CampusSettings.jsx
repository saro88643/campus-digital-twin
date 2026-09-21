import { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  GraduationCap,
  Mail,
  Phone,
  Globe,
  MapPin,
  Info,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Layout
} from 'lucide-react';
import api from '../../services/api';

const CampusSettings = () => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    address: '',
    contact: {
      email: '',
      phone: '',
      website: ''
    }
  });

  useEffect(() => {
    fetchCampusInfo();
  }, []);

  const fetchCampusInfo = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/campus');
      const campus = data.data;
      setFormData({
        name: campus.name || '',
        code: campus.code || '',
        description: campus.description || '',
        address: campus.address || '',
        contact: {
          email: campus.contact?.email || '',
          phone: campus.contact?.phone || '',
          website: campus.contact?.website || ''
        }
      });
    } catch (error) {
      console.error('Failed to fetch campus info');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setSuccess(false);
      await api.put('/campus', formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert('Failed to update institutional settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Retrieving Meta Registry...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black font-display text-gray-900 tracking-tight">Institutional Configuration</h2>
          <p className="text-gray-500 mt-1">Manage global institution profile and metadata.</p>
        </div>
        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
          <Settings className="w-6 h-6" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Identity Section */}
        <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Institutional Identity</h3>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Official Name</label>
                <input
                  type="text" required value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm focus:bg-white focus:border-blue-100 focus:ring-0 transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Unique Code</label>
                <input
                  type="text" required value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm focus:bg-white focus:border-blue-100 focus:ring-0 transition-all font-black uppercase"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Institutional Mission / Description</label>
              <textarea
                rows="4" value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm focus:bg-white focus:border-blue-100 focus:ring-0 transition-all font-medium leading-relaxed resize-none"
              ></textarea>
            </div>
          </div>
        </section>

        {/* Contact & Location Section */}
        <div className="grid md:grid-cols-2 gap-8">
          <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
                <Mail className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Communication</h3>
            </div>
            <div className="p-8 space-y-6 flex-1">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">General Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                    type="email" value={formData.contact.email}
                    onChange={(e) => setFormData({...formData, contact: {...formData.contact, email: e.target.value}})}
                    className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Direct Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                    type="text" value={formData.contact.phone}
                    onChange={(e) => setFormData({...formData, contact: {...formData.contact, phone: e.target.value}})}
                    className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Official Website</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                    type="text" value={formData.contact.website}
                    onChange={(e) => setFormData({...formData, contact: {...formData.contact, website: e.target.value}})}
                    className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-bold"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Geographical Data</h3>
            </div>
            <div className="p-8 space-y-6 flex-1">
              <div className="space-y-2 h-full">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Physical Address</label>
                <textarea
                  rows="8" value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Enter full campus address..."
                  className="w-full h-[calc(100%-1.5rem)] px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-medium leading-relaxed resize-none"
                ></textarea>
              </div>
            </div>
          </section>
        </div>

        {/* Form Actions */}
        <div className="pt-6 flex flex-col sm:flex-row items-center gap-6 sticky bottom-8 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-xl">
          <div className="flex-1 text-center sm:text-left">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Global Propagation</p>
            <p className="text-xs text-gray-500">Updates here will be reflected institution-wide across all user views.</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {success && (
              <div className="flex items-center gap-2 text-green-600 font-bold text-sm animate-in fade-in slide-in-from-right-4">
                <CheckCircle2 className="w-5 h-5" />
                Registry Updated
              </div>
            )}

            <button
              type="button"
              onClick={fetchCampusInfo}
              className="p-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl transition-all"
              title="Reset to Current"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-100"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Synchronizing...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Apply Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CampusSettings;
