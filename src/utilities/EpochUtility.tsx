import React, { useState, useEffect } from 'react';
import { Clock, Copy, RefreshCw } from 'lucide-react';

const EpochUtility: React.FC = () => {
  const [inputTimestamp, setInputTimestamp] = useState('');
  const [outputDate, setOutputDate] = useState('');
  const [currentTimestamp, setCurrentTimestamp] = useState(Date.now());
  const [mode, setMode] = useState<'timestamp-to-date' | 'date-to-timestamp'>('timestamp-to-date');
  const [error, setError] = useState('');
  const [inputDate, setInputDate] = useState('');
  const [timezone, setTimezone] = useState('UTC');

  // Update current timestamp every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimestamp(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const convertTimestampToDate = () => {
    try {
      setError('');
      const timestamp = parseInt(inputTimestamp);
      
      if (isNaN(timestamp)) {
        setError('Please enter a valid timestamp (numbers only).');
        return;
      }

      // Check if timestamp is in seconds or milliseconds
      const adjustedTimestamp = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
      const date = formatDate(adjustedTimestamp);
      setOutputDate(date);
    } catch (err) {
      setError('Error converting timestamp. Please check your input.');
    }
  };

  const convertDateToTimestamp = () => {
    try {
      setError('');
      const date = new Date(inputDate);
      
      if (isNaN(date.getTime())) {
        setError('Please enter a valid date and time.');
        return;
      }

      const timestamp = Math.floor(date.getTime() / 1000); // Return seconds
      setOutputDate(timestamp.toString());
    } catch (err) {
      setError('Error converting date. Please check your input.');
    }
  };

  const handleConvert = () => {
    if (!inputTimestamp.trim() && mode === 'timestamp-to-date') {
      setError('Please enter a timestamp.');
      return;
    }

    if (!inputDate && mode === 'date-to-timestamp') {
      setError('Please enter a date and time.');
      return;
    }

    if (mode === 'timestamp-to-date') {
      convertTimestampToDate();
    } else {
      convertDateToTimestamp();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const clearAll = () => {
    setInputTimestamp('');
    setInputDate('');
    setOutputDate('');
    setError('');
  };

  const useCurrentTimestamp = () => {
    setInputTimestamp(Math.floor(currentTimestamp / 1000).toString());
  };

  const useCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setInputDate(`${year}-${month}-${day}T${hours}:${minutes}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Clock className="h-8 w-8 text-green-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Unix Epoch Converter</h1>
        </div>
        <p className="text-gray-600">
          Convert Unix timestamps to human-readable dates and vice versa
        </p>
      </div>

      {/* Current Time Display */}
      <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Time</h3>
            <p className="text-gray-600">
              <span className="font-mono text-lg">{Math.floor(currentTimestamp / 1000)}</span> (Unix timestamp)
            </p>
            <p className="text-gray-600">
              <span className="font-mono">{formatDate(currentTimestamp)}</span> ({timezone})
            </p>
          </div>
          <RefreshCw className="h-6 w-6 text-green-500 animate-spin" />
        </div>
      </div>

      {/* Mode Selection */}
      <div className="card">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setMode('timestamp-to-date')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              mode === 'timestamp-to-date'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Timestamp → Date
          </button>
          <button
            onClick={() => setMode('date-to-timestamp')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              mode === 'date-to-timestamp'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Date → Timestamp
          </button>
        </div>

        {/* Timezone Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="input-field"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Paris">Paris (CET)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
            <option value="Asia/Shanghai">Shanghai (CST)</option>
          </select>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          {mode === 'timestamp-to-date' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unix Timestamp (seconds or milliseconds)
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputTimestamp}
                  onChange={(e) => setInputTimestamp(e.target.value)}
                  placeholder="e.g., 1640995200 or 1640995200000"
                  className="input-field flex-1"
                />
                <button
                  onClick={useCurrentTimestamp}
                  className="btn-secondary whitespace-nowrap"
                  title="Use current timestamp"
                >
                  Now
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date and Time
              </label>
              <div className="flex space-x-2">
                <input
                  type="datetime-local"
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="input-field flex-1"
                />
                <button
                  onClick={useCurrentDate}
                  className="btn-secondary whitespace-nowrap"
                  title="Use current date/time"
                >
                  Now
                </button>
              </div>
            </div>
          )}

          {/* Convert Button */}
          <button
            onClick={handleConvert}
            className="btn-primary w-full"
          >
            {mode === 'timestamp-to-date' ? 'Convert to Date' : 'Convert to Timestamp'}
          </button>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Output Section */}
          {outputDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {mode === 'timestamp-to-date' ? 'Converted Date' : 'Unix Timestamp'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={outputDate}
                  readOnly
                  className="input-field bg-gray-50 font-mono text-lg"
                />
                <button
                  onClick={() => copyToClipboard(outputDate)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700"
                  title="Copy output"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Clear Button */}
          {(inputTimestamp || inputDate || outputDate) && (
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About Unix Timestamps</h3>
        <div className="space-y-3 text-gray-600">
          <p>
            A Unix timestamp is the number of seconds (or milliseconds) that have elapsed since 
            January 1, 1970, 00:00:00 UTC (the Unix epoch).
          </p>
          <p>
            <strong>Common formats:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Seconds:</strong> 1640995200 (10 digits)</li>
            <li><strong>Milliseconds:</strong> 1640995200000 (13 digits)</li>
          </ul>
          <p>
            <strong>Use cases:</strong> Database storage, API responses, log timestamps, 
            and any system that needs to track time across different timezones.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EpochUtility;

