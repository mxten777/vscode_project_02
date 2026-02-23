import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInspection, updateInspection, getTemplates } from '../../firebase/firestore';
import { uploadInspectionPhoto } from '../../firebase/storage';
import type { Inspection, InspectionResult, CheckItem } from '../../types';
import { CameraIcon, XMarkIcon, CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function InspectionForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: inspection, isLoading, error } = useQuery({
    queryKey: ['inspection', id],
    queryFn: () => getInspection(id!),
    enabled: !!id,
  });

  const [results, setResults] = useState<Record<string, string | boolean | number>>({});
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (inspection) {
      const map: Record<string, string | boolean | number> = {};
      inspection.results.forEach((r) => { map[r.itemId] = r.value; });
      setResults(map);
      setPhotos(inspection.photos);
    }
  }, [inspection]);

  const saveMutation = useMutation({
    mutationFn: (status: 'in_progress' | 'submitted') => {
      const resultArr: InspectionResult[] = Object.entries(results).map(([itemId, value]) => ({ itemId, value }));
      return updateInspection(id!, { results: resultArr, photos, status });
    },
    onSuccess: (_, status) => {
      qc.invalidateQueries({ queryKey: ['inspection', id] });
      if (status === 'submitted') navigate(`/inspect/${id}`);
    },
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !id) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map((f) => uploadInspectionPhoto(id, f)));
      const newPhotos = [...photos, ...urls];
      setPhotos(newPhotos);
      await updateInspection(id, { photos: newPhotos });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = async (url: string) => {
    const newPhotos = photos.filter((p) => p !== url);
    setPhotos(newPhotos);
    await updateInspection(id!, { photos: newPhotos });
  };

  const handleSubmit = () => {
    if (!inspection) return;
    const unanswered = inspection.results.length === 0 && Object.keys(results).length === 0;
    if (unanswered && inspection.results.length === 0) {
      if (!confirm('일부 항목이 미입력 상태입니다. 제출하시겠습니까?')) return;
    }
    if (!confirm('점검을 제출하시겠습니까? 제출 후 수정이 불가합니다.')) return;
    saveMutation.mutate('submitted');
  };

  const renderItem = (item: CheckItem) => {
    const val = results[item.id];

    if (item.type === 'checkbox') {
      return (
        <button
          key={item.id}
          onClick={() => setResults((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
          className={`flex items-center gap-3 p-4 rounded-xl border-2 w-full text-left transition-all ${
            val ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${val ? 'border-green-500 bg-green-500' : 'border-slate-300'}`}>
            {val && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
          </div>
          <span className={`text-sm font-medium ${val ? 'text-green-800' : 'text-slate-700'}`}>{item.title}</span>
        </button>
      );
    }

    if (item.type === 'text') {
      return (
        <div key={item.id} className="p-4 rounded-xl border-2 border-slate-200">
          <label className="label">{item.title}</label>
          <textarea
            className="input-field resize-none"
            rows={2}
            placeholder="내용을 입력하세요"
            value={String(val ?? '')}
            onChange={(e) => setResults((prev) => ({ ...prev, [item.id]: e.target.value }))}
          />
        </div>
      );
    }

    if (item.type === 'number') {
      return (
        <div key={item.id} className="p-4 rounded-xl border-2 border-slate-200">
          <label className="label">{item.title}</label>
          <input
            type="number"
            className="input-field"
            placeholder="숫자를 입력하세요"
            value={String(val ?? '')}
            onChange={(e) => setResults((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))}
          />
        </div>
      );
    }

    return null;
  };

  if (isLoading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (error || !inspection) return <div className="card text-center py-16 text-red-500">점검 정보를 불러올 수 없습니다.</div>;
  if (inspection.status === 'submitted') {
    navigate(`/inspect/${id}`);
    return null;
  }

  // We need to get template items - store them on inspection or fetch separately
  // Since we stored templateId, we need to fetch the template
  return <InspectionFormContent inspection={inspection} results={results} photos={photos} uploading={uploading} fileInputRef={fileInputRef} onPhotoUpload={handlePhotoUpload} onRemovePhoto={removePhoto} onSave={() => saveMutation.mutate('in_progress')} onSubmit={handleSubmit} saving={saveMutation.isPending} renderItem={renderItem} />;
}

// ─── Inner Component ──────────────────────────────────────────────────────
function InspectionFormContent({
  inspection,
  results,
  photos,
  uploading,
  fileInputRef,
  onPhotoUpload,
  onRemovePhoto,
  onSave,
  onSubmit,
  saving,
  renderItem,
}: {
  inspection: Inspection;
  results: Record<string, string | boolean | number>;
  photos: string[];
  uploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (url: string) => void;
  onSave: () => void;
  onSubmit: () => void;
  saving: boolean;
  renderItem: (item: CheckItem) => React.ReactNode;
}) {
  const navigate = useNavigate();

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates,
  });

  const template = templates.find((t) => t.id === inspection.templateId);
  const items = template?.items ?? [];
  const answeredCount = Object.keys(results).filter((k) => {
    const v = results[k];
    return v !== '' && v !== undefined && v !== null;
  }).length;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/inspect')} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><ArrowLeftIcon className="w-5 h-5" /></button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{inspection.facilityName}</h1>
          <p className="text-slate-500 text-sm">{inspection.templateName} · {inspection.date}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="card mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-600 font-medium">점검 진행률</span>
          <span className="font-bold text-blue-600">{answeredCount} / {items.length}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: items.length > 0 ? `${(answeredCount / items.length) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3 mb-6">
        {items.length === 0 && <div className="card text-center text-slate-400 py-8">템플릿 정보를 불러오는 중...</div>}
        {items.map((item) => renderItem(item))}
      </div>

      {/* Photos */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-700">사진 등록</h2>
          <span className="text-xs text-slate-500">{photos.length}장</span>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onPhotoUpload} />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl py-4 flex flex-col items-center gap-2 text-slate-500 hover:text-blue-600 transition-all"
        >
          {uploading ? (
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <CameraIcon className="w-8 h-8" />
              <span className="text-sm">사진을 추가하세요</span>
            </>
          )}
        </button>

        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {photos.map((url) => (
              <div key={url} className="relative group aspect-square">
                <img src={url} alt="점검 사진" className="w-full h-full object-cover rounded-lg" />
                <button
                  onClick={() => onRemovePhoto(url)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={onSave} disabled={saving} className="btn-secondary flex-1">
          {saving ? '저장 중...' : '임시 저장'}
        </button>
        <button onClick={onSubmit} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
          <CheckCircleIcon className="w-4 h-4" />
          {saving ? '제출 중...' : '점검 제출'}
        </button>
      </div>
    </div>
  );
}
