import { Department, StandardCategory, SapTransaction, AccountMapping, BudgetEntry } from '../types';

export const DEPARTMENTS: Department[] = [
  'AEM', 'APD', 'CHP', 'CAM', 'FSM', '연구기획팀', '분석Part', 'TS팀'
];

export const STANDARD_CATEGORIES: StandardCategory[] = [
  '인건비',
  '연구재료비',
  '시제품제작비',
  '외주용역비',
  '여비교통비',
  '회의/교육비',
  '감가상각비/유지보수비',
  '기타'
];

export const INITIAL_MAPPINGS: AccountMapping[] = [
  // 인건비
  { detailAccountName: '연구원 기본급', accountCode: 'ACC-101', standardCategory: '인건비', description: '정규직 연구원 기본 급여' },
  { detailAccountName: '연구수당 및 상여', accountCode: 'ACC-102', standardCategory: '인건비', description: '성과급 및 연구수당' },
  { detailAccountName: '4대보험 회사부담금', accountCode: 'ACC-103', standardCategory: '인건비', description: '국민연금, 건강보험 등 법정부담금' },
  
  // 연구재료비
  { detailAccountName: '화학시약 및 소모품', accountCode: 'ACC-201', standardCategory: '연구재료비', description: '실험실 시약 및 소모품 구입' },
  { detailAccountName: '특수소재 및 원재료', accountCode: 'ACC-202', standardCategory: '연구재료비', description: '프로젝트 투입 원재료' },
  { detailAccountName: '전자부품 및 키트', accountCode: 'ACC-203', standardCategory: '연구재료비', description: '하드웨어 개발용 부품' },

  // 시제품제작비
  { detailAccountName: '금형 및 치공구 제작', accountCode: 'ACC-301', standardCategory: '시제품제작비', description: '시제품 양산용 금형 제작' },
  { detailAccountName: '외부 가공비', accountCode: 'ACC-302', standardCategory: '시제품제작비', description: '시제품 3D 프린팅 및 가공 외주' },

  // 외주용역비
  { detailAccountName: '시험분석 용역비', accountCode: 'ACC-401', standardCategory: '외주용역비', description: '공인기관 시험성적 및 분석 의뢰' },
  { detailAccountName: '소프트웨어 개발 외주', accountCode: 'ACC-402', standardCategory: '외주용역비', description: '외부 IT 용역 및 컨설팅' },

  // 여비교통비
  { detailAccountName: '국내 출장 여비', accountCode: 'ACC-501', standardCategory: '여비교통비', description: '국내 학회 및 현장 출장 KTX/숙박' },
  { detailAccountName: '해외 출장 여비', accountCode: 'ACC-502', standardCategory: '여비교통비', description: '해외 파트너 미팅 및 전시회 참관' },

  // 회의/교육비
  { detailAccountName: '사내외 직무 교육비', accountCode: 'ACC-601', standardCategory: '회의/교육비', description: '연구원 전문성 강화 교육' },
  { detailAccountName: '세미나 및 회의비', accountCode: 'ACC-602', standardCategory: '회의/교육비', description: '부서 워크샵 및 프로젝트 회의' },

  // 감가상각비/유지보수비
  { detailAccountName: '연구장비 감가상각', accountCode: 'ACC-701', standardCategory: '감가상각비/유지보수비', description: '고가 연구장비 감가상각' },
  { detailAccountName: '장비 유지보수 및 교정', accountCode: 'ACC-702', standardCategory: '감가상각비/유지보수비', description: '장비 정기 점검 및 수리' },

  // 기타
  { detailAccountName: '도서 및 인쇄비', accountCode: 'ACC-801', standardCategory: '기타', description: '전문 도서 및 보고서 인쇄' },
  { detailAccountName: '잡비 및 기타운영비', accountCode: 'ACC-802', standardCategory: '기타', description: '기타 부서 운영 잡비' }
];

