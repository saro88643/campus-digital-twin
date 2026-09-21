import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import LoginPage from '../pages/LoginPage';
import LandingPage from '../pages/LandingPage';
import CampusTwinPage from '../pages/CampusTwinPage';
import BlocksPage from '../pages/BlocksPage';
import BlockDetailPage from '../pages/BlockDetailPage';
import ClassroomsPage from '../pages/ClassroomsPage';
import RoomDetailPage from '../pages/RoomDetailPage';
import FacilitiesPage from '../pages/FacilitiesPage';
import DepartmentsPage from '../pages/DepartmentsPage';
import DepartmentDetailPage from '../pages/DepartmentDetailPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageUsers from '../pages/admin/ManageUsers';
import ManageBlocks from '../pages/admin/ManageBlocks';
import ManageFloors from '../pages/admin/ManageFloors';
import ManageRooms from '../pages/admin/ManageRooms';
import ManageDepartments from '../pages/admin/ManageDepartments';
import ManageFacilities from '../pages/admin/ManageFacilities';
import CampusSettings from '../pages/admin/CampusSettings';
import useAuth from '../hooks/useAuth';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { userInfo, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!userInfo) return <Navigate to="/login" />;
  if (adminOnly && userInfo.role !== 'admin') return <Navigate to="/campus-twin" />;

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected Main Routes */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/campus-twin" element={<CampusTwinPage />} />

        <Route path="/blocks" element={<BlocksPage />} />
        <Route path="/blocks/:id" element={<BlockDetailPage />} />

        <Route path="/classrooms" element={<ClassroomsPage />} />
        <Route path="/rooms/:id" element={<RoomDetailPage />} />

        <Route path="/facilities" element={<FacilitiesPage />} />

        <Route path="/departments" element={<DepartmentsPage />} />
        <Route path="/departments/:id" element={<DepartmentDetailPage />} />

        {/* Admin Only Routes */}
        <Route path="/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly><ManageUsers /></ProtectedRoute>} />
        <Route path="/admin/blocks" element={<ProtectedRoute adminOnly><ManageBlocks /></ProtectedRoute>} />
        <Route path="/admin/floors" element={<ProtectedRoute adminOnly><ManageFloors /></ProtectedRoute>} />
        <Route path="/admin/rooms" element={<ProtectedRoute adminOnly><ManageRooms /></ProtectedRoute>} />
        <Route path="/admin/departments" element={<ProtectedRoute adminOnly><ManageDepartments /></ProtectedRoute>} />
        <Route path="/admin/facilities" element={<ProtectedRoute adminOnly><ManageFacilities /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute adminOnly><CampusSettings /></ProtectedRoute>} />
      </Route>

      {/* Catch all redirect */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
