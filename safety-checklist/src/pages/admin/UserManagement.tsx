import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllUsers, setUserDoc } from '../../firebase/firestore';
import type { AppUser, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export default function UserManagement() {
  const { appUser: me } = useAuth();
  const qc = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
  });

  const updateRole = useMutation({
    mutationFn: ({ user, role }: { user: AppUser; role: UserRole }) =>
      setUserDoc({ ...user, role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">사용자 관리</h1>
        <p className="text-slate-500 text-sm mt-1">사용자 권한을 관리합니다.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="card divide-y divide-slate-100">
          {users.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-8">사용자가 없습니다.</p>
          )}
          {users.map((u) => (
            <div key={u.uid} className="flex items-center justify-between py-3 px-1">
              <div>
                <p className="text-sm font-semibold text-slate-800">{u.displayName || u.email}</p>
                <p className="text-xs text-slate-500">{u.email}</p>
              </div>
              <select
                disabled={u.uid === me?.uid}
                value={u.role}
                onChange={(e) => updateRole.mutate({ user: u, role: e.target.value as UserRole })}
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="inspector">점검자</option>
                <option value="admin">관리자</option>
              </select>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 card bg-blue-50 border border-blue-200">
        <p className="text-xs text-blue-800 font-semibold mb-1">신규 사용자 등록 안내</p>
        <p className="text-xs text-blue-700">
          Firebase Console → Authentication → Add user 메뉴에서 이메일/비밀번호로 사용자를 추가한 후,<br />
          해당 사용자가 최초 로그인하면 자동으로 목록에 표시됩니다.
        </p>
      </div>
    </div>
  );
}
