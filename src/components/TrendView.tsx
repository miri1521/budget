import React from 'react';
import { SapTransaction } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, Calendar, BarChart2 } from 'lucide-react';

interface TrendViewProps {
  transactions: SapTransaction[];
  selectedYear: number;
}

export const TrendView: React.FC<TrendViewProps> = ({
  transactions,
  selectedYear
}) => {
  const currentYearTransactions = transactions.filter(t => t.year === selectedYear);
  const priorYearTransactions = transactions.filter(t => t.year === selectedYear - 1);

  // Monthly table and chart data (1-12)
  const monthlyTrends = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const curAmount = currentYearTransactions
      .filter(t => t.month === m)
      .reduce((sum, t) => sum + t.amount, 0);

    const priorAmount = priorYearTransactions
      .filter(t => t.month === m)
      .reduce((sum, t) => sum + t.amount, 0);

    const diff = curAmount - priorAmount;
    const rate = priorAmount > 0 ? (diff / priorAmount) * 100 : 0;

    return {
      month: `${m}월`,
      monthNum: m,
      current: curAmount,
      prior: priorAmount,
      diff,
      rate
    };
  });

  // Quarterly cumulative flow
  const quarters = [
    { q: 'Q1 (1~3월)', months: [1, 2, 3] },
    { q: 'Q2 (4~6월)', months: [4, 5, 6] },
    { q: 'Q3 (7~9월)', months: [7, 8, 9] },
    { q: 'Q4 (10~12월)', months: [10, 11, 12] }
  ];

  const quarterlyData = quarters.map(qObj => {
    const curQ = currentYearTransactions
      .filter(t => qObj.months.includes(t.month))
      .reduce((sum, t) => sum + t.amount, 0);

    const priorQ = priorYearTransactions
      .filter(t => qObj.months.includes(t.month))
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      quarter: qObj.q,
      당해년도: curQ,
      전년동기: priorQ,
      증감액: curQ - priorQ
    };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">시계열 분석 (Trend Analysis)</h2>
            <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-1 rounded-full font-semibold">월별 및 분기 흐름</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            1월부터 12월까지의 월별 경상비용 집행 추이와 분기별 누적 흐름을 전년 동기 실적과 비교 분석합니다. (단위: 천 원)
          </p>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">{selectedYear}년 vs {selectedYear - 1}년 월별 집행 비교</h3>
          <span className="text-xs text-slate-500 font-medium">단위: 천 원 (K KRW)</span>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrends} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(val: any) => [`${Number(val).toLocaleString()} 천 원`, '']} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="prior" fill="#94a3b8" name={`${selectedYear - 1}년 실적`} radius={[4, 4, 0, 0]} />
              <Bar dataKey="current" fill="#059669" name={`${selectedYear}년 실적`} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quarterly Cumulative Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">분기별 누적 경상비용 흐름</h3>
            <span className="text-xs text-slate-500">Q1 ~ Q4</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">분기 구분</th>
                  <th className="py-3 px-4 text-right">{selectedYear - 1}년 실적</th>
                  <th className="py-3 px-4 text-right">{selectedYear}년 실적</th>
                  <th className="py-3 px-4 text-right">YoY 증감액</th>
                  <th className="py-3 px-4 text-right">증감률 (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {quarterlyData.map(q => {
                  const rate = q.전년동기 > 0 ? (q.증감액 / q.전년동기) * 100 : 0;
                  const isInc = q.증감액 >= 0;

                  return (
                    <tr key={q.quarter} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">{q.quarter}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">{q.전년동기.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{q.당해년도.toLocaleString()}</td>
                      <td className={`py-3 px-4 text-right font-mono ${isInc ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {isInc ? '▲ ' : '▼ '}{Math.abs(q.증감액).toLocaleString()}
                      </td>
                      <td className={`py-3 px-4 text-right font-mono font-medium ${isInc ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {isInc ? '+' : ''}{rate.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Detailed Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">월별 집행 상세 및 YoY 증감</h3>
            <span className="text-xs text-slate-500">1월 ~ 12월</span>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-100 z-10">
                <tr className="text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-4">월</th>
                  <th className="py-2.5 px-4 text-right">{selectedYear - 1}년</th>
                  <th className="py-2.5 px-4 text-right">{selectedYear}년</th>
                  <th className="py-2.5 px-4 text-right">증감액</th>
                  <th className="py-2.5 px-4 text-right">증감률</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {monthlyTrends.map(m => {
                  const isInc = m.diff >= 0;
                  return (
                    <tr key={m.month} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{m.month}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-500">{m.prior.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{m.current.toLocaleString()}</td>
                      <td className={`py-2.5 px-4 text-right font-mono ${isInc ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {isInc ? '▲ ' : '▼ '}{Math.abs(m.diff).toLocaleString()}
                      </td>
                      <td className={`py-2.5 px-4 text-right font-mono ${isInc ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {isInc ? '+' : ''}{m.rate.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
