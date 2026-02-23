import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getInspectionsByInspector, getAllInspections } from '../../firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { MagnifyingGlassIcon, PlusIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

export default function InspectionList() {
  const { appUser } = useAuth();
  const isAdmin = appUser?.role === 'admin';
  const [search, setSearch] = useState('');

  const { data: inspections = [], isLoading } = useQuery({
    queryKey: isAdmin ? ['inspections-all'] : ['inspections', appUser?.uid],
    queryFn: isAdmin ? getAllInspections : () => getInspectionsByInspector(appUser!.uid),
    enabled: !!appUser,
  });

  const filtered = inspections.filter(
    (i) =>
      i.facilityName.toLowerCase().includes(search.toLowerCase()) ||
      i.templateName.toLowerCase().includes(search.toLowerCase()) ||
      i.date.includes(search)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">내 점검 목록</h1>
          <p className="text-slate-500 text-sm mt-1">수행한 점검 목록을 조회합니다.</p>
        </div>
        {!isAdmin && (
          <Link to="/inspect/start" className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-4 h-4" /> 점검 시작
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          className="input-field pl-9"
          placeholder="시설명, 점검표, 날짜로 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <ClipboardDocumentCheckIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">점검 내역이 없습니다.</p>
          {!isAdmin && (
            <Link to="/inspect/start" className="btn-primary inline-flex items-center gap-2 mt-4">
              <PlusIcon className="w-4 h-4" /> 첫 점검 시작하기
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((ins) => {
            const detailPath = isAdmin ? `/admin/inspections/${ins.id}` : `/inspect/${ins.id}`;
            return (
              <Link key={ins.id} to={detailPath} className="card hover:shadow-lg transition-shadow flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`badge ${
                        ins.status === 'submitted'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {ins.status === 'submitted' ? '제출완료' : '진행중'}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 truncate">{ins.facilityName}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{ins.templateName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{ins.date} · {ins.inspectorName}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-slate-500">{ins.photos.length}장</p>
                  <p className="text-xs text-slate-400">사진</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
