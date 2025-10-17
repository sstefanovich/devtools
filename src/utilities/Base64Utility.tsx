import React, { useState } from 'react';
import { FileText, Copy, Download, Upload } from 'lucide-react';

const Base64Utility: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState('');

  const handleEncode = () => {
    try {
      setError('');
      const encoded = btoa(unescape(encodeURIComponent(inputText)));
      setOutputText(encoded);
    } catch (err) {
      setError('Error encoding text. Please check your input.');
    }
  };

  const handleDecode = () => {
    try {
      setError('');
      const decoded = decodeURIComponent(escape(atob(inputText)));
      setOutputText(decoded);
    } catch (err) {
      setError('Error decoding Base64. Please check your input.');
    }
  };

  const handleConvert = () => {
    if (!inputText.trim()) {
      setError('Please enter some text to convert.');
      return;
    }

    if (mode === 'encode') {
      handleEncode();
    } else {
      handleDecode();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-blue-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Base64 Encode/Decode</h1>
        </div>
        <p className="text-gray-600">
          Encode text to Base64 format or decode Base64 back to readable text
        </p>
      </div>

      {/* Mode Selection */}
      <div className="card">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setMode('encode')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              mode === 'encode'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Upload className="h-4 w-4 inline mr-2" />
            Encode to Base64
          </button>
          <button
            onClick={() => setMode('decode')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              mode === 'decode'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Download className="h-4 w-4 inline mr-2" />
            Decode from Base64
          </button>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode'}
            </label>
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={mode === 'encode' 
                  ? 'Enter the text you want to encode to Base64...' 
                  : 'Enter the Base64 string you want to decode...'
                }
                className="input-field h-32 resize-none"
              />
              {inputText && (
                <button
                  onClick={() => copyToClipboard(inputText)}
                  className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700"
                  title="Copy input"
                >
                  <Copy className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Convert Button */}
          <button
            onClick={handleConvert}
            className="btn-primary w-full"
          >
            {mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
          </button>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Output Section */}
          {outputText && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {mode === 'encode' ? 'Base64 Encoded Output' : 'Decoded Text Output'}
              </label>
              <div className="relative">
                <textarea
                  value={outputText}
                  readOnly
                  className="input-field h-32 resize-none bg-gray-50"
                />
                <button
                  onClick={() => copyToClipboard(outputText)}
                  className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700"
                  title="Copy output"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Clear Button */}
          {(inputText || outputText) && (
            <button
              onClick={clearAll}
              className="btn-secondary w-full"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Information Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About Base64</h3>
        <div className="space-y-3 text-gray-600">
          <p>
            Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format. 
            It's commonly used for encoding data in email attachments, web APIs, and data transmission.
          </p>
          <p>
            <strong>Common uses:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Encoding binary files for email attachments</li>
            <li>Storing binary data in JSON or XML</li>
            <li>Data transmission over protocols that only support text</li>
            <li>Embedding images in CSS or HTML</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Base64Utility;