// Generate realistic mock SAP transactions for 2025 (Full year) and 2026 (Jan-Aug YTD)
export const generateInitialTransactions = (): SapTransaction[] => {
  const transactions: SapTransaction[] = [];
  let idCounter = 1000;

  const deptWeights: Record<Department, number> = {
    AEM: 1.4,
    APD: 1.2,
    CHP: 1.3,
    CAM: 1.1,
    FSM: 1.0,
    연구기획팀: 0.8,
    분석Part: 0.9,
    TS팀: 0.9
  };

  const catBaseAmounts: Record<StandardCategory, number> = {
    '인건비': 12000,
    '연구재료비': 8500,
    '시제품제작비': 6000,
    '외주용역비': 4500,
    '여비교통비': 1200,
    '회의/교육비': 900,
    '감가상각비/유지보수비': 3500,
    '기타': 500
  };

  // Generate 2025 data (Months 1-12)
  DEPARTMENTS.forEach(dept => {
    STANDARD_CATEGORIES.forEach(cat => {
      for (let m = 1; m <= 12; m++) {
        const base = catBaseAmounts[cat] * deptWeights[dept];
        // add some pseudo-random variance based on dept and month
        const variance = Math.sin(m * dept.length) * 0.2 + 1.0;
        const amount = Math.round(base * variance * 0.08); // monthly slice
        
        if (amount > 0) {
          const matchingMapping = INITIAL_MAPPINGS.find(map => map.standardCategory === cat);
          transactions.push({
            id: `SAP-2025-${idCounter++}`,
            date: `2025-${String(m).padStart(2, '0')}`,
            year: 2025,
            month: m,
            department: dept,
            accountCode: matchingMapping ? matchingMapping.accountCode : 'ACC-800',
            detailAccountName: matchingMapping ? matchingMapping.detailAccountName : '기타 운영비',
            amount: amount,
            description: `2025년 ${m}월 ${dept} ${cat} 집행`
          });
        }
      }
    });
  });

  // Generate 2026 YTD data (Months 1-8)
  DEPARTMENTS.forEach(dept => {
    STANDARD_CATEGORIES.forEach(cat => {
      for (let m = 1; m <= 8; m++) {
        const base = catBaseAmounts[cat] * deptWeights[dept];
        // 2026 has a 5% inflation/growth factor on average
        const variance = Math.cos(m * dept.length) * 0.15 + 1.05;
        const amount = Math.round(base * variance * 0.082);
        
        if (amount > 0) {
          const matchingMapping = INITIAL_MAPPINGS.find(map => map.standardCategory === cat);
          transactions.push({
            id: `SAP-2026-${idCounter++}`,
            date: `2026-${String(m).padStart(2, '0')}`,
            year: 2026,
            month: m,
            department: dept,
            accountCode: matchingMapping ? matchingMapping.accountCode : 'ACC-800',
            detailAccountName: matchingMapping ? matchingMapping.detailAccountName : '기타 운영비',
            amount: amount,
            description: `2026년 ${m}월 ${dept} ${cat} 집행`
          });
        }
      }
    });
  });

  return transactions;
};

// Default budget generation for 2026 based on 2025 full year actuals * 1.06 (6% increase budget)
export const generateInitialBudgets = (transactions: SapTransaction[]): BudgetEntry[] => {
  const budgets: BudgetEntry[] = [];
  let idCounter = 5000;

  // Calculate 2025 totals per dept & category
  DEPARTMENTS.forEach(dept => {
    STANDARD_CATEGORIES.forEach(cat => {
      const priorYearTotal = transactions
        .filter(t => t.year === 2025 && t.department === dept)
        .filter(t => {
          const mapping = INITIAL_MAPPINGS.find(m => m.accountCode === t.accountCode || m.detailAccountName === t.detailAccountName);
          return mapping?.standardCategory === cat;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      // Budget is set to prior year actual * 1.06 rounded to nearest 100K KRW
      const calculatedBudget = Math.round((priorYearTotal > 0 ? priorYearTotal : 15000) * 1.06 / 10) * 10;

      budgets.push({
        id: `BUD-${idCounter++}`,
        year: 2026,
        department: dept,
        standardCategory: cat,
        budgetAmount: calculatedBudget
      });
    });
  });

  return budgets;
};
