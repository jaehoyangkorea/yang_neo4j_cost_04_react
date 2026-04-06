import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line,
  Legend, Area, AreaChart,
} from 'recharts'
import { reportApi } from '../../services/api'
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  DollarSign, BarChart3, Layers, ShieldAlert, Package, Truck,
  Activity, Cpu, Gauge, Zap,
} from 'lucide-react'

const CE_NAMES: Record<string, string> = {
  CE_DEP: '감가상각비', CE_LAB: '인건비', CE_PWR: '전력비',
  CE_MAT: '재료비', CE_MNT: '수선유지비', CE_GAS: '기료비', CE_OTH: '기타경비',
}

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#6b7280']

const reportConfigDef: Record<string, {
  titleKey: string; subtitleKey: string
  fetchFn: (ym: string) => Promise<any>
  componentKey: string
}> = {
  executive: {
    titleKey: 'report.executiveTitle',
    subtitleKey: 'report.executiveSubtitle',
    fetchFn: (ym) => reportApi.executiveSummary(ym).then(r => r.data),
    componentKey: 'executive',
  },
  'cost-team': {
    titleKey: 'report.costTeamTitle',
    subtitleKey: 'report.costTeamSubtitle',
    fetchFn: (ym) => reportApi.costTeam(ym).then(r => r.data),
    componentKey: 'cost-team',
  },
  'production-team': {
    titleKey: 'report.productionTeamTitle',
    subtitleKey: 'report.productionTeamSubtitle',
    fetchFn: (ym) => reportApi.productionTeam(ym).then(r => r.data),
    componentKey: 'production-team',
  },
  'purchase-team': {
    titleKey: 'report.purchaseTeamTitle',
    subtitleKey: 'report.purchaseTeamSubtitle',
    fetchFn: (ym) => reportApi.purchaseTeam(ym).then(r => r.data),
    componentKey: 'purchase-team',
  },
}

function getVarLabel(varType: string, ceCd?: string): string {
  const ceName = ceCd ? (CE_NAMES[ceCd] || ceCd) : ''
  switch (varType) {
    case 'RATE_VAR':  return '단위원가 변동'
    case 'QTY_VAR':   return '생산Mix 변동'
    case 'RATE_COST': return `${ceName} 총액 증감`
    case 'RATE_BASE': return '가동시간 변동'
    case 'PRICE_VAR': return '자재 단가 변동'
    case 'USAGE_VAR': return 'BOM 사용량 변동'
    default: return varType
  }
}

/* ════════════════════════════════════════════════════
   KPI Card 컴포넌트
   ════════════════════════════════════════════════════ */
function KpiCard({ icon: Icon, label, value, sub, color = 'blue' }: {
  icon: any; label: string; value: string; sub?: string; color?: string
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    cyan: 'bg-cyan-50 border-cyan-200 text-cyan-700',
  }
  const iconColorMap: Record<string, string> = {
    blue: 'text-blue-500', red: 'text-red-500', green: 'text-green-500',
    amber: 'text-amber-500', purple: 'text-purple-500', cyan: 'text-cyan-500',
  }
  return (
    <div className={`rounded-lg border p-4 ${colorMap[color] || colorMap.blue}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${iconColorMap[color]}`} />
        <span className="text-xs font-semibold opacity-80">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <div className="text-xs mt-1 opacity-70">{sub}</div>}
    </div>
  )
}

/* ════════════════════════════════════════════════════
   1. 경영진 보고서
   ════════════════════════════════════════════════════ */
