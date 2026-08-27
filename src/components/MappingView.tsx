import React, { useState } from 'react';
import { AccountMapping, StandardCategory } from '../types';
import { STANDARD_CATEGORIES } from '../data/initialData';
import { FileSpreadsheet, Plus, Search, Tag, CheckCircle2 } from 'lucide-react';

interface MappingViewProps {
  mappings: AccountMapping[];
  setMappings: React.Dispatch<React.SetStateAction<AccountMapping[]>>;
}

export const MappingView: React.FC<MappingViewProps> = ({
  mappings,
  setMappings
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newDetailName, setNewDetailName] = useState('');
  const [newAccountCode, setNewAccountCode] = useState('ACC-999');
  const [newCategory, setNewCategory] = useState<StandardCategory>('인건비');
  const [newDesc, setNewDesc] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAddMapping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDetailName.trim()) return;

    setMappings(prev => [
      ...prev,
      {
        detailAccountName: newDetailName,
        accountCode: newAccountCode,
        standardCategory: newCategory,
        description: newDesc
      }
    ]);

    setNewDetailName('');
    setNewDesc('');
    setSuccessMsg('신규 계정 매핑 규칙이 추가되었습니다.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const filteredMappings = mappings.filter(m => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      m.detailAccountName.toLowerCase().includes(term) ||
      m.accountCode.toLowerCase().includes(term) ||
      m.standardCategory.toLowerCase().includes(term) ||
      (m.description && m.description.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">세부 계정 매핑 기준표 (Mapping)</h2>
            <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-1 rounded-full font-semibold">XLOOKUP 연동</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            SAP의 복잡하고 다양한 세부 계정과목명을 연구소 표준 8대 대분류로 자동 매핑해주는 기준 테이블입니다.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-medium flex items-center shadow-sm">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Add New Mapping Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Tag className="w-4 h-4 text-indigo-600" />
          <span>신규 세부 계정 매핑 추가</span>
        </h3>
        <form onSubmit={handleAddMapping} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">계정 코드</label>
            <input
              type="text"
              value={newAccountCode}
              onChange={(e) => setNewAccountCode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">세부 계정과목명</label>
            <input
              type="text"
              placeholder="예: 특수 장비 소모품"
              value={newDetailName}
              onChange={(e) => setNewDetailName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">표준 8대 대분류</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as StandardCategory)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium"
            >
              {STANDARD_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">설명 및 비고</label>
            <input
              type="text"
              placeholder="매핑 설명"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow transition"
            >
              매핑 추가
            </button>
          </div>
        </form>
      </div>

      {/* Mapping Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="매핑 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 w-64"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">총 {filteredMappings.length}개 매핑 규칙</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold">
                <th className="py-3 px-4">계정 코드</th>
                <th className="py-3 px-4">세부 계정과목명 (SAP 원본)</th>
                <th className="py-3 px-4">표준 8대 대분류 (연동 결과)</th>
                <th className="py-3 px-4">설명 및 비고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredMappings.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">{m.accountCode}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{m.detailAccountName}</td>
                  <td className="py-3 px-4">
                    <span className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-md border border-indigo-200">
                      {m.standardCategory}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{m.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
