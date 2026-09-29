import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  DoorOpen,
  Users,
  Network,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Wrench
} from 'lucide-react';
import api from '../services/api';

const LandingPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats(data.data);
      } catch (error) {
        console.error('Failed to fetch stats');
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-display tracking-tight text-gray-900">Campus Twin</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900">Sign in</Link>
              <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-6">
                <ShieldCheck className="w-3 h-3" />
                Next-Gen Campus Management
              </div>
              <h1 className="text-5xl sm:text-6xl font-extrabold font-display leading-[1.1] text-gray-900 mb-6">
                The Digital Mirror of Your <span className="text-blue-600">Campus.</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
                Experience a complete digital twin of your institution. Manage blocks, classrooms, and facilities with real-time accuracy and professional insights.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center gap-2">
                  Create Account <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="bg-white text-gray-900 border-2 border-gray-100 px-8 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all">
                  Sign In
                </Link>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
                {[
                  { label: 'Blocks', value: stats?.totals?.blocks || '0', icon: Building2 },
                  { label: 'Rooms', value: stats?.totals?.rooms || '0', icon: DoorOpen },
                  { label: 'Users', value: stats?.totals?.users || '0', icon: Users },
                  { label: 'Facilities', value: stats?.totals?.facilities || '0', icon: Wrench },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
                    <item.icon className="w-5 h-5 text-blue-600 mb-2" />
                    <div className="text-2xl font-bold font-display">{item.value}+</div>
                    <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-blue-600/5 rounded-[2rem] -rotate-3 blur-2xl"></div>
              <div className="relative rounded-[2rem] border-8 border-white shadow-2xl overflow-hidden aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1200"
                  alt="Campus Building"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-6 left-6 right-6">
                  <div className="bg-white/90 backdrop-blur px-4 py-3 rounded-xl shadow-lg border border-white/50 flex items-center gap-3 w-fit animate-bounce">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-gray-900 uppercase tracking-tighter">Live Updates Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-display text-gray-900 mb-4">Centralized Control, Local Execution</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Everything you need to manage a modern campus structure in one professional dashboard.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Hierarchical Navigation',
                desc: 'Drill down from blocks to floors to specific classrooms with ease.',
                icon: Network
              },
              {
                title: 'Inventory & Facilities',
                desc: 'Real-time tracking of projectors, smart boards, and lab equipment.',
                icon: CheckCircle2
              },
              {
                title: 'Role-Based Access',
                desc: 'Secure environments for students, faculty, and administrative staff.',
                icon: ShieldCheck
              }
            ].map((feature) => (
              <div key={feature.title} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                  <feature.icon className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <div className="bg-gray-900 p-1.5 rounded-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-gray-900">Campus Twin</span>
          </div>
          <p className="text-gray-400 text-sm">© 2026 Campus Twin Platform. Independent Deployment.</p>
          <div className="flex gap-6 text-sm font-semibold text-gray-500">
            <Link to="#" className="hover:text-gray-900">Terms</Link>
            <Link to="#" className="hover:text-gray-900">Privacy</Link>
            <Link to="#" className="hover:text-gray-900">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