function ExecutiveReport({ data }: { data: any }) {
  const tc = data.total_cost
  const diff = (tc.curr || 0) - (tc.prev || 0)
  const rate = tc.prev ? (diff / tc.prev * 100) : 0

  const insightIconMap: Record<string, any> = {
    danger: AlertTriangle, warning: AlertTriangle, success: CheckCircle,
  }
  const insightColorMap: Record<string, string> = {
    danger: 'border-red-300 bg-red-50',
    warning: 'border-amber-300 bg-amber-50',
    success: 'border-green-300 bg-green-50',
  }
  const insightIconColor: Record<string, string> = {
    danger: 'text-red-500', warning: 'text-amber-500', success: 'text-green-500',
  }

  return (
    <>
      {/* KPI 요약 */}
      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <KpiCard icon={DollarSign} label="당월 총원가" value={`${tc.curr?.toFixed(0)}억원`} sub="총 제조원가" color="blue" />
        <KpiCard icon={TrendingUp} label="전월 대비 증감" value={`${diff >= 0 ? '+' : ''}${diff.toFixed(1)}억원`} sub={`전월 ${tc.prev?.toFixed(0)}억원`} color="red" />
        <KpiCard icon={BarChart3} label="증감률" value={`${rate >= 0 ? '+' : ''}${rate.toFixed(1)}%`} sub="MoM" color="amber" />
        <KpiCard icon={AlertTriangle} label="최대 증가 요인" value="감가상각비" sub="+28.5억 (44.5%)" color="purple" />
      </div>

      {/* 월별 추이 */}
      {data.monthly_trend?.length > 0 && (
        <div className="card">
          <h3 className="card-title">총 제조원가 월별 추이 (억원)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.monthly_trend}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={['dataMin - 50', 'dataMax + 50']} />
              <Tooltip formatter={(v: number) => `${v.toLocaleString()}억원`} />
              <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorTotal)" name="총원가" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 2단 레이아웃: 제품군별 + 원가요소별 */}
      <div className="grid grid-2">
        {/* 제품군별 증감 */}
        <div className="card">
          <h3 className="card-title">제품군별 원가 증감 (억원)</h3>
          {data.by_product_group?.length > 0 && (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.by_product_group} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="product_grp" type="category" tick={{ fontSize: 12 }} width={80} />
                <Tooltip formatter={(v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}억원`} />
                <Bar dataKey="diff" name="증감" radius={[0, 4, 4, 0]}>
                  {data.by_product_group.map((d: any, i: number) => (
                    <Cell key={i} fill={d.diff >= 0 ? '#ef4444' : '#22c55e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 원가요소별 구성비 */}
        {data.by_cost_element?.length > 0 && (
          <div className="card">
            <h3 className="card-title">원가요소별 구성비</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.by_cost_element}
                  cx="50%" cy="50%"
                  outerRadius={100}
                  dataKey="curr"
                  nameKey="name"
                  label={({ name, share }: any) => `${name} ${share}%`}
                  labelLine={false}
                >
                  {data.by_cost_element.map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v.toLocaleString()}억원`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 제품군 상세 테이블 */}
      <div className="card">
        <h3 className="card-title">제품군별 상세 내역</h3>
        <table>
          <thead>
            <tr>
              <th>제품군</th>
              <th style={{ textAlign: 'right' }}>당월 (억원)</th>
              <th style={{ textAlign: 'right' }}>전월 (억원)</th>
              <th style={{ textAlign: 'right' }}>증감 (억원)</th>
              <th style={{ textAlign: 'right' }}>증감률</th>
            </tr>
          </thead>
          <tbody>
            {data.by_product_group?.map((g: any) => (
              <tr key={g.product_grp}>
                <td><strong>{g.product_grp}</strong></td>
                <td style={{ textAlign: 'right' }}>{g.curr?.toFixed(1)}</td>
                <td style={{ textAlign: 'right' }}>{g.prev?.toFixed(1)}</td>
                <td style={{ textAlign: 'right' }} className={g.diff >= 0 ? 'text-positive' : 'text-negative'}>
                  {g.diff >= 0 ? '+' : ''}{g.diff?.toFixed(1)}
                </td>
                <td style={{ textAlign: 'right' }} className={g.rate >= 0 ? 'text-positive' : 'text-negative'}>
                  {g.rate >= 0 ? '+' : ''}{g.rate?.toFixed(1)}%
                </td>
              </tr>
            ))}
            <tr style={{ fontWeight: 700, borderTop: '2px solid #cbd5e1' }}>
              <td>합계</td>
              <td style={{ textAlign: 'right' }}>{tc.curr?.toFixed(1)}</td>
              <td style={{ textAlign: 'right' }}>{tc.prev?.toFixed(1)}</td>
              <td style={{ textAlign: 'right' }} className="text-positive">+{diff.toFixed(1)}</td>
              <td style={{ textAlign: 'right' }} className="text-positive">+{rate.toFixed(1)}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 핵심 인사이트 */}
      {data.key_insights?.length > 0 && (
        <div className="card">
          <h3 className="card-title">핵심 인사이트</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.key_insights.map((ins: any, i: number) => {
              const Icon = insightIconMap[ins.type] || AlertTriangle
              return (
                <div key={i} className={`rounded-lg border p-4 ${insightColorMap[ins.type] || ''}`}
                  style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${insightIconColor[ins.type] || ''}`} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{ins.title}</div>
                    <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{ins.desc}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 향후 전망 */}
      <div className="card">
        <h3 className="card-title">향후 전망 및 권고사항</h3>
        <div className="grid grid-2">
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>
              <TrendingUp className="w-4 h-4 inline mr-2 text-blue-500" />전망
            </h4>
            <ul style={{ fontSize: 13, color: '#475569', lineHeight: 2, paddingLeft: 16 }}>
              <li>2월 EUV 장비 추가 가동 → 감가상각비 +15~20억 추가 증가 예상</li>
              <li>HBM3E 양산 본격화 → 후공정 원가 Q1 대비 8~12% 상승 전망</li>
              <li>웨이퍼 단가 하락세 지속 → 재료비 일부 상쇄 효과 기대</li>
              <li>전체 원가 증가율은 2.5~3.5% 수준 유지 전망</li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>
              <ShieldAlert className="w-4 h-4 inline mr-2 text-amber-500" />권고사항
            </h4>
            <ul style={{ fontSize: 13, color: '#475569', lineHeight: 2, paddingLeft: 16 }}>
              <li>설비 가동률 극대화로 단위당 감가상각 원가 관리</li>
              <li>테스트 공정 자동화 성과를 타 공정으로 확산</li>
              <li>CMP 슬러리/포토레지스트 대체 공급사 확보 추진</li>
              <li>제품 포트폴리오 믹스 최적화 (HBM/CXL 집중)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 보고서 메타 */}
      <div style={{ textAlign: 'right', fontSize: 12, color: '#94a3b8', marginTop: 8, lineHeight: 1.8 }}>
        작성: 원가관리팀 · 기준일: 2025년 1월 · 데이터 출처: Neo4j 원가 그래프DB / MES / SAP ERP
      </div>
    </>
  )
}

/* ════════════════════════════════════════════════════
   2. 원가팀 보고서
   ════════════════════════════════════════════════════ */
function CostTeamReport({ data }: { data: any }) {
  const s = data.summary || {}

  return (
    <>
      {/* KPI 요약 */}
      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <KpiCard icon={Layers} label="분석 건수" value={`${s.total_variances || 0}건`} sub="차이 항목 수" color="blue" />
        <KpiCard icon={TrendingUp} label="최대 차이" value={`+${s.max_variance || 0}억`} sub="HBM 포토 감가상각" color="red" />
        <KpiCard icon={BarChart3} label="증가 / 감소" value={`${s.increase_count || 0} / ${s.decrease_count || 0}`} sub="증가 vs 감소 항목" color="amber" />
        <KpiCard icon={DollarSign} label="원가요소" value={`${s.cost_elements || 0}개`} sub="분석 대상 원가요소" color="purple" />
      </div>

      {/* 2단: 원가요소별 + 차이유형별 */}
      <div className="grid grid-2">
        {data.by_cost_element?.length > 0 && (
          <div className="card">
            <h3 className="card-title">원가요소별 차이 합계 (억원)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.by_cost_element}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => `${v.toFixed(1)}억원`} />
                <Bar dataKey="total_var" name="차이금액" radius={[4, 4, 0, 0]}>
                  {data.by_cost_element.map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {data.by_var_type?.length > 0 && (
          <div className="card">
            <h3 className="card-title">차이유형별 분포</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.by_var_type}
                  cx="50%" cy="50%"
                  outerRadius={90}
                  innerRadius={45}
                  dataKey="total"
                  nameKey="label"
                  label={({ label, total }: any) => `${label} ${total.toFixed(1)}억`}
                  labelLine={false}
                >
                  {data.by_var_type.map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v.toFixed(1)}억원`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 차이유형 요약 카드 */}
      {data.by_var_type?.length > 0 && (
        <div className="card">
          <h3 className="card-title">차이유형별 상세</h3>
          <div className="grid grid-3" style={{ gap: 12 }}>
            {data.by_var_type.map((vt: any, i: number) => (
              <div key={i} style={{
                padding: '14px 16px', borderRadius: 8,
                border: '1px solid #e2e8f0', background: '#f8fafc',
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>{vt.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: PIE_COLORS[i] }}>{vt.total.toFixed(1)}억</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{vt.count}건</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 주요 차이 항목 테이블 */}
      <div className="card">
        <h3 className="card-title">주요 차이 항목 (금액 기준 상위)</h3>
        <table>
          <thead>
            <tr>
              <th>순위</th>
              <th>제품군</th>
              <th>제품코드</th>
              <th>공정</th>
              <th>원가요소</th>
              <th>차이유형</th>
              <th style={{ textAlign: 'right' }}>금액 (억원)</th>
              <th style={{ textAlign: 'right' }}>증감률</th>
            </tr>
          </thead>
          <tbody>
            {data.top_variances?.map((v: any, i: number) => (
              <tr key={i}>
                <td><span className={`badge ${i < 3 ? 'badge-danger' : 'badge-info'}`}>{i + 1}</span></td>
                <td>{v.product_grp}</td>
                <td><strong>{v.product_cd}</strong></td>
                <td>{v.proc_cd}</td>
                <td>{CE_NAMES[v.ce_cd] || v.ce_cd}</td>
                <td>
                  <span className={`badge ${
                    v.var_type.includes('RATE') ? 'badge-info' :
                    v.var_type.includes('PRICE') ? 'badge-warning' : 'badge-success'
                  }`}>
                    {getVarLabel(v.var_type, v.ce_cd)}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }} className={v.var_amt >= 0 ? 'text-positive' : 'text-negative'}>
                  {v.var_amt >= 0 ? '+' : ''}{v.var_amt?.toFixed(2)}
                </td>
                <td style={{ textAlign: 'right' }} className={v.var_rate >= 0 ? 'text-positive' : 'text-negative'}>
                  {v.var_rate >= 0 ? '+' : ''}{(v.var_rate * 100)?.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 분석 요약 */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff, #f0f9ff)' }}>
        <h3 className="card-title">분석 요약</h3>
        <div style={{ fontSize: 13, lineHeight: 2, color: '#334155' }}>
          <p><strong>1. 감가상각비(+28.5억)</strong>가 전체 증가분의 44.5%로 최대 요인이며, EUV 장비 투입이 핵심 원인입니다.</p>
          <p><strong>2. 재료비(+16.2억)</strong>는 CMP 슬러리, 포토레지스트, Au 와이어 등 핵심 소재 단가 상승이 주된 원인입니다.</p>
          <p><strong>3. HBM 제품군</strong>이 전체 상위 10건 차이 중 6건을 차지하며, HBM 원가 관리가 시급합니다.</p>
          <p><strong>4. 포토·조립 공정</strong>에 차이가 집중되어 있어 해당 공정의 집중 관리가 필요합니다.</p>
        </div>
      </div>
    </>
  )
}

/* ════════════════════════════════════════════════════
   3. 생산팀 보고서
   ════════════════════════════════════════════════════ */
function ProductionTeamReport({ data }: { data: any }) {
  const s = data.summary || {}

  return (
    <>
      {/* KPI 요약 */}
      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <KpiCard icon={Cpu} label="모니터링 장비" value={`${s.total_equipment || 0}대`} sub="MES 이벤트 발생" color="blue" />
        <KpiCard icon={Activity} label="평균 가동률 변동" value={`+${s.avg_utilization_change || 0}%`} sub="전월 대비" color="green" />
        <KpiCard icon={DollarSign} label="총 원가 영향" value={`+${s.total_cost_impact || 0}억`} sub="장비 가동 변동분" color="red" />
        <KpiCard icon={Gauge} label="처리량 변동" value={`+${s.throughput_change || 0}%`} sub="CMP 장비 기준" color="cyan" />
      </div>

      {/* 공정별 효율 분석 */}
      {data.process_efficiency?.length > 0 && (
        <div className="card">
          <h3 className="card-title">공정별 수율·가동 분석</h3>
          <div className="grid grid-2">
            <div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.process_efficiency}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="process" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => `${v.toFixed(1)}억원`} />
                  <Bar dataKey="cost_impact" name="원가 영향 (억원)" radius={[4, 4, 0, 0]}>
                    {data.process_efficiency.map((d: any, i: number) => (
                      <Cell key={i} fill={d.cost_impact >= 0 ? '#ef4444' : '#22c55e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <table>
                <thead>
                  <tr>
                    <th>공정</th>
                    <th style={{ textAlign: 'right' }}>전월 수율</th>
                    <th style={{ textAlign: 'right' }}>당월 수율</th>
                    <th style={{ textAlign: 'right' }}>변동</th>
                    <th style={{ textAlign: 'right' }}>원가 영향</th>
                  </tr>
                </thead>
                <tbody>
                  {data.process_efficiency.map((p: any, i: number) => (
                    <tr key={i}>
                      <td><strong>{p.process}</strong></td>
                      <td style={{ textAlign: 'right' }}>{p.prev_yield}%</td>
                      <td style={{ textAlign: 'right' }}>{p.curr_yield}%</td>
                      <td style={{ textAlign: 'right' }} className={p.yield_change >= 0 ? 'text-negative' : 'text-positive'}>
                        {p.yield_change >= 0 ? '+' : ''}{p.yield_change}%p
                      </td>
                      <td style={{ textAlign: 'right' }} className={p.cost_impact >= 0 ? 'text-positive' : 'text-negative'}>
                        {p.cost_impact >= 0 ? '+' : ''}{p.cost_impact.toFixed(1)}억
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MES 이벤트 */}
      <div className="card">
        <h3 className="card-title">MES 이벤트 — 장비 가동률/처리량 변동</h3>
        <table>
          <thead>
            <tr>
              <th>장비코드</th>
              <th>장비명</th>
              <th>지표</th>
              <th style={{ textAlign: 'right' }}>전월</th>
              <th style={{ textAlign: 'right' }}>당월</th>
              <th style={{ textAlign: 'right' }}>변동</th>
              <th style={{ textAlign: 'right' }}>변동률</th>
            </tr>
          </thead>
          <tbody>
            {data.mes_events?.map((e: any, i: number) => (
              <tr key={i}>
                <td><strong>{e.equip_cd}</strong></td>
                <td>{e.equip_nm}</td>
                <td><span className="badge badge-info">{e.metric_type}</span></td>
                <td style={{ textAlign: 'right' }}>{e.prev_value?.toLocaleString()}</td>
                <td style={{ textAlign: 'right' }}>{e.curr_value?.toLocaleString()}</td>
                <td style={{ textAlign: 'right' }} className={e.chg_value >= 0 ? 'text-positive' : 'text-negative'}>
                  {e.chg_value >= 0 ? '+' : ''}{e.chg_value?.toLocaleString()}
                </td>
                <td style={{ textAlign: 'right' }} className={e.chg_rate >= 0 ? 'text-positive' : 'text-negative'}>
                  {e.chg_rate >= 0 ? '+' : ''}{(e.chg_rate * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 장비 가동률 차트 */}
      {data.mes_events?.length > 0 && (
        <div className="card">
          <h3 className="card-title">장비별 가동시간/처리량 변동 비교</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.mes_events}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="equip_cd" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="prev_value" name="전월" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="curr_value" name="당월" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 원가 영향 분석 */}
      {data.cost_impacts?.length > 0 && (
        <div className="card">
          <h3 className="card-title">원가 영향 분석 (Neo4j EVIDENCED_BY 연결)</h3>
          <table>
            <thead>
              <tr>
                <th>장비</th>
                <th>제품</th>
                <th>차이유형</th>
                <th style={{ textAlign: 'right' }}>영향 금액 (억원)</th>
                <th style={{ textAlign: 'right' }}>영향률</th>
                <th>영향도</th>
              </tr>
            </thead>
            <tbody>
              {data.cost_impacts.map((c: any, i: number) => (
                <tr key={i}>
                  <td>{c.equipment}</td>
                  <td><strong>{c.product}</strong></td>
                  <td><span className="badge badge-info">{getVarLabel(c.var_type, c.ce_cd)}</span></td>
                  <td style={{ textAlign: 'right' }} className="text-positive">
                    +{c.var_amt?.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right' }} className="text-positive">
                    +{(c.var_rate * 100)?.toFixed(1)}%
                  </td>
                  <td>
                    <div className="progress-bar" style={{ width: 80 }}>
                      <div className="progress-fill" style={{
                        width: `${Math.min(100, (c.var_amt / 5.2) * 100)}%`,
                        background: c.var_amt > 4 ? '#ef4444' : c.var_amt > 2 ? '#f59e0b' : '#3b82f6',
                      }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 생산팀 권고사항 */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #ecfeff, #f0fdfa)' }}>
        <h3 className="card-title">생산팀 분석 요약 및 권고</h3>
        <div style={{ fontSize: 13, lineHeight: 2, color: '#334155' }}>
          <p><strong>1. EUV Scanner #1/#2</strong>의 가동시간이 크게 증가(+9.7%, +11.9%)하여 감가상각비 상승의 직접적 원인입니다.</p>
          <p><strong>2. 테스트 공정</strong>은 수율이 오히려 개선(+0.3%p)되어 자동화 투자 효과가 입증되었습니다.</p>
          <p><strong>3. 포토/조립 공정</strong>의 수율 하락(-0.4%p)은 첨단 공정 도입 초기의 학습 효과가 반영된 것으로 판단됩니다.</p>
          <p><strong>권고:</strong> 테스트 자동화 성과를 조립/CMP 공정으로 확산하고, EUV 장비 가동률 최적화를 통한 단위당 원가 관리를 추진하십시오.</p>
        </div>
      </div>
    </>
  )
}

/* ════════════════════════════════════════════════════
   4. 구매팀 보고서
   ════════════════════════════════════════════════════ */
function PurchaseTeamReport({ data }: { data: any }) {
  const s = data.summary || {}

  return (
    <>
      {/* KPI 요약 */}
      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <KpiCard icon={Package} label="단가 변동 자재" value={`${s.total_materials || 0}건`} sub="단가인상 이벤트" color="amber" />
        <KpiCard icon={TrendingUp} label="평균 단가 상승률" value={`+${s.avg_price_change || 0}%`} sub="5개 자재 평균" color="red" />
        <KpiCard icon={DollarSign} label="총 원가 영향" value={`+${s.total_impact || 0}억`} sub="자재 단가 변동분" color="purple" />
        <KpiCard icon={ShieldAlert} label="고위험 자재" value={`${s.high_risk_count || 0}건`} sub="공급 리스크 高" color="red" />
      </div>

      {/* 자재별 단가 추이 */}
      {data.price_trend?.length > 0 && (
        <div className="card">
          <h3 className="card-title">주요 자재 단가 추이 (6개월)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.price_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `${v.toLocaleString()}원`} />
              <Legend />
              <Line type="monotone" dataKey="slurry" name="CMP 슬러리" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="wire" name="Au 와이어" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 단가 변동 이벤트 */}
      <div className="card">
        <h3 className="card-title">자재 단가 변동 이벤트</h3>
        <table>
          <thead>
            <tr>
              <th>자재코드</th>
              <th>자재명</th>
              <th>변경유형</th>
              <th style={{ textAlign: 'right' }}>변경 전 (원)</th>
              <th style={{ textAlign: 'right' }}>변경 후 (원)</th>
              <th style={{ textAlign: 'right' }}>변동률</th>
              <th>사유</th>
            </tr>
          </thead>
          <tbody>
            {data.purchase_events?.map((e: any, i: number) => (
              <tr key={i}>
                <td><strong>{e.mat_cd}</strong></td>
                <td>{e.mat_nm}</td>
                <td><span className="badge badge-warning">{e.chg_type}</span></td>
                <td style={{ textAlign: 'right' }}>{e.prev_value?.toLocaleString()}</td>
                <td style={{ textAlign: 'right' }}>{e.curr_value?.toLocaleString()}</td>
                <td style={{ textAlign: 'right' }} className="text-positive">
                  +{(e.chg_rate * 100).toFixed(1)}%
                </td>
                <td style={{ fontSize: 12, color: '#64748b' }}>{e.chg_reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 단가 변동률 비교 차트 */}
      {data.purchase_events?.length > 0 && (
        <div className="card">
          <h3 className="card-title">자재별 단가 변동률 비교</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.purchase_events.map((e: any) => ({
              name: e.mat_nm.length > 12 ? e.mat_nm.substring(0, 12) + '...' : e.mat_nm,
              rate: (e.chg_rate * 100),
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} unit="%" />
              <Tooltip formatter={(v: number) => `+${v.toFixed(1)}%`} />
              <Bar dataKey="rate" name="단가 변동률" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                {data.purchase_events.map((_: any, i: number) => (
                  <Cell key={i} fill={i === 2 ? '#ef4444' : '#f59e0b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 공급 리스크 분석 */}
      {data.supplier_risk?.length > 0 && (
        <div className="card">
          <h3 className="card-title">공급사 리스크 분석</h3>
          <table>
            <thead>
              <tr>
                <th>자재</th>
                <th>주요 공급사</th>
                <th>국가</th>
                <th>리스크</th>
                <th style={{ textAlign: 'right' }}>의존도</th>
                <th>대체 공급사</th>
                <th>진행 상태</th>
              </tr>
            </thead>
            <tbody>
              {data.supplier_risk.map((r: any, i: number) => (
                <tr key={i}>
                  <td><strong>{r.mat_nm}</strong></td>
                  <td>{r.supplier}</td>
                  <td>{r.country}</td>
                  <td>
                    <span className={`badge ${
                      r.risk_level === 'high' ? 'badge-danger' :
                      r.risk_level === 'medium' ? 'badge-warning' : 'badge-success'
                    }`}>
                      {r.risk_level === 'high' ? '높음' : r.risk_level === 'medium' ? '보통' : '낮음'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                      <div className="progress-bar" style={{ width: 60 }}>
                        <div className="progress-fill" style={{
                          width: `${r.dependency}%`,
                          background: r.dependency > 70 ? '#ef4444' : r.dependency > 50 ? '#f59e0b' : '#22c55e',
                        }} />
                      </div>
                      {r.dependency}%
                    </div>
                  </td>
                  <td style={{ fontSize: 12 }}>{r.alt_supplier}</td>
                  <td>
                    <span className={`badge ${
                      r.alt_status.includes('양산') ? 'badge-success' :
                      r.alt_status.includes('진행') ? 'badge-info' : 'badge-warning'
                    }`}>
                      {r.alt_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 원가 영향 분석 */}
      {data.cost_impacts?.length > 0 && (
        <div className="card">
          <h3 className="card-title">원가 영향 분석 (Neo4j EVIDENCED_BY 연결)</h3>
          <table>
            <thead>
              <tr>
                <th>자재</th>
                <th>제품</th>
                <th>차이유형</th>
                <th style={{ textAlign: 'right' }}>영향 금액 (억원)</th>
                <th style={{ textAlign: 'right' }}>영향률</th>
              </tr>
            </thead>
            <tbody>
              {data.cost_impacts.map((c: any, i: number) => (
                <tr key={i}>
                  <td>{c.material}</td>
                  <td><strong>{c.product}</strong></td>
                  <td><span className="badge badge-warning">{getVarLabel(c.var_type, c.ce_cd)}</span></td>
                  <td style={{ textAlign: 'right' }} className="text-positive">
                    +{c.var_amt?.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right' }} className="text-positive">
                    +{(c.var_rate * 100)?.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 구매팀 권고사항 */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #fffbeb, #fefce8)' }}>
        <h3 className="card-title">구매팀 분석 요약 및 권고</h3>
        <div style={{ fontSize: 13, lineHeight: 2, color: '#334155' }}>
          <p><strong>1. Au 와이어 단가 상승률(+14.3%)</strong>이 가장 높아 국제 금 시세 모니터링 및 헤징 전략이 시급합니다.</p>
          <p><strong>2. CMP 슬러리·포토레지스트</strong>는 일본 공급사 의존도가 높아(78%, 92%) 국산 대체재 개발이 중장기 과제입니다.</p>
          <p><strong>3. NF3 에칭가스</strong>는 국산 공급사(SK머티리얼즈) 활용으로 리스크가 상대적으로 낮습니다.</p>
          <p><strong>권고:</strong> ① Au 와이어 → Cu 와이어 전환 가속화, ② CMP 슬러리 대체 공급사(SKC솔믹스) 인증 촉진, ③ 포토레지스트 국산화 R&D 투자 확대</p>
        </div>
      </div>
    </>
  )
}

/* ════════════════════════════════════════════════════
   메인 보고서 페이지
   ════════════════════════════════════════════════════ */
const componentMap: Record<string, React.FC<{ data: any }>> = {
  executive: ExecutiveReport,
  'cost-team': CostTeamReport,
  'production-team': ProductionTeamReport,
  'purchase-team': PurchaseTeamReport,
}

export default function ReportPage() {
  const { t } = useTranslation()
  const { type } = useParams<{ type: string }>()
  const [yyyymm, setYyyymm] = useState('202501')
  const config = reportConfigDef[type || 'executive']
  const Component = componentMap[config?.componentKey || 'executive']

  const { data, isLoading } = useQuery({
    queryKey: ['report', type, yyyymm],
    queryFn: () => config?.fetchFn(yyyymm),
    enabled: !!config,
  })

  if (!config) return <div className="card">{t('report.notFound')}</div>

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">{t(config.titleKey)}</h2>
        <p className="page-subtitle">{t(config.subtitleKey)}</p>
      </div>

      <div className="month-selector">
        <label>{t('report.baseMonth')}</label>
        <select value={yyyymm} onChange={e => setYyyymm(e.target.value)}>
          <option value="202501">{t('report.month202501')}</option>
          <option value="202412">{t('report.month202412')}</option>
        </select>
        <span className="report-badge">
          {t('report.reportBadge', { year: yyyymm.slice(0, 4), month: parseInt(yyyymm.slice(4)) })}
        </span>
      </div>

      {isLoading ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
          <div className="spinner" />
          <p style={{ marginTop: 12 }}>{t('report.generating')}</p>
        </div>
      ) : data ? (
        <Component data={data} />
      ) : null}
    </div>
  )
}
