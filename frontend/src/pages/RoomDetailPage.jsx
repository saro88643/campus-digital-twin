import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  DoorOpen,
  Building2,
  Layers,
  Users,
  MapPin,
  ChevronRight,
  ArrowLeft,
  Wrench,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Contact,
  Navigation,
  Compass,
  Info
} from 'lucide-react';
import api from '../services/api';
import { getStatusTone, formatDate } from '../utils/formatters';

const RoomDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/rooms/${id}`);
        setRoom(data.data);
      } catch (error) {
        console.error('Error fetching room details');
        navigate('/classrooms');
      } finally {
        setLoading(false);
      }
    };
    fetchRoomDetails();
  }, [id, navigate]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-400 font-medium">Scanning room infrastructure...</p>
    </div>
  );

  const facilitiesList = [
    { key: 'projector', label: 'Digital Projector' },
    { key: 'smartBoard', label: 'Interactive Smart Board' },
    { key: 'computers', label: 'Desktop Terminals' },
    { key: 'wifi', label: 'High-speed WiFi' },
    { key: 'airConditioning', label: 'Air Conditioning' },
    { key: 'fans', label: 'Ventilation Fans' },
    { key: 'cctv', label: 'CCTV Surveillance' },
    { key: 'powerBackup', label: 'UPS Power Backup' },
    { key: 'audioSystem', label: 'Professional Audio System' },
    { key: 'labEquipment', label: 'Specialized Lab Equipment' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Navigation */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </button>
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <Link to="/campus-twin" className="hover:text-gray-600">Campus</Link>
          <ChevronRight className="w-4 h-4 opacity-50" />
          <Link to={`/blocks/${room?.block?._id}`} className="hover:text-gray-600">{room?.block?.name}</Link>
          <ChevronRight className="w-4 h-4 opacity-50" />
          <span className="font-semibold text-gray-900">Room {room?.roomNumber}</span>
        </nav>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Room Dossier Card */}
          <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 lg:p-10">
              <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest mb-4">
                    {room?.roomType} · Unit ID: {room?.roomNumber}
                  </div>
                  <h1 className="text-4xl font-extrabold font-display text-gray-900 mb-2">{room?.name}</h1>
                  <p className="text-gray-500 font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    {room?.block?.name} · {room?.floor?.name} (Level {room?.floor?.floorNumber})
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <button
                    onClick={() => navigate(`/digital-twin/navigate/${room?._id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider shadow-xl shadow-blue-200 transition-all flex items-center gap-2"
                  >
                    <Navigation className="w-4 h-4" /> FIND PATH
                  </button>

                  <div className={`px-4 py-2 rounded-xl border-2 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 ${getStatusTone(room?.status)}`}>
                    <CircleIcon status={room?.status} />
                    {room?.status}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
                <StatItem icon={Users} label="Capacity" value={`${room?.capacity} Seats`} />
                <StatItem icon={Clock} label="Operational" value={room?.workingHours || '08:00 - 18:00'} />
                <StatItem icon={MapPin} label="Orientation" value={room?.block?.code || 'Main Block'} />
                <StatItem icon={ShieldCheck} label="Access" value="Biometric/Card" />
              </div>

              <div className="mt-10 space-y-6">
                <div>
                  <h3 className="text-lg font-bold font-display text-gray-900 mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" /> Purpose & Usage
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {room?.purpose || 'Dedicated academic space configured for specialized learning experiences and institutional activities.'}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-gray-900 mb-3 flex items-center gap-2">
                    <DoorOpen className="w-5 h-5 text-blue-600" /> Architectural Description
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {room?.description || 'No additional architectural details available for this unit. Please contact campus facilities management for full technical specifications.'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Infrastructure & Facilities Grid */}
          <section className="bg-white p-8 lg:p-10 rounded-[2rem] border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black font-display text-gray-900 mb-8 flex items-center gap-3">
              <Wrench className="w-6 h-6 text-blue-600" /> Unit Infrastructure
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {facilitiesList.map((f) => (
                <div
                  key={f.key}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    room?.facilities?.[f.key]
                    ? 'bg-blue-50/30 border-blue-100 text-blue-900'
                    : 'bg-white border-gray-100 text-gray-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {room?.facilities?.[f.key] ? (
                      <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="bg-gray-100 p-1.5 rounded-lg text-gray-400">
                        <XCircle className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <span className="text-sm font-bold">{f.label}</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-tighter">
                    {room?.facilities?.[f.key] ? 'Provisioned' : 'Not Available'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Personnel Card */}
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold font-display text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" /> Assigned Personnel
            </h3>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-100">
                {room?.assignedStaff?.charAt(0) || 'S'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-gray-900 truncate">{room?.assignedStaff || 'Senior Custodian'}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">In-charge Faculty</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-bold uppercase">Contact Ext</span>
                <span className="text-gray-900 font-black">{room?.contact || 'Ext: 242'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-bold uppercase">Last Inspection</span>
                <span className="text-gray-900 font-black">12-Jan-2026</span>
              </div>
            </div>
          </section>

          {/* Department Card */}
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold font-display text-gray-900 mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" /> Controlling Dept
            </h3>
            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <h4 className="text-sm font-black text-indigo-900 mb-1">{room?.department?.name || 'Department of Administration'}</h4>
              <p className="text-xs text-indigo-600 font-bold mb-4 uppercase tracking-tighter">{room?.department?.code || 'ADMIN'}</p>
              <Link
                to={`/departments/${room?.department?._id}`}
                className="text-xs font-black text-indigo-700 underline underline-offset-4 flex items-center gap-1 hover:text-indigo-900 transition-colors"
              >
                View Department Dossier <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </section>

          {/* Maintenance Card */}
          <section className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl text-white shadow-xl shadow-gray-200">
            <h3 className="text-lg font-bold font-display mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" /> Maintenance Log
            </h3>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed italic">
              "{room?.maintenanceNotes || 'No pending maintenance issues recorded. Next routine inspection scheduled for Q2-2026.'}"
            </p>
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
              <span>Status</span>
              <span className="text-green-400">Compliant</span>
            </div>
          </section>

          {/* Support Quick Link */}
          <button className="w-full py-4 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
            <Contact className="w-4 h-4" /> Log Support Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ icon: Icon, label, value }) => (
  <div className="flex flex-col items-center text-center">
    <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-gray-100 mb-3">
      <Icon className="w-5 h-5" />
    </div>
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm font-black text-gray-900">{value}</p>
  </div>
);

const CircleIcon = ({ status }) => {
  let color = 'text-gray-400';
  if (status === 'Available') color = 'text-green-500';
  if (status === 'Occupied') color = 'text-blue-500';
  if (status === 'Under Maintenance') color = 'text-yellow-500';
  if (status === 'Temporarily Closed') color = 'text-red-500';

  return <div className={`w-2 h-2 rounded-full fill-current bg-current ${color}`}></div>;
};

export default RoomDetailPage;
