import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { reportApi } from '../../services/api'

/* ── 비즈니스 관점 차이유형 라벨 ── */
const CE_NAMES: Record<string, string> = {
  CE_DEP: '감가상각비', CE_LAB: '인건비', CE_PWR: '전력비',
  CE_MAT: '재료비', CE_MNT: '수선유지비', CE_GAS: '기료비', CE_OTH: '기타경비',
}

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

/* ── 경영진 보고서 ── */
function ExecutiveReport({ data }: { data: any }) {
  const { t } = useTranslation()
  const tc = data.total_cost
  const diff = (tc.curr || 0) - (tc.prev || 0)
  const rate = tc.prev ? (diff / tc.prev * 100) : 0

  const getVarLabel = (varType: string, ceCd?: string): string => {
    const ceName = ceCd ? (CE_NAMES[ceCd] || ceCd) : ''
    switch (varType) {
      case 'RATE_VAR':  return t('report.varLabels.rateVar')
      case 'QTY_VAR':   return t('report.varLabels.qtyVar')
      case 'RATE_COST': return t('report.varLabels.rateCost', { ceName })
      case 'RATE_BASE': return t('report.varLabels.rateBase')
      case 'PRICE_VAR': return t('report.varLabels.priceVar')
      case 'USAGE_VAR': return t('report.varLabels.usageVar')
      default: return varType
    }
  }

  return (
    <>
      {/* 총원가 요약 */}
      <div className="report-summary-bar">
        <div className="report-summary-item">
          <span className="report-summary-label">{t('report.currentMonthTotal')}</span>
          <span className="report-summary-value">{tc.curr?.toFixed(1)} 억원</span>
        </div>
        <div className="report-summary-arrow">{diff >= 0 ? '▲' : '▼'}</div>
        <div className="report-summary-item">
          <span className="report-summary-label">{t('report.prevMonthTotal')}</span>
          <span className="report-summary-value">{tc.prev?.toFixed(1)} 억원</span>
        </div>
        <div className="report-summary-item">
          <span className="report-summary-label">{t('report.thChange')}</span>
          <span className={`report-summary-value ${diff >= 0 ? 'text-positive' : 'text-negative'}`}>
            {diff >= 0 ? '+' : ''}{diff.toFixed(1)} 억원 ({rate >= 0 ? '+' : ''}{rate.toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* 제품군별 증감 */}
      <div className="card">
        <h3 className="card-title">{t('report.productGroupChange')}</h3>
        {data.by_product_group?.length > 0 && (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.by_product_group}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="product_grp" tick={{ fontSize: 13 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}억원`} />
              <Bar dataKey="diff" name={t('report.thChange')} radius={[4, 4, 0, 0]}>
                {data.by_product_group.map((d: any, i: number) => (
                  <Cell key={i} fill={d.diff >= 0 ? '#ef4444' : '#22c55e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
        <table style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>{t('report.thProductGroup')}</th>
              <th style={{ textAlign: 'right' }}>{t('report.thCurrent')}</th>
              <th style={{ textAlign: 'right' }}>{t('report.thPrevious')}</th>
              <th style={{ textAlign: 'right' }}>{t('report.thChange')}</th>
              <th style={{ textAlign: 'right' }}>{t('report.thChangeRate')}</th>
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
          </tbody>
        </table>
      </div>
    </>
  )
}

/* ── 원가팀 보고서 ── */
function CostTeamReport({ data }: { data: any }) {
  const { t } = useTranslation()

  const getVarLabel = (varType: string, ceCd?: string): string => {
    const ceName = ceCd ? (CE_NAMES[ceCd] || ceCd) : ''
    switch (varType) {
      case 'RATE_VAR':  return t('report.varLabels.rateVar')
      case 'QTY_VAR':   return t('report.varLabels.qtyVar')
      case 'RATE_COST': return t('report.varLabels.rateCost', { ceName })
      case 'RATE_BASE': return t('report.varLabels.rateBase')
      case 'PRICE_VAR': return t('report.varLabels.priceVar')
      case 'USAGE_VAR': return t('report.varLabels.usageVar')
      default: return varType
    }
  }

  return (
    <div className="card">
      <h3 className="card-title">{t('report.topVariances')}</h3>
      <table>
        <thead>
          <tr>
            <th>{t('report.thProductGroup')}</th>
            <th>{t('report.thProductCode')}</th>
            <th>{t('report.thProcess')}</th>
            <th>{t('report.thCostElement')}</th>
            <th>{t('report.thVarType')}</th>
            <th style={{ textAlign: 'right' }}>{t('report.thAmount')}</th>
            <th style={{ textAlign: 'right' }}>{t('report.thChangeRate')}</th>
          </tr>
        </thead>
        <tbody>
          {data.top_variances?.map((v: any, i: number) => (
            <tr key={i}>
              <td>{v.product_grp}</td>
              <td><strong>{v.product_cd}</strong></td>
              <td>{v.proc_cd}</td>
              <td>{v.ce_cd}</td>
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
  )
}

/* ── 생산팀 보고서 ── */
function ProductionTeamReport({ data }: { data: any }) {
  const { t } = useTranslation()

  const getVarLabel = (varType: string, ceCd?: string): string => {
    const ceName = ceCd ? (CE_NAMES[ceCd] || ceCd) : ''
    switch (varType) {
      case 'RATE_VAR':  return t('report.varLabels.rateVar')
      case 'QTY_VAR':   return t('report.varLabels.qtyVar')
      case 'RATE_COST': return t('report.varLabels.rateCost', { ceName })
      case 'RATE_BASE': return t('report.varLabels.rateBase')
      case 'PRICE_VAR': return t('report.varLabels.priceVar')
      case 'USAGE_VAR': return t('report.varLabels.usageVar')
      default: return varType
    }
  }

  return (
    <>
      <div className="card">
        <h3 className="card-title">{t('report.mesEvents')}</h3>
        <table>
          <thead>
            <tr>
              <th>{t('report.thEquipCode')}</th>
              <th>{t('report.thEquipName')}</th>
              <th>{t('report.thMetric')}</th>
              <th style={{ textAlign: 'right' }}>{t('report.thPrevious')}</th>
              <th style={{ textAlign: 'right' }}>{t('report.thCurrent')}</th>
              <th style={{ textAlign: 'right' }}>{t('report.thChange')}</th>
              <th style={{ textAlign: 'right' }}>{t('report.thChangeRate')}</th>
            </tr>
          </thead>
          <tbody>
            {data.mes_events?.map((e: any, i: number) => (
              <tr key={i}>
                <td><strong>{e.equip_cd}</strong></td>
                <td>{e.equip_nm}</td>
                <td><span className="badge badge-info">{e.metric_type}</span></td>
                <td style={{ textAlign: 'right' }}>{e.prev_value}</td>
                <td style={{ textAlign: 'right' }}>{e.curr_value}</td>
                <td style={{ textAlign: 'right' }} className={e.chg_value >= 0 ? 'text-positive' : 'text-negative'}>
                  {e.chg_value >= 0 ? '+' : ''}{e.chg_value}
                </td>
                <td style={{ textAlign: 'right' }} className={e.chg_rate >= 0 ? 'text-positive' : 'text-negative'}>
                  {(e.chg_rate * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.cost_impacts?.length > 0 && (
        <div className="card">
          <h3 className="card-title">{t('report.costImpactAnalysis')}</h3>
          <table>
            <thead>
              <tr>
                <th>{t('report.thEquipment')}</th>
                <th>{t('report.thProduct')}</th>
                <th>{t('report.thVarType')}</th>
                <th style={{ textAlign: 'right' }}>{t('report.thImpactAmount')}</th>
                <th style={{ textAlign: 'right' }}>{t('report.thImpactRate')}</th>
              </tr>
            </thead>
            <tbody>
              {data.cost_impacts.map((c: any, i: number) => (
                <tr key={i}>
                  <td>{c.equipment}</td>
                  <td><strong>{c.product}</strong></td>
                  <td><span className="badge badge-info">{getVarLabel(c.var_type, c.ce_cd)}</span></td>
                  <td style={{ textAlign: 'right' }} className="text-positive">
                    {c.var_amt >= 0 ? '+' : ''}{c.var_amt?.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right' }} className="text-positive">
                    {(c.var_rate * 100)?.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

/* ── 구매팀 보고서 ── */
function PurchaseTeamReport({ data }: { data: any }) {
  const { t } = useTranslation()

  const getVarLabel = (varType: string, ceCd?: string): string => {
    const ceName = ceCd ? (CE_NAMES[ceCd] || ceCd) : ''
    switch (varType) {
      case 'RATE_VAR':  return t('report.varLabels.rateVar')
      case 'QTY_VAR':   return t('report.varLabels.qtyVar')
      case 'RATE_COST': return t('report.varLabels.rateCost', { ceName })
      case 'RATE_BASE': return t('report.varLabels.rateBase')
      case 'PRICE_VAR': return t('report.varLabels.priceVar')
      case 'USAGE_VAR': return t('report.varLabels.usageVar')
      default: return varType
    }
  }

  return (
    <>
      <div className="card">
        <h3 className="card-title">{t('report.purchaseEvents')}</h3>
        <table>
          <thead>
            <tr>
              <th>{t('report.thMatCode')}</th>
              <th>{t('report.thMatName')}</th>
              <th>{t('report.thChangeType')}</th>
              <th style={{ textAlign: 'right' }}>{t('report.thBefore')}</th>
              <th style={{ textAlign: 'right' }}>{t('report.thAfter')}</th>
              <th style={{ textAlign: 'right' }}>{t('report.thChangeRate')}</th>
              <th>{t('report.thReason')}</th>
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
                <td>{e.chg_reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.cost_impacts?.length > 0 && (
        <div className="card">
          <h3 className="card-title">{t('report.costImpactAnalysis')}</h3>
          <table>
            <thead>
              <tr>
                <th>{t('report.thMaterial')}</th>
                <th>{t('report.thProduct')}</th>
                <th>{t('report.thVarType')}</th>
                <th style={{ textAlign: 'right' }}>{t('report.thImpactAmount')}</th>
                <th style={{ textAlign: 'right' }}>{t('report.thImpactRate')}</th>
              </tr>
            </thead>
            <tbody>
              {data.cost_impacts.map((c: any, i: number) => (
                <tr key={i}>
                  <td>{c.material}</td>
                  <td><strong>{c.product}</strong></td>
                  <td>
                    <span className="badge badge-warning">
                      {getVarLabel(c.var_type, c.ce_cd)}
                    </span>
                  </td>
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
    </>
  )
}

/* ── 메인 보고서 페이지 ── */
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
