import React, { useState } from 'react';
import { getSupabaseClient, getSupabaseConfig } from '../lib/supabase';
import { Lock, Mail, User, ArrowRight, Loader2, Database, ShieldCheck, Sparkles, Settings } from 'lucide-react';
import { SupabaseConfigModal } from './SupabaseConfigModal';

interface AuthViewProps {
  onLoginSuccess: (user: { email: string; id: string }) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const config = getSupabaseConfig();
  const isConfigured = Boolean(config.url && config.anonKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const client = getSupabaseClient();
    if (!client) {
      setError('Supabase URL 및 Anon Key가 설정되지 않았습니다. 우측 상단 "Supabase 설정"을 통해 파라미터를 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await client.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        if (data.user) {
          alert('회원가입이 완료되었습니다. 이메일 인증이 필요할 수 있습니다. 로그인해주세요.');
          setIsSignUp(false);
        }
      } else {
        const { data, error: signInError } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        if (data.user) {
          onLoginSuccess({
            email: data.user.email || email,
            id: data.user.id
          });
        }
      }
    } catch (err: any) {
      setError(err.message || '인증 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    onLoginSuccess({
      email: 'researcher@institute.re.kr',
      id: 'demo-user-id-001'
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top right config button */}
      <div className="absolute top-6 right-6">
        <button
          onClick={() => setIsConfigModalOpen(true)}
          className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-700 shadow transition"
        >
          <Settings className="w-4 h-4 text-emerald-400" />
          <span>Supabase 설정</span>
          {!isConfigured && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>}
        </button>
      </div>

      <div className="max-w-md w-full bg-slate-800/90 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className="p-8 text-center border-b border-slate-700/60 bg-gradient-to-b from-slate-800 to-slate-900">
          <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-600/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">연구소 경상비용 분석 시스템</h1>
          <p className="text-xs text-slate-400 mt-1">Research Institute Expenses Management & Supabase Auth</p>
          
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-700/60 border border-slate-600 text-slate-300">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supabase 연동 상태:</span>
            <span className={isConfigured ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {isConfigured ? '연결 준비됨' : '설정 필요'}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">이메일 계정</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                placeholder="user@institute.re.kr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">비밀번호</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition flex items-center justify-center space-x-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? 'Supabase 회원가입' : '로그인'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-slate-400 hover:text-emerald-400 transition"
            >
              {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? Supabase 회원가입'}
            </button>
          </div>

          {/* Quick Demo Access */}
          <div className="pt-4 border-t border-slate-700 text-center">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 py-2.5 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>데모 계정으로 바로 체험하기 (Quick Access)</span>
            </button>
          </div>
        </form>
      </div>

      <SupabaseConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onConfigSaved={() => {}}
      />
    </div>
  );
};
