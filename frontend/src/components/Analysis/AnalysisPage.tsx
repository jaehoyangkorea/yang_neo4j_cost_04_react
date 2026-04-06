import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts'
import { analysisApi } from '../../services/api'
import {
  Play, CheckCircle, AlertCircle, Loader2,
  Database, GitBranch, Brain, BarChart3,
  TrendingUp, Layers, Zap, Network,
} from 'lucide-react'

interface StatusEntry {
  msg: string
  type: 'running' | 'done' | 'error'
  timestamp: string
}

interface AnalysisResult {
  varianceCount: number
  graphNodes: number
  graphEdges: number
  rulesApplied: number
  causalEdges: number
  interpretCount: number
}

const STEP_DEFS = [
  { id: 'step12', label: '데이터 적재', detail: 'SAP/MES/PLM/구매 데이터 (프로토타입: 샘플데이터)', icon: Database },
  { id: 'step3', label: '차이 계산', detail: '전공정 배부분해, 후공정 재료비/가공비 분해', icon: BarChart3 },
  { id: 'step4a', label: '상설 그래프 구축', detail: '제품/공정/장비/자재 노드 및 관계 갱신', icon: GitBranch },
  { id: 'step4b', label: '차이 노드 생성', detail: '계층적 차이 노드 생성 (제품군/제품코드)', icon: Layers },
  { id: 'step4c', label: '이벤트 노드 생성', detail: 'MES/PLM/구매 이벤트 노드 생성', icon: Zap },
  { id: 'step4d', label: '인과관계 연결', detail: 'Rule 1~6 규칙 기반 자동 연결', icon: Network },
  { id: 'step5', label: 'LLM 해석 생성', detail: '증거 기반 자동 해석 코멘트 생성', icon: Brain },
]

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#6b7280', '#0891b2']

const MOCK_RESULT_BY_CE = [
  { name: '감가상각비', count: 42, total: 28.5 },
  { name: '재료비', count: 68, total: 16.2 },
  { name: '인건비', count: 35, total: 8.4 },
  { name: '전력비', count: 28, total: 4.8 },
  { name: '수선유지비', count: 22, total: 2.1 },
  { name: '기료비', count: 18, total: 1.8 },
  { name: '기타경비', count: 35, total: 2.3 },
]

const MOCK_RESULT_BY_PRODUCT = [
  { name: 'HBM', count: 85, total: 45.3 },
  { name: '서버DRAM', count: 42, total: 22.3 },
  { name: 'CXL', count: 28, total: 14.4 },
  { name: '모바일DRAM', count: 32, total: 13.2 },
  { name: 'PC DRAM', count: 25, total: -12.1 },
  { name: 'NAND', count: 22, total: -20.4 },
  { name: 'SSD/CIS', count: 14, total: 8.0 },
]

const MOCK_TOP_CAUSES = [
  { rank: 1, cause: 'EUV 노광 장비 신규 투입', impact: '+10.2억', product: 'HBM_001', process: '포토' },
  { rank: 2, cause: 'Au 와이어 단가 상승 (국제 금시세)', impact: '+8.2억', product: 'HBM_001', process: '조립' },
  { rank: 3, cause: 'CMP 슬러리 단가 인상', impact: '+5.2억', product: 'HBM_001', process: 'CMP' },
  { rank: 4, cause: 'EUV Scanner #2 가동시간 증가', impact: '+4.8억', product: 'HBM_002', process: '포토' },
  { rank: 5, cause: '에칭가스 사용량 증가', impact: '+4.5억', product: 'SVR_001', process: '식각' },
]

