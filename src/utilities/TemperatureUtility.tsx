import React, { useState, useEffect } from 'react';
import { Thermometer, Copy, RefreshCw } from 'lucide-react';

const TemperatureUtility: React.FC = () => {
  const [fahrenheit, setFahrenheit] = useState('');
  const [celsius, setCelsius] = useState('');
  const [kelvin, setKelvin] = useState('');
  const [error, setError] = useState('');

  // Conversion functions
  const fahrenheitToCelsius = (f: number): number => (f - 32) * 5 / 9;
  const celsiusToFahrenheit = (c: number): number => (c * 9 / 5) + 32;
  const celsiusToKelvin = (c: number): number => c + 273.15;
  const kelvinToCelsius = (k: number): number => k - 273.15;

  const isValidNumber = (value: string): boolean => {
    return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
  };

  const handleFahrenheitChange = (value: string) => {
    setFahrenheit(value);
    setError('');
    
    if (value === '') {
      setCelsius('');
      setKelvin('');
      return;
    }

    if (!isValidNumber(value)) {
      setError('Please enter a valid number for Fahrenheit.');
      return;
    }

    const f = parseFloat(value);
    const c = fahrenheitToCelsius(f);
    const k = celsiusToKelvin(c);
    
    setCelsius(c.toFixed(2));
    setKelvin(k.toFixed(2));
  };

  const handleCelsiusChange = (value: string) => {
    setCelsius(value);
    setError('');
    
    if (value === '') {
      setFahrenheit('');
      setKelvin('');
      return;
    }

    if (!isValidNumber(value)) {
      setError('Please enter a valid number for Celsius.');
      return;
    }

    const c = parseFloat(value);
    const f = celsiusToFahrenheit(c);
    const k = celsiusToKelvin(c);
    
    setFahrenheit(f.toFixed(2));
    setKelvin(k.toFixed(2));
  };

  const handleKelvinChange = (value: string) => {
    setKelvin(value);
    setError('');
    
    if (value === '') {
      setFahrenheit('');
      setCelsius('');
      return;
    }

    if (!isValidNumber(value)) {
      setError('Please enter a valid number for Kelvin.');
      return;
    }

    const k = parseFloat(value);
    
    if (k < 0) {
      setError('Kelvin cannot be negative (absolute zero is 0K).');
      return;
    }

    const c = kelvinToCelsius(k);
    const f = celsiusToFahrenheit(c);
    
    setCelsius(c.toFixed(2));
    setFahrenheit(f.toFixed(2));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const clearAll = () => {
    setFahrenheit('');
    setCelsius('');
    setKelvin('');
    setError('');
  };

  const getTemperatureColor = (temp: number, unit: 'F' | 'C' | 'K'): string => {
    let celsiusTemp = temp;
    
    if (unit === 'F') {
      celsiusTemp = fahrenheitToCelsius(temp);
    } else if (unit === 'K') {
      celsiusTemp = kelvinToCelsius(temp);
    }

    if (celsiusTemp < 0) return 'text-blue-600';
    if (celsiusTemp < 10) return 'text-blue-500';
    if (celsiusTemp < 20) return 'text-green-500';
    if (celsiusTemp < 30) return 'text-yellow-500';
    if (celsiusTemp < 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getTemperatureDescription = (temp: number, unit: 'F' | 'C' | 'K'): string => {
    let celsiusTemp = temp;
    
    if (unit === 'F') {
      celsiusTemp = fahrenheitToCelsius(temp);
    } else if (unit === 'K') {
      celsiusTemp = kelvinToCelsius(temp);
    }

    if (celsiusTemp < -20) return 'Extremely cold';
    if (celsiusTemp < 0) return 'Freezing';
    if (celsiusTemp < 10) return 'Cold';
    if (celsiusTemp < 20) return 'Cool';
    if (celsiusTemp < 25) return 'Mild';
    if (celsiusTemp < 30) return 'Warm';
    if (celsiusTemp < 35) return 'Hot';
    if (celsiusTemp < 40) return 'Very hot';
    return 'Extremely hot';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Thermometer className="h-8 w-8 text-red-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Temperature Converter</h1>
        </div>
        <p className="text-gray-600">
          Convert between Fahrenheit, Celsius, and Kelvin temperature scales
        </p>
      </div>

      {/* Conversion Interface */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Fahrenheit */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fahrenheit (°F)</h3>
              <div className="relative">
                <input
                  type="number"
                  value={fahrenheit}
                  onChange={(e) => handleFahrenheitChange(e.target.value)}
                  placeholder="Enter temperature"
                  className="input-field text-center text-lg"
                />
                {fahrenheit && (
                  <button
                    onClick={() => copyToClipboard(fahrenheit)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                    title="Copy"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {fahrenheit && isValidNumber(fahrenheit) && (
                <p className={`text-sm font-medium ${getTemperatureColor(parseFloat(fahrenheit), 'F')}`}>
                  {getTemperatureDescription(parseFloat(fahrenheit), 'F')}
                </p>
              )}
            </div>
          </div>

          {/* Celsius */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Celsius (°C)</h3>
              <div className="relative">
                <input
                  type="number"
                  value={celsius}
                  onChange={(e) => handleCelsiusChange(e.target.value)}
                  placeholder="Enter temperature"
                  className="input-field text-center text-lg"
                />
                {celsius && (
                  <button
                    onClick={() => copyToClipboard(celsius)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                    title="Copy"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {celsius && isValidNumber(celsius) && (
                <p className={`text-sm font-medium ${getTemperatureColor(parseFloat(celsius), 'C')}`}>
                  {getTemperatureDescription(parseFloat(celsius), 'C')}
                </p>
              )}
            </div>
          </div>

          {/* Kelvin */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Kelvin (K)</h3>
              <div className="relative">
                <input
                  type="number"
                  value={kelvin}
                  onChange={(e) => handleKelvinChange(e.target.value)}
                  placeholder="Enter temperature"
                  className="input-field text-center text-lg"
                />
                {kelvin && (
                  <button
                    onClick={() => copyToClipboard(kelvin)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                    title="Copy"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {kelvin && isValidNumber(kelvin) && (
                <p className={`text-sm font-medium ${getTemperatureColor(parseFloat(kelvin), 'K')}`}>
                  {getTemperatureDescription(parseFloat(kelvin), 'K')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Clear Button */}
        {(fahrenheit || celsius || kelvin) && (
          <div className="mt-6 text-center">
            <button
              onClick={clearAll}
              className="btn-secondary"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Quick Reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Temperatures</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Absolute Zero</span>
              <span>-459.67°F / -273.15°C / 0K</span>
            </div>
            <div className="flex justify-between">
              <span>Freezing Point of Water</span>
              <span>32°F / 0°C / 273.15K</span>
            </div>
            <div className="flex justify-between">
              <span>Room Temperature</span>
              <span>68°F / 20°C / 293.15K</span>
            </div>
            <div className="flex justify-between">
              <span>Body Temperature</span>
              <span>98.6°F / 37°C / 310.15K</span>
            </div>
            <div className="flex justify-between">
              <span>Boiling Point of Water</span>
              <span>212°F / 100°C / 373.15K</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Formulas</h3>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Fahrenheit to Celsius:</strong>
              <div className="font-mono text-xs mt-1">°C = (°F - 32) × 5/9</div>
            </div>
            <div>
              <strong>Celsius to Fahrenheit:</strong>
              <div className="font-mono text-xs mt-1">°F = (°C × 9/5) + 32</div>
            </div>
            <div>
              <strong>Celsius to Kelvin:</strong>
              <div className="font-mono text-xs mt-1">K = °C + 273.15</div>
            </div>
            <div>
              <strong>Kelvin to Celsius:</strong>
              <div className="font-mono text-xs mt-1">°C = K - 273.15</div>
            </div>
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About Temperature Scales</h3>
        <div className="space-y-3 text-gray-600">
          <p>
            <strong>Fahrenheit (°F):</strong> Used primarily in the United States. Water freezes at 32°F and boils at 212°F.
          </p>
          <p>
            <strong>Celsius (°C):</strong> Used worldwide in most countries. Water freezes at 0°C and boils at 100°C.
          </p>
          <p>
            <strong>Kelvin (K):</strong> The base unit of temperature in the International System of Units (SI). 
            Absolute zero is 0K, and water freezes at 273.15K.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TemperatureUtility;

