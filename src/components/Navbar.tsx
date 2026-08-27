import React from 'react';
import { ActiveSheet } from '../types';
import { 
  LayoutDashboard, 
  Table2, 
  TrendingUp, 
  Wallet, 
  Database, 
  FileSpreadsheet, 
  Sparkles, 
  RotateCcw,
  Download,
  LogOut,
  User,
  Settings,
  FileText
} from 'lucide-react';

interface NavbarProps {
  activeSheet: ActiveSheet;
  setActiveSheet: (sheet: ActiveSheet) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  onResetData: () => void;
  onOpenAiModal: () => void;
  onExportCsv: () => void;
  user: { email: string; id: string } | null;
  onLogout: () => void;
  onOpenConfig: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSheet,
  setActiveSheet,
  selectedYear,
  setSelectedYear,
  onResetData,
  onOpenAiModal,
  onExportCsv,
  user,
  onLogout,
  onOpenConfig
}) => {
  const tabs = [
    { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard, desc: '경영진 요약 대시보드' },
    { id: 'summary', label: '2. Summary', icon: Table2, desc: '부서별x계정 통합 분석' },
    { id: 'trend', label: '3. Trend', icon: TrendingUp, desc: '월별/분기 시계열 분석' },
    { id: 'budget', label: '4. Budget', icon: Wallet, desc: '예산 및 기준 관리' },
    { id: 'raw_sap', label: '5. Raw_SAP', icon: Database, desc: 'SAP 원본 데이터 입력소' },
    { id: 'mapping', label: '6. Mapping', icon: FileSpreadsheet, desc: '계정과목 매핑 기준' },
    { id: 'memo', label: '7. Memo', icon: FileText, desc: '연구원 비밀 메모장' },
  ];

  return (
    <header className="bg-slate-900 text-white shadow-md">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-600 text-white p-2 rounded-lg font-bold flex items-center justify-center shadow-inner">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">연구소 경상비용 분석 템플릿</h1>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">Supabase Auth 연동</span>
            </div>
            <p className="text-xs text-slate-400">Research Institute Operating Expenses Analysis & Monitoring System</p>
          </div>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex items-center space-x-3 flex-wrap">
          {/* Year Selector */}
          <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700 text-xs">
            <span className="px-2 text-slate-400 font-medium">분석 연도:</span>
            <button
              onClick={() => setSelectedYear(2025)}
              className={`px-3 py-1 rounded-md transition ${selectedYear === 2025 ? 'bg-emerald-600 text-white font-semibold shadow' : 'text-slate-300 hover:text-white'}`}
            >
              2025년
            </button>
            <button
              onClick={() => setSelectedYear(2026)}
              className={`px-3 py-1 rounded-md transition ${selectedYear === 2026 ? 'bg-emerald-600 text-white font-semibold shadow' : 'text-slate-300 hover:text-white'}`}
            >
              2026년
            </button>
          </div>

          {/* AI CFO Analysis Button */}
          <button
            onClick={onOpenAiModal}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow transition transform active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>AI CFO 분석</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCsv}
            title="현재 시트 CSV 내보내기"
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>내보내기</span>
          </button>

          {/* Reset Data */}
          <button
            onClick={onResetData}
            title="샘플 데이터 초기화"
            className="flex items-center space-x-1 bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>초기화</span>
          </button>

          {/* Supabase Config Button */}
          <button
            onClick={onOpenConfig}
            title="Supabase 설정"
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition"
          >
            <Settings className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supabase 설정</span>
          </button>

          {/* User Profile & Logout */}
          {user && (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-700">
              <div className="flex items-center space-x-1 text-xs text-slate-300 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono max-w-[120px] truncate">{user.email}</span>
              </div>
              <button
                onClick={onLogout}
                title="로그아웃"
                className="flex items-center space-x-1 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-medium border border-rose-500/30 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>로그아웃</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sheet Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto space-x-1 no-scrollbar py-2 bg-slate-950/60">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSheet === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSheet(tab.id as ActiveSheet)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <div className="text-left">
                <div className="font-semibold">{tab.label}</div>
              </div>
            </button>
          );
        })}
      </div>
    </header>
  );
};
