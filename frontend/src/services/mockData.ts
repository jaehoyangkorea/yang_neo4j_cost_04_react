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
}

const costTeamReport = {
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
