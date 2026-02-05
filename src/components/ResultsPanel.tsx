
import React, { useState } from 'react';
import type { Issue } from '../utils/patterns';
import { AlertTriangle, XCircle, Info, CheckCircle, ChevronDown, ChevronRight, Copy, Download } from 'lucide-react';

interface ResultsPanelProps {
    issues: Issue[];
    healthScore: number;
    analyzing: boolean;
    onApplyFix: (issue: Issue) => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ issues, healthScore, analyzing, onApplyFix }) => {
    const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedIssue(expandedIssue === id ? null : id);
    };

    const getSeverityWeight = (s: string) => {
        if (s === 'Critical') return 3;
        if (s === 'Warning') return 2;
        return 1;
    };

    const sortedIssues = [...issues].sort((a, b) => {
        const weightDiff = getSeverityWeight(b.severity) - getSeverityWeight(a.severity);
        if (weightDiff !== 0) return weightDiff;
        return a.line - b.line;
    });

    const criticalCount = issues.filter(i => i.severity === 'Critical').length;
    const warningCount = issues.filter(i => i.severity === 'Warning').length;
    const infoCount = issues.filter(i => i.severity === 'Info').length;

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'var(--color-success)';
        if (score >= 70) return 'var(--color-warning)';
        return 'var(--color-critical)';
    };

    const exportReport = () => {
        const date = new Date().toLocaleString();
        let md = `# AI Debug Report - ${date}\n`;
        md += `Health Score: ${healthScore}/100\n\n`;
        md += `## Detected Issues\n\n`;

        if (issues.length === 0) {
            md += "No issues found. Good job!";
        } else {
            issues.forEach(issue => {
                md += `### [${issue.severity}] ${issue.type} (Line ${issue.line})\n`;
                md += `**Description:** ${issue.description}\n`;
                md += `**Why:** ${issue.why}\n`;
                md += `**Fix:** \`${issue.fix}\`\n`;
                md += `**Replacement Code:**\n\`\`\`\n${issue.replacement || ''}\n\`\`\`\n\n`;
            });
        }

        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `debug-report-${Date.now()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (analyzing) {
        return (
            <div className="glass-panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <div className="loading-spinner" style={{
                    border: '4px solid rgba(255,255,255,0.1)',
                    borderLeft: '4px solid var(--color-accent)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Analyzing patterns...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header Stats */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Analysis Results</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button className="btn btn-secondary" onClick={exportReport} title="Export Markdown Report" style={{ padding: '0.4rem' }}>
                            <Download size={16} />
                        </button>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 800, color: getScoreColor(healthScore), lineHeight: 1 }}>
                                {healthScore}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div className="badge badge-critical" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <XCircle size={14} /> {criticalCount} Critical
                    </div>
                    <div className="badge badge-warning" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <AlertTriangle size={14} /> {warningCount} Warnings
                    </div>
                    <div className="badge badge-info" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <Info size={14} /> {infoCount} Info
                    </div>
                </div>
            </div>

            {/* Issues List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {sortedIssues.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        <CheckCircle size={48} style={{ color: 'var(--color-success)', marginBottom: '1rem' }} />
                        <h3>No Issues Detected</h3>
                        <p>Great job! Your code looks clean.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {sortedIssues.map(issue => (
                            <div key={issue.id} style={{
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                overflow: 'hidden'
                            }}>
                                <div
                                    onClick={() => toggleExpand(issue.id)}
                                    style={{
                                        padding: '1rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        background: expandedIssue === issue.id ? 'rgba(255,255,255,0.05)' : 'transparent'
                                    }}
                                >
                                    {issue.severity === 'Critical' && <XCircle size={20} color="var(--color-critical)" />}
                                    {issue.severity === 'Warning' && <AlertTriangle size={20} color="var(--color-warning)" />}
                                    {issue.severity === 'Info' && <Info size={20} color="var(--color-info)" />}

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{issue.type}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>Line {issue.line}</span>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                                            {issue.description}
                                        </div>
                                    </div>

                                    {expandedIssue === issue.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                </div>

                                {expandedIssue === issue.id && (
                                    <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
                                        <div style={{ marginBottom: '0.8rem' }}>
                                            <strong style={{ color: 'var(--color-accent)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Why it matters</strong>
                                            <p style={{ margin: '0.3rem 0', fontSize: '0.9rem', color: '#ddd' }}>{issue.why}</p>
                                        </div>

                                        <div style={{ marginBottom: '1rem' }}>
                                            <strong style={{ color: 'var(--color-success)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Suggested Fix</strong>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                background: '#050505',
                                                padding: '0.8rem',
                                                borderRadius: '6px',
                                                marginTop: '0.4rem',
                                                fontFamily: "'Fira Code', monospace",
                                                fontSize: '0.85rem',
                                                border: '1px solid #333'
                                            }}>
                                                <code>{issue.replacement || issue.fix}</code>
                                                <button className="btn btn-secondary" style={{ padding: '0.3rem', fontSize: '0.8rem' }} onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(issue.replacement || issue.fix); }}>
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => onApplyFix(issue)}>
                                                Apply Fix
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
