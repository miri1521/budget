export type Department = 
  | 'AEM' 
  | 'APD' 
  | 'CHP' 
  | 'CAM' 
  | 'FSM' 
  | '연구기획팀' 
  | '분석Part' 
  | 'TS팀';

export type StandardCategory = 
  | '인건비' 
  | '연구재료비' 
  | '시제품제작비' 
  | '외주용역비' 
  | '여비교통비' 
  | '회의/교육비' 
  | '감가상각비/유지보수비' 
  | '기타';

export interface SapTransaction {
  id: string;
  date: string; // 'YYYY-MM' (e.g., '2026-03' or '2025-05')
  year: number; // 2025 or 2026
  month: number; // 1-12
  department: Department;
  accountCode: string; // e.g. 'ACC-101'
  detailAccountName: string; // e.g. '연구원 기본급'
  amount: number; // in K KRW (천 원 단위)
  description?: string;
}

export interface AccountMapping {
  detailAccountName: string;
  accountCode: string;
  standardCategory: StandardCategory;
  description?: string;
}

export interface BudgetEntry {
  id: string;
  year: number;
  department: Department;
  standardCategory: StandardCategory;
  budgetAmount: number; // in K KRW
}

export type ActiveSheet = 
  | 'dashboard' 
  | 'summary' 
  | 'trend' 
  | 'budget' 
  | 'raw_sap' 
  | 'mapping'
  | 'memo';

export interface MemoItem {
  id: string;
  user_id: string;
  title: string;
  content: string;
  department?: string;
  category?: string;
  created_at: string;
}