export default function AnalysisPage() {
  const { t } = useTranslation()
  const [yyyymm, setYyyymm] = useState('202501')
  const [status, setStatus] = useState<StatusEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const addStatus = (msg: string, type: StatusEntry['type'] = 'running') =>
    setStatus(prev => [...prev, { msg, type, timestamp: new Date().toLocaleTimeString() }])

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const runFullProcess = async () => {
    setLoading(true)
    setStatus([])
    setResult(null)
    setCurrentStep(0)

    try {
      addStatus('Step 1-2: 데이터 적재 준비 중...', 'running')
      await delay(600)
      addStatus('Step 1-2 완료: SAP/MES/PLM/구매 데이터 로드', 'done')
      setCurrentStep(1)

      addStatus('Step 3: 차이 계산 실행 중...', 'running')
      await delay(800)
      const calcResult = await analysisApi.calculateVariance(yyyymm)
      const varianceCount = calcResult.data.count || 248
      addStatus(`Step 3 완료: ${varianceCount}건 차이 항목 생성`, 'done')
      setCurrentStep(2)

      addStatus('Step 4a~4c: 그래프 구축 실행 중...', 'running')
      await delay(1200)
      const graphResult = await analysisApi.buildGraph(yyyymm)
      const graphNodes = graphResult.data.nodes || 156
      const graphEdges = graphResult.data.edges || 248
      addStatus(`Step 4a~4c 완료: ${graphNodes}개 노드, ${graphEdges}개 관계 생성`, 'done')
      setCurrentStep(5)

      addStatus('Step 4d: 인과관계 규칙 엔진 실행 중...', 'running')
      await delay(600)
      const ruleResult = await analysisApi.runRules(yyyymm)
      const rulesApplied = ruleResult.data.rules_applied || 12
      const causalEdges = ruleResult.data.causal_edges || 38
      addStatus(`Step 4d 완료: ${rulesApplied}개 규칙 적용, ${causalEdges}개 인과관계 연결`, 'done')
      setCurrentStep(5)

      addStatus('Step 5: LLM 해석 생성 중...', 'running')
      await delay(1500)
      const interpretResult = await analysisApi.interpret(yyyymm)
      const interpretCount = interpretResult.data.count || 24
      addStatus(`Step 5 완료: ${interpretCount}건 해석 코멘트 생성`, 'done')
      setCurrentStep(6)

      addStatus('전체 프로세스 완료!', 'done')

      setResult({
        varianceCount,
        graphNodes,
        graphEdges,
        rulesApplied,
        causalEdges,
        interpretCount,
      })
    } catch (error: any) {
      addStatus(`오류 발생: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">{t('analysis.title')}</h2>
        <p className="page-subtitle">{t('analysis.subtitle')}</p>
      </div>

      {/* 실행 패널 */}
      <div className="card">
        <h3 className="card-title">{t('analysis.monthlyProcess')}</h3>
        <div className="month-selector" style={{ marginBottom: 0 }}>
          <label>{t('analysis.baseMonth')}</label>
          <select value={yyyymm} onChange={e => setYyyymm(e.target.value)}>
            <option value="202501">{t('analysis.month202501')}</option>
            <option value="202412">{t('analysis.month202412')}</option>
          </select>
          <button
            className="btn btn-primary"
            onClick={runFullProcess}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4" style={{ animation: 'spin 1s linear infinite' }} /> 실행 중...</>
            ) : (
              <><Play className="w-4 h-4" /> 전체 프로세스 실행</>
            )}
          </button>
        </div>
      </div>

      {/* 프로세스 단계 시각화 */}
      <div className="card">
        <h3 className="card-title">파이프라인 단계</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 8,
        }}>
          {STEP_DEFS.map((step, i) => {
            const Icon = step.icon
            const isDone = currentStep > i
            const isActive = currentStep === i && loading
            const isPending = currentStep < i || currentStep === -1

            return (
              <div key={step.id} style={{
                padding: '14px 10px',
                borderRadius: 8,
                textAlign: 'center',
                border: `2px solid ${isDone ? '#22c55e' : isActive ? '#3b82f6' : '#e2e8f0'}`,
                background: isDone ? '#f0fdf4' : isActive ? '#eff6ff' : '#f8fafc',
                transition: 'all 0.3s',
                opacity: isPending ? 0.5 : 1,
              }}>
                <div style={{ marginBottom: 6 }}>
                  {isDone ? (
                    <CheckCircle className="w-5 h-5" style={{ color: '#22c55e', margin: '0 auto' }} />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5" style={{ color: '#3b82f6', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Icon className="w-5 h-5" style={{ color: '#94a3b8', margin: '0 auto' }} />
                  )}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#1e293b', marginBottom: 2 }}>
                  {step.label}
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.4 }}>
                  {step.detail.length > 20 ? step.detail.substring(0, 20) + '...' : step.detail}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 실행 로그 */}
      <div className="card">
        <h3 className="card-title">{t('analysis.executionLog')}</h3>
        <div style={{
          background: '#0f172a',
          color: '#94a3b8',
          padding: 16,
          borderRadius: 8,
          fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
          fontSize: 13,
          maxHeight: 300,
          overflowY: 'auto',
          lineHeight: 1.8,
        }}>
          {status.length === 0 ? (
            <div style={{ color: '#475569' }}>
              $ 상단의 "전체 프로세스 실행" 버튼을 눌러 분석을 시작하세요...
            </div>
          ) : (
            status.map((entry, i) => (
              <div key={i} style={{
                color: entry.type === 'done' ? '#4ade80' :
                       entry.type === 'error' ? '#f87171' : '#94a3b8',
              }}>
                <span style={{ color: '#475569' }}>[{entry.timestamp}]</span>{' '}
                {entry.type === 'done' ? '✓' : entry.type === 'error' ? '✗' : '⏳'}{' '}
                {entry.msg}
              </div>
            ))
          )}
          {loading && (
            <div style={{ color: '#3b82f6' }}>
              <span className="inline-block w-2 h-2 rounded-full bg-blue-400" style={{
                animation: 'pulse 1s ease-in-out infinite',
                display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                background: '#3b82f6', marginRight: 8,
              }} />
              처리 중...
            </div>
          )}
        </div>
      </div>

      {/* ═══ 분석 결과 대시보드 ═══ */}
      {result && (
        <>
          <div className="page-header" style={{ marginTop: 32 }}>
            <h2 className="page-title">분석 결과 대시보드</h2>
            <p className="page-subtitle">{yyyymm.slice(0, 4)}년 {parseInt(yyyymm.slice(4))}월 차이분석 결과 요약</p>
          </div>

          {/* 결과 KPI */}
          <div className="grid grid-4" style={{ marginBottom: 16 }}>
            <div className="kpi-card">
              <div className="kpi-label">차이 항목</div>
              <div className="kpi-value" style={{ color: '#1e293b' }}>
                {result.varianceCount}<span className="kpi-unit">건</span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>증가 186건 / 감소 62건</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">그래프 노드</div>
              <div className="kpi-value" style={{ color: '#3b82f6' }}>
                {result.graphNodes}<span className="kpi-unit">개</span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{result.graphEdges}개 관계</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">인과관계</div>
              <div className="kpi-value" style={{ color: '#8b5cf6' }}>
                {result.causalEdges}<span className="kpi-unit">개</span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{result.rulesApplied}개 규칙 적용</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">LLM 해석</div>
              <div className="kpi-value" style={{ color: '#10b981' }}>
                {result.interpretCount}<span className="kpi-unit">건</span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>자동 생성 코멘트</div>
            </div>
          </div>

          {/* 2단 차트: 원가요소별 + 제품군별 */}
          <div className="grid grid-2">
            <div className="card">
              <h3 className="card-title">원가요소별 차이 분포 (억원)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={MOCK_RESULT_BY_CE}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => `${v.toFixed(1)}억원`} />
                  <Bar dataKey="total" name="차이합계" radius={[4, 4, 0, 0]}>
                    {MOCK_RESULT_BY_CE.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="card-title">제품군별 차이 분포</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={MOCK_RESULT_BY_PRODUCT.filter(d => d.total > 0)}
                    cx="50%" cy="50%"
                    outerRadius={90}
                    innerRadius={40}
                    dataKey="total"
                    nameKey="name"
                    label={({ name, total }: any) => `${name} ${total}억`}
                    labelLine={false}
                  >
                    {MOCK_RESULT_BY_PRODUCT.filter(d => d.total > 0).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v.toFixed(1)}억원`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 주요 원인 TOP 5 */}
          <div className="card">
            <h3 className="card-title">주요 원가 변동 원인 TOP 5</h3>
            <table>
              <thead>
                <tr>
                  <th>순위</th>
                  <th>원인</th>
                  <th>제품</th>
                  <th>공정</th>
                  <th style={{ textAlign: 'right' }}>원가 영향</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TOP_CAUSES.map((c) => (
                  <tr key={c.rank}>
                    <td>
                      <span className={`badge ${c.rank <= 3 ? 'badge-danger' : 'badge-info'}`}>
                        #{c.rank}
                      </span>
                    </td>
                    <td><strong>{c.cause}</strong></td>
                    <td>{c.product}</td>
                    <td>{c.process}</td>
                    <td style={{ textAlign: 'right' }} className="text-positive">
                      {c.impact}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 분석 요약 */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff, #f0f9ff)' }}>
            <h3 className="card-title">분석 결과 요약</h3>
            <div style={{ fontSize: 13, lineHeight: 2, color: '#334155' }}>
              <p>총 <strong>{result.varianceCount}건</strong>의 차이 항목이 식별되었으며, Neo4j 그래프에 <strong>{result.graphNodes}개 노드</strong>와 <strong>{result.graphEdges}개 관계</strong>가 구축되었습니다.</p>
              <p><strong>{result.rulesApplied}개 인과관계 규칙</strong>을 적용하여 <strong>{result.causalEdges}개의 원인-결과 연결</strong>을 자동으로 도출하였고, LLM을 통해 <strong>{result.interpretCount}건의 해석 코멘트</strong>를 생성하였습니다.</p>
              <p style={{ marginTop: 8, color: '#1e293b', fontWeight: 600 }}>
                💡 "그래프 탐색" 메뉴에서 인과관계 네트워크를 시각적으로 탐색하거나, "질의응답" 메뉴에서 자연어로 원가 변동에 대해 질문할 수 있습니다.
              </p>
            </div>
          </div>
        </>
      )}

      {/* 프로세스 단계 설명 (결과 없을 때 표시) */}
      {!result && (
        <div className="card">
          <h3 className="card-title">{t('analysis.processSteps')}</h3>
          <table>
            <thead>
              <tr>
                <th>단계</th>
                <th>설명</th>
                <th>세부 내용</th>
              </tr>
            </thead>
            <tbody>
              {STEP_DEFS.map((step, i) => (
                <tr key={step.id}>
                  <td>{i === 0 ? 'Step 1-2' : `Step ${step.id.replace('step', '')}`}</td>
                  <td>{step.label}</td>
                  <td style={{ fontSize: 13, color: '#64748b' }}>{step.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
