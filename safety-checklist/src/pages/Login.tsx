import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheckIcon, LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();
  const [error, setError] = useState('');

  const onSubmit = async (data: LoginForm) => {
    setError('');
    try {
      await login(data.email, data.password);
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-col bg-[#0f172a] relative overflow-hidden flex-shrink-0">
        {/* background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-[-120px] left-[-80px] w-[420px] h-[420px] bg-indigo-600/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-[-80px] right-[-60px] w-[320px] h-[320px] bg-indigo-500/15 rounded-full blur-[60px]" />
        </div>

        <div className="relative flex flex-col h-full px-12 py-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-glow">
              <ShieldCheckIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-lg">안전점검 시스템</span>
          </div>

          {/* Middle content */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="space-y-3 mb-10">
              {[
                { icon: '🏢', text: '학교·공공시설·공사현장 통합 관리' },
                { icon: '📋', text: '모바일로 어디서나 점검 수행' },
                { icon: '📄', text: '점검 완료 즉시 PDF 보고서 자동 생성' },
                { icon: '☁️', text: '클라우드 영구 보관 및 실시간 현황' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <span className="text-xl w-8 text-center">{icon}</span>
                  <span className="text-slate-300 text-sm">{text}</span>
                </div>
              ))}
            </div>

            <h1 className="text-4xl font-bold text-white leading-tight">
              시설 안전점검<br />
              <span className="text-indigo-400">디지털 전환</span>
            </h1>
            <p className="text-slate-400 mt-4 text-sm leading-relaxed">
              현장 점검자가 스마트폰으로 즉시 점검하고,<br />
              결과를 자동 보고서로 생성하는 스마트 플랫폼
            </p>
          </div>

          <p className="text-slate-600 text-xs">
            ⓒ 2026 시설 안전점검 시스템
          </p>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-lg">안전점검 시스템</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">로그인</h2>
            <p className="text-slate-500 text-sm mt-1">계정 정보를 입력해 주세요.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-group">
              <label className="label">이메일</label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  className="input-field pl-10"
                  placeholder="example@email.com"
                  {...register('email', { required: '이메일을 입력하세요' })}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="form-group">
              <label className="label">비밀번호</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  className="input-field pl-10"
                  placeholder="••••••••"
                  {...register('password', { required: '비밀번호를 입력하세요' })}
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                <span className="text-base">⚠️</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 text-base mt-2"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                '로그인'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-8">
            ⓒ 2026 시설 안전점검 시스템. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
