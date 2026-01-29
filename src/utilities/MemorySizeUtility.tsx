import React, { useState } from 'react';
import { HardDrive, Copy } from 'lucide-react';

type MemoryUnit = 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB';
type SystemType = 'binary' | 'decimal';

const MemorySizeUtility: React.FC = () => {
  const [bytes, setBytes] = useState('');
  const [kilobytes, setKilobytes] = useState('');
  const [megabytes, setMegabytes] = useState('');
  const [gigabytes, setGigabytes] = useState('');
  const [terabytes, setTerabytes] = useState('');
  const [petabytes, setPetabytes] = useState('');
  const [systemType, setSystemType] = useState<SystemType>('binary');
  const [error, setError] = useState('');

  // Conversion factors
  const getFactor = (): number => {
    return systemType === 'binary' ? 1024 : 1000;
  };

  const convertFromBytes = (bytesValue: number): Record<MemoryUnit, number> => {
    const factor = getFactor();
    return {
      B: bytesValue,
      KB: bytesValue / factor,
      MB: bytesValue / (factor ** 2),
      GB: bytesValue / (factor ** 3),
      TB: bytesValue / (factor ** 4),
      PB: bytesValue / (factor ** 5),
    };
  };

  const convertToBytes = (value: number, unit: MemoryUnit): number => {
    const factor = getFactor();
    const multipliers: Record<MemoryUnit, number> = {
      B: 1,
      KB: factor,
      MB: factor ** 2,
      GB: factor ** 3,
      TB: factor ** 4,
      PB: factor ** 5,
    };
    return value * multipliers[unit];
  };

  const formatNumber = (num: number): string => {
    if (num === 0) return '0';
    if (num < 0.000001) return num.toExponential(3);
    if (num < 1) return num.toFixed(6).replace(/\.?0+$/, '');
    if (num < 1000) return num.toFixed(2).replace(/\.?0+$/, '');
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  const updateAllUnits = (bytesValue: number, preserveInputUnit?: MemoryUnit, rawInput?: string) => {
    const converted = convertFromBytes(bytesValue);
    
    // Preserve raw input for the unit being edited, format others
    if (preserveInputUnit === 'B' && rawInput !== undefined) {
      setBytes(rawInput);
    } else {
      setBytes(formatNumber(converted.B));
    }
    
    if (preserveInputUnit === 'KB' && rawInput !== undefined) {
      setKilobytes(rawInput);
    } else {
      setKilobytes(formatNumber(converted.KB));
    }
    
    if (preserveInputUnit === 'MB' && rawInput !== undefined) {
      setMegabytes(rawInput);
    } else {
      setMegabytes(formatNumber(converted.MB));
    }
    
    if (preserveInputUnit === 'GB' && rawInput !== undefined) {
      setGigabytes(rawInput);
    } else {
      setGigabytes(formatNumber(converted.GB));
    }
    
    if (preserveInputUnit === 'TB' && rawInput !== undefined) {
      setTerabytes(rawInput);
    } else {
      setTerabytes(formatNumber(converted.TB));
    }
    
    if (preserveInputUnit === 'PB' && rawInput !== undefined) {
      setPetabytes(rawInput);
    } else {
      setPetabytes(formatNumber(converted.PB));
    }
  };

  const handleUnitChange = (value: string, unit: MemoryUnit) => {
    setError('');
    
    // Clear all fields if input is empty
    if (value === '') {
      setBytes('');
      setKilobytes('');
      setMegabytes('');
      setGigabytes('');
      setTerabytes('');
      setPetabytes('');
      return;
    }

    // Allow typing even if not a complete number yet (e.g., "1000." or "1e")
    // Only validate when we have a complete number
    const trimmedValue = value.trim();
    if (trimmedValue === '' || trimmedValue === '.' || trimmedValue === '-') {
      return; // Allow partial input
    }

    // Check if it's a valid number format (including scientific notation)
    const numberRegex = /^-?\d*\.?\d*([eE][+-]?\d*)?$/;
    if (!numberRegex.test(trimmedValue)) {
      setError(`Please enter a valid number for ${unit}.`);
      return;
    }

    const numValue = parseFloat(trimmedValue);
    
    // If we can't parse it yet, it might be incomplete input (like "1e" or "1000.")
    if (isNaN(numValue)) {
      // Clear other fields but keep the current input
      if (unit !== 'B') setBytes('');
      if (unit !== 'KB') setKilobytes('');
      if (unit !== 'MB') setMegabytes('');
      if (unit !== 'GB') setGigabytes('');
      if (unit !== 'TB') setTerabytes('');
      if (unit !== 'PB') setPetabytes('');
      return;
    }

    if (numValue < 0) {
      setError('Memory size cannot be negative.');
      return;
    }

    const bytesValue = convertToBytes(numValue, unit);
    updateAllUnits(bytesValue, unit, value);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const clearAll = () => {
    setBytes('');
    setKilobytes('');
    setMegabytes('');
    setGigabytes('');
    setTerabytes('');
    setPetabytes('');
    setError('');
  };

  const getSystemDescription = (): string => {
    return systemType === 'binary' 
      ? 'Binary system: 1 KB = 1024 B (used by operating systems)'
      : 'Decimal system: 1 KB = 1000 B (used by storage manufacturers)';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <HardDrive className="h-8 w-8 text-amber-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Memory Size Converter</h1>
        </div>
        <p className="text-gray-600">
          Convert between Bytes, KB, MB, GB, TB, and PB with binary or decimal systems
        </p>
      </div>

      {/* System Type Selection */}
      <div className="card bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Conversion System</h3>
            <p className="text-sm text-gray-600">{getSystemDescription()}</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                const newSystemType = 'binary';
                setSystemType(newSystemType);
                // Recalculate if there's a value in any field
                if (bytes && !isNaN(parseFloat(bytes))) {
                  const bytesValue = convertToBytes(parseFloat(bytes), 'B');
                  updateAllUnits(bytesValue);
                } else if (kilobytes && !isNaN(parseFloat(kilobytes))) {
                  const bytesValue = convertToBytes(parseFloat(kilobytes), 'KB');
                  updateAllUnits(bytesValue);
                } else if (megabytes && !isNaN(parseFloat(megabytes))) {
                  const bytesValue = convertToBytes(parseFloat(megabytes), 'MB');
                  updateAllUnits(bytesValue);
                } else if (gigabytes && !isNaN(parseFloat(gigabytes))) {
                  const bytesValue = convertToBytes(parseFloat(gigabytes), 'GB');
                  updateAllUnits(bytesValue);
                } else if (terabytes && !isNaN(parseFloat(terabytes))) {
                  const bytesValue = convertToBytes(parseFloat(terabytes), 'TB');
                  updateAllUnits(bytesValue);
                } else if (petabytes && !isNaN(parseFloat(petabytes))) {
                  const bytesValue = convertToBytes(parseFloat(petabytes), 'PB');
                  updateAllUnits(bytesValue);
                }
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                systemType === 'binary'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Binary (1024)
            </button>
            <button
              onClick={() => {
                const newSystemType = 'decimal';
                setSystemType(newSystemType);
                // Recalculate if there's a value in any field
                if (bytes && !isNaN(parseFloat(bytes))) {
                  const bytesValue = convertToBytes(parseFloat(bytes), 'B');
                  updateAllUnits(bytesValue);
                } else if (kilobytes && !isNaN(parseFloat(kilobytes))) {
                  const bytesValue = convertToBytes(parseFloat(kilobytes), 'KB');
                  updateAllUnits(bytesValue);
                } else if (megabytes && !isNaN(parseFloat(megabytes))) {
                  const bytesValue = convertToBytes(parseFloat(megabytes), 'MB');
                  updateAllUnits(bytesValue);
                } else if (gigabytes && !isNaN(parseFloat(gigabytes))) {
                  const bytesValue = convertToBytes(parseFloat(gigabytes), 'GB');
                  updateAllUnits(bytesValue);
                } else if (terabytes && !isNaN(parseFloat(terabytes))) {
                  const bytesValue = convertToBytes(parseFloat(terabytes), 'TB');
                  updateAllUnits(bytesValue);
                } else if (petabytes && !isNaN(parseFloat(petabytes))) {
                  const bytesValue = convertToBytes(parseFloat(petabytes), 'PB');
                  updateAllUnits(bytesValue);
                }
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                systemType === 'decimal'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Decimal (1000)
            </button>
          </div>
        </div>
      </div>

      {/* Conversion Interface */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Bytes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Bytes (B)</label>
            <div className="relative">
              <input
                type="text"
                value={bytes}
                onChange={(e) => {
                  handleUnitChange(e.target.value, 'B');
                }}
                placeholder="Enter size"
                className="input-field text-center text-lg"
              />
              {bytes && (
                <button
                  onClick={() => copyToClipboard(bytes)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                  title="Copy"
                >
                  <Copy className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Kilobytes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Kilobytes (KB)</label>
            <div className="relative">
              <input
                type="text"
                value={kilobytes}
                onChange={(e) => {
                  handleUnitChange(e.target.value, 'KB');
                }}
                placeholder="Enter size"
                className="input-field text-center text-lg"
              />
              {kilobytes && (
                <button
                  onClick={() => copyToClipboard(kilobytes)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                  title="Copy"
                >
                  <Copy className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Megabytes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Megabytes (MB)</label>
            <div className="relative">
              <input
                type="text"
                value={megabytes}
                onChange={(e) => {
                  handleUnitChange(e.target.value, 'MB');
                }}
                placeholder="Enter size"
                className="input-field text-center text-lg"
              />
              {megabytes && (
                <button
                  onClick={() => copyToClipboard(megabytes)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                  title="Copy"
                >
                  <Copy className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Gigabytes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Gigabytes (GB)</label>
            <div className="relative">
              <input
                type="text"
                value={gigabytes}
                onChange={(e) => {
                  handleUnitChange(e.target.value, 'GB');
                }}
                placeholder="Enter size"
                className="input-field text-center text-lg"
              />
              {gigabytes && (
                <button
                  onClick={() => copyToClipboard(gigabytes)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                  title="Copy"
                >
                  <Copy className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Terabytes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Terabytes (TB)</label>
            <div className="relative">
              <input
                type="text"
                value={terabytes}
                onChange={(e) => {
                  handleUnitChange(e.target.value, 'TB');
                }}
                placeholder="Enter size"
                className="input-field text-center text-lg"
              />
              {terabytes && (
                <button
                  onClick={() => copyToClipboard(terabytes)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                  title="Copy"
                >
                  <Copy className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Petabytes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Petabytes (PB)</label>
            <div className="relative">
              <input
                type="text"
                value={petabytes}
                onChange={(e) => {
                  handleUnitChange(e.target.value, 'PB');
                }}
                placeholder="Enter size"
                className="input-field text-center text-lg"
              />
              {petabytes && (
                <button
                  onClick={() => copyToClipboard(petabytes)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                  title="Copy"
                >
                  <Copy className="h-4 w-4" />
                </button>
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
        {(bytes || kilobytes || megabytes || gigabytes || terabytes || petabytes) && (
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Memory Sizes</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-700">1 KB ({systemType === 'binary' ? '1024' : '1000'} B)</span>
              <span className="font-mono text-gray-600">Small text file</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">1 MB ({systemType === 'binary' ? '1024' : '1000'} KB)</span>
              <span className="font-mono text-gray-600">Medium image</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">1 GB ({systemType === 'binary' ? '1024' : '1000'} MB)</span>
              <span className="font-mono text-gray-600">HD movie (1 hour)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">1 TB ({systemType === 'binary' ? '1024' : '1000'} GB)</span>
              <span className="font-mono text-gray-600">~250,000 photos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">1 PB ({systemType === 'binary' ? '1024' : '1000'} TB)</span>
              <span className="font-mono text-gray-600">Large data center</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Factors</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <strong className="text-gray-900">Binary System (1024):</strong>
              <div className="font-mono text-xs mt-1 text-gray-600">
                1 KB = 1024 B<br />
                1 MB = 1024 KB = 1,048,576 B<br />
                1 GB = 1024 MB = 1,073,741,824 B<br />
                1 TB = 1024 GB = 1,099,511,627,776 B
              </div>
            </div>
            <div>
              <strong className="text-gray-900">Decimal System (1000):</strong>
              <div className="font-mono text-xs mt-1 text-gray-600">
                1 KB = 1000 B<br />
                1 MB = 1000 KB = 1,000,000 B<br />
                1 GB = 1000 MB = 1,000,000,000 B<br />
                1 TB = 1000 GB = 1,000,000,000,000 B
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About Memory Size Conversion</h3>
        <div className="space-y-3 text-gray-600">
          <p>
            <strong>Binary System (1024-based):</strong> Used by operating systems and software. 
            This is the traditional system where each unit is 1024 times the previous one. 
            For example, 1 KB = 1024 bytes, 1 MB = 1024 KB.
          </p>
          <p>
            <strong>Decimal System (1000-based):</strong> Used by storage device manufacturers. 
            This system uses powers of 1000, making it easier to calculate. 
            For example, 1 KB = 1000 bytes, 1 MB = 1000 KB.
          </p>
          <p>
            <strong>Why the difference?</strong> Storage manufacturers use decimal to show larger 
            numbers (a 1 TB drive has 1,000,000,000,000 bytes), while operating systems use binary 
            (showing ~931 GB for the same drive). This is why your "1 TB" hard drive shows as 
            ~931 GB in your operating system!
          </p>
        </div>
      </div>
    </div>
  );
};

export default MemorySizeUtility;
