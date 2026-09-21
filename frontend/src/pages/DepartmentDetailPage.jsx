import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Boxes,
  Building2,
  Layers,
  DoorOpen,
  ChevronRight,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Info,
  Loader2,
  ExternalLink,
  MapPin
} from 'lucide-react';
import api from '../services/api';
import { getStatusTone } from '../utils/formatters';

const DepartmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartmentDetails = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/departments/${id}`);
        setDepartment(data.data);
        setRooms(data.rooms || []);
      } catch (error) {
        console.error('Error fetching department details');
        navigate('/departments');
      } finally {
        setLoading(false);
      }
    };
    fetchDepartmentDetails();
  }, [id, navigate]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-400 font-medium">Retrieving departmental registry...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Back & Breadcrumbs */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate('/departments')}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Registry
        </button>
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <Link to="/departments" className="hover:text-gray-600">Departments</Link>
          <ChevronRight className="w-4 h-4 opacity-50" />
          <span className="font-semibold text-gray-900">{department?.name}</span>
        </nav>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Card */}
          <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-8 lg:p-10">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 shadow-inner">
                <span className="text-3xl font-black">{department?.code?.substring(0, 2)}</span>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest mb-3">
                  Dept ID: {department?.code}
                </div>
                <h1 className="text-4xl font-extrabold font-display text-gray-900">{department?.name}</h1>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold font-display text-gray-900 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" /> Mission & Governance
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {department?.description || 'This institutional unit is dedicated to academic excellence, research development, and strategic governance within the college ecosystem. It manages specialized labs and workspaces focused on modern curriculum delivery.'}
              </p>
            </div>
          </section>

          {/* Rooms Grid under this department */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-display flex items-center gap-2 text-gray-900">
                <DoorOpen className="w-6 h-6 text-blue-600" /> Associated Workspaces
              </h2>
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{rooms.length} Units Found</span>
            </div>

            {rooms.length === 0 ? (
              <div className="bg-white p-12 rounded-[2.5rem] border border-dashed text-center">
                <p className="text-gray-400 italic">No workspaces currently assigned to this department.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {rooms.map((room) => (
                  <Link
                    key={room._id}
                    to={`/rooms/${room._id}`}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-blue-600 font-black text-xs shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {room.roomNumber}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{room.name}</h4>
                        <p className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1">
                          <Building2 className="w-2.5 h-2.5" /> {room.block?.code} · {room.roomType}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Leadership Card */}
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold font-display text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" /> Department Leadership
            </h3>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 mb-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100">
                {department?.head?.charAt(0) || 'H'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-indigo-900 truncate">{department?.head || 'HoD unassigned'}</p>
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Head of Department</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-bold uppercase">Official Email</span>
                <span className="text-gray-900 font-bold truncate max-w-[150px]">{department?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-bold uppercase">Contact Point</span>
                <span className="text-gray-900 font-bold">{department?.contact || 'Institutional Ext.'}</span>
              </div>
            </div>
          </section>

          {/* Institutional Stats */}
          <section className="bg-gradient-to-br from-indigo-900 to-indigo-800 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100">
            <h3 className="text-lg font-bold font-display mb-8">Departmental Metrics</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-3xl font-black">{rooms.length}</p>
                <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mt-1">Workspaces</p>
              </div>
              <div>
                <p className="text-3xl font-black">{rooms.reduce((acc, curr) => acc + (curr.capacity || 0), 0)}</p>
                <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mt-1">Total Capacity</p>
              </div>
            </div>
          </section>

          {/* Quick Links */}
          <div className="space-y-3">
            <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 hover:bg-black shadow-xl shadow-gray-200">
              Generate Faculty Audit
            </button>
            <button className="w-full py-4 bg-white border border-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 hover:bg-gray-50">
              Download Syllabus Repo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetailPage;
