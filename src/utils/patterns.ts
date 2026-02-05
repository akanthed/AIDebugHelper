
export type Severity = 'Critical' | 'Warning' | 'Info';

export interface Issue {
    id: string;
    line: number;
    type: string;
    severity: Severity;
    description: string;
    fix: string;
    startIndex: number;
    endIndex: number;
    replacement: string;
    why: string;
}

export type Language = 'javascript' | 'typescript' | 'python' | 'go' | 'rust' | 'java' | 'cpp';

interface Pattern {
    id: string;
    type: string;
    severity: Severity;
    regex: RegExp;
    description: string;
    fixDescription: string;
    correction: (match: string) => string;
    why: string;
}

// ============================================
// UNIVERSAL PATTERNS (All Languages)
// ============================================

const SECURITY_PATTERNS: Pattern[] = [
    {
        id: 'hardcoded-secrets',
        type: 'Security Risk',
        severity: 'Critical',
        regex: /(API_KEY|SECRET|TOKEN|PASSWORD|PRIVATE_KEY|ACCESS_KEY|AUTH_TOKEN)\s*=\s*['"][^'"]{5,}['"]/i,
        description: 'Hardcoded secret detected',
        fixDescription: 'Use environment variables',
        correction: (match) => {
            const parts = match.split('=');
            return `${parts[0]}= process.env.${parts[0].trim().toUpperCase().replace(/\s/g, '_')}`;
        },
        why: 'Hardcoding secrets exposes them in version control. Use environment variables or secret managers.'
    },
    {
        id: 'sql-injection',
        type: 'Security Risk',
        severity: 'Critical',
        regex: /=\s*["'][^"']*(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)[^"']*["']\s*\+\s*\w+/i,
        description: 'Potential SQL injection vulnerability',
        fixDescription: 'Use parameterized queries',
        correction: (match) => '/* SQL INJECTION RISK: ' + match + ' */',
        why: 'String concatenation in SQL queries allows attackers to inject malicious SQL code.'
    },
    {
        id: 'eval-usage',
        type: 'Security Risk',
        severity: 'Critical',
        regex: /\beval\s*\(/,
        description: 'eval() usage detected',
        fixDescription: 'Avoid eval, use safer alternatives',
        correction: (match) => '// REMOVED: ' + match,
        why: 'eval() executes arbitrary code and is a major security vulnerability.'
    }
];

const RUNTIME_PATTERNS: Pattern[] = [
    {
        id: 'infinite-loop',
        type: 'Runtime Error',
        severity: 'Critical',
        regex: /while\s*\((?:true|1|True)\)/,
        description: 'Potential infinite loop',
        fixDescription: 'Ensure break condition exists',
        correction: (match) => match,
        why: 'Infinite loops freeze the application, causing denial of service.'
    },
    {
        id: 'division-by-zero',
        type: 'Runtime Error',
        severity: 'Warning',
        regex: /\/\s*0(?:[^\d.]|$)/,
        description: 'Potential division by zero',
        fixDescription: 'Add zero check',
        correction: (match) => match,
        why: 'Division by zero causes runtime errors or undefined behavior.'
    }
];

const QUALITY_PATTERNS: Pattern[] = [
    {
        id: 'todo-comment',
        type: 'Code Quality',
        severity: 'Info',
        regex: /(?:\/\/|#|\/\*)\s*(?:TODO|FIXME|HACK|XXX|BUG):?/i,
        description: 'Unresolved TODO/FIXME comment',
        fixDescription: 'Address or remove',
        correction: () => '',
        why: 'Production code should not have unresolved tasks.'
    },
    {
        id: 'debug-code',
        type: 'Code Quality',
        severity: 'Info',
        regex: /(?:debugger|console\.debug|System\.out\.print|fmt\.Print|println!)/,
        description: 'Debug code left in production',
        fixDescription: 'Remove debug statements',
        correction: () => '',
        why: 'Debug statements should be removed before production.'
    },
    {
        id: 'empty-catch',
        type: 'Code Quality',
        severity: 'Warning',
        regex: /catch\s*\([^)]*\)\s*\{\s*\}/,
        description: 'Empty catch block',
        fixDescription: 'Handle or log the error',
        correction: (match) => match.replace('{}', '{ console.error(err); }'),
        why: 'Empty catch blocks silently swallow errors, making debugging difficult.'
    }
];

// ============================================
// JAVASCRIPT / TYPESCRIPT PATTERNS
// ============================================

const JS_TS_PATTERNS: Pattern[] = [
    {
        id: 'hallucinated-isempty',
        type: 'Hallucination',
        severity: 'Critical',
        regex: /\.\s*isEmpty\s*\(\s*\)/,
        description: 'Array.isEmpty() does not exist in JS',
        fixDescription: 'Use .length === 0',
        correction: (_match) => '.length === 0',
        why: 'AI often hallucinates .isEmpty() from Java. In JS, use .length === 0.'
    },
    {
        id: 'hallucinated-contains',
        type: 'Hallucination',
        severity: 'Critical',
        regex: /\.\s*contains\s*\(/,
        description: 'Array.contains() does not exist in JS',
        fixDescription: 'Use .includes()',
        correction: (match) => match.replace('contains', 'includes'),
        why: 'Use .includes() for arrays or strings in JavaScript.'
    },
    {
        id: 'var-usage',
        type: 'Deprecated',
        severity: 'Warning',
        regex: /\bvar\s+\w+/,
        description: 'Using var instead of let/const',
        fixDescription: 'Use let or const',
        correction: (match) => match.replace('var', 'const'),
        why: 'var has function scope which leads to bugs. Use block-scoped let/const.'
    },
    {
        id: 'loose-equality',
        type: 'Code Quality',
        severity: 'Info',
        regex: /[^!=]==(?!=)/,
        description: 'Loose equality (==)',
        fixDescription: 'Use strict equality (===)',
        correction: (match) => match.replace('==', '==='),
        why: 'Type coercion in == leads to unexpected comparisons.'
    },
    {
        id: 'console-log',
        type: 'Code Quality',
        severity: 'Info',
        regex: /console\.(log|warn|error|info)\s*\([^;]*\);?/,
        description: 'Console statement in code',
        fixDescription: 'Comment out console statements',
        correction: (match) => '// ' + match,
        why: 'Console statements should be removed in production code.'
    },
    {
        id: 'promise-no-catch',
        type: 'Missing Error Handling',
        severity: 'Warning',
        regex: /\.then\s*\([^)]*\)(?!\s*\.catch)/,
        description: 'Promise without .catch()',
        fixDescription: 'Add .catch() handler',
        correction: (match) => match + '.catch(err => console.error(err))',
        why: 'Unhandled promise rejections can crash the application.'
    },
    {
        id: 'async-no-try',
        type: 'Missing Error Handling',
        severity: 'Warning',
        regex: /async\s+(?:function\s+\w+|\([^)]*\)\s*=>|\w+\s*=>)\s*\{(?![^}]*try)/,
        description: 'Async function without try-catch',
        fixDescription: 'Wrap in try-catch',
        correction: (match) => match,
        why: 'Async functions should handle errors with try-catch.'
    },
    {
        id: 'dangerously-set-html',
        type: 'Security Risk',
        severity: 'Critical',
        regex: /dangerouslySetInnerHTML/,
        description: 'dangerouslySetInnerHTML usage',
        fixDescription: 'Sanitize HTML or avoid',
        correction: (match) => match,
        why: 'Can lead to XSS attacks if HTML is not properly sanitized.'
    },
    {
        id: 'document-write',
        type: 'Security Risk',
        severity: 'Warning',
        regex: /document\.write\s*\(/,
        description: 'document.write() usage',
        fixDescription: 'Use DOM manipulation',
        correction: (match) => match,
        why: 'document.write() is outdated and can cause security/performance issues.'
    },
    {
        id: 'hallucinated-isnotempty',
        type: 'Hallucination',
        severity: 'Critical',
        regex: /\.\s*isNotEmpty\s*\(\s*\)/,
        description: 'Array.isNotEmpty() does not exist in JS',
        fixDescription: 'Use .length > 0',
        correction: (_match) => '.length > 0',
        why: 'AI hallucinates .isNotEmpty() from other languages. Use .length > 0.'
    },
    {
        id: 'hallucinated-remove',
        type: 'Hallucination',
        severity: 'Critical',
        regex: /\.\s*remove\s*\([^)]+\)/,
        description: 'Array.remove() does not exist in JS',
        fixDescription: 'Use .filter() or .splice()',
        correction: (match) => match.replace('.remove', '.filter'),
        why: 'Use .filter() to create a new array without the element, or .splice() to modify in place.'
    },
    {
        id: 'hallucinated-clear',
        type: 'Hallucination',
        severity: 'Critical',
        regex: /\w+\.\s*clear\s*\(\s*\)/,
        description: 'Array.clear() does not exist in JS',
        fixDescription: 'Use arr.length = 0',
        correction: (match) => match.replace('.clear()', '.length = 0'),
        why: 'To clear an array in JS, set .length = 0 or reassign to [].'
    },
    {
        id: 'missing-await-json',
        type: 'Runtime Error',
        severity: 'Critical',
        regex: /(?<!await\s+)response\.json\s*\(\s*\)/,
        description: 'Missing await on .json()',
        fixDescription: 'Add await keyword',
        correction: (match) => 'await ' + match,
        why: 'response.json() returns a Promise. Without await, you get the Promise, not the data.'
    },
    {
        id: 'missing-await-text',
        type: 'Runtime Error',
        severity: 'Critical',
        regex: /(?<!await\s+)response\.text\s*\(\s*\)/,
        description: 'Missing await on .text()',
        fixDescription: 'Add await keyword',
        correction: (match) => 'await ' + match,
        why: 'response.text() returns a Promise. Without await, you get the Promise, not the text.'
    }
];

// ============================================
// PYTHON PATTERNS
// ============================================

const PYTHON_PATTERNS: Pattern[] = [
    {
        id: 'mutable-default',
        type: 'Runtime Error',
        severity: 'Critical',
        regex: /def\s+\w+\s*\([^)]*=\s*(\[\]|\{\}|\set\(\))[^)]*\)\s*:/,
        description: 'Mutable default argument',
        fixDescription: 'Use None as default',
        correction: (match) => match.replace(/=\s*(\[\]|\{\}|\set\(\))/, '=None'),
        why: 'Mutable defaults are shared between calls, causing unexpected behavior.'
    },
    {
        id: 'bare-except',
        type: 'Code Quality',
        severity: 'Warning',
        regex: /except\s*:/,
        description: 'Bare except clause',
        fixDescription: 'Specify exception type',
        correction: (_match) => 'except Exception:',
        why: 'Bare except catches all exceptions including KeyboardInterrupt.'
    },
    {
        id: 'is-literal',
        type: 'Logic Error',
        severity: 'Warning',
        regex: /\s+is\s+(['"]|[0-9])/,
        description: 'Using "is" with literals',
        fixDescription: 'Use == for comparison',
        correction: (match) => match.replace(' is ', ' == '),
        why: '"is" checks identity, not equality. Use == for value comparison.'
    },
    {
        id: 'print-statement',
        type: 'Code Quality',
        severity: 'Info',
        regex: /\bprint\s*\(/,
        description: 'Print statement in code',
        fixDescription: 'Use logging module',
        correction: (match) => match,
        why: 'Use the logging module for production code.'
    },
    {
        id: 'deprecated-time-clock',
        type: 'Deprecated',
        severity: 'Warning',
        regex: /time\.clock\s*\(\s*\)/,
        description: 'time.clock() is deprecated',
        fixDescription: 'Use time.perf_counter()',
        correction: (_match) => 'time.perf_counter()',
        why: 'Removed in Python 3.8. Use perf_counter() or process_time().'
    },
    {
        id: 'deprecated-os-popen',
        type: 'Deprecated',
        severity: 'Warning',
        regex: /os\.popen\s*\(/,
        description: 'os.popen() is deprecated',
        fixDescription: 'Use subprocess.run()',
        correction: (_match) => 'subprocess.run(',
        why: 'os.popen is deprecated. Use subprocess for process handling.'
    },
    {
        id: 'hallucinated-tf',
        type: 'Hallucination',
        severity: 'Critical',
        regex: /import\s+tensorflow\.(?:advanced|extras|utilities)/,
        description: 'Hallucinated TensorFlow module',
        fixDescription: 'Check TensorFlow API docs',
        correction: () => '# Invalid import',
        why: 'AI often invents non-existent TensorFlow submodules.'
    },
    {
        id: 'f-string-no-f',
        type: 'Logic Error',
        severity: 'Warning',
        regex: /[^f]['"].*\{[^}]+\}.*['"]/,
        description: 'String with {} but no f-prefix',
        fixDescription: 'Add f prefix for f-string',
        correction: (match) => 'f' + match,
        why: 'Curly braces without f-prefix are literal characters, not interpolation.'
    },
    {
        id: 'pandas-isempty',
        type: 'Hallucination',
        severity: 'Critical',
        regex: /\.isEmpty\s*\(\s*\)/,
        description: 'DataFrame.isEmpty() does not exist',
        fixDescription: 'Use .empty property',
        correction: (_match) => '.empty',
        why: 'pandas DataFrames use .empty property, not .isEmpty() method.'
    },
    {
        id: 'missing-self',
        type: 'Logic Error',
        severity: 'Critical',
        regex: /def\s+\w+\s*\(\s*\)\s*:/,
        description: 'Method possibly missing self parameter',
        fixDescription: 'Add self as first parameter',
        correction: (match) => match.replace('()', '(self)'),
        why: 'Instance methods require self as the first parameter.'
    },
    {
        id: 'requests-no-try',
        type: 'Missing Error Handling',
        severity: 'Warning',
        regex: /requests\.(?:get|post|put|delete|patch)\s*\(/,
        description: 'HTTP request without error handling',
        fixDescription: 'Wrap in try/except',
        correction: (match) => match,
        why: 'Network requests can fail. Handle requests.exceptions.RequestException.'
    }
];

// ============================================
// JAVA PATTERNS
// ============================================

const JAVA_PATTERNS: Pattern[] = [
    {
        id: 'string-equals',
        type: 'Logic Error',
        severity: 'Critical',
        regex: /==\s*["'][^"']*["']/,
        description: 'String comparison with ==',
        fixDescription: 'Use .equals()',
        correction: (match) => match.replace('==', '.equals('),
        why: '== compares references, not values. Use .equals() for strings.'
    },
    {
        id: 'raw-type',
        type: 'Code Quality',
        severity: 'Warning',
        regex: /(?:List|Map|Set|ArrayList|HashMap|HashSet)\s+\w+\s*=/,
        description: 'Raw type without generics',
        fixDescription: 'Add type parameters',
        correction: (match) => match,
        why: 'Raw types bypass type safety. Use generics like List<String>.'
    },
    {
        id: 'system-exit',
        type: 'Code Quality',
        severity: 'Warning',
        regex: /System\.exit\s*\(/,
        description: 'System.exit() in code',
        fixDescription: 'Throw exception instead',
        correction: (match) => match,
        why: 'System.exit() prevents cleanup and is bad for testing.'
    },
    {
        id: 'printStackTrace',
        type: 'Code Quality',
        severity: 'Info',
        regex: /\.printStackTrace\s*\(\s*\)/,
        description: 'printStackTrace() usage',
        fixDescription: 'Use proper logging',
        correction: (match) => match,
        why: 'Use a logging framework instead of printStackTrace().'
    },
    {
        id: 'null-pointer-risk',
        type: 'Runtime Error',
        severity: 'Warning',
        regex: /\.\w+\(\)(?!\s*!=\s*null)/,
        description: 'Potential null pointer',
        fixDescription: 'Add null check',
        correction: (match) => match,
        why: 'Method chains without null checks can throw NullPointerException.'
    },
    {
        id: 'generic-exception-catch',
        type: 'Code Quality',
        severity: 'Warning',
        regex: /catch\s*\(\s*Exception\s+\w+\s*\)/,
        description: 'Catching generic Exception',
        fixDescription: 'Catch specific exception types',
        correction: (match) => match,
        why: 'Catching the generic Exception type hides bugs and makes debugging harder.'
    },
    {
        id: 'resource-leak',
        type: 'Runtime Error',
        severity: 'Warning',
        regex: /new\s+(?:FileInputStream|FileOutputStream|BufferedReader|BufferedWriter|FileReader|FileWriter)\s*\(/,
        description: 'Resource opened without try-with-resources',
        fixDescription: 'Use try-with-resources',
        correction: (match) => match,
        why: 'Streams should be closed with try-with-resources to prevent resource leaks.'
    },
    {
        id: 'string-concat-loop',
        type: 'Code Quality',
        severity: 'Warning',
        regex: /for\s*\([^)]*\)[^}]*\+=\s*["']/,
        description: 'String concatenation in loop',
        fixDescription: 'Use StringBuilder',
        correction: (match) => match,
        why: 'String concatenation in loops creates many temporary objects. Use StringBuilder.'
    }
];

// ============================================
// GO PATTERNS
// ============================================

const GO_PATTERNS: Pattern[] = [
    {
        id: 'ignored-error',
        type: 'Missing Error Handling',
        severity: 'Critical',
        regex: /,\s*_\s*:?=\s*\w+\([^)]*\)/,
        description: 'Error ignored with underscore',
        fixDescription: 'Handle the error',
        correction: (match) => match,
        why: 'Ignoring errors with _ is a common source of bugs in Go.'
    },
    {
        id: 'panic-usage',
        type: 'Code Quality',
        severity: 'Warning',
        regex: /\bpanic\s*\(/,
        description: 'panic() usage',
        fixDescription: 'Return error instead',
        correction: (match) => match,
        why: 'Prefer returning errors over panicking in library code.'
    },
    {
        id: 'fmt-print',
        type: 'Code Quality',
        severity: 'Info',
        regex: /fmt\.Print(?:ln|f)?\s*\(/,
        description: 'fmt.Print in production',
        fixDescription: 'Use proper logging',
        correction: (match) => match,
        why: 'Use log package or structured logging for production.'
    },
    {
        id: 'goroutine-leak',
        type: 'Runtime Error',
        severity: 'Warning',
        regex: /go\s+func\s*\([^)]*\)\s*\{[^}]*for\s*\{/,
        description: 'Potential goroutine leak',
        fixDescription: 'Add cancellation context',
        correction: (match) => match,
        why: 'Goroutines with infinite loops need proper cancellation.'
    },
    {
        id: 'try-catch-go',
        type: 'Hallucination',
        severity: 'Critical',
        regex: /\btry\s*\{|\bcatch\s*\(/,
        description: 'try/catch does not exist in Go',
        fixDescription: 'Use error returns and if err != nil',
        correction: (_match) => '// Use: if err != nil { return err }',
        why: 'Go uses explicit error returns, not try/catch exceptions.'
    },
    {
        id: 'missing-defer-close',
        type: 'Missing Error Handling',
        severity: 'Warning',
        regex: /os\.Open\s*\([^)]*\)(?![\s\S]*defer[\s\S]*\.Close)/,
        description: 'File opened without defer Close()',
        fixDescription: 'Add defer file.Close()',
        correction: (match) => match,
        why: 'Files should be closed with defer to prevent resource leaks.'
    },
    {
        id: 'err-shadow',
        type: 'Logic Error',
        severity: 'Warning',
        regex: /err\s*:=.*\n.*err\s*:=/,
        description: 'Error variable shadowing',
        fixDescription: 'Use = instead of := for reassignment',
        correction: (match) => match,
        why: 'Using := shadows the outer err variable, losing error information.'
    }
];

// ============================================
// RUST PATTERNS
// ============================================

const RUST_PATTERNS: Pattern[] = [
    {
        id: 'unwrap-usage',
        type: 'Runtime Error',
        severity: 'Warning',
        regex: /\.unwrap\s*\(\s*\)/,
        description: '.unwrap() can panic',
        fixDescription: 'Use ? or match',
        correction: (match) => match.replace('.unwrap()', '?'),
        why: 'unwrap() panics on None/Err. Use ? operator or pattern matching.'
    },
    {
        id: 'expect-usage',
        type: 'Runtime Error',
        severity: 'Info',
        regex: /\.expect\s*\(/,
        description: '.expect() can panic',
        fixDescription: 'Use ? or match',
        correction: (match) => match,
        why: 'expect() panics with a message. Consider proper error handling.'
    },
    {
        id: 'clone-overuse',
        type: 'Code Quality',
        severity: 'Info',
        regex: /\.clone\s*\(\s*\)/,
        description: 'Clone usage - performance impact',
        fixDescription: 'Consider borrowing',
        correction: (match) => match,
        why: 'Excessive cloning impacts performance. Consider borrowing instead.'
    },
    {
        id: 'unsafe-block',
        type: 'Security Risk',
        severity: 'Warning',
        regex: /\bunsafe\s*\{/,
        description: 'Unsafe block detected',
        fixDescription: 'Minimize unsafe code',
        correction: (match) => match,
        why: 'Unsafe blocks bypass Rust safety guarantees. Use sparingly.'
    },
    {
        id: 'multiple-unwrap',
        type: 'Code Quality',
        severity: 'Warning',
        regex: /\.unwrap\(\).*\.unwrap\(\)/,
        description: 'Multiple .unwrap() in chain',
        fixDescription: 'Use ? operator with Result',
        correction: (match) => match,
        why: 'Chained unwraps make debugging difficult. Use proper error propagation.'
    },
    {
        id: 'string-borrow',
        type: 'Code Quality',
        severity: 'Info',
        regex: /&String(?!\s*,)/,
        description: 'Borrowing String instead of &str',
        fixDescription: 'Use &str for string references',
        correction: (match) => match.replace('&String', '&str'),
        why: '&str is more flexible than &String for function parameters.'
    },
    {
        id: 'missing-lifetime',
        type: 'Logic Error',
        severity: 'Warning',
        regex: /fn\s+\w+\s*\([^)]*&[^'\s][^)]*\)\s*->\s*&/,
        description: 'Possible missing lifetime annotation',
        fixDescription: 'Add lifetime parameter',
        correction: (match) => match,
        why: 'Functions returning references usually need explicit lifetimes.'
    }
];

// ============================================
// C++ PATTERNS
// ============================================

const CPP_PATTERNS: Pattern[] = [
    {
        id: 'raw-pointer',
        type: 'Code Quality',
        severity: 'Warning',
        regex: /\w+\s*\*\s+\w+\s*=\s*new\s+/,
        description: 'Raw pointer with new',
        fixDescription: 'Use smart pointers',
        correction: (match) => match,
        why: 'Raw pointers cause memory leaks. Use unique_ptr or shared_ptr.'
    },
    {
        id: 'delete-mismatch',
        type: 'Runtime Error',
        severity: 'Critical',
        regex: /delete\s+\w+(?!\s*\[\])/,
        description: 'Single delete on array?',
        fixDescription: 'Use delete[] for arrays',
        correction: (match) => match,
        why: 'Using delete instead of delete[] on arrays causes undefined behavior.'
    },
    {
        id: 'printf-format',
        type: 'Security Risk',
        severity: 'Warning',
        regex: /printf\s*\(\s*\w+\s*\)/,
        description: 'printf with variable format',
        fixDescription: 'Use "%s" format',
        correction: (match) => match,
        why: 'Variable format strings enable format string attacks.'
    },
    {
        id: 'gets-usage',
        type: 'Security Risk',
        severity: 'Critical',
        regex: /\bgets\s*\(/,
        description: 'gets() is dangerous',
        fixDescription: 'Use fgets()',
        correction: (match) => match.replace('gets', 'fgets'),
        why: 'gets() has no bounds checking, causing buffer overflows.'
    },
    {
        id: 'strcpy-usage',
        type: 'Security Risk',
        severity: 'Warning',
        regex: /\bstrcpy\s*\(/,
        description: 'strcpy() is unsafe',
        fixDescription: 'Use strncpy()',
        correction: (match) => match.replace('strcpy', 'strncpy'),
        why: 'strcpy() has no bounds checking. Use strncpy() or std::string.'
    },
    {
        id: 'cout-debug',
        type: 'Code Quality',
        severity: 'Info',
        regex: /(?:std::)?cout\s*<</,
        description: 'cout in production code',
        fixDescription: 'Use proper logging',
        correction: (match) => match,
        why: 'Use a logging library instead of cout for production.'
    },
    {
        id: 'malloc-usage',
        type: 'Code Quality',
        severity: 'Warning',
        regex: /\bmalloc\s*\(/,
        description: 'Using malloc in C++',
        fixDescription: 'Use new or smart pointers',
        correction: (match) => match,
        why: 'In C++, prefer new/delete or smart pointers over malloc/free.'
    },
    {
        id: 'new-no-delete',
        type: 'Runtime Error',
        severity: 'Warning',
        regex: /\bnew\s+\w+(?![^;]*delete)/,
        description: 'new without corresponding delete',
        fixDescription: 'Use smart pointers or add delete',
        correction: (match) => match,
        why: 'Memory allocated with new must be freed to prevent leaks.'
    },
    {
        id: 'sprintf-usage',
        type: 'Security Risk',
        severity: 'Warning',
        regex: /\bsprintf\s*\(/,
        description: 'sprintf() is unsafe',
        fixDescription: 'Use snprintf() instead',
        correction: (match) => match.replace('sprintf', 'snprintf'),
        why: 'sprintf has no buffer size limit, causing potential overflows.'
    },
    {
        id: 'using-namespace-std',
        type: 'Code Quality',
        severity: 'Info',
        regex: /using\s+namespace\s+std\s*;/,
        description: 'using namespace std in header',
        fixDescription: 'Use std:: prefix instead',
        correction: (match) => match,
        why: 'Pollutes global namespace. Use explicit std:: prefix.'
    }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function getLineFromIndex(code: string, index: number): number {
    return code.substring(0, index).split('\n').length;
}

function checkMissingReturn(code: string, language: Language): Issue[] {
    if (language !== 'javascript' && language !== 'typescript') return [];

    const issues: Issue[] = [];
    const lines = code.split('\n');
    let insideFunc = false;
    let expectedReturn = false;
    let funcStart = 0;
    let braceCount = 0;

    lines.forEach((line, i) => {
        if (line.match(/function\s+(get|calculate|compute|create|find|fetch)\w*/i)) {
            insideFunc = true;
            expectedReturn = true;
            funcStart = i;
            braceCount = 0;
        }
        if (insideFunc) {
            braceCount += (line.match(/\{/g) || []).length;
            braceCount -= (line.match(/\}/g) || []).length;

            if (line.includes('return ')) {
                expectedReturn = false;
            }
            if (braceCount <= 0 && line.includes('}')) {
                if (expectedReturn) {
                    issues.push({
                        id: `missing-return-${funcStart}`,
                        line: funcStart + 1,
                        type: 'Logic Error',
                        severity: 'Warning',
                        description: 'Function should return a value',
                        fix: 'Add return statement',
                        startIndex: 0,
                        endIndex: 0,
                        replacement: '',
                        why: 'Functions named get*/calculate*/find* typically should return something.'
                    });
                }
                insideFunc = false;
                expectedReturn = false;
            }
        }
    });

    return issues;
}

function checkMissingAwait(code: string, language: Language): Issue[] {
    if (language !== 'javascript' && language !== 'typescript') return [];
    const issues: Issue[] = [];

    const lines = code.split('\n');
    lines.forEach((line, idx) => {
        // Check for fetch without await
        if (line.includes('fetch(') && !line.includes('await ') && !line.includes('return fetch') && !line.includes('.then')) {
            issues.push({
                id: `missing-await-fetch-${idx}`,
                line: idx + 1,
                type: 'Runtime Error',
                severity: 'Critical',
                description: 'fetch() called without await',
                fix: 'Add await keyword',
                startIndex: 0,
                endIndex: 0,
                replacement: line.replace('fetch(', 'await fetch('),
                why: 'fetch() returns a Promise. Without await, you get Promise object, not response.'
            });
        }
    });

    return issues;
}

// ============================================
// MAIN ANALYSIS FUNCTION
// ============================================

export function analyzeCode(code: string, language: Language): Issue[] {
    let issues: Issue[] = [];

    // 1. Universal Security Patterns (All languages)
    applyPatterns(code, SECURITY_PATTERNS, issues, language);

    // 2. Universal Runtime Patterns
    applyPatterns(code, RUNTIME_PATTERNS, issues, language);

    // 3. Language-specific patterns
    switch (language) {
        case 'javascript':
        case 'typescript':
            applyPatterns(code, JS_TS_PATTERNS, issues, language);
            issues = [...issues, ...checkMissingAwait(code, language)];
            issues = [...issues, ...checkMissingReturn(code, language)];
            break;
        case 'python':
            applyPatterns(code, PYTHON_PATTERNS, issues, language);
            break;
        case 'java':
            applyPatterns(code, JAVA_PATTERNS, issues, language);
            break;
        case 'go':
            applyPatterns(code, GO_PATTERNS, issues, language);
            break;
        case 'rust':
            applyPatterns(code, RUST_PATTERNS, issues, language);
            break;
        case 'cpp':
            applyPatterns(code, CPP_PATTERNS, issues, language);
            break;
    }

    // 4. Universal Quality Patterns
    applyPatterns(code, QUALITY_PATTERNS, issues, language);

    // Sort by severity weight then line number
    const severityWeight = { 'Critical': 3, 'Warning': 2, 'Info': 1 };
    const sorted = issues.sort((a, b) => {
        const weightDiff = severityWeight[b.severity] - severityWeight[a.severity];
        if (weightDiff !== 0) return weightDiff;
        return a.line - b.line;
    });

    // Limit to MAX_ISSUES to avoid overwhelming user
    const MAX_ISSUES = 20;
    return sorted.slice(0, MAX_ISSUES);
}

// Helper to check if a position is inside a comment or string
function isInsideCommentOrString(code: string, index: number, language: Language): boolean {
    const beforeMatch = code.substring(0, index);
    const lineStart = beforeMatch.lastIndexOf('\n') + 1;
    const lineContent = code.substring(lineStart, index);

    // Check for single-line comments
    if (language === 'javascript' || language === 'typescript' || language === 'java' || language === 'cpp' || language === 'go' || language === 'rust') {
        if (lineContent.includes('//')) return true;
    }
    if (language === 'python') {
        if (lineContent.includes('#')) return true;
    }

    // Basic string detection (inside quotes)
    const quoteCount = (lineContent.match(/"/g) || []).length;
    if (quoteCount % 2 === 1) return true;

    const singleQuoteCount = (lineContent.match(/'/g) || []).length;
    if (singleQuoteCount % 2 === 1) return true;

    return false;
}

function applyPatterns(code: string, patterns: Pattern[], issues: Issue[], language?: Language) {
    patterns.forEach(pattern => {
        try {
            const globalRegex = new RegExp(pattern.regex, 'g');
            let match: RegExpExecArray | null;
            while ((match = globalRegex.exec(code)) !== null) {
                const m = match;

                // Skip if inside comment or string (reduce false positives)
                if (language && isInsideCommentOrString(code, m.index, language)) {
                    continue;
                }

                const exists = issues.find(i => i.startIndex === m.index && i.id.startsWith(pattern.id));
                if (!exists) {
                    issues.push({
                        id: pattern.id + '-' + m.index,
                        line: getLineFromIndex(code, m.index),
                        type: pattern.type,
                        severity: pattern.severity,
                        description: pattern.description,
                        fix: pattern.fixDescription,
                        startIndex: m.index,
                        endIndex: m.index + m[0].length,
                        replacement: pattern.correction(m[0]),
                        why: pattern.why
                    });
                }
            }
        } catch (e) {
            // Silently handle regex errors
        }
    });
}

// ============================================
// LANGUAGE DETECTION
// ============================================

export function detectLanguage(code: string): Language {
    // Python detection
    if (/\bdef\s+\w+\s*\([^)]*\)\s*:/.test(code)) return 'python';
    if (/^import\s+\w+|^from\s+\w+\s+import/m.test(code)) return 'python';
    if (/^\s*class\s+\w+\s*:/m.test(code)) return 'python';

    // Rust detection
    if (/\bfn\s+\w+\s*[<(]/.test(code)) return 'rust';
    if (/->\s*(?:Result|Option|Self|&|\w+)/.test(code)) return 'rust';
    if (/\blet\s+mut\s+/.test(code)) return 'rust';
    if (/\bimpl\s+\w+/.test(code)) return 'rust';
    if (/\buse\s+std::/.test(code)) return 'rust';

    // Go detection
    if (/^package\s+\w+/m.test(code)) return 'go';
    if (/\bfunc\s+\w+\s*\(/.test(code)) return 'go';
    if (/:=/.test(code) && /\bfmt\./.test(code)) return 'go';

    // Java detection
    if (/\bpublic\s+class\s+\w+/.test(code)) return 'java';
    if (/\bprivate\s+\w+\s+\w+\s*\(/.test(code)) return 'java';
    if (/System\.out\.print/.test(code)) return 'java';

    // C++ detection
    if (/#include\s*</.test(code)) return 'cpp';
    if (/\bstd::/.test(code)) return 'cpp';
    if (/\bint\s+main\s*\(/.test(code) && /#include/.test(code)) return 'cpp';

    // TypeScript detection (before JS)
    if (/:\s*(string|number|boolean|any)\b/.test(code)) return 'typescript';
    if (/interface\s+\w+\s*\{/.test(code)) return 'typescript';
    if (/\btype\s+\w+\s*=/.test(code)) return 'typescript';

    // JavaScript detection
    if (/\b(?:const|let|var)\s+\w+\s*=/.test(code)) return 'javascript';
    if (/\bfunction\s+\w+\s*\(/.test(code)) return 'javascript';
    if (/=>\s*\{/.test(code)) return 'javascript';

    return 'javascript'; // Default
}
