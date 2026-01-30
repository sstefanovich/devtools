import React, { useState, useMemo } from 'react';
import { Brain, Copy, Lightbulb } from 'lucide-react';

type LogicNode = 
  | {
      type: 'variable';
      value: string;
    }
  | {
      type: 'operator';
      operator: 'AND' | 'OR' | 'NOT';
      children: LogicNode[];
    };

type TruthTableRow = {
  [key: string]: boolean;
  result: boolean;
};

const LogicBuilderUtility: React.FC = () => {
  const [variables, setVariables] = useState<string[]>(['A', 'B']);
  const [expressionText, setExpressionText] = useState<string>('A AND B');
  const [error, setError] = useState<string>('');

  // Parse text expression into LogicNode
  const parseExpression = (text: string): LogicNode | null => {
    if (!text.trim()) return null;

    try {
      // Normalize the input: convert to uppercase, handle parentheses
      let normalized = text.toUpperCase().trim();
      
      // Remove extra spaces around operators and parentheses
      normalized = normalized.replace(/\s+/g, ' ');
      normalized = normalized.replace(/\s*\(\s*/g, '(');
      normalized = normalized.replace(/\s*\)\s*/g, ')');
      
      return parseExpressionRecursive(normalized);
    } catch (err) {
      setError('Invalid expression. Use format like: A AND B, NOT A, (A OR B) AND C');
      return null;
    }
  };

  // Recursive parser for expressions
  const parseExpressionRecursive = (text: string): LogicNode => {
    text = text.trim();
    
    // Handle NOT operator
    if (text.startsWith('NOT ')) {
      const inner = text.substring(4).trim();
      // Remove outer parentheses if present
      const innerText = inner.startsWith('(') && inner.endsWith(')') 
        ? inner.slice(1, -1).trim() 
        : inner;
      return {
        type: 'operator',
        operator: 'NOT',
        children: [parseExpressionRecursive(innerText)],
      };
    }

    // Handle parentheses
    if (text.startsWith('(') && text.endsWith(')')) {
      // Check if it's a complete parenthesized expression
      let depth = 0;
      let isComplete = true;
      for (let i = 0; i < text.length; i++) {
        if (text[i] === '(') depth++;
        if (text[i] === ')') depth--;
        if (depth === 0 && i < text.length - 1) {
          isComplete = false;
          break;
        }
      }
      if (isComplete) {
        return parseExpressionRecursive(text.slice(1, -1).trim());
      }
    }

    // Find operators (AND has precedence over OR)
    const andIndex = findOperatorIndex(text, ' AND ');
    if (andIndex !== -1) {
      const left = text.substring(0, andIndex).trim();
      const right = text.substring(andIndex + 5).trim();
      return {
        type: 'operator',
        operator: 'AND',
        children: [
          parseExpressionRecursive(left),
          parseExpressionRecursive(right),
        ],
      };
    }

    const orIndex = findOperatorIndex(text, ' OR ');
    if (orIndex !== -1) {
      const left = text.substring(0, orIndex).trim();
      const right = text.substring(orIndex + 4).trim();
      return {
        type: 'operator',
        operator: 'OR',
        children: [
          parseExpressionRecursive(left),
          parseExpressionRecursive(right),
        ],
      };
    }

    // Must be a variable
    if (text.length === 1 && /[A-Z]/.test(text)) {
      return { type: 'variable', value: text };
    }

    throw new Error(`Invalid expression: ${text}`);
  };

  // Find operator index, respecting parentheses
  const findOperatorIndex = (text: string, operator: string): number => {
    let depth = 0;
    for (let i = 0; i <= text.length - operator.length; i++) {
      if (text[i] === '(') depth++;
      if (text[i] === ')') depth--;
      if (depth === 0 && text.substring(i, i + operator.length) === operator) {
        return i;
      }
    }
    return -1;
  };

  // Extract variables from expression text (excluding operators)
  const extractVariables = (text: string): string[] => {
    const upperText = text.toUpperCase();
    
    // Remove operator keywords and parentheses, keep only single-letter variables
    // Replace operators and parentheses with spaces, then find single letters
    let cleaned = upperText
      .replace(/\bAND\b/g, ' ')
      .replace(/\bOR\b/g, ' ')
      .replace(/\bNOT\b/g, ' ')
      .replace(/[()]/g, ' ');
    
    // Match single uppercase letters (variables)
    const matches = cleaned.match(/\b[A-Z]\b/g);
    if (!matches) return [];
    
    // Return unique, sorted variables
    return Array.from(new Set(matches)).sort();
  };

  // Get parsed expression
  const parsedExpression = useMemo(() => {
    setError('');
    const vars = extractVariables(expressionText);
    if (vars.length > 0) {
      setVariables(vars);
    }
    return parseExpression(expressionText);
  }, [expressionText]);

  // Generate all possible combinations of variable values
  const generateTruthTable = useMemo((): TruthTableRow[] => {
    if (variables.length === 0 || !parsedExpression) return [];

    const numCombinations = Math.pow(2, variables.length);
    const rows: TruthTableRow[] = [];

    for (let i = 0; i < numCombinations; i++) {
      const row: TruthTableRow = { result: false };
      
      // Generate binary representation for this combination
      variables.forEach((varName, index) => {
        const bitPosition = variables.length - 1 - index;
        row[varName] = ((i >> bitPosition) & 1) === 1;
      });

      // Evaluate expression for this row
      try {
        row.result = evaluateExpression(parsedExpression, row);
      } catch (err) {
        row.result = false;
      }

      rows.push(row);
    }

    return rows;
  }, [variables, parsedExpression]);

  // Evaluate a logic expression given variable values
  const evaluateExpression = (node: LogicNode, values: { [key: string]: boolean }): boolean => {
    if (node.type === 'variable') {
      return values[node.value] || false;
    }

    if (node.type === 'operator') {
      if (node.operator === 'NOT') {
        if (node.children.length === 0) {
          throw new Error('NOT operator requires one operand');
        }
        return !evaluateExpression(node.children[0], values);
      }

      if (node.operator === 'AND') {
        if (node.children.length < 2) {
          throw new Error('AND operator requires two operands');
        }
        return node.children.every(child => evaluateExpression(child, values));
      }

      if (node.operator === 'OR') {
        if (node.children.length < 2) {
          throw new Error('OR operator requires two operands');
        }
        return node.children.some(child => evaluateExpression(child, values));
      }
    }

    return false;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const loadExample = (example: string) => {
    setExpressionText(example);
    setError('');
  };

  const examples = [
    'A AND B',
    'A OR B',
    'NOT A',
    '(A OR B) AND C',
    'NOT (A AND B)',
    '(A AND B) OR (C AND D)',
    'A AND NOT B',
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Brain className="h-8 w-8 text-purple-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Logic Statement Builder</h1>
        </div>
        <p className="text-gray-600">
          Type logical expressions naturally and see the truth table instantly
        </p>
      </div>

      {/* Expression Input */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Enter Expression</h3>
          {expressionText && (
            <button
              onClick={() => copyToClipboard(expressionText)}
              className="btn-secondary flex items-center space-x-2"
              title="Copy expression"
            >
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type your logical expression
            </label>
            <input
              type="text"
              value={expressionText}
              onChange={(e) => {
                setExpressionText(e.target.value);
                setError('');
              }}
              placeholder="e.g., A AND B, NOT A, (A OR B) AND C"
              className="input-field text-lg font-mono"
            />
            <p className="mt-2 text-sm text-gray-500">
              Use AND, OR, NOT operators. Variables are automatically detected (A, B, C, etc.)
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Quick Examples */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <label className="text-sm font-medium text-gray-700">Quick Examples</label>
            </div>
            <div className="flex flex-wrap gap-2">
              {examples.map((example) => (
                <button
                  key={example}
                  onClick={() => loadExample(example)}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-mono"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detected Variables */}
      {variables.length > 0 && (
        <div className="card bg-purple-50 border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Detected Variables</h3>
          <div className="flex flex-wrap gap-2">
            {variables.map((varName) => (
              <div
                key={varName}
                className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-mono font-semibold"
              >
                {varName}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Truth Table */}
      {parsedExpression && generateTruthTable.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Truth Table</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300 border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  {variables.map((varName) => (
                    <th
                      key={varName}
                      className="px-6 py-4 text-center text-base font-bold text-gray-900 uppercase tracking-wider border-r border-gray-300"
                    >
                      {varName}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-center text-base font-bold text-purple-900 uppercase tracking-wider bg-purple-200">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-300">
                {generateTruthTable.map((row, index) => (
                  <tr
                    key={index}
                    className={row.result ? 'bg-green-100 hover:bg-green-200' : 'bg-red-100 hover:bg-red-200'}
                  >
                    {variables.map((varName) => (
                      <td
                        key={varName}
                        className="px-6 py-4 text-center text-lg font-bold font-mono text-gray-900 border-r border-gray-300"
                      >
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${
                          row[varName] 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-300 text-gray-700'
                        }`}>
                          {row[varName] ? 'T' : 'F'}
                        </span>
                      </td>
                    ))}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold font-mono ${
                        row.result 
                          ? 'bg-green-600 text-white' 
                          : 'bg-red-600 text-white'
                      }`}>
                        {row.result ? 'T' : 'F'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Information Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Use</h3>
        <div className="space-y-3 text-gray-600">
          <p>
            <strong>Simple and intuitive:</strong> Just type your logical expression in plain English!
          </p>
          <div className="space-y-2">
            <p><strong>Operators:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><code className="bg-gray-100 px-1 rounded">AND</code> - Both conditions must be true</li>
              <li><code className="bg-gray-100 px-1 rounded">OR</code> - At least one condition must be true</li>
              <li><code className="bg-gray-100 px-1 rounded">NOT</code> - Negates the condition</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p><strong>Examples:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4 font-mono text-sm">
              <li><code>A AND B</code> - Both A and B are true</li>
              <li><code>A OR B</code> - Either A or B (or both) are true</li>
              <li><code>NOT A</code> - A is false</li>
              <li><code>(A OR B) AND C</code> - (A or B) is true AND C is true</li>
              <li><code>NOT (A AND B)</code> - It's not the case that both A and B are true</li>
            </ul>
          </div>
          <p>
            <strong>Variables:</strong> Use single letters (A, B, C, etc.). Variables are automatically detected from your expression.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogicBuilderUtility;
