/**
 * Mock 데이터 모듈 — 백엔드 없이 프론트엔드 데모 동작을 위한 더미 응답
 */

/* ── GraphExplorer용 그래프 데이터 ── */
function generateGraphData(_yyyymm: string, productCd: string) {
  const label =
    productCd === 'HBM_001' ? 'HBM3E 8Hi' :
    productCd === 'HBM_002' ? 'HBM3E 12Hi' :
    productCd === 'SVR_001' ? 'DDR5 RDIMM 64G' :
    productCd.replace('_', ' ')

  const nodes = [
    { id: 'root', label, type: 'product', val: 45.3, level: 0 },
    { id: 'ce1', label: '감가상각비', type: 'cost_element', val: 28.5, level: 1 },
    { id: 'ce2', label: '재료비', type: 'cost_element', val: 16.2, level: 1 },
    { id: 'ce3', label: '인건비', type: 'cost_element', val: 8.4, level: 1 },
    { id: 'ce4', label: '전력비', type: 'cost_element', val: 4.8, level: 1 },
    { id: 'sv1', label: '전공정 설비', type: 'sub_var', val: 18.3, level: 2 },
    { id: 'sv2', label: '후공정 설비', type: 'sub_var', val: 8.2, level: 2 },
    { id: 'sv3', label: '원재료', type: 'sub_var', val: 8.5, level: 2 },
    { id: 'sv4', label: '부재료', type: 'sub_var', val: 5.2, level: 2 },
    { id: 'sv5', label: '직접 인건비', type: 'sub_var', val: 5.1, level: 2 },
    { id: 'sv6', label: '전공정 전력', type: 'sub_var', val: 3.2, level: 2 },
    { id: 'd1', label: 'EUV 노광 설비', type: 'detail', val: 10.2, level: 3 },
    { id: 'd2', label: 'ArF 식각 설비', type: 'detail', val: 4.8, level: 3 },
    { id: 'd3', label: '와이어본더', type: 'detail', val: 3.5, level: 3 },
    { id: 'd4', label: 'CMP 슬러리', type: 'detail', val: 3.5, level: 3 },
    { id: 'd5', label: '포토레지스트', type: 'detail', val: 2.8, level: 3 },
    { id: 'd6', label: '특수 가스류', type: 'detail', val: 2.4, level: 3 },
    { id: 'ev1', label: 'EUV 장비 투입', type: 'event', val: 10.2, level: 4, source_type: 'MES' },
    { id: 'ev2', label: '슬러리 단가 인상', type: 'event', val: 3.5, level: 4, source_type: 'SAP' },
    { id: 'ev3', label: 'Au 와이어 가격↑', type: 'event', val: 3.5, level: 4, source_type: 'SAP' },
    { id: 'sp1', label: 'HBM3E 12Hi', type: 'spread', val: 5.2, level: 4 },
    { id: 'sp2', label: 'DDR5 RDIMM', type: 'spread', val: 2.1, level: 4 },
  ]

  const links = [
    { source: 'root', target: 'ce1', label: '비용분해' },
    { source: 'root', target: 'ce2', label: '비용분해' },
    { source: 'root', target: 'ce3', label: '비용분해' },
    { source: 'root', target: 'ce4', label: '비용분해' },
    { source: 'ce1', target: 'sv1', label: '분해' },
    { source: 'ce1', target: 'sv2', label: '분해' },
    { source: 'ce2', target: 'sv3', label: '분해' },
    { source: 'ce2', target: 'sv4', label: '분해' },
    { source: 'ce3', target: 'sv5', label: '분해' },
    { source: 'ce4', target: 'sv6', label: '분해' },
    { source: 'sv1', target: 'd1', label: '원인' },
    { source: 'sv1', target: 'd2', label: '원인' },
    { source: 'sv2', target: 'd3', label: '원인' },
    { source: 'sv3', target: 'd4', label: '원인' },
    { source: 'sv3', target: 'd5', label: '원인' },
    { source: 'sv4', target: 'd6', label: '원인' },
    { source: 'd1', target: 'ev1', label: '근거' },
    { source: 'd4', target: 'ev2', label: '근거' },
    { source: 'd3', target: 'ev3', label: '근거' },
    { source: 'root', target: 'sp1', label: '파급(SPREADS_TO)' },
    { source: 'root', target: 'sp2', label: '파급(SPREADS_TO)' },
  ]

  return { nodes, links }
}

