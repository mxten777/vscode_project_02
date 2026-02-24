import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getFacilities, getAllInspections } from '../../firebase/firestore';
import {
  BuildingOffice2Icon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const { data: facilities = [] } = useQuery({
    queryKey: ['facilities'],
    queryFn: getFacilities,
  });

  const { data: inspections = [] } = useQuery({
    queryKey: ['inspections-all'],
    queryFn: getAllInspections,
  });

  const submitted  = inspections.filter((i) => i.status === 'submitted');
  const inProgress = inspections.filter((i) => i.status === 'in_progress');
  const recent     = inspections.slice(0, 10);

  const stats = [
    {
      label: '등록 시설',
      value: facilities.length,
      icon: BuildingOffice2Icon,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      trend: '관리 중인 전체 시설',
    },
    {
      label: '총 점검',
      value: inspections.length,
      icon: ClipboardDocumentCheckIcon,
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-600',
      trend: '누적 점검 건수',
    },
    {
      label: '제출 완료',
      value: submitted.length,
      icon: CheckCircleIcon,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      trend: `완료율 ${inspections.length ? Math.round(submitted.length / inspections.length * 100) : 0}%`,
    },
    {
      label: '진행 중',
      value: inProgress.length,
      icon: ClockIcon,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      trend: '현재 점검 진행 건',
    },
  ];

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="page-header mb-0">
        <h1 className="page-title">관리자 대시보드</h1>
        <p className="page-subtitle">시설 안전점검 현황을 한눈에 확인하세요.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, iconBg, iconColor, trend }) => (
          <div key={label} className="card group hover:shadow-card-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${iconBg}`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 leading-none">{value}</p>
            <p className="text-sm font-semibold text-slate-700 mt-1.5">{label}</p>
            <p className="text-xs text-slate-400 mt-1">{trend}</p>
          </div>
        ))}
      </div>

      {/* Recent inspections */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-slate-800">최근 점검 목록</h2>
          <Link
            to="/admin/facilities"
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            전체 보기 <ArrowRightIcon className="w-3 h-3" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <ClipboardDocumentCheckIcon className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">아직 점검 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {recent.map((ins, idx) => (
              <Link
                key={ins.id}
                to={`/admin/inspections/${ins.id}`}
                className="flex items-center gap-4 py-3 px-3 hover:bg-slate-50 rounded-xl transition-colors group"
              >
                {/* Index */}
                <span className="text-xs font-semibold text-slate-300 w-5 text-center flex-shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </span>

                {/* Facility icon */}
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <BuildingOffice2Icon className="w-4 h-4 text-slate-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                    {ins.facilityName}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {ins.inspectorName} · {ins.date}
                  </p>
                </div>

                <span className={ins.status === 'submitted' ? 'badge-success' : 'badge-warning'}>
                  {ins.status === 'submitted' ? '제출완료' : '진행중'}
                </span>

                <ArrowRightIcon className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 flex-shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
