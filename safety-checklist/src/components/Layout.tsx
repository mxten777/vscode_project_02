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
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Layout() {
  const { appUser, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdmin = appUser?.role === 'admin';

  const adminNav = [
    { to: '/admin',            label: '대시보드',    icon: HomeIcon,                   end: true },
    { to: '/admin/facilities', label: '시설 관리',   icon: BuildingOffice2Icon },
    { to: '/admin/templates',  label: '점검표 관리', icon: ClipboardDocumentListIcon },
    { to: '/admin/users',      label: '사용자 관리', icon: UsersIcon },
  ];

  const inspectorNav = [
    { to: '/inspect',       label: '내 점검 목록', icon: ClipboardDocumentCheckIcon, end: true },
    { to: '/inspect/start', label: '점검 시작',    icon: PlusCircleIcon },
  ];

  const navItems = isAdmin ? adminNav : inspectorNav;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // 이니셜 아바타
  const initials = (appUser?.displayName || appUser?.email || '?')
    .charAt(0)
    .toUpperCase();

  const NavItems = ({ onClick }: { onClick?: () => void }) => (
    <ul className="space-y-0.5">
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <li key={to}>
          <NavLink
            to={to}
            end={end}
            onClick={onClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-glow'
                  : 'text-slate-400 hover:bg-white/8 hover:text-slate-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`p-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'
                }`}>
                  <Icon className="w-4 h-4" />
                </span>
                {label}
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/8 flex-shrink-0">
        <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-lg shadow-glow">
          <ShieldCheckIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-100 leading-none">안전점검 시스템</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isAdmin
              ? <span className="text-indigo-400 font-semibold">관리자</span>
              : <span className="text-emerald-400 font-semibold">점검자</span>}
            {' '}포털
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-2">
          {isAdmin ? 'MANAGEMENT' : 'INSPECTION'}
        </p>
        <NavItems onClick={onClose} />
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t border-white/8 pt-3 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 mb-1">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-200 truncate">{appUser?.displayName}</p>
            <p className="text-[11px] text-slate-500 truncate">{appUser?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-200 hover:bg-white/8 transition-all duration-150"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          로그아웃
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-[#0f172a] fixed h-full z-10">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-[#0f172a] px-4 h-14 flex items-center justify-between border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <ShieldCheckIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-slate-100">안전점검 시스템</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 text-slate-400 hover:text-white transition-colors"
        >
          {sidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-20 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="md:hidden fixed top-0 left-0 bottom-0 z-30 w-64 bg-[#0f172a] animate-fade-in">
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}

      {/* Main */}
      <main className="flex-1 md:ml-60 pt-14 md:pt-0">
        <div className="p-5 md:p-8 max-w-6xl mx-auto animate-slide-up">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
