import React, { useState } from 'react';
import { ActiveSheet, SapTransaction, BudgetEntry, AccountMapping } from './types';
import { generateInitialTransactions, generateInitialBudgets, INITIAL_MAPPINGS } from './data/initialData';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { SummaryView } from './components/SummaryView';
import { TrendView } from './components/TrendView';
import { BudgetView } from './components/BudgetView';
import { RawSapView } from './components/RawSapView';
import { MappingView } from './components/MappingView';
import { AiInsightsModal } from './components/AiInsightsModal';

export default function App() {
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>('dashboard');
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  const [transactions, setTransactions] = useState<SapTransaction[]>(() => generateInitialTransactions());
  const [budgets, setBudgets] = useState<BudgetEntry[]>(() => generateInitialBudgets(generateInitialTransactions()));
  const [mappings, setMappings] = useState<AccountMapping[]>(INITIAL_MAPPINGS);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const handleResetData = () => {
    if (window.confirm('모든 SAP 원본 데이터와 예산 설정이 초기 샘플 상태로 리셋됩니다. 진행하시겠습니까?')) {
      const freshTx = generateInitialTransactions();
      setTransactions(freshTx);
      setBudgets(generateInitialBudgets(freshTx));
      setMappings(INITIAL_MAPPINGS);
      alert('초기화가 완료되었습니다.');
    }
  };

  const handleExportCsv = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    
    if (activeSheet === 'raw_sap') {
      csvContent += "ID,Date,Department,AccountCode,DetailName,Amount,Description\n";
      transactions.filter(t => t.year === selectedYear).forEach(t => {
        csvContent += `"${t.id}","${t.date}","${t.department}","${t.accountCode}","${t.detailAccountName}",${t.amount},"${t.description || ''}"\n`;
      });
    } else {
      csvContent += "Category,Department,Budget,Actual\n";
      budgets.filter(b => b.year === selectedYear).forEach(b => {
        csvContent += `"${b.standardCategory}","${b.department}",${b.budgetAmount},0\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Research_Institute_${activeSheet}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Navigation & Sheet Header */}
      <Navbar
        activeSheet={activeSheet}
        setActiveSheet={setActiveSheet}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        onResetData={handleResetData}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onExportCsv={handleExportCsv}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {activeSheet === 'dashboard' && (
          <DashboardView
            transactions={transactions}
            budgets={budgets}
            selectedYear={selectedYear}
          />
        )}
        {activeSheet === 'summary' && (
          <SummaryView
            transactions={transactions}
            budgets={budgets}
            selectedYear={selectedYear}
          />
        )}
        {activeSheet === 'trend' && (
          <TrendView
            transactions={transactions}
            selectedYear={selectedYear}
          />
        )}
        {activeSheet === 'budget' && (
          <BudgetView
            budgets={budgets}
            setBudgets={setBudgets}
            transactions={transactions}
            selectedYear={selectedYear}
          />
        )}
        {activeSheet === 'raw_sap' && (
          <RawSapView
            transactions={transactions}
            setTransactions={setTransactions}
            selectedYear={selectedYear}
          />
        )}
        {activeSheet === 'mapping' && (
          <MappingView
            mappings={mappings}
            setMappings={setMappings}
          />
        )}
      </main>

      {/* AI CFO Insights Modal */}
      <AiInsightsModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        transactions={transactions}
        budgets={budgets}
        selectedYear={selectedYear}
      />
    </div>
  );
}
