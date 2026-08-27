import React, { useState } from 'react';
import { SapTransaction, Department } from '../types';
import { DEPARTMENTS, INITIAL_MAPPINGS } from '../data/initialData';
import { Database, Plus, Search, Trash2, Edit3, X, FileText, Upload, Download } from 'lucide-react';

interface RawSapViewProps {
  transactions: SapTransaction[];
  setTransactions: React.Dispatch<React.SetStateAction<SapTransaction[]>>;
  selectedYear: number;
}

export const RawSapView: React.FC<RawSapViewProps> = ({
  transactions,
  setTransactions,
  selectedYear
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState<string>('ALL');
  const [filterMonth, setFilterMonth] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New transaction form state
  const [formDate, setFormDate] = useState(`${selectedYear}-01`);
  const [formDept, setFormDept] = useState<Department>('AEM');
  const [formAccountCode, setFormAccountCode] = useState(INITIAL_MAPPINGS[0].accountCode);
  const [formDetailName, setFormDetailName] = useState(INITIAL_MAPPINGS[0].detailAccountName);
  const [formAmount, setFormAmount] = useState(1000);
  const [formDescription, setFormDescription] = useState('월말 SAP 정산 집행');

  const handleAccountChange = (code: string) => {
    setFormAccountCode(code);
    const found = INITIAL_MAPPINGS.find(m => m.accountCode === code);
    if (found) {
      setFormDetailName(found.detailAccountName);
    }
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const year = Number(formDate.split('-')[0]);
    const month = Number(formDate.split('-')[1]);

    const newTx: SapTransaction = {
      id: `SAP-${year}-${Date.now().toString().slice(-5)}`,
      date: formDate,
      year,
      month,
      department: formDept,
      accountCode: formAccountCode,
      detailAccountName: formDetailName,
      amount: Number(formAmount),
      description: formDescription
    };

    setTransactions(prev => [newTx, ...prev]);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('해당 SAP 원본 거래 데이터를 삭제하시겠습니까?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter(t => {
    if (t.year !== selectedYear) return false;
    if (filterDept !== 'ALL' && t.department !== filterDept) return false;
    if (filterMonth !== 'ALL' && t.month !== Number(filterMonth)) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        t.id.toLowerCase().includes(term) ||
        t.detailAccountName.toLowerCase().includes(term) ||
        t.accountCode.toLowerCase().includes(term) ||
        (t.description && t.description.toLowerCase().includes(term))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">{selectedYear}년 SAP 원본 데이터 입력소 (Raw_SAP)</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold">Table 동적 연동</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            재무/기획 담당자가 월말 SAP에서 추출한 원본 데이터를 붙여넣거나 관리하는 공간입니다. (단위: 천 원)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>SAP 거래 추가</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="계정명, 코드, 설명 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 w-64"
            />
          </div>

          {/* Dept Filter */}
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium"
          >
            <option value="ALL">모든 조직 보기</option>
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Month Filter */}
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium"
          >
            <option value="ALL">모든 월 (1~12월)</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{m}월</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          총 <span className="font-bold text-slate-800">{filteredTransactions.length}</span>건의 SAP 거래 기록
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold">
                <th className="py-3 px-4">SAP 전표 ID</th>
                <th className="py-3 px-4">일자 (연/월)</th>
                <th className="py-3 px-4">부서</th>
                <th className="py-3 px-4">계정 코드</th>
                <th className="py-3 px-4">세부 계정과목명</th>
                <th className="py-3 px-4">적요 및 설명</th>
                <th className="py-3 px-4 text-right">금액 (K KRW)</th>
                <th className="py-3 px-4 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    조건에 일치하는 SAP 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredTransactions.slice(0, 100).map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">{t.id}</td>
                    <td className="py-3 px-4 font-mono">{t.date}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">{t.department}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{t.accountCode}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{t.detailAccountName}</td>
                    <td className="py-3 px-4 text-slate-500 truncate max-w-xs">{t.description || '-'}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{t.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">신규 SAP 거래 데이터 입력</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">일자 (연/월)</label>
                  <input
                    type="month"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">조직 (부서)</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value as Department)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">세부 계정과목 선택</label>
                <select
                  value={formAccountCode}
                  onChange={(e) => handleAccountChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
                >
                  {INITIAL_MAPPINGS.map(m => (
                    <option key={m.accountCode} value={m.accountCode}>
                      [{m.accountCode}] {m.detailAccountName} ({m.standardCategory})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">금액 (천 원 / K KRW)</label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">적요 / 비고</label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow transition"
                >
                  등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
