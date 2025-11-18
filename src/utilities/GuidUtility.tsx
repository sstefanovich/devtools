import React, { useState } from 'react';
import { Key, Copy, RefreshCw, Trash2 } from 'lucide-react';

const GuidUtility: React.FC = () => {
  const [generatedGuids, setGeneratedGuids] = useState<string[]>([]);
  const [format, setFormat] = useState<'standard' | 'uppercase' | 'no-dashes'>('standard');
  const [count, setCount] = useState(1);

  // Generate a single GUID
  const generateGuid = (): string => {
    // Generate a UUID v4 compliant GUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  // Format GUID based on selected format
  const formatGuid = (guid: string): string => {
    switch (format) {
      case 'uppercase':
        return guid.toUpperCase();
      case 'no-dashes':
        return guid.replace(/-/g, '');
      default:
        return guid.toLowerCase();
    }
  };

  // Generate GUIDs
  const handleGenerate = () => {
    const newGuids: string[] = [];
    for (let i = 0; i < count; i++) {
      const guid = generateGuid();
      newGuids.push(formatGuid(guid));
    }
    setGeneratedGuids([...newGuids, ...generatedGuids]);
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Copy all GUIDs
  const copyAll = async () => {
    const allGuids = generatedGuids.join('\n');
    await copyToClipboard(allGuids);
  };

  // Clear all GUIDs
  const clearAll = () => {
    setGeneratedGuids([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Key className="h-8 w-8 text-orange-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">GUID Generator</h1>
        </div>
        <p className="text-gray-600">
          Generate unique GUIDs (Globally Unique Identifiers) in various formats
        </p>
      </div>

      {/* Generator Controls */}
      <div className="card">
        <div className="space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setFormat('standard')}
                className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                  format === 'standard'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Standard (lowercase)
              </button>
              <button
                onClick={() => setFormat('uppercase')}
                className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                  format === 'uppercase'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Uppercase
              </button>
              <button
                onClick={() => setFormat('no-dashes')}
                className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                  format === 'no-dashes'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                No Dashes
              </button>
            </div>
          </div>

          {/* Count Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of GUIDs to Generate
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setCount(Math.min(Math.max(value, 1), 100));
                }}
                className="input-field w-24"
              />
              <span className="text-gray-600 text-sm">(1-100)</span>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Generate GUID{count > 1 ? 's' : ''}</span>
          </button>
        </div>
      </div>

      {/* Generated GUIDs */}
      {generatedGuids.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Generated GUIDs ({generatedGuids.length})
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={copyAll}
                className="btn-secondary flex items-center space-x-2"
                title="Copy all GUIDs"
              >
                <Copy className="h-4 w-4" />
                <span>Copy All</span>
              </button>
              <button
                onClick={clearAll}
                className="btn-secondary flex items-center space-x-2 text-red-600 hover:text-red-700"
                title="Clear all GUIDs"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {generatedGuids.map((guid, index) => (
              <div
                key={`${guid}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors"
              >
                <code className="text-sm font-mono text-gray-800 flex-1 break-all">
                  {guid}
                </code>
                <button
                  onClick={() => copyToClipboard(guid)}
                  className="ml-3 p-2 text-gray-500 hover:text-orange-600 transition-colors flex-shrink-0"
                  title="Copy GUID"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Information Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About GUIDs</h3>
        <div className="space-y-3 text-gray-600">
          <p>
            A GUID (Globally Unique Identifier) is a 128-bit identifier that is guaranteed to be unique
            across space and time. GUIDs are also known as UUIDs (Universally Unique Identifiers).
          </p>
          <p>
            <strong>Common uses:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Database primary keys and unique identifiers</li>
            <li>Distributed system identifiers</li>
            <li>Session IDs and transaction identifiers</li>
            <li>API request/response tracking</li>
            <li>File and resource naming</li>
          </ul>
          <p className="mt-4">
            <strong>Format:</strong> GUIDs are typically displayed as 32 hexadecimal digits
            displayed in five groups separated by hyphens: 8-4-4-4-12 (e.g., 550e8400-e29b-41d4-a716-446655440000).
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuidUtility;