/* ── Report용 Mock 데이터 ── */
const executiveReport = {
  total_cost: { curr: 2227, prev: 2162 },
  by_product_group: [
    { product_grp: 'HBM', curr: 585, prev: 540, diff: 45.3, rate: 8.4 },
    { product_grp: '서버DRAM', curr: 410, prev: 388, diff: 22.3, rate: 5.7 },
    { product_grp: 'CXL', curr: 248, prev: 234, diff: 14.4, rate: 6.2 },
    { product_grp: '모바일DRAM', curr: 310, prev: 297, diff: 13.2, rate: 4.4 },
    { product_grp: 'PC DRAM', curr: 310, prev: 322, diff: -12.1, rate: -3.8 },
    { product_grp: 'NAND', curr: 168, prev: 188, diff: -20.4, rate: -10.9 },
    { product_grp: 'SSD', curr: 118, prev: 114, diff: 4.6, rate: 4.0 },
    { product_grp: 'CIS', curr: 78, prev: 75, diff: 3.4, rate: 4.5 },
  ],
  by_cost_element: [
    { name: '감가상각비', curr: 842, prev: 813, diff: 28.5, share: 37.8 },
    { name: '재료비', curr: 567, prev: 551, diff: 16.2, share: 25.5 },
    { name: '인건비', curr: 334, prev: 326, diff: 8.4, share: 15.0 },
    { name: '전력비', curr: 256, prev: 251, diff: 4.8, share: 11.5 },
    { name: '운반비', curr: 143, prev: 140, diff: 3.2, share: 6.4 },
    { name: '기타', curr: 85, prev: 82, diff: 3.0, share: 3.8 },
  ],
  monthly_trend: [
    { month: '2024.08', total: 2080, depreciation: 785, material: 530, labor: 310, power: 238 },
    { month: '2024.09', total: 2100, depreciation: 798, material: 542, labor: 315, power: 245 },
    { month: '2024.10', total: 2090, depreciation: 792, material: 535, labor: 318, power: 240 },
    { month: '2024.11', total: 2135, depreciation: 810, material: 548, labor: 322, power: 248 },
    { month: '2024.12', total: 2162, depreciation: 813, material: 551, labor: 326, power: 251 },
    { month: '2025.01', total: 2227, depreciation: 842, material: 567, labor: 334, power: 256 },
  ],
  key_insights: [
    { type: 'danger', title: 'EUV 장비 투입에 따른 감가상각비 급증', desc: '전공정 EUV 노광 장비 신규 투입으로 감가상각비가 전월 대비 +28.5억원 증가 (전체 증가분의 44.5%)' },
    { type: 'warning', title: 'CMP 슬러리 등 핵심 소재 단가 상승', desc: '재료비가 +16.2억원 증가. CMP 슬러리(+3.5억), 포토레지스트(+2.8억) 등 핵심 공정 소재 단가 상승이 주원인' },
    { type: 'success', title: '테스트 공정 자동화 효과 가시화', desc: '테스트 공정에서 자동화 도입 인건비 절감(-4.0억)과 테스트보드 효율화(-1.0억)로 총 -5.2억원 절감 달성' },
    { type: 'danger', title: 'HBM 제품군 원가 급증세 지속', desc: 'HBM 제품군이 6개월 연속 원가 상승 (8월 480억 → 1월 585억, +21.9%). AI 서버용 수요 급증이 주요 원인' },
  ],
}

