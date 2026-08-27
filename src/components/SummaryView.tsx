import React, { useState } from 'react';
import { SapTransaction, BudgetEntry, Department, StandardCategory } from '../types';
import { DEPARTMENTS, STANDARD_CATEGORIES, INITIAL_MAPPINGS } from '../data/initialData';
import { Search, Filter, FileSpreadsheet, ArrowUpDown } from 'lucide-react';

interface SummaryViewProps {
  transactions: SapTransaction[];
  budgets: BudgetEntry[];
  selectedYear: number;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  transactions,
  budgets,
  selectedYear
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const currentYearTransactions = transactions.filter(t => t.year === selectedYear);
  const priorYearTransactions = transactions.filter(t => t.year === selectedYear - 1);
  const yearBudgets = budgets.filter(b => b.year === selectedYear);

  // Helper to calculate amounts for a specific department and standard category
  const calculateMetrics = (dept: Department, category: StandardCategory) => {
    // helper to check if transaction belongs to standard category via mapping
    const getCat = (accountCode: string, detailName: string) => {
      const match = INITIAL_MAPPINGS.find(m => m.accountCode === accountCode || m.detailAccountName === detailName);
      return match ? match.standardCategory : '기타';
    };

    // Current Year YTD (or full year if selectedYear-1)
    const currentActual = currentYearTransactions
      .filter(t => t.department === dept && getCat(t.accountCode, t.detailAccountName) === category)
      .reduce((sum, t) => sum + t.amount, 0);

    // Prior Year Same Period (or Prior Year Full Year)
    const priorActual = priorYearTransactions
      .filter(t => t.department === dept && getCat(t.accountCode, t.detailAccountName) === category)
      .reduce((sum, t) => sum + t.amount, 0);

    // Prior Year Full Year (total for 2025)
    const priorFullYear = priorYearTransactions
      .filter(t => t.department === dept && getCat(t.accountCode, t.detailAccountName) === category)
      .reduce((sum, t) => sum + t.amount, 0);

    // Budget
    const budgetEntry = yearBudgets.find(b => b.department === dept && b.standardCategory === category);
    const budget = budgetEntry ? budgetEntry.budgetAmount : 0;

    // YoY Diff & Rate
    const yoyDiff = currentActual - priorActual;
    const yoyRate = priorActual > 0 ? (yoyDiff / priorActual) * 100 : 0;

    // Progress Rate (진척률)
    const progressRate = budget > 0 ? (currentActual / budget) * 100 : 0;

    return {
      currentActual,
      priorActual,
      priorFullYear,
      budget,
      yoyDiff,
      yoyRate,
      progressRate
    };
  };

