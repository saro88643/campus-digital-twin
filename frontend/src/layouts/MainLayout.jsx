import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Network,
  Building2,
  DoorOpen,
  Boxes,
  Users,
  Settings,
  LogOut,
  Menu,
  Search,
  GraduationCap,
  Wrench,
  FileSpreadsheet,
  Edit3
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = userInfo?.role === 'admin';

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/digital-twin', label: 'College Data Center', icon: FileSpreadsheet, adminOnly: true },
    { to: '/admin/room-numbers', label: 'Manage Room Numbers', icon: Edit3, adminOnly: true },
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

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && globalSearchTerm.trim()) {
      navigate(`/classrooms?search=${encodeURIComponent(globalSearchTerm.trim())}`);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Fixed Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-screen lg:shrink-0 lg:flex lg:flex-col
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Header */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border shrink-0">
            <div className="flex items-center justify-center w-10 h-10 bg-sidebar-primary rounded-lg shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-base font-bold text-white tracking-tight">SmartNavClass</h1>
              <p className="text-[9px] text-blue-300 font-bold uppercase tracking-widest">SIET Digital Twin</p>
            </div>
          </div>

          {/* Navigation Links - Scrollable inner area if menu is long */}
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

          {/* Static Bottom Profile & Sign Out Section */}
          <div className="p-4 border-t border-sidebar-border shrink-0 bg-sidebar">
            <div className="flex items-center gap-3 px-3 py-2.5 mb-3 rounded-xl bg-sidebar-accent/40 border border-sidebar-border/50">
              <div className="w-9 h-9 rounded-full bg-sidebar-primary flex items-center justify-center text-white font-bold shrink-0 shadow-md">
                {userInfo?.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{userInfo?.name || 'SIET Student'}</p>
                <p className="text-[10px] text-gray-400 capitalize font-medium">{userInfo?.role || 'User'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-xs font-bold text-gray-300 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Right Scrollable Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Navbar Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 lg:px-8 shrink-0 shadow-xs">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-500 lg:hidden hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Global Search bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md ml-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search rooms, labs, or faculty (Press Enter)..."
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 border-transparent rounded-lg focus:bg-white focus:border-sidebar-primary focus:ring-0 transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{formatDate(new Date())}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">SIET Campus Time</p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export default MainLayout;
