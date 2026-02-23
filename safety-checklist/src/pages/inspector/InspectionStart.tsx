import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getFacilities, getTemplates, createInspection } from '../../firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { BuildingOffice2Icon, ClipboardDocumentListIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import type { Facility, Template } from '../../types';

export default function InspectionStart() {
  const navigate = useNavigate();
  const { appUser } = useAuth();
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const { data: facilities = [], isLoading: loadingFacilities } = useQuery({
    queryKey: ['facilities'],
    queryFn: getFacilities,
  });

  const { data: templates = [], isLoading: loadingTemplates } = useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates,
  });

  const startMutation = useMutation({
    mutationFn: () => {
      if (!selectedFacility || !selectedTemplate || !appUser) throw new Error('선택 필요');
      return createInspection({
        facilityId: selectedFacility.id,
        templateId: selectedTemplate.id,
        inspectorId: appUser.uid,
        inspectorName: appUser.displayName,
        facilityName: selectedFacility.name,
        templateName: selectedTemplate.name,
        date: new Date().toLocaleDateString('ko-KR'),
        status: 'in_progress',
        results: [],
        photos: [],
      });
    },
    onSuccess: (id) => navigate(`/inspect/form/${id}`),
  });

  const step = !selectedFacility ? 1 : !selectedTemplate ? 2 : 3;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">점검 시작</h1>
        <p className="text-slate-500 text-sm mt-1">시설과 점검표를 선택하고 점검을 시작합니다.</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-6">
        {['시설 선택', '템플릿 선택', '점검 시작'].map((label, idx) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${step > idx + 1 || step === idx + 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {idx + 1}
            </div>
            <span className={`text-sm font-medium ${step === idx + 1 ? 'text-blue-600' : 'text-slate-400'}`}>{label}</span>
            {idx < 2 && <ArrowRightIcon className="w-4 h-4 text-slate-300" />}
          </div>
        ))}
      </div>

      {/* Step 1 - Facility */}
      {step >= 1 && (
        <div className="card mb-4">
          <div className="flex items-center gap-2 mb-4">
            <BuildingOffice2Icon className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-700">시설 선택</h2>
          </div>
          {loadingFacilities ? (
            <div className="flex justify-center py-6"><div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="grid gap-2">
              {facilities.map((f) => (
                <button
                  key={f.id}
                  onClick={() => { setSelectedFacility(f); setSelectedTemplate(null); }}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${
                    selectedFacility?.id === f.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{f.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{f.type} · {f.address}</p>
                  </div>
                  {selectedFacility?.id === f.id && (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </button>
              ))}
              {facilities.length === 0 && <p className="text-slate-400 text-sm text-center py-4">등록된 시설이 없습니다. 관리자에게 문의하세요.</p>}
            </div>
          )}
        </div>
      )}

      {/* Step 2 - Template */}
      {selectedFacility && (
        <div className="card mb-4">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardDocumentListIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-700">점검표 선택</h2>
          </div>
          {loadingTemplates ? (
            <div className="flex justify-center py-6"><div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="grid gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${
                    selectedTemplate?.id === t.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{t.description} · {t.items.length}개 항목</p>
                  </div>
                  {selectedTemplate?.id === t.id && (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </button>
              ))}
              {templates.length === 0 && <p className="text-slate-400 text-sm text-center py-4">등록된 템플릿이 없습니다.</p>}
            </div>
          )}
        </div>
      )}

      {/* Step 3 - Start */}
      {selectedFacility && selectedTemplate && (
        <div className="card bg-blue-50 border border-blue-200">
          <p className="text-sm font-semibold text-blue-800 mb-3">점검 준비 완료</p>
          <div className="text-sm text-blue-700 space-y-1 mb-4">
            <p>시설: <span className="font-bold">{selectedFacility.name}</span></p>
            <p>점검표: <span className="font-bold">{selectedTemplate.name}</span></p>
            <p>항목 수: <span className="font-bold">{selectedTemplate.items.length}개</span></p>
          </div>
          <button
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isPending}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {startMutation.isPending ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>점검 시작<ArrowRightIcon className="w-4 h-4" /></>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
