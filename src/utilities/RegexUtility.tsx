import React, { useEffect, useMemo, useState } from 'react';
import { Code, Copy } from 'lucide-react';

type RegexFlag = 'g' | 'i' | 'm' | 's' | 'u' | 'y';

type FlagState = Record<RegexFlag, boolean>;

interface MatchResult {
  match: string;
  index: number;
  groups: Record<string, string> | null;
}

const FLAG_OPTIONS: Array<{
  key: RegexFlag;
  label: string;
  description: string;
}> = [
  {
    key: 'g',
    label: 'Global (g)',
    description: 'Find all matches instead of stopping after the first match.',
  },
  {
    key: 'i',
    label: 'Case-insensitive (i)',
    description: 'Ignore character case when matching.',
  },
  {
    key: 'm',
    label: 'Multiline (m)',
    description: 'Treat ^ and $ as start/end of each line instead of the whole input.',
  },
  {
    key: 's',
    label: 'Dotall (s)',
    description: 'Allow the dot (.) to match newline characters.',
  },
  {
    key: 'u',
    label: 'Unicode (u)',
    description: 'Treat the pattern as a sequence of Unicode code points.',
  },
  {
    key: 'y',
    label: 'Sticky (y)',
    description: 'Match from the last index position only.',
  },
];

const initialFlags: FlagState = {
  g: true,
  i: false,
  m: false,
  s: false,
  u: false,
  y: false,
};

const getFlagString = (flags: FlagState): string =>
  (Object.entries(flags) as Array<[RegexFlag, boolean]>)
    .filter(([, value]) => value)
    .map(([key]) => key)
    .join('');

