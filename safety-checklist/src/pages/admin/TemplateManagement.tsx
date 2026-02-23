import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { getTemplates, addTemplate, updateTemplate, deleteTemplate } from '../../firebase/firestore';
import type { Template, CheckItem, CheckItemType } from '../../types';
import { PlusIcon, TrashIcon, XMarkIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

type TemplateForm = {
  name: string;
  description: string;
  items: { title: string; type: CheckItemType }[];
};

const ITEM_TYPES: { value: CheckItemType; label: string }[] = [
  { value: 'checkbox', label: '체크박스' },
  { value: 'text', label: '텍스트' },
  { value: 'number', label: '숫자' },
];

export default function TemplateManagement() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates,
  });

  const { register, handleSubmit, control, reset, formState: { isSubmitting } } = useForm<TemplateForm>({
    defaultValues: { items: [{ title: '', type: 'checkbox' }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const addMutation = useMutation({
    mutationFn: (data: Omit<Template, 'id' | 'createdAt'>) => addTemplate(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['templates'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Template, 'id' | 'createdAt'>> }) => updateTemplate(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['templates'] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  });

  const openAdd = () => {
    reset({ name: '', description: '', items: [{ title: '', type: 'checkbox' }] });
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (t: Template) => {
    reset({
      name: t.name,
      description: t.description,
      items: t.items.map(({ title, type }) => ({ title, type })),
    });
    setEditing(t);
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); };

  const onSubmit = (data: TemplateForm) => {
    const items: CheckItem[] = data.items.map((item, idx) => ({
      id: `item_${idx + 1}`,
      title: item.title,
      type: item.type,
    }));
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: { ...data, items } });
    } else {
      addMutation.mutate({ ...data, items });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">점검표 템플릿 관리</h1>
          <p className="text-slate-500 text-sm mt-1">점검 양식 템플릿을 관리합니다.</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> 템플릿 추가
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : templates.length === 0 ? (
        <div className="card text-center py-16 text-slate-400">등록된 템플릿이 없습니다.</div>
      ) : (
        <div className="grid gap-4">
          {templates.map((t) => (
            <div key={t.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800">{t.name}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{t.description}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(t)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"><PencilSquareIcon className="w-4 h-4" /></button>
                  <button onClick={() => { if (confirm('삭제하시겠습니까?')) deleteMutation.mutate(t.id); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><TrashIcon className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {t.items.map((item) => (
                  <span key={item.id} className="badge bg-slate-100 text-slate-600 py-1 px-3">
                    {item.title}
                    <span className="ml-1 text-slate-400 text-xs">({item.type === 'checkbox' ? '체크' : item.type === 'text' ? '텍스트' : '숫자'})</span>
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">총 {t.items.length}개 항목</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-800">{editing ? '템플릿 수정' : '템플릿 추가'}</h2>
              <button onClick={closeModal}><XMarkIcon className="w-5 h-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="label">템플릿명</label>
                <input className="input-field" placeholder="예) 학교 안전점검" {...register('name', { required: true })} />
              </div>
              <div>
                <label className="label">설명</label>
                <input className="input-field" placeholder="간단한 설명을 입력하세요" {...register('description')} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0">점검 항목</label>
                  <button
                    type="button"
                    onClick={() => append({ title: '', type: 'checkbox' })}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    <PlusIcon className="w-3.5 h-3.5" /> 항목 추가
                  </button>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {fields.map((field, idx) => (
                    <div key={field.id} className="flex gap-2 items-center">
                      <input
                        className="input-field flex-1"
                        placeholder={`항목 ${idx + 1}`}
                        {...register(`items.${idx}.title`, { required: true })}
                      />
                      <select className="input-field w-28" {...register(`items.${idx}.type`)}>
                        {ITEM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      {fields.length > 1 && (
                        <button type="button" onClick={() => remove(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">취소</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
                  {isSubmitting ? '저장 중...' : editing ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
