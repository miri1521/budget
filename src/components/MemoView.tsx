import React, { useState, useEffect } from 'react';
import { MemoItem, Department } from '../types';
import { getSupabaseClient, getSupabaseConfig } from '../lib/supabase';
import { FileText, Plus, Trash2, Edit2, ShieldCheck, Database, Calendar, Tag, Check, X, Sparkles, Copy, Code } from 'lucide-react';

interface MemoViewProps {
  user: { email: string; id: string };
}

export const MemoView: React.FC<MemoViewProps> = ({ user }) => {
  const [memos, setMemos] = useState<MemoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('AEM');
  const [selectedCategory, setSelectedCategory] = useState<string>('인건비');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const departments: Department[] = ['AEM', 'APD', 'CHP', 'CAM', 'FSM', '연구기획팀', '분석Part', 'TS팀'];
  const categories = ['인건비', '연구재료비', '시제품제작비', '외주용역비', '여비교통비', '회의/교육비', '감가상각비/유지보수비', '기타'];

  const sqlQueryText = `-- 1. 연구원 메모 테이블 생성
create table if not exists public.institute_memos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  content text not null,
  department text,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. 행 레벨 보안(RLS) 활성화
alter table public.institute_memos enable row level security;

-- 3. 본인 소유의 메모만 조회/수정/삭제할 수 있는 정책 생성
create policy "Users can only view their own memos"
  on public.institute_memos for select
  using (auth.uid() = user_id);

create policy "Users can insert their own memos"
  on public.institute_memos for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own memos"
  on public.institute_memos for update
  using (auth.uid() = user_id);

create policy "Users can delete their own memos"
  on public.institute_memos for delete
  using (auth.uid() = user_id);`;

  useEffect(() => {
    fetchMemos();
  }, [user.id]);

  const fetchMemos = async () => {
    setLoading(true);
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('institute_memos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase fetch memos error (falling back to local):', error.message);
          loadFromLocal();
        } else if (data) {
          setMemos(data);
        }
      } catch (err) {
        console.warn('Supabase not fully configured, using local storage.');
        loadFromLocal();
      }
    } else {
      loadFromLocal();
    }
    setLoading(false);
  };

  const loadFromLocal = () => {
    const saved = localStorage.getItem(`institute_memos_${user.id}`);
    if (saved) {
      try {
        setMemos(JSON.parse(saved));
      } catch (e) {
        setMemos([]);
      }
    } else {
      setMemos([
        {
          id: 'demo-memo-1',
          user_id: user.id,
          title: '2026년 1분기 AEM 부서 인건비 검토 메모',
          content: 'AEM 부서의 연구원 신규 채용에 따른 인건비 변동 사항 확인 완료. 예산 범위 내에서 정상 집행 중임.',
          department: 'AEM',
          category: '인건비',
          created_at: new Date().toISOString()
        }
      ]);
    }
  };

  const saveToLocal = (newMemos: MemoItem[]) => {
    setMemos(newMemos);
    localStorage.setItem(`institute_memos_${user.id}`, JSON.stringify(newMemos));
  };

  const handleSaveMemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const client = getSupabaseClient();
    const now = new Date().toISOString();

    if (client) {
      if (editingId) {
        const { error } = await client
          .from('institute_memos')
          .update({ title, content, department: selectedDept, category: selectedCategory })
          .eq('id', editingId)
          .eq('user_id', user.id);

        if (error) {
          alert('수정 실패: ' + error.message);
          return;
        }
      } else {
        const { error } = await client
          .from('institute_memos')
          .insert([{ user_id: user.id, title, content, department: selectedDept, category: selectedCategory, created_at: now }]);

        if (error) {
          alert('저장 실패 (테이블이 생성되었는지 확인해주세요): ' + error.message);
          // Fallback to local
          const newItem: MemoItem = {
            id: 'memo-' + Date.now(),
            user_id: user.id,
            title,
            content,
            department: selectedDept,
            category: selectedCategory,
            created_at: now
          };
          saveToLocal([newItem, ...memos]);
          resetForm();
          return;
        }
      }
      fetchMemos();
    } else {
      // Local fallback
      if (editingId) {
        const updated = memos.map(m => m.id === editingId ? { ...m, title, content, department: selectedDept, category: selectedCategory } : m);
        saveToLocal(updated);
      } else {
        const newItem: MemoItem = {
          id: 'memo-' + Date.now(),
          user_id: user.id,
          title,
          content,
          department: selectedDept,
          category: selectedCategory,
          created_at: now
        };
        saveToLocal([newItem, ...memos]);
      }
    }

    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setEditingId(null);
  };

  const handleEdit = (memo: MemoItem) => {
    setEditingId(memo.id);
    setTitle(memo.title);
    setContent(memo.content);
    if (memo.department) setSelectedDept(memo.department);
    if (memo.category) setSelectedCategory(memo.category);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('이 메모를 삭제하시겠습니까?')) return;

    const client = getSupabaseClient();
    if (client) {
      const { error } = await client
        .from('institute_memos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.warn('Supabase delete error, deleting local:', error.message);
      }
      fetchMemos();
    } else {
      const filtered = memos.filter(m => m.id !== id);
      saveToLocal(filtered);
    }
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlQueryText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 shadow-inner">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">연구원 전용 비밀 메모장</h2>
              <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                본인만 조회 가능 (RLS 보안)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">연구소 경상비용 분석 데이터와 연계하여 본인만의 비용 검토 및 분석 메모를 안전하게 기록하세요.</p>
          </div>
        </div>

        <button
          onClick={() => setShowSqlGuide(!showSqlGuide)}
          className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition border border-slate-200"
        >
          <Code className="w-4 h-4 text-indigo-600" />
          <span>Supabase SQL 가이드 보기</span>
        </button>
      </div>

      {/* SQL Guide Collapsible */}
      {showSqlGuide && (
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-xl border border-slate-700 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Supabase SQL Editor 실행 쿼리</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={copySqlToClipboard}
                className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? '복사 완료!' : 'SQL 복사'}</span>
              </button>
              <button
                onClick={() => setShowSqlGuide(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Supabase 대시보드의 <strong className="text-slate-200">SQL Editor</strong>에 접속하여 아래 쿼리를 실행하시면 행 레벨 보안(RLS)이 적용된 전용 메모 테이블이 생성됩니다.
          </p>
          <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto border border-slate-800 leading-relaxed">
            {sqlQueryText}
          </pre>
        </div>
      )}

      {/* Main Grid: Form & List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Memo Input / Edit Form */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>{editingId ? '메모 수정하기' : '새 메모 작성하기'}</span>
          </h3>

          <form onSubmit={handleSaveMemo} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">관련 부서</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
              >
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">비용 계정 분류</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">제목</label>
              <input
                type="text"
                placeholder="메모 제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">내용 (비밀 기록)</label>
              <textarea
                rows={5}
                placeholder="비용 분석 특이사항, 예산 절감 아이디어 등을 기록하세요..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 resize-none"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-xs transition"
                >
                  취소
                </button>
              )}
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-xs shadow transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{editingId ? '수정 완료' : '메모 저장'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Memo List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">내 메모 목록</h3>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                총 {memos.length}건
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              User ID: {user.email}
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-400 text-xs border border-slate-200">
              메모를 불러오는 중입니다...
            </div>
          ) : memos.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-2">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-medium text-slate-600">작성된 메모가 없습니다.</p>
              <p className="text-xs text-slate-400">좌측 입력폼을 통해 첫 번째 비용 분석 메모를 남겨보세요.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {memos.map((memo) => (
                <div 
                  key={memo.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:border-emerald-300 transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        {memo.department && (
                          <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-md font-semibold border border-emerald-200">
                            {memo.department}
                          </span>
                        )}
                        {memo.category && (
                          <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md font-medium border border-blue-200">
                            {memo.category}
                          </span>
                        )}
                        <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3" />
                          {new Date(memo.created_at).toLocaleDateString()} {new Date(memo.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 pt-1">{memo.title}</h4>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => handleEdit(memo)}
                        title="수정"
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-emerald-600 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(memo.id)}
                        title="삭제"
                        className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-500 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    {memo.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