const RegexUtility: React.FC = () => {
  const [pattern, setPattern] = useState('');
  const [testString, setTestString] = useState('');
  const [flags, setFlags] = useState<FlagState>(initialFlags);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [error, setError] = useState('');

  const flagString = useMemo(() => getFlagString(flags), [flags]);

  useEffect(() => {
    if (!pattern) {
      setMatches([]);
      setError('');
      return;
    }

    try {
      const regex = new RegExp(pattern, flagString);
      const results: MatchResult[] = [];

      if (flagString.includes('g')) {
        let match: RegExpExecArray | null;
        let safety = 0;

        while ((match = regex.exec(testString)) !== null && safety < 1000) {
          results.push({
            match: match[0],
            index: match.index,
            groups: match.groups ?? null,
          });

          if (match[0] === '') {
            regex.lastIndex += 1;
          }

          safety += 1;
        }
      } else {
        const match = regex.exec(testString);
        if (match) {
          results.push({
            match: match[0],
            index: match.index,
            groups: match.groups ?? null,
          });
        }
      }

      setMatches(results);
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid regular expression.';
      setError(message);
      setMatches([]);
    }
  }, [pattern, testString, flagString]);

  const highlightedTestString = useMemo(() => {
    if (!pattern || !testString) {
      return (
        <span className="whitespace-pre-wrap text-gray-600">
          {testString || 'Enter a test string to see matches highlighted.'}
        </span>
      );
    }

    try {
      const highlightFlags = flagString.includes('g') ? flagString : `${flagString}g`;
      const regex = new RegExp(pattern, highlightFlags);
      const elements: React.ReactNode[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      let safety = 0;

      while ((match = regex.exec(testString)) !== null && safety < 1000) {
        const matchText = match[0];
        const start = match.index;
        const end = start + matchText.length;

        if (start > lastIndex) {
          elements.push(
            <span key={`text-${start}`}>{testString.slice(lastIndex, start)}</span>
          );
        }

        elements.push(
          <mark
            key={`match-${start}-${end}`}
            className="bg-yellow-200 text-gray-900 rounded px-0.5"
          >
            {matchText || ' '}
          </mark>
        );

        lastIndex = end;

        if (matchText === '') {
          regex.lastIndex += 1;
        }

        safety += 1;
      }

      if (lastIndex < testString.length) {
        elements.push(
          <span key={`text-${lastIndex}`}>{testString.slice(lastIndex)}</span>
        );
      }

      if (elements.length === 0) {
        return (
          <span className="whitespace-pre-wrap text-gray-600">
            No matches found for the current pattern.
          </span>
        );
      }

      return (
        <span className="whitespace-pre-wrap break-words">{elements}</span>
      );
    } catch {
      return (
        <span className="whitespace-pre-wrap text-gray-600">{testString}</span>
      );
    }
  }, [pattern, testString, flagString]);

  const handleFlagToggle = (flag: RegexFlag) => {
    setFlags((prev) => ({
      ...prev,
      [flag]: !prev[flag],
    }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const clearAll = () => {
    setPattern('');
    setTestString('');
    setMatches([]);
    setError('');
    setFlags(initialFlags);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Code className="h-8 w-8 text-indigo-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Regex Tester</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Build and test JavaScript regular expressions, toggle flags, and inspect matches with live highlighting.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="card space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Pattern</label>
            <div className="relative">
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="e.g. ^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$"
                className="input-field pr-10"
              />
              {pattern && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(pattern)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                  title="Copy pattern"
                >
                  <Copy className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-sm font-medium text-gray-700">Flags</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FLAG_OPTIONS.map((flag) => (
                <label
                  key={flag.key}
                  className="flex items-start space-x-3 rounded-lg border border-gray-200 p-3 hover:border-indigo-400 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={flags[flag.key]}
                    onChange={() => handleFlagToggle(flag.key)}
                    className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <span>
                    <span className="block text-sm font-medium text-gray-900">{flag.label}</span>
                    <span className="block text-sm text-gray-600">{flag.description}</span>
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Active flags: <span className="font-mono">/{flagString || '(none)'}/</span>
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Test String</label>
            <div className="relative">
              <textarea
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                placeholder="Paste or type the text you want to test against the pattern..."
                className="input-field h-48 resize-y pr-10"
              />
              {testString && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(testString)}
                  className="absolute right-2 top-2 p-1 text-gray-500 hover:text-gray-700"
                  title="Copy test string"
                >
                  <Copy className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-gray-600">
              {matches.length > 0 && !error && (
                <span>{matches.length} match{matches.length === 1 ? '' : 'es'} found.</span>
              )}
              {pattern && !testString && !error && <span>Enter text to test the pattern.</span>}
              {!pattern && <span>Enter a regular expression pattern to begin.</span>}
            </div>
            <button
              type="button"
              onClick={clearAll}
              className="btn-secondary"
            >
              Clear All
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="card space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Highlighted Matches</h2>
            <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-4 h-64 overflow-auto">
              {highlightedTestString}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Match Details</h2>
            {matches.length === 0 ? (
              <p className="text-sm text-gray-600">
                {pattern ? 'No matches yet. Adjust your pattern or input text.' : 'Matches will appear here once you provide a pattern.'}
              </p>
            ) : (
              <div className="space-y-4">
                {matches.map((match, index) => (
                  <div key={`${match.index}-${index}`} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Match {index + 1}
                        </p>
                        <p className="font-mono text-sm text-indigo-600 break-all">
                          {match.match || '(empty match)'}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded px-2 py-1">
                        Index {match.index}
                      </span>
                    </div>
                    {match.groups && Object.keys(match.groups).length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Named groups</p>
                        <div className="space-y-1">
                          {Object.entries(match.groups).map(([groupName, value]) => (
                            <div key={groupName} className="flex items-center justify-between rounded bg-gray-100 px-3 py-1 text-xs">
                              <span className="font-mono text-gray-700">{groupName}</span>
                              <span className="font-mono text-gray-600 break-all">{value ?? '(undefined)'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Information */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Helpful tips</h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
          <li>Use parentheses <span className="font-mono">()</span> to capture groups. Named groups use the syntax <span className="font-mono">(?&lt;name&gt;...)</span>.</li>
          <li>The sticky flag <span className="font-mono">y</span> forces each search to start at the previous match index and can be combined with global searches.</li>
          <li>Need to match literal special characters? Escape them with a backslash, e.g. <span className="font-mono">\.</span></li>
          <li>Testing large inputs? Disable the global flag to inspect just the first match.</li>
        </ul>
      </div>
    </div>
  );
};

export default RegexUtility;


