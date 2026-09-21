import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Layers,
  DoorOpen,
  MapPin,
  ChevronRight,
  ArrowLeft,
  Users,
  Boxes,
  Wrench,
  Loader2,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';
import { getStatusTone } from '../utils/formatters';

const BlockDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [block, setBlock] = useState(null);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlockDetails = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/blocks/${id}`);
        setBlock(data.data);
        setFloors(data.floors || []);
        setRooms(data.rooms || []);
      } catch (error) {
        console.error('Error fetching block details');
        navigate('/blocks');
      } finally {
        setLoading(false);
      }
    };
    fetchBlockDetails();
  }, [id, navigate]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-400 font-medium">Retrieving architectural data...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Back & Breadcrumbs */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate('/blocks')}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blocks
        </button>
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <Link to="/blocks" className="hover:text-gray-600">Blocks</Link>
          <ChevronRight className="w-4 h-4 opacity-50" />
          <span className="font-semibold text-gray-900">{block?.name}</span>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid lg:grid-cols-2">
          <div className="h-64 lg:h-auto bg-gray-200">
            <img
              src={block?.image || "https://images.unsplash.com/photo-1541339907198-e08756c83f2d?auto=format&fit=crop&q=80&w=1200"}
              alt={block?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest mb-6 w-fit">
              <Building2 className="w-3 h-3" /> Block {block?.code}
            </div>
            <h1 className="text-4xl font-extrabold font-display text-gray-900 mb-4">{block?.name}</h1>
            <div className="flex items-center gap-2 text-gray-500 font-medium mb-6">
              <MapPin className="w-4 h-4 text-blue-500" />
              {block?.location || 'Central Institutional Campus'}
            </div>
            <p className="text-gray-500 leading-relaxed max-w-xl">
              {block?.description || 'This primary academic structure houses specialized departments and modern classroom facilities designed for optimal student engagement and research activities.'}
            </p>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Floors & Departments */}
        <div className="lg:col-span-2 space-y-8">
          {/* Floors Grid */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-display flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" /> Architectural Levels
              </h2>
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{floors.length} Floors Total</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {floors.map((floor) => (
                <div key={floor._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                  <div>
                    <h3 className="font-bold text-gray-900">{floor.name}</h3>
                    <p className="text-xs text-gray-500">Level {floor.floorNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-blue-600">
                      {rooms.filter(r => r.floor === floor._id).length}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Rooms</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Rooms Table/List */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-display flex items-center gap-2">
                <DoorOpen className="w-5 h-5 text-blue-600" /> Room Directory
              </h2>
            </div>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name & Usage</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {rooms.map((room) => (
                      <tr key={room._id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="text-sm font-black text-gray-900">{room.roomNumber}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-900">{room.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">{room.purpose || 'Academic'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-2 py-1 rounded uppercase tracking-tighter">
                            {room.roomType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusTone(room.status)}`}>
                            {room.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/rooms/${room._id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all inline-block"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Departments & Stats */}
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold font-display mb-6 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-blue-600" /> Departments
            </h2>
            <div className="space-y-4">
              {block?.departments?.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No departments associated</p>
              ) : (
                block?.departments?.map((dept) => (
                  <Link
                    key={dept._id}
                    to={`/departments/${dept._id}`}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:border-blue-100 border border-transparent transition-all group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{dept.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{dept.code}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                  </Link>
                ))
              )}
            </div>
          </section>

          <section className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl text-white shadow-xl shadow-gray-200">
            <h2 className="text-lg font-bold font-display mb-6 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-400" /> Block Facilities
            </h2>
            <div className="flex flex-wrap gap-2">
              {(block?.facilities || ['Elevator', 'Fire Safety', 'WiFi', 'Power Backup', 'Security']).map((f, i) => (
                <span key={i} className="px-3 py-1.5 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  {f}
                </span>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-black">{rooms.reduce((acc, curr) => acc + (curr.capacity || 0), 0)}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total Capacity</p>
              </div>
              <div>
                <p className="text-2xl font-black">{rooms.filter(r => r.status === 'Available').length}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Free Rooms</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BlockDetailPage;
