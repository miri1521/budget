import React, { useState } from 'react';
import { SapTransaction, BudgetEntry } from '../types';
import { Sparkles, X, Loader2, Bot, ArrowRight } from 'lucide-react';
import Markdown from 'react-markdown';

interface AiInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: SapTransaction[];
  budgets: BudgetEntry[];
  selectedYear: number;
}

export const AiInsightsModal: React.FC<AiInsightsModalProps> = ({
  isOpen,
  onClose,
  transactions,
  budgets,
  selectedYear
}) => {
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const currentYearTransactions = transactions.filter(t => t.year === selectedYear);
      const totalActual = currentYearTransactions.reduce((sum, t) => sum + t.amount, 0);
      const yearBudgets = budgets.filter(b => b.year === selectedYear);
      const totalBudget = yearBudgets.reduce((sum, b) => sum + b.budgetAmount, 0);
      const burnRate = totalBudget > 0 ? ((totalActual / totalBudget) * 100).toFixed(1) : '0.0';

      const res = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summaryData: {
            year: selectedYear,
            totalActual,
            totalBudget,
            burnRate,
            departmentCount: 8
          },
          totalBudget,
          totalActual,
          burnRate
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI 분석 생성 중 오류가 발생했습니다.');
      }

      setAnalysisResult(data.analysis);
    } catch (err: any) {
      setError(err.message || 'AI 서버 통신 오류');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/30">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">AI CFO 경영 분석 및 리포트</h3>
              <p className="text-xs text-indigo-200">연구소 경상비용 집행 자동 진단 및 전략적 권고안</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {!analysisResult && !loading && (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto">
                <h4 className="text-base font-bold text-slate-900">AI 경영 컨설턴트를 호출하시겠습니까?</h4>
                <p className="text-xs text-slate-500 mt-1">
                  현재 입력된 {selectedYear}년 SAP 원본 데이터와 예산 대비 소진율을 종합 분석하여 경영진 보고용 전문 리포트를 생성합니다.
                </p>
              </div>
              <button
                onClick={handleRunAnalysis}
                className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-md transition"
              >
                <span>AI 리포트 생성 시작</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-16 space-y-4">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
              <p className="text-sm font-medium text-slate-700">Gemini AI가 연구소 경상비용 데이터를 분석 중입니다...</p>
              <p className="text-xs text-slate-400">약 3~5초 소요됩니다.</p>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs">
              {error}
            </div>
          )}

          {analysisResult && (
            <div className="space-y-4">
              <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-900">✨ Gemini AI 경영 분석 완료</span>
                <button
                  onClick={handleRunAnalysis}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline"
                >
                  다시 분석하기
                </button>
              </div>
              <div className="markdown-body text-xs text-slate-700 leading-relaxed space-y-3 bg-slate-50 p-6 rounded-xl border border-slate-200">
                <Markdown>{analysisResult}</Markdown>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
