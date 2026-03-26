import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { analysisApi } from '../../services/api'

interface StatusEntry {
  msg: string
  type: 'running' | 'done' | 'error'
}

export default function AnalysisPage() {
  const { t } = useTranslation()
  const [yyyymm, setYyyymm] = useState('202501')
  const [status, setStatus] = useState<StatusEntry[]>([])
  const [loading, setLoading] = useState(false)

  const addStatus = (msg: string, type: StatusEntry['type'] = 'running') =>
    setStatus(prev => [...prev, { msg, type }])

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const runFullProcess = async () => {
    setLoading(true)
    setStatus([])

    try {
      addStatus(t('analysis.step3Running'), 'running')
      await delay(800)
      const calcResult = await analysisApi.calculateVariance(yyyymm)
      addStatus(t('analysis.step3Done', { count: calcResult.data.count }), 'done')

      addStatus(t('analysis.step4Running'), 'running')
      await delay(1200)
      await analysisApi.buildGraph(yyyymm)
      addStatus(t('analysis.step4Done'), 'done')

      addStatus(t('analysis.step4dRunning'), 'running')
      await delay(600)
      await analysisApi.runRules(yyyymm)
      addStatus(t('analysis.step4dDone'), 'done')

      addStatus(t('analysis.step5Running'), 'running')
      await delay(1500)
      const interpretResult = await analysisApi.interpret(yyyymm)
      addStatus(t('analysis.step5Done', { count: interpretResult.data.count }), 'done')

      addStatus(t('analysis.allDone'), 'done')
    } catch (error: any) {
      addStatus(t('analysis.errorOccurred', { message: error.message }), 'error')
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

      <div className="card">
        <h3 className="card-title">{t('analysis.monthlyProcess')}</h3>
        <div className="month-selector">
          <label>{t('analysis.baseMonth')}</label>
          <select value={yyyymm} onChange={e => setYyyymm(e.target.value)}>
            <option value="202501">{t('analysis.month202501')}</option>
            <option value="202412">{t('analysis.month202412')}</option>
          </select>
          <button
            className="btn btn-primary"
            onClick={runFullProcess}
            disabled={loading}
          >
            {loading ? t('analysis.running') : t('analysis.runAll')}
          </button>
        </div>

        <div style={{ marginTop: 16 }}>
          <h4>{t('analysis.executionLog')}</h4>
          <div style={{
            background: '#1e293b',
            color: '#94a3b8',
            padding: 16,
            borderRadius: 8,
            fontFamily: 'monospace',
            fontSize: 13,
            maxHeight: 400,
            overflowY: 'auto',
            marginTop: 8,
          }}>
            {status.length === 0 ? (
              <div style={{ color: '#64748b' }}>{t('analysis.logPlaceholder')}</div>
            ) : (
              status.map((entry, i) => (
                <div key={i} style={{
                  color: entry.type === 'done' ? '#4ade80' :
                         entry.type === 'error' ? '#f87171' : '#94a3b8'
                }}>
                  [{new Date().toLocaleTimeString()}] {entry.msg}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">{t('analysis.processSteps')}</h3>
        <table>
          <thead>
            <tr>
              <th>{t('analysis.thStep')}</th>
              <th>{t('analysis.thDescription')}</th>
              <th>{t('analysis.thDetail')}</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Step 1-2</td><td>{t('analysis.stepDataLoad')}</td><td>{t('analysis.stepDataLoadDetail')}</td></tr>
            <tr><td>Step 3</td><td>{t('analysis.stepCalc')}</td><td>{t('analysis.stepCalcDetail')}</td></tr>
            <tr><td>Step 4a</td><td>{t('analysis.stepGraph')}</td><td>{t('analysis.stepGraphDetail')}</td></tr>
            <tr><td>Step 4b</td><td>{t('analysis.stepVarNode')}</td><td>{t('analysis.stepVarNodeDetail')}</td></tr>
            <tr><td>Step 4c</td><td>{t('analysis.stepEventNode')}</td><td>{t('analysis.stepEventNodeDetail')}</td></tr>
            <tr><td>Step 4d</td><td>{t('analysis.stepCausal')}</td><td>{t('analysis.stepCausalDetail')}</td></tr>
            <tr><td>Step 5</td><td>{t('analysis.stepLLM')}</td><td>{t('analysis.stepLLMDetail')}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
