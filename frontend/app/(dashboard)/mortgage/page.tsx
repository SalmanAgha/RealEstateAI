'use client';

import React, { useState } from 'react';
import { mortgageService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, ChevronDown, CheckCircle, XCircle, AlertTriangle, TrendingUp, TrendingDown, Minus, Download, Trophy } from 'lucide-react';

export default function MortgageAdvisorCopilot() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [ragLoading, setRagLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');
  const [ragQuery, setRagQuery] = useState('');
  const [ragAnswer, setRagAnswer] = useState('');
  const [showLib, setShowLib] = useState(false);
  const [formData, setFormData] = useState({
    monthly_income: 6000,
    monthly_expenses: 2500,
    total_savings: 50000,
    employment_type: 'full-time',
    credit_score: 750,
    existing_debt: 200,
    property_price: 350000,
    property_location: 'Berlin',
    down_payment: 70000,
    term_years: 30,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'employment_type' || name === 'property_location' ? value : Number(value)
    }));
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...formData,
        applicant_id: user?.id || 'anonymous',
      };
      const response = await mortgageService.analyze(payload);
      setResults(response);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Make sure the Mortgage API is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragQuery.trim()) return;
    setRagLoading(true);
    try {
      const response = await mortgageService.ask(ragQuery, user?.id || 'anonymous');
      setRagAnswer(response.answer);
    } catch {
      setRagAnswer('Failed to retrieve answer. Is the Mortgage API running?');
    } finally {
      setRagLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!results) return;
    setDownloadLoading(true);
    try {
      await mortgageService.downloadReport({
        ...formData,
        applicant_id: user?.id || 'anonymous',
      });
    } catch {
      // silent fail — user will not see a download
    } finally {
      setDownloadLoading(false);
    }
  };

  // Derived from results
  const m = results?.metrics;
  const approval = results?.approval;
  const risk = results?.risk_assessment;
  const justification = results?.decision_justification;
  const ai = results?.ai_explanation;
  const scenarios = results?.scenarios;
  const sensitivity = results?.sensitivity_analysis;
  const sensitivityRanking = results?.sensitivity_ranking;
  const constraints = results?.hard_constraints;
  const optimization = results?.optimization_actions;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', color: '#1a1a1a', fontFamily: 'inherit' }}>
      {/* Page Header */}
      <header style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '4px', color: '#111' }}>
            Mortgage Underwriting Assistant
          </h1>
          <p style={{ color: '#71717a', fontSize: '0.85rem' }}>
            Lender-style decision support for mortgage advisors operating in Germany.
          </p>
        </div>
        {results && (
          <button
            onClick={handleDownload}
            disabled={downloadLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '9px 16px', borderRadius: '8px',
              background: downloadLoading ? '#e4e4e7' : '#1e40af',
              color: downloadLoading ? '#71717a' : 'white',
              border: 'none', cursor: downloadLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: '0.15s'
            }}
          >
            <Download size={14} />
            {downloadLoading ? 'Generating...' : 'Download Report'}
          </button>
        )}
      </header>

      {/* Top Metrics Row (post-analysis only) */}
      {m && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' }}>
          <MetricCard label="Loan Amount" value={`€${m.loan_amount.toLocaleString()}`} />
          <MetricCard label="Monthly Payment" value={`€${m.monthly_payment.toLocaleString()}/mo`} />
          <MetricCard label="Interest Rate" value={`${m.annual_interest_rate}%`} />
          <MetricCard label="DTI Ratio" value={`${(m.dti * 100).toFixed(1)}%`} highlight={m.dti > 0.40 ? 'warn' : m.dti > 0.45 ? 'danger' : 'ok'} />
          <MetricCard label="LTV Ratio" value={`${(m.ltv * 100).toFixed(1)}%`} highlight={m.ltv > 0.90 ? 'warn' : m.ltv > 0.95 ? 'danger' : 'ok'} />
        </div>
      )}

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '290px 1fr', gap: '16px', alignItems: 'start' }}>

        {/* Left: Applicant Input Panel */}
        <section style={{ ...card, position: 'sticky', top: '72px' }}>
          <h2 style={panelTitle}>Applicant Profile</h2>
          <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
            <Field label="Monthly Income (€)" name="monthly_income" value={formData.monthly_income} onChange={handleChange} />
            <Field label="Monthly Expenses (€)" name="monthly_expenses" value={formData.monthly_expenses} onChange={handleChange} />
            <Field label="Total Savings (€)" name="total_savings" value={formData.total_savings} onChange={handleChange} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Field label="Credit Score" name="credit_score" value={formData.credit_score} onChange={handleChange} />
              <Field label="Existing Debt (€/mo)" name="existing_debt" value={formData.existing_debt} onChange={handleChange} />
            </div>
            <div style={divider} />
            <Field label="Property Price (€)" name="property_price" value={formData.property_price} onChange={handleChange} />
            <Field label="Down Payment (€)" name="down_payment" value={formData.down_payment} onChange={handleChange} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={fieldLabel}>Loan Term (yrs)</label>
                <select name="term_years" value={formData.term_years} onChange={handleChange} style={inputBase}>
                  {[10, 15, 20, 25, 30].map(y => <option key={y} value={y}>{y} years</option>)}
                </select>
              </div>
              <div>
                <label style={fieldLabel}>Employment</label>
                <select name="employment_type" value={formData.employment_type} onChange={handleChange} style={inputBase}>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="self-employed">Self-Employed</option>
                  <option value="contractor">Contractor</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#a1a1aa' : '#2563eb',
                color: 'white', padding: '11px',
                borderRadius: '8px', border: 'none',
                fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '4px', fontSize: '0.85rem',
                transition: '0.15s'
              }}
            >
              {loading ? 'Evaluating Application...' : 'Run Lender Evaluation'}
            </button>
            {error && <p style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '4px', textAlign: 'center' }}>{error}</p>}
          </form>
        </section>

        {/* Right: Results Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {results ? (
            <>
              {/* Row 1: Risk Assessment + Approval */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '16px' }}>

                {/* Lender Risk Assessment */}
                <section style={card}>
                  <SectionTitle>Lender Risk Assessment</SectionTitle>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {risk?.risk_flags?.map((flag: any) => (
                      <RiskCard key={flag.type} flag={flag} />
                    ))}
                  </div>
                </section>

                {/* Approval Analysis */}
                <section style={{
                  ...card,
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'center', alignItems: 'center', textAlign: 'center'
                }}>
                  <SectionTitle>Approval Analysis</SectionTitle>
                  <div style={{
                    fontSize: '3.2rem', fontWeight: 900,
                    color: approval?.approval_probability >= 85 ? '#16a34a' :
                      approval?.approval_probability >= 70 ? '#ca8a04' :
                        approval?.approval_probability >= 55 ? '#ea580c' : '#dc2626',
                    lineHeight: 1
                  }}>
                    {Math.round(approval?.approval_probability || 0)}%
                  </div>
                  <div style={{
                    fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase',
                    letterSpacing: '0.08em', marginTop: '8px',
                    color: approval?.approval_probability >= 70 ? '#16a34a' : '#dc2626'
                  }}>
                    {approval?.decision}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#71717a', marginTop: '6px' }}>
                    {approval?.confidence?.toUpperCase()} CONFIDENCE
                  </div>
                  <div style={{
                    marginTop: '16px', width: '100%',
                    background: '#f4f4f5', borderRadius: '6px',
                    padding: '10px', fontSize: '0.72rem', color: '#52525b', textAlign: 'left'
                  }}>
                    <div style={{ fontWeight: 700, marginBottom: '6px', color: '#3f3f46' }}>Score Breakdown</div>
                    {[
                      { label: 'DTI (40%)', val: approval?.subscores?.dti_score },
                      { label: 'LTV (30%)', val: approval?.subscores?.ltv_score },
                      { label: 'Credit (20%)', val: approval?.subscores?.credit_score },
                      { label: 'Savings (10%)', val: approval?.subscores?.savings_score },
                    ].map(s => (
                      <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span>{s.label}</span>
                        <span style={{ fontWeight: 700, color: s.val >= 75 ? '#16a34a' : s.val >= 45 ? '#ca8a04' : '#dc2626' }}>{s.val}/100</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Row 2: Decision Justification */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <section style={{ ...card, borderLeft: '3px solid #16a34a' }}>
                  <SectionTitle style={{ color: '#16a34a' }}>Why a Lender Would Approve</SectionTitle>
                  {justification?.positives?.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {justification.positives.map((p: string, i: number) => (
                        <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.84rem', color: '#374151', alignItems: 'flex-start' }}>
                          <CheckCircle size={14} color="#16a34a" style={{ marginTop: '2px', flexShrink: 0 }} />
                          {p}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ fontSize: '0.84rem', color: '#71717a' }}>No significant positives identified.</p>
                  )}
                </section>
                <section style={{ ...card, borderLeft: '3px solid #dc2626' }}>
                  <SectionTitle style={{ color: '#dc2626' }}>Why a Lender Would Hesitate</SectionTitle>
                  {justification?.concerns?.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {justification.concerns.map((c: string, i: number) => (
                        <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.84rem', color: '#374151', alignItems: 'flex-start' }}>
                          <AlertTriangle size={14} color="#dc2626" style={{ marginTop: '2px', flexShrink: 0 }} />
                          {c}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <li style={{ fontSize: '0.84rem', color: '#71717a', listStyle: 'none' }}>No major underwriting concerns identified.</li>
                  )}
                </section>
              </div>

              {/* Row 3: Hard Constraints */}
              <section style={card}>
                <SectionTitle>Hard Constraints Check</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {constraints?.constraints?.map((c: any) => (
                    <div key={c.name} style={{
                      padding: '12px',
                      borderRadius: '8px',
                      background: c.status === 'pass' ? '#f0fdf4' : '#fef2f2',
                      border: `1px solid ${c.status === 'pass' ? '#bbf7d0' : '#fecaca'}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        {c.status === 'pass'
                          ? <CheckCircle size={14} color="#16a34a" />
                          : <XCircle size={14} color="#dc2626" />}
                        <span style={{
                          fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase',
                          color: c.status === 'pass' ? '#16a34a' : '#dc2626', letterSpacing: '0.05em'
                        }}>
                          {c.status.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1f2937', marginBottom: '3px' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#4b5563' }}>
                        Value: <strong>{c.display_value}</strong>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#6b7280', marginTop: '3px' }}>{c.note}</div>
                    </div>
                  ))}
                </div>
                {constraints?.overall_status === 'fail' && (
                  <div style={{
                    marginTop: '12px', padding: '10px 14px',
                    background: '#fef2f2', borderRadius: '6px',
                    borderLeft: '3px solid #dc2626',
                    fontSize: '0.8rem', color: '#dc2626', fontWeight: 600
                  }}>
                    One or more hard constraints are in violation. This application may not qualify for standard lending products.
                  </div>
                )}
              </section>

              {/* Row 4: AI Advisor Evaluation */}
              <section style={card}>
                <SectionTitle>Professional Advisor Evaluation</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <AIPanel title="Case Summary" content={ai?.summary} />
                  <AIPanel title="Risk Assessment" content={ai?.risk_analysis} />
                  <div style={aiBox}>
                    <div style={aiLabel}>Recommendations</div>
                    <ul style={{ padding: '0 0 0 16px', margin: 0, fontSize: '0.83rem', color: '#374151', lineHeight: 1.65 }}>
                      {(Array.isArray(justification?.recommendations) ? justification.recommendations : []).map((r: any, i: number) => (
                        <li key={i} style={{ marginBottom: '6px' }}>
                          {typeof r === 'string' ? r : JSON.stringify(r)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Row 5: Strategic Scenarios */}
              <section style={card}>
                <SectionTitle>Strategic Scenarios</SectionTitle>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e4e4e7' }}>
                        {['Scenario', 'Key Change', 'Payment', 'DTI', 'LTV', 'Approval', 'Approval Reasoning'].map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', color: '#71717a', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {scenarios?.map((s: any, i: number) => {
                        const baseApproval = s.metrics_before?.approval_probability ?? 0;
                        const afterApproval = s.metrics_after?.approval_probability ?? 0;
                        const approvalDelta = Math.round(afterApproval - baseApproval);
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #f4f4f5' }}>
                            <td style={{ padding: '12px', fontWeight: 700, color: '#1f2937', whiteSpace: 'nowrap' }}>
                              <div style={{ fontSize: '0.82rem' }}>{s.scenario}</div>
                              <div style={{ fontSize: '0.68rem', color: '#71717a', fontWeight: 400 }}>{s.label}</div>
                            </td>
                            <td style={{ padding: '12px', color: '#374151', maxWidth: '180px' }}>
                              {s.input_changes?.[0] ?? '—'}
                            </td>
                            <td style={{ padding: '12px', fontWeight: 600 }}>
                              €{(s.metrics_after?.monthly_payment ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </td>
                            <td style={{ padding: '12px', fontWeight: 600 }}>
                              {((s.metrics_after?.dti ?? 0) * 100).toFixed(1)}%
                            </td>
                            <td style={{ padding: '12px', fontWeight: 600 }}>
                              {((s.metrics_after?.ltv ?? 0) * 100).toFixed(1)}%
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span style={{ fontWeight: 800, fontSize: '1rem', color: afterApproval >= 85 ? '#16a34a' : afterApproval >= 70 ? '#ca8a04' : '#dc2626' }}>
                                {Math.round(afterApproval)}%
                              </span>
                              <span style={{ marginLeft: '6px', fontSize: '0.72rem', fontWeight: 700, color: approvalDelta > 0 ? '#16a34a' : approvalDelta < 0 ? '#dc2626' : '#71717a' }}>
                                {approvalDelta > 0 ? `+${approvalDelta}` : approvalDelta === 0 ? '±0' : approvalDelta}pp
                              </span>
                            </td>
                            <td style={{ padding: '12px', color: '#4b5563', fontSize: '0.78rem', maxWidth: '220px' }}>
                              {s.interpretation}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Row 6: Sensitivity Analysis */}
              <section style={card}>
                <SectionTitle>Sensitivity Analysis</SectionTitle>
                <p style={{ fontSize: '0.78rem', color: '#71717a', marginBottom: '14px' }}>
                  Each row represents a full recomputation of metrics using modified inputs. Deltas are not estimated — they are exact.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {sensitivity?.map((item: any, i: number) => {
                    const delta = item.delta ?? 0;
                    const isPos = delta > 0;
                    const isNeg = delta < 0;
                    return (
                      <div key={i} style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 80px 80px 80px 1fr',
                        gap: '12px',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: '#fafafa',
                        borderRadius: '8px',
                        border: '1px solid #e4e4e7'
                      }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1f2937', marginBottom: '4px' }}>{item.change}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {item.metric_effects?.map((eff: string, j: number) => (
                              <div key={j} style={{ fontSize: '0.72rem', color: '#6b7280' }}>{eff}</div>
                            ))}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#a1a1aa', marginBottom: '3px', textTransform: 'uppercase' }}>Before</div>
                          <div style={{ fontWeight: 700, color: '#374151' }}>{item.before_approval}%</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#a1a1aa', marginBottom: '3px', textTransform: 'uppercase' }}>After</div>
                          <div style={{ fontWeight: 700, color: '#374151' }}>{item.after_approval}%</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#a1a1aa', marginBottom: '3px', textTransform: 'uppercase' }}>Delta</div>
                          <div style={{
                            fontWeight: 900, fontSize: '1rem',
                            color: isPos ? '#16a34a' : isNeg ? '#dc2626' : '#71717a',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px'
                          }}>
                            {isPos ? <TrendingUp size={14} /> : isNeg ? <TrendingDown size={14} /> : <Minus size={14} />}
                            {delta > 0 ? `+${delta}` : delta}%
                          </div>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                          {isPos ? 'Positive impact on approval probability.'
                            : isNeg ? 'Negative impact on approval probability.'
                              : 'No change — applicant may be at a ceiling or the change was insufficient to shift score bracket.'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Decision Sensitivity Ranking — the killer feature */}
              {sensitivityRanking && sensitivityRanking.length > 0 && (
                <section style={card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <Trophy size={16} color="#ca8a04" />
                    <SectionTitle style={{ margin: 0, color: '#92400e' }}>Decision Sensitivity Ranking</SectionTitle>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#71717a', marginBottom: '14px' }}>
                    Ranked by impact on approval probability — shows which action moves the needle most.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sensitivityRanking.map((item: any, i: number) => {
                      const isPos = item.delta > 0;
                      const isNeg = item.delta < 0;
                      const rankColors = ['#ca8a04', '#6b7280', '#9ca3af'];
                      return (
                        <div key={i} style={{
                          display: 'grid',
                          gridTemplateColumns: '32px 1fr auto 140px',
                          gap: '12px', alignItems: 'center',
                          padding: '12px 16px',
                          background: i === 0 ? '#fffbeb' : '#fafafa',
                          borderRadius: '8px',
                          border: `1px solid ${i === 0 ? '#fde68a' : '#e4e4e7'}`,
                        }}>
                          <div style={{
                            width: '28px', height: '28px',
                            borderRadius: '50%',
                            background: rankColors[i] ?? '#d1d5db',
                            color: 'white', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontWeight: 900, fontSize: '0.78rem', flexShrink: 0
                          }}>
                            {item.rank}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1f2937' }}>{item.action}</div>
                            <div style={{ fontSize: '0.71rem', color: '#6b7280', marginTop: '2px' }}>{item.primary_driver}</div>
                          </div>
                          <div style={{
                            fontWeight: 900, fontSize: '1.1rem',
                            color: isPos ? '#16a34a' : isNeg ? '#dc2626' : '#71717a',
                            display: 'flex', alignItems: 'center', gap: '4px',
                            minWidth: '60px', justifyContent: 'flex-end'
                          }}>
                            {isPos ? <TrendingUp size={15} /> : isNeg ? <TrendingDown size={15} /> : <Minus size={15} />}
                            {item.delta_display}
                          </div>
                          <div style={{
                            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
                            padding: '3px 8px', borderRadius: '4px', textAlign: 'center',
                            background: item.impact_color === 'green' ? '#dcfce7'
                              : item.impact_color === 'amber' ? '#fef9c3' : '#f3f4f6',
                            color: item.impact_color === 'green' ? '#15803d'
                              : item.impact_color === 'amber' ? '#854d0e' : '#6b7280'
                          }}>
                            {item.impact_level}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Row 7: Lending Knowledge Base */}
              <section style={{ ...card, border: '1px solid #dbeafe' }}>
                <SectionTitle>Lending Knowledge Base</SectionTitle>
                <form onSubmit={handleAsk} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => setShowLib(!showLib)}
                      style={{
                        padding: '9px 12px', borderRadius: '7px',
                        border: '1px solid #bfdbfe',
                        background: '#eff6ff', color: '#2563eb',
                        display: 'flex', alignItems: 'center', gap: '5px',
                        cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600
                      }}
                    >
                      <BookOpen size={14} />
                      <ChevronDown size={12} style={{ transform: showLib ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                    </button>
                    {showLib && (
                      <div style={{
                        position: 'absolute', bottom: '100%', left: 0, marginBottom: '8px',
                        width: '300px', background: '#fff', border: '1px solid #e4e4e7',
                        borderRadius: '10px', padding: '6px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                        zIndex: 100
                      }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#a1a1aa', padding: '6px 10px', textTransform: 'uppercase' }}>Sample Regulatory Queries</div>
                        {[
                          { label: 'Self-Employed Rules', query: 'What are the standard German mortgage rules for self-employed applicants?' },
                          { label: 'Max LTV Guidelines', query: 'What is the maximum LTV allowed by German banks?' },
                          { label: 'Savings Buffer Rules', query: 'How much emergency savings should I keep after my down payment?' },
                          { label: 'DTI Limit Guidance', query: 'What are the standard DTI limits in Germany?' },
                          { label: '100% LTV Feasibility', query: 'Is it possible to get a 100% LTV mortgage in Germany?' }
                        ].map(item => (
                          <button key={item.label} type="button"
                            onClick={() => { setRagQuery(item.query); setShowLib(false); }}
                            style={{
                              display: 'block', width: '100%', textAlign: 'left',
                              padding: '8px 10px', borderRadius: '6px',
                              background: 'none', border: 'none', color: '#374151',
                              fontSize: '0.8rem', cursor: 'pointer'
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f4f4f5')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="text" value={ragQuery}
                    onChange={e => setRagQuery(e.target.value)}
                    placeholder="Ask about German mortgage regulations, DTI limits, LTV rules..."
                    style={{ ...inputBase, flex: 1, border: '1px solid #bfdbfe' }}
                  />
                  <button type="submit" disabled={ragLoading} style={{
                    background: '#2563eb', color: 'white', padding: '9px 18px',
                    borderRadius: '7px', border: 'none', cursor: 'pointer',
                    fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap'
                  }}>
                    {ragLoading ? 'Searching...' : 'Ask Knowledge Base'}
                  </button>
                </form>
                {ragAnswer && (
                  <div style={{
                    marginTop: '14px', padding: '14px', background: '#f8fafc',
                    borderRadius: '8px', fontSize: '0.84rem', lineHeight: 1.65,
                    color: '#1f2937', borderLeft: '3px solid #2563eb'
                  }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#2563eb', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Knowledge Base Response
                    </div>
                    {ragAnswer}
                  </div>
                )}
              </section>
            </>
          ) : (
            <div style={{
              minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px dashed #e4e4e7', borderRadius: '12px',
              color: '#a1a1aa', background: 'rgba(0,0,0,0.01)'
            }}>
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px', color: '#71717a' }}>Underwriting Evaluation Pending</p>
                <p style={{ fontSize: '0.82rem' }}>Submit the applicant profile to generate a full lender-style analysis.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function MetricCard({ label, value, highlight }: { label: string; value: string; highlight?: 'ok' | 'warn' | 'danger' }) {
  return (
    <div style={{
      background: '#fdfdfd', padding: '12px 14px',
      borderRadius: '10px', border: '1px solid #e4e4e7',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)', textAlign: 'center'
    }}>
      <div style={{ fontSize: '0.58rem', color: '#71717a', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 700, letterSpacing: '0.08em' }}>{label}</div>
      <div style={{
        fontSize: '1rem', fontWeight: 800,
        color: highlight === 'warn' ? '#ca8a04' : highlight === 'danger' ? '#dc2626' : '#111'
      }}>{value}</div>
    </div>
  );
}

function SectionTitle({ children, style }: any) {
  return (
    <h3 style={{
      fontSize: '0.62rem', fontWeight: 900, textTransform: 'uppercase',
      color: '#71717a', marginBottom: '14px', letterSpacing: '0.1em', ...style
    }}>
      {children}
    </h3>
  );
}

function RiskCard({ flag }: { flag: any }) {
  const levelColor = getRiskColor(flag.level);
  return (
    <div style={{
      padding: '12px', background: '#fff', borderRadius: '8px',
      border: '1px solid #e4e4e7', boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
    }}>
      <div style={{ fontSize: '0.6rem', color: '#a1a1aa', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
        {flag.label}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1f2937' }}>{flag.display}</span>
        <span style={{
          fontSize: '0.6rem', padding: '2px 7px', borderRadius: '4px',
          background: levelColor, color: 'white', fontWeight: 800, textTransform: 'uppercase', whiteSpace: 'nowrap'
        }}>
          {flag.level}
        </span>
      </div>
    </div>
  );
}

function AIPanel({ title, content }: { title: string; content?: string }) {
  return (
    <div style={aiBox}>
      <div style={aiLabel}>{title}</div>
      <p style={{ fontSize: '0.83rem', lineHeight: 1.65, color: '#374151', margin: 0 }}>
        {content || '—'}
      </p>
    </div>
  );
}

function Field({ label, name, value, onChange }: any) {
  return (
    <div>
      <label style={fieldLabel}>{label}</label>
      <input type="number" name={name} value={value} onChange={onChange} style={inputBase} required />
    </div>
  );
}

function getRiskColor(level: string) {
  const l = level?.toLowerCase() ?? '';
  if (l === 'safe' || l === 'strong' || l === 'excellent') return '#16a34a';
  if (l === 'adequate' || l === 'moderate' || l === 'good' || l === 'acceptable') return '#ca8a04';
  if (l === 'elevated' || l === 'weak' || l === 'fair') return '#ea580c';
  if (l === 'high risk' || l === 'very weak' || l === 'risky') return '#dc2626';
  return '#71717a';
}

// ─── Shared Styles ────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: '#fdfdfd', padding: '18px 20px',
  borderRadius: '12px', border: '1px solid #e4e4e7',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)', color: '#111'
};

const panelTitle: React.CSSProperties = {
  fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase',
  color: '#71717a', marginBottom: '14px', letterSpacing: '0.1em'
};

const fieldLabel: React.CSSProperties = {
  display: 'block', fontSize: '0.63rem', fontWeight: 700,
  color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase'
};

const inputBase: React.CSSProperties = {
  width: '100%', padding: '8px 10px', borderRadius: '6px',
  border: '1px solid #e4e4e7', background: '#fff',
  color: '#111', fontSize: '0.87rem', outline: 'none',
  boxSizing: 'border-box'
};

const divider: React.CSSProperties = {
  border: 'none', borderTop: '1px solid #f0f0f0', margin: '2px 0'
};

const aiBox: React.CSSProperties = {
  background: '#fff', padding: '14px',
  borderRadius: '10px', border: '1px solid #f0f0f0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
};

const aiLabel: React.CSSProperties = {
  display: 'block', fontSize: '0.6rem', fontWeight: 900,
  color: '#2563eb', marginBottom: '8px',
  textTransform: 'uppercase', letterSpacing: '0.05em'
};
