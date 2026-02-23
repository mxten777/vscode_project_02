import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getInspection, getTemplates } from '../../firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { generateInspectionPDF } from '../../utils/pdfGenerator';
import {
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';

export default function InspectionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { appUser } = useAuth();
  const isAdmin = appUser?.role === 'admin';

  const { data: inspection, isLoading: loadingInspection } = useQuery({
    queryKey: ['inspection', id],
    queryFn: () => getInspection(id!),
    enabled: !!id,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates,
  });

  const template = templates.find((t) => t.id === inspection?.templateId);

  const getItemAnswer = (itemId: string) => {
    const result = inspection?.results.find((r) => r.itemId === itemId);
    if (!result) return '-';
    const val = result.value;
    if (typeof val === 'boolean') return val ? '✓ 이상없음' : '✗ 미완료';
    return String(val) || '-';
  };

  const handlePDF = async () => {
    if (!inspection || !template) return;
    await generateInspectionPDF(inspection, template);
  };

  const backPath = isAdmin ? '/admin' : '/inspect';

  if (loadingInspection) {
    return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!inspection) {
    return <div className="card text-center py-16 text-slate-400">점검 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(backPath)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800">점검 결과 상세</h1>
          <p className="text-slate-500 text-sm">{inspection.facilityName} · {inspection.date}</p>
        </div>
        {inspection.status === 'in_progress' && !isAdmin && (
          <button
            onClick={() => navigate(`/inspect/form/${id}`)}
            className="btn-secondary flex items-center gap-2 text-sm py-2"
          >
            <PencilSquareIcon className="w-4 h-4" /> 계속 작성
          </button>
        )}
      </div>

      {/* Status Banner */}
      <div className={`card mb-4 ${inspection.status === 'submitted' ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <span className={`badge text-sm py-1 px-3 ${inspection.status === 'submitted' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {inspection.status === 'submitted' ? '✓ 제출완료' : '⏳ 진행중'}
            </span>
          </div>
          {inspection.status === 'submitted' && (
            <button onClick={handlePDF} className="btn-primary flex items-center gap-2 text-sm py-2">
              <DocumentArrowDownIcon className="w-4 h-4" /> PDF 다운로드
            </button>
          )}
        </div>
      </div>

      {/* Basic Info */}
      <div className="card mb-4">
        <h2 className="text-sm font-bold text-slate-700 mb-3">기본 정보</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">시설명</p>
            <p className="font-semibold text-slate-800">{inspection.facilityName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">점검일</p>
            <p className="font-semibold text-slate-800">{inspection.date}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">점검자</p>
            <p className="font-semibold text-slate-800">{inspection.inspectorName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">점검표</p>
            <p className="font-semibold text-slate-800">{inspection.templateName}</p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="card mb-4">
        <h2 className="text-sm font-bold text-slate-700 mb-3">점검 항목 결과</h2>
        {!template ? (
          <p className="text-slate-400 text-sm text-center py-4">템플릿 정보를 불러오는 중...</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {template.items.map((item, idx) => {
              const answer = getItemAnswer(item.id);
              const isChecked = answer === '✓ 이상없음';
              const isUnchecked = answer === '✗ 미완료';
              return (
                <div key={item.id} className="flex items-start justify-between py-3 gap-4">
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">{idx + 1}.</span>
                    <span className="text-sm text-slate-700">{item.title}</span>
                  </div>
                  <span className={`text-sm font-semibold flex-shrink-0 ${
                    isChecked ? 'text-green-600' : isUnchecked ? 'text-red-500' : 'text-slate-700'
                  }`}>
                    {answer}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Photos */}
      {inspection.photos.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-bold text-slate-700 mb-3">등록 사진 ({inspection.photos.length}장)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {inspection.photos.map((url, idx) => (
              <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                <img
                  src={url}
                  alt={`현장 사진 ${idx + 1}`}
                  className="w-full aspect-square object-cover rounded-lg hover:opacity-90 transition-opacity"
                />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