const costTeamReport = {
  summary: {
    total_variances: 248,
    max_variance: 10.2,
    avg_variance: 2.8,
    cost_elements: 7,
    increase_count: 186,
    decrease_count: 62,
  },
  by_cost_element: [
    { ce_cd: 'CE_DEP', name: '감가상각비', total_var: 28.5, count: 42 },
    { ce_cd: 'CE_MAT', name: '재료비', total_var: 16.2, count: 68 },
    { ce_cd: 'CE_LAB', name: '인건비', total_var: 8.4, count: 35 },
    { ce_cd: 'CE_PWR', name: '전력비', total_var: 4.8, count: 28 },
    { ce_cd: 'CE_MNT', name: '수선유지비', total_var: 2.1, count: 22 },
    { ce_cd: 'CE_GAS', name: '기료비', total_var: 1.8, count: 18 },
    { ce_cd: 'CE_OTH', name: '기타경비', total_var: 2.3, count: 35 },
  ],
  by_var_type: [
    { type: 'RATE_VAR', label: '단위원가 변동', count: 82, total: 28.3 },
    { type: 'PRICE_VAR', label: '자재 단가 변동', count: 45, total: 19.4 },
    { type: 'USAGE_VAR', label: 'BOM 사용량 변동', count: 38, total: 8.2 },
    { type: 'QTY_VAR', label: '생산Mix 변동', count: 52, total: 5.8 },
    { type: 'RATE_BASE', label: '가동시간 변동', count: 31, total: 2.4 },
  ],
  top_variances: [
    { product_grp: 'HBM', product_cd: 'HBM_001', proc_cd: '포토', ce_cd: 'CE_DEP', var_type: 'RATE_VAR', var_amt: 10.2, var_rate: 0.104 },
    { product_grp: 'HBM', product_cd: 'HBM_001', proc_cd: '조립', ce_cd: 'CE_MAT', var_type: 'PRICE_VAR', var_amt: 8.2, var_rate: 0.064 },
    { product_grp: 'HBM', product_cd: 'HBM_001', proc_cd: 'CMP', ce_cd: 'CE_MAT', var_type: 'PRICE_VAR', var_amt: 5.2, var_rate: 0.058 },
    { product_grp: 'HBM', product_cd: 'HBM_002', proc_cd: '포토', ce_cd: 'CE_DEP', var_type: 'RATE_VAR', var_amt: 4.8, var_rate: 0.049 },
    { product_grp: '서버DRAM', product_cd: 'SVR_001', proc_cd: '식각', ce_cd: 'CE_MAT', var_type: 'USAGE_VAR', var_amt: 4.5, var_rate: 0.055 },
    { product_grp: 'HBM', product_cd: 'HBM_001', proc_cd: '조립', ce_cd: 'CE_DEP', var_type: 'RATE_VAR', var_amt: 4.5, var_rate: 0.049 },
    { product_grp: '서버DRAM', product_cd: 'SVR_001', proc_cd: '포토', ce_cd: 'CE_DEP', var_type: 'RATE_VAR', var_amt: 3.8, var_rate: 0.039 },
    { product_grp: 'CXL', product_cd: 'CXL_001', proc_cd: '증착', ce_cd: 'CE_MAT', var_type: 'PRICE_VAR', var_amt: 3.2, var_rate: 0.034 },
    { product_grp: 'HBM', product_cd: 'HBM_001', proc_cd: 'CMP', ce_cd: 'CE_MAT', var_type: 'USAGE_VAR', var_amt: 2.8, var_rate: 0.031 },
    { product_grp: '모바일DRAM', product_cd: 'MBL_001', proc_cd: '포토', ce_cd: 'CE_DEP', var_type: 'QTY_VAR', var_amt: 2.5, var_rate: 0.026 },
  ],
}

