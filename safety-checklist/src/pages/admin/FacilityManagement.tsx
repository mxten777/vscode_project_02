import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { getFacilities, addFacility, updateFacility, deleteFacility } from '../../firebase/firestore';
import type { Facility, FacilityType } from '../../types';
import { PlusIcon, PencilSquareIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

type FacilityForm = Omit<Facility, 'id' | 'createdAt'>;

const FACILITY_TYPES: FacilityType[] = ['학교', '공공시설', '공사현장'];

export default function FacilityManagement() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Facility | null>(null);

  const { data: facilities = [], isLoading } = useQuery({
    queryKey: ['facilities'],
    queryFn: getFacilities,
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FacilityForm>();

  const addMutation = useMutation({
    mutationFn: addFacility,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['facilities'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FacilityForm> }) => updateFacility(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['facilities'] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFacility,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['facilities'] }),
  });

  const openAdd = () => { reset({ type: '학교' }); setEditing(null); setShowModal(true); };
  const openEdit = (f: Facility) => {
    reset({ name: f.name, type: f.type, address: f.address, managerName: f.managerName, phone: f.phone });
    setEditing(f);
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); reset(); };

  const onSubmit = (data: FacilityForm) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      addMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('시설을 삭제하시겠습니까?')) deleteMutation.mutate(id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">시설 관리</h1>
          <p className="text-slate-500 text-sm mt-1">점검 대상 시설을 등록·관리합니다.</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> 시설 등록
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : facilities.length === 0 ? (
        <div className="card text-center py-16 text-slate-400">등록된 시설이 없습니다.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {facilities.map((f) => (
            <div key={f.id} className="card flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`badge mb-2 ${
                    f.type === '학교' ? 'bg-blue-100 text-blue-700' :
                    f.type === '공공시설' ? 'bg-purple-100 text-purple-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>{f.type}</span>
                  <h3 className="text-base font-bold text-slate-800">{f.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(f)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"><PencilSquareIcon className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(f.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><TrashIcon className="w-4 h-4" /></button>
                </div>
              </div>
              <p className="text-sm text-slate-500">{f.address}</p>
              <p className="text-sm text-slate-600">담당자: <span className="font-medium">{f.managerName}</span> · {f.phone}</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-800">{editing ? '시설 수정' : '시설 등록'}</h2>
              <button onClick={closeModal}><XMarkIcon className="w-5 h-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="label">시설명</label>
                <input className="input-field" placeholder="예) 강남초등학교" {...register('name', { required: '시설명을 입력하세요' })} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="label">시설 종류</label>
                <select className="input-field" {...register('type', { required: true })}>
                  {FACILITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">주소</label>
                <input className="input-field" placeholder="예) 서울시 강남구 테헤란로 1" {...register('address', { required: '주소를 입력하세요' })} />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">담당자명</label>
                  <input className="input-field" placeholder="홍길동" {...register('managerName', { required: true })} />
                </div>
                <div>
                  <label className="label">연락처</label>
                  <input className="input-field" placeholder="010-0000-0000" {...register('phone', { required: true })} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">취소</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
                  {isSubmitting ? '저장 중...' : editing ? '수정' : '등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
