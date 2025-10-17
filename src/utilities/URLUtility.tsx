import React, { useState } from 'react';
import { Link, Copy, Download, Upload } from 'lucide-react';

const URLUtility: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState('');

  const handleEncode = () => {
    try {
      setError('');
      const encoded = encodeURIComponent(inputText);
      setOutputText(encoded);
    } catch (err) {
      setError('Error encoding URL. Please check your input.');
    }
  };

  const handleDecode = () => {
    try {
      setError('');
      const decoded = decodeURIComponent(inputText);
      setOutputText(decoded);
    } catch (err) {
      setError('Error decoding URL. Please check your input.');
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

  const getExampleText = () => {
    if (mode === 'encode') {
      return 'Hello World! How are you?';
    } else {
      return 'Hello%20World%21%20How%20are%20you%3F';
    }
  };

  const useExample = () => {
    setInputText(getExampleText());
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Link className="h-8 w-8 text-purple-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">URL Encoder/Decoder</h1>
        </div>
        <p className="text-gray-600">
          Encode text to URL-safe format or decode URL-encoded text back to readable text
        </p>
      </div>

      {/* Mode Selection */}
      <div className="card">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setMode('encode')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              mode === 'encode'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Upload className="h-4 w-4 inline mr-2" />
            Encode URL
          </button>
          <button
            onClick={() => setMode('decode')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              mode === 'decode'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Download className="h-4 w-4 inline mr-2" />
            Decode URL
          </button>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {mode === 'encode' ? 'Text to Encode' : 'URL-encoded Text to Decode'}
              </label>
              <button
                onClick={useExample}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Use Example
              </button>
            </div>
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={mode === 'encode' 
                  ? 'Enter the text you want to URL-encode...' 
                  : 'Enter the URL-encoded string you want to decode...'
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
            {mode === 'encode' ? 'Encode URL' : 'Decode URL'}
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
                {mode === 'encode' ? 'URL-encoded Output' : 'Decoded Text Output'}
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

      {/* Character Reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Common URL Encoded Characters</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between font-mono">
              <span>Space</span>
              <span>%20</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>!</span>
              <span>%21</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>"</span>
              <span>%22</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>#</span>
              <span>%23</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>$</span>
              <span>%24</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>%</span>
              <span>%25</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>&</span>
              <span>%26</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>'</span>
              <span>%27</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>(</span>
              <span>%28</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>)</span>
              <span>%29</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">More Characters</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between font-mono">
              <span>+</span>
              <span>%2B</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>,</span>
              <span>%2C</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>-</span>
              <span>%2D</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>.</span>
              <span>%2E</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>/</span>
              <span>%2F</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>:</span>
              <span>%3A</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>;</span>
              <span>%3B</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>&lt;</span>
              <span>%3C</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>=</span>
              <span>%3D</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>&gt;</span>
              <span>%3E</span>
            </div>
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About URL Encoding</h3>
        <div className="space-y-3 text-gray-600">
          <p>
            URL encoding (also known as percent encoding) is a mechanism for encoding information 
            in a Uniform Resource Identifier (URI). It's used to represent characters that have 
            special meanings in URLs or that cannot be represented in the standard ASCII character set.
          </p>
          <p>
            <strong>Common uses:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Encoding query parameters in URLs</li>
            <li>Handling special characters in form data</li>
            <li>Creating safe URLs for sharing</li>
            <li>Encoding non-ASCII characters in international URLs</li>
          </ul>
          <p>
            <strong>Note:</strong> This tool uses <code className="bg-gray-100 px-1 rounded">encodeURIComponent()</code> and 
            <code className="bg-gray-100 px-1 rounded">decodeURIComponent()</code> which are the standard JavaScript 
            functions for URL encoding/decoding.
          </p>
        </div>
      </div>
    </div>
  );
};

export default URLUtility;
