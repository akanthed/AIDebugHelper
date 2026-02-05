
import React, { useState } from 'react';
import { analyzeCode, detectLanguage } from '../utils/patterns';
import { CheckCircle, XCircle, Play, Loader } from 'lucide-react';

interface TestCase {
    id: number;
    name: string;
    description: string;
    run: () => TestResult;
}

interface TestResult {
    passed: boolean;
    details: string;
    time: number;
}

export const TestSuite: React.FC = () => {
    const [results, setResults] = useState<Record<number, TestResult>>({});
    const [running, setRunning] = useState(false);
    const [overallPassRate, setOverallPassRate] = useState(0);

    const testCases: TestCase[] = [
        // ============ JavaScript/TypeScript Tests ============
        {
            id: 1,
            name: '[JS] Detect isEmpty() Hallucination',
            description: 'Array.isEmpty() does not exist in JavaScript',
            run: () => {
                const input = 'const a = []; a.isEmpty();';
                const start = performance.now();
                const issues = analyzeCode(input, 'javascript');
                const passed = issues.some(i => i.description.includes('isEmpty'));
                return { passed, details: passed ? 'Detected isEmpty hallucination' : 'Failed to detect', time: performance.now() - start };
            }
        },
        {
            id: 2,
            name: '[JS] Detect Promise without catch()',
            description: 'fetch().then() should have .catch()',
            run: () => {
                const input = 'fetch("url").then(r => r.json())';
                const start = performance.now();
                const issues = analyzeCode(input, 'javascript');
                const passed = issues.some(i => i.type === 'Missing Error Handling');
                return { passed, details: passed ? 'Found missing catch' : 'Failed', time: performance.now() - start };
            }
        },
        {
            id: 3,
            name: '[JS] Detect var Usage',
            description: 'var should be replaced with let/const',
            run: () => {
                const input = 'var x = 1;';
                const start = performance.now();
                const issues = analyzeCode(input, 'javascript');
                const passed = issues.some(i => i.id.includes('var-usage'));
                return { passed, details: passed ? 'Detected var usage' : 'Failed', time: performance.now() - start };
            }
        },
        {
            id: 4,
            name: '[JS] Detect Hardcoded Secrets',
            description: 'API_KEY should use env variables',
            run: () => {
                const input = 'const API_KEY = "sk-12345abcdef"';
                const start = performance.now();
                const issues = analyzeCode(input, 'javascript');
                const passed = issues.some(i => i.id.includes('hardcoded-secrets'));
                return { passed, details: passed ? 'Detected secret' : 'Failed', time: performance.now() - start };
            }
        },
        {
            id: 5,
            name: '[JS] Detect Loose Equality',
            description: '== should be ===',
            run: () => {
                const input = 'if (x == 5) {}';
                const start = performance.now();
                const issues = analyzeCode(input, 'javascript');
                const passed = issues.some(i => i.id.includes('loose-equality'));
                return { passed, details: passed ? 'Detected loose equality' : 'Failed', time: performance.now() - start };
            }
        },

        // ============ Python Tests ============
        {
            id: 6,
            name: '[PY] Detect Hallucinated TensorFlow',
            description: 'tensorflow.advanced does not exist',
            run: () => {
                const input = 'import tensorflow.advanced as tf';
                const start = performance.now();
                const issues = analyzeCode(input, 'python');
                const passed = issues.some(i => i.id.includes('hallucinated'));
                return { passed, details: `Found ${issues.length} issues`, time: performance.now() - start };
            }
        },
        {
            id: 7,
            name: '[PY] Detect time.clock() Deprecated',
            description: 'time.clock() removed in Python 3.8',
            run: () => {
                const input = 'import time\nresult = time.clock()';
                const start = performance.now();
                const issues = analyzeCode(input, 'python');
                const passed = issues.some(i => i.description.includes('deprecated'));
                return { passed, details: passed ? 'Detected deprecated' : 'Failed', time: performance.now() - start };
            }
        },
        {
            id: 8,
            name: '[PY] Detect Mutable Default Arg',
            description: 'def func(items=[]) is dangerous',
            run: () => {
                const input = 'def process(items=[]):\n    items.append(1)';
                const start = performance.now();
                const issues = analyzeCode(input, 'python');
                const passed = issues.some(i => i.id.includes('mutable-default'));
                return { passed, details: passed ? 'Detected mutable default' : 'Failed', time: performance.now() - start };
            }
        },
        {
            id: 9,
            name: '[PY] Detect Bare Except',
            description: 'except: should specify exception type',
            run: () => {
                const input = 'try:\n    x = 1\nexcept:\n    pass';
                const start = performance.now();
                const issues = analyzeCode(input, 'python');
                const passed = issues.some(i => i.id.includes('bare-except'));
                return { passed, details: passed ? 'Detected bare except' : 'Failed', time: performance.now() - start };
            }
        },

        // ============ Go Tests ============
        {
            id: 10,
            name: '[GO] Detect Ignored Error',
            description: 'Error ignored with underscore',
            run: () => {
                const input = 'result, _ := someFunc()';
                const start = performance.now();
                const issues = analyzeCode(input, 'go');
                const passed = issues.some(i => i.id.includes('ignored-error'));
                return { passed, details: passed ? 'Detected ignored error' : 'Failed', time: performance.now() - start };
            }
        },
        {
            id: 11,
            name: '[GO] Detect try/catch Hallucination',
            description: 'Go does not have try/catch',
            run: () => {
                const input = 'try {\n    doSomething()\n}';
                const start = performance.now();
                const issues = analyzeCode(input, 'go');
                const passed = issues.some(i => i.id.includes('try-catch-go'));
                return { passed, details: passed ? 'Detected try/catch' : 'Failed', time: performance.now() - start };
            }
        },
        {
            id: 12,
            name: '[GO] Detect panic() Usage',
            description: 'panic() should be avoided',
            run: () => {
                const input = 'func main() {\n    panic("error")\n}';
                const start = performance.now();
                const issues = analyzeCode(input, 'go');
                const passed = issues.some(i => i.id.includes('panic-usage'));
                return { passed, details: passed ? 'Detected panic' : 'Failed', time: performance.now() - start };
            }
        },

        // ============ Rust Tests ============
        {
            id: 13,
            name: '[RS] Detect .unwrap() Usage',
            description: '.unwrap() can panic at runtime',
            run: () => {
                const input = 'let x = some_option.unwrap();';
                const start = performance.now();
                const issues = analyzeCode(input, 'rust');
                const passed = issues.some(i => i.id.includes('unwrap-usage'));
                return { passed, details: passed ? 'Detected unwrap' : 'Failed', time: performance.now() - start };
            }
        },
        {
            id: 14,
            name: '[RS] Detect Unsafe Block',
            description: 'Unsafe blocks bypass Rust safety',
            run: () => {
                const input = 'unsafe {\n    *ptr = 5;\n}';
                const start = performance.now();
                const issues = analyzeCode(input, 'rust');
                const passed = issues.some(i => i.id.includes('unsafe-block'));
                return { passed, details: passed ? 'Detected unsafe' : 'Failed', time: performance.now() - start };
            }
        },
        {
            id: 15,
            name: '[RS] Detect &String Instead of &str',
            description: '&str is preferred over &String',
            run: () => {
                const input = 'fn greet(name: &String) {}';
                const start = performance.now();
                const issues = analyzeCode(input, 'rust');
                const passed = issues.some(i => i.id.includes('string-borrow'));
                return { passed, details: passed ? 'Detected &String' : 'Failed', time: performance.now() - start };
            }
        },

        // ============ C++ Tests ============
        {
            id: 16,
            name: '[C++] Detect gets() Usage',
            description: 'gets() is unsafe, use fgets()',
            run: () => {
                const input = 'char buf[100];\ngets(buf);';
                const start = performance.now();
                const issues = analyzeCode(input, 'cpp');
                const passed = issues.some(i => i.id.includes('gets-usage'));
                return { passed, details: passed ? 'Detected gets' : 'Failed', time: performance.now() - start };
            }
        },
        {
            id: 17,
            name: '[C++] Detect malloc Usage',
            description: 'Use new/smart pointers in C++',
            run: () => {
                const input = 'int* ptr = (int*)malloc(sizeof(int));';
                const start = performance.now();
                const issues = analyzeCode(input, 'cpp');
                const passed = issues.some(i => i.id.includes('malloc-usage'));
                return { passed, details: passed ? 'Detected malloc' : 'Failed', time: performance.now() - start };
            }
        },
        {
            id: 18,
            name: '[C++] Detect strcpy() Usage',
            description: 'strcpy() is unsafe',
            run: () => {
                const input = 'strcpy(dest, src);';
                const start = performance.now();
                const issues = analyzeCode(input, 'cpp');
                const passed = issues.some(i => i.id.includes('strcpy-usage'));
                return { passed, details: passed ? 'Detected strcpy' : 'Failed', time: performance.now() - start };
            }
        },

        // ============ Java Tests ============
        {
            id: 19,
            name: '[JAVA] Detect String == Comparison',
            description: 'Use .equals() for strings',
            run: () => {
                const input = 'if (str == "hello") {}';
                const start = performance.now();
                const issues = analyzeCode(input, 'java');
                const passed = issues.some(i => i.id.includes('string-equals'));
                return { passed, details: passed ? 'Detected string ==' : 'Failed', time: performance.now() - start };
            }
        },
        {
            id: 20,
            name: '[JAVA] Detect printStackTrace()',
            description: 'Use proper logging instead',
            run: () => {
                const input = 'catch (Exception e) {\n    e.printStackTrace();\n}';
                const start = performance.now();
                const issues = analyzeCode(input, 'java');
                const passed = issues.some(i => i.id.includes('printStackTrace'));
                return { passed, details: passed ? 'Detected printStackTrace' : 'Failed', time: performance.now() - start };
            }
        },

        // ============ Universal Tests ============
        {
            id: 21,
            name: '[ALL] Detect SQL Injection Risk',
            description: 'String concatenation in SQL',
            run: () => {
                const input = 'query = "SELECT * FROM users WHERE id=" + userId';
                const start = performance.now();
                const issues = analyzeCode(input, 'javascript');
                const passed = issues.some(i => i.id.includes('sql-injection'));
                return { passed, details: passed ? 'Detected SQL injection' : 'Failed', time: performance.now() - start };
            }
        },
        {
            id: 22,
            name: '[ALL] Detect eval() Usage',
            description: 'eval() is a security risk',
            run: () => {
                const input = 'eval(userInput);';
                const start = performance.now();
                const issues = analyzeCode(input, 'javascript');
                const passed = issues.some(i => i.id.includes('eval-usage'));
                return { passed, details: passed ? 'Detected eval' : 'Failed', time: performance.now() - start };
            }
        },
        {
            id: 23,
            name: '[ALL] Detect TODO Comments',
            description: 'TODO should be resolved',
            run: () => {
                const input = '// TODO: fix this later\nconst x = 1;';
                const start = performance.now();
                const issues = analyzeCode(input, 'javascript');
                const passed = issues.some(i => i.id.includes('todo-comment'));
                return { passed, details: passed ? 'Detected TODO' : 'Failed', time: performance.now() - start };
            }
        },

        // ============ Language Detection Tests ============
        {
            id: 24,
            name: 'Language Detection: Python',
            description: 'Detect Python from code',
            run: () => {
                const input = 'def my_func():\n    pass';
                const start = performance.now();
                const lang = detectLanguage(input);
                const passed = lang === 'python';
                return { passed, details: `Detected: ${lang}`, time: performance.now() - start };
            }
        },
        {
            id: 25,
            name: 'Language Detection: Rust',
            description: 'Detect Rust from code',
            run: () => {
                const input = 'fn main() -> Result<(), Error> {\n    Ok(())\n}';
                const start = performance.now();
                const lang = detectLanguage(input);
                const passed = lang === 'rust';
                return { passed, details: `Detected: ${lang}`, time: performance.now() - start };
            }
        }
    ];

    const runAllTests = async () => {
        setRunning(true);
        setResults({});

        // Run sequentially with small delay for UI updates
        for (const test of testCases) {
            await new Promise(r => setTimeout(r, 100)); // UI delay
            const result = test.run();
            setResults(prev => ({ ...prev, [test.id]: result }));
        }

        // Calculate pass rate
        setTimeout(() => {
            const allResults = testCases.map(t => results[t.id] || t.run()); // Ensure strictly up to date
            const passed = allResults.filter(r => r.passed).length;
            setOverallPassRate((passed / testCases.length) * 100);
            setRunning(false);
        }, 500);
    };

    return (
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Automated Test Suite</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Validating detection engine integrity.</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: running ? 'var(--color-warning)' : (overallPassRate === 100 ? 'var(--color-success)' : 'var(--text-primary)') }}>
                            {running ? '...' : `${overallPassRate}%`}
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>PASS RATE</span>
                    </div>
                </div>

                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Total Tests:</span>
                        <strong>{testCases.length}</strong>
                    </div>
                    <button className="btn btn-primary" onClick={runAllTests} disabled={running}>
                        {running ? <Loader className="spin" size={16} /> : <Play size={16} />} Run All Tests
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {testCases.map(test => {
                        const result = results[test.id];
                        return (
                            <div key={test.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px'
                            }}>
                                <div style={{ marginRight: '1rem' }}>
                                    {result ? (
                                        result.passed ? <CheckCircle color="var(--color-success)" size={20} /> : <XCircle color="var(--color-critical)" size={20} />
                                    ) : (
                                        <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #333' }}></div>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: 0, fontSize: '1rem' }}>{test.name}</h4>
                                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{test.description}</p>
                                </div>
                                {result && (
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            background: result.passed ? 'rgba(0,255,100,0.1)' : 'rgba(255,0,0,0.1)',
                                            color: result.passed ? 'var(--color-success)' : 'var(--color-critical)',
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '4px'
                                        }}>
                                            {result.passed ? 'PASS' : 'FAIL'}
                                        </span>
                                        <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.3rem' }}>
                                            {result.time.toFixed(2)}ms
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {Object.keys(results).length > 0 && (
                    <div style={{ marginTop: '2rem', padding: '1rem', background: '#000', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#888', maxHeight: '200px', overflow: 'auto' }}>
                        <div style={{ color: '#fff', marginBottom: '0.5rem' }}>// Console Output</div>
                        {testCases.map(t => results[t.id] ? (
                            <div key={t.id} style={{ color: results[t.id].passed ? 'var(--color-success)' : 'var(--color-critical)' }}>
                                [{results[t.id].passed ? 'OK' : 'ERR'}] {t.name}: {results[t.id].details}
                            </div>
                        ) : null)}
                    </div>
                )}
            </div>
        </div>
    );
};
