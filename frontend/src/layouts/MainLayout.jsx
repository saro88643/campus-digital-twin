import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Network,
  Building2,
  Layers,
  DoorOpen,
  Boxes,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  GraduationCap,
  Wrench
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = userInfo?.role === 'admin';

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: true },
    { to: '/campus-twin', label: 'Campus Twin', icon: Network },
    { to: '/blocks', label: 'Blocks', icon: Building2 },
    { to: '/classrooms', label: 'Classrooms', icon: DoorOpen },
    { to: '/facilities', label: 'Facilities', icon: Wrench },
    { to: '/departments', label: 'Departments', icon: Boxes },
    { to: '/admin/users', label: 'Users', icon: Users, adminOnly: true },
    { to: '/admin/settings', label: 'Settings', icon: Settings, adminOnly: true },
  ];

  const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:block
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
            <div className="flex items-center justify-center w-10 h-10 bg-sidebar-primary rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-white tracking-tight">Campus Twin</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Digital Platform</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${location.pathname.startsWith(item.to)
                    ? 'bg-sidebar-primary text-white shadow-lg'
                    : 'hover:bg-sidebar-accent hover:text-white'}
                `}
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-2 py-3 mb-4 rounded-lg bg-sidebar-accent/30">
              <div className="w-9 h-9 rounded-full bg-sidebar-primary flex items-center justify-center text-white font-bold">
                {userInfo?.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{userInfo?.name}</p>
                <p className="text-xs text-gray-400 capitalize">{userInfo?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white border-b lg:px-8">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-500 lg:hidden hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Search bar placeholder */}
          <div className="hidden md:flex items-center flex-1 max-w-md ml-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 border-transparent rounded-lg focus:bg-white focus:border-sidebar-primary focus:ring-0 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{formatDate(new Date())}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Campus Time</p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

// Helper inside MainLayout just for now
const formatDate = (date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export default MainLayout;
