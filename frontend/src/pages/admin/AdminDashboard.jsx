import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Layers,
  DoorOpen,
  Users,
  Boxes,
  Wrench,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Activity
} from 'lucide-react';
import api from '../../services/api';

import useAuth from '../../hooks/useAuth';

const AdminDashboard = () => {
  const { userInfo } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = userInfo?.role === 'admin';

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const { data } = await api.get('/dashboard/stats');
      setStats(data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  const statCards = [
    { label: 'Total Blocks', value: stats?.totals?.blocks, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Floors', value: stats?.totals?.floors, icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total Rooms', value: stats?.totals?.rooms, icon: DoorOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Departments', value: stats?.totals?.departments, icon: Boxes, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Facilities', value: stats?.totals?.facilities, icon: Wrench, color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: 'Total Users', value: stats?.totals?.users, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display text-gray-900 tracking-tight">
            {isAdmin ? 'Admin Console' : `Welcome, ${userInfo?.name || 'User'}`}
          </h2>
          <p className="text-gray-500 mt-1">
            {isAdmin
              ? 'Institutional metrics and real-time management control.'
              : 'Campus overview, live classroom utilization, and interactive navigation.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-gray-700 uppercase tracking-tighter">System Live</span>
          </div>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className={`${card.bg} ${card.color} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold font-display text-gray-900">{card.value}</div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Room Status Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold font-display flex items-center gap-2 text-gray-900">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Room Utilization Distribution
              </h3>
            </div>

            <div className="space-y-6">
              {stats?.breakdowns?.roomStatus?.map((item) => {
                const percentage = Math.round((item.count / (stats?.totals?.rooms || 1)) * 100);
                let barColor = 'bg-gray-200';
                if (item._id === 'Available') barColor = 'bg-green-500';
                if (item._id === 'Occupied') barColor = 'bg-blue-600';
                if (item._id === 'Under Maintenance') barColor = 'bg-yellow-500';
                if (item._id === 'Temporarily Closed') barColor = 'bg-red-500';

                return (
                  <div key={item._id}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-gray-700">{item._id}</span>
                      <span className="text-sm font-bold text-gray-900">{percentage}% <span className="text-gray-400 font-normal ml-1">({item.count} rooms)</span></span>
                    </div>
                    <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-3xl text-white shadow-xl shadow-blue-200">
              <h3 className="text-xl font-bold font-display mb-4">
                {isAdmin ? 'Quick Management' : 'Quick Navigation'}
              </h3>
              <p className="text-blue-100 text-sm mb-8">
                {isAdmin ? 'Direct access to core data entry modules.' : 'Direct access to campus twin features.'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {isAdmin ? (
                  <>
                    <Link to="/admin/blocks" className="bg-white/10 hover:bg-white/20 p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between group">
                      Blocks <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                    <Link to="/admin/rooms" className="bg-white/10 hover:bg-white/20 p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between group">
                      Rooms <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                    <Link to="/admin/facilities" className="bg-white/10 hover:bg-white/20 p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between group">
                      Facilities <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                    <Link to="/admin/users" className="bg-white/10 hover:bg-white/20 p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between group">
                      Manage Users <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/campus-twin" className="bg-white/10 hover:bg-white/20 p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between group">
                      Campus Twin <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                    <Link to="/blocks" className="bg-white/10 hover:bg-white/20 p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between group">
                      Explore Blocks <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                    <Link to="/classrooms" className="bg-white/10 hover:bg-white/20 p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between group">
                      Find Classrooms <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                    <Link to="/facilities" className="bg-white/10 hover:bg-white/20 p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between group">
                      View Facilities <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Health Status */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold font-display mb-6">Environment Health</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-green-50 border border-green-100">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-bold text-green-700">Database Engine</span>
                  </div>
                  <span className="text-[10px] font-black text-green-600 uppercase">Operational</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-green-50 border border-green-100">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-bold text-green-700">Activity Auditor</span>
                  </div>
                  <span className="text-[10px] font-black text-green-600 uppercase">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Activity Log Sidebar */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold font-display text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" /> Activity Log
              </h3>
              <button
                onClick={fetchDashboardStats}
                className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                title="Refresh Activity Log"
              >
                <Clock className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((activity, i) => (
                  <div key={activity._id || i} className="flex gap-4 relative group">
                    {i < stats.recentActivities.length - 1 && (
                      <div className="absolute left-[7px] top-6 bottom-[-24px] w-[2px] bg-gray-100 group-hover:bg-gray-200 transition-colors"></div>
                    )}
                    <div className={`w-4 h-4 rounded-full ${activity.color || 'bg-blue-500'} ring-4 ring-white z-10 shrink-0 mt-1`}></div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-gray-900 truncate">
                        {activity.action}: {activity.item}
                      </div>
                      {activity.details && (
                        <p className="text-[11px] text-gray-500 font-medium truncate">{activity.details}</p>
                      )}
                      <div className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5 font-bold">
                        <span>by {activity.user || 'Admin'}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span>{getRelativeTime(activity.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400 text-sm font-medium">
                  No activity logs recorded yet.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={fetchDashboardStats}
            className="w-full mt-8 py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-600 transition-all shadow-xs"
          >
            Refresh Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
