import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getFacilities, getAllInspections } from '../../firebase/firestore';
import {
  BuildingOffice2Icon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  ClockIcon,
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

  const submitted = inspections.filter((i) => i.status === 'submitted');
  const inProgress = inspections.filter((i) => i.status === 'in_progress');
  const recent = inspections.slice(0, 8);

  const stats = [
    { label: '등록 시설 수', value: facilities.length, icon: BuildingOffice2Icon, color: 'bg-blue-50 text-blue-600' },
    { label: '총 점검 수', value: inspections.length, icon: ClipboardDocumentCheckIcon, color: 'bg-green-50 text-green-600' },
    { label: '제출 완료', value: submitted.length, icon: CheckCircleIcon, color: 'bg-emerald-50 text-emerald-600' },
    { label: '진행 중', value: inProgress.length, icon: ClockIcon, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">관리자 대시보드</h1>
        <p className="text-slate-500 text-sm mt-1">시설 안전점검 현황을 한눈에 확인하세요.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Inspections */}
      <div className="card">
        <h2 className="text-base font-bold text-slate-700 mb-4">최근 점검 목록</h2>
        {recent.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">아직 점검 내역이 없습니다.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recent.map((ins) => (
              <Link
                key={ins.id}
                to={`/admin/inspections/${ins.id}`}
                className="flex items-center justify-between py-3 hover:bg-slate-50 rounded-lg px-2 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">{ins.facilityName}</p>
                  <p className="text-xs text-slate-500">{ins.inspectorName} · {ins.date}</p>
                </div>
                <span
                  className={`badge ${
                    ins.status === 'submitted'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {ins.status === 'submitted' ? '제출완료' : '진행중'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
