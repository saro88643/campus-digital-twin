import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Building2,
  Layers,
  DoorOpen,
  Users,
  Settings,
  FileSpreadsheet,
  CheckCircle,
  Map,
  ShieldCheck,
  Save,
  Loader2,
  ExternalLink,
  Plus,
  Wrench,
  Boxes,
  Compass
} from 'lucide-react';
import api from '../../../services/api';

const CollegeDataCenterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  // SIET College Profile Form State
  const [formData, setFormData] = useState({
    name: 'Sri Shakthi Institute of Engineering and Technology',
    shortName: 'SIET',
    code: 'SIET',
    establishedYear: 2006,
    address: 'Sri Shakthi Nagar, L & T By-Pass, Chinniyampalayam Post, Coimbatore – 641062, Tamil Nadu, India',
    city: 'Coimbatore',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    country: 'India',
    pincode: '641062',
    phone: '+91 422 2683300',
    email: 'info@sreeshakthi.edu.in',
    website: 'https://www.sreeshakthi.edu.in',
    principal: 'Dr. R. Prakash',
    campusArea: '30 Acres',
    vision: 'To be an institution of excellence in technical education and research producing ethical engineers.',
    mission: 'Provide state-of-the-art infrastructure, quality education, industry collaboration and value-based training.',
    accreditation: 'NAAC A+ Grade, NBA Accredited Programs',
    affiliation: 'Anna University, Chennai (Approved by AICTE, New Delhi)'
  });

  useEffect(() => {
    fetchCollegeData();
  }, []);

  const fetchCollegeData = async () => {
    try {
      setLoading(true);
      const [campusRes, statsRes] = await Promise.all([
        api.get('/campus'),
        api.get('/digital-twin/stats')
      ]);

      const campus = campusRes.data.data;
      if (campus) {
        setFormData({
          name: campus.name || 'Sri Shakthi Institute of Engineering and Technology',
          shortName: campus.shortName || 'SIET',
          code: campus.code || 'SIET',
          establishedYear: campus.establishedYear || 2006,
          address: campus.address || 'Sri Shakthi Nagar, L & T By-Pass, Chinniyampalayam Post, Coimbatore – 641062, Tamil Nadu, India',
          city: campus.city || 'Coimbatore',
          district: campus.district || 'Coimbatore',
          state: campus.state || 'Tamil Nadu',
          country: campus.country || 'India',
          pincode: campus.pincode || '641062',
          phone: campus.contact?.phone || '+91 422 2683300',
          email: campus.contact?.email || 'info@sreeshakthi.edu.in',
          website: campus.contact?.website || 'https://www.sreeshakthi.edu.in',
          principal: campus.principal || 'Dr. R. Prakash',
          campusArea: campus.campusArea || '30 Acres',
          vision: campus.vision || '',
          mission: campus.mission || '',
          accreditation: campus.accreditation || '',
          affiliation: campus.affiliation || ''
        });
      }

      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching campus profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        name: formData.name,
        shortName: formData.shortName,
        code: formData.code,
        establishedYear: formData.establishedYear,
        address: formData.address,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,
        principal: formData.principal,
        campusArea: formData.campusArea,
        vision: formData.vision,
        mission: formData.mission,
        accreditation: formData.accreditation,
        affiliation: formData.affiliation,
        contact: {
          phone: formData.phone,
          email: formData.email,
          website: formData.website
        }
      };

      await api.put('/campus', payload);
      alert('College profile and SIET Digital Twin master data updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update campus profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-500 font-medium text-sm">Loading SIET College Data Center...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider mb-2">
            <GraduationCap className="w-4 h-4" /> Official SIET Governance
          </div>
          <h1 className="text-3xl font-black font-display text-gray-900 tracking-tight">College Data Center</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">
            Central management platform for physical campus architecture, master profiles, and digital twin mappings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/digital-twin/validation"
            className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-2xl text-xs font-bold shadow-sm transition-all"
          >
            <CheckCircle className="w-4 h-4 text-green-600" /> Validate Digital Twin
          </Link>
          <Link
            to="/admin/digital-twin/import-export"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-blue-200 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" /> Bulk Data Import / Backup
          </Link>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Buildings</p>
          <p className="text-3xl font-black font-display text-gray-900 mt-1">{stats?.totalBlocks || 4}</p>
        </div>
        <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Classrooms</p>
          <p className="text-3xl font-black font-display text-gray-900 mt-1">{stats?.totalRooms || 5}</p>
        </div>
        <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Mapped Rooms</p>
          <p className="text-3xl font-black font-display text-blue-600 mt-1">{stats?.mappedRooms || 2}</p>
        </div>
        <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Twin Coverage</p>
          <p className="text-3xl font-black font-display text-green-600 mt-1">{stats?.coveragePercent || 40}%</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {[
          { id: 'profile', label: 'College Profile', icon: GraduationCap },
          { id: 'modules', label: 'Digital Twin Modules', icon: Boxes },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === tab.id
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-blue-600 border-b border-blue-50 pb-2">
              Institution Identity
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">College Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 bg-gray-50 border-none rounded-2xl text-xs font-black text-gray-900 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Short Name / Code</label>
                <input
                  type="text"
                  required
                  value={formData.shortName}
                  onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                  className="w-full p-3 bg-gray-50 border-none rounded-2xl text-xs font-black text-gray-900 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Principal</label>
                <input
                  type="text"
                  value={formData.principal}
                  onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                  className="w-full p-3 bg-gray-50 border-none rounded-2xl text-xs font-bold text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Established Year</label>
                <input
                  type="number"
                  value={formData.establishedYear}
                  onChange={(e) => setFormData({ ...formData, establishedYear: parseInt(e.target.value) })}
                  className="w-full p-3 bg-gray-50 border-none rounded-2xl text-xs font-bold text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Campus Area</label>
                <input
                  type="text"
                  value={formData.campusArea}
                  onChange={(e) => setFormData({ ...formData, campusArea: e.target.value })}
                  className="w-full p-3 bg-gray-50 border-none rounded-2xl text-xs font-bold text-gray-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Physical Address</label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-3 bg-gray-50 border-none rounded-2xl text-xs font-medium text-gray-900"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 bg-gray-50 border-none rounded-2xl text-xs font-bold text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Official Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 bg-gray-50 border-none rounded-2xl text-xs font-bold text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Website URL</label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full p-3 bg-gray-50 border-none rounded-2xl text-xs font-bold text-gray-900"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-black uppercase tracking-widest text-blue-600 border-b border-blue-50 pb-2">
              Academic & Accreditation Standing
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Accreditation</label>
                <input
                  type="text"
                  value={formData.accreditation}
                  onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                  className="w-full p-3 bg-gray-50 border-none rounded-2xl text-xs font-bold text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Affiliation</label>
                <input
                  type="text"
                  value={formData.affiliation}
                  onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                  className="w-full p-3 bg-gray-50 border-none rounded-2xl text-xs font-bold text-gray-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Institutional Vision</label>
              <textarea
                rows={2}
                value={formData.vision}
                onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                className="w-full p-3 bg-gray-50 border-none rounded-2xl text-xs font-medium text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Institutional Mission</label>
              <textarea
                rows={2}
                value={formData.mission}
                onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                className="w-full p-3 bg-gray-50 border-none rounded-2xl text-xs font-medium text-gray-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-[#004d71] hover:bg-[#003d52] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving Profile...' : 'Save SIET Profile Changes'}
          </button>
        </form>
      )}

      {activeTab === 'modules' && (
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'Buildings & Blocks',
              desc: 'Manage SIET academic and administrative blocks.',
              link: '/admin/blocks',
              icon: Building2
            },
            {
              title: 'Floor Management',
              desc: 'Manage levels and upload floor plans.',
              link: '/admin/floors',
              icon: Layers
            },
            {
              title: 'Classroom Database',
              desc: 'Manage room numbers, capacity, and facilities.',
              link: '/admin/rooms',
              icon: DoorOpen
            },
            {
              title: 'Departments',
              desc: 'Academic and administrative governance registry.',
              link: '/admin/departments',
              icon: Boxes
            },
            {
              title: 'Facilities & Infrastructure',
              desc: 'Track labs, smart boards, and campus assets.',
              link: '/admin/facilities',
              icon: Wrench
            },
            {
              title: 'Bulk Import / Export',
              desc: 'CSV import and JSON digital twin backup.',
              link: '/admin/digital-twin/import-export',
              icon: FileSpreadsheet
            },
            {
              title: 'Digital Twin Validation',
              desc: 'Verify spatial geometry and graph connectivity.',
              link: '/admin/digital-twin/validation',
              icon: ShieldCheck
            }
          ].map((item) => (
            <Link
              key={item.title}
              to={item.link}
              className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-xs text-gray-500 font-medium">{item.desc}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollegeDataCenterPage;