const productionTeamReport = {
  summary: {
    total_equipment: 5,
    avg_utilization_change: 7.1,
    max_cost_impact: 5.2,
    throughput_change: 6.5,
    total_runtime_change: 210,
    total_cost_impact: 12.5,
  },
  process_efficiency: [
    { process: '포토', prev_yield: 97.2, curr_yield: 96.8, yield_change: -0.4, runtime: 1340, cost_impact: 10.0 },
    { process: '조립', prev_yield: 95.5, curr_yield: 95.1, yield_change: -0.4, runtime: 1480, cost_impact: 8.5 },
    { process: 'CMP', prev_yield: 98.1, curr_yield: 97.8, yield_change: -0.3, runtime: 820, cost_impact: 5.2 },
    { process: '식각', prev_yield: 97.8, curr_yield: 97.5, yield_change: -0.3, runtime: 1390, cost_impact: 4.5 },
    { process: '증착', prev_yield: 98.5, curr_yield: 98.3, yield_change: -0.2, runtime: 760, cost_impact: 3.2 },
    { process: '테스트', prev_yield: 99.1, curr_yield: 99.4, yield_change: 0.3, runtime: 680, cost_impact: -5.2 },
  ],
  mes_events: [
    { equip_cd: 'EUV-01', equip_nm: 'EUV Scanner #1', metric_type: '가동시간', prev_value: 620, curr_value: 680, chg_value: 60, chg_rate: 0.097 },
    { equip_cd: 'EUV-02', equip_nm: 'EUV Scanner #2', metric_type: '가동시간', prev_value: 590, curr_value: 660, chg_value: 70, chg_rate: 0.119 },
    { equip_cd: 'WB-01', equip_nm: '와이어본더 #1', metric_type: '가동시간', prev_value: 720, curr_value: 740, chg_value: 20, chg_rate: 0.028 },
    { equip_cd: 'CMP-03', equip_nm: 'CMP 장비 #3', metric_type: '처리량', prev_value: 12400, curr_value: 13200, chg_value: 800, chg_rate: 0.065 },
    { equip_cd: 'ETCH-02', equip_nm: '식각 장비 #2', metric_type: '가동시간', prev_value: 680, curr_value: 710, chg_value: 30, chg_rate: 0.044 },
  ],
  cost_impacts: [
    { equipment: 'EUV Scanner #1', product: 'HBM_001', var_type: 'RATE_VAR', ce_cd: 'CE_DEP', var_amt: 5.2, var_rate: 0.053 },
    { equipment: 'EUV Scanner #2', product: 'HBM_002', var_type: 'RATE_VAR', ce_cd: 'CE_DEP', var_amt: 4.8, var_rate: 0.049 },
    { equipment: '와이어본더 #1', product: 'HBM_001', var_type: 'RATE_VAR', ce_cd: 'CE_DEP', var_amt: 2.5, var_rate: 0.026 },
  ],
}

