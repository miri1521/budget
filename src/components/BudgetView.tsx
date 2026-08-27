import React, { useState } from 'react';
import { BudgetEntry, Department, StandardCategory, SapTransaction } from '../types';
import { DEPARTMENTS, STANDARD_CATEGORIES, INITIAL_MAPPINGS } from '../data/initialData';
import { Wallet, Save, RefreshCw, Calculator, CheckCircle2 } from 'lucide-react';

interface BudgetViewProps {
  budgets: BudgetEntry[];
  setBudgets: React.Dispatch<React.SetStateAction<BudgetEntry[]>>;
  transactions: SapTransaction[];
  selectedYear: number;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  budgets,
  setBudgets,
  transactions,
  selectedYear
}) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [growthRate, setGrowthRate] = useState<number>(6); // default 6% increase over prior year

  const yearBudgets = budgets.filter(b => b.year === selectedYear);

  const handleAmountChange = (department: Department, standardCategory: StandardCategory, newAmount: number) => {
    setBudgets(prev => {
      const existingIndex = prev.findIndex(b => b.year === selectedYear && b.department === department && b.standardCategory === standardCategory);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], budgetAmount: Math.max(0, newAmount) };
        return updated;
      } else {
        return [...prev, {
          id: `BUD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          year: selectedYear,
          department,
          standardCategory,
          budgetAmount: Math.max(0, newAmount)
        }];
      }
    });
    setSuccessMessage('예산 정보가 업데이트되었습니다.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAutoCalculate = () => {
    // calculate based on prior year actuals * (1 + growthRate/100)
    const priorYear = selectedYear - 1;
    const priorTransactions = transactions.filter(t => t.year === priorYear);

    setBudgets(prev => {
      const otherYearBudgets = prev.filter(b => b.year !== selectedYear);
      const newYearBudgets: BudgetEntry[] = [];
      let idCounter = 9000;

      DEPARTMENTS.forEach(dept => {
        STANDARD_CATEGORIES.forEach(cat => {
          const priorTotal = priorTransactions
            .filter(t => t.department === dept)
            .filter(t => {
              const mapping = INITIAL_MAPPINGS.find(m => m.accountCode === t.accountCode || m.detailAccountName === t.detailAccountName);
              return mapping?.standardCategory === cat;
            })
            .reduce((sum, t) => sum + t.amount, 0);

          const calculated = Math.round((priorTotal > 0 ? priorTotal : 12000) * (1 + growthRate / 100) / 10) * 10;

          newYearBudgets.push({
            id: `BUD-${selectedYear}-${idCounter++}`,
            year: selectedYear,
            department: dept,
            standardCategory: cat,
            budgetAmount: calculated
          });
        });
      });

      return [...otherYearBudgets, ...newYearBudgets];
    });

    setSuccessMessage(`전년 실적 기준 +${growthRate}% 자동 산정 완료되었습니다.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">{selectedYear}년 예산 및 기준 정보 관리 (Budget)</h2>
            <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-semibold">전년 연동 관리</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            전년도 실적 데이터를 기반으로 연간 예산을 자동 산정하거나 개별 항목을 직접 수정할 수 있습니다. (단위: 천 원)
          </p>
        </div>

        {/* Auto Calculate Controls */}
        <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-600 font-medium">증가율 (%):</span>
            <input 
              type="number" 
              value={growthRate} 
              onChange={(e) => setGrowthRate(Number(e.target.value))}
              className="w-16 bg-white border border-slate-300 rounded px-2 py-1 text-center font-bold text-slate-800"
            />
          </div>
          <button
            onClick={handleAutoCalculate}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition"
          >
            <Calculator className="w-4 h-4" />
            <span>전년 대비 일괄 산정</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-medium flex items-center shadow-sm">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
          {successMessage}
        </div>
      )}

      {/* Budget Matrix Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">부서별 x 8대 표준 계정과목 예산 설정 표 ({selectedYear}년)</h3>
          <span className="text-xs text-slate-500">셀을 직접 클릭하여 금액을 수정할 수 있습니다.</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold">
                <th className="py-3 px-4 sticky left-0 bg-slate-900 z-10 border-r border-slate-700">조직 구분</th>
                {STANDARD_CATEGORIES.map(cat => (
                  <th key={cat} className="py-3 px-3 text-right border-r border-slate-700">{cat}</th>
                ))}
                <th className="py-3 px-4 text-right bg-slate-950">조직별 합계</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {DEPARTMENTS.map(dept => {
                let deptTotal = 0;
                return (
                  <tr key={dept} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 sticky left-0 bg-white z-10 border-r border-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      {dept}
                    </td>
                    {STANDARD_CATEGORIES.map(cat => {
                      const entry = yearBudgets.find(b => b.department === dept && b.standardCategory === cat);
                      const amt = entry ? entry.budgetAmount : 0;
                      deptTotal += amt;

                      return (
                        <td key={cat} className="py-2 px-3 text-right border-r border-slate-200">
                          <input
                            type="number"
                            value={amt}
                            onChange={(e) => handleAmountChange(dept, cat, Number(e.target.value))}
                            className="w-24 text-right font-mono bg-slate-50 hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-blue-500 rounded px-2 py-1 text-slate-800 transition"
                          />
                        </td>
                      );
                    })}
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 bg-slate-50">
                      {deptTotal.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
