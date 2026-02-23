import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  BuildingOffice2Icon,
  ClipboardDocumentListIcon,
  ClipboardDocumentCheckIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Layout() {
  const { appUser, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdmin = appUser?.role === 'admin';

  const adminNav = [
    { to: '/admin', label: '대시보드', icon: HomeIcon, end: true },
    { to: '/admin/facilities', label: '시설 관리', icon: BuildingOffice2Icon },
    { to: '/admin/templates', label: '점검표 관리', icon: ClipboardDocumentListIcon },
    { to: '/admin/users', label: '사용자 관리', icon: UsersIcon },
  ];

  const inspectorNav = [
    { to: '/inspect', label: '내 점검 목록', icon: ClipboardDocumentCheckIcon, end: true },
    { to: '/inspect/start', label: '점검 시작', icon: ShieldCheckIcon },
  ];

  const navItems = isAdmin ? adminNav : inspectorNav;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const NavItems = () => (
    <>
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`
          }
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          {label}
        </NavLink>
      ))}
    </>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-slate-200">
          <ShieldCheckIcon className="w-7 h-7 text-blue-600" />
          <div>
            <p className="text-sm font-bold text-slate-800">안전점검 시스템</p>
            <p className="text-xs text-slate-500">{isAdmin ? '관리자' : '점검자'} 포털</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <NavItems />
        </nav>
        <div className="p-3 border-t border-slate-200">
          <div className="px-4 py-2 mb-2">
            <p className="text-xs font-semibold text-slate-800 truncate">{appUser?.displayName}</p>
            <p className="text-xs text-slate-500 truncate">{appUser?.email}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors">
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
          <span className="text-sm font-bold text-slate-800">안전점검 시스템</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 text-slate-600">
          {sidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-black/40" onClick={() => setSidebarOpen(false)} />
      )}
      {sidebarOpen && (
        <aside className="md:hidden fixed top-0 left-0 bottom-0 z-20 w-72 bg-white flex flex-col pt-16">
          <nav className="flex-1 p-3 space-y-1">
            <NavItems />
          </nav>
          <div className="p-3 border-t border-slate-200">
            <div className="px-4 py-2 mb-2">
              <p className="text-xs font-semibold text-slate-800 truncate">{appUser?.displayName}</p>
              <p className="text-xs text-slate-500 truncate">{appUser?.email}</p>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors">
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              로그아웃
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0">
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