const purchaseTeamReport = {
  summary: {
    total_materials: 5,
    avg_price_change: 8.9,
    max_impact: 3.5,
    total_impact: 8.8,
    high_risk_count: 3,
    japan_dependency_count: 2,
  },
  price_trend: [
    { month: '2024.08', slurry: 78000, resist: 305000, wire: 38000 },
    { month: '2024.09', slurry: 80000, resist: 308000, wire: 39000 },
    { month: '2024.10', slurry: 81000, resist: 310000, wire: 39500 },
    { month: '2024.11', slurry: 83000, resist: 315000, wire: 40500 },
    { month: '2024.12', slurry: 85000, resist: 320000, wire: 42000 },
    { month: '2025.01', slurry: 92000, resist: 345000, wire: 48000 },
  ],
  supplier_risk: [
    { mat_nm: 'CMP 슬러리', supplier: 'Hitachi Chemical', country: '일본', risk_level: 'high', dependency: 78, alt_supplier: 'SKC솔믹스(국산)', alt_status: '인증 진행중' },
    { mat_nm: 'EUV 포토레지스트', supplier: 'JSR / TOK', country: '일본', risk_level: 'high', dependency: 92, alt_supplier: '동진쎄미켐(국산)', alt_status: 'R&D 단계' },
    { mat_nm: 'Au 와이어', supplier: 'Heraeus', country: '독일', risk_level: 'medium', dependency: 65, alt_supplier: '희성금속(국산)', alt_status: '양산 적용중' },
    { mat_nm: 'NF3 에칭가스', supplier: 'SK머티리얼즈', country: '한국', risk_level: 'low', dependency: 45, alt_supplier: '후성(국산)', alt_status: '양산 적용중' },
    { mat_nm: '코발트 타겟', supplier: 'Praxair', country: '미국', risk_level: 'medium', dependency: 55, alt_supplier: '한국야금(국산)', alt_status: '평가 중' },
  ],
  purchase_events: [
    { mat_cd: 'SLR-001', mat_nm: 'CMP 슬러리 (세리아계)', chg_type: '단가인상', prev_value: 85000, curr_value: 92000, chg_rate: 0.082, chg_reason: '글로벌 공급 부족, 세리아 원가 상승' },
    { mat_cd: 'PR-001', mat_nm: 'EUV 포토레지스트', chg_type: '단가인상', prev_value: 320000, curr_value: 345000, chg_rate: 0.078, chg_reason: '일본 공급사 가격 인상' },
    { mat_cd: 'AUW-001', mat_nm: 'Au 와이어 (25μm)', chg_type: '단가인상', prev_value: 42000, curr_value: 48000, chg_rate: 0.143, chg_reason: '국제 금 시세 상승' },
    { mat_cd: 'GAS-NF3', mat_nm: 'NF3 에칭가스', chg_type: '단가인상', prev_value: 15000, curr_value: 16200, chg_rate: 0.08, chg_reason: '수요 증가에 따른 단가 상승' },
    { mat_cd: 'TGT-CO', mat_nm: '코발트 타겟', chg_type: '단가인상', prev_value: 280000, curr_value: 298000, chg_rate: 0.064, chg_reason: '전기차 배터리 수요 증가로 코발트 가격 상승' },
  ],
  cost_impacts: [
    { material: 'CMP 슬러리', product: 'HBM_001', var_type: 'PRICE_VAR', ce_cd: 'CE_MAT', var_amt: 3.5, var_rate: 0.039 },
    { material: 'EUV 포토레지스트', product: 'HBM_001', var_type: 'PRICE_VAR', ce_cd: 'CE_MAT', var_amt: 2.8, var_rate: 0.029 },
    { material: 'Au 와이어', product: 'HBM_001', var_type: 'PRICE_VAR', ce_cd: 'CE_MAT', var_amt: 2.5, var_rate: 0.026 },
    { material: 'NF3 에칭가스', product: 'SVR_001', var_type: 'PRICE_VAR', ce_cd: 'CE_MAT', var_amt: 1.2, var_rate: 0.015 },
    { material: '코발트 타겟', product: 'CXL_001', var_type: 'PRICE_VAR', ce_cd: 'CE_MAT', var_amt: 1.0, var_rate: 0.012 },
  ],
}

/* ── 엔드포인트별 Mock 응답 라우터 ── */
export function getMockResponse(url: string, _params?: Record<string, any>): any {
  if (url.includes('/dashboard/graph-data')) return generateGraphData(_params?.yyyymm, _params?.product_cd || 'HBM_001')
  if (url.includes('/dashboard/graph-stats')) return { node_count: 156, edge_count: 248, product_count: 16 }
  if (url.includes('/report/executive-summary')) return executiveReport
  if (url.includes('/report/cost-team')) return costTeamReport
  if (url.includes('/report/production-team')) return productionTeamReport
  if (url.includes('/report/purchase-team')) return purchaseTeamReport
  if (url.includes('/analysis/calculate-variance')) return { count: 248 }
  if (url.includes('/analysis/build-graph')) return { nodes: 156, edges: 248 }
  if (url.includes('/analysis/run-rules')) return { rules_applied: 12, causal_edges: 38 }
  if (url.includes('/analysis/interpret')) return { count: 24 }
  if (url.includes('/chat/ask')) return { answer: '' }
  return {}
}
