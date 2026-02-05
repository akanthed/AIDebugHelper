
import React from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';

interface CodeInputProps {
    code: string;
    setCode: (code: string) => void;
    language: string;
}

export const CodeInput: React.FC<CodeInputProps> = ({ code, setCode, language }) => {
    return (
        <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '1px' }}>SOURCE CODE</span>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{code.split('\n').length} Lines</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{code.length} Chars</span>
                </div>
            </div>
            <div style={{ flex: 1, overflow: 'auto', position: 'relative', background: '#0d0d0d', minHeight: 0 }}>
                <CodeEditor
                    value={code}
                    language={language}
                    placeholder="Paste your AI-generated code here..."
                    onChange={(evn) => setCode(evn.target.value)}
                    padding={20}
                    style={{
                        fontSize: 14,
                        backgroundColor: 'transparent',
                        fontFamily: "'Fira Code', Consolas, monospace",
                        minHeight: '100%',
                    }}
                    data-color-mode="dark"
                />
            </div>
        </div>
    );
};
