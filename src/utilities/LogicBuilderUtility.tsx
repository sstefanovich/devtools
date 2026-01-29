import React, { useState, useMemo } from 'react';
import { Brain, Copy, Plus, X, Trash2 } from 'lucide-react';

type LogicNode = 
  | {
      id: string;
      type: 'variable';
      value: string;
    }
  | {
      id: string;
      type: 'operator';
      operator: 'AND' | 'OR' | 'NOT';
      children?: LogicNode[];
    };

type TruthTableRow = {
  [key: string]: boolean;
  result: boolean;
};

const LogicBuilderUtility: React.FC = () => {
  const [variables, setVariables] = useState<string[]>(['A', 'B']);
  const [expression, setExpression] = useState<LogicNode | null>(null);
  const [error, setError] = useState<string>('');

  // Generate all possible combinations of variable values
  const generateTruthTable = useMemo((): TruthTableRow[] => {
    if (variables.length === 0 || !expression) return [];

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
        row.result = evaluateExpression(expression, row);
      } catch (err) {
        row.result = false;
      }

      rows.push(row);
    }

    return rows;
  }, [variables, expression]);

  // Evaluate a logic expression given variable values
  const evaluateExpression = (node: LogicNode, values: { [key: string]: boolean }): boolean => {
    if (node.type === 'variable') {
      return values[node.value] || false;
    }

    if (node.type === 'operator') {
      if (node.operator === 'NOT') {
        if (!node.children || node.children.length === 0) {
          throw new Error('NOT operator requires one operand');
        }
        return !evaluateExpression(node.children[0], values);
      }

      if (node.operator === 'AND') {
        if (!node.children || node.children.length < 2) {
          throw new Error('AND operator requires two operands');
        }
        return node.children.every(child => evaluateExpression(child, values));
      }

      if (node.operator === 'OR') {
        if (!node.children || node.children.length < 2) {
          throw new Error('OR operator requires two operands');
        }
        return node.children.some(child => evaluateExpression(child, values));
      }
    }

    return false;
  };

  // Convert expression to readable string
  const expressionToString = (node: LogicNode | null): string => {
    if (!node) return 'No expression';
    
    if (node.type === 'variable') {
      return node.value;
    }

    if (node.type === 'operator') {
      if (node.operator === 'NOT') {
        if (!node.children || node.children.length === 0) return 'NOT (?)';
        return `NOT (${expressionToString(node.children[0])})`;
      }

      if (node.operator === 'AND' || node.operator === 'OR') {
        if (!node.children || node.children.length < 2) {
          return `${node.operator} (?)`;
        }
        const childrenStr = node.children.map(c => expressionToString(c)).join(` ${node.operator} `);
        return `(${childrenStr})`;
      }
    }

    return '';
  };

  // Add a variable
  const addVariable = () => {
    const nextVar = String.fromCharCode(65 + variables.length); // A, B, C, ...
    setVariables([...variables, nextVar]);
  };

  // Remove a variable
  const removeVariable = (varName: string) => {
    if (variables.length <= 1) {
      setError('At least one variable is required');
      return;
    }
    setVariables(variables.filter(v => v !== varName));
    setExpression(null); // Clear expression when variables change
  };

  // Build expression - improved builder interface
  const addToExpression = (type: 'variable' | 'operator', value: string, operator?: 'AND' | 'OR' | 'NOT') => {
    setError('');
    
    if (type === 'variable') {
      const newNode: LogicNode = {
        id: `var-${Date.now()}`,
        type: 'variable',
        value: value,
      };

      if (!expression) {
        // Start new expression
        setExpression(newNode);
      } else if (expression.type === 'operator') {
        // Add to existing operator
        if (expression.operator === 'NOT') {
          if (!expression.children || expression.children.length === 0) {
            setExpression({
              ...expression,
              children: [newNode],
            });
          } else {
            setError('NOT operator can only have one operand');
          }
        } else {
          // AND/OR operator
          if (!expression.children) {
            setExpression({
              ...expression,
              children: [newNode],
            });
          } else if (expression.children.length < 2) {
            setExpression({
              ...expression,
              children: [...expression.children, newNode],
            });
          } else {
            setError('Operator already has two operands. Add a new operator to continue.');
          }
        }
      } else {
        // Current expression is a variable, need operator to combine
        setError('Add an operator (AND/OR/NOT) to combine expressions');
      }
    } else if (type === 'operator') {
      if (!expression) {
        setError('Add a variable first');
        return;
      }

      if (operator === 'NOT') {
        // NOT wraps the current expression
        const newNode: LogicNode = {
          id: `op-${Date.now()}`,
          type: 'operator',
          operator: 'NOT',
          children: [expression],
        };
        setExpression(newNode);
      } else {
        // AND/OR - create new operator with current expression as first child
        const newNode: LogicNode = {
          id: `op-${Date.now()}`,
          type: 'operator',
          operator: operator!,
          children: [expression],
        };
        setExpression(newNode);
      }
    }
  };

  // Clear expression
  const clearExpression = () => {
    setExpression(null);
    setError('');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Brain className="h-8 w-8 text-purple-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Logic Statement Builder</h1>
        </div>
        <p className="text-gray-600">
          Build and evaluate logical expressions with AND, OR, and NOT operators
        </p>
      </div>

      {/* Variables Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Variables</h3>
          <button
            onClick={addVariable}
            className="btn-secondary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Variable</span>
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {variables.map((varName) => (
            <div
              key={varName}
              className="flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg"
            >
              <span className="font-mono font-semibold">{varName}</span>
              {variables.length > 1 && (
                <button
                  onClick={() => removeVariable(varName)}
                  className="text-purple-600 hover:text-purple-800"
                  title="Remove variable"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Expression Builder */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Build Expression</h3>
          {expression && (
            <button
              onClick={clearExpression}
              className="btn-secondary flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Current Expression Display */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Expression:</p>
              <p className="font-mono text-lg text-gray-900">
                {expressionToString(expression)}
              </p>
            </div>
            {expression && (
              <button
                onClick={() => copyToClipboard(expressionToString(expression))}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Copy expression"
              >
                <Copy className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Builder Controls */}
        <div className="space-y-4">
          {/* Add Variables */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Variable
            </label>
            <div className="flex flex-wrap gap-2">
              {variables.map((varName) => (
                <button
                  key={varName}
                  onClick={() => addToExpression('variable', varName)}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-mono font-semibold"
                >
                  {varName}
                </button>
              ))}
            </div>
          </div>

          {/* Add Operators */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Operator
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => addToExpression('operator', 'AND', 'AND')}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold"
              >
                AND
              </button>
              <button
                onClick={() => addToExpression('operator', 'OR', 'OR')}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-semibold"
              >
                OR
              </button>
              <button
                onClick={() => addToExpression('operator', 'NOT', 'NOT')}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold"
              >
                NOT
              </button>
            </div>
          </div>

        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>How to build:</strong> Start by adding a variable, then add an operator (AND/OR/NOT), 
            and continue building your expression. For AND/OR operators, add a second operand after selecting the operator.
          </p>
        </div>
      </div>

      {/* Truth Table */}
      {expression && generateTruthTable.length > 0 && (
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About Logic Statements</h3>
        <div className="space-y-3 text-gray-600">
          <p>
            <strong>AND (∧):</strong> Returns true only when all operands are true. 
            Example: A AND B is true only when both A and B are true.
          </p>
          <p>
            <strong>OR (∨):</strong> Returns true when at least one operand is true. 
            Example: A OR B is true when either A or B (or both) are true.
          </p>
          <p>
            <strong>NOT (¬):</strong> Returns the opposite of its operand. 
            Example: NOT A is true when A is false, and false when A is true.
          </p>
          <p>
            <strong>Truth Table:</strong> Shows all possible combinations of variable values 
            and the resulting output of your expression. Green rows indicate true results, 
            red rows indicate false results.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogicBuilderUtility;