  // Filtered departments
  const filteredDepts = selectedDept === 'ALL' 
    ? DEPARTMENTS 
    : DEPARTMENTS.filter(d => d === selectedDept);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">부서별 x 계정과목별 통합 분석 표 (Summary)</h2>
            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-semibold">M365 Dynamic Matrix</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            연구소 표준 8대 대분류와 8개 부서 간의 교차 분석 및 예산 대비 진척률, YoY 증감액 자동 산정 테이블입니다. (단위: 천 원)
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <Filter className="w-4 h-4 text-slate-400 mr-2" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">전체 조직 보기 (8개 조직)</option>
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Excel-style Matrix Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold">
                <th className="py-3.5 px-4 sticky left-0 bg-slate-900 z-10 border-r border-slate-700">조직 구분</th>
                <th className="py-3.5 px-4 border-r border-slate-700">표준 계정과목</th>
                <th className="py-3.5 px-4 text-right border-r border-slate-700">당해 실적 (YTD)</th>
                <th className="py-3.5 px-4 text-right border-r border-slate-700">전년 동기 실적</th>
                <th className="py-3.5 px-4 text-right border-r border-slate-700">전년 연간 실적</th>
                <th className="py-3.5 px-4 text-right border-r border-slate-700">연간 예산 (Target)</th>
                <th className="py-3.5 px-4 text-right border-r border-slate-700">YoY 증감액</th>
                <th className="py-3.5 px-4 text-right border-r border-slate-700">YoY 증감률</th>
                <th className="py-3.5 px-4 text-right">예산 진척률</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {filteredDepts.map(dept => {
                // Dept subtotals
                let deptCurrent = 0;
                let deptPrior = 0;
                let deptPriorFull = 0;
                let deptBudget = 0;

                const catRows = STANDARD_CATEGORIES.map(cat => {
                  const m = calculateMetrics(dept, cat);
                  deptCurrent += m.currentActual;
                  deptPrior += m.priorActual;
                  deptPriorFull += m.priorFullYear;
                  deptBudget += m.budget;

                  return { cat, ...m };
                });

                const deptYoyDiff = deptCurrent - deptPrior;
                const deptYoyRate = deptPrior > 0 ? (deptYoyDiff / deptPrior) * 100 : 0;
                const deptProgress = deptBudget > 0 ? (deptCurrent / deptBudget) * 100 : 0;

                return (
                  <React.Fragment key={dept}>
                    {/* Department Header Row */}
                    <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                      <td className="py-2.5 px-4 sticky left-0 bg-slate-100 z-10 border-r border-slate-200 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                        {dept} ({dept === 'AEM' || dept === 'APD' || dept === 'CHP' || dept === 'CAM' || dept === 'FSM' ? '프로젝트 조직' : '지원 조직'})
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 italic">[소계]</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold">{deptCurrent.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-600">{deptPrior.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-600">{deptPriorFull.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-blue-700">{deptBudget.toLocaleString()}</td>
                      <td className={`py-2.5 px-4 text-right font-mono ${deptYoyDiff >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                        {deptYoyDiff >= 0 ? '▲ ' : '▼ '}{Math.abs(deptYoyDiff).toLocaleString()}
                      </td>
                      <td className={`py-2.5 px-4 text-right font-mono ${deptYoyRate >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                        {deptYoyRate >= 0 ? '+' : ''}{deptYoyRate.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono">
                        <span className={`px-2 py-0.5 rounded font-semibold ${deptProgress > 90 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {deptProgress.toFixed(1)}%
                        </span>
                      </td>
                    </tr>

                    {/* Standard Category Rows */}
                    {catRows.map(row => {
                      return (
                        <tr key={`${dept}-${row.cat}`} className="hover:bg-slate-50 transition text-slate-600">
                          <td className="py-2 px-4 sticky left-0 bg-white z-10 border-r border-slate-200 text-slate-400 pl-8">↳</td>
                          <td className="py-2 px-4 font-medium text-slate-800 border-r border-slate-200">{row.cat}</td>
                          <td className="py-2 px-4 text-right font-mono border-r border-slate-200 text-slate-900">{row.currentActual.toLocaleString()}</td>
                          <td className="py-2 px-4 text-right font-mono border-r border-slate-200">{row.priorActual.toLocaleString()}</td>
                          <td className="py-2 px-4 text-right font-mono border-r border-slate-200">{row.priorFullYear.toLocaleString()}</td>
                          <td className="py-2 px-4 text-right font-mono border-r border-slate-200 text-blue-600">{row.budget.toLocaleString()}</td>
                          <td className={`py-2 px-4 text-right font-mono border-r border-slate-200 ${row.yoyDiff >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                            {row.yoyDiff >= 0 ? '▲ ' : '▼ '}{Math.abs(row.yoyDiff).toLocaleString()}
                          </td>
                          <td className={`py-2 px-4 text-right font-mono border-r border-slate-200 ${row.yoyRate >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                            {row.yoyRate >= 0 ? '+' : ''}{row.yoyRate.toFixed(1)}%
                          </td>
                          <td className="py-2 px-4 text-right font-mono">
                            <span className={row.progressRate > 90 ? 'text-rose-600 font-semibold' : 'text-slate-700'}>
                              {row.progressRate.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
