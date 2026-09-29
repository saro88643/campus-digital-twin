import { Outlet, Navigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const AuthLayout = () => {
  const { userInfo } = useAuth();

  if (userInfo) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="w-full max-w-sm mx-auto lg:w-96">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display text-gray-900 tracking-tight">Campus Twin</h1>
              <p className="text-xs text-gray-500 font-medium">Digital Management Platform</p>
            </div>
          </div>

          <Outlet />
        </div>
      </div>

      {/* Right side decoration */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <img
          className="absolute inset-0 object-cover w-full h-full"
          src="https://images.unsplash.com/photo-1541339907198-e08756c83f2d?auto=format&fit=crop&q=80&w=1920"
          alt="Campus Library"
        />
        <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[2px]"></div>
        <div className="absolute bottom-20 left-20 right-20 text-white">
          <h2 className="text-4xl font-bold font-display leading-tight mb-4">
            Transforming Campus Management into a Digital Reality.
          </h2>
          <p className="text-lg text-blue-50 max-w-lg">
            Real-time tracking of facilities, rooms, and departments across the entire institution.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
